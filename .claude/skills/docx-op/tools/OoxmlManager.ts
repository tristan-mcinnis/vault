#!/usr/bin/env bun

/**
 * PAI DOCX Skill - OoxmlManager.ts
 * Pack/unpack OOXML files (DOCX, PPTX, XLSX)
 *
 * Provides:
 * - Unpack OOXML to directory with pretty-printed XML
 * - Pack directory back to OOXML with condensed XML
 * - RSID generation for tracked changes sessions
 * - Validation via LibreOffice conversion
 */

import JSZip from "jszip";
import { readFile, writeFile, mkdir, readdir, stat } from "fs/promises";
import { join, relative, extname, dirname } from "path";
import { existsSync } from "fs";
import { XMLParser, XMLBuilder } from "fast-xml-parser";

// ============================================================================
// TYPES
// ============================================================================

export interface UnpackOptions {
  /** Pretty-print XML with indentation */
  prettyPrint?: boolean;
  /** Indentation string (default: 2 spaces) */
  indent?: string;
  /** Generate RSID suggestion for tracked changes */
  generateRsid?: boolean;
}

export interface PackOptions {
  /** Condense XML by removing whitespace */
  condenseXml?: boolean;
  /** Validate output with LibreOffice */
  validate?: boolean;
  /** Force pack even if validation fails */
  force?: boolean;
}

export interface UnpackResult {
  outputDir: string;
  fileCount: number;
  rsid?: string;
  files: string[];
}

export interface PackResult {
  outputPath: string;
  fileCount: number;
  validated: boolean;
  validationError?: string;
}

// ============================================================================
// RSID GENERATION
// ============================================================================

/**
 * Generate an 8-character hexadecimal RSID for tracked changes
 * RSIDs identify editing sessions in OOXML documents
 */
export function generateRsid(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

// ============================================================================
// XML FORMATTING
// ============================================================================

const xmlParserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  preserveOrder: true,
  commentPropName: "#comment",
  cdataPropName: "#cdata",
  textNodeName: "#text",
  trimValues: false,
  parseTagValue: false,
  parseAttributeValue: false,
  // Security: Disable entity processing to prevent XXE attacks
  processEntities: false,
};

const xmlBuilderOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  preserveOrder: true,
  commentPropName: "#comment",
  cdataPropName: "#cdata",
  textNodeName: "#text",
  format: true,
  indentBy: "  ",
  suppressEmptyNode: false,
  suppressBooleanAttributes: false,
};

/**
 * Pretty-print XML content with proper indentation
 */
export function prettyPrintXml(xml: string, indent: string = "  "): string {
  try {
    const parser = new XMLParser(xmlParserOptions);
    const parsed = parser.parse(xml);

    const builder = new XMLBuilder({
      ...xmlBuilderOptions,
      indentBy: indent,
    });

    let result = builder.build(parsed);

    // Ensure XML declaration is on its own line
    result = result.replace(/(<\?xml[^?]*\?>)\s*/, "$1\n");

    return result;
  } catch (error) {
    // If parsing fails, return original
    console.warn("XML parsing failed, returning original:", error);
    return xml;
  }
}

/**
 * Condense XML by removing unnecessary whitespace
 * Preserves whitespace in text nodes (elements ending with :t)
 */
export function condenseXml(xml: string): string {
  try {
    const parser = new XMLParser(xmlParserOptions);
    const parsed = parser.parse(xml);

    const builder = new XMLBuilder({
      ...xmlBuilderOptions,
      format: false,
    });

    return builder.build(parsed);
  } catch (error) {
    // If parsing fails, do basic whitespace removal
    console.warn("XML parsing failed, using basic condensing:", error);
    return xml.replace(/>\s+</g, "><").replace(/\n\s*/g, "");
  }
}

// ============================================================================
// UNPACK
// ============================================================================

/**
 * Unpack an OOXML file to a directory
 */
