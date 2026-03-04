/**
 * Tests for docx-op editing tools
 *
 * Tests core functionality of:
 * - OoxmlManager (pack/unpack)
 * - ContentExtractor
 * - TrackedChanges
 * - CommentManager
 * - MetadataManager
 *
 * Run with: bun test .claude/skills/docx-op/tools/docx-editing.test.ts
 */

import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdir, rm, writeFile, readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

// Import tools
import { unpack, pack, generateRsid } from "./OoxmlManager";
import { extractText, extractStructure, extract } from "./ContentExtractor";
import { readMetadata, writeMetadata } from "./MetadataManager";
import { DocumentEditor } from "./DocumentEditor";
import {
  TrackedChangesManager,
  createTrackedChangesManager,
} from "./TrackedChanges";
import { CommentManager, createCommentManager } from "./CommentManager";

const TEST_DIR = "./tmp/docx-editing-tests";
const FIXTURES_DIR = join(TEST_DIR, "fixtures");

// Create a minimal valid DOCX for testing
async function createTestDocx(outputPath: string): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  // [Content_Types].xml
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`,
  );

  // _rels/.rels
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`,
  );

  // word/document.xml
  zip.file(
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>Hello World</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>This is the second paragraph.</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr><w:b/></w:rPr>
        <w:t>Bold text here.</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`,
  );

  // word/_rels/document.xml.rels
  zip.file(
    "word/_rels/document.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`,
  );

  // docProps/core.xml
  zip.file(
    "docProps/core.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
                   xmlns:dc="http://purl.org/dc/elements/1.1/"
                   xmlns:dcterms="http://purl.org/dc/terms/"
                   xmlns:dcmitype="http://purl.org/dc/dcmitype/"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Test Document</dc:title>
  <dc:creator>Test Author</dc:creator>
  <cp:lastModifiedBy>Test Author</cp:lastModifiedBy>
  <cp:revision>1</cp:revision>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-01-07T00:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2026-01-07T00:00:00Z</dcterms:modified>
</cp:coreProperties>`,
  );

  // docProps/app.xml
  zip.file(
    "docProps/app.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>PAI Test Suite</Application>
  <AppVersion>1.0</AppVersion>
  <Company>Test Company</Company>
  <Pages>1</Pages>
  <Words>10</Words>
</Properties>`,
  );

  const content = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
  });
  await writeFile(outputPath, content);
}

// Setup and teardown
beforeAll(async () => {
  await mkdir(FIXTURES_DIR, { recursive: true });
  await createTestDocx(join(FIXTURES_DIR, "test.docx"));
});

afterAll(async () => {
  if (existsSync(TEST_DIR)) {
    await rm(TEST_DIR, { recursive: true, force: true });
  }
});

// ============================================================================
// OoxmlManager Tests
// ============================================================================

describe("OoxmlManager", () => {
  test("generateRsid returns 8-character hex string", () => {
    const rsid = generateRsid();
    expect(rsid).toMatch(/^[0-9A-F]{8}$/);
  });

  test("generateRsid returns unique values", () => {
    const rsids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      rsids.add(generateRsid());
    }
    expect(rsids.size).toBe(100);
  });

  test("unpack extracts DOCX to directory", async () => {
    const inputPath = join(FIXTURES_DIR, "test.docx");
    const outputDir = join(TEST_DIR, "unpacked");

    const result = await unpack(inputPath, outputDir);

    expect(result.fileCount).toBeGreaterThan(0);
    expect(result.files).toContain("word/document.xml");
    expect(result.files).toContain("[Content_Types].xml");
    expect(existsSync(join(outputDir, "word/document.xml"))).toBe(true);
  });

  test("unpack generates RSID by default", async () => {
    const inputPath = join(FIXTURES_DIR, "test.docx");
    const outputDir = join(TEST_DIR, "unpacked-rsid");

    const result = await unpack(inputPath, outputDir);

    expect(result.rsid).toBeDefined();
    expect(result.rsid).toMatch(/^[0-9A-F]{8}$/);
  });

  test("pack creates valid DOCX from directory", async () => {
    const inputPath = join(FIXTURES_DIR, "test.docx");
    const unpackedDir = join(TEST_DIR, "for-pack");
    const outputPath = join(TEST_DIR, "repacked.docx");

    await unpack(inputPath, unpackedDir);
    const result = await pack(unpackedDir, outputPath);

    expect(result.fileCount).toBeGreaterThan(0);
    expect(existsSync(outputPath)).toBe(true);

    // Verify repacked file is valid by unpacking again
    const verifyDir = join(TEST_DIR, "verify");
    const verifyResult = await unpack(outputPath, verifyDir);
    expect(verifyResult.files).toContain("word/document.xml");
  });
});

