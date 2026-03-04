#!/usr/bin/env bun

/**
 * PAI DOCX Skill - DocumentEditor.ts
 * High-level document editing with tracked changes and comments
 *
 * Provides:
 * - Open and edit unpacked DOCX directories
 * - Automatic RSID and author management
 * - Tracked changes infrastructure setup
 * - XML editing with proper namespace handling
 * - Save with optional validation
 */

import { readFile, writeFile, mkdir, access, copyFile } from "fs/promises";
import { join, dirname } from "path";
import { existsSync } from "fs";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { unpack, pack, generateRsid } from "./OoxmlManager";

// ============================================================================
// TYPES
// ============================================================================

export interface EditorOptions {
  /** Author name for tracked changes and comments */
  author?: string;
  /** Custom RSID (auto-generated if not provided) */
  rsid?: string;
  /** Enable tracked changes */
  trackChanges?: boolean;
}

export interface SaveOptions {
  /** Validate output with LibreOffice */
  validate?: boolean;
  /** Force save even if validation fails */
  force?: boolean;
}

export interface NodeQuery {
  /** Element tag name (e.g., "w:p", "w:r") */
  tag?: string;
  /** Attribute matches */
  attributes?: Record<string, string>;
  /** Text content contains */
  textContains?: string;
  /** Text content matches exactly */
  textEquals?: string;
  /** XPath-like path (simplified) */
  path?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const WORD_NAMESPACES = {
  "xmlns:w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
  "xmlns:w14": "http://schemas.microsoft.com/office/word/2010/wordml",
  "xmlns:w15": "http://schemas.microsoft.com/office/word/2012/wordml",
  "xmlns:w16cex": "http://schemas.microsoft.com/office/word/2018/wordml/cex",
  "xmlns:w16cid": "http://schemas.microsoft.com/office/word/2016/wordml/cid",
  "xmlns:w16du": "http://schemas.microsoft.com/office/word/2018/wordml/du",
  "xmlns:r":
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
};

const XML_PARSER_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  cdataPropName: "#cdata",
  commentPropName: "#comment",
  trimValues: false,
  parseTagValue: false,
  parseAttributeValue: false,
  preserveOrder: true,
  // Security: Disable entity processing to prevent XXE attacks
  processEntities: false,
};

const XML_BUILDER_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  cdataPropName: "#cdata",
  commentPropName: "#comment",
  format: true,
  indentBy: "  ",
  preserveOrder: true,
  suppressEmptyNode: false,
};

// ============================================================================
// XML FILE EDITOR
// ============================================================================

/**
 * Editor for individual XML files within the document
 */
export class XmlFileEditor {
  private filePath: string;
  private content: string;
  private parsed: any;
  private modified: boolean = false;
  private parser: XMLParser;
  private builder: XMLBuilder;

  constructor(filePath: string, content: string) {
    this.filePath = filePath;
    this.content = content;
    this.parser = new XMLParser(XML_PARSER_OPTIONS);
    this.builder = new XMLBuilder(XML_BUILDER_OPTIONS);
    this.parsed = this.parser.parse(content);
  }

  /**
   * Get the parsed XML document
   */
  get document(): any {
    return this.parsed;
  }

  /**
   * Check if the document has been modified
   */
  get isModified(): boolean {
    return this.modified;
  }

  /**
   * Mark the document as modified
   */
  markModified(): void {
    this.modified = true;
  }

  /**
   * Find elements matching a query
   */
  findElements(query: NodeQuery, node: any = this.parsed): any[] {
    const results: any[] = [];
    this.findElementsRecursive(query, node, results);
    return results;
  }

