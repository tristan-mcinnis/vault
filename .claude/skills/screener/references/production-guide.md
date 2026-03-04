# Screener Production Guide

Generate Word documents that match IC template pixel-for-pixel using docx-js.

## Required Reading

Before generating, read the docx skill documentation:

```bash
view /mnt/skills/public/docx/docx-js.md
```

## Template Reference

Template file: `assets/ic-screener-template.docx`

Copy and modify rather than build from scratch when possible.

## Document Structure

### Page Setup

- Page width: 12240 twips (8.5 inches)
- Margins: Standard

### Header

- IC logo image (embedded PNG)
- Gray text: `[Project Name] Screener | [Audience]`
- Color: #999999

```javascript
import { Header, Footer, ImageRun, PageNumber } from "docx";
import * as fs from "fs";
import * as path from "path";

// Load the logo PNG (1820×337px source, display at 130×24)
const logoPath = path.resolve(__dirname, "../../.claude/skills/screener-spec/assets/ic-logo.png");
const logoData = fs.readFileSync(logoPath);

// In Document sections config:
headers: {
  default: new Header({
    children: [
      new Paragraph({
        children: [
          new ImageRun({
            data: logoData,
            transformation: {
              width: 130,  // Display width in pixels
              height: 24,  // Display height (maintains ~5.4:1 aspect ratio)
            },
            type: "png",
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 60 },
        children: [
          new TextRun({
            text: `${projectName} Screener | ${audience}`,
            font: "Aptos",
            size: 18,
            color: "999999",
          }),
        ],
      }),
    ],
  }),
},
```

### Footer

- Page numbers centered
- Format: "Page X of Y"
- Color: #999999

```javascript
footers: {
  default: new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "Page ", font: "Aptos", size: 18, color: "999999" }),
          new TextRun({ children: [PageNumber.CURRENT], font: "Aptos", size: 18, color: "999999" }),
          new TextRun({ text: " of ", font: "Aptos", size: 18, color: "999999" }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Aptos", size: 18, color: "999999" }),
        ],
      }),
    ],
  }),
},
```

### Title Block

