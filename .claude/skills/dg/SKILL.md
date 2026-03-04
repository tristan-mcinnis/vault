---
name: dg
description: Create and render discussion guides for qualitative research. End-to-end workflow from brief to branded Word document. Use when user asks to "create a discussion guide", "draft a DG", "write the moderator guide", "make an IDI guide", "create an FGD guide", or "render the discussion guide". Supports IDIs, FGDs, and triads with bilingual (EN/ZH) support.
---

# Discussion Guide

Create and render discussion guides — from initial draft through iteration to final branded Word document. One skill, complete workflow.

## Workflow

```
Phase 1: DRAFT — Create structured markdown for iteration
Phase 2: ITERATE — Refine with user feedback
Phase 3: RENDER — Convert to JSON spec → docx-op → branded .docx
```

### Phase 1: Draft

1. **Gather context** from project knowledge base
2. **Draft guide** in structured markdown (readable, easy to edit)
3. **Present to user** for review

### Phase 2: Iterate

4. **Incorporate feedback** — revise sections, questions, timing
5. **Validate** — timing check, question count, objective mapping
6. **User confirms** the draft is final

### Phase 3: Render

7. **Convert markdown to JSON spec** following the schema below
8. **Render to Word** via docx-op:
   ```bash
   cat dg-spec.json | bun run .claude/skills/docx-op/tools/Generate.ts --type discussion_guide output.docx
   ```
9. **Save both artifacts** to project directory

**CRITICAL:** Never use `MarkdownToDocx.ts` for discussion guides — it breaks numbered lists. Always go through `Generate.ts --type discussion_guide`. See `rules/core-markdown-to-spec.md`.

## Local Context Fetching

Before drafting, fetch relevant context from the project directory:

```
1. Glob knowledge-base/*.md for available knowledge files
2. Read knowledge-base/sources.md to understand what's been processed
3. Glob discussion-guide/ for past DGs to reference style/approach
4. Read PROJECT.md for project terminology and conventions
5. Read 00-status.md for current project state
```

## Rules Index

Apply rules based on research type. Glob `rules/*.md` for full guidance.

| Rule | Impact | When to Apply |
|------|--------|---------------|
| `core-markdown-to-spec.md` | **CRITICAL** | Always — never skip JSON spec step |
| `frame-document-structure.md` | HIGH | Every draft — markdown template structure |
| `frame-question-funnel.md` | HIGH | Always — L1-L5 depth progression |
| `frame-session-templates.md` | HIGH | Always — duration/section parameters |
| `quality-question-writing.md` | HIGH | Always — single-barreled, 4-9/section |
| `quality-timing-constraints.md` | HIGH | Always — validate section/total duration |
| `quality-concept-testing.md` | HIGH | When testing concepts/stimulus |
| `core-bilingual-content.md` | MEDIUM | EN/ZH bilingual guides |
| `core-behavioral-context.md` | MEDIUM | Purchase/innovation research |
| `core-split-paths.md` | MEDIUM | Mixed samples with divergent questions |
| `frame-projective-exercises.md` | MEDIUM | When objectives need projective techniques |
| `core-client-adaptations.md` | LOW | VFC/Whitney or known client patterns |

## References

| Reference | Purpose |
|-----------|---------|
| `references/formatting-spec.md` | Typography, colors, spacing, page setup |
| `references/native-word-features.md` | docx-js patterns for bullets, numbering, styles |
| [docx-op SKILL.md](../docx-op/SKILL.md) | Template styles and generation details |

## Draft Output Format (Phase 1-2)

Save markdown drafts for iteration:

```
{project}/discussion-guide/dg-{method}-YYYYMMDD.md
```

**Examples:**
- `discussion-guide/dg-idi-20260123.md`
- `discussion-guide/dg-fgd-20260123.md`

Use `version: V1` in frontmatter, increment for structural changes.

### Markdown Structure

```markdown
---
version: V1
method: FGD | IDI | Triad
duration: 120
date: 2026-01-23
---

# DG: [Project Name]

## Research Objectives → Section Mapping
| Objective | Section | Time |
|-----------|---------|------|
| ... | ... | ... |

## SECTION 1: [TITLE] (XX min)
**Objective:** ...
**Stimulus:** ...

### Part A: [Title] (XX min)

**[SAY]** Moderator script text...

1. Question text? / 中文问题？
   - *Probe:* Follow-up?
   - *Probe:* Second follow-up?
   > *Moderator note:* Listen for specific cues

## Timing Validation
| Section | Allocated | Target |
|---------|-----------|--------|
| ... | ... | ... |
| **Total** | **XXX min** | **120 min** |
```

## JSON Spec Format (Phase 3)

```json
{
  "version": "1.0",
  "document_type": "discussion_guide",
  "front_matter": {
    "title": "DG: [Project Name]",
    "title_zh": "座谈会大纲：[中文项目名]",
    "audience": "[Segment] (G1, G2)",
    "fieldwork": "Date | Location | Duration | Participants per group",
    "target_groups": ["G1: ...", "G2: ..."],
    "cohort_definition": "Who qualifies...",
    "research_tensions": ["Research question?"],
    "pre_task_notes": ["Pre-task 1"],
    "stimulus_available": ["Stimulus item 1"]
  },
  "key_principles": [
    {"principle": "Moment-led", "description": "Start from occasions, not brands"}
  ],
  "sections": [
    {
      "id": "section-1",
      "title": "SECTION TITLE",
      "time_minutes": 30,
      "objective": "What this section aims to understand",
      "stimulus": "Materials used",
      "split_path": false,
      "moderator_note": "Optional section-level instruction",
      "parts": [
        {
          "id": "part-a",
          "title": "Part A: Title",
          "time_minutes": 15,
          "moderator_note": "Optional part-level instruction",
          "topics": [
            {
              "id": "topic-1",
              "title": "Topic Name",
              "time_minutes": 5,
              "exercises": [
                {
                  "id": "exercise-1",
                  "title": "Exercise Title",
                  "say_block": "Moderator script text...",
                  "questions": [
                    {
                      "id": "q1",
                      "text": "Question text?\n中文问题？",
                      "probes": ["Follow-up probe?"],
                      "moderator_note": "Listen for: specific cues"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "closing": {
    "text": "Thank participants...",
    "text_zh": "感谢参与..."
  }
}
```

## Render Output (Phase 3)

Save both the JSON source and rendered document:

```
{project}/discussion-guide/dg-spec-YYYYMMDD.json    # Source spec
{project}/discussion-guide/dg-YYYYMMDD.docx          # Rendered document
```

## Validation Rules

| Field | Rule |
|-------|------|
| title | Must start with "DG: " |
| section.title | Max 40 characters |
| research_tensions | Each should end with ? |
| time_minutes | Section time = sum of parts |
| Total duration | Must match method standard (see `rules/frame-session-templates.md`) |
| Questions per section | 4-9 (see `rules/quality-question-writing.md`) |

## Anti-Patterns

| Avoid | Do Instead |
|-------|------------|
| Jumping straight to JSON spec | Draft in markdown first for iteration |
| Using `MarkdownToDocx.ts` for DGs | Always use `Generate.ts --type discussion_guide` |
| Multiple sub-questions in one | Single-barreled, stand-alone questions |
| 10+ questions in 25-min section | 4-9 questions per section |
| Missing research objectives table | Map objectives to sections before drafting |
| Skipping timing validation | Include timing check table in every draft |
| Showing concepts without unaided capture | Ask "what would you want?" first |
| Questions not mapped to objectives | Every question traces to an objective |
