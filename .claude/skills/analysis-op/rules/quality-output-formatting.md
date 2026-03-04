---
name: output-formatting
category: quality
impact: medium
tags: [formatting, consistency, markdown, em-dash, implications]
description: Formatting conventions for analysis output consistency
---

# Output Formatting Standards

## Strategic Implications Format

When writing numbered strategic implications or recommendations in consumer summaries and takeaways, use the **label + colon** format:

```markdown
1. **Short label:** Explanation text that elaborates on the implication.
2. **Another label:** Further detail and reasoning.
```

**Do NOT** use the statement-period format:

```markdown
1. **This is a full sentence.** Then more text follows.
```

The label + colon format is easier to scan and separates the what (label) from the why (explanation).

## Em Dash Restraint

Limit em dash (—) usage to 2-3 per page maximum. Overuse is an AI writing tell.

**Acceptable uses:**
- Genuine dramatic pause or emphasis
- Setting off a parenthetical that benefits from a strong break
- Inside verbatim participant quotes (never edit these)

**Replace with:**
- Commas for simple appositives
- Colons when introducing an explanation
- Semicolons for related independent clauses
- Periods when clauses can stand as separate sentences
- Parentheses for supplementary information

## Blockquote Convention

Verbatim participant quotes use markdown blockquotes with attribution outside the closing quote:

```markdown
> "Quote text here." - Participant Name
```

- Attribution comes **after** the closing quotation mark
- Use ` - ` (space-hyphen-space) for attribution, not em dash
- In Word output, blockquotes render with the Probe style (Aptos 9pt)

## Related Rules

- See [quote-extraction](quality-quote-extraction.md) for verbatim quote standards
- See [recommendation-standards](quality-recommendation-standards.md) for formal SMART recommendations
