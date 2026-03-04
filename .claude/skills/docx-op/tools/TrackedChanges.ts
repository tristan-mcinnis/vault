#!/usr/bin/env bun

/**
 * PAI DOCX Skill - TrackedChanges.ts
 * Manage tracked changes (redlining) in DOCX documents
 *
 * Provides:
 * - Insert text with tracking
 * - Delete text with tracking
 * - Accept/reject changes
 * - List all tracked changes
 */

import { DocumentEditor, XmlFileEditor } from "./DocumentEditor";
import { XMLParser, XMLBuilder } from "fast-xml-parser";

// ============================================================================
// TYPES
// ============================================================================

export interface TrackedChange {
  id: string;
  type: "insertion" | "deletion";
  author: string;
  date: string;
  text: string;
  paragraphIndex: number;
  runIndex: number;
}

export interface InsertionOptions {
  /** Position to insert at */
  position: TextPosition;
  /** Text to insert */
  text: string;
  /** Formatting to apply */
  formatting?: TextFormatting;
}

export interface DeletionOptions {
  /** Start position */
  start: TextPosition;
  /** End position */
  end: TextPosition;
}

export interface TextPosition {
  /** Paragraph index (0-based) */
  paragraphIndex: number;
  /** Character offset within paragraph */
  characterOffset: number;
}

export interface TextFormatting {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

export interface TrackedChangesResult {
  insertions: TrackedChange[];
  deletions: TrackedChange[];
  total: number;
}

// ============================================================================
// TRACKED CHANGES MANAGER
// ============================================================================

/**
 * Manages tracked changes in a document
 */
export class TrackedChangesManager {
  private editor: DocumentEditor;
  private nextChangeId: number = 0;

  constructor(editor: DocumentEditor) {
    this.editor = editor;
  }

  /**
   * Initialize and find the next available change ID
   */
  async initialize(): Promise<void> {
    const docEditor = await this.editor.getDocumentEditor();
    const doc = docEditor.document;

    // Find existing change IDs
    this.findMaxChangeId(doc);
  }

  private findMaxChangeId(node: any): void {
    if (!node || typeof node !== "object") return;

    if (Array.isArray(node)) {
      for (const item of node) {
        this.findMaxChangeId(item);
      }
      return;
    }

    for (const key of Object.keys(node)) {
      // Skip the attributes object when recursing
      if (key === ":@") continue;

      if (key === "w:ins" || key === "w:del") {
        const elements = Array.isArray(node[key]) ? node[key] : [node[key]];
        for (const el of elements) {
          // Handle both preserveOrder format (attrs in node[":@"]) and flat format
          const attrs = node[":@"] || el[":@"] || el;
          const id = attrs["@_w:id"] || el["@_w:id"];
          if (id) {
            const numId = parseInt(id);
            if (numId >= this.nextChangeId) {
              this.nextChangeId = numId + 1;
            }
          }
        }
      }
      this.findMaxChangeId(node[key]);
    }
  }

  /**
   * Get next change ID
   */
  private getNextChangeId(): string {
    return String(this.nextChangeId++);
  }

  /**
   * List all tracked changes in the document
   */
  async listChanges(): Promise<TrackedChangesResult> {
    const docEditor = await this.editor.getDocumentEditor();
    const doc = docEditor.document;

    const insertions: TrackedChange[] = [];
    const deletions: TrackedChange[] = [];

    this.collectChanges(doc, insertions, deletions, 0, 0);

    return {
      insertions,
      deletions,
      total: insertions.length + deletions.length,
    };
  }