// ============================================================================
// ContentExtractor Tests
// ============================================================================

describe("ContentExtractor", () => {
  test("extractText returns document text", async () => {
    const inputPath = join(FIXTURES_DIR, "test.docx");

    const text = await extractText(inputPath);

    expect(text).toContain("Hello World");
    expect(text).toContain("second paragraph");
    expect(text).toContain("Bold text");
  });

  test("extractStructure returns body blocks", async () => {
    const inputPath = join(FIXTURES_DIR, "test.docx");

    const structure = await extractStructure(inputPath);

    expect(structure.body.length).toBeGreaterThan(0);
    expect(structure.body[0].type).toBe("paragraph");
  });

  test("extract returns statistics", async () => {
    const inputPath = join(FIXTURES_DIR, "test.docx");

    const result = await extract(inputPath);

    expect(result.wordCount).toBeGreaterThan(0);
    expect(result.paragraphCount).toBe(3);
    expect(result.tableCount).toBe(0);
    expect(result.text).toContain("Hello World");
  });

  test("extractStructure extracts paragraph content", async () => {
    const inputPath = join(FIXTURES_DIR, "test.docx");

    const structure = await extractStructure(inputPath);

    // Find paragraph with text content
    const hasContent = structure.body.some((block) => {
      if (block.type !== "paragraph") return false;
      const para = block.content as any;
      return para.text && para.text.length > 0;
    });

    expect(hasContent).toBe(true);
  });
});

// ============================================================================
// MetadataManager Tests
// ============================================================================

describe("MetadataManager", () => {
  test("readMetadata extracts core properties", async () => {
    const inputPath = join(FIXTURES_DIR, "test.docx");

    const metadata = await readMetadata(inputPath);

    expect(metadata.core.title).toBe("Test Document");
    expect(metadata.core.creator).toBe("Test Author");
    expect(metadata.core.revision).toBe("1");
  });

  test("readMetadata extracts app properties", async () => {
    const inputPath = join(FIXTURES_DIR, "test.docx");

    const metadata = await readMetadata(inputPath);

    expect(metadata.app.application).toBe("PAI Test Suite");
    expect(metadata.app.company).toBe("Test Company");
    expect(metadata.app.pages).toBe(1);
    expect(metadata.app.words).toBe(10);
  });

  test("writeMetadata updates title", async () => {
    const inputPath = join(FIXTURES_DIR, "test.docx");
    const outputPath = join(TEST_DIR, "metadata-updated.docx");

    await writeMetadata(inputPath, outputPath, {
      title: "Updated Title",
      creator: "New Author",
    });

    const metadata = await readMetadata(outputPath);
    expect(metadata.core.title).toBe("Updated Title");
    expect(metadata.core.creator).toBe("New Author");
  });
});

// ============================================================================
// DocumentEditor Tests
// ============================================================================

