#!/usr/bin/env bun

/**
 * PAI DOCX Skill - ContentExtractor.ts
 * Extract text and structure from existing DOCX files
 *
 * Provides:
 * - Plain text extraction
 * - Structured content extraction (paragraphs, tables, lists)
 * - Metadata extraction
 * - Style and formatting information
 */

import JSZip from "jszip";
import { readFile } from "fs/promises";
import { XMLParser } from "fast-xml-parser";

// ============================================================================
// TYPES
// ============================================================================

export interface TextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

export interface Paragraph {
  type: "paragraph";
  runs: TextRun[];
  text: string;
  style?: string;
  alignment?: "left" | "center" | "right" | "justify";
  numbering?: {
    level: number;
    format: string;
  };
  outlineLevel?: number;
}

export interface TableCell {
  paragraphs: Paragraph[];
  text: string;
  rowSpan?: number;
  colSpan?: number;
}

export interface TableRow {
  cells: TableCell[];
}

export interface Table {
  type: "table";
  rows: TableRow[];
}

export interface ContentBlock {
  type: "paragraph" | "table";
  content: Paragraph | Table;
}

export interface DocumentStructure {
  body: ContentBlock[];
  headers: Paragraph[][];
  footers: Paragraph[][];
  footnotes: Paragraph[];
  endnotes: Paragraph[];
}

export interface ExtractOptions {
  /** Include formatting information */
  includeFormatting?: boolean;
  /** Include headers and footers */
  includeHeadersFooters?: boolean;
  /** Include footnotes and endnotes */
  includeNotes?: boolean;
  /** Extract as markdown */
  asMarkdown?: boolean;
}

export interface ExtractionResult {
  text: string;
  structure?: DocumentStructure;
  wordCount: number;
  paragraphCount: number;
  tableCount: number;
}

// ============================================================================
// XML PARSING
// ============================================================================

const xmlParserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  trimValues: false,
  parseTagValue: false,
  parseAttributeValue: false,
  // Security: Disable entity processing to prevent XXE attacks
  processEntities: false,
  isArray: (name: string) => {
    // Elements that should always be arrays
    return ["w:p", "w:r", "w:t", "w:tbl", "w:tr", "w:tc", "w:sectPr"].includes(
      name,
    );
  },
};

// ============================================================================
// TEXT EXTRACTION
// ============================================================================

/**
 * Extract text from a w:r (run) element
 */
function extractRunText(run: any): TextRun {
  const result: TextRun = { text: "" };

  if (!run) return result;

  // Get text content
  const textElements = run["w:t"];
  if (textElements) {
    const texts = Array.isArray(textElements) ? textElements : [textElements];
    result.text = texts
      .map((t: any) => (typeof t === "string" ? t : t["#text"] || ""))
      .join("");
  }

  // Get formatting from w:rPr
  const rPr = run["w:rPr"];
  if (rPr) {
    if (rPr["w:b"]) result.bold = true;
    if (rPr["w:i"]) result.italic = true;
    if (rPr["w:u"]) result.underline = true;
    if (rPr["w:strike"]) result.strike = true;

    const sz = rPr["w:sz"];
    if (sz && sz["@_w:val"]) {
      result.fontSize = parseInt(sz["@_w:val"]) / 2; // Half-points to points
    }

    const rFonts = rPr["w:rFonts"];
    if (rFonts) {
      result.fontFamily =
        rFonts["@_w:ascii"] || rFonts["@_w:hAnsi"] || rFonts["@_w:cs"];
    }

    const color = rPr["w:color"];
    if (color && color["@_w:val"]) {
      result.color = color["@_w:val"];
    }
  }

  return result;
}

/**
 * Extract content from a w:p (paragraph) element
 */
