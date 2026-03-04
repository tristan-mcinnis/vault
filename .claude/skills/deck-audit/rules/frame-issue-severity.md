---
name: frame-issue-severity
category: frame
impact: high
tags: [severity, issues, classification]
description: Definitions for Critical/Major/Minor issue severity in deck audits
---

# Issue Severity Definitions

Classify issues consistently to enable accurate scoring and prioritized fixes.

## Severity Levels

| Severity | Definition | Impact on Argument |
|----------|------------|-------------------|
| **Critical** | Breaks the argument or misleads the reader | Deck cannot achieve its purpose |
| **Major** | Weakens the argument significantly | Reader may miss or misunderstand key points |
| **Minor** | Polish issues that don't block comprehension | Professional quality suffers but message lands |

## Critical Issues

The deck fundamentally fails if these aren't fixed:

- No clear insight or central claim
- Contradictory claims within the deck
- Missing executive summary (for 15+ slide decks)
- Circular logic (evidence restates conclusion)
- Key evidence is fabricated or misrepresented
- Recommendations don't follow from evidence

## Major Issues

Significantly weaken the deck's effectiveness:

- Topic labels instead of action titles
- Chart type obscures the data relationship
- Unsourced claims for key data points
- Single slide makes 3+ unrelated points
- Key evidence buried in appendix
- Missing "so what" synthesis between data and recommendations

## Minor Issues

Polish items for professional quality:

- Weak or obvious callouts
- Dense text that could be tightened
- Suboptimal (but not wrong) chart choice
- Inconsistent formatting (dates, currency, decimals)
- Faint colors or small fonts
- Unnecessary slides that don't harm the argument

## Classification Tips

Ask these questions:
1. **Could someone misunderstand the argument?** → Critical or Major
2. **Would a client notice this in a presentation?** → Major or Minor
3. **Would only a designer notice this?** → Minor

## Avoid

| Pattern | Problem |
|---------|---------|
| Everything is "major" | Loses signal; real problems get buried |
| Severity inflation for style preferences | "I prefer bar charts" isn't a major issue |
| Under-classifying narrative problems | Weak story structure is always Critical |

## Related Rules

- See [frame-scoring-rubric](frame-scoring-rubric.md) for how severity maps to point deductions
