#!/usr/bin/env bun
/**
 * MarkdownToDocx - Convert Markdown files to IC-formatted Word documents
 *
 * Usage:
 *   bun run MarkdownToDocx.ts input.md output.docx
 *   bun run MarkdownToDocx.ts input.md output.docx --spec-only  # Output JSON spec instead
 *   bun run MarkdownToDocx.ts input.md output.docx --title "Custom Title"
 *   bun run MarkdownToDocx.ts input.md output.docx --subtitle "Custom Subtitle"
 */

import { readFile, writeFile } from "fs/promises";
import { resolve, dirname, basename } from "path";
import { spawn } from "child_process";

interface TextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
}

interface ICDocumentSpec {
  version: string;
  document_type: "ic-document";
  metadata: {
    title: string;
    subtitle?: string;
    header_text?: string;
    date?: string;
  };
  content: Array<{
    type: "heading1" | "heading2" | "heading3" | "paragraph" | "bullet" | "numbered" | "blockquote" | "table";
    text: string;
    runs?: TextRun[];  // Optional: inline formatting runs
    level?: number;
    headers?: string[];   // For table type: column headers
    rows?: string[][];    // For table type: data rows
  }>;
}

interface ParsedLine {
  type: "heading1" | "heading2" | "heading3" | "heading4" | "paragraph" | "bullet" | "numbered" | "hr" | "empty" | "table" | "blockquote";
  text: string;
  level?: number;
  raw: string;
}

/**
 * Parse inline markdown formatting (bold, italic) into structured runs
 * Handles: **bold**, *italic*, ***bold italic***
 */