function extractParagraph(p: any): Paragraph {
  const result: Paragraph = {
    type: "paragraph",
    runs: [],
    text: "",
  };

  if (!p) return result;

  // Get paragraph properties
  const pPr = p["w:pPr"];
  if (pPr) {
    // Style
    const pStyle = pPr["w:pStyle"];
    if (pStyle && pStyle["@_w:val"]) {
      result.style = pStyle["@_w:val"];
    }

    // Alignment
    const jc = pPr["w:jc"];
    if (jc && jc["@_w:val"]) {
      const alignment = jc["@_w:val"];
      if (["left", "center", "right", "both"].includes(alignment)) {
        result.alignment = alignment === "both" ? "justify" : alignment;
      }
    }

    // Numbering
    const numPr = pPr["w:numPr"];
    if (numPr) {
      const ilvl = numPr["w:ilvl"];
      const numId = numPr["w:numId"];
      if (ilvl && numId) {
        result.numbering = {
          level: parseInt(ilvl["@_w:val"] || "0"),
          format: "bullet", // Would need numbering.xml to determine actual format
        };
      }
    }

    // Outline level (for headings)
    const outlineLvl = pPr["w:outlineLvl"];
    if (outlineLvl && outlineLvl["@_w:val"]) {
      result.outlineLevel = parseInt(outlineLvl["@_w:val"]);
    }
  }

  // Extract runs
  const runs = p["w:r"];
  if (runs) {
    const runArray = Array.isArray(runs) ? runs : [runs];
    for (const run of runArray) {
      const textRun = extractRunText(run);
      if (textRun.text) {
        result.runs.push(textRun);
      }
    }
  }

  // Concatenate text
  result.text = result.runs.map((r) => r.text).join("");

  return result;
}

/**
 * Extract content from a w:tbl (table) element
 */
function extractTable(tbl: any): Table {
  const result: Table = {
    type: "table",
    rows: [],
  };

  if (!tbl) return result;

  const rows = tbl["w:tr"];
  if (!rows) return result;

  const rowArray = Array.isArray(rows) ? rows : [rows];
  for (const row of rowArray) {
    const tableRow: TableRow = { cells: [] };

    const cells = row["w:tc"];
    if (cells) {
      const cellArray = Array.isArray(cells) ? cells : [cells];
      for (const cell of cellArray) {
        const tableCell: TableCell = {
          paragraphs: [],
          text: "",
        };

        // Extract paragraphs from cell
        const paragraphs = cell["w:p"];
        if (paragraphs) {
          const pArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
          for (const p of pArray) {
            const para = extractParagraph(p);
            tableCell.paragraphs.push(para);
          }
        }

        tableCell.text = tableCell.paragraphs.map((p) => p.text).join("\n");

        // Get cell properties
        const tcPr = cell["w:tcPr"];
        if (tcPr) {
          const gridSpan = tcPr["w:gridSpan"];
          if (gridSpan && gridSpan["@_w:val"]) {
            tableCell.colSpan = parseInt(gridSpan["@_w:val"]);
          }

          const vMerge = tcPr["w:vMerge"];
          if (vMerge) {
            // vMerge without val means continue, with val="restart" means start
            tableCell.rowSpan = vMerge["@_w:val"] === "restart" ? 1 : 0;
          }
        }

        tableRow.cells.push(tableCell);
      }
    }

    result.rows.push(tableRow);
  }

  return result;
}

/**
 * Extract content from document body
 */
function extractBody(body: any): ContentBlock[] {
  const blocks: ContentBlock[] = [];

  if (!body) return blocks;

  // Process each child element in order
  for (const key of Object.keys(body)) {
    if (key === "w:p") {
      const paragraphs = body["w:p"];
      const pArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
      for (const p of pArray) {
        blocks.push({
          type: "paragraph",
          content: extractParagraph(p),
        });
      }
    } else if (key === "w:tbl") {
      const tables = body["w:tbl"];
      const tArray = Array.isArray(tables) ? tables : [tables];
      for (const tbl of tArray) {
        blocks.push({
          type: "table",
          content: extractTable(tbl),
        });
      }
    }
  }

  return blocks;
}

// ============================================================================
// MAIN EXTRACTION FUNCTIONS
// ============================================================================

/**
 * Extract plain text from a DOCX file
 */
export async function extractText(inputPath: string): Promise<string> {
  const data = await readFile(inputPath);
  const zip = await JSZip.loadAsync(data);

  const documentFile = zip.file("word/document.xml");
  if (!documentFile) {
    throw new Error("Invalid DOCX: missing word/document.xml");
  }

  const documentXml = await documentFile.async("string");
  const parser = new XMLParser(xmlParserOptions);
  const doc = parser.parse(documentXml);

  const body = doc["w:document"]?.["w:body"];
  if (!body) {
    return "";
  }

  const blocks = extractBody(body);
  const lines: string[] = [];

  for (const block of blocks) {
    if (block.type === "paragraph") {
      const para = block.content as Paragraph;
      if (para.text) {
        lines.push(para.text);
      }
    } else if (block.type === "table") {
      const table = block.content as Table;
      for (const row of table.rows) {
        const cellTexts = row.cells.map((c) => c.text);
        lines.push(cellTexts.join("\t"));
      }
      lines.push(""); // Empty line after table
    }
  }

  return lines.join("\n");
}

