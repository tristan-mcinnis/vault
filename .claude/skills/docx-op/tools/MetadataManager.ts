#!/usr/bin/env bun

/**
 * PAI DOCX Skill - MetadataManager.ts
 * Read and write document metadata (properties)
 *
 * Provides:
 * - Read core properties (title, author, dates, etc.)
 * - Read app properties (company, template, stats)
 * - Update core properties
 * - Read custom properties
 */

import JSZip from "jszip";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { XMLParser, XMLBuilder } from "fast-xml-parser";

// ============================================================================
// TYPES
// ============================================================================

export interface CoreProperties {
  title?: string;
  subject?: string;
  creator?: string;
  keywords?: string;
  description?: string;
  lastModifiedBy?: string;
  revision?: string;
  created?: Date;
  modified?: Date;
  category?: string;
  contentStatus?: string;
  language?: string;
}

export interface AppProperties {
  application?: string;
  appVersion?: string;
  company?: string;
  template?: string;
  manager?: string;
  totalTime?: number;
  pages?: number;
  words?: number;
  characters?: number;
  paragraphs?: number;
  lines?: number;
}

export interface CustomProperty {
  name: string;
  type: "string" | "number" | "boolean" | "date";
  value: string | number | boolean | Date;
}

export interface DocumentMetadata {
  core: CoreProperties;
  app: AppProperties;
  custom: CustomProperty[];
}

// ============================================================================
// XML PARSER OPTIONS
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
// METADATA READER
// ============================================================================

/**
 * Read document metadata from a DOCX file
 */
export async function readMetadata(
  inputPath: string,
): Promise<DocumentMetadata> {
  const data = await readFile(inputPath);
  const zip = await JSZip.loadAsync(data);

  const core = await readCoreProperties(zip);
  const app = await readAppProperties(zip);
  const custom = await readCustomProperties(zip);

  return { core, app, custom };
}

/**
 * Read core properties from docProps/core.xml
 */
async function readCoreProperties(zip: JSZip): Promise<CoreProperties> {
  const props: CoreProperties = {};

  const coreFile = zip.file("docProps/core.xml");
  if (!coreFile) return props;

  const coreXml = await coreFile.async("string");
  const parser = new XMLParser(XML_PARSER_OPTIONS);
  const parsed = parser.parse(coreXml);

  const coreProps = parsed["cp:coreProperties"];
  if (!coreProps) return props;

  // Dublin Core elements
  if (coreProps["dc:title"]) {
    props.title = extractText(coreProps["dc:title"]);
  }
  if (coreProps["dc:subject"]) {
    props.subject = extractText(coreProps["dc:subject"]);
  }
  if (coreProps["dc:creator"]) {
    props.creator = extractText(coreProps["dc:creator"]);
  }
  if (coreProps["dc:description"]) {
    props.description = extractText(coreProps["dc:description"]);
  }
  if (coreProps["dc:language"]) {
    props.language = extractText(coreProps["dc:language"]);
  }

  // Core Properties elements
  if (coreProps["cp:keywords"]) {
    props.keywords = extractText(coreProps["cp:keywords"]);
  }
  if (coreProps["cp:lastModifiedBy"]) {
    props.lastModifiedBy = extractText(coreProps["cp:lastModifiedBy"]);
  }
  if (coreProps["cp:revision"]) {
    props.revision = extractText(coreProps["cp:revision"]);
  }
  if (coreProps["cp:category"]) {
    props.category = extractText(coreProps["cp:category"]);
  }
  if (coreProps["cp:contentStatus"]) {
    props.contentStatus = extractText(coreProps["cp:contentStatus"]);
  }

  // Date elements
  if (coreProps["dcterms:created"]) {
    const dateStr = extractText(coreProps["dcterms:created"]);
    if (dateStr) props.created = new Date(dateStr);
  }
  if (coreProps["dcterms:modified"]) {
    const dateStr = extractText(coreProps["dcterms:modified"]);
    if (dateStr) props.modified = new Date(dateStr);
  }

  return props;
}

/**
 * Read app properties from docProps/app.xml
 */
