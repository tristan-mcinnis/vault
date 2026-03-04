---
name: frame-question-sequencing
category: frame
impact: high
tags: [screener, sequencing, hard-filters]
description: Question ordering logic - hard filters first, then behavioral, then quality check
---

# Question Sequencing

Place hard filters early to avoid wasting recruiter time. Behavioral screening comes after qualification.

## Standard Sequence

| Order | Questions | Purpose |
|-------|-----------|---------|
| Q1 | Gender | Quota tracking |
| Q2 | Age | Cohort assignment |
| Q3-Q5 | Hard filters | Industry, research participation, exclusions |
| Q6+ | Behavioral | Category-specific screening |
| Second-to-last | Quality Check | Talkability assessment |
| Final | Invitation | Session invitation |

## Rationale

- **Hard filters first** — Terminate unqualified respondents before investing time in detailed questions
- **Demographics before behavior** — Establishes quota variables early
- **Quality check near end** — Only assess talkability for otherwise-qualified respondents

## Avoid

| Pattern | Problem |
|---------|---------|
| Industry exclusion at Q25 | Wastes 20+ questions on disqualified respondent |
| Behavioral questions before age | Can't route to cohorts properly |
| Quality check in middle | May terminate before completing screening |

## Related Rules

- See [frame-standard-actions](frame-standard-actions.md) for action vocabulary
- See [references/question-design.md](../references/question-design.md) for standard question library