/**
 * Extract structured content from a DOCX file
 */
export async function extractStructure(
  inputPath: string,
  options: ExtractOptions = {},
): Promise<DocumentStructure> {
  const { includeHeadersFooters = true, includeNotes = true } = options;

  const data = await readFile(inputPath);
  const zip = await JSZip.loadAsync(data);

  const structure: DocumentStructure = {
    body: [],
    headers: [],
    footers: [],
    footnotes: [],
    endnotes: [],
  };

  // Extract main document
  const documentFile = zip.file("word/document.xml");
  if (!documentFile) {
    throw new Error("Invalid DOCX: missing word/document.xml");
  }

  const documentXml = await documentFile.async("string");
  const parser = new XMLParser(xmlParserOptions);
  const doc = parser.parse(documentXml);

  const body = doc["w:document"]?.["w:body"];
  if (body) {
    structure.body = extractBody(body);
  }

  // Extract headers
  if (includeHeadersFooters) {
    const headerFiles = Object.keys(zip.files).filter((f) =>
      f.match(/^word\/header\d+\.xml$/),
    );
    for (const headerPath of headerFiles) {
      const headerFile = zip.file(headerPath);
      if (headerFile) {
        const headerXml = await headerFile.async("string");
        const headerDoc = parser.parse(headerXml);
        const hdr = headerDoc["w:hdr"];
        if (hdr) {
          const paragraphs: Paragraph[] = [];
          const pElements = hdr["w:p"];
          if (pElements) {
            const pArray = Array.isArray(pElements) ? pElements : [pElements];
            for (const p of pArray) {
              paragraphs.push(extractParagraph(p));
            }
          }
          structure.headers.push(paragraphs);
        }
      }
    }

    // Extract footers
    const footerFiles = Object.keys(zip.files).filter((f) =>
      f.match(/^word\/footer\d+\.xml$/),
    );
    for (const footerPath of footerFiles) {
      const footerFile = zip.file(footerPath);
      if (footerFile) {
        const footerXml = await footerFile.async("string");
        const footerDoc = parser.parse(footerXml);
        const ftr = footerDoc["w:ftr"];
        if (ftr) {
          const paragraphs: Paragraph[] = [];
          const pElements = ftr["w:p"];
          if (pElements) {
            const pArray = Array.isArray(pElements) ? pElements : [pElements];
            for (const p of pArray) {
              paragraphs.push(extractParagraph(p));
            }
          }
          structure.footers.push(paragraphs);
        }
      }
    }
  }

  // Extract footnotes
  if (includeNotes) {
    const footnotesFile = zip.file("word/footnotes.xml");
    if (footnotesFile) {
      const footnotesXml = await footnotesFile.async("string");
      const footnotesDoc = parser.parse(footnotesXml);
      const footnotes = footnotesDoc["w:footnotes"]?.["w:footnote"];
      if (footnotes) {
        const fnArray = Array.isArray(footnotes) ? footnotes : [footnotes];
        for (const fn of fnArray) {
          // Skip separator and continuation separator
          const type = fn["@_w:type"];
          if (type === "separator" || type === "continuationSeparator")
            continue;

          const paragraphs = fn["w:p"];
          if (paragraphs) {
            const pArray = Array.isArray(paragraphs)
              ? paragraphs
              : [paragraphs];
            for (const p of pArray) {
              structure.footnotes.push(extractParagraph(p));
            }
          }
        }
      }
    }

    // Extract endnotes
    const endnotesFile = zip.file("word/endnotes.xml");
    if (endnotesFile) {
      const endnotesXml = await endnotesFile.async("string");
      const endnotesDoc = parser.parse(endnotesXml);
      const endnotes = endnotesDoc["w:endnotes"]?.["w:endnote"];
      if (endnotes) {
        const enArray = Array.isArray(endnotes) ? endnotes : [endnotes];
        for (const en of enArray) {
          const type = en["@_w:type"];
          if (type === "separator" || type === "continuationSeparator")
            continue;

          const paragraphs = en["w:p"];
          if (paragraphs) {
            const pArray = Array.isArray(paragraphs)
              ? paragraphs
              : [paragraphs];
            for (const p of pArray) {
              structure.endnotes.push(extractParagraph(p));
            }
          }
        }
      }
    }
  }

  return structure;
}