export async function unpack(
  inputPath: string,
  outputDir: string,
  options: UnpackOptions = {},
): Promise<UnpackResult> {
  const {
    prettyPrint = true,
    indent = "  ",
    generateRsid: shouldGenerateRsid = true,
  } = options;

  // Read the OOXML file
  const data = await readFile(inputPath);
  const zip = await JSZip.loadAsync(data);

  // Create output directory
  await mkdir(outputDir, { recursive: true });

  const files: string[] = [];

  // Extract all files
  for (const [path, file] of Object.entries(zip.files)) {
    if (file.dir) {
      await mkdir(join(outputDir, path), { recursive: true });
      continue;
    }

    const content = await file.async("nodebuffer");
    const outputPath = join(outputDir, path);

    // Ensure parent directory exists
    await mkdir(dirname(outputPath), { recursive: true });

    // Check if this is an XML or rels file
    const ext = extname(path).toLowerCase();
    if (prettyPrint && (ext === ".xml" || ext === ".rels")) {
      const xmlContent = content.toString("utf-8");
      const formatted = prettyPrintXml(xmlContent, indent);
      await writeFile(outputPath, formatted, "utf-8");
    } else {
      await writeFile(outputPath, content);
    }

    files.push(path);
  }

  const result: UnpackResult = {
    outputDir,
    fileCount: files.length,
    files,
  };

  // Generate RSID if requested
  if (shouldGenerateRsid) {
    result.rsid = generateRsid();
  }

  return result;
}

// ============================================================================
// PACK
// ============================================================================

/**
 * Recursively get all files in a directory
 */
async function getAllFiles(
  dir: string,
  baseDir: string = dir,
): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllFiles(fullPath, baseDir)));
    } else {
      files.push(relative(baseDir, fullPath));
    }
  }

  return files;
}

/**
 * Pack a directory back to an OOXML file
 */
export async function pack(
  inputDir: string,
  outputPath: string,
  options: PackOptions = {},
): Promise<PackResult> {
  const {
    condenseXml: shouldCondense = true,
    validate = false,
    force = false,
  } = options;

  const zip = new JSZip();

  // Get all files in the directory
  const files = await getAllFiles(inputDir);

  // Add each file to the ZIP
  for (const file of files) {
    const filePath = join(inputDir, file);
    const content = await readFile(filePath);

    // Check if this is an XML or rels file
    const ext = extname(file).toLowerCase();
    if (shouldCondense && (ext === ".xml" || ext === ".rels")) {
      const xmlContent = content.toString("utf-8");
      const condensed = condenseXml(xmlContent);
      zip.file(file, condensed);
    } else {
      zip.file(file, content);
    }
  }

  // Generate the OOXML file
  const zipContent = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });

  await writeFile(outputPath, zipContent);

  const result: PackResult = {
    outputPath,
    fileCount: files.length,
    validated: false,
  };

  // Validate if requested
  if (validate) {
    try {
      const validationResult = await validateWithLibreOffice(outputPath);
      result.validated = validationResult.valid;
      if (!validationResult.valid) {
        result.validationError = validationResult.error;
        if (!force) {
          // Delete the invalid file
          const { unlink } = await import("fs/promises");
          await unlink(outputPath);
          throw new Error(`Validation failed: ${validationResult.error}`);
        }
      }
    } catch (error) {
      if (!force) throw error;
      result.validationError = String(error);
    }
  }

  return result;
}

// ============================================================================
// VALIDATION
// ============================================================================

interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate OOXML file by attempting to convert with LibreOffice
 */
