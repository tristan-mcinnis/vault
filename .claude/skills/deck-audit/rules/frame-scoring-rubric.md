---
name: frame-scoring-rubric
category: frame
impact: high
tags: [scoring, assessment, grades]
description: Scoring methodology for deck audits with grade scale and point deductions
---

# Scoring Rubric

Standardized scoring system for deck audits.

## Grade Scale

| Score | Grade | Meaning |
|-------|-------|---------|
| 90-100 | A | Client-ready. Minor polish only. |
| 80-89 | B | Strong deck. Targeted fixes needed. |
| 70-79 | C | Acceptable. Multiple issues to address. |
| 60-69 | D | Below standard. Significant rework needed. |
| <60 | F | Not deliverable. Fundamental problems. |

## Scoring Approach

Start at 100, deduct points based on issue severity:

| Severity | Deduction | Examples |
|----------|-----------|----------|
| **Critical** | −15 points | Broken narrative, missing key insight, no exec summary, circular logic |
| **Major** | −5 points | Topic labels instead of action titles, wrong chart type, missing sources, slide makes 3+ points |
| **Minor** | −1 point | Weak callout, dense text, suboptimal chart choice, minor inconsistency |

**Floor:** Cap at 0 (no negative scores).

## Calibration Tips

- A deck can fail (D/F) with no critical issues if it has 4+ major issues
- Multiple minor issues compound—10 minor issues = 1 major issue worth of concern
- Context matters: a workshop deck has different standards than a board presentation

## Avoid

| Pattern | Problem |
|---------|---------|
| Grading on effort | "They worked hard" doesn't fix weak narrative |
| Anchor bias | Don't compare to worst deck you've seen; compare to standard |
| Halo effect | One strong section doesn't save a weak deck |

## Related Rules

- See [frame-issue-severity](frame-issue-severity.md) for severity definitions
- See [quality-calibration](quality-calibration.md) for context-specific standards
