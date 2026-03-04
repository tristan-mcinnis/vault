#!/usr/bin/env bun

/**
 * PAI DOCX Skill - Generate.ts
 * Generate Word documents from JSON specifications using IC template styles
 *
 * Usage:
 *   cat spec.json | bun run Generate.ts --type screener output.docx
 *   bun run Generate.ts --type screener --input spec.json output.docx
 *
 * IMPORTANT: All documents use styles from the IC template:
 *   .claude/skills/dg-spec/assets/ic-dg-template.docx
 *
 * Available styles from template:
 *   - Title, Heading1, Heading2, Heading3, Heading4
 *   - Normal, ListParagraph
 *   - ModeratorNote, Probe, Strong1
 *   - Header, Footer
 */

import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  VerticalAlign,
  TableLayoutType,
  Header,
  Footer,
  ImageRun,
  PageNumber,
  convertInchesToTwip,
  TabStopType,
  LevelFormat,
  ShadingType,
  PageBreak,
  HeadingLevel,
} from "docx";
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { resolve, dirname } from "path";
import { Packer } from "docx";
import JSZip from "jszip";

// ============================================================================
// TEMPLATE STYLES
// ============================================================================

// Style IDs from ic-dg-template.docx - use these instead of inline formatting
const STYLES = {
  title: "Title",
  heading1: "Heading1",
  heading2: "Heading2",
  heading3: "Heading3",
  heading4: "Heading4",
  normal: "Normal",
  listParagraph: "ListParagraph",
  moderatorNote: "ModeratorNote",
  probe: "Probe",
  strong: "Strong1",
  header: "Header",
  footer: "Footer",
};

// Path to IC template (relative to this file)
const TEMPLATE_PATHS = [
  resolve(dirname(import.meta.path), "../assets/ic-template.docx"),
  resolve(dirname(import.meta.path), "../../dg-spec/assets/ic-dg-template.docx"), // legacy fallback
];

// Cache for loaded template styles and numbering
let cachedExternalStyles: string | null = null;
let cachedTemplateNumberingXml: string | null = null;

/**
 * Load external styles from the IC template document
 * The template contains all IC brand styles (Title, Heading1-4, ModeratorNote, Probe, etc.)
 */
async function loadTemplateStyles(): Promise<string> {
  if (cachedExternalStyles) {
    return cachedExternalStyles;
  }

  let templatePath: string | null = null;
  for (const path of TEMPLATE_PATHS) {
    if (existsSync(path)) {
      templatePath = path;
      break;
    }
  }

  if (!templatePath) {
    console.warn("Warning: IC template not found, using default styles");
    return "";
  }

  try {
    const templateData = await readFile(templatePath);
    const zip = await JSZip.loadAsync(templateData);
    const stylesXml = await zip.file("word/styles.xml")?.async("string");

    if (stylesXml) {
      cachedExternalStyles = stylesXml;
      // Also cache numbering.xml from template
      const numberingXml = await zip.file("word/numbering.xml")?.async("string");
      if (numberingXml) {
        cachedTemplateNumberingXml = numberingXml;
      }
      return stylesXml;
    }
  } catch (error) {
    console.warn("Warning: Failed to load template styles:", error);
  }

  return "";
}

// ============================================================================
// TYPES
// ============================================================================

// Transcript specification
interface TranscriptSpec {
  version: string;
  document_type: "transcript";
  metadata: {
    title: string;
    expert?: string;
    date?: string;
    duration?: string;
    market?: string;
    project?: string;
    language?: string;
  };
  paragraphs: Array<{
    text: string;
    type: "speaker" | "content" | "timestamp" | "annotation";
    speaker?: string;
  }>;
}

// Takeaway specification
interface TakeawaySpec {
  version: string;
  document_type: "takeaway";
  metadata: {
    title: string;
    expert?: string;
    role?: string;
    date?: string;
    project?: string;
  };
  sections: Array<{
    heading: string;
    level: 1 | 2 | 3;
    content?: string;
    bullets?: string[];
  }>;
}

// Inline text run with optional formatting
interface InlineTextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
}

// Generic IC document specification
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
    runs?: InlineTextRun[];  // Optional: inline formatting runs
    level?: number;
    headers?: string[];   // For table type: column headers
    rows?: string[][];    // For table type: data rows
  }>;
}

// Discussion Guide specification
interface DGProbe {
  text: string;
  text_zh?: string;
}

interface DGQuestion {
  id: string;
  text: string;
  text_zh?: string;
  label?: string;
  probes?: (DGProbe | string)[];  // Can be objects or strings
  moderator_note?: string;
}

// Helper to normalize probe - handles both string and object probes
function normalizeProbe(probe: DGProbe | string): { text: string; text_zh?: string } {
  if (typeof probe === 'string') {
    // String probes may contain bilingual text separated by newline
    const parts = probe.split('\n');
    if (parts.length > 1) {
      return { text: parts[0].trim(), text_zh: parts.slice(1).join('\n').trim() };
    }
    return { text: probe };
  }
  return probe;
}

// Helper to split bilingual text that may contain both languages inline
function splitBilingualText(text: string, textZh?: string): { en: string; zh?: string } {
  if (textZh) {
    // Already separated
    return { en: text, zh: textZh };
  }
  // Check if text contains both languages (split by newline)
  const parts = text.split('\n');
  if (parts.length > 1) {
    // Assume first part is English, rest is Chinese
    return { en: parts[0].trim(), zh: parts.slice(1).join('\n').trim() };
  }
  return { en: text };
}

interface DGExercise {
  id: string;
  title: string;
  time_minutes?: number;
  stimulus?: string;
  say_block?: string;
  say_block_zh?: string;
  questions?: DGQuestion[];
}

interface DGTopic {
  id: string;
  title: string;
  time_minutes?: number;
  exercises?: DGExercise[];
}

interface DGPart {
  id: string;
  title: string;
  time_minutes?: number;
  group_filter?: string;
  stimulus?: string;
  moderator_note?: string;
  questions?: DGQuestion[];
  topics?: DGTopic[];
  exercises?: DGExercise[];
}

interface DGSection {
  id: string;
  title: string;
  time_minutes: number;
  objective?: string;
  stimulus?: string;
  say_text?: string;
  say_text_zh?: string;
  moderator_note?: string;
  questions?: DGQuestion[];
  parts?: DGPart[];
}

interface DiscussionGuideSpec {
  version: string;
  document_type: "discussion_guide";
  front_matter: {
    title: string;
    title_zh?: string;
    audience: string;
    fieldwork: string;
    target_groups: string[];
    cohort_definition?: string;
    research_tensions?: string[];
    pre_task_notes?: string[];
    stimulus_available?: string[];
  };
  key_principles?: Array<{
    principle: string;
    description: string;
  }>;
  sections: DGSection[];
  closing?: {
    text: string;
    text_zh?: string;
  };
}