describe("DocumentEditor", () => {
  test("open unpacks and initializes editor", async () => {
    const inputPath = join(FIXTURES_DIR, "test.docx");
    const outputDir = join(TEST_DIR, "editor-test");

    const editor = await DocumentEditor.open(inputPath, outputDir, {
      author: "Test User",
      trackChanges: true,
    });

    expect(editor.authorName).toBe("Test User");
    expect(editor.sessionRsid).toMatch(/^[0-9A-F]{8}$/);
  });

  test("getDocumentEditor provides XML editing", async () => {
    const inputPath = join(FIXTURES_DIR, "test.docx");
    const outputDir = join(TEST_DIR, "doc-editor-test");

    const editor = await DocumentEditor.open(inputPath, outputDir);
    const docEditor = await editor.getDocumentEditor();

    // Find paragraphs (preserveOrder mode may find more due to internal structure)
    const paragraphs = docEditor.findElements({ tag: "w:p" });
    expect(paragraphs.length).toBeGreaterThanOrEqual(3);
  });

  test("packTo creates output DOCX", async () => {
    const inputPath = join(FIXTURES_DIR, "test.docx");
    const unpackedDir = join(TEST_DIR, "pack-test");
    const outputPath = join(TEST_DIR, "packed-output.docx");

    const editor = await DocumentEditor.open(inputPath, unpackedDir);
    await editor.packTo(outputPath);

    expect(existsSync(outputPath)).toBe(true);

    // Verify content preserved
    const text = await extractText(outputPath);
    expect(text).toContain("Hello World");
  });
});

// ============================================================================
// TrackedChangesManager Tests
// ============================================================================

describe("TrackedChangesManager", () => {
  test("listChanges returns empty for clean document", async () => {
    const inputPath = join(FIXTURES_DIR, "test.docx");
    const outputDir = join(TEST_DIR, "tracked-list");

    const editor = await DocumentEditor.open(inputPath, outputDir);
    const manager = await createTrackedChangesManager(editor);

    const changes = await manager.listChanges();

    expect(changes.total).toBe(0);
    expect(changes.insertions.length).toBe(0);
    expect(changes.deletions.length).toBe(0);
  });

  // Fixed: TrackedChanges.ts now handles preserveOrder XML format
  // The fix handles both preserveOrder format (attrs in ":@") and flat format
  test("insertTextAtParagraphEnd creates tracked insertion", async () => {
    const inputPath = join(FIXTURES_DIR, "test.docx");
    const outputDir = join(TEST_DIR, "tracked-insert");

    const editor = await DocumentEditor.open(inputPath, outputDir, {
      author: "Claude",
    });
    const manager = await createTrackedChangesManager(editor);

    const changeId = await manager.insertTextAtParagraphEnd(0, " - Added text");
    await editor.saveAll();

    expect(changeId).toBeDefined();
    expect(parseInt(changeId)).toBeGreaterThanOrEqual(0);

    // Verify insertion was tracked
    const changes = await manager.listChanges();
    expect(changes.insertions.length).toBe(1);
    expect(changes.insertions[0].text).toBe(" - Added text");
    expect(changes.insertions[0].author).toBe("Claude");
  });

  // Fixed: TrackedChanges.ts now handles preserveOrder XML format
  test("acceptChange removes insertion tracking", async () => {
    const inputPath = join(FIXTURES_DIR, "test.docx");
    const outputDir = join(TEST_DIR, "tracked-accept");

    const editor = await DocumentEditor.open(inputPath, outputDir);
    const manager = await createTrackedChangesManager(editor);

    // Insert text
    const changeId = await manager.insertTextAtParagraphEnd(0, "New content");
    await editor.saveAll();

    // Verify tracked
    let changes = await manager.listChanges();
    expect(changes.insertions.length).toBe(1);

    // Accept the change
    const accepted = await manager.acceptChange(changeId);
    expect(accepted).toBe(true);

    // Verify no longer tracked
    changes = await manager.listChanges();
    expect(changes.insertions.length).toBe(0);
  });
});

// ============================================================================
// CommentManager Tests
// ============================================================================

