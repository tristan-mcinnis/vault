---
name: screener
description: Create and render recruitment screeners for qualitative research. End-to-end workflow from recruitment criteria to branded Word document. Use when user asks to "create a screener", "draft the screener", "write screening questions", "build the recruitment screener", or "render the screener". Supports bilingual (EN/ZH) with hard-filter-first logic and quota tracking.
---

# Recruitment Screener

Create and render recruitment screeners — from requirements gathering through iteration to final branded Word document via docx-op.

## Workflow

```
Phase 1: DRAFT — Gather requirements, design screening questions
Phase 2: ITERATE — Refine with user feedback
Phase 3: RENDER — Convert to JSON spec → docx-op → branded .docx
```

### Phase 1: Draft

1. **Gather requirements** — study type, cohorts, screening criteria, fieldwork details
2. **Fetch project context** from knowledge base
3. **Design questions** — apply rules (hard-filter-first, single-barreled, specific timeframes)
4. **Present draft** to user in readable format for review

### Phase 2: Iterate

5. **Incorporate feedback** — adjust questions, quotas, criteria
6. **Validate** using QA checklist (`rules/quality-qa-checklist.md`)
7. **User confirms** the screener is final

### Phase 3: Render

8. **Create JSON spec** following the 7-section output format below
9. **Read production guide** (`references/production-guide.md`) before rendering
10. **Render to Word** via docx-op:
    ```bash
    cat screener-spec.json | bun run .claude/skills/docx-op/tools/Generate.ts --type screener output.docx
    ```
11. **Save both artifacts** to project directory

## Rules

| Rule | Impact | When to Apply |
|------|--------|---------------|
| [frame-question-sequencing](rules/frame-question-sequencing.md) | HIGH | Ordering questions |
| [frame-standard-actions](rules/frame-standard-actions.md) | HIGH | Writing action column |
| [frame-methodology-benchmarks](rules/frame-methodology-benchmarks.md) | MEDIUM | Scoping length |
| [quality-question-design](rules/quality-question-design.md) | HIGH | Writing questions |
| [quality-multi-layer-screening](rules/quality-multi-layer-screening.md) | HIGH | Attitudinal criteria |
| [quality-qa-checklist](rules/quality-qa-checklist.md) | HIGH | Pre-deployment validation |
| [core-bilingual-format](rules/core-bilingual-format.md) | MEDIUM | JSON structure |
| [core-china-localization](rules/core-china-localization.md) | MEDIUM | China market |

## References

| Reference | Purpose |
|-----------|---------|
| [references/question-design.md](references/question-design.md) | Standard question library (Q1-Q5), detailed examples |
| [references/template-structure.md](references/template-structure.md) | 7 sections, table formats, notation |
| [references/production-guide.md](references/production-guide.md) | docx-js implementation, code examples |
| [docx-op SKILL.md](../docx-op/SKILL.md) | Template styles and generation |

## Local Context Fetching

Before creating a screener, fetch context from the project directory:

```
1. Glob knowledge-base/*.md for available knowledge base files
2. Read knowledge-base/sources.md to understand what's been processed
3. Glob recruitment/screener/ for past screeners to reference
4. Read PROJECT.md for project terminology and conventions
5. Read 00-status.md for current project state
```

## 7 Required Sections

1. **Study Overview** — Logistics table
2. **Cohort Structure** — Definitions and recruitment notes
3. **Screener Questions** — Option/Code/Action tables
4. **Quality Check** — Talkability assessment
5. **Invitation** — Participation script
6. **Quick Reference** — Termination/cohort/mix tables
7. **Recruitment Quota** — Tracking table

## JSON Spec Format (Phase 3)

```json
{
  "version": "1.0",
  "document_type": "recruitment_screener",
  "overview": {
    "city": "Shanghai",
    "format": "2hr FGD, in-person",
    "groups": 6,
    "target": "Heavy snackers aged 18-34",
    "fieldwork": "December 12-14, 2025"
  },
  "cohorts": [
    { "id": "cohort-a", "name": "...", "definition": "...", "groups": ["G1", "G2"] }
  ],
  "recruitment_notes": ["– Exclude market research/advertising industries"],
  "questions": [
    {
      "id": "Q1",
      "topic": "Gender",
      "topic_zh": "性别",
      "multi_answer": false,
      "question": { "en": "What is your gender?", "zh": "请问您的性别是？" },
      "options": [
        { "text": { "en": "Female", "zh": "女性" }, "code": 1, "action": "Continue" }
      ],
      "quota_note": "50/50 split"
    }
  ],
  "quality_check": { "criteria": [], "test_question": { "en": "...", "zh": "..." } },
  "invitation": { "script": "...", "options": [] },
  "quick_reference": { "termination_criteria": [], "cohort_assignment": [], "mix_requirements": [] },
  "recruitment_quota": { "total": 42, "groups": [], "notes": [] }
}
```

## Output

Save both the JSON source and rendered document:

```
{project}/recruitment/screener/screener-spec-YYYYMMDD.json   # Source spec
{project}/recruitment/screener/screener-YYYYMMDD.docx         # Rendered document
```

## Anti-Patterns

| Avoid | Do Instead |
|-------|------------|
| Late hard filters (Q25) | Hard filters in Q1-Q5 |
| Single-question attitudinal | Multi-layer: awareness → understanding → resonance |
| Prose skip logic | Action column: Continue, Terminate |
| Missing Quality Check | Always include Talkability Assessment |
| Skipping QA checklist | Run `quality-qa-checklist.md` before rendering |