interface ScreenerSpec {
  version: string;
  document_type: string;
  overview: {
    project: string;
    project_zh?: string;
    cities?: string[];
    format: string;
    sessions?: string;
    target: string;
    target_zh?: string;
    fieldwork: string;
    total_respondents?: number;
    client?: string;
  };
  cohorts: Array<{
    id: string;
    name: string;
    name_zh?: string;
    definition: string;
    definition_zh?: string;
    sessions?: string[];
    target_n?: string;
  }>;
  recruitment_notes: string[];
  questions: Array<{
    id: string;
    topic: string;
    topic_zh?: string;
    multi_answer: boolean;
    condition?: string;
    question: { en: string; zh: string };
    options: Array<{
      text: { en: string; zh: string };
      code: number;
      action: string;
    }>;
    quota_note?: string;
    requirement_note?: string;
    cohort_logic?: string;
    cohort_assignment?: string;
  }>;
  quality_check: {
    criteria: Array<{
      dimension: string;
      dimension_zh?: string;
      pass: string;
      pass_zh?: string;
      fail: string;
      fail_zh?: string;
    }>;
    test_question: { en: string; zh: string };
    pass_criteria?: { en: string; zh: string };
    fail_criteria?: { en: string; zh: string };
  };
  invitation: {
    script: { en: string; zh: string };
    options: Array<{
      text: { en: string; zh: string };
      code: number;
      action: string;
    }>;
    confirmation_note?: { en: string; zh: string };
  };
  quick_reference: {
    termination_criteria: Array<{ question: string; condition: string }>;
    cohort_assignment: Array<{ condition: string; assign_to: string }>;
    mix_requirements: Array<{ dimension: string; requirement: string }>;
  };
  recruitment_quota: {
    total: number;
    notes: string[];
    groups: Array<{
      location?: string;
      format?: string;
      session?: string;
      group?: string;
      cohort: string;
      target: number;
      recruit?: number;
    }>;
    schedule?: Record<string, unknown>;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
  black: "000000",
  gray: "999999",
  navyLine: "0A1F44",
  headerFill: "F2F2F2",
  bodyText: "262626",
};

const FONT = "Aptos";
const FONT_DISPLAY = "Aptos Display";

// IC Template Constants
const IC_COLORS = {
  heading: "000000",
  body: "262626",
  gray: "666666",
};

const IC_SIZES = {
  title: 32,
  h1: 28,
  h2: 24,
  h3: 20,
  body: 22,
  small: 18,
};

const WIDTHS = {
  total: 9360,
  twoCol: [2800, 6560],
  threeCol: [5800, 1000, 2560],
  fourCol: [2340, 2340, 2340, 2340],
  qualityCheck: [2500, 3430, 3430],
};

// Discussion Guide specific constants
const DG_COLORS = {
  nero: "000000",        // Primary text, titles
  darkGray: "262626",    // Subtitle, probes, parts
  moonGray: "999999",    // Header/footer, mod notes, time
  navy: "0A1F44",        // Section borders
  cream: "F5F0E6",       // Stimulus box background
  borderGray: "CCCCCC",  // Stimulus box border
};

const DG_SIZES = {
  title: 32,             // 16pt
  sectionHeader: 26,     // 13pt
  partHeader: 22,        // 11pt
  topicHeader: 20,       // 10pt
  exerciseTitle: 19,     // 9.5pt
  body: 18,              // 9pt
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createHeaderCell(text: string, width?: number): TableCell {
  return new TableCell({
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    shading: { fill: COLORS.headerFill },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({
            text,
            font: FONT,
            size: 18,
            bold: true,
          }),
        ],
      }),
    ],
  });
}

function createCell(text: string, width?: number): TableCell {
  return new TableCell({
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({
            text,
            font: FONT,
            size: 18,
          }),
        ],
      }),
    ],
  });
}

function createSectionHeader(text: string): Paragraph[] {
  return [
    new Paragraph({
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: text.toUpperCase(),
          font: FONT,
          size: 26,
          bold: true,
          color: COLORS.black,
        }),
      ],
    }),
    new Paragraph({
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 8,
          color: COLORS.navyLine,
        },
      },
      spacing: { after: 200 },
    }),
  ];
}

function createSubsectionHeader(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 120 },
    children: [
      new TextRun({
        text,
        font: FONT,
        size: 20,
        bold: true,
        color: COLORS.black,
      }),
    ],
  });
}

function createQuestionHeader(id: string, topic: string, topicZh?: string): Paragraph {
  const label = topicZh ? `${id}. ${topic} ${topicZh}` : `${id}. ${topic}`;
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 280, after: 120 },
    children: [
      new TextRun({
        text: label,
        font: FONT,
        size: 20,
        bold: true,
        color: COLORS.black,
      }),
    ],
  });
}

function createBilingualText(en: string, zh: string): string {
  return `${en} ${zh}`;
}

function createTable(
  headers: string[],
  rows: string[][],
  widths: number[]
): Table {
  const borderStyle = {
    style: BorderStyle.SINGLE,
    size: 4,
    color: "auto",
  };

  return new Table({
    width: { size: WIDTHS.total, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    borders: {
      top: borderStyle,
      bottom: borderStyle,
      left: borderStyle,
      right: borderStyle,
      insideHorizontal: borderStyle,
      insideVertical: borderStyle,
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => createHeaderCell(h, widths[i])),
      }),
      ...rows.map(
        (row) =>
          new TableRow({
            children: row.map((cell, i) => createCell(cell, widths[i])),
          })
      ),
    ],
  });
}

function createBulletList(items: string[]): Paragraph[] {
  return items.map(
    (item) =>
      new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 40, after: 40 },
        children: [
          new TextRun({
            text: item,
            font: FONT,
            size: 18,
          }),
        ],
      })
  );
}

function createNote(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 80, after: 120 },
    children: [
      new TextRun({
        text,
        font: FONT,
        size: 18,
        color: COLORS.bodyText,
      }),
    ],
  });
}

// ============================================================================
// IC TEMPLATE HELPERS
// ============================================================================

async function loadICLogo(): Promise<Buffer | null> {
  // Try multiple locations for the logo
  const logoPaths = [
    resolve(dirname(import.meta.path), "../../transcript-op/assets/ic-logo.png"),
    resolve(dirname(import.meta.path), "../../screener-spec/assets/ic-logo.png"),
    resolve(dirname(import.meta.path), "../../dg-spec/assets/ic-logo.png"),
    resolve(dirname(import.meta.path), "../assets/ic-logo.png"),
  ];

  for (const logoPath of logoPaths) {
    if (existsSync(logoPath)) {
      return await readFile(logoPath);
    }
  }
  return null;
}

function createICHeader(logoData: Buffer | null, headerText?: string): Header {
  const children: Paragraph[] = [];

  if (logoData) {
    children.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: logoData,
            transformation: { width: 130, height: 24 },
            type: "png",
          }),
        ],
      })
    );
  }

  if (headerText) {
    children.push(
      new Paragraph({
        spacing: { before: 60 },
        children: [
          new TextRun({
            text: headerText,
            font: FONT,
            size: IC_SIZES.small,
            color: IC_COLORS.gray,
          }),
        ],
      })
    );
  }

  return new Header({ children });
}

function createICFooter(): Footer {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "Page ",
            font: FONT,
            size: IC_SIZES.small,
            color: IC_COLORS.gray,
          }),
          new TextRun({
            children: [PageNumber.CURRENT],
            font: FONT,
            size: IC_SIZES.small,
            color: IC_COLORS.gray,
          }),
          new TextRun({
            text: " of ",
            font: FONT,
            size: IC_SIZES.small,
            color: IC_COLORS.gray,
          }),
          new TextRun({
            children: [PageNumber.TOTAL_PAGES],
            font: FONT,
            size: IC_SIZES.small,
            color: IC_COLORS.gray,
          }),
        ],
      }),
    ],
  });
}

function createICHeading1(text: string, runs?: InlineTextRun[]): Paragraph {
  // For headings, merge bold from formatting since headings are already bold
  const children = runs && runs.length > 0
    ? runs.map(run => new TextRun({
        text: run.text,
        font: FONT_DISPLAY,
        size: IC_SIZES.h1,
        bold: true,
        italics: run.italic,
        color: IC_COLORS.heading,
      }))
    : [new TextRun({
        text,
        font: FONT_DISPLAY,
        size: IC_SIZES.h1,
        bold: true,
        color: IC_COLORS.heading,
      })];

  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 120 },
    children,
  });
}

function createICHeading2(text: string, runs?: InlineTextRun[]): Paragraph {
  const children = runs && runs.length > 0
    ? runs.map(run => new TextRun({
        text: run.text,
        font: FONT_DISPLAY,
        size: IC_SIZES.h2,
        bold: true,
        italics: run.italic,
        color: IC_COLORS.heading,
      }))
    : [new TextRun({
        text,
        font: FONT_DISPLAY,
        size: IC_SIZES.h2,
        bold: true,
        color: IC_COLORS.heading,
      })];

  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 100 },
    children,
  });
}

function createICHeading3(text: string, runs?: InlineTextRun[]): Paragraph {
  const children = runs && runs.length > 0
    ? runs.map(run => new TextRun({
        text: run.text,
        font: FONT,
        size: IC_SIZES.h3,
        bold: true,
        italics: run.italic,
        color: IC_COLORS.heading,
      }))
    : [new TextRun({
        text,
        font: FONT,
        size: IC_SIZES.h3,
        bold: true,
        color: IC_COLORS.heading,
      })];

  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 160, after: 80 },
    children,
  });
}

/**
 * Convert inline text runs to docx TextRun objects
 */
function createTextRunsFromInline(
  runs: InlineTextRun[] | undefined,
  plainText: string,
  options: { font?: string; size?: number; color?: string } = {}
): TextRun[] {
  const { font = FONT, size = IC_SIZES.body, color = IC_COLORS.body } = options;

  if (runs && runs.length > 0) {
    return runs.map(run => new TextRun({
      text: run.text,
      font,
      size,
      color,
      bold: run.bold,
      italics: run.italic,
    }));
  }

  return [new TextRun({
    text: plainText,
    font,
    size,
    color,
  })];
}

function createICParagraph(text: string, runs?: InlineTextRun[]): Paragraph {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: createTextRunsFromInline(runs, text),
  });
}