  private collectChanges(
    node: any,
    insertions: TrackedChange[],
    deletions: TrackedChange[],
    paragraphIndex: number,
    runIndex: number,
  ): void {
    if (!node || typeof node !== "object") return;

    if (Array.isArray(node)) {
      for (const item of node) {
        this.collectChanges(
          item,
          insertions,
          deletions,
          paragraphIndex,
          runIndex,
        );
      }
      return;
    }

    for (const key of Object.keys(node)) {
      // Skip the attributes object
      if (key === ":@") continue;

      if (key === "w:ins") {
        const elements = Array.isArray(node[key]) ? node[key] : [node[key]];
        for (const el of elements) {
          const text = this.extractTextFromChange(el);
          // Handle both preserveOrder format (attrs in node[":@"]) and flat format
          const attrs = node[":@"] || el[":@"] || el;
          insertions.push({
            id: attrs["@_w:id"] || el["@_w:id"] || "",
            type: "insertion",
            author: attrs["@_w:author"] || el["@_w:author"] || "Unknown",
            date: attrs["@_w:date"] || el["@_w:date"] || "",
            text,
            paragraphIndex,
            runIndex,
          });
        }
      } else if (key === "w:del") {
        const elements = Array.isArray(node[key]) ? node[key] : [node[key]];
        for (const el of elements) {
          const text = this.extractTextFromDeletion(el);
          // Handle both preserveOrder format (attrs in node[":@"]) and flat format
          const attrs = node[":@"] || el[":@"] || el;
          deletions.push({
            id: attrs["@_w:id"] || el["@_w:id"] || "",
            type: "deletion",
            author: attrs["@_w:author"] || el["@_w:author"] || "Unknown",
            date: attrs["@_w:date"] || el["@_w:date"] || "",
            text,
            paragraphIndex,
            runIndex,
          });
        }
      }

      this.collectChanges(
        node[key],
        insertions,
        deletions,
        paragraphIndex,
        runIndex,
      );
    }
  }

  private extractTextFromChange(node: any): string {
    let text = "";

    if (!node || typeof node !== "object") return text;

    if (Array.isArray(node)) {
      for (const item of node) {
        text += this.extractTextFromChange(item);
      }
      return text;
    }

    for (const key of Object.keys(node)) {
      // Skip attributes and metadata keys
      if (key === ":@" || key.startsWith("@_")) continue;

      if (key === "w:t") {
        const tElements = Array.isArray(node[key]) ? node[key] : [node[key]];
        for (const t of tElements) {
          if (typeof t === "string") {
            text += t;
          } else if (t["#text"]) {
            text += t["#text"];
          } else if (Array.isArray(t)) {
            // preserveOrder format: text may be in nested arrays
            for (const item of t) {
              if (item["#text"]) {
                text += item["#text"];
              }
            }
          }
        }
      } else {
        text += this.extractTextFromChange(node[key]);
      }
    }

    return text;
  }

  private extractTextFromDeletion(node: any): string {
    let text = "";

    if (!node || typeof node !== "object") return text;

    if (Array.isArray(node)) {
      for (const item of node) {
        text += this.extractTextFromDeletion(item);
      }
      return text;
    }

    for (const key of Object.keys(node)) {
      // Skip attributes and metadata keys
      if (key === ":@" || key.startsWith("@_")) continue;

      if (key === "w:delText") {
        const tElements = Array.isArray(node[key]) ? node[key] : [node[key]];
        for (const t of tElements) {
          if (typeof t === "string") {
            text += t;
          } else if (t["#text"]) {
            text += t["#text"];
          } else if (Array.isArray(t)) {
            // preserveOrder format: text may be in nested arrays
            for (const item of t) {
              if (item["#text"]) {
                text += item["#text"];
              }
            }
          }
        }
      } else {
        text += this.extractTextFromDeletion(node[key]);
      }
    }

    return text;
  }

