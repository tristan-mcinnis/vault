# Native Word Features Implementation

**Critical**: All DG documents must use native Word features for editability. This document shows the exact docx-js patterns required.

## Numbering Configuration

All bullets and numbered lists must be defined in the document's `numbering.config` and referenced by paragraphs.

```javascript
const doc = new Document({
  numbering: {
    config: [
      // En-dash bullets for front matter lists
      {
        reference: "endash-bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "–", // En-dash (Unicode 8211), NOT hyphen
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: 360, hanging: 360 }, // 0.25 inch
              },
            },
          },
        ],
      },

      // Arrow bullets for probes
      {
        reference: "probe-bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "→", // Right arrow (Unicode 8594)
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: 720, hanging: 360 }, // 0.5 inch indent
              },
            },
          },
        ],
      },

      // Section 1 questions (resets each section)
      {
        reference: "section1-questions",
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
      },

      // Section 2 questions (separate reference = restarts at 1)
      {
        reference: "section2-questions",
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
      },
      // Add more section-X-questions references as needed
    ],
  },
  // ... rest of document
});
```

## Using Numbered Lists

### En-Dash Bullets

```javascript
// Target Groups list
(new Paragraph({
  numbering: { reference: "endash-bullets", level: 0 },
  children: [new TextRun("G1: First Jobbers (23-27), BUMO, Sat Dec 13")],
}),
  new Paragraph({
    numbering: { reference: "endash-bullets", level: 0 },
    children: [
      new TextRun("G2: University Students (18-22), BUMO, Sun Dec 14"),
    ],
  }));
```

### Question Numbering

```javascript
// Questions in Section 1
(new Paragraph({
  numbering: { reference: "section1-questions", level: 0 },
  children: [
    new TextRun("What does a typical snacking day look like for you?"),
  ],
}),
  new Paragraph({
    numbering: { reference: "section1-questions", level: 0 },
    children: [new TextRun("Walk us through your pre-task diary...")],
  }));

// Questions in Section 2 - uses DIFFERENT reference, restarts at 1
new Paragraph({
  numbering: { reference: "section2-questions", level: 0 },
  children: [new TextRun("First question of section 2...")],
});
```

### Probes

```javascript
new Paragraph({
  numbering: { reference: "probe-bullets", level: 0 },
  children: [
    new TextRun({ text: "PROBE: ", bold: true, color: "262626" }),
    new TextRun({
      text: "What products fit this description?",
      color: "262626",
    }),
  ],
});
```

## Heading Styles

Define custom styles that map to Word's built-in heading hierarchy.

```javascript
const doc = new Document({
  styles: {
    paragraphStyles: [
      // Document Title
      {
        id: "Title",
        name: "Title",
        basedOn: "Normal",
        next: "Normal",
        run: { font: "Aptos", size: 32, bold: true, color: "000000" },
        paragraph: { spacing: { after: 240 } },
      },

      // Section Header (maps to Heading 1)
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { font: "Aptos", size: 26, bold: true, color: "000000" },
        paragraph: {
          spacing: { before: 360, after: 200 }, // 18pt before
          outlineLevel: 0, // Required for Navigation pane
          border: {
            top: {
              style: BorderStyle.SINGLE,
              size: 8,
              color: "0A1F44",
              space: 4,
            },
            bottom: {
              style: BorderStyle.SINGLE,
              size: 8,
              color: "0A1F44",
              space: 4,
            },
          },
        },
      },

      // Part Header (maps to Heading 2)
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { font: "Aptos", size: 22, bold: true, color: "262626" }, // Nero gray
        paragraph: {
          spacing: { before: 280, after: 120 },
          outlineLevel: 1,
        },
      },

      // Topic Header (maps to Heading 3)
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { font: "Aptos", size: 20, bold: true, color: "000000" },
        paragraph: {
          spacing: { before: 240, after: 80 },
          outlineLevel: 2,
        },
      },

      // Exercise Title (maps to Heading 4)
      {
        id: "Heading4",
        name: "Heading 4",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { font: "Aptos", size: 19, bold: true, color: "000000" },
        paragraph: {
          spacing: { before: 200, after: 80 },
          outlineLevel: 3,
        },
      },
    ],
  },
});
```

## Using Heading Styles

```javascript
// Document title
(new Paragraph({
  heading: HeadingLevel.TITLE,
  children: [new TextRun("DG: Oreo Mini-Thin Portfolio")],
}),
  // Section header
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
    children: [
      new TextRun({ text: "SECTION 1: SNACKING LANDSCAPE", allCaps: true }),
      new TextRun("\t"),
      new TextRun({ text: "30 MIN", color: "999999" }),
    ],
  }),
  // Part header
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun("Part A: Snacking Context (15 min)")],
  }),
  // Topic header
  new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun("Daily Snacking Habits (5 min)")],
  }));
```

## Key Rules

1. **Never type bullet characters** - Always use `numbering.config`
2. **Never type numbers for lists** - Always use `numbering.config` with `LevelFormat.DECIMAL`
3. **Each section needs its own numbering reference** - `section1-questions`, `section2-questions`, etc.
4. **Always use HeadingLevel constants** - Never just apply bold/size directly
5. **Include outlineLevel** - Required for Navigation pane visibility
6. **Use quickFormat: true** - Makes styles appear in Word's Quick Styles gallery

## Verification

After creating a document, verify native features work:

1. **Bullets**: Click a bullet item in Word. The bullet button should highlight.
2. **Numbers**: Add a new item. Number should auto-increment.
3. **Headings**: Open Navigation pane (View > Navigation). Headings should appear.