function createICBullet(text: string, level: number = 0, numberingRef: string = "ic-bullets", runs?: InlineTextRun[]): Paragraph {
  const children = runs && runs.length > 0
    ? runs.map(run => new TextRun({
        text: run.text,
        bold: run.bold,
        italics: run.italic,
      }))
    : [new TextRun({ text })];

  return new Paragraph({
    style: STYLES.listParagraph,
    numbering: { reference: numberingRef, level },
    spacing: { before: 40, after: 40 },
    children,
  });
}

// ============================================================================
// DOCUMENT SECTIONS
// ============================================================================

function buildTitleSection(spec: ScreenerSpec): Paragraph[] {
  const projectName = spec.overview.project_zh
    ? `${spec.overview.project} ${spec.overview.project_zh}`
    : spec.overview.project;

  const monthYear = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const client = spec.overview.client || "[Client]";

  return [
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: `Screener: ${projectName}`,
          font: FONT,
          size: 32,
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: `Document Reference: ${client} x ${spec.overview.project} Screener (${monthYear})`,
          font: FONT,
          size: 18,
          color: COLORS.gray,
        }),
      ],
    }),
    new Paragraph({
      border: {
        top: {
          style: BorderStyle.SINGLE,
          size: 8,
          color: COLORS.navyLine,
        },
      },
      spacing: { after: 200 },
    }),
  ];
}

function buildOverviewSection(spec: ScreenerSpec): (Paragraph | Table)[] {
  const overview = spec.overview;
  const rows: string[][] = [];

  if (overview.cities) {
    rows.push(["City / Cities", overview.cities.join(", ")]);
  }
  rows.push(["Format", overview.format]);
  if (overview.sessions) {
    rows.push(["Sessions", overview.sessions]);
  }
  const target = overview.target_zh
    ? `${overview.target} ${overview.target_zh}`
    : overview.target;
  rows.push(["Target Audience", target]);
  rows.push(["Fieldwork Dates", overview.fieldwork]);
  if (overview.total_respondents) {
    rows.push(["Total Respondents", String(overview.total_respondents)]);
  }

  return [
    ...createSectionHeader("Study Overview"),
    createTable(["Field", "Details"], rows, WIDTHS.twoCol),
  ];
}

function buildCohortSection(spec: ScreenerSpec): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [
    ...createSectionHeader("Cohort Structure"),
    createSubsectionHeader("Cohort Definitions"),
  ];

  // Cohort table
  const cohortRows = spec.cohorts.map((c) => {
    const name = c.name_zh ? `${c.name} ${c.name_zh}` : c.name;
    const definition = c.definition_zh
      ? `${c.definition}\n${c.definition_zh}`
      : c.definition;
    return [name, definition];
  });

  elements.push(
    createTable(["Cohort", "Definition"], cohortRows, WIDTHS.twoCol)
  );

  // Recruitment notes
  if (spec.recruitment_notes.length > 0) {
    elements.push(
      new Paragraph({
        spacing: { before: 200, after: 80 },
        children: [
          new TextRun({
            text: "Recruitment Notes:",
            font: FONT,
            size: 18,
            bold: true,
          }),
        ],
      })
    );
    elements.push(...createBulletList(spec.recruitment_notes));
  }

  return elements;
}

function buildQuestionsSection(spec: ScreenerSpec): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [
    ...createSectionHeader("Screener Questions"),
  ];

  for (const q of spec.questions) {
    // Question header
    elements.push(createQuestionHeader(q.id, q.topic, q.topic_zh));

    // Multi-answer indicator
    const maIndicator = q.multi_answer ? " (MA)" : "";

    // Question text
    const questionText = createBilingualText(q.question.en, q.question.zh);
    elements.push(
      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [
          new TextRun({
            text: questionText + maIndicator,
            font: FONT,
            size: 18,
          }),
        ],
      })
    );

    // Condition note
    if (q.condition) {
      elements.push(
        new Paragraph({
          spacing: { before: 40, after: 80 },
          children: [
            new TextRun({
              text: `[${q.condition}]`,
              font: FONT,
              size: 18,
              italics: true,
              color: COLORS.gray,
            }),
          ],
        })
      );
    }

    // Grid-type questions (rows × columns matrix)
    if (q.type === "grid" || q.type === "per_brand_grid") {
      // Instruction note
      if (q.instruction) {
        elements.push(
          new Paragraph({
            spacing: { before: 40, after: 80 },
            children: [
              new TextRun({
                text: `Instruction: ${q.instruction}`,
                font: FONT,
                size: 18,
                italics: true,
                color: COLORS.gray,
              }),
            ],
          })
        );
      }

      if (q.rows && q.columns) {
        // Build grid table: first column is activity/row label, remaining columns are the scale
        const headerRow = ["Activity / Item", ...q.columns.map((c: any) => createBilingualText(c.text.en, c.text.zh) + ` [${c.code}]`)];
        const dataRows = q.rows.map((r: any) => {
          const label = r.activity_zh ? `${r.activity} ${r.activity_zh}` : r.activity;
          return [label, ...q.columns.map((c: any) => c.action)];
        });

        // Calculate column widths dynamically
        const numCols = headerRow.length;
        const firstColWidth = 2400;
        const remainingWidth = 9360 - firstColWidth;
        const otherColWidth = Math.floor(remainingWidth / (numCols - 1));
        const gridWidths = [firstColWidth, ...Array(numCols - 1).fill(otherColWidth)];

        elements.push(createTable(headerRow, dataRows, gridWidths));
      } else if (q.options) {
        // per_brand_grid with options but no rows/columns — render as standard options table
        const optionRows = q.options.map((opt: any) => [
          createBilingualText(opt.text.en, opt.text.zh),
          String(opt.code),
          opt.action,
        ]);
        elements.push(createTable(["Option", "Code", "Action"], optionRows, WIDTHS.threeCol));
      }
    } else {
      // Standard options table
      const optionRows = q.options.map((opt: any) => [
        createBilingualText(opt.text.en, opt.text.zh),
        String(opt.code),
        opt.action,
      ]);

      elements.push(
        createTable(["Option", "Code", "Action"], optionRows, WIDTHS.threeCol)
      );
    }

    // Notes
    if (q.quota_note) {
      elements.push(createNote(`Quota: ${q.quota_note}`));
    }
    if (q.requirement_note) {
      elements.push(createNote(`Requirement: ${q.requirement_note}`));
    }
    if (q.cohort_logic) {
      elements.push(createNote(`Cohort Logic: ${q.cohort_logic}`));
    }
    if (q.cohort_assignment) {
      elements.push(createNote(`Assignment: ${q.cohort_assignment}`));
    }
  }

  return elements;
}

function buildQualityCheckSection(spec: ScreenerSpec): (Paragraph | Table)[] {
  const qc = spec.quality_check;
  const elements: (Paragraph | Table)[] = [
    ...createSectionHeader("Quality Check"),
    createSubsectionHeader("Talkability Assessment Criteria"),
  ];

  // Criteria table
  const criteriaRows = qc.criteria.map((c) => {
    const dim = c.dimension_zh ? `${c.dimension} ${c.dimension_zh}` : c.dimension;
    const pass = c.pass_zh ? `${c.pass}\n${c.pass_zh}` : c.pass;
    const fail = c.fail_zh ? `${c.fail}\n${c.fail_zh}` : c.fail;
    return [dim, pass, fail];
  });

  elements.push(
    createTable(
      ["Dimension", "Pass", "Fail"],
      criteriaRows,
      WIDTHS.qualityCheck
    )
  );

  // Test question
  elements.push(createSubsectionHeader("Test Question"));
  elements.push(
    new Paragraph({
      spacing: { before: 80, after: 120 },
      children: [
        new TextRun({
          text: createBilingualText(qc.test_question.en, qc.test_question.zh),
          font: FONT,
          size: 18,
        }),
      ],
    })
  );

  // Pass/fail criteria
  if (qc.pass_criteria) {
    elements.push(
      createNote(
        `Pass: ${createBilingualText(qc.pass_criteria.en, qc.pass_criteria.zh)}`
      )
    );
  }
  if (qc.fail_criteria) {
    elements.push(
      createNote(
        `Fail: ${createBilingualText(qc.fail_criteria.en, qc.fail_criteria.zh)}`
      )
    );
  }

  return elements;
}

