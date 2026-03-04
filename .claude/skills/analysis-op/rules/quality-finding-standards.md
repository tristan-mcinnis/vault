---
name: finding-standards
category: quality
impact: high
tags: [findings, evidence, claims, extraction]
description: Standards for extracting findings as claims with proper evidence support
---

# Finding Quality Standards

Findings must be claims (not topic labels) supported by evidence from research data.

## Requirements

| Element | Standard |
|---------|----------|
| **Format** | Claim statement, not topic label |
| **Evidence** | 3-6 evidence pointers per finding |
| **Frequency** | Document how often pattern appeared |
| **Variation** | Note exceptions and edge cases |
| **Confidence** | Assign confidence level (High/Medium/Low) |

## Claims vs Labels

| Label (Avoid) | Claim (Do This) |
|---------------|-----------------|
| "Youth" | "Young consumers (18-25) prefer limited drops over always-available products" |
| "Price sensitivity" | "Price acts as a quality signal; too-low prices trigger skepticism" |
| "Sustainability" | "Sustainability matters at purchase but doesn't drive discovery" |

## Evidence Pointer Format

```markdown
**Finding**: [Claim statement]
- Evidence 1: [Quote/observation] — P3, Session 2
- Evidence 2: [Quote/observation] — P7, Session 4
- Evidence 3: [Pattern note] — Observed in 5/8 participants
Frequency: 5/8 participants | Confidence: High
```

## Confidence Levels

| Level | Criteria |
|-------|----------|
| **High** | 5+ sources, consistent pattern, direct observation |
| **Medium** | 3-4 sources, some variation, mix of direct/reported |
| **Low** | 1-2 sources, needs validation, primarily self-reported |

## Avoid

| Pattern | Problem |
|---------|---------|
| Topic labels | No actionability |
| Single evidence pointer | Insufficient support |
| Missing frequency | Can't assess prevalence |
| No confidence level | Unclear reliability |

## Related Rules

- See [evidence-hierarchy](quality-evidence-hierarchy.md) for weighting evidence types
- See [quote-extraction](quality-quote-extraction.md) for verbatim quote standards
- See [insight-levels](frame-insight-levels.md) for elevating findings to insights
