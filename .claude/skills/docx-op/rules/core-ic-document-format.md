---
name: core-ic-document-format
category: core
impact: medium
tags: [docx, branding, formatting]
description: IC branding elements included in all generated documents
---

# IC Document Format

All generated documents include consistent Inner Chapter branding.

## Standard Elements

| Element | Format |
|---------|--------|
| Header | IC logo + document reference text |
| Footer | Centered "Page X of Y" |
| Font | Aptos (inherited from template styles) |
| Margins | 1 inch on all sides |
| Headings | Template styles (Heading1-4) |
| Divider | Navy blue line under title block |

## Discussion Guide Specifics

Discussion guides include specialized formatting beyond standard elements:

- **Section headers**: Heading1 + navy borders, uppercase title, timing badge
- **Parts**: Heading2 with timing
- **Topics**: Heading3
- **Questions**: ListParagraph, numbered within each section (resets per section)
- **Probes**: Probe style, indented with arrow prefix
- **SAY blocks**: Normal style, quoted moderator scripts
- **Moderator notes**: ModeratorNote style
- **Stimulus boxes**: Normal + cream background shading
- **Bilingual support**: Chinese on separate line below English

See `/dg-spec` for full JSON spec format and methodology guidance.

## Related Rules

- See [frame-ic-template-styles](frame-ic-template-styles.md) for style definitions
- See [frame-document-types](frame-document-types.md) for document type routing