function buildInvitationSection(spec: ScreenerSpec): (Paragraph | Table)[] {
  const inv = spec.invitation;
  const elements: (Paragraph | Table)[] = [
    ...createSectionHeader("Invitation"),
  ];

  // Script
  elements.push(
    new Paragraph({
      spacing: { before: 80, after: 120 },
      children: [
        new TextRun({
          text: createBilingualText(inv.script.en, inv.script.zh),
          font: FONT,
          size: 18,
        }),
      ],
    })
  );

  // Options table
  const optionRows = inv.options.map((opt) => [
    createBilingualText(opt.text.en, opt.text.zh),
    String(opt.code),
    opt.action,
  ]);

  elements.push(
    createTable(["Option", "Code", "Action"], optionRows, WIDTHS.threeCol)
  );

  // Confirmation note
  if (inv.confirmation_note) {
    elements.push(
      createNote(
        createBilingualText(inv.confirmation_note.en, inv.confirmation_note.zh)
      )
    );
  }

  return elements;
}

function buildQuickReferenceSection(spec: ScreenerSpec): (Paragraph | Table)[] {
  const qr = spec.quick_reference;
  const elements: (Paragraph | Table)[] = [
    ...createSectionHeader("Quick Reference"),
  ];

  // Termination criteria
  elements.push(createSubsectionHeader("Termination Criteria"));
  const termRows = qr.termination_criteria.map((t) => [t.question, t.condition]);
  elements.push(
    createTable(["Question", "Condition"], termRows, WIDTHS.twoCol)
  );

  // Cohort assignment
  elements.push(createSubsectionHeader("Cohort Assignment"));
  const cohortRows = qr.cohort_assignment.map((c) => [c.condition, c.assign_to]);
  elements.push(
    createTable(["Condition", "Assign To"], cohortRows, WIDTHS.twoCol)
  );

  // Mix requirements
  elements.push(createSubsectionHeader("Mix Requirements"));
  const mixRows = qr.mix_requirements.map((m) => [m.dimension, m.requirement]);
  elements.push(
    createTable(["Dimension", "Requirement"], mixRows, WIDTHS.twoCol)
  );

  return elements;
}

function buildQuotaSection(spec: ScreenerSpec): (Paragraph | Table)[] {
  const quota = spec.recruitment_quota;
  const elements: (Paragraph | Table)[] = [
    ...createSectionHeader("Recruitment Quota"),
  ];

  // Summary
  elements.push(
    new Paragraph({
      spacing: { before: 80, after: 120 },
      children: [
        new TextRun({
          text: `Total to Recruit: ${quota.total}`,
          font: FONT,
          size: 18,
          bold: true,
        }),
      ],
    })
  );

  // Quota table
  const hasLocation = quota.groups.some((g) => g.location);
  const hasFormat = quota.groups.some((g) => g.format);
  const hasRecruit = quota.groups.some((g) => g.recruit);

  let headers: string[];
  let widths: number[];

  if (hasLocation && hasFormat && hasRecruit) {
    headers = ["Location", "Format", "Session", "Cohort", "Target", "Recruit"];
    widths = [1500, 1000, 1200, 2160, 1000, 1000];
  } else if (hasRecruit) {
    headers = ["Session/Group", "Cohort", "Target", "Recruit"];
    widths = WIDTHS.fourCol;
  } else {
    headers = ["Session/Group", "Cohort", "Target"];
    widths = [3120, 3120, 3120];
  }

  const rows = quota.groups.map((g) => {
    if (hasLocation && hasFormat && hasRecruit) {
      return [
        g.location || "",
        g.format || "",
        g.session || g.group || "",
        g.cohort,
        String(g.target),
        String(g.recruit || ""),
      ];
    } else if (hasRecruit) {
      return [
        g.session || g.group || "",
        g.cohort,
        String(g.target),
        String(g.recruit || ""),
      ];
    } else {
      return [g.session || g.group || "", g.cohort, String(g.target)];
    }
  });

  elements.push(createTable(headers, rows, widths));

  // Notes
  if (quota.notes.length > 0) {
    elements.push(
      new Paragraph({
        spacing: { before: 160, after: 80 },
        children: [
          new TextRun({
            text: "Notes:",
            font: FONT,
            size: 18,
            bold: true,
          }),
        ],
      })
    );
    elements.push(...createBulletList(quota.notes));
  }

  return elements;
}

// ============================================================================
// MAIN GENERATOR
// ============================================================================