  private findElementsRecursive(
    query: NodeQuery,
    node: any,
    results: any[],
  ): void {
    if (!node || typeof node !== "object") return;

    if (Array.isArray(node)) {
      for (const item of node) {
        this.findElementsRecursive(query, item, results);
      }
      return;
    }

    for (const key of Object.keys(node)) {
      if (key.startsWith("@_") || key === "#text") continue;

      // Check if this element matches
      if (query.tag && key === query.tag) {
        const element = node[key];
        const elements = Array.isArray(element) ? element : [element];

        for (const el of elements) {
          let matches = true;

          // Check attributes
          if (query.attributes) {
            for (const [attr, value] of Object.entries(query.attributes)) {
              if (el[`@_${attr}`] !== value) {
                matches = false;
                break;
              }
            }
          }

          // Check text content
          if (matches && (query.textContains || query.textEquals)) {
            const text = this.getElementText(el);
            if (query.textEquals && text !== query.textEquals) {
              matches = false;
            }
            if (query.textContains && !text.includes(query.textContains)) {
              matches = false;
            }
          }

          if (matches) {
            results.push({ key, element: el, parent: node });
          }
        }
      }

      // Recurse into children
      const child = node[key];
      if (child && typeof child === "object") {
        this.findElementsRecursive(query, child, results);
      }
    }
  }

  /**
   * Get text content of an element
   */
  getElementText(element: any): string {
    if (!element) return "";
    if (typeof element === "string") return element;

    let text = "";

    if (element["#text"]) {
      text += element["#text"];
    }

    // Recurse into text elements
    for (const key of Object.keys(element)) {
      if (key.startsWith("@_")) continue;
      const child = element[key];
      if (child && typeof child === "object") {
        if (key === "w:t") {
          const tElements = Array.isArray(child) ? child : [child];
          for (const t of tElements) {
            if (typeof t === "string") {
              text += t;
            } else if (t["#text"]) {
              text += t["#text"];
            }
          }
        } else {
          text += this.getElementText(child);
        }
      }
    }

    return text;
  }

  /**
   * Replace an element with new XML content
   */
  replaceElement(
    target: { key: string; element: any; parent: any },
    newXml: string,
  ): void {
    const newParsed = this.parser.parse(newXml);
    const newElement = newParsed[target.key];

    if (Array.isArray(target.parent[target.key])) {
      const index = target.parent[target.key].indexOf(target.element);
      if (index !== -1) {
        target.parent[target.key][index] = newElement;
      }
    } else {
      target.parent[target.key] = newElement;
    }

    this.modified = true;
  }

  /**
   * Insert XML after an element
   */
  insertAfter(
    target: { key: string; element: any; parent: any },
    newXml: string,
  ): void {
    const newParsed = this.parser.parse(newXml);

    // Get keys to insert
    for (const [newKey, newValue] of Object.entries(newParsed)) {
      if (!target.parent[newKey]) {
        target.parent[newKey] = [];
      }

      if (Array.isArray(target.parent[target.key])) {
        const index = target.parent[target.key].indexOf(target.element);
        if (index !== -1 && newKey === target.key) {
          target.parent[target.key].splice(index + 1, 0, newValue);
        } else {
          if (!Array.isArray(target.parent[newKey])) {
            target.parent[newKey] = [target.parent[newKey]];
          }
          target.parent[newKey].push(newValue);
        }
      } else {
        if (!Array.isArray(target.parent[newKey])) {
          target.parent[newKey] = target.parent[newKey]
            ? [target.parent[newKey]]
            : [];
        }
        target.parent[newKey].push(newValue);
      }
    }

    this.modified = true;
  }

  /**
   * Remove an element
   */
  removeElement(target: { key: string; element: any; parent: any }): void {
    if (Array.isArray(target.parent[target.key])) {
      const index = target.parent[target.key].indexOf(target.element);
      if (index !== -1) {
        target.parent[target.key].splice(index, 1);
      }
    } else {
      delete target.parent[target.key];
    }

    this.modified = true;
  }

  /**
   * Build and return the modified XML
   */
  build(): string {
    return this.builder.build(this.parsed);
  }

  /**
   * Save to file
   */
  async save(): Promise<void> {
    if (this.modified) {
      const xml = this.build();
      await writeFile(this.filePath, xml, "utf-8");
    }
  }
}

// ============================================================================
// DOCUMENT EDITOR
// ============================================================================

/**
 * Main document editor class for editing DOCX files
 */
export class DocumentEditor {
  private unpackedDir: string;
  private author: string;
  private rsid: string;
  private trackChanges: boolean;
  private editors: Map<string, XmlFileEditor> = new Map();
  private initialized: boolean = false;