  /**
   * Insert text with tracking at the end of a paragraph
   */
  async insertTextAtParagraphEnd(
    paragraphIndex: number,
    text: string,
    formatting?: TextFormatting,
  ): Promise<string> {
    const docEditor = await this.editor.getDocumentEditor();

    // Find paragraph
    const paragraphs = docEditor.findElements({ tag: "w:p" });
    if (paragraphIndex >= paragraphs.length) {
      throw new Error(`Paragraph index ${paragraphIndex} out of range`);
    }

    const para = paragraphs[paragraphIndex];
    const changeId = this.getNextChangeId();
    const timestamp = this.editor.getTimestamp();

    // Build the insertion XML
    const formattingXml = this.buildFormattingXml(formatting);
    const insertionXml = `<w:ins w:id="${changeId}" w:author="${this.editor.authorName}" w:date="${timestamp}">
  <w:r>
    ${formattingXml}
    <w:t xml:space="preserve">${this.escapeXml(text)}</w:t>
  </w:r>
</w:ins>`;

    // Find last run in paragraph and insert after it
    const runs = this.findRunsInElement(para.element);
    if (runs.length > 0) {
      docEditor.insertAfter(runs[runs.length - 1], insertionXml);
    } else {
      // No runs, add directly to paragraph
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        preserveOrder: true,
        // Security: Disable entity processing to prevent XXE attacks
        processEntities: false,
      });
      const parsed = parser.parse(insertionXml);
      if (!para.element["w:ins"]) {
        para.element["w:ins"] = [];
      }
      if (!Array.isArray(para.element["w:ins"])) {
        para.element["w:ins"] = [para.element["w:ins"]];
      }
      para.element["w:ins"].push(parsed["w:ins"]);
      docEditor.markModified();
    }