describe("CommentManager", () => {
  test("listComments returns empty for document without comments", async () => {
    const inputPath = join(FIXTURES_DIR, "test.docx");
    const outputDir = join(TEST_DIR, "comment-list");

    const editor = await DocumentEditor.open(inputPath, outputDir);
    const manager = await createCommentManager(editor, outputDir);

    const result = await manager.listComments();

    expect(result.total).toBe(0);
    expect(result.comments.length).toBe(0);
  });

  // Fixed: CommentManager.ts now handles preserveOrder XML format
  test("addComment creates comment on paragraph", async () => {
    const inputPath = join(FIXTURES_DIR, "test.docx");
    const outputDir = join(TEST_DIR, "comment-add");

    const editor = await DocumentEditor.open(inputPath, outputDir, {
      author: "Reviewer",
    });
    const manager = await createCommentManager(editor, outputDir);

    const commentId = await manager.addComment({
      paragraphIndex: 0,
      text: "This needs clarification",
    });
    await editor.saveAll();

    expect(commentId).toBeDefined();

    // Verify comment was added
    const result = await manager.listComments();
    expect(result.total).toBe(1);
    expect(result.comments[0].text).toBe("This needs clarification");
    expect(result.comments[0].author).toBe("Reviewer");
  });

  test("replyToComment adds reply", async () => {
    const inputPath = join(FIXTURES_DIR, "test.docx");
    const outputDir = join(TEST_DIR, "comment-reply");

    const editor = await DocumentEditor.open(inputPath, outputDir, {
      author: "Author",
    });
    const manager = await createCommentManager(editor, outputDir);

    // Add initial comment
    const commentId = await manager.addComment({
      paragraphIndex: 0,
      text: "Original comment",
    });

    // Add reply
    const replyId = await manager.replyToComment(commentId, "This is a reply");

    expect(replyId).toBeDefined();
    expect(replyId).not.toBe(commentId);
  });

  // Fixed: CommentManager.ts now handles preserveOrder XML format
  test("deleteComment removes comment", async () => {
    const inputPath = join(FIXTURES_DIR, "test.docx");
    const outputDir = join(TEST_DIR, "comment-delete");

    const editor = await DocumentEditor.open(inputPath, outputDir);
    const manager = await createCommentManager(editor, outputDir);

    // Add comment
    const commentId = await manager.addComment({
      paragraphIndex: 0,
      text: "To be deleted",
    });

    // Verify added
    let result = await manager.listComments();
    expect(result.total).toBe(1);

    // Delete
    const deleted = await manager.deleteComment(commentId);
    expect(deleted).toBe(true);

    // Verify deleted
    result = await manager.listComments();
    expect(result.total).toBe(0);
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe("Integration: Full editing workflow", () => {
  // Fixed: preserveOrder XML handling in TrackedChanges and CommentManager
  test("unpack -> edit -> add comments -> pack roundtrip", async () => {
    const inputPath = join(FIXTURES_DIR, "test.docx");
    const unpackedDir = join(TEST_DIR, "integration");
    const outputPath = join(TEST_DIR, "integration-output.docx");

    // Step 1: Open for editing
    const editor = await DocumentEditor.open(inputPath, unpackedDir, {
      author: "Integration Test",
      trackChanges: true,
    });

    // Step 2: Add tracked change
    const trackedManager = await createTrackedChangesManager(editor);
    await trackedManager.insertTextAtParagraphEnd(0, " [EDITED]");

    // Step 3: Add comment
    const commentManager = await createCommentManager(editor, unpackedDir);
    await commentManager.addComment({
      paragraphIndex: 1,
      text: "Review this section",
    });

    // Step 4: Save and pack
    await editor.packTo(outputPath);

    // Step 5: Verify output
    expect(existsSync(outputPath)).toBe(true);

    // Verify we can read it back
    const text = await extractText(outputPath);
    expect(text).toContain("Hello World");

    const metadata = await readMetadata(outputPath);
    expect(metadata.core.title).toBe("Test Document");
  });

  test("unpack -> read metadata -> pack roundtrip", async () => {
    const inputPath = join(FIXTURES_DIR, "test.docx");
    const outputPath = join(TEST_DIR, "metadata-roundtrip.docx");

    // Update metadata
    await writeMetadata(inputPath, outputPath, {
      title: "Modified Title",
    });

    // Verify we can read the modified file
    const metadata = await readMetadata(outputPath);
    expect(metadata.core.title).toBe("Modified Title");

    // Verify content preserved
    const text = await extractText(outputPath);
    expect(text).toContain("Hello World");
  });
});
