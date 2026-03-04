---
name: quality-qa-checklist
category: quality
impact: high
tags: [screener, qa, validation]
description: Pre-deployment checklist for screener validation
---

# QA Checklist

Validate every screener before deployment.

## Criteria Coverage

- [ ] Every recruitment criterion maps to 1+ screening questions
- [ ] Attitudinal criteria have multi-layered screening (awareness → understanding → resonance)
- [ ] Quota variables are explicitly tracked (gender, age, cohort)
- [ ] No criterion is assumed without a question

## Format Consistency

- [ ] All questions use Option / Code / Action table format
- [ ] Bilingual text (EN/ZH) on all options
- [ ] (MA) notation on multi-answer questions
- [ ] Numeric codes on every option (1, 2, 3...)

## Section Completeness

- [ ] Study Overview table present
- [ ] Cohort Structure defined
- [ ] Quality Check (Talkability Assessment) included
- [ ] Invitation script present

## Quick Reference Complete

- [ ] Termination Criteria table filled
- [ ] Cohort Assignment table filled
- [ ] Mix Requirements table filled

## Routing Logic

- [ ] Hard filters in Q1-Q5
- [ ] No orphaned questions (every path leads somewhere)
- [ ] Conditional questions have valid triggers
- [ ] All cohort assignments are reachable

## Common Failures

| Checkpoint | Common Miss |
|------------|-------------|
| Criteria coverage | Attitudinal criteria with single question |
| Format | Missing codes on "Other" options |
| Sections | No Quality Check section |
| Quick Reference | Empty Mix Requirements |

## Related Rules

- See [frame-question-sequencing](frame-question-sequencing.md) for ordering
- See [quality-multi-layer-screening](quality-multi-layer-screening.md) for attitudinal criteria