function parseInlineFormatting(text: string): TextRun[] {
  const runs: TextRun[] = [];

  // Regex to match **bold**, *italic*, or ***bold italic***
  // Process in order: bold-italic first, then bold, then italic
  const pattern = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    // Add any plain text before this match
    if (match.index > lastIndex) {
      const plainText = text.slice(lastIndex, match.index);
      if (plainText) {
        runs.push({ text: plainText });
      }
    }

    // Determine which group matched
    if (match[2]) {
      // ***bold italic***
      runs.push({ text: match[2], bold: true, italic: true });
    } else if (match[3]) {
      // **bold**
      runs.push({ text: match[3], bold: true });
    } else if (match[4]) {
      // *italic*
      runs.push({ text: match[4], italic: true });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add any remaining plain text
  if (lastIndex < text.length) {
    const plainText = text.slice(lastIndex);
    if (plainText) {
      runs.push({ text: plainText });
    }
  }

  // If no formatting found, return single plain run
  if (runs.length === 0) {
    runs.push({ text });
  }

  return runs;
}

/**
 * Check if text contains inline formatting markers
 */
function hasInlineFormatting(text: string): boolean {
  return /\*\*.+?\*\*|\*.+?\*/.test(text);
}

function parseLine(line: string, prevLine?: ParsedLine): ParsedLine {
  const trimmed = line.trim();

  // Empty line
  if (!trimmed) {
    return { type: "empty", text: "", raw: line };
  }

  // Horizontal rule
  if (/^[-*_]{3,}$/.test(trimmed)) {
    return { type: "hr", text: "", raw: line };
  }

  // Headings
  if (trimmed.startsWith("#### ")) {
    return { type: "heading4", text: trimmed.slice(5).trim(), raw: line };
  }
  if (trimmed.startsWith("### ")) {
    return { type: "heading3", text: trimmed.slice(4).trim(), raw: line };
  }
  if (trimmed.startsWith("## ")) {
    return { type: "heading2", text: trimmed.slice(3).trim(), raw: line };
  }
  if (trimmed.startsWith("# ")) {
    return { type: "heading1", text: trimmed.slice(2).trim(), raw: line };
  }

  // Bullet points (-, *, +)
  const bulletMatch = trimmed.match(/^[-*+]\s+(.+)$/);
  if (bulletMatch) {
    // Calculate indent level based on leading spaces
    const leadingSpaces = line.match(/^(\s*)/)?.[1].length || 0;
    const level = Math.floor(leadingSpaces / 2);
    return { type: "bullet", text: bulletMatch[1], level, raw: line };
  }

  // Numbered lists
  const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
  if (numberedMatch) {
    const leadingSpaces = line.match(/^(\s*)/)?.[1].length || 0;
    const level = Math.floor(leadingSpaces / 2);
    return { type: "numbered", text: numberedMatch[2], level, raw: line };
  }

  // Table row (starts with |)
  if (trimmed.startsWith("|")) {
    return { type: "table", text: trimmed, raw: line };
  }

  // Blockquote
  if (trimmed.startsWith("> ")) {
    return { type: "blockquote", text: trimmed.slice(2).trim(), raw: line };
  }

  // Regular paragraph
  return { type: "paragraph", text: trimmed, raw: line };
}

/**
 * Strip inline markdown formatting from text, returning plain text
 * Used for metadata fields like title and subtitle where formatting isn't rendered
 */
function stripInlineFormatting(text: string): string {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')  // ***bold italic*** -> text
    .replace(/\*\*(.+?)\*\*/g, '$1')       // **bold** -> text
    .replace(/\*(.+?)\*/g, '$1');          // *italic* -> text
}

function extractMetadata(lines: string[]): { title: string; subtitle?: string; remainingLines: string[] } {
  let title = "";
  let subtitle: string | undefined;
  let startIndex = 0;

  // Skip leading empty lines
  while (startIndex < lines.length && !lines[startIndex].trim()) {
    startIndex++;
  }

  // Look for H1 as title
  if (startIndex < lines.length && lines[startIndex].trim().startsWith("# ")) {
    title = lines[startIndex].trim().slice(2).trim();
    startIndex++;

    // Skip empty lines after title
    while (startIndex < lines.length && !lines[startIndex].trim()) {
      startIndex++;
    }

    // Check for subtitle (bold text or next non-heading paragraph before first H2)
    if (startIndex < lines.length) {
      const nextLine = lines[startIndex].trim();
      // Check for **bold** subtitle pattern
      const boldMatch = nextLine.match(/^\*\*(.+)\*\*$/);
      if (boldMatch) {
        subtitle = boldMatch[1];
        startIndex++;
      } else if (!nextLine.startsWith("#") && !nextLine.startsWith("-") && nextLine.length > 0) {
        // Use first paragraph-like line as subtitle if it's short enough
        if (nextLine.length < 200 && !nextLine.includes("---")) {
          // Strip any inline formatting from subtitle
          subtitle = stripInlineFormatting(nextLine);
          startIndex++;
        }
      }
    }
  }

  // Skip horizontal rules and empty lines after metadata
  while (startIndex < lines.length) {
    const line = lines[startIndex].trim();
    if (line === "" || /^[-*_]{3,}$/.test(line)) {
      startIndex++;
    } else {
      break;
    }
  }

  return {
    title: stripInlineFormatting(title) || "Untitled Document",
    subtitle,
    remainingLines: lines.slice(startIndex)
  };
}

function parseMarkdown(content: string): ICDocumentSpec {
  const lines = content.split("\n");
  const { title, subtitle, remainingLines } = extractMetadata(lines);

  const spec: ICDocumentSpec = {
    version: "1.0",
    document_type: "ic-document",
    metadata: {
      title,
      subtitle,
      date: new Date().getFullYear().toString()
    },
    content: []
  };

  let i = 0;
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(" ");
      const contentItem: typeof spec.content[0] = {
        type: "paragraph",
        text
      };
      // Add runs if text has inline formatting
      if (hasInlineFormatting(text)) {
        contentItem.runs = parseInlineFormatting(text);
      }
      spec.content.push(contentItem);
      currentParagraph = [];
    }
  };

  while (i < remainingLines.length) {
    const parsed = parseLine(remainingLines[i]);

    switch (parsed.type) {
      case "heading1":
        flushParagraph();
        {
          const item: typeof spec.content[0] = { type: "heading1", text: parsed.text };
          if (hasInlineFormatting(parsed.text)) {
            item.runs = parseInlineFormatting(parsed.text);
          }
          spec.content.push(item);
        }
        break;

      case "heading2":
        flushParagraph();
        {
          const item: typeof spec.content[0] = { type: "heading2", text: parsed.text };
          if (hasInlineFormatting(parsed.text)) {
            item.runs = parseInlineFormatting(parsed.text);
          }
          spec.content.push(item);
        }
        break;

      case "heading3":
      case "heading4":
        flushParagraph();
        {
          const item: typeof spec.content[0] = { type: "heading3", text: parsed.text };
          if (hasInlineFormatting(parsed.text)) {
            item.runs = parseInlineFormatting(parsed.text);
          }
          spec.content.push(item);
        }
        break;

      case "bullet":
        flushParagraph();
        {
          const item: typeof spec.content[0] = { type: "bullet", text: parsed.text, level: parsed.level };
          if (hasInlineFormatting(parsed.text)) {
            item.runs = parseInlineFormatting(parsed.text);
          }
          spec.content.push(item);
        }
        break;

      case "numbered":
        flushParagraph();
        {
          const item: typeof spec.content[0] = { type: "numbered", text: parsed.text, level: parsed.level };
          if (hasInlineFormatting(parsed.text)) {
            item.runs = parseInlineFormatting(parsed.text);
          }
          spec.content.push(item);
        }
        break;

      case "blockquote":
        flushParagraph();
        {
          const text = parsed.text;
          const item: typeof spec.content[0] = { type: "blockquote", text };
          if (hasInlineFormatting(text)) {
            item.runs = parseInlineFormatting(text);
          }
          spec.content.push(item);
        }
        break;

      case "table":
        flushParagraph();
        {
          // Collect all consecutive table rows (including the current one)
          const tableLines: string[] = [parsed.text];
          while (i + 1 < remainingLines.length) {
            const next = parseLine(remainingLines[i + 1]);
            if (next.type === "table") {
              tableLines.push(next.text);
              i++;
            } else {
              break;
            }
          }

          // Filter out separator rows (|---|---|), parse headers + data rows
          const nonSepRows = tableLines.filter(r => !/^\|[-:\s|]+\|$/.test(r));
          if (nonSepRows.length >= 1) {
            const parseRow = (row: string) => {
              const cells = row.split("|").map(c => c.trim());
              // Remove leading/trailing empty strings from split artifacts
              if (cells.length > 0 && cells[0] === "") cells.shift();
              if (cells.length > 0 && cells[cells.length - 1] === "") cells.pop();
              return cells;
            };
            const headers = parseRow(nonSepRows[0]);
            const rows = nonSepRows.slice(1).map(parseRow);
            spec.content.push({ type: "table", text: "", headers, rows });
          }
        }
        break;

      case "hr":
      case "empty":
        flushParagraph();
        break;

      case "paragraph":
        // Accumulate paragraph text (handles multi-line paragraphs)
        currentParagraph.push(parsed.text);
        break;
    }

    i++;
  }

  flushParagraph();

  return spec;
}

