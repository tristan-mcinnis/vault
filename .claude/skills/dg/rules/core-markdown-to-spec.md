---
name: core-markdown-to-spec
category: core
impact: high
tags: [dg, generation, workflow]
description: Always convert markdown DG outlines to JSON spec before Word generation
---

# Markdown to Spec Conversion

**CRITICAL:** Never generate a Discussion Guide Word document directly from markdown using `MarkdownToDocx.ts`. Always convert to JSON spec first.

## Why This Matters

The `MarkdownToDocx.ts` converter does NOT handle numbered lists correctly:
- All numbered items render as "1." (no incrementing)
- Lists don't reset per section
- Native Word numbering features are not used

The `discussion_guide` document type via `Generate.ts` handles these correctly:
- Question numbers increment (1, 2, 3...)
- Numbering resets at each SECTION
- Uses native Word numbering (editable, restartable)
- Proper PROBE formatting with →
- Section headers with Navy borders and timing

## Workflow

```
❌ WRONG:
   Markdown outline → MarkdownToDocx.ts → Broken numbering

✅ CORRECT:
   Markdown outline → JSON spec → Generate.ts --type discussion_guide → Correct formatting
```

## When User Provides Markdown Outline

1. **Read the markdown** to understand structure and content
2. **Create JSON spec** following the schema in SKILL.md
3. **Render to Word** via:
   ```bash
   cat dg-spec.json | bun run .claude/skills/docx-op/tools/Generate.ts --type discussion_guide output.docx
   ```
4. **Save both files:**
   - `discussion-guide/dg-spec-YYYYMMDD.json` (source)
   - `discussion-guide/dg-YYYYMMDD.docx` (rendered)

## JSON Spec Structure Summary

```json
{
  "version": "1.0",
  "document_type": "discussion_guide",
  "front_matter": { ... },
  "key_principles": [ ... ],
  "sections": [
    {
      "id": "section-1",
      "title": "SECTION TITLE",
      "time_minutes": 15,
      "objective": "...",
      "parts": [
        {
          "topics": [
            {
              "exercises": [
                {
                  "say_block": "Moderator script...",
                  "questions": [
                    { "id": "q1", "text": "Question?\n中文？", "probes": [...] }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "closing": { ... }
}
```

## Pre-Tasks and Other Documents

For pre-tasks and simpler documents without complex numbered sections:
- Use **manual bold numbering** in markdown: `**1.** Question text`
- This renders as styled text, not broken Word lists
- Then use `MarkdownToDocx.ts` which handles bold text correctly

## Related

- See [SKILL.md](../SKILL.md) for full JSON schema
- See [formatting-spec.md](../references/formatting-spec.md) for Word formatting details
- See [quality-question-writing.md](quality-question-writing.md) for question standards
