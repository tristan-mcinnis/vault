---
name: recommendation-standards
category: quality
impact: high
tags: [recommendations, SMART, actionability, delivery]
description: SMART criteria and quality standards for actionable recommendations
---

# Recommendation Quality Standards

Recommendations must be actionable, traceable, and owned. Use SMART criteria.

## SMART Criteria

| Element | Requirement | Example |
|---------|-------------|---------|
| **S**pecific | Clear, detailed action | "Launch 3 limited-edition colorways" not "Do limited editions" |
| **M**easurable | Success criteria defined | "Target 80% sell-through in 48 hours" |
| **A**ctionable | Within client's control | "Partner with 2 local artists" not "Change consumer behavior" |
| **R**esourced | Budget/team identified | "Requires $50K creative budget, brand team lead" |
| **T**imed | Deadline or timeline | "Q2 2026 launch window" |

## Required Elements

| Element | Standard |
|---------|----------|
| **Action** | SMART-compliant statement |
| **Insight trace** | Links to supporting insight(s) |
| **Owner** | Named role or function |
| **Priority** | P1/P2/P3/P4 classification |
| **Fallback** | Alternative if primary blocked |

## Format

```markdown
### Recommendation: Launch limited-edition artist collaborations

**Action**: Partner with 2 local artists for limited-edition colorways (3 SKUs each),
with 48-hour exclusive drops on owned channels.

**SMART Check**:
- Specific: 2 artists, 3 SKUs each, 48-hour drops
- Measurable: 80% sell-through target
- Actionable: Brand team can execute
- Resourced: $50K creative, $20K media
- Timed: Q2 2026

**Traces to**: Insight #3 (Scarcity signals desirability)
**Owner**: Brand Marketing Lead
**Priority**: P1
**Fallback**: If artist partnership delayed, launch brand-designed limited run
```

## Avoid

| Pattern | Problem |
|---------|---------|
| Vague actions | "Improve experience" — not actionable |
| No owner | Orphaned, won't happen |
| Missing trace | Disconnected from insights |
| No fallback | Single point of failure |
| All P1s | Lack of prioritization |

## Quality Check

Before including a recommendation:
1. Can someone execute this without asking for clarification?
2. Is the owner named and accountable?
3. Does it trace clearly to an insight?
4. Is there a fallback option?
5. Is the priority justified?

## Related Rules

- See [priority](frame-priority.md) for P1/P2/P3/P4 framework
- See [strategic-choice](frame-strategic-choice.md) for framing tradeoffs
- See [insight-levels](frame-insight-levels.md) for insight requirements
