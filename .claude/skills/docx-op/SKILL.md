---
name: docx-op
description: Word document engine — extraction, editing, comments, generation, and metadata. Infrastructure skill called by /screener, /dg, /transcript, /meeting, and /report for rendering branded .docx files. Use directly when user asks to "extract text from a Word doc", "add comments to docx", "convert markdown to Word", or needs low-level document manipulation. Do NOT use for creating research deliverables (use the appropriate content skill instead).
---

# Word Document Operations

Extract, edit, and generate Word documents using IC template styles.

## Rules Index

| Rule | Impact | When to Apply |
|------|--------|---------------|
| [frame-ic-template-styles](rules/frame-ic-template-styles.md) | HIGH | Choosing paragraph styles for generation |
| [frame-document-types](rules/frame-document-types.md) | HIGH | Selecting document type for `Generate.ts` |
| [core-ic-document-format](rules/core-ic-document-format.md) | MEDIUM | Understanding IC branding elements |
| [quality-comment-anchor-text](rules/quality-comment-anchor-text.md) | HIGH | Processing feedback comments |

---

## Content Extraction

```bash
# Plain text
bun run .claude/skills/docx-op/tools/ContentExtractor.ts document.docx --text

# Markdown
bun run .claude/skills/docx-op/tools/ContentExtractor.ts document.docx --markdown

# Structured JSON
bun run .claude/skills/docx-op/tools/ContentExtractor.ts document.docx --structure
```

## Editing with Tracked Changes

```bash
# 1. Unpack the document
bun run .claude/skills/docx-op/tools/OoxmlManager.ts unpack document.docx ./editing

# 2. List tracked changes
bun run .claude/skills/docx-op/tools/TrackedChanges.ts list ./editing

# 3. Accept/reject changes
bun run .claude/skills/docx-op/tools/TrackedChanges.ts accept-all ./editing

# 4. Repack to DOCX
bun run .claude/skills/docx-op/tools/OoxmlManager.ts pack ./editing document-edited.docx
```

## Comments

```bash
# List comments (shows comment + anchor text)
bun run .claude/skills/docx-op/tools/CommentManager.ts list document.docx

# Add comment to paragraph 0 (requires unpacked dir)
bun run .claude/skills/docx-op/tools/CommentManager.ts add ./editing 0 "Comment text"

# Reply to comment
bun run .claude/skills/docx-op/tools/CommentManager.ts reply ./editing 1 "Reply text"
```

See [quality-comment-anchor-text](rules/quality-comment-anchor-text.md) for processing feedback.

## Metadata

```bash
# Read
bun run .claude/skills/docx-op/tools/MetadataManager.ts read document.docx

# Update
bun run .claude/skills/docx-op/tools/MetadataManager.ts update doc.docx out.docx \
  --title "My Document" --author "Author Name"
```

---

## Document Generation

### Markdown to Word (Recommended)

```bash
# Basic conversion
bun run .claude/skills/docx-op/tools/MarkdownToDocx.ts input.md output.docx

# With custom title/subtitle
bun run .claude/skills/docx-op/tools/MarkdownToDocx.ts input.md output.docx --title "Report Title" --subtitle "Subtitle"

# Output JSON spec only (for inspection/debugging)
bun run .claude/skills/docx-op/tools/MarkdownToDocx.ts input.md output.json --spec-only
```

Handles: headings (H1-H4), bullet lists (en dash), numbered lists, paragraphs, blockquotes, tables. First H1 becomes title, next line becomes subtitle.

### JSON Spec to Word

```bash
# Generate from JSON spec
cat spec.json | bun run .claude/skills/docx-op/tools/Generate.ts --type <type> output.docx

# Or with input file
bun run .claude/skills/docx-op/tools/Generate.ts --type <type> --input spec.json output.docx
```

See [frame-document-types](rules/frame-document-types.md) for supported types and routing to spec skills.

### Example: Takeaway Spec

```json
{
  "version": "1.0",
  "document_type": "takeaway",
  "metadata": {
    "title": "Expert Interview Takeaway",
    "expert": "Expert Name",
    "role": "Expert Role",
    "date": "2026-01-21",
    "project": "Project Name"
  },
  "sections": [
    { "heading": "Key Insights", "level": 1 },
    { "heading": "Theme One", "level": 2, "bullets": ["Point A", "Point B"] },
    { "heading": "Theme Two", "level": 2, "content": "Narrative paragraph text." }
  ]
}
```

---

## Advanced Editing (Python)

For complex editing (tracked changes, DOM manipulation), use the Python Document library:

```bash
PYTHONPATH=.claude/skills/docx-op python your_script.py
```

```python
from scripts.document import Document

doc = Document('./editing', author="Claude", initials="C")

# Find and replace with tracked changes
node = doc["word/document.xml"].get_node(tag="w:r", contains="old text")
# ... manipulation code

doc.save()
```

See `docs/ooxml.md` for complete OOXML technical reference.

---

## Tools Reference

| Tool | Purpose |
|------|---------|
| `MarkdownToDocx.ts` | Convert Markdown to IC Word document |
| `Generate.ts` | Generate DOCX from JSON spec |
| `ContentExtractor.ts` | Extract text/structure from DOCX |
| `OoxmlManager.ts` | Unpack/repack DOCX for editing |
| `TrackedChanges.ts` | Manage revision tracking |
| `CommentManager.ts` | Add/reply/delete comments |
| `MetadataManager.ts` | Read/write document properties |
| `scripts/document.py` | Python Document class for advanced editing |