async function generateScreener(
  spec: ScreenerSpec,
  outputPath: string
): Promise<void> {
  // Load external styles from IC template
  const externalStyles = await loadTemplateStyles();

  // Try to load logo
  let logoData: Buffer | null = null;
  const logoPath = resolve(
    dirname(import.meta.path),
    "../../screener-spec/assets/ic-logo.png"
  );
  if (existsSync(logoPath)) {
    logoData = await readFile(logoPath);
  }

  // Build document sections
  const children: (Paragraph | Table)[] = [
    ...buildTitleSection(spec),
    ...buildOverviewSection(spec),
    ...buildCohortSection(spec),
    ...buildQuestionsSection(spec),
    ...buildQualityCheckSection(spec),
    ...buildInvitationSection(spec),
    ...buildQuickReferenceSection(spec),
    ...buildQuotaSection(spec),
    // End marker
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      children: [
        new TextRun({
          text: "-- End of Screener --",
          font: FONT,
          size: 18,
          color: COLORS.gray,
        }),
      ],
    }),
  ];

  // Build header
  const headerChildren: Paragraph[] = [];
  if (logoData) {
    headerChildren.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: logoData,
            transformation: { width: 130, height: 24 },
            type: "png",
          }),
        ],
      })
    );
  }
  headerChildren.push(
    new Paragraph({
      spacing: { before: 60 },
      children: [
        new TextRun({
          text: `${spec.overview.project} Screener | ${spec.overview.target}`,
          font: FONT,
          size: 18,
          color: COLORS.gray,
        }),
      ],
    })
  );

  const doc = new Document({
    externalStyles,  // Use styles from IC template
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        headers: {
          default: new Header({ children: headerChildren }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                style: STYLES.footer,
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Page " }),
                  new TextRun({ children: [PageNumber.CURRENT] }),
                  new TextRun({ text: " of " }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES] }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  await writeFile(outputPath, buffer);
}

// ============================================================================
// TRANSCRIPT GENERATOR
// ============================================================================

async function generateTranscript(
  spec: TranscriptSpec,
  outputPath: string
): Promise<void> {
  const logoData = await loadICLogo();
  const externalStyles = await loadTemplateStyles();
  const meta = spec.metadata;

  // Build header text
  const headerText = [meta.title, meta.date, meta.market]
    .filter(Boolean)
    .join(" | ");

  // Build document content
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: meta.title,
          font: FONT_DISPLAY,
          size: IC_SIZES.title,
          bold: true,
        }),
      ],
    })
  );

  // Metadata block
  const metaLines: string[] = [];
  if (meta.expert) metaLines.push(`Expert: ${meta.expert}`);
  if (meta.date) metaLines.push(`Date: ${meta.date}`);
  if (meta.duration) metaLines.push(`Duration: ${meta.duration}`);
  if (meta.market) metaLines.push(`Market: ${meta.market}`);
  if (meta.project) metaLines.push(`Project: ${meta.project}`);
  if (meta.language) metaLines.push(`Language: ${meta.language}`);

  if (metaLines.length > 0) {
    children.push(
      new Paragraph({
        spacing: { before: 80, after: 200 },
        children: [
          new TextRun({
            text: metaLines.join(" | "),
            font: FONT,
            size: IC_SIZES.small,
            color: IC_COLORS.gray,
          }),
        ],
      })
    );
  }

  // Divider line
  children.push(
    new Paragraph({
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 8,
          color: COLORS.navyLine,
        },
      },
      spacing: { after: 240 },
    })
  );

  // Transcript content
  for (const para of spec.paragraphs) {
    if (para.type === "speaker" && para.speaker) {
      // Speaker line with bold speaker name
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 60 },
          children: [
            new TextRun({
              text: `${para.speaker}: `,
              font: FONT,
              size: IC_SIZES.body,
              bold: true,
            }),
            new TextRun({
              text: para.text,
              font: FONT,
              size: IC_SIZES.body,
            }),
          ],
        })
      );
    } else if (para.type === "timestamp") {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 40 },
          children: [
            new TextRun({
              text: para.text,
              font: FONT,
              size: IC_SIZES.small,
              color: IC_COLORS.gray,
            }),
          ],
        })
      );
    } else if (para.type === "annotation") {
      children.push(
        new Paragraph({
          spacing: { before: 40, after: 40 },
          children: [
            new TextRun({
              text: para.text,
              font: FONT,
              size: IC_SIZES.body,
              italics: true,
              color: IC_COLORS.gray,
            }),
          ],
        })
      );
    } else {
      children.push(createICParagraph(para.text));
    }
  }

  const doc = new Document({
    externalStyles,  // Use styles from IC template
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        headers: {
          default: createICHeader(logoData, headerText),
        },
        footers: {
          default: createICFooter(),
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  await writeFile(outputPath, buffer);
}

// ============================================================================
// TAKEAWAY GENERATOR
// ============================================================================

async function generateTakeaway(
  spec: TakeawaySpec,
  outputPath: string
): Promise<void> {
  const logoData = await loadICLogo();
  const externalStyles = await loadTemplateStyles();
  const meta = spec.metadata;

  // Build header text
  const headerText = [meta.title, meta.date, meta.project]
    .filter(Boolean)
    .join(" | ");

  // Build document content
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: meta.title,
          font: FONT_DISPLAY,
          size: IC_SIZES.title,
          bold: true,
        }),
      ],
    })
  );

  // Expert profile line
  if (meta.expert || meta.role) {
    const profileText = [meta.expert, meta.role].filter(Boolean).join(" — ");
    children.push(
      new Paragraph({
        spacing: { before: 80, after: 200 },
        children: [
          new TextRun({
            text: profileText,
            font: FONT,
            size: IC_SIZES.h3,
            color: IC_COLORS.gray,
          }),
        ],
      })
    );
  }

  // Divider line
  children.push(
    new Paragraph({
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 8,
          color: COLORS.navyLine,
        },
      },
      spacing: { after: 240 },
    })
  );

  // Sections
  for (const section of spec.sections) {
    // Section heading
    if (section.level === 1) {
      children.push(createICHeading1(section.heading));
    } else if (section.level === 2) {
      children.push(createICHeading2(section.heading));
    } else {
      children.push(createICHeading3(section.heading));
    }

    // Section content
    if (section.content) {
      children.push(createICParagraph(section.content));
    }

    // Bullets
    if (section.bullets && section.bullets.length > 0) {
      for (const bullet of section.bullets) {
        children.push(createICBullet(bullet));
      }
    }
  }

  const doc = new Document({
    externalStyles,  // Use styles from IC template
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        headers: {
          default: createICHeader(logoData, headerText),
        },
        footers: {
          default: createICFooter(),
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  await writeFile(outputPath, buffer);
}

// ============================================================================
// IC DOCUMENT GENERATOR
// ============================================================================

async function generateICDocument(
  spec: ICDocumentSpec,
  outputPath: string
): Promise<void> {
  const logoData = await loadICLogo();
  const externalStyles = await loadTemplateStyles();
  const meta = spec.metadata;

  // Build header text
  const headerText = meta.header_text || meta.title;

  // Build document content
  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: meta.title,
          font: FONT_DISPLAY,
          size: IC_SIZES.title,
          bold: true,
        }),
      ],
    })
  );

  // Subtitle
  if (meta.subtitle) {
    children.push(
      new Paragraph({
        spacing: { before: 40, after: 120 },
        children: [
          new TextRun({
            text: meta.subtitle,
            font: FONT,
            size: IC_SIZES.h3,
            color: IC_COLORS.gray,
          }),
        ],
      })
    );
  }

  // Date
  if (meta.date) {
    children.push(
      new Paragraph({
        spacing: { before: 40, after: 200 },
        children: [
          new TextRun({
            text: meta.date,
            font: FONT,
            size: IC_SIZES.small,
            color: IC_COLORS.gray,
          }),
        ],
      })
    );
  }

  // Divider line
  children.push(
    new Paragraph({
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 8,
          color: COLORS.navyLine,
        },
      },
      spacing: { after: 240 },
    })
  );

  // Content
  for (let i = 0; i < spec.content.length; i++) {
    const block = spec.content[i];
    switch (block.type) {
      case "heading1":
        children.push(createICHeading1(block.text, block.runs));
        break;
      case "heading2":
        children.push(createICHeading2(block.text, block.runs));
        break;
      case "heading3":
        children.push(createICHeading3(block.text, block.runs));
        break;
      case "bullet":
        children.push(createICBullet(block.text, block.level || 0, "ic-bullets", block.runs));
        break;
      case "numbered":
        children.push(createICBullet(block.text, block.level || 0, "ic-numbering-1", block.runs));
        break;
      case "blockquote":
        {
          // Use Probe style without explicit font/size so template style controls appearance
          const bqRuns = block.runs && block.runs.length > 0
            ? block.runs.map(run => new TextRun({
                text: run.text,
                bold: run.bold,
                italics: run.italic,
              }))
            : [new TextRun({ text: block.text })];
          children.push(
            new Paragraph({
              style: STYLES.probe,
              spacing: { before: 60, after: 60 },
              children: bqRuns,
            })
          );
        }
        break;
      case "table":
        {
          const headers = block.headers || [];
          const dataRows = block.rows || [];
          if (headers.length > 0) {
            const numCols = headers.length;
            const colWidth = Math.floor(WIDTHS.total / numCols);
            const widths = headers.map(() => colWidth);
            // Pad each row to match header count
            const paddedRows = dataRows.map(row =>
              Array.from({ length: numCols }, (_, j) => row[j] || "")
            );
            children.push(createTable(headers, paddedRows, widths));
            children.push(new Paragraph({ spacing: { after: 160 } }));
          }
        }
        break;
      case "paragraph":
      default:
        children.push(createICParagraph(block.text, block.runs));
        break;
    }
  }

  // Build numbering config with one reference per numbered group
  const numberingConfigs: any[] = [
    {
      reference: "ic-bullets",
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: "\u2013",  // En dash – (IC house style)
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: {
              indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.25) },
            },
          },
        },
        {
          level: 1,
          format: LevelFormat.BULLET,
          text: "\u2013",  // En dash – for nested bullets too
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: {
              indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) },
            },
          },
        },
        {
          level: 2,
          format: LevelFormat.BULLET,
          text: "\u2013",  // En dash –
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: {
              indent: { left: convertInchesToTwip(0.75), hanging: convertInchesToTwip(0.25) },
            },
          },
        },
      ],
    },
  ];

  // Decimal numbering config — docx-js needs this to generate numPr references.
  // The actual numbering.xml will be replaced with the template's version in post-processing.
  numberingConfigs.push({
    reference: "ic-numbering-1",
    levels: [
      {
        level: 0,
        format: LevelFormat.DECIMAL,
        text: "%1.",
        alignment: AlignmentType.LEFT,
        style: {
          paragraph: {
            indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.25) },
          },
        },
      },
    ],
  });

  const doc = new Document({
    externalStyles,  // Use styles from IC template
    numbering: {
      config: numberingConfigs,
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        headers: {
          default: createICHeader(logoData, headerText),
        },
        footers: {
          default: createICFooter(),
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  // Post-process: fix numbering.xml to be Word-compatible
  const processedBuffer = await fixNumberingXml(buffer);
  await writeFile(outputPath, processedBuffer);
}

/**
 * Replace docx-js's generated numbering.xml with the IC template's version.
 *
 * docx-js generates numbering definitions that are missing critical fields
 * Word needs (nsid, tmpl, tplc) and adds fragile lvlOverride elements.
 * Instead of patching these, we replace the entire numbering.xml with the
 * template's version which was authored in Word and works correctly.
 *
 * The template's numbering.xml has these definitions:
 *   - numId 1 → bullet ● (standard bullets)
 *   - numId 2 → bullet – (IC dash bullets)
 *   - numId 3 → decimal %1. (numbered lists)
 *   - numId 4 → decimal %1. (second decimal instance)
 *   - numId 5 → decimal %1. (third decimal instance)
 *
 * We map docx-js's generated numIds to the template's numIds by scanning
 * the generated document.xml for numId references and remapping them.
 */
async function fixNumberingXml(buffer: Buffer): Promise<Buffer> {
  if (!cachedTemplateNumberingXml) return buffer;

  const zip = await JSZip.loadAsync(buffer);
  const docXml = await zip.file("word/document.xml")?.async("string");
  if (!docXml) return buffer;

  // Find what numIds docx-js generated and what abstractNums they reference
  const generatedNumberingXml = await zip.file("word/numbering.xml")?.async("string");
  if (!generatedNumberingXml) return buffer;

  // Build a map of docx-js reference names to their numIds by parsing the
  // generated numbering.xml. docx-js names abstractNums sequentially.
  // We need to figure out which numId is bullets vs numbered.
  // Strategy: look at the abstractNum format to determine type, then remap.

  // Parse generated abstractNums to find which are bullet vs decimal
  const genAbstractNums: { id: string; isBullet: boolean }[] = [];
  const abstractNumRegex = /<w:abstractNum w:abstractNumId="(\d+)"[^>]*>[\s\S]*?<\/w:abstractNum>/g;
  let match;
  while ((match = abstractNumRegex.exec(generatedNumberingXml)) !== null) {
    const id = match[1];
    const content = match[0];
    const isBullet = content.includes('w:val="bullet"');
    genAbstractNums.push({ id, isBullet });
  }

  // Parse generated w:num entries to get numId → abstractNumId mapping
  const genNums: { numId: string; abstractNumId: string }[] = [];
  const numRegex = /<w:num w:numId="(\d+)"[^>]*>\s*<w:abstractNumId w:val="(\d+)"[^/]*\/>/g;
  while ((match = numRegex.exec(generatedNumberingXml)) !== null) {
    genNums.push({ numId: match[1], abstractNumId: match[2] });
  }

  // Build remapping: for each generated numId, map to appropriate template numId
  // Template: numId 2 = dash bullets, numId 3 = first decimal
  const numIdRemap: Record<string, string> = {};
  for (const num of genNums) {
    const abstractNum = genAbstractNums.find(a => a.id === num.abstractNumId);
    if (abstractNum?.isBullet) {
      numIdRemap[num.numId] = "2"; // Template dash bullets
    } else {
      numIdRemap[num.numId] = "3"; // Template decimal numbering
    }
  }

  // Remap numId references in document.xml
  let fixedDocXml = docXml;
  for (const [oldId, newId] of Object.entries(numIdRemap)) {
    // Replace <w:numId w:val="OLD"/> with template numId
    fixedDocXml = fixedDocXml.replace(
      new RegExp(`<w:numId w:val="${oldId}"/>`, "g"),
      `<w:numId w:val="${newId}"/>`
    );
  }

  // Replace numbering.xml with template version and update document.xml
  zip.file("word/numbering.xml", cachedTemplateNumberingXml);
  zip.file("word/document.xml", fixedDocXml);

  const newBuffer = await zip.generateAsync({ type: "nodebuffer" });
  return newBuffer;
}

// ============================================================================
// DISCUSSION GUIDE GENERATOR (Using Template Styles)
// ============================================================================

// DG Section header - uses Heading1 style with custom borders and time tab
function createDGSectionHeader(sectionNum: number, title: string, timeMinutes: number): Paragraph {
  return new Paragraph({
    style: STYLES.heading1,
    spacing: { before: 360, after: 200 },
    border: {
      top: { style: BorderStyle.SINGLE, size: 8, color: DG_COLORS.navy, space: 4 },
      bottom: { style: BorderStyle.SINGLE, size: 8, color: DG_COLORS.navy, space: 4 },
    },
    tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
    children: [
      new TextRun({ text: `SECTION ${sectionNum}: ${title.toUpperCase()}` }),
      new TextRun({ text: "\t" }),
      new TextRun({ text: `${timeMinutes} MIN`, color: DG_COLORS.moonGray }),
    ],
  });
}

// DG Part header - uses Heading2 style
function createDGPartHeader(title: string, timeMinutes?: number): Paragraph {
  const text = timeMinutes ? `${title} (${timeMinutes} min)` : title;
  return new Paragraph({
    style: STYLES.heading2,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text })],
  });
}