  constructor(unpackedDir: string, options: EditorOptions = {}) {
    this.unpackedDir = unpackedDir;
    this.author = options.author || "Claude";
    this.rsid = options.rsid || generateRsid();
    this.trackChanges = options.trackChanges ?? true;
  }

  /**
   * Get the RSID for this editing session
   */
  get sessionRsid(): string {
    return this.rsid;
  }

  /**
   * Get the author name
   */
  get authorName(): string {
    return this.author;
  }

  /**
   * Initialize the editor and set up tracked changes infrastructure
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Verify directory exists
    try {
      await access(this.unpackedDir);
    } catch {
      throw new Error(`Directory not found: ${this.unpackedDir}`);
    }

    // Verify this is an unpacked DOCX
    const documentPath = join(this.unpackedDir, "word", "document.xml");
    try {
      await access(documentPath);
    } catch {
      throw new Error(`Invalid DOCX structure: missing word/document.xml`);
    }

    if (this.trackChanges) {
      await this.setupTrackedChangesInfrastructure();
    }

    this.initialized = true;
  }

  /**
   * Set up the infrastructure for tracked changes
   */
  private async setupTrackedChangesInfrastructure(): Promise<void> {
    // Ensure settings.xml enables track revisions
    await this.ensureTrackRevisions();

    // Ensure people.xml exists with author
    await this.ensurePeopleXml();
  }

  /**
   * Ensure settings.xml has track revisions enabled
   */
  private async ensureTrackRevisions(): Promise<void> {
    const settingsPath = join(this.unpackedDir, "word", "settings.xml");

    let settingsXml: string;
    try {
      settingsXml = await readFile(settingsPath, "utf-8");
    } catch {
      // Create minimal settings.xml if it doesn't exist
      settingsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:trackRevisions/>
</w:settings>`;
      await mkdir(dirname(settingsPath), { recursive: true });
      await writeFile(settingsPath, settingsXml, "utf-8");
      return;
    }

    // Check if trackRevisions exists
    if (!settingsXml.includes("<w:trackRevisions")) {
      // Add trackRevisions element
      settingsXml = settingsXml.replace(
        "</w:settings>",
        "  <w:trackRevisions/>\n</w:settings>",
      );
      await writeFile(settingsPath, settingsXml, "utf-8");
    }
  }

  /**
   * Ensure people.xml exists with the author
   */
  private async ensurePeopleXml(): Promise<void> {
    const peoplePath = join(this.unpackedDir, "word", "people.xml");
    const relsPath = join(
      this.unpackedDir,
      "word",
      "_rels",
      "document.xml.rels",
    );

    // Generate author ID
    const authorId = this.generateAuthorId();

    // Check if people.xml exists
    let peopleXml: string;
    try {
      peopleXml = await readFile(peoplePath, "utf-8");
      // Check if author exists
      if (!peopleXml.includes(`w:author="${this.author}"`)) {
        // Add author
        const personXml = `  <w15:person w15:author="${this.author}">
    <w15:presenceInfo w15:providerId="None" w15:userId="${authorId}"/>
  </w15:person>`;
        peopleXml = peopleXml.replace(
          "</w15:people>",
          `${personXml}\n</w15:people>`,
        );
        await writeFile(peoplePath, peopleXml, "utf-8");
      }
    } catch {
      // Create people.xml
      peopleXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w15:people xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml">
  <w15:person w15:author="${this.author}">
    <w15:presenceInfo w15:providerId="None" w15:userId="${authorId}"/>
  </w15:person>
</w15:people>`;
      await writeFile(peoplePath, peopleXml, "utf-8");

      // Add relationship in document.xml.rels
      await this.addRelationship(relsPath, {
        type: "http://schemas.microsoft.com/office/2011/relationships/people",
        target: "people.xml",
      });
    }
  }

  /**
   * Generate a unique author ID
   */
  private generateAuthorId(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  /**
   * Add a relationship to a .rels file
   */
  private async addRelationship(
    relsPath: string,
    relationship: { type: string; target: string },
  ): Promise<string> {
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
      // Create new .rels file
      await mkdir(dirname(relsPath), { recursive: true });
      relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;
    }

    const rId = `rId${nextId}`;
    const relXml = `  <Relationship Id="${rId}" Type="${relationship.type}" Target="${relationship.target}"/>`;

    relsXml = relsXml.replace(
      "</Relationships>",
      `${relXml}\n</Relationships>`,
    );
    await writeFile(relsPath, relsXml, "utf-8");

    return rId;
  }

