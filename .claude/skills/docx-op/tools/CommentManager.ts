#!/usr/bin/env bun

/**
 * PAI DOCX Skill - CommentManager.ts
 * Manage comments in DOCX documents
 *
 * Provides:
 * - Read existing comments
 * - Add new comments
 * - Reply to comments
 * - Delete comments
 */

import { DocumentEditor } from "./DocumentEditor";
import { readFile, writeFile, mkdir, rm } from "fs/promises";
import { join, dirname } from "path";
import { tmpdir } from "os";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { execSync } from "child_process";

// ============================================================================
// TYPES
// ============================================================================

export interface Comment {
  id: string;
  author: string;
  date: string;
  initials?: string;
  text: string;
  anchorText?: string;
  replies: CommentReply[];
  paragraphIndex?: number;
}

export interface CommentReply {
  id: string;
  parentId: string;
  author: string;
  date: string;
  text: string;
}

export interface AddCommentOptions {
  /** Paragraph index to attach comment to */
  paragraphIndex: number;
  /** Character offset within paragraph (optional) */
  startOffset?: number;
  /** End character offset (optional) */
  endOffset?: number;
  /** Comment text */
  text: string;
  /** Author initials (auto-generated if not provided) */
  initials?: string;
}

export interface CommentListResult {
  comments: Comment[];
  total: number;
}

// ============================================================================
// XML CONSTANTS
// ============================================================================

const XML_PARSER_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  trimValues: false,
  parseTagValue: false,
  parseAttributeValue: false,
  // Security: Disable entity processing to prevent XXE attacks
  processEntities: false,
};

const XML_BUILDER_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  format: true,
  indentBy: "  ",
  suppressEmptyNode: false,
};

// ============================================================================
// COMMENT MANAGER
// ============================================================================

/**
 * Manages comments in a document
 */
export class CommentManager {
  private editor: DocumentEditor;
  private nextCommentId: number = 0;
  private commentsPath: string;
  private commentsXml: string | null = null;

  constructor(editor: DocumentEditor, unpackedDir: string) {
    this.editor = editor;
    this.commentsPath = join(unpackedDir, "word", "comments.xml");
  }

  /**
   * Initialize and find the next available comment ID
   */
  async initialize(): Promise<void> {
    try {
      this.commentsXml = await readFile(this.commentsPath, "utf-8");
      const parser = new XMLParser(XML_PARSER_OPTIONS);
      const parsed = parser.parse(this.commentsXml);

      // Find highest comment ID
      const comments = parsed["w:comments"]?.["w:comment"];
      if (comments) {
        const commentArray = Array.isArray(comments) ? comments : [comments];
        for (const comment of commentArray) {
          const id = parseInt(comment["@_w:id"] || "0");
          if (id >= this.nextCommentId) {
            this.nextCommentId = id + 1;
          }
        }
      }
    } catch {
      // No comments.xml exists yet, will create on first comment
      this.commentsXml = null;
    }
  }

  /**
   * Get next comment ID
   */
  private getNextCommentId(): string {
    return String(this.nextCommentId++);
  }

  /**
   * Generate author initials
   */
  private generateInitials(author: string): string {
    return author
      .split(/\s+/)
      .map((word) => word[0]?.toUpperCase() || "")
      .join("")
      .substring(0, 3);
  }

  /**
   * List all comments in the document
   */
  async listComments(): Promise<CommentListResult> {
    const comments: Comment[] = [];

    if (!this.commentsXml) {
      return { comments, total: 0 };
    }

    const parser = new XMLParser(XML_PARSER_OPTIONS);
    const parsed = parser.parse(this.commentsXml);

    const commentElements = parsed["w:comments"]?.["w:comment"];
    if (!commentElements) {
      return { comments, total: 0 };
    }

    const commentArray = Array.isArray(commentElements)
      ? commentElements
      : [commentElements];

    // Build a map of parent IDs for reply detection
    const replyMap = new Map<string, CommentReply[]>();

    for (const commentEl of commentArray) {
      const id = commentEl["@_w:id"] || "";
      const author = commentEl["@_w:author"] || "Unknown";
      const date = commentEl["@_w:date"] || "";
      const initials = commentEl["@_w:initials"] || "";

      // Extract text from comment
      const text = this.extractCommentText(commentEl);

      // Check if this is a reply (has done attribute in extended comments)
      // For simplicity, we'll treat all as top-level comments
      comments.push({
        id,
        author,
        date,
        initials,
        text,
        replies: [],
      });
    }

    // Try to find comment references in document to get paragraph indices
    await this.attachParagraphIndices(comments);

    return {
      comments,
      total: comments.length,
    };
  }