/**
 * Extract content and return full result with statistics
 */
export async function extract(
  inputPath: string,
  options: ExtractOptions = {},
): Promise<ExtractionResult> {
  const structure = await extractStructure(inputPath, options);
  const text = await extractText(inputPath);

  // Count statistics
  let paragraphCount = 0;
  let tableCount = 0;

  for (const block of structure.body) {
    if (block.type === "paragraph") {
      paragraphCount++;
    } else if (block.type === "table") {
      tableCount++;
    }
  }

  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;

  return {
    text,
    structure: options.includeFormatting !== false ? structure : undefined,
    wordCount,
    paragraphCount,
    tableCount,
  };
}

/**
 * Extract content as markdown
 */
export async function extractAsMarkdown(inputPath: string): Promise<string> {
  const structure = await extractStructure(inputPath);
  const lines: string[] = [];

  for (const block of structure.body) {
    if (block.type === "paragraph") {
      const para = block.content as Paragraph;

      // Determine heading level
      let prefix = "";
      if (para.outlineLevel !== undefined && para.outlineLevel >= 0) {
        prefix = "#".repeat(para.outlineLevel + 1) + " ";
      } else if (para.style?.startsWith("Heading")) {
        const level = parseInt(para.style.replace("Heading", ""));
        if (level >= 1 && level <= 6) {
          prefix = "#".repeat(level) + " ";
        }
      }

      // Handle numbering/bullets
      if (para.numbering && !prefix) {
        const indent = "  ".repeat(para.numbering.level);
        prefix = indent + "- ";
      }

      // Format text with inline formatting
      let text = "";
      for (const run of para.runs) {
        let runText = run.text;
        if (run.bold) runText = `**${runText}**`;
        if (run.italic) runText = `*${runText}*`;
        if (run.strike) runText = `~~${runText}~~`;
        text += runText;
      }

      if (text) {
        lines.push(prefix + text);
      } else {
        lines.push(""); // Empty line
      }
    } else if (block.type === "table") {
      const table = block.content as Table;
      if (table.rows.length > 0) {
        // First row as header
        const headerRow = table.rows[0];
        const headers = headerRow.cells.map((c) =>
          c.text.replace(/\n/g, " ").trim(),
        );
        lines.push("| " + headers.join(" | ") + " |");
        lines.push("| " + headers.map(() => "---").join(" | ") + " |");

        // Data rows
        for (let i = 1; i < table.rows.length; i++) {
          const row = table.rows[i];
          const cells = row.cells.map((c) => c.text.replace(/\n/g, " ").trim());
          lines.push("| " + cells.join(" | ") + " |");
        }
        lines.push("");
      }
    }
  }

  return lines.join("\n");
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1 || args.includes("--help") || args.includes("-h")) {
    console.log(`
ContentExtractor - Extract text and structure from DOCX files

Usage:
  bun run ContentExtractor.ts <input.docx> [options]

Options:
  --text        Extract plain text only (default)
  --markdown    Extract as markdown
  --structure   Extract structured content (JSON)
  --stats       Show document statistics
  --output <f>  Write output to file instead of stdout

Examples:
  bun run ContentExtractor.ts document.docx --text
  bun run ContentExtractor.ts document.docx --markdown --output doc.md
  bun run ContentExtractor.ts document.docx --structure
`);
    process.exit(0);
  }

  const inputPath = args[0];
  const asMarkdown = args.includes("--markdown");
  const asStructure = args.includes("--structure");
  const showStats = args.includes("--stats");

  const outputIndex = args.indexOf("--output");
  const outputPath = outputIndex !== -1 ? args[outputIndex + 1] : null;

  try {
    let output: string;

    if (asMarkdown) {
      output = await extractAsMarkdown(inputPath);
    } else if (asStructure) {
      const structure = await extractStructure(inputPath);
      output = JSON.stringify(structure, null, 2);
    } else {
      output = await extractText(inputPath);
    }

    if (showStats) {
      const result = await extract(inputPath);
      console.error(`Words: ${result.wordCount}`);
      console.error(`Paragraphs: ${result.paragraphCount}`);
      console.error(`Tables: ${result.tableCount}`);
    }

    if (outputPath) {
      const { writeFile } = await import("fs/promises");
      await writeFile(outputPath, output, "utf-8");
      console.log(`Output written to ${outputPath}`);
    } else {
      console.log(output);
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