  /**
   * Get an XML file editor
   */
  async getEditor(relativePath: string): Promise<XmlFileEditor> {
    if (this.editors.has(relativePath)) {
      return this.editors.get(relativePath)!;
    }

    const filePath = join(this.unpackedDir, relativePath);
    const content = await readFile(filePath, "utf-8");
    const editor = new XmlFileEditor(filePath, content);
    this.editors.set(relativePath, editor);

    return editor;
  }

  /**
   * Get the main document editor
   */
  async getDocumentEditor(): Promise<XmlFileEditor> {
    return this.getEditor("word/document.xml");
  }

  /**
   * Get current date/time in ISO format for tracked changes
   */
  getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Save all modified files
   */
  async saveAll(): Promise<void> {
    for (const editor of this.editors.values()) {
      await editor.save();
    }
  }

  /**
   * Pack the document back to a DOCX file
   */
  async packTo(outputPath: string, options: SaveOptions = {}): Promise<void> {
    await this.saveAll();
    await pack(this.unpackedDir, outputPath, {
      condenseXml: true,
      validate: options.validate,
      force: options.force,
    });
  }

  /**
   * Static method to open a DOCX file for editing
   */
  static async open(
    docxPath: string,
    outputDir: string,
    options: EditorOptions = {},
  ): Promise<DocumentEditor> {
    // Unpack the document
    await unpack(docxPath, outputDir, {
      prettyPrint: true,
      generateRsid: false,
    });

    // Create and initialize editor
    const editor = new DocumentEditor(outputDir, options);
    await editor.initialize();

    return editor;
  }

  /**
   * Static method to open an already unpacked directory
   */
  static async openUnpacked(
    unpackedDir: string,
    options: EditorOptions = {},
  ): Promise<DocumentEditor> {
    const editor = new DocumentEditor(unpackedDir, options);
    await editor.initialize();
    return editor;
  }
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1 || args.includes("--help") || args.includes("-h")) {
    console.log(`
DocumentEditor - Open DOCX for editing with tracked changes

Usage:
  bun run DocumentEditor.ts open <input.docx> <output-dir> [options]
  bun run DocumentEditor.ts pack <input-dir> <output.docx> [options]

Commands:
  open    Unpack DOCX and prepare for editing
  pack    Pack edited directory back to DOCX

Options:
  --author <name>   Author name for tracked changes (default: Claude)
  --no-track        Disable tracked changes
  --validate        Validate output when packing
  --force           Force pack even if validation fails

Examples:
  bun run DocumentEditor.ts open document.docx ./editing --author "John Doe"
  bun run DocumentEditor.ts pack ./editing document-edited.docx --validate
`);
    process.exit(0);
  }

  const command = args[0];
  const input = args[1];
  const output = args[2];

  const authorIndex = args.indexOf("--author");
  const author = authorIndex !== -1 ? args[authorIndex + 1] : "Claude";
  const noTrack = args.includes("--no-track");
  const validate = args.includes("--validate");
  const force = args.includes("--force");

  try {
    if (command === "open") {
      if (!input || !output) {
        console.error("Error: Missing input or output path");
        process.exit(1);
      }

      console.log(`Opening ${input} for editing...`);
      const editor = await DocumentEditor.open(input, output, {
        author,
        trackChanges: !noTrack,
      });

      console.log(`Unpacked to: ${output}`);
      console.log(`Session RSID: ${editor.sessionRsid}`);
      console.log(`Author: ${editor.authorName}`);
      console.log(`Track Changes: ${!noTrack}`);
    } else if (command === "pack") {
      if (!input || !output) {
        console.error("Error: Missing input or output path");
        process.exit(1);
      }

      console.log(`Packing ${input} to ${output}...`);
      const editor = await DocumentEditor.openUnpacked(input, {
        author,
        trackChanges: !noTrack,
      });

      await editor.packTo(output, { validate, force });
      console.log(`Created: ${output}`);
    } else {
      console.error(`Error: Unknown command: ${command}`);
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