  /**
   * Extract text from a comment element
   */
  private extractCommentText(commentEl: any): string {
    const paragraphs = commentEl["w:p"];
    if (!paragraphs) return "";

    const pArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
    const texts: string[] = [];

    for (const p of pArray) {
      const runs = p["w:r"];
      if (!runs) continue;

      const rArray = Array.isArray(runs) ? runs : [runs];
      for (const r of rArray) {
        const tElements = r["w:t"];
        if (!tElements) continue;

        const tArray = Array.isArray(tElements) ? tElements : [tElements];
        for (const t of tArray) {
          if (typeof t === "string") {
            texts.push(t);
          } else if (t["#text"]) {
            texts.push(t["#text"]);
          }
        }
      }
    }

    return texts.join("");
  }

  /**
   * Attach paragraph indices and anchor text to comments by parsing document.xml
   */
  private async attachParagraphIndices(comments: Comment[]): Promise<void> {
    const commentIdMap = new Map<string, Comment>();
    for (const comment of comments) {
      commentIdMap.set(comment.id, comment);
    }

    // Read document.xml directly for anchor text extraction
    const docPath = join(dirname(this.commentsPath), "document.xml");
    try {
      const docXml = await readFile(docPath, "utf-8");
      const anchorTexts = this.extractAnchorTexts(docXml);
      for (const [id, text] of anchorTexts) {
        if (commentIdMap.has(id)) {
          commentIdMap.get(id)!.anchorText = text;
        }
      }
    } catch {
      // If we can't read document.xml, skip anchor text
    }

    // Also try to get paragraph indices via editor
    try {
      const docEditor = await this.editor.getDocumentEditor();
      const rangeStarts = docEditor.findElements({ tag: "w:commentRangeStart" });
      let paragraphIndex = 0;

      for (const rangeStart of rangeStarts) {
        const attrs = rangeStart.element[":@"] || rangeStart.element;
        const commentId = attrs["@_w:id"] || rangeStart.element["@_w:id"];
        if (commentId && commentIdMap.has(commentId)) {
          commentIdMap.get(commentId)!.paragraphIndex = paragraphIndex;
          paragraphIndex++;
        }
      }
    } catch {
      // Skip paragraph indices if editor fails
    }
  }

  /**
   * Extract text anchored by each comment range from raw document XML.
   * Walks through the XML collecting text between commentRangeStart and commentRangeEnd.
   */
  private extractAnchorTexts(docXml: string): Map<string, string> {
    const result = new Map<string, string>();
    const activeRanges = new Set<string>();
    const anchorBuffers = new Map<string, string[]>();

    // Use regex-based state machine to walk through the XML in document order.
    // Match: commentRangeStart, commentRangeEnd, and w:t text elements
    const tokenPattern = /<w:commentRangeStart[^>]*w:id="(\d+)"[^/]*\/>|<w:commentRangeEnd[^>]*w:id="(\d+)"[^/]*\/>|<w:t[^>]*>([^<]*)<\/w:t>/g;

    let match: RegExpExecArray | null;
    while ((match = tokenPattern.exec(docXml)) !== null) {
      if (match[1] !== undefined) {
        // commentRangeStart
        const id = match[1];
        activeRanges.add(id);
        if (!anchorBuffers.has(id)) {
          anchorBuffers.set(id, []);
        }
      } else if (match[2] !== undefined) {
        // commentRangeEnd
        const id = match[2];
        activeRanges.delete(id);
        const buffer = anchorBuffers.get(id);
        if (buffer) {
          result.set(id, buffer.join("").trim());
        }
      } else if (match[3] !== undefined && activeRanges.size > 0) {
        // w:t text content — add to all active comment ranges
        const text = match[3]
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'");
        for (const id of activeRanges) {
          anchorBuffers.get(id)!.push(text);
        }
      }
    }

    return result;
  }