1. **Title**: "Screener: [Project Name]"
   - Style: Title (bold, 16pt, #000000)
   - Spacing after: 240 twips

2. **Document Reference**: "[Client] x [Project] Screener ([Month Year])"
   - Color: #999999
   - Spacing after: 240 twips

3. **Separator Line**
   - Top border: 8pt single, #0A1F44

## Typography

### Base Font

```javascript
font: "Aptos",
size: 18  // 9pt in half-points
```

### Heading Level Hierarchy (MANDATORY)

All headings MUST use Word heading styles via the `heading` property on `Paragraph`.
This ensures proper document map/navigation pane support.

| Level | Usage | Style |
|-------|-------|-------|
| Heading 1 | Section headers (STUDY OVERVIEW, SCREENER QUESTIONS, etc.) | All-caps, bold, 13pt, navy underline |
| Heading 2 | Subsection headers (Cohort Definitions, Termination Criteria, etc.) | Bold, 10pt |
| Heading 3 | Question headers (Q1. Gender 性别, Q2. Age 年龄, etc.) | Bold, 10pt |

**Never create headings as plain paragraphs with just bold/size formatting.** Always include the
`heading: HeadingLevel.HEADING_N` property so Word recognizes them structurally.

### Section Headers (Heading 1)

```javascript
new Paragraph({
  heading: HeadingLevel.HEADING_1,  // ← REQUIRED for document map
  spacing: { before: 240, after: 120 },
  children: [
    new TextRun({
      text: "STUDY OVERVIEW",
      bold: true,
      allCaps: true,
      color: "000000",
      size: 26  // 13pt
    })
  ],
})
// Followed by bottom border line (8pt, #0A1F44)
```

### Subsection Headers (Heading 2)

```javascript
new Paragraph({
  heading: HeadingLevel.HEADING_2,  // ← REQUIRED for document map
  spacing: { before: 200, after: 120 },
  children: [
    new TextRun({
      text: "Cohort Definitions",
      bold: true,
      color: "000000",
      size: 20  // 10pt
    })
  ],
})
```

### Question Headers (Heading 3)

```javascript
new Paragraph({
  heading: HeadingLevel.HEADING_3,  // ← REQUIRED for document map
  spacing: { before: 280, after: 80 },
  children: [
    new TextRun({
      text: "Q1. Gender 性别",
      bold: true,
      color: "000000",
      size: 20  // 10pt
    })
  ],
})
```

## Table Formatting

### Global Table Properties

```javascript
{
  width: { size: 9360, type: WidthType.DXA },
  indent: { size: -4, type: WidthType.DXA },
  borders: {
    top: { style: BorderStyle.SINGLE, size: 4, color: "auto" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "auto" },
    left: { style: BorderStyle.SINGLE, size: 4, color: "auto" },
    right: { style: BorderStyle.SINGLE, size: 4, color: "auto" },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "auto" },
    insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "auto" }
  },
  layout: TableLayoutType.FIXED
}
```

### Cell Margins

```javascript
margins: {
  left: 10,
  right: 10
}
// Cell padding via paragraph spacing: before 60, after 60 twips
```

### Header Row Styling

```javascript
{
  shading: { fill: "F2F2F2" },
  verticalAlign: VerticalAlign.CENTER
}
// Text: bold
```

### Column Widths

**2-Column Tables** (Overview, Cohort Definitions, Quick Reference):

```javascript
columnWidths: [2800, 6560]; // Total: 9360 dxa
```

**3-Column Tables** (Option/Code/Action):

```javascript
columnWidths: [5800, 1000, 2560]; // Total: 9360 dxa
```

**4-Column Tables** (Recruitment Quota):

```javascript
columnWidths: [2340, 2340, 2340, 2340]; // Total: 9360 dxa
```

## Section-by-Section Build

### 1. Title and Reference

```javascript
(new Paragraph({
  style: "Title",
  children: [new TextRun("Screener: [Project Name]")],
}),
  new Paragraph({
    spacing: { after: 240 },
    children: [
      new TextRun({
        text: "Document Reference: [Client] x [Project] Screener ([Month Year])",
        color: "999999",
      }),
    ],
  }),
  new Paragraph({
    border: { top: { style: BorderStyle.SINGLE, size: 8, color: "0A1F44" } },
  }));
```

### 2. Section Header Pattern

```javascript
(new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 240, after: 120 },
  children: [
    new TextRun({
      text: "STUDY OVERVIEW",
      bold: true,
      allCaps: true,
      color: "000000",
      size: 26,
    }),
  ],
}),
  new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "0A1F44" } },
    spacing: { after: 200 },
  }));
```

### 3. Question Pattern

```javascript
// Question header
(new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 280, after: 80 },
  children: [new TextRun({ text: "Q1. Gender 性别", bold: true, size: 20, font: "Aptos" })],
}),
  // Option/Code/Action table
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [5800, 1000, 2560],
    rows: [
      // Header row
      new TableRow({
        tableHeader: true,
        children: [
          createHeaderCell("Option"),
          createHeaderCell("Code"),
          createHeaderCell("Action"),
        ],
      }),
      // Data rows
      new TableRow({
        children: [
          createCell("Female 女性"),
          createCell("1"),
          createCell("Continue"),
        ],
      }),
    ],
  }),
  // Quota note (if applicable)
  new Paragraph({
    spacing: { before: 80, after: 120 },
    children: [
      new TextRun({ text: "Quota: [Specify gender quota]", color: "262626" }),
    ],
  }));
```

### 4. Helper Functions

```javascript
function createHeaderCell(text) {
  return new TableCell({
    shading: { fill: "F2F2F2" },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        spacing: { before: 60, after: 60 },
        children: [new TextRun({ text, bold: true })],
      }),
    ],
  });
}

function createCell(text) {
  return new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        spacing: { before: 60, after: 60 },
        children: [new TextRun(text)],
      }),
    ],
  });
}
```

## Bilingual Text Handling

Keep English and Chinese together in single cells:

```javascript
new TextRun("Female 女性"); // Space between
new TextRun("18-24岁"); // Chinese only when meaning is clear
```

## Quality Check Section

Use 3-column table for Pass/Fail criteria:

```javascript
columnWidths: [2500, 3430, 3430]; // Total: 9360
```

## Bullet Lists

For Recruitment Notes:

```javascript
new Paragraph({
  bullet: { level: 0 },
  children: [new TextRun("[Note 1]")],
});
```

## Footer

End document with:

```javascript
new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun("-- End of Screener --")],
});
```

## Verification Steps

After generating:

1. Open in Word to verify formatting
2. **Check document map (View → Navigation Pane)** — all sections/questions must appear
3. Check all table widths render correctly
4. Verify Chinese characters display properly
5. Confirm header/footer content
6. Test print preview for pagination

Quick XML check for heading styles:
```bash
unzip -o output.docx -d /tmp/check && grep -o 'w:val="Heading[123]"' /tmp/check/word/document.xml | sort | uniq -c
```

## Common Issues

| Issue                    | Solution                                 |
| ------------------------ | ---------------------------------------- |
| Tables too narrow        | Ensure total width = 9360 dxa            |
| Chinese text garbled     | Use UTF-8 encoding throughout            |
| Header row not repeating | Set `tableHeader: true` on first row     |
| Inconsistent spacing     | Use exact twip values from template      |
| Missing borders          | Specify all border properties explicitly |
| No document map entries  | Add `heading: HeadingLevel.HEADING_N` to Paragraph (not just bold/size) |
