# Inner Chapter Discussion Guide Specification

Complete reference for creating pixel-perfect Discussion Guides.

> **Implementation Status**: This spec is implemented by the `discussion_guide` type in `docx-op/tools/Generate.ts`. Use the `/dg-spec` skill to create JSON specs, then render with:
> ```bash
> cat dg-spec.json | bun run .claude/skills/docx-op/tools/Generate.ts --type discussion_guide output.docx
> ```

## Table of Contents

1. [Page Setup](#1-page-setup)
2. [Header & Footer](#2-header--footer)
3. [Typography Hierarchy](#3-typography-hierarchy)
4. [Front Matter Elements](#4-front-matter-elements)
5. [Section Structure](#5-section-structure)
6. [Question Formatting](#6-question-formatting)
7. [Special Elements](#7-special-elements)
8. [List Formatting](#8-list-formatting)
9. [Color Reference](#9-color-reference)
10. [Font Reference](#10-font-reference)
11. [Document End](#11-document-end)
12. [Checklist](#12-checklist)
13. [Example Patterns](#13-example-patterns)
14. [Technical Notes](#14-technical-notes)

---

## 1. PAGE SETUP

| Property        | Value           | Notes          |
| --------------- | --------------- | -------------- |
| Page Size       | A4              | 210mm x 297mm  |
| Top Margin      | 1 inch (25.4mm) |                |
| Bottom Margin   | 1 inch (25.4mm) |                |
| Left Margin     | 1 inch (25.4mm) |                |
| Right Margin    | 1 inch (25.4mm) |                |
| Header Distance | 12.5mm          | From page edge |
| Footer Distance | 12.5mm          | From page edge |

### Page Breaks

- Insert page break before each SECTION header
- Front matter on page 1
- Section 1 starts on page 2
- Each subsequent section starts on new page

---

## 2. HEADER & FOOTER

### Header Layout

**Line 1:** Inner Chapter logo (left-aligned)
**Line 2:** Document identifier in gray

### Header Text Format

```
[Project Name] DG | [Audience Segment]
```

**No version numbers** in headers for new documents. Only add for revisions.

| Property | Value               |
| -------- | ------------------- |
| Font     | Aptos               |
| Size     | 9pt                 |
| Color    | #999999 (Moon Gray) |

### Header Implementation (docx-js)

```javascript
import { Header, Footer, ImageRun, PageNumber } from "docx";
import * as fs from "fs";
import * as path from "path";

// Load logo PNG (1820×337px source)
const logoPath = path.resolve(__dirname, "../../.claude/skills/dg-spec/assets/ic-logo.png");
const logoData = fs.readFileSync(logoPath);

// In Document sections config:
headers: {
  default: new Header({
    children: [
      new Paragraph({
        children: [
          new ImageRun({
            data: logoData,
            transformation: { width: 130, height: 24 },
            type: "png",
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 60 },
        children: [
          new TextRun({
            text: `${projectName} DG | ${audience}`,
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

### Footer Layout

- Alignment: Center
- Content: `Page X of Y`
- Color: #999999 (Moon Gray)
- Size: 9pt

### Footer Implementation (docx-js)

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

---

## 3. TYPOGRAPHY HIERARCHY

### Level 1: Document Title

```
DG: [Project Name]
```

| Property      | Value          |
| ------------- | -------------- |
| Font          | Aptos          |
| Size          | 16pt           |
| Weight        | Bold           |
| Color         | #000000 (Nero) |
| Spacing After | 12pt           |

### Level 2: Audience Segment (Subtitle)

```
[Audience Segment Name] (G1, G2)
```

| Property      | Value               |
| ------------- | ------------------- |
| Font          | Aptos               |
| Size          | 11pt                |
| Weight        | Bold                |
| Color         | #262626 (Dark Gray) |
| Spacing After | 12pt                |

### Level 3: Section Header

```
SECTION X: [SECTION TITLE]                    [XX] MIN
```

| Property       | Value                             |
| -------------- | --------------------------------- |
| Font           | Aptos                             |
| Size           | 13pt                              |
| Weight         | Bold                              |
| Case           | ALL CAPS                          |
| Color          | #000000 (Nero)                    |
| Time Color     | #999999 (Moon Gray)               |
| Borders        | 1pt #0A1F44 (Navy) top and bottom |
| Border Padding | 4pt (80 twips) inside borders     |
| Spacing Before | 18pt (360 twips)                  |
| Tab Stop       | Right-aligned at 6.5 inches       |

**Title length:** ≤40 characters to prevent time wrapping.

### Level 4: Part Header

```
Part A: [Part Title] ([XX] min)
```

| Property       | Value               |
| -------------- | ------------------- |
| Font           | Aptos               |
| Size           | 11pt                |
| Weight         | Bold                |
| Color          | #262626 (Dark Gray) |
| Spacing Before | 14pt                |
| Spacing After  | 6pt                 |

### Level 5: Topic Header

```
[Topic Name] ([X] min)
```

| Property       | Value          |
| -------------- | -------------- |
| Font           | Aptos          |
| Size           | 10pt           |
| Weight         | Bold           |
| Color          | #000000 (Nero) |
| Spacing Before | 12pt           |
| Spacing After  | 4pt            |

### Level 6: Exercise Title

```
1. [Exercise Name]
```

| Property       | Value                             |
| -------------- | --------------------------------- |
| Font           | Aptos                             |
| Size           | 9.5pt                             |
| Weight         | Bold                              |
| Color          | #000000 (Nero)                    |
| Spacing Before | 10pt                              |
| Spacing After  | 4pt                               |
| Numbering      | Arabic numerals, resets per Topic |

### Level 7: Sub-Activity Label

```
[Activity Name]
```

| Property       | Value               |
| -------------- | ------------------- |
| Font           | Aptos               |
| Size           | 9pt                 |
| Weight         | Bold                |
| Color          | #262626 (Dark Gray) |
| Spacing Before | 8pt                 |
| Spacing After  | 4pt                 |

### Body Text

| Property      | Value          |
| ------------- | -------------- |
| Font          | Aptos          |
| Size          | 9pt            |
| Weight        | Regular        |
| Color         | #000000 (Nero) |
| Spacing After | 6pt            |

---

## 4. FRONT MATTER ELEMENTS

### Fieldwork Line

```
Fieldwork: [Date] | [Location] | [Duration] | [# participants] per group
```

- "Fieldwork:" is bold
- Rest is regular weight
- Always include the "Fieldwork:" label

### Target Groups

```
Target Groups:
– G1: [Segment Name] ([Age Range]), [Qualifier], [Date/Time]
– G2: [Segment Name] ([Age Range]), [Qualifier], [Date/Time]
```

- "Target Groups:" is bold
- Use en-dash (–) bullets
- No full stops at end of bullet items

### Cohort Definition

```
Cohort Definition: [Definition text]
```

- "Cohort Definition:" is bold
- Definition text is regular

### Core Research Tensions

```
Core Research Tensions:
– [Research question 1]
– [Research question 2]
```

- Label is bold
- Questions as en-dash bullets
- Questions phrased as genuine tensions/questions

### Pre-Task Notes

```
Pre-Task Notes:
– [Pre-task instruction 1]
– [Pre-task instruction 2]
```

### Stimulus Available

```
Stimulus Available:
– [Stimulus item 1]
– [Stimulus item 2]
```

---

## 5. SECTION STRUCTURE

### Section Header Block

```
────────────────────────────────────────────────  ← 1pt Navy border
SECTION X: [TITLE]                      [XX] MIN
────────────────────────────────────────────────  ← 1pt Navy border
```

Border specifications:

- Style: Single line
- Weight: 1pt (8 in OOXML sz units)
- Color: #0A1F44 (Navy)
- Spacing: 4pt padding inside borders (space: 80 twips)

### Objective Line

```
Objective: [Section objective statement]
```

- "Objective:" is bold
- Statement is regular
- Spacing after: 6pt

### Stimulus Callout Box

```
┌─────────────────────────────────────────────┐
│ STIMULUS                                     │
│ [Description of materials for this section]  │
└─────────────────────────────────────────────┘
```

| Property         | Value           |
| ---------------- | --------------- |
| Background       | #F5F0E6 (Cream) |
| Left Border      | 3pt #CCCCCC     |
| Padding          | 8pt all sides   |
| "STIMULUS" Label | Bold, 9pt       |
| Content          | Regular, 9pt    |
| Spacing Before   | 10pt            |
| Spacing After    | 12pt            |

Always use visually distinct box, not inline text.

---

## 6. QUESTION FORMATTING

### Numbered Questions

```
1. [Question text]
2. [Question text]
```

| Property      | Value                                    |
| ------------- | ---------------------------------------- |
| Format        | Arabic numerals with period              |
| Indent        | 0.25 inch hanging                        |
| Spacing After | 6pt                                      |
| Numbering     | Continues across Topics within a Section |
| Resets        | At each new SECTION                      |

### Probe Format

```
    → PROBE: [Follow-up question]
```

| Property      | Value                               |
| ------------- | ----------------------------------- |
| Indent        | 0.5 inch from left margin           |
| Arrow         | → (Unicode 8594)                    |
| "PROBE:"      | Bold                                |
| Question      | Regular                             |
| Color         | #262626 (Dark Gray) for entire line |
| Spacing After | 3pt                                 |

---

## 7. SPECIAL ELEMENTS

### SAY Block

```
SAY: "[Script text for moderator to read verbatim]"
```

- "SAY:" is bold
- Script in quotation marks, regular weight

### Scenario Block

```
Scenario: "[Longer scenario description]"
场景：[Chinese translation]
```

- "Scenario:" is bold
- Chinese label 场景 in italics

### Moderator Note Box

```
────────────────────────────────────────────────
MODERATOR NOTE
[Instructions for moderator - not read aloud]
– [Term] ([pinyin]): [Definition]
────────────────────────────────────────────────
```

| Property         | Value                        |
| ---------------- | ---------------------------- |
| Borders          | 0.5pt #999999 top and bottom |
| Background       | None (white)                 |
| "MODERATOR NOTE" | Bold, Caps, #999999          |
| Content          | Regular, #999999             |
| Spacing Before   | 10pt                         |
| Spacing After    | 10pt                         |

### Chinese Text Formatting

All Chinese characters embedded in English text must be italicized.

Correct:

```
When you hear '*嘴巴嚼不停*' (jiáo bù tíng)...
```

Incorrect:

```
When you hear '嘴巴嚼不停' (jiáo bù tíng)...
```

- Chinese characters: Italic
- Pinyin in parentheses: Regular
- English translation: Regular

### Framing Statement

```
Framing: [Brief positioning statement for participants]
```

- "Framing:" is bold
- Statement is regular

---

## 8. LIST FORMATTING

### En-Dash Bullets (Primary)

```
– [Item text]
– [Item text]
```

| Property      | Value                     |
| ------------- | ------------------------- |
| Bullet        | – (en-dash, Unicode 8211) |
| Indent        | 0.25 inch                 |
| Hanging       | 0.25 inch                 |
| Spacing After | 3-6pt                     |

### No Full Stops

Bullet items should NOT end with periods unless complete sentences forming a paragraph.

### Nested Lists

```
– Level 1 item
  – Level 2 item
    – Level 3 item
```

Each level indents additional 0.25 inch.

---

## 9. COLOR REFERENCE

| Name         | Hex     | RGB           | Usage                                |
| ------------ | ------- | ------------- | ------------------------------------ |
| Nero (Black) | #000000 | 0, 0, 0       | Primary text, titles, headings       |
| Dark Gray    | #262626 | 38, 38, 38    | Subtitle, probes, sub-activities     |
| Moon Gray    | #999999 | 153, 153, 153 | Header/footer, moderator notes, time |
| Navy         | #0A1F44 | 10, 31, 68    | Section borders                      |
| Cream        | #F5F0E6 | 245, 240, 230 | Stimulus box background              |
| Border Gray  | #CCCCCC | 204, 204, 204 | Stimulus box border                  |

---

## 10. FONT REFERENCE

| Role     | Font            | Fallback |
| -------- | --------------- | -------- |
| Body     | Aptos           | Arial    |
| Headings | Aptos Display   | Arial    |
| Chinese  | DengXian (等线) | SimSun   |

### Size Scale (in points and half-points for OOXML)

| Element        | Points | Half-points |
| -------------- | ------ | ----------- |
| Title          | 16pt   | 32          |
| Section Header | 13pt   | 26          |
| Part Header    | 11pt   | 22          |
| Topic Header   | 10pt   | 20          |
| Exercise Title | 9.5pt  | 19          |
| Body / Default | 9pt    | 18          |

---

## 11. DOCUMENT END

### Closing Section

```
Closing:
Thank participants. Remind them their feedback will help shape [the project/product].
```

- "Closing:" is bold
- Spacing before: 15pt

### End Marker

```
– End of Discussion Guide –
```

| Property       | Value               |
| -------------- | ------------------- |
| Alignment      | Center              |
| Color          | #999999 (Moon Gray) |
| Spacing Before | 15pt                |

---

## 12. CHECKLIST

### Native Word Features (Critical for Editability)

- [ ] All en-dash bullets use `numbering.config`, NOT typed "–" characters
- [ ] All question numbers use `numbering.config` with `LevelFormat.DECIMAL`
- [ ] Each section has its own numbering reference (restarts at 1)
- [ ] All headings use `heading: HeadingLevel.HEADING_X` with `outlineLevel`
- [ ] Headings appear in Word's Navigation pane

### Setup

- [ ] Page size: A4
- [ ] Margins: 1 inch all sides
- [ ] Header: Logo + "[Project] DG | [Audience]" (no version number)
- [ ] Footer: "Page X of Y" centered, gray

### Front Matter (Page 1)

- [ ] Title: "DG: [Project Name]"
- [ ] Audience segment with group codes
- [ ] **Fieldwork:** line with label
- [ ] Target Groups with en-dash bullets
- [ ] Cohort Definition
- [ ] Core Research Tensions
- [ ] Pre-Task Notes
- [ ] Stimulus Available
- [ ] Page break after front matter

### Each Section

- [ ] Page break before section header
- [ ] Section title ≤40 characters
- [ ] Navy borders top and bottom
- [ ] Time right-aligned on same line
- [ ] Objective statement
- [ ] Stimulus in cream box (not inline)
- [ ] Parts labeled if multiple
- [ ] Topics with timing
- [ ] Exercises numbered within topics
- [ ] Questions numbered continuously within section
- [ ] Probes indented with → PROBE:

### Formatting

- [ ] Chinese characters italicized
- [ ] En-dash bullets (not hyphens)
- [ ] No full stops on bullet items
- [ ] Moderator notes in bordered box
- [ ] SAY: blocks for verbatim scripts

### Final

- [ ] Closing section
- [ ] End marker centered in gray

---

## 13. EXAMPLE PATTERNS

### Front Matter Block

```
DG: Oreo Mini-Thin Portfolio Management

Oreo Snack Biscuit Users (G3, G6)

Fieldwork: December 12-14, 2025 | Shanghai | 2.5 hours | 6 participants per group

Target Groups:
– G3: First Jobbers (23-27), Oreo Snack Biscuit BUMO, Sat Dec 13, 10:00-12:30
– G6: University Students (18-22), Oreo Snack Biscuit BUMO, Sun Dec 14, 13:30-16:00

Cohort Definition:
BUMO (brand used most often) = Oreo snack biscuit products (Mini Oreo, Cocoa Crispy Roll, Mini Cocoa Crisp). Heavy snackers (3+ times per week), biscuit consumers in past 3 months, non-Oreo rejectors.

Core Research Tensions:
– How do loyal Oreo users perceive Mini-Thin vs. existing formats?
– Can Mini-Thin unlock new occasions without cannibalizing existing snacking occasions?
– What format/flavor combinations drive incremental consumption vs. portfolio switching?
– Does Mini-Thin deliver the 'rebellious Oreo' identity needed for young adult social occasions?

Pre-Task Notes:
– Snacking Diary: 3-day video diary capturing snacking moments, contexts, and product choices
– Mini-Thin Mission: 2 packs of new product (1 flavor) to try at least twice before session

Stimulus Available:
– Mini-Thin product samples (3 flavors)
– Competitive product samples (Pocky, Pejoy, Mini Oreo)
– Packaging mock-ups: 8 SKUs
– Shelf display and engagement demo materials
– Concept board

                                                              [PAGE BREAK]
```

### Section Header Block

```
────────────────────────────────────────────────────────
SECTION 1: SNACKING & MUNCHING LANDSCAPE              30 MIN
────────────────────────────────────────────────────────

Objective: Understand munching habits, occasions, and category perceptions among Oreo users. Establish baseline snacking behaviors before introducing Mini-Thin.

┌─────────────────────────────────────────────────────┐
│ STIMULUS                                             │
│ Pre-task snacking diary videos                       │
└─────────────────────────────────────────────────────┘
```

### Question with Probes

```
4. When you hear '*嘴巴嚼不停*' (jiáo bù tíng), what kind of snacking comes to mind? Is it different from regular snacking?
    → PROBE: What products fit this description? What doesn't fit?
    → PROBE: What textures or sensations make something 'munchable'?
```

### Moderator Note

```
────────────────────────────────────────────────────────
MODERATOR NOTE
Key Chinese terms to listen for and explore:
– *上头* (shàng tóu): Addictive, hits different
– *解馋* (jiě chán): Satisfy cravings
– *低负担* (dī fù dān): Low burden, guilt-free
────────────────────────────────────────────────────────
```

---

## 14. TECHNICAL NOTES

### OOXML Style IDs

| Style          | ID            |
| -------------- | ------------- |
| Normal         | Normal        |
| Title          | Title         |
| Heading 1      | Heading1      |
| Heading 2      | Heading2      |
| Heading 3      | Heading3      |
| Heading 4      | Heading4      |
| List Paragraph | ListParagraph |
| Moderator Note | ModeratorNote |
| Probe          | Probe         |

### Numbering

| Purpose           | Bullet/Format      |
| ----------------- | ------------------ |
| En-dash bullets   | – (Unicode 8211)   |
| Section questions | 1. 2. 3. (decimal) |

### Unit Conversions

- 1 inch = 1440 twips
- 1 point = 20 twips
- Font sizes in OOXML are half-points (9pt = 18)

### Assets

1. **Inner Chapter Logo** - EMF format, embedded in header
   - Display size: ~31.5mm x 4.15mm
   - File: `assets/ic-logo.emf`

### Required Fonts

1. Aptos (primary)
2. Aptos Display (headings)
3. DengXian / 等线 (Chinese text)