  /**
   * Add a new comment to the document
   */
  async addComment(options: AddCommentOptions): Promise<string> {
    const { paragraphIndex, startOffset = 0, text, initials } = options;

    const commentId = this.getNextCommentId();
    const timestamp = this.editor.getTimestamp();
    const authorInitials =
      initials || this.generateInitials(this.editor.authorName);

    // Create or update comments.xml
    await this.ensureCommentsXml();

    // Add comment to comments.xml
    const commentXml = `  <w:comment w:id="${commentId}" w:author="${this.editor.authorName}" w:date="${timestamp}" w:initials="${authorInitials}">
    <w:p>
      <w:pPr>
        <w:pStyle w:val="CommentText"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rStyle w:val="CommentReference"/>
        </w:rPr>
        <w:annotationRef/>
      </w:r>
      <w:r>
        <w:t>${this.escapeXml(text)}</w:t>
      </w:r>
    </w:p>
  </w:comment>`;

    this.commentsXml = this.commentsXml!.replace(
      "</w:comments>",
      `${commentXml}\n</w:comments>`,
    );

    await writeFile(this.commentsPath, this.commentsXml, "utf-8");

    // Add comment reference in document
    await this.addCommentReferenceToDocument(commentId, paragraphIndex);

    return commentId;
  }