async function readAppProperties(zip: JSZip): Promise<AppProperties> {
  const props: AppProperties = {};

  const appFile = zip.file("docProps/app.xml");
  if (!appFile) return props;

  const appXml = await appFile.async("string");
  const parser = new XMLParser(XML_PARSER_OPTIONS);
  const parsed = parser.parse(appXml);

  const extProps = parsed["Properties"];
  if (!extProps) return props;

  if (extProps["Application"]) {
    props.application = extractText(extProps["Application"]);
  }
  if (extProps["AppVersion"]) {
    props.appVersion = extractText(extProps["AppVersion"]);
  }
  if (extProps["Company"]) {
    props.company = extractText(extProps["Company"]);
  }
  if (extProps["Template"]) {
    props.template = extractText(extProps["Template"]);
  }
  if (extProps["Manager"]) {
    props.manager = extractText(extProps["Manager"]);
  }
  if (extProps["TotalTime"]) {
    props.totalTime = parseInt(extractText(extProps["TotalTime"]) || "0");
  }
  if (extProps["Pages"]) {
    props.pages = parseInt(extractText(extProps["Pages"]) || "0");
  }
  if (extProps["Words"]) {
    props.words = parseInt(extractText(extProps["Words"]) || "0");
  }
  if (extProps["Characters"]) {
    props.characters = parseInt(extractText(extProps["Characters"]) || "0");
  }
  if (extProps["Paragraphs"]) {
    props.paragraphs = parseInt(extractText(extProps["Paragraphs"]) || "0");
  }
  if (extProps["Lines"]) {
    props.lines = parseInt(extractText(extProps["Lines"]) || "0");
  }

  return props;
}

/**
 * Read custom properties from docProps/custom.xml
 */
async function readCustomProperties(zip: JSZip): Promise<CustomProperty[]> {
  const props: CustomProperty[] = [];

  const customFile = zip.file("docProps/custom.xml");
  if (!customFile) return props;

  const customXml = await customFile.async("string");
  const parser = new XMLParser(XML_PARSER_OPTIONS);
  const parsed = parser.parse(customXml);

  const customProps = parsed["Properties"]?.["property"];
  if (!customProps) return props;

  const propArray = Array.isArray(customProps) ? customProps : [customProps];

  for (const prop of propArray) {
    const name = prop["@_name"];
    if (!name) continue;

    let type: CustomProperty["type"] = "string";
    let value: CustomProperty["value"] = "";

    if (prop["vt:lpwstr"]) {
      type = "string";
      value = extractText(prop["vt:lpwstr"]) || "";
    } else if (prop["vt:i4"]) {
      type = "number";
      value = parseInt(extractText(prop["vt:i4"]) || "0");
    } else if (prop["vt:bool"]) {
      type = "boolean";
      value = extractText(prop["vt:bool"]) === "true";
    } else if (prop["vt:filetime"]) {
      type = "date";
      value = new Date(extractText(prop["vt:filetime"]) || "");
    }

    props.push({ name, type, value });
  }

  return props;
}

/**
 * Extract text from an element
 */
function extractText(element: any): string {
  if (!element) return "";
  if (typeof element === "string") return element;
  if (element["#text"]) return element["#text"];
  return "";
}

// ============================================================================
// METADATA WRITER
// ============================================================================

/**
 * Update document metadata
 */
export async function writeMetadata(
  inputPath: string,
  outputPath: string,
  updates: Partial<CoreProperties>,
): Promise<void> {
  const data = await readFile(inputPath);
  const zip = await JSZip.loadAsync(data);

  // Update core properties
  await updateCoreProperties(zip, updates);

  // Write the updated file
  const content = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
  });
  await writeFile(outputPath, content);
}

/**
 * Update core properties in the ZIP
 */
