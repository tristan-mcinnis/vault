---
name: frame-document-types
category: frame
impact: high
tags: [docx, document-types, generation]
description: Document type taxonomy - supported types and when to use each
---

# Document Types

Use `Generate.ts` with the `--type` flag to generate specific document formats.

## Supported Types

| Type | Purpose | Spec Skill |
|------|---------|------------|
| `screener` | Recruitment screener with questions, quotas, cohort structure | `/screener-spec` |
| `transcript` | Interview/focus group transcript with speaker labels | `/transcript-op` |
| `takeaway` | Expert interview summary with structured sections | — |
| `ic-document` | Generic IC document with headings and content | — |
| `discussion_guide` | Moderator guide with sections, parts, questions, probes, timing | `/dg-spec` |

## Routing

- **Have research objectives?** → Use `/dg-spec` to create discussion guide spec → render with `--type discussion_guide`
- **Have recruitment criteria?** → Use `/screener-spec` to create screener spec → render with `--type screener`
- **Have transcript to format?** → Use `/transcript-op` to create transcript spec → render with `--type transcript`
- **Have expert interview notes?** → Create takeaway spec manually → render with `--type takeaway`
- **Generic document?** → Use `--type ic-document` or prefer `MarkdownToDocx.ts`

## Avoid

| Pattern | Problem |
|---------|---------|
| Using `ic-document` for structured content | Loses semantic formatting; use specific type |
| Skipping spec skill | Spec skills encode methodology; JSON alone misses quality standards |

## Related Rules

- See [frame-ic-template-styles](frame-ic-template-styles.md) for style reference