  /**
   * Ensure comments.xml exists
   */
  private async ensureCommentsXml(): Promise<void> {
    if (this.commentsXml) return;

    // Create comments.xml
    this.commentsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
            xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml">
</w:comments>`;

    await mkdir(dirname(this.commentsPath), { recursive: true });
    await writeFile(this.commentsPath, this.commentsXml, "utf-8");

    // Add relationship
    await this.addCommentsRelationship();

    // Update content types
    await this.updateContentTypes();
  }

  /**
   * Add relationship for comments.xml
   */
  private async addCommentsRelationship(): Promise<void> {
    const relsPath = join(
      dirname(this.commentsPath),
      "_rels",
      "document.xml.rels",
    );

    let relsXml: string;
    let nextId = 1;

    try {
      relsXml = await readFile(relsPath, "utf-8");
      // Find highest rId
      const matches = relsXml.matchAll(/Id="rId(\d+)"/g);
      for (const match of matches) {
        const id = parseInt(match[1]);
        if (id >= nextId) {
          nextId = id + 1;
        }
      }
    } catch {
      await mkdir(dirname(relsPath), { recursive: true });
      relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;
    }

    // Check if comments relationship already exists
    if (relsXml.includes("relationships/comments")) {
      return;
    }

    const relXml = `  <Relationship Id="rId${nextId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments" Target="comments.xml"/>`;
    relsXml = relsXml.replace(
      "</Relationships>",
      `${relXml}\n</Relationships>`,
    );
    await writeFile(relsPath, relsXml, "utf-8");
  }

  /**
   * Update [Content_Types].xml to include comments
   */
  private async updateContentTypes(): Promise<void> {
    const contentTypesPath = join(
      dirname(dirname(this.commentsPath)),
      "[Content_Types].xml",
    );

    try {
      let contentTypesXml = await readFile(contentTypesPath, "utf-8");

      // Check if comments override already exists
      if (contentTypesXml.includes("comments.xml")) {
        return;
      }

      const overrideXml = `  <Override PartName="/word/comments.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml"/>`;
      contentTypesXml = contentTypesXml.replace(
        "</Types>",
        `${overrideXml}\n</Types>`,
      );
      await writeFile(contentTypesPath, contentTypesXml, "utf-8");
    } catch (error) {
      console.warn("Could not update content types:", error);
    }
  }

  /**
   * Add comment reference markers to document
   */
  private async addCommentReferenceToDocument(
    commentId: string,
    paragraphIndex: number,
  ): Promise<void> {
    const docEditor = await this.editor.getDocumentEditor();

    // Find paragraph
    const paragraphs = docEditor.findElements({ tag: "w:p" });
    if (paragraphIndex >= paragraphs.length) {
      throw new Error(`Paragraph index ${paragraphIndex} out of range`);
    }

    const para = paragraphs[paragraphIndex];

    // Add commentRangeStart, commentRangeEnd, and commentReference
    // For simplicity, we'll add them at the end of the paragraph

    const rangeStartXml = `<w:commentRangeStart w:id="${commentId}"/>`;
    const rangeEndXml = `<w:commentRangeEnd w:id="${commentId}"/>`;
    const referenceXml = `<w:r>
  <w:rPr>
    <w:rStyle w:val="CommentReference"/>
  </w:rPr>
  <w:commentReference w:id="${commentId}"/>
</w:r>`;

    // Parse and add elements
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      preserveOrder: true,
      // Security: Disable entity processing to prevent XXE attacks
      processEntities: false,
    });

    // Add range start at beginning
    const startParsed = parser.parse(rangeStartXml);
    if (!para.element["w:commentRangeStart"]) {
      para.element["w:commentRangeStart"] = [];
    }
    if (!Array.isArray(para.element["w:commentRangeStart"])) {
      para.element["w:commentRangeStart"] = [
        para.element["w:commentRangeStart"],
      ];
    }
    para.element["w:commentRangeStart"].push(
      startParsed["w:commentRangeStart"],
    );

    // Add range end and reference at end
    const endParsed = parser.parse(rangeEndXml);
    if (!para.element["w:commentRangeEnd"]) {
      para.element["w:commentRangeEnd"] = [];
    }
    if (!Array.isArray(para.element["w:commentRangeEnd"])) {
      para.element["w:commentRangeEnd"] = [para.element["w:commentRangeEnd"]];
    }
    para.element["w:commentRangeEnd"].push(endParsed["w:commentRangeEnd"]);

    const refParsed = parser.parse(referenceXml);
    if (!para.element["w:r"]) {
      para.element["w:r"] = [];
    }
    if (!Array.isArray(para.element["w:r"])) {
      para.element["w:r"] = [para.element["w:r"]];
    }
    para.element["w:r"].push(refParsed["w:r"]);

    docEditor.markModified();
  }

  /**
   * Reply to an existing comment
   */
  async replyToComment(parentCommentId: string, text: string): Promise<string> {
    const replyId = this.getNextCommentId();
    const timestamp = this.editor.getTimestamp();
    const authorInitials = this.generateInitials(this.editor.authorName);

    if (!this.commentsXml) {
      throw new Error("No comments exist to reply to");
    }

    // Add reply as a new comment (Word stores replies as separate comments linked by done attribute)
    const replyXml = `  <w:comment w:id="${replyId}" w:author="${this.editor.authorName}" w:date="${timestamp}" w:initials="${authorInitials}">
    <w:p>
      <w:pPr>
        <w:pStyle w:val="CommentText"/>
      </w:pPr>
      <w:r>
        <w:t>${this.escapeXml(text)}</w:t>
      </w:r>
    </w:p>
  </w:comment>`;

    this.commentsXml = this.commentsXml.replace(
      "</w:comments>",
      `${replyXml}\n</w:comments>`,
    );

    await writeFile(this.commentsPath, this.commentsXml, "utf-8");

    // Note: Full reply threading requires commentsExtended.xml which is more complex
    // This simplified implementation adds replies as separate comments

    return replyId;
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<boolean> {
    if (!this.commentsXml) {
      return false;
    }

    const parser = new XMLParser(XML_PARSER_OPTIONS);
    const parsed = parser.parse(this.commentsXml);

    const comments = parsed["w:comments"]?.["w:comment"];
    if (!comments) {
      return false;
    }

    const commentArray = Array.isArray(comments) ? comments : [comments];
    const newComments = commentArray.filter((c) => c["@_w:id"] !== commentId);

    if (newComments.length === commentArray.length) {
      return false; // Comment not found
    }

    parsed["w:comments"]["w:comment"] = newComments;

    const builder = new XMLBuilder(XML_BUILDER_OPTIONS);
    this.commentsXml = builder.build(parsed);
    await writeFile(this.commentsPath, this.commentsXml, "utf-8");

    // Remove references from document
    await this.removeCommentReferencesFromDocument(commentId);

    return true;
  }

  /**
   * Remove comment references from document
   */
  private async removeCommentReferencesFromDocument(
    commentId: string,
  ): Promise<void> {
    const docEditor = await this.editor.getDocumentEditor();

    // Find and remove commentRangeStart, commentRangeEnd, commentReference
    const rangeStarts = docEditor.findElements({
      tag: "w:commentRangeStart",
      attributes: { "w:id": commentId },
    });
    const rangeEnds = docEditor.findElements({
      tag: "w:commentRangeEnd",
      attributes: { "w:id": commentId },
    });

    for (const el of rangeStarts) {
      docEditor.removeElement(el);
    }
    for (const el of rangeEnds) {
      docEditor.removeElement(el);
    }

    // Remove runs containing commentReference with this ID
    // This is more complex as we need to find w:commentReference inside w:r
    // For now, mark as modified and let user handle cleanup
    docEditor.markModified();
  }

  /**
   * Get a specific comment by ID
   */
  async getComment(commentId: string): Promise<Comment | null> {
    const result = await this.listComments();
    return result.comments.find((c) => c.id === commentId) || null;
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create a comment manager for a document editor
 */
export async function createCommentManager(
  editor: DocumentEditor,
  unpackedDir: string,
): Promise<CommentManager> {
  const manager = new CommentManager(editor, unpackedDir);
  await manager.initialize();
  return manager;
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1 || args.includes("--help") || args.includes("-h")) {
    console.log(`
CommentManager - Manage comments in DOCX documents

Usage:
  bun run CommentManager.ts list <file.docx | unpacked-dir>
  bun run CommentManager.ts add <unpacked-dir> <paragraph-index> <text>
  bun run CommentManager.ts reply <unpacked-dir> <parent-id> <text>
  bun run CommentManager.ts delete <unpacked-dir> <comment-id>

Commands:
  list     List all comments with anchor text (accepts .docx directly)
  add      Add a new comment to a paragraph
  reply    Reply to an existing comment
  delete   Delete a comment

Examples:
  bun run CommentManager.ts list document.docx
  bun run CommentManager.ts list ./unpacked-doc
  bun run CommentManager.ts add ./unpacked-doc 0 "This needs clarification"
  bun run CommentManager.ts reply ./unpacked-doc 1 "I agree"
  bun run CommentManager.ts delete ./unpacked-doc 1
`);
    process.exit(0);
  }

  const command = args[0];
  let unpackedDir = args[1];
  let tempDir: string | null = null;

  if (!unpackedDir) {
    console.error("Error: Missing path (docx file or unpacked directory)");
    process.exit(1);
  }

  // If a .docx file is provided, unpack to temp directory
  if (unpackedDir.endsWith(".docx")) {
    tempDir = join(tmpdir(), `comment-mgr-${Date.now()}`);
    try {
      execSync(`unzip -o "${unpackedDir}" -d "${tempDir}"`, { stdio: "pipe" });
    } catch (e) {
      console.error(`Error: Could not unpack ${unpackedDir}`);
      process.exit(1);
    }
    unpackedDir = tempDir;
  }

  try {
    const editor = await DocumentEditor.openUnpacked(unpackedDir);
    const manager = await createCommentManager(editor, unpackedDir);

    switch (command) {
      case "list": {
        const result = await manager.listComments();
        console.log(`Total comments: ${result.total}`);
        for (const comment of result.comments) {
          console.log(
            `\n[${comment.id}] by ${comment.author} (${comment.date}):`,
          );
          console.log(`  Comment: "${comment.text}"`);
          if (comment.anchorText) {
            console.log(`  Anchored to: "${comment.anchorText}"`);
          }
          if (comment.paragraphIndex !== undefined) {
            console.log(`  Paragraph: ${comment.paragraphIndex}`);
          }
          for (const reply of comment.replies) {
            console.log(`  └─ [${reply.id}] ${reply.author}: "${reply.text}"`);
          }
        }
        break;
      }
      case "add": {
        const paragraphIndex = parseInt(args[2]);
        const text = args.slice(3).join(" ");
        if (isNaN(paragraphIndex) || !text) {
          console.error("Error: Missing paragraph index or text");
          process.exit(1);
        }
        const commentId = await manager.addComment({ paragraphIndex, text });
        await editor.saveAll();
        console.log(
          `Added comment ${commentId} to paragraph ${paragraphIndex}`,
        );
        break;
      }
      case "reply": {
        const parentId = args[2];
        const text = args.slice(3).join(" ");
        if (!parentId || !text) {
          console.error("Error: Missing parent ID or text");
          process.exit(1);
        }
        const replyId = await manager.replyToComment(parentId, text);
        console.log(`Added reply ${replyId} to comment ${parentId}`);
        break;
      }
      case "delete": {
        const commentId = args[2];
        if (!commentId) {
          console.error("Error: Missing comment ID");
          process.exit(1);
        }
        const success = await manager.deleteComment(commentId);
        await editor.saveAll();
        if (success) {
          console.log(`Deleted comment ${commentId}`);
        } else {
          console.log(`Comment ${commentId} not found`);
        }
        break;
      }
      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    // Clean up temp directory if we created one
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}

// Run CLI if executed directly
if (import.meta.main) {
  main();
}