// DG Topic/Exercise header - uses Heading3 style
function createDGTopicHeader(title: string): Paragraph {
  return new Paragraph({
    style: STYLES.heading3,
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text: title })],
  });
}

// DG Objective line - uses Normal style with Strong for label
function createDGObjective(objective: string): Paragraph {
  return new Paragraph({
    style: STYLES.normal,
    spacing: { before: 80, after: 120 },
    children: [
      new TextRun({ text: "Objective: ", bold: true }),
      new TextRun({ text: objective }),
    ],
  });
}

// DG Stimulus box with cream background - uses Normal style base with custom shading
function createDGStimulusBox(stimulus: string): Paragraph[] {
  return [
    new Paragraph({
      style: STYLES.normal,
      spacing: { before: 200, after: 60 },
      shading: { type: ShadingType.SOLID, fill: DG_COLORS.cream },
      border: {
        left: { style: BorderStyle.SINGLE, size: 24, color: DG_COLORS.borderGray, space: 8 },
      },
      indent: { left: 160, right: 160 },
      children: [new TextRun({ text: "STIMULUS", bold: true })],
    }),
    new Paragraph({
      style: STYLES.normal,
      spacing: { before: 0, after: 200 },
      shading: { type: ShadingType.SOLID, fill: DG_COLORS.cream },
      border: {
        left: { style: BorderStyle.SINGLE, size: 24, color: DG_COLORS.borderGray, space: 8 },
      },
      indent: { left: 160, right: 160 },
      children: [new TextRun({ text: stimulus })],
    }),
  ];
}

// DG SAY block - uses Normal style
function createDGSayBlock(text: string, textZh?: string): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      style: STYLES.normal,
      spacing: { before: 120, after: textZh ? 40 : 120 },
      children: [
        new TextRun({ text: "SAY: ", bold: true }),
        new TextRun({ text: `"${text}"` }),
      ],
    }),
  ];

  if (textZh) {
    paragraphs.push(
      new Paragraph({
        style: STYLES.normal,
        spacing: { before: 0, after: 120 },
        children: [new TextRun({ text: textZh, italics: true })],
      })
    );
  }

  return paragraphs;
}

// DG Moderator note - uses ModeratorNote style
function createDGModeratorNote(note: string): Paragraph[] {
  return [
    new Paragraph({
      style: STYLES.moderatorNote,
      spacing: { before: 200, after: 60 },
      children: [new TextRun({ text: "MODERATOR NOTE", bold: true })],
    }),
    new Paragraph({
      style: STYLES.moderatorNote,
      spacing: { before: 0, after: 60 },
      children: [new TextRun({ text: note })],
    }),
  ];
}

// DG Question with bilingual text - uses ListParagraph style, returns array for proper Chinese line separation
function createDGQuestion(
  questionNum: number,
  text: string,
  textZh?: string,
  numberingRef?: string
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Split bilingual text if needed (handles inline format)
  const { en: englishText, zh: chineseText } = splitBilingualText(text, textZh);

  // English question (numbered) - uses ListParagraph style
  if (numberingRef) {
    paragraphs.push(
      new Paragraph({
        style: STYLES.listParagraph,
        numbering: { reference: numberingRef, level: 0 },
        spacing: { before: 80, after: chineseText ? 0 : 60 },
        children: [new TextRun({ text: englishText })],
      })
    );
  } else {
    // Fallback with manual numbering
    paragraphs.push(
      new Paragraph({
        style: STYLES.listParagraph,
        spacing: { before: 80, after: chineseText ? 0 : 60 },
        indent: { left: 360, hanging: 360 },
        children: [
          new TextRun({ text: `${questionNum}. ` }),
          new TextRun({ text: englishText }),
        ],
      })
    );
  }

  // Chinese translation (separate paragraph, indented to align with numbered text)
  if (chineseText) {
    paragraphs.push(
      new Paragraph({
        style: STYLES.normal,
        spacing: { before: 0, after: 60 },
        indent: { left: 360 },
        children: [new TextRun({ text: chineseText })],
      })
    );
  }

  return paragraphs;
}

// DG Probe with arrow - uses Probe style, returns array for proper Chinese line separation
function createDGProbe(text: string, textZh?: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Split bilingual text if needed (handles inline format)
  const { en: englishText, zh: chineseText } = splitBilingualText(text, textZh);

  // English probe - uses Probe style
  paragraphs.push(
    new Paragraph({
      style: STYLES.probe,
      spacing: { before: 40, after: chineseText ? 0 : 40 },
      indent: { left: 720, hanging: 360 },
      children: [
        new TextRun({ text: "→ " }),
        new TextRun({ text: "PROBE: ", bold: true }),
        new TextRun({ text: englishText }),
      ],
    })
  );

  // Chinese translation (separate paragraph, indented) - uses Probe style
  if (chineseText) {
    paragraphs.push(
      new Paragraph({
        style: STYLES.probe,
        spacing: { before: 0, after: 40 },
        indent: { left: 720 },
        children: [new TextRun({ text: chineseText })],
      })
    );
  }

  return paragraphs;
}

// DG Front matter field with label - uses Normal style with Strong for label
function createDGFrontMatterField(label: string, value: string): Paragraph {
  return new Paragraph({
    style: STYLES.normal,
    spacing: { before: 80, after: 80 },
    children: [
      new TextRun({ text: `${label}: `, bold: true }),
      new TextRun({ text: value }),
    ],
  });
}

