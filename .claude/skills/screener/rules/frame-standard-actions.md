---
name: frame-standard-actions
category: frame
impact: high
tags: [screener, actions, routing]
description: Standard action vocabulary for screener routing logic
---

# Standard Actions

Every screener option must have an action. Use this controlled vocabulary.

## Action Vocabulary

| Action | Usage | When to Use |
|--------|-------|-------------|
| `Continue` | Proceed to next question | Qualified, no cohort assignment yet |
| `Terminate` | Disqualify respondent | Fails hard filter |
| `Continue → [Cohort]` | Proceed and assign to cohort | Meets cohort criteria (e.g., age range) |
| `Must select` | Required for qualification | Category participation minimums |
| `Record` | Capture but not qualifying | Useful data, not a filter |
| `Thank and Close` | End screening politely | Invitation declined |

## Usage Notes

- **Terminate** should appear in Q1-Q5 (hard filters)
- **Continue → [Cohort]** typically appears in Q2 (age-based assignment)
- **Must select** requires a note below the table: `Requirement: Must select Code 1`
- **Record** captures secondary data without affecting qualification

## Avoid

| Pattern | Problem |
|---------|---------|
| Prose skip logic ("If no, skip to Q10") | Ambiguous, error-prone |
| Missing action column | Recruiter doesn't know what to do |
| "Go to Q15" style routing | Complex, hard to maintain |

## Related Rules

- See [frame-question-sequencing](frame-question-sequencing.md) for where actions appear
