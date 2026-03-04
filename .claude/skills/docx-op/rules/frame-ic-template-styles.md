---
name: frame-ic-template-styles
category: frame
impact: high
tags: [docx, template, styles, formatting]
description: IC template style reference - which style for what purpose
---

# IC Template Styles

All generated documents use external styles from the IC template file at `.claude/skills/docx-op/assets/ic-template.docx`. Paragraphs reference styles by name (e.g., `style: "Heading1"`) rather than using inline formatting.

## Style Reference

| Style ID | Usage |
|----------|-------|
| `Title` | Document title |
| `Heading1` | Section headers (DG sections, major heads) |
| `Heading2` | Part headers, subsections |
| `Heading3` | Topic/exercise headers |
| `Heading4` | Minor subheadings |
| `Normal` | Body text, objectives, SAY blocks |
| `ListParagraph` | Numbered questions, bullet lists |
| `ModeratorNote` | Moderator instructions (gray) |
| `Probe` | Interview probes and blockquotes/verbatim quotes (indented, dark gray, Aptos 9pt) |
| `Strong1` | Bold emphasis |
| `Header` | Page header text |
| `Footer` | Page footer text |

## Modifying Styles

To modify styles, edit the template in Word and save — all future documents will inherit the changes.

## Architecture

`Generate.ts` loads `styles.xml` from the template via JSZip and passes it to the docx-js `Document` constructor as `externalStyles`.

## Related Rules

- See [frame-document-types](frame-document-types.md) for document type taxonomy
- See [core-ic-document-format](core-ic-document-format.md) for branding elements