// DG Front matter bullet list - uses ListParagraph style
function createDGFrontMatterList(label: string, items: string[]): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      style: STYLES.normal,
      spacing: { before: 120, after: 40 },
      children: [new TextRun({ text: `${label}:`, bold: true })],
    }),
  ];

  for (const item of items) {
    paragraphs.push(
      new Paragraph({
        style: STYLES.listParagraph,
        spacing: { before: 20, after: 20 },
        indent: { left: 360, hanging: 180 },
        children: [new TextRun({ text: `– ${item}` })],
      })
    );
  }

  return paragraphs;
}

// Build DG front matter page - uses Title and Heading styles
function buildDGFrontMatter(spec: DiscussionGuideSpec): Paragraph[] {
  const fm = spec.front_matter;
  const paragraphs: Paragraph[] = [];

  // Title - uses Title style
  paragraphs.push(
    new Paragraph({
      style: STYLES.title,
      spacing: { after: 80 },
      children: [new TextRun({ text: fm.title })],
    })
  );

  // Chinese title if present - uses Heading2 style with italics
  if (fm.title_zh) {
    paragraphs.push(
      new Paragraph({
        style: STYLES.heading2,
        spacing: { before: 0, after: 120 },
        children: [new TextRun({ text: fm.title_zh, italics: true })],
      })
    );
  }

  // Audience - uses Heading2 style
  paragraphs.push(
    new Paragraph({
      style: STYLES.heading2,
      spacing: { before: 80, after: 200 },
      children: [new TextRun({ text: fm.audience })],
    })
  );

  // Divider
  paragraphs.push(
    new Paragraph({
      border: {
        top: { style: BorderStyle.SINGLE, size: 8, color: DG_COLORS.navy },
      },
      spacing: { after: 200 },
    })
  );

  // Fieldwork
  paragraphs.push(createDGFrontMatterField("Fieldwork", fm.fieldwork));

  // Target groups
  paragraphs.push(...createDGFrontMatterList("Target Groups", fm.target_groups));

  // Cohort definition
  if (fm.cohort_definition) {
    paragraphs.push(createDGFrontMatterField("Cohort Definition", fm.cohort_definition));
  }

  // Research tensions
  if (fm.research_tensions && fm.research_tensions.length > 0) {
    paragraphs.push(...createDGFrontMatterList("Core Research Tensions", fm.research_tensions));
  }

  // Pre-task notes
  if (fm.pre_task_notes && fm.pre_task_notes.length > 0) {
    paragraphs.push(...createDGFrontMatterList("Pre-Task Notes", fm.pre_task_notes));
  }

  // Stimulus available
  if (fm.stimulus_available && fm.stimulus_available.length > 0) {
    paragraphs.push(...createDGFrontMatterList("Stimulus Available", fm.stimulus_available));
  }

  // Key principles - uses Normal and ListParagraph styles
  if (spec.key_principles && spec.key_principles.length > 0) {
    paragraphs.push(
      new Paragraph({
        style: STYLES.normal,
        spacing: { before: 200, after: 80 },
        children: [new TextRun({ text: "Key Principles for Moderator:", bold: true })],
      })
    );

    for (let i = 0; i < spec.key_principles.length; i++) {
      const kp = spec.key_principles[i];
      paragraphs.push(
        new Paragraph({
          style: STYLES.listParagraph,
          spacing: { before: 40, after: 40 },
          indent: { left: 360, hanging: 180 },
          children: [
            new TextRun({ text: `${i + 1}. ` }),
            new TextRun({ text: `${kp.principle}: `, bold: true }),
            new TextRun({ text: kp.description }),
          ],
        })
      );
    }
  }

  return paragraphs;
}

// Build a single DG section
function buildDGSection(section: DGSection, sectionNum: number, numberingRef: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // No forced page breaks - content flows continuously
  // Section headers have enough spacing to create visual separation

  // Section header
  paragraphs.push(createDGSectionHeader(sectionNum, section.title, section.time_minutes));

  // Objective
  if (section.objective) {
    paragraphs.push(createDGObjective(section.objective));
  }

  // Stimulus box
  if (section.stimulus) {
    paragraphs.push(...createDGStimulusBox(section.stimulus));
  }

  // SAY text
  if (section.say_text) {
    paragraphs.push(...createDGSayBlock(section.say_text, section.say_text_zh));
  }

  // Moderator note
  if (section.moderator_note) {
    paragraphs.push(...createDGModeratorNote(section.moderator_note));
  }

  // Questions directly in section
  if (section.questions && section.questions.length > 0) {
    let qNum = 1;
    for (const q of section.questions) {
      if (q.label) {
        paragraphs.push(createDGTopicHeader(q.label));
      }
      paragraphs.push(...createDGQuestion(qNum, q.text, q.text_zh, numberingRef));
      if (q.probes) {
        for (const probe of q.probes) {
          const { text: probeText, text_zh: probeTextZh } = normalizeProbe(probe);
          paragraphs.push(...createDGProbe(probeText, probeTextZh));
        }
      }
      if (q.moderator_note) {
        paragraphs.push(...createDGModeratorNote(q.moderator_note));
      }
      qNum++;
    }
  }

  // Parts within section
  if (section.parts && section.parts.length > 0) {
    for (const part of section.parts) {
      paragraphs.push(createDGPartHeader(part.title, part.time_minutes));

      if (part.group_filter) {
        paragraphs.push(
          new Paragraph({
            spacing: { before: 40, after: 80 },
            children: [
              new TextRun({
                text: `[${part.group_filter}]`,
                font: FONT,
                size: DG_SIZES.body,
                italics: true,
                color: DG_COLORS.moonGray,
              }),
            ],
          })
        );
      }

      if (part.stimulus) {
        paragraphs.push(...createDGStimulusBox(part.stimulus));
      }

      if (part.moderator_note) {
        paragraphs.push(...createDGModeratorNote(part.moderator_note));
      }

      // Questions in part
      if (part.questions && part.questions.length > 0) {
        let qNum = 1;
        for (const q of part.questions) {
          if (q.label) {
            paragraphs.push(createDGTopicHeader(q.label));
          }
          paragraphs.push(...createDGQuestion(qNum, q.text, q.text_zh, numberingRef));
          if (q.probes) {
            for (const probe of q.probes) {
              const { text: probeText, text_zh: probeTextZh } = normalizeProbe(probe);
              paragraphs.push(...createDGProbe(probeText, probeTextZh));
            }
          }
          if (q.moderator_note) {
            paragraphs.push(...createDGModeratorNote(q.moderator_note));
          }
          qNum++;
        }
      }

      // Exercises in part
      if (part.exercises && part.exercises.length > 0) {
        for (const exercise of part.exercises) {
          paragraphs.push(createDGTopicHeader(`${exercise.title} (${exercise.time_minutes || "?"} min)`));

          if (exercise.stimulus) {
            paragraphs.push(...createDGStimulusBox(exercise.stimulus));
          }

          // SAY block in exercise
          if (exercise.say_block) {
            paragraphs.push(...createDGSayBlock(exercise.say_block, exercise.say_block_zh));
          }

          if (exercise.questions) {
            let qNum = 1;
            for (const q of exercise.questions) {
              if (q.label) {
                paragraphs.push(
                  new Paragraph({
                    spacing: { before: 80, after: 40 },
                    children: [
                      new TextRun({
                        text: q.label,
                        font: FONT,
                        size: DG_SIZES.body,
                        bold: true,
                        color: DG_COLORS.darkGray,
                      }),
                    ],
                  })
                );
              }
              paragraphs.push(...createDGQuestion(qNum, q.text, q.text_zh, numberingRef));
              if (q.probes) {
                for (const probe of q.probes) {
                  const { text: probeText, text_zh: probeTextZh } = normalizeProbe(probe);
                  paragraphs.push(...createDGProbe(probeText, probeTextZh));
                }
              }
              if (q.moderator_note) {
                paragraphs.push(...createDGModeratorNote(q.moderator_note));
              }
              qNum++;
            }
          }
        }
      }

      // Topics in part (IDI structure: parts → topics → exercises → questions)
      if (part.topics && part.topics.length > 0) {
        for (const topic of part.topics) {
          // Render topic header
          if (topic.title) {
            const topicHeaderText = topic.time_minutes
              ? `${topic.title} (${topic.time_minutes} min)`
              : topic.title;
            paragraphs.push(createDGTopicHeader(topicHeaderText));
          }

          // Process exercises within topic
          if (topic.exercises && topic.exercises.length > 0) {
            for (const exercise of topic.exercises) {
              // Exercise title
              if (exercise.title) {
                paragraphs.push(
                  new Paragraph({
                    heading: HeadingLevel.HEADING_4,
                    spacing: { before: 160, after: 80 },
                    children: [
                      new TextRun({
                        text: exercise.time_minutes
                          ? `${exercise.title} (${exercise.time_minutes} min)`
                          : exercise.title,
                        font: FONT,
                        size: DG_SIZES.exerciseTitle,
                        bold: true,
                        color: DG_COLORS.darkGray,
                      }),
                    ],
                  })
                );
              }

              // SAY block in exercise
              if (exercise.say_block) {
                paragraphs.push(...createDGSayBlock(exercise.say_block, exercise.say_block_zh));
              }

              // Stimulus
              if (exercise.stimulus) {
                paragraphs.push(...createDGStimulusBox(exercise.stimulus));
              }

              // Questions
              if (exercise.questions) {
                let qNum = 1;
                for (const q of exercise.questions) {
                  if (q.label) {
                    paragraphs.push(
                      new Paragraph({
                        spacing: { before: 80, after: 40 },
                        children: [
                          new TextRun({
                            text: q.label,
                            font: FONT,
                            size: DG_SIZES.body,
                            bold: true,
                            color: DG_COLORS.darkGray,
                          }),
                        ],
                      })
                    );
                  }
                  paragraphs.push(...createDGQuestion(qNum, q.text, q.text_zh, numberingRef));
                  if (q.probes) {
                    for (const probe of q.probes) {
                      const { text: probeText, text_zh: probeTextZh } = normalizeProbe(probe);
                      paragraphs.push(...createDGProbe(probeText, probeTextZh));
                    }
                  }
                  if (q.moderator_note) {
                    paragraphs.push(...createDGModeratorNote(q.moderator_note));
                  }
                  qNum++;
                }
              }
            }
          }
        }
      }
    }
  }

  return paragraphs;
}