async function validateWithLibreOffice(
  filePath: string,
): Promise<ValidationResult> {
  const { exec } = await import("child_process");
  const { promisify } = await import("util");
  const { mkdtemp, rm } = await import("fs/promises");
  const { tmpdir } = await import("os");

  const execAsync = promisify(exec);

  // Determine filter based on file type
  const ext = extname(filePath).toLowerCase();
  let filter: string;
  switch (ext) {
    case ".docx":
      filter = "HTML:XHTML Writer File:UTF8";
      break;
    case ".pptx":
      filter = "impress_html_Export";
      break;
    case ".xlsx":
      filter = "HTML (StarCalc)";
      break;
    default:
      return { valid: false, error: `Unsupported file type: ${ext}` };
  }

  // Create temp directory for output
  const tempDir = await mkdtemp(join(tmpdir(), "ooxml-validate-"));

  try {
    await execAsync(
      `soffice --headless --convert-to html:"${filter}" --outdir "${tempDir}" "${filePath}"`,
      { timeout: 30000 },
    );
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    // Cleanup temp directory
    await rm(tempDir, { recursive: true, force: true });
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a path is a valid OOXML file
 */
export function isOoxmlFile(path: string): boolean {
  const ext = extname(path).toLowerCase();
  return [".docx", ".pptx", ".xlsx"].includes(ext);
}

/**
 * Get the document type from file extension
 */
export function getDocumentType(
  path: string,
): "word" | "powerpoint" | "excel" | null {
  const ext = extname(path).toLowerCase();
  switch (ext) {
    case ".docx":
      return "word";
    case ".pptx":
      return "powerpoint";
    case ".xlsx":
      return "excel";
    default:
      return null;
  }
}

/**
 * Get the main document XML path for a document type
 */
export function getMainDocumentPath(
  type: "word" | "powerpoint" | "excel",
): string {
  switch (type) {
    case "word":
      return "word/document.xml";
    case "powerpoint":
      return "ppt/presentation.xml";
    case "excel":
      return "xl/workbook.xml";
  }
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2 || args.includes("--help") || args.includes("-h")) {
    console.log(`
OoxmlManager - Pack/unpack OOXML files

Usage:
  bun run OoxmlManager.ts unpack <input.docx> <output-dir> [options]
  bun run OoxmlManager.ts pack <input-dir> <output.docx> [options]

Commands:
  unpack    Extract OOXML to directory with formatted XML
  pack      Compress directory back to OOXML

Options:
  --no-format     Don't format XML when unpacking
  --no-condense   Don't condense XML when packing
  --validate      Validate output with LibreOffice
  --force         Pack even if validation fails
  --indent <str>  Indentation string (default: 2 spaces)

Examples:
  bun run OoxmlManager.ts unpack document.docx ./unpacked
  bun run OoxmlManager.ts pack ./unpacked document-edited.docx --validate
`);
    process.exit(0);
  }

  const command = args[0];
  const input = args[1];
  const output = args[2];

  if (!command || !input || !output) {
    console.error("Error: Missing required arguments");
    process.exit(1);
  }

  const noFormat = args.includes("--no-format");
  const noCondense = args.includes("--no-condense");
  const validate = args.includes("--validate");
  const force = args.includes("--force");

  const indentIndex = args.indexOf("--indent");
  const indent = indentIndex !== -1 ? args[indentIndex + 1] : "  ";

  try {
    if (command === "unpack") {
      if (!existsSync(input)) {
        console.error(`Error: Input file not found: ${input}`);
        process.exit(1);
      }

      console.log(`Unpacking ${input} to ${output}...`);
      const result = await unpack(input, output, {
        prettyPrint: !noFormat,
        indent,
        generateRsid: true,
      });

      console.log(`Extracted ${result.fileCount} files`);
      if (result.rsid) {
        console.log(`Suggested RSID for tracked changes: ${result.rsid}`);
      }
    } else if (command === "pack") {
      if (!existsSync(input)) {
        console.error(`Error: Input directory not found: ${input}`);
        process.exit(1);
      }

      console.log(`Packing ${input} to ${output}...`);
      const result = await pack(input, output, {
        condenseXml: !noCondense,
        validate,
        force,
      });

      console.log(`Packed ${result.fileCount} files`);
      if (validate) {
        if (result.validated) {
          console.log("Validation: PASSED");
        } else {
          console.log(`Validation: FAILED - ${result.validationError}`);
        }
      }
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