async function updateCoreProperties(
  zip: JSZip,
  updates: Partial<CoreProperties>,
): Promise<void> {
  const coreFile = zip.file("docProps/core.xml");

  let coreXml: string;
  if (coreFile) {
    coreXml = await coreFile.async("string");
  } else {
    // Create minimal core.xml
    coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
                   xmlns:dc="http://purl.org/dc/elements/1.1/"
                   xmlns:dcterms="http://purl.org/dc/terms/"
                   xmlns:dcmitype="http://purl.org/dc/dcmitype/"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
</cp:coreProperties>`;
  }

  const parser = new XMLParser(XML_PARSER_OPTIONS);
  const parsed = parser.parse(coreXml);

  if (!parsed["cp:coreProperties"]) {
    parsed["cp:coreProperties"] = {};
  }

  const coreProps = parsed["cp:coreProperties"];

  // Update properties
  if (updates.title !== undefined) {
    coreProps["dc:title"] = updates.title;
  }
  if (updates.subject !== undefined) {
    coreProps["dc:subject"] = updates.subject;
  }
  if (updates.creator !== undefined) {
    coreProps["dc:creator"] = updates.creator;
  }
  if (updates.description !== undefined) {
    coreProps["dc:description"] = updates.description;
  }
  if (updates.keywords !== undefined) {
    coreProps["cp:keywords"] = updates.keywords;
  }
  if (updates.lastModifiedBy !== undefined) {
    coreProps["cp:lastModifiedBy"] = updates.lastModifiedBy;
  }
  if (updates.category !== undefined) {
    coreProps["cp:category"] = updates.category;
  }
  if (updates.contentStatus !== undefined) {
    coreProps["cp:contentStatus"] = updates.contentStatus;
  }
  if (updates.language !== undefined) {
    coreProps["dc:language"] = updates.language;
  }

  // Always update modified date
  coreProps["dcterms:modified"] = {
    "@_xsi:type": "dcterms:W3CDTF",
    "#text": new Date().toISOString(),
  };

  // If revision provided, increment it
  if (updates.revision !== undefined) {
    coreProps["cp:revision"] = updates.revision;
  } else if (coreProps["cp:revision"]) {
    const currentRev = parseInt(extractText(coreProps["cp:revision"]) || "0");
    coreProps["cp:revision"] = String(currentRev + 1);
  }

  // Build updated XML
  const builder = new XMLBuilder(XML_BUILDER_OPTIONS);
  const updatedXml = builder.build(parsed);

  zip.file("docProps/core.xml", updatedXml);
}

// ============================================================================
// UNPACKED DIRECTORY FUNCTIONS
// ============================================================================

/**
 * Read metadata from an unpacked DOCX directory
 */
export async function readMetadataFromDir(
  unpackedDir: string,
): Promise<DocumentMetadata> {
  const core = await readCorePropertiesFromDir(unpackedDir);
  const app = await readAppPropertiesFromDir(unpackedDir);
  const custom = await readCustomPropertiesFromDir(unpackedDir);

  return { core, app, custom };
}

async function readCorePropertiesFromDir(
  unpackedDir: string,
): Promise<CoreProperties> {
  const props: CoreProperties = {};

  try {
    const coreXml = await readFile(
      join(unpackedDir, "docProps", "core.xml"),
      "utf-8",
    );
    const parser = new XMLParser(XML_PARSER_OPTIONS);
    const parsed = parser.parse(coreXml);

    const coreProps = parsed["cp:coreProperties"];
    if (!coreProps) return props;

    if (coreProps["dc:title"]) props.title = extractText(coreProps["dc:title"]);
    if (coreProps["dc:subject"])
      props.subject = extractText(coreProps["dc:subject"]);
    if (coreProps["dc:creator"])
      props.creator = extractText(coreProps["dc:creator"]);
    if (coreProps["dc:description"])
      props.description = extractText(coreProps["dc:description"]);
    if (coreProps["cp:keywords"])
      props.keywords = extractText(coreProps["cp:keywords"]);
    if (coreProps["cp:lastModifiedBy"])
      props.lastModifiedBy = extractText(coreProps["cp:lastModifiedBy"]);
    if (coreProps["cp:revision"])
      props.revision = extractText(coreProps["cp:revision"]);
    if (coreProps["cp:category"])
      props.category = extractText(coreProps["cp:category"]);
    if (coreProps["dcterms:created"]) {
      const dateStr = extractText(coreProps["dcterms:created"]);
      if (dateStr) props.created = new Date(dateStr);
    }
    if (coreProps["dcterms:modified"]) {
      const dateStr = extractText(coreProps["dcterms:modified"]);
      if (dateStr) props.modified = new Date(dateStr);
    }
  } catch {
    // No core.xml
  }

  return props;
}

async function readAppPropertiesFromDir(
  unpackedDir: string,
): Promise<AppProperties> {
  const props: AppProperties = {};

  try {
    const appXml = await readFile(
      join(unpackedDir, "docProps", "app.xml"),
      "utf-8",
    );
    const parser = new XMLParser(XML_PARSER_OPTIONS);
    const parsed = parser.parse(appXml);

    const extProps = parsed["Properties"];
    if (!extProps) return props;

    if (extProps["Application"])
      props.application = extractText(extProps["Application"]);
    if (extProps["AppVersion"])
      props.appVersion = extractText(extProps["AppVersion"]);
    if (extProps["Company"]) props.company = extractText(extProps["Company"]);
    if (extProps["Template"])
      props.template = extractText(extProps["Template"]);
    if (extProps["Pages"])
      props.pages = parseInt(extractText(extProps["Pages"]) || "0");
    if (extProps["Words"])
      props.words = parseInt(extractText(extProps["Words"]) || "0");
    if (extProps["Characters"])
      props.characters = parseInt(extractText(extProps["Characters"]) || "0");
  } catch {
    // No app.xml
  }

  return props;
}

async function readCustomPropertiesFromDir(
  unpackedDir: string,
): Promise<CustomProperty[]> {
  const props: CustomProperty[] = [];

  try {
    const customXml = await readFile(
      join(unpackedDir, "docProps", "custom.xml"),
      "utf-8",
    );
    const parser = new XMLParser(XML_PARSER_OPTIONS);
    const parsed = parser.parse(customXml);

    const customProps = parsed["Properties"]?.["property"];
    if (!customProps) return props;

    const propArray = Array.isArray(customProps) ? customProps : [customProps];

    for (const prop of propArray) {
      const name = prop["@_name"];
      if (!name) continue;

      let type: CustomProperty["type"] = "string";
      let value: CustomProperty["value"] = "";

      if (prop["vt:lpwstr"]) {
        type = "string";
        value = extractText(prop["vt:lpwstr"]) || "";
      } else if (prop["vt:i4"]) {
        type = "number";
        value = parseInt(extractText(prop["vt:i4"]) || "0");
      } else if (prop["vt:bool"]) {
        type = "boolean";
        value = extractText(prop["vt:bool"]) === "true";
      }

      props.push({ name, type, value });
    }
  } catch {
    // No custom.xml
  }

  return props;
}

/**
 * Update metadata in an unpacked directory
 */
export async function updateMetadataInDir(
  unpackedDir: string,
  updates: Partial<CoreProperties>,
): Promise<void> {
  const corePath = join(unpackedDir, "docProps", "core.xml");

  let coreXml: string;
  try {
    coreXml = await readFile(corePath, "utf-8");
  } catch {
    coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
                   xmlns:dc="http://purl.org/dc/elements/1.1/"
                   xmlns:dcterms="http://purl.org/dc/terms/"
                   xmlns:dcmitype="http://purl.org/dc/dcmitype/"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
</cp:coreProperties>`;
  }

  const parser = new XMLParser(XML_PARSER_OPTIONS);
  const parsed = parser.parse(coreXml);

  if (!parsed["cp:coreProperties"]) {
    parsed["cp:coreProperties"] = {};
  }

  const coreProps = parsed["cp:coreProperties"];

  // Update properties
  if (updates.title !== undefined) coreProps["dc:title"] = updates.title;
  if (updates.subject !== undefined) coreProps["dc:subject"] = updates.subject;
  if (updates.creator !== undefined) coreProps["dc:creator"] = updates.creator;
  if (updates.description !== undefined)
    coreProps["dc:description"] = updates.description;
  if (updates.keywords !== undefined)
    coreProps["cp:keywords"] = updates.keywords;
  if (updates.lastModifiedBy !== undefined)
    coreProps["cp:lastModifiedBy"] = updates.lastModifiedBy;
  if (updates.category !== undefined)
    coreProps["cp:category"] = updates.category;

  // Update modified date
  coreProps["dcterms:modified"] = {
    "@_xsi:type": "dcterms:W3CDTF",
    "#text": new Date().toISOString(),
  };

  const builder = new XMLBuilder(XML_BUILDER_OPTIONS);
  const updatedXml = builder.build(parsed);

  await writeFile(corePath, updatedXml, "utf-8");
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1 || args.includes("--help") || args.includes("-h")) {
    console.log(`
MetadataManager - Read and update DOCX document properties

Usage:
  bun run MetadataManager.ts read <input.docx>
  bun run MetadataManager.ts update <input.docx> <output.docx> [--title "..."] [--author "..."]
  bun run MetadataManager.ts read-dir <unpacked-dir>
  bun run MetadataManager.ts update-dir <unpacked-dir> [--title "..."]

Commands:
  read        Read metadata from a DOCX file
  update      Update metadata and save to new file
  read-dir    Read metadata from unpacked directory
  update-dir  Update metadata in unpacked directory

Options:
  --title <text>       Set document title
  --subject <text>     Set document subject
  --author <text>      Set document author
  --keywords <text>    Set document keywords
  --category <text>    Set document category

Examples:
  bun run MetadataManager.ts read document.docx
  bun run MetadataManager.ts update doc.docx out.docx --title "My Document" --author "John"
`);
    process.exit(0);
  }

  const command = args[0];

  try {
    switch (command) {
      case "read": {
        const inputPath = args[1];
        if (!inputPath) {
          console.error("Error: Missing input file");
          process.exit(1);
        }

        const metadata = await readMetadata(inputPath);

        console.log("Core Properties:");
        console.log(JSON.stringify(metadata.core, null, 2));
        console.log("\nApp Properties:");
        console.log(JSON.stringify(metadata.app, null, 2));
        if (metadata.custom.length > 0) {
          console.log("\nCustom Properties:");
          console.log(JSON.stringify(metadata.custom, null, 2));
        }
        break;
      }
      case "update": {
        const inputPath = args[1];
        const outputPath = args[2];
        if (!inputPath || !outputPath) {
          console.error("Error: Missing input or output file");
          process.exit(1);
        }

        const updates: Partial<CoreProperties> = {};

        for (let i = 3; i < args.length; i++) {
          const arg = args[i];
          const value = args[i + 1];
          if (arg === "--title") {
            updates.title = value;
            i++;
          } else if (arg === "--subject") {
            updates.subject = value;
            i++;
          } else if (arg === "--author") {
            updates.creator = value;
            i++;
          } else if (arg === "--keywords") {
            updates.keywords = value;
            i++;
          } else if (arg === "--category") {
            updates.category = value;
            i++;
          }
        }

        await writeMetadata(inputPath, outputPath, updates);
        console.log(`Updated metadata and saved to ${outputPath}`);
        break;
      }
      case "read-dir": {
        const unpackedDir = args[1];
        if (!unpackedDir) {
          console.error("Error: Missing unpacked directory");
          process.exit(1);
        }

        const metadata = await readMetadataFromDir(unpackedDir);
        console.log("Core Properties:");
        console.log(JSON.stringify(metadata.core, null, 2));
        console.log("\nApp Properties:");
        console.log(JSON.stringify(metadata.app, null, 2));
        break;
      }
      case "update-dir": {
        const unpackedDir = args[1];
        if (!unpackedDir) {
          console.error("Error: Missing unpacked directory");
          process.exit(1);
        }

        const updates: Partial<CoreProperties> = {};

        for (let i = 2; i < args.length; i++) {
          const arg = args[i];
          const value = args[i + 1];
          if (arg === "--title") {
            updates.title = value;
            i++;
          } else if (arg === "--subject") {
            updates.subject = value;
            i++;
          } else if (arg === "--author") {
            updates.creator = value;
            i++;
          } else if (arg === "--keywords") {
            updates.keywords = value;
            i++;
          }
        }

        await updateMetadataInDir(unpackedDir, updates);
        console.log("Updated metadata in directory");
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