async function runGenerator(spec: ICDocumentSpec, outputPath: string): Promise<void> {
  const scriptDir = dirname(new URL(import.meta.url).pathname);
  const generatorPath = resolve(scriptDir, "Generate.ts");

  return new Promise((resolve, reject) => {
    const proc = spawn("bun", ["run", generatorPath, "--type", "ic-document", outputPath], {
      stdio: ["pipe", "inherit", "inherit"]
    });

    proc.stdin.write(JSON.stringify(spec));
    proc.stdin.end();

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Generator exited with code ${code}`));
      }
    });

    proc.on("error", reject);
  });
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h") || args.length < 2) {
    console.log(`
MarkdownToDocx - Convert Markdown to IC-formatted Word documents

Usage:
  bun run MarkdownToDocx.ts <input.md> <output.docx> [options]

Options:
  --spec-only       Output JSON spec to stdout instead of generating DOCX
  --title "Title"   Override document title
  --subtitle "Sub"  Override document subtitle
  --help, -h        Show this help

Examples:
  bun run MarkdownToDocx.ts report.md report.docx
  bun run MarkdownToDocx.ts report.md report.docx --title "Q4 Report"
  bun run MarkdownToDocx.ts report.md spec.json --spec-only
`);
    process.exit(args.length < 2 ? 1 : 0);
  }

  const inputPath = args[0];
  const outputPath = args[1];
  const specOnly = args.includes("--spec-only");

  // Parse optional overrides
  let titleOverride: string | undefined;
  let subtitleOverride: string | undefined;

  const titleIdx = args.indexOf("--title");
  if (titleIdx !== -1 && args[titleIdx + 1]) {
    titleOverride = args[titleIdx + 1];
  }

  const subtitleIdx = args.indexOf("--subtitle");
  if (subtitleIdx !== -1 && args[subtitleIdx + 1]) {
    subtitleOverride = args[subtitleIdx + 1];
  }

  // Read and parse markdown
  console.log(`Reading: ${inputPath}`);
  const content = await readFile(inputPath, "utf-8");
  const spec = parseMarkdown(content);

  // Apply overrides
  if (titleOverride) spec.metadata.title = titleOverride;
  if (subtitleOverride) spec.metadata.subtitle = subtitleOverride;

  if (specOnly) {
    // Output JSON spec
    console.log(JSON.stringify(spec, null, 2));
  } else {
    // Generate DOCX
    console.log(`Generating: ${outputPath}`);
    await runGenerator(spec, outputPath);
    console.log(`Done: ${outputPath}`);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