    return changeId;
  }

  /**
   * Mark text for deletion
   */
  async deleteText(
    paragraphIndex: number,
    startOffset: number,
    endOffset: number,
  ): Promise<string> {
    const docEditor = await this.editor.getDocumentEditor();

    // Find paragraph
    const paragraphs = docEditor.findElements({ tag: "w:p" });
    if (paragraphIndex >= paragraphs.length) {
      throw new Error(`Paragraph index ${paragraphIndex} out of range`);
    }

    const para = paragraphs[paragraphIndex];
    const changeId = this.getNextChangeId();
    const timestamp = this.editor.getTimestamp();

    // This is a simplified implementation that marks entire runs for deletion
    // A full implementation would split runs at character boundaries

    const runs = this.findRunsInElement(para.element);
    let currentOffset = 0;

    for (const run of runs) {
      const runText = docEditor.getElementText(run.element);
      const runStart = currentOffset;
      const runEnd = currentOffset + runText.length;

      // Check if this run overlaps with deletion range
      if (runEnd > startOffset && runStart < endOffset) {
        // This run needs to be marked as deleted
        // Wrap the run in w:del
        const deletionXml = `<w:del w:id="${changeId}" w:author="${this.editor.authorName}" w:date="${timestamp}" w:rsidDel="${this.editor.sessionRsid}">
  <w:r>
    <w:delText xml:space="preserve">${this.escapeXml(runText)}</w:delText>
  </w:r>
</w:del>`;

        docEditor.replaceElement(run, deletionXml);
      }

      currentOffset = runEnd;
    }

    return changeId;
  }

  /**
   * Accept a tracked change by ID
   */
  async acceptChange(changeId: string): Promise<boolean> {
    const docEditor = await this.editor.getDocumentEditor();
    const doc = docEditor.document;

    return this.processChange(doc, changeId, "accept", docEditor);
  }

  /**
   * Reject a tracked change by ID
   */
  async rejectChange(changeId: string): Promise<boolean> {
    const docEditor = await this.editor.getDocumentEditor();
    const doc = docEditor.document;

    return this.processChange(doc, changeId, "reject", docEditor);
  }

  private processChange(
    node: any,
    changeId: string,
    action: "accept" | "reject",
    docEditor: XmlFileEditor,
  ): boolean {
    if (!node || typeof node !== "object") return false;

    if (Array.isArray(node)) {
      for (const item of node) {
        if (this.processChange(item, changeId, action, docEditor)) {
          return true;
        }
      }
      return false;
    }

    for (const key of Object.keys(node)) {
      if (key === "w:ins") {
        const elements = Array.isArray(node[key]) ? node[key] : [node[key]];
        for (let i = 0; i < elements.length; i++) {
          if (elements[i]["@_w:id"] === changeId) {
            if (action === "accept") {
              // Accept insertion: unwrap the content (remove w:ins but keep runs)
              const runs = elements[i]["w:r"];
              if (runs) {
                if (!node["w:r"]) {
                  node["w:r"] = [];
                }
                if (!Array.isArray(node["w:r"])) {
                  node["w:r"] = [node["w:r"]];
                }
                const runsArray = Array.isArray(runs) ? runs : [runs];
                node["w:r"].push(...runsArray);
              }
            }
            // Remove the w:ins element (for both accept and reject)
            if (Array.isArray(node[key])) {
              node[key].splice(i, 1);
              if (node[key].length === 0) {
                delete node[key];
              }
            } else {
              delete node[key];
            }
            docEditor.markModified();
            return true;
          }
        }
      } else if (key === "w:del") {
        const elements = Array.isArray(node[key]) ? node[key] : [node[key]];
        for (let i = 0; i < elements.length; i++) {
          if (elements[i]["@_w:id"] === changeId) {
            if (action === "reject") {
              // Reject deletion: unwrap the content, convert delText back to t
              const runs = elements[i]["w:r"];
              if (runs) {
                const runsArray = Array.isArray(runs) ? runs : [runs];
                // Convert w:delText back to w:t
                for (const run of runsArray) {
                  if (run["w:delText"]) {
                    run["w:t"] = run["w:delText"];
                    delete run["w:delText"];
                  }
                }
                if (!node["w:r"]) {
                  node["w:r"] = [];
                }
                if (!Array.isArray(node["w:r"])) {
                  node["w:r"] = [node["w:r"]];
                }
                node["w:r"].push(...runsArray);
              }
            }
            // Remove the w:del element (for both accept and reject)
            if (Array.isArray(node[key])) {
              node[key].splice(i, 1);
              if (node[key].length === 0) {
                delete node[key];
              }
            } else {
              delete node[key];
            }
            docEditor.markModified();
            return true;
          }
        }
      }

      if (this.processChange(node[key], changeId, action, docEditor)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Accept all tracked changes
   */
  async acceptAllChanges(): Promise<number> {
    const changes = await this.listChanges();
    let count = 0;

    // Accept insertions (keeps the text)
    for (const ins of changes.insertions) {
      if (await this.acceptChange(ins.id)) {
        count++;
      }
    }

    // Accept deletions (removes the text)
    for (const del of changes.deletions) {
      if (await this.acceptChange(del.id)) {
        count++;
      }
    }

    return count;
  }

  /**
   * Reject all tracked changes
   */
  async rejectAllChanges(): Promise<number> {
    const changes = await this.listChanges();
    let count = 0;

    // Reject insertions (removes the text)
    for (const ins of changes.insertions) {
      if (await this.rejectChange(ins.id)) {
        count++;
      }
    }

    // Reject deletions (keeps the text)
    for (const del of changes.deletions) {
      if (await this.rejectChange(del.id)) {
        count++;
      }
    }

    return count;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private findRunsInElement(
    element: any,
  ): Array<{ key: string; element: any; parent: any }> {
    const runs: Array<{ key: string; element: any; parent: any }> = [];

    if (!element || typeof element !== "object") return runs;

    if (element["w:r"]) {
      const runElements = Array.isArray(element["w:r"])
        ? element["w:r"]
        : [element["w:r"]];
      for (const run of runElements) {
        runs.push({ key: "w:r", element: run, parent: element });
      }
    }

    return runs;
  }

  private buildFormattingXml(formatting?: TextFormatting): string {
    if (!formatting) return "";

    const props: string[] = [];

    if (formatting.bold) props.push("<w:b/>");
    if (formatting.italic) props.push("<w:i/>");
    if (formatting.underline) props.push('<w:u w:val="single"/>');
    if (formatting.fontSize) {
      props.push(`<w:sz w:val="${formatting.fontSize * 2}"/>`);
    }
    if (formatting.fontFamily) {
      props.push(
        `<w:rFonts w:ascii="${formatting.fontFamily}" w:hAnsi="${formatting.fontFamily}"/>`,
      );
    }
    if (formatting.color) {
      props.push(`<w:color w:val="${formatting.color}"/>`);
    }

    if (props.length === 0) return "";

    return `<w:rPr>${props.join("")}</w:rPr>`;
  }

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
 * Create a tracked changes manager for a document editor
 */
export async function createTrackedChangesManager(
  editor: DocumentEditor,
): Promise<TrackedChangesManager> {
  const manager = new TrackedChangesManager(editor);
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
TrackedChanges - Manage tracked changes in DOCX documents

Usage:
  bun run TrackedChanges.ts list <unpacked-dir>
  bun run TrackedChanges.ts accept-all <unpacked-dir>
  bun run TrackedChanges.ts reject-all <unpacked-dir>
  bun run TrackedChanges.ts accept <unpacked-dir> <change-id>
  bun run TrackedChanges.ts reject <unpacked-dir> <change-id>

Commands:
  list         List all tracked changes
  accept-all   Accept all tracked changes
  reject-all   Reject all tracked changes
  accept       Accept a specific change by ID
  reject       Reject a specific change by ID

Examples:
  bun run TrackedChanges.ts list ./unpacked-doc
  bun run TrackedChanges.ts accept-all ./unpacked-doc
`);
    process.exit(0);
  }

  const command = args[0];
  const unpackedDir = args[1];

  if (!unpackedDir) {
    console.error("Error: Missing unpacked directory path");
    process.exit(1);
  }

  try {
    const editor = await DocumentEditor.openUnpacked(unpackedDir);
    const manager = await createTrackedChangesManager(editor);

    switch (command) {
      case "list": {
        const changes = await manager.listChanges();
        console.log(`Total tracked changes: ${changes.total}`);
        console.log(`\nInsertions (${changes.insertions.length}):`);
        for (const ins of changes.insertions) {
          console.log(
            `  [${ins.id}] by ${ins.author}: "${ins.text.substring(0, 50)}${ins.text.length > 50 ? "..." : ""}"`,
          );
        }
        console.log(`\nDeletions (${changes.deletions.length}):`);
        for (const del of changes.deletions) {
          console.log(
            `  [${del.id}] by ${del.author}: "${del.text.substring(0, 50)}${del.text.length > 50 ? "..." : ""}"`,
          );
        }
        break;
      }
      case "accept-all": {
        const count = await manager.acceptAllChanges();
        await editor.saveAll();
        console.log(`Accepted ${count} changes`);
        break;
      }
      case "reject-all": {
        const count = await manager.rejectAllChanges();
        await editor.saveAll();
        console.log(`Rejected ${count} changes`);
        break;
      }
      case "accept": {
        const changeId = args[2];
        if (!changeId) {
          console.error("Error: Missing change ID");
          process.exit(1);
        }
        const success = await manager.acceptChange(changeId);
        if (success) {
          await editor.saveAll();
          console.log(`Accepted change ${changeId}`);
        } else {
          console.log(`Change ${changeId} not found`);
        }
        break;
      }
      case "reject": {
        const changeId = args[2];
        if (!changeId) {
          console.error("Error: Missing change ID");
          process.exit(1);
        }
        const success = await manager.rejectChange(changeId);
        if (success) {
          await editor.saveAll();
          console.log(`Rejected change ${changeId}`);
        } else {
          console.log(`Change ${changeId} not found`);
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
  }
}

// Run CLI if executed directly
if (import.meta.main) {
  main();
}
