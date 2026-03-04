---
name: deck-audit
description: Audit presentation decks for strategic clarity, argument strength, and consulting-grade quality. Evaluates narrative flow, slide architecture, data visualization, and insight quality. Use when reviewing decks before client delivery, assessing work from team members, or evaluating external presentations.
---

# Deck Audit

Evaluate presentations for strategic clarity, argument quality, and consulting-grade standards. Assesses intellectual rigor—not brand compliance or formatting, but whether the thinking is sound and the story is compelling.

## When to Use

- Pre-delivery quality gate for client decks
- Peer review of team presentations
- Assessing pitch decks or strategy documents
- Post-mortem on decks that didn't land

## Rules Index

| Rule | Impact | When to Apply |
|------|--------|---------------|
| [frame-scoring-rubric](rules/frame-scoring-rubric.md) | HIGH | Every audit — grade scale and point deductions |
| [frame-issue-severity](rules/frame-issue-severity.md) | HIGH | Classifying issues found during review |
| [quality-litmus-tests](rules/quality-litmus-tests.md) | HIGH | Quick check before detailed analysis |
| [quality-calibration](rules/quality-calibration.md) | MEDIUM | Adjusting standards by deck type |

## References (Deep Dives)

| Reference | Content |
|-----------|---------|
| [macro-strategic-logic](references/macro-strategic-logic.md) | Horizontal logic, SCQA, argument progression, insight visibility |
| [meso-slide-architecture](references/meso-slide-architecture.md) | One idea per slide, action titles, visual hierarchy, CRAP principles |
| [micro-data-visualization](references/micro-data-visualization.md) | Chart selection, signal-to-noise, sources, annotations |
| [anti-patterns](references/anti-patterns.md) | 25+ common failures across narrative, slides, visuals, evidence |

## Analysis Framework

Three-level assessment from strategic to tactical:

| Level | Focus | Key Question | Reference |
|-------|-------|--------------|-----------|
| **Macro** | Strategic logic | Does the story work? | [macro-strategic-logic](references/macro-strategic-logic.md) |
| **Meso** | Slide architecture | Does each slide earn its place? | [meso-slide-architecture](references/meso-slide-architecture.md) |
| **Micro** | Data and evidence | Does the proof support the claim? | [micro-data-visualization](references/micro-data-visualization.md) |

## Workflow

### Step 1: Ingest the Deck

```bash
# PDF: Convert to images for visual analysis
pdftoppm -jpeg -r 150 deck.pdf slide

# PPTX: Extract text + generate thumbnails
python -m markitdown deck.pptx > deck-content.md
python .claude/skills/pptx/scripts/thumbnail.py deck.pptx audit-view --cols 4
```

### Step 2: Run Litmus Tests

Apply the 5 quick checks from [quality-litmus-tests](rules/quality-litmus-tests.md). Document pass/fail.

### Step 3: Horizontal Logic Scan

Read slide titles in sequence:
1. Do they form a coherent narrative?
2. Could you tell the story from titles alone?
3. Where are the logical gaps?

### Step 4: Per-Slide Assessment

For each slide (or 5-8 key slides for long decks):
1. Classify slide type (title, content, data, summary)
2. Assess against Meso criteria
3. If data slide: assess against Micro criteria
4. Note issues with severity per [frame-issue-severity](rules/frame-issue-severity.md)

### Step 5: Score and Report

Apply [frame-scoring-rubric](rules/frame-scoring-rubric.md) and generate report using Output Format below.

## Output Format

```markdown
# Deck Audit: [Deck Name]

**Source**: [file path]
**Slides reviewed**: [N total, N in detail]
**Date**: [Today]

---

## Summary

**Score**: [XX]/100 ([Grade])

**One-line verdict**: [Single sentence assessment]

**Strengths**:
- [What works well]

**Critical issues**:
- [Most important problem]

---

## Litmus Tests

| Test | Result |
|------|--------|
| CEO Test | PASS/FAIL |
| Competitor Test | PASS/FAIL |
| Delete Test | PASS/FAIL |
| 5-Year Test | PASS/FAIL |
| Reverse Test | PASS/FAIL |

---

## Macro Assessment: Strategic Logic

**Horizontal logic**: [PASS / WARN / FAIL]
[Commentary]

**SCQA structure**: [PASS / WARN / FAIL]
[Commentary]

---

## Meso Assessment: Slide Architecture

**Slides with issues**:

| Slide | Issue | Severity | Recommendation |
|-------|-------|----------|----------------|
| 3 | Topic label title | Major | Rewrite as claim |

---

## Micro Assessment: Data & Evidence

**Specific issues**:

| Slide | Issue | Severity | Recommendation |
|-------|-------|----------|----------------|
| 5 | Pie chart for trend data | Major | Use line chart |

---

## Recommendations

### Priority 1 (Do First)
1. [Most impactful fix]

### Priority 2 (Important)
1. [Fix]

---

## Appendix: Title Sequence

1. [Slide 1 title]
2. [Slide 2 title]
[Flag breaks with →→ BREAK ←← notation]
```

## Anti-Patterns

See [anti-patterns](references/anti-patterns.md) for comprehensive catalog of common failures.
