---
name: frame-document-structure
category: frame
impact: high
tags: [dg-draft, markdown, template]
description: Markdown template structure for discussion guide drafts
---

# Document Structure

The standard markdown structure for discussion guide drafts.

## Frontmatter

```yaml
---
date: 2026-01-23
type: discussion-guide
method: IDI | FGD
city: Shanghai
duration: 90 min
respondents: 8 (description of sample)  # for IDI
groups: 2 (description of groups)        # for FGD
fieldwork: 2026-02-02 to 2026-02-04
concepts: 6 (rotation note if applicable)
language: bilingual (EN/ZH) | English | Mandarin
version: V1
---
```

## Document Template

```markdown
# Discussion Guide: [Location] [Method] — [Project Name]
# [Chinese title if bilingual]

**Duration:** X minutes per interview/group
**Sample:** [Description]
**Concepts:** [If applicable]

---

## Research Objectives

| # | Objective | Sections |
|---|-----------|----------|
| 1 | Objective text | S2, S3 |

---

## Key Principles for Moderator

1. **Principle name:** Brief description
2. **Principle name:** Brief description

---

## SECTION 1: Section Title (X min)

**Objective:** What this section aims to understand

---

[Preamble text for moderator to read, if any]

[Chinese translation if bilingual]

1. Question text?
   中文问题？
   - PROBE: Follow-up question? 追问？

2. Next question?
   下一个问题？

---

## SECTION 2: Next Section (X min)

[Continue pattern...]

---

## Moderator Notes

### Materials Needed
- [ ] Item 1
- [ ] Item 2

### Timing Check

| Section | Duration | Cumulative |
|---------|----------|------------|
| S1: Title | X min | X min |
| S2: Title | X min | XX min |

### [Special Protocols]

[Any reactive-only protocols, rotation plans, etc.]
```

## Section Rules

- Number sections sequentially: SECTION 1, SECTION 2, etc.
- Each section has: title, duration, objective
- Use `---` horizontal rules to separate sections visually

## Question Rules

- Number questions sequentially within each section (restart at 1)
- Bilingual: EN first, ZH indented below on same question
- Probes are indented bullets with `PROBE:` prefix

## Avoid

| Pattern | Problem |
|---------|---------|
| Mixing section numbering (S1, Section 2, 3.) | Inconsistent, hard to navigate |
| Questions without section objectives | Unclear what you're learning |
| Missing timing check table | Can't validate total duration |

## Related Rules

- See [dg-spec/quality-timing-constraints](../../dg-spec/rules/quality-timing-constraints.md) for duration budgets
- See [dg-spec/quality-question-writing](../../dg-spec/rules/quality-question-writing.md) for question crafting
- See [dg-spec/core-bilingual-content](../../dg-spec/rules/core-bilingual-content.md) for EN/ZH format