// Build DG closing
function buildDGClosing(closing: { text: string; text_zh?: string }): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      spacing: { before: 300, after: 80 },
      children: [
        new TextRun({
          text: "Closing:",
          font: FONT,
          size: DG_SIZES.body,
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 40, after: closing.text_zh ? 40 : 200 },
      children: [
        new TextRun({
          text: closing.text,
          font: FONT,
          size: DG_SIZES.body,
        }),
      ],
    }),
  ];

  if (closing.text_zh) {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 0, after: 200 },
        children: [
          new TextRun({
            text: closing.text_zh,
            font: FONT,
            size: DG_SIZES.body,
            italics: true,
          }),
        ],
      })
    );
  }

  return paragraphs;
}

async function generateDiscussionGuide(
  spec: DiscussionGuideSpec,
  outputPath: string
): Promise<void> {
  const logoData = await loadICLogo();

  // Load external styles from IC template
  const externalStyles = await loadTemplateStyles();

  // Build header text
  const headerText = `${spec.front_matter.title.replace("DG: ", "")} DG | ${spec.front_matter.audience.split(" (")[0]}`;

  // Build numbering config - one per section for question restart
  const numberingConfig = spec.sections.map((_, idx) => ({
    reference: `section${idx + 1}-questions`,
    levels: [
      {
        level: 0,
        format: LevelFormat.DECIMAL,
        text: "%1.",
        alignment: AlignmentType.LEFT,
        style: {
          paragraph: {
            indent: { left: 360, hanging: 360 },
          },
        },
      },
    ],
  }));

  // Build front matter
  const frontMatterChildren = buildDGFrontMatter(spec);

  // Add page break after front matter
  frontMatterChildren.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // Build all sections
  const sectionChildren: Paragraph[] = [];
  for (let i = 0; i < spec.sections.length; i++) {
    const section = spec.sections[i];
    const numberingRef = `section${i + 1}-questions`;
    sectionChildren.push(...buildDGSection(section, i + 1, numberingRef));
  }

  // Build closing
  if (spec.closing) {
    sectionChildren.push(...buildDGClosing(spec.closing));
  }

  // End marker - uses Normal style
  sectionChildren.push(
    new Paragraph({
      style: STYLES.normal,
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      children: [new TextRun({ text: "– End of Discussion Guide –", color: DG_COLORS.moonGray })],
    })
  );

  const doc = new Document({
    externalStyles,  // Use styles from IC template
    numbering: {
      config: numberingConfig,
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        headers: {
          default: createICHeader(logoData, headerText),
        },
        footers: {
          default: createICFooter(),
        },
        children: [...frontMatterChildren, ...sectionChildren],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  await writeFile(outputPath, buffer);
}

// ============================================================================
// CLI
// ============================================================================

const SUPPORTED_TYPES = ["screener", "transcript", "takeaway", "ic-document", "discussion_guide"];

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Generate.ts - Generate Word documents from JSON specifications

Usage:
  cat spec.json | bun run Generate.ts --type <type> output.docx
  bun run Generate.ts --type <type> --input spec.json output.docx

Options:
  --type <type>    Document type (required): ${SUPPORTED_TYPES.join(", ")}
  --input <file>   Input JSON file (optional, reads from stdin if not provided)
  --help, -h       Show this help

Document Types:
  screener          Recruitment screener with questions, quotas, and cohort structure
  transcript        Interview/focus group transcript with speaker labels
  takeaway          Expert interview summary with structured sections
  ic-document       Generic Inner Chapter document with headings and content
  discussion_guide  Moderator discussion guide with sections, questions, and probes

Examples:
  cat screener-spec.json | bun run Generate.ts --type screener screener.docx
  cat transcript-spec.json | bun run Generate.ts --type transcript transcript.docx
  cat takeaway-spec.json | bun run Generate.ts --type takeaway takeaway.docx
  bun run Generate.ts --type ic-document --input doc-spec.json output.docx
  bun run Generate.ts --type discussion_guide --input dg-spec.json dg-output.docx
`);
    process.exit(0);
  }

  // Parse arguments
  const typeIndex = args.indexOf("--type");
  const inputIndex = args.indexOf("--input");

  if (typeIndex === -1 || !args[typeIndex + 1]) {
    console.error("Error: --type is required");
    process.exit(1);
  }

  const docType = args[typeIndex + 1];
  if (!SUPPORTED_TYPES.includes(docType)) {
    console.error(`Error: Unsupported document type: ${docType}`);
    console.error(`Supported types: ${SUPPORTED_TYPES.join(", ")}`);
    process.exit(1);
  }

  // Get output path (last non-flag argument)
  const outputPath = args.filter(
    (a, i) =>
      !a.startsWith("--") &&
      args[i - 1] !== "--type" &&
      args[i - 1] !== "--input"
  )[0];

  if (!outputPath) {
    console.error("Error: Output path is required");
    process.exit(1);
  }

  // Read input
  let inputJson: string;
  if (inputIndex !== -1 && args[inputIndex + 1]) {
    const inputFile = args[inputIndex + 1];
    if (!existsSync(inputFile)) {
      console.error(`Error: Input file not found: ${inputFile}`);
      process.exit(1);
    }
    inputJson = await readFile(inputFile, "utf-8");
  } else {
    // Read from stdin
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    inputJson = Buffer.concat(chunks).toString("utf-8");
  }

  if (!inputJson.trim()) {
    console.error("Error: No input JSON provided");
    process.exit(1);
  }

  // Parse JSON
  let spec: unknown;
  try {
    spec = JSON.parse(inputJson);
  } catch (e) {
    console.error("Error: Invalid JSON input");
    console.error(e);
    process.exit(1);
  }

  // Generate document based on type
  console.log(`Generating ${docType} document...`);

  switch (docType) {
    case "screener":
      await generateScreener(spec as ScreenerSpec, outputPath);
      break;
    case "transcript":
      await generateTranscript(spec as TranscriptSpec, outputPath);
      break;
    case "takeaway":
      await generateTakeaway(spec as TakeawaySpec, outputPath);
      break;
    case "ic-document":
      await generateICDocument(spec as ICDocumentSpec, outputPath);
      break;
    case "discussion_guide":
      await generateDiscussionGuide(spec as DiscussionGuideSpec, outputPath);
      break;
    default:
      console.error(`Error: Unknown document type: ${docType}`);
      process.exit(1);
  }

  console.log(`Generated: ${outputPath}`);
}

if (import.meta.main) {
  main();
}

export {
  generateScreener,
  generateTranscript,
  generateTakeaway,
  generateICDocument,
  generateDiscussionGuide,
  ScreenerSpec,
  TranscriptSpec,
  TakeawaySpec,
  ICDocumentSpec,
  DiscussionGuideSpec,
};
