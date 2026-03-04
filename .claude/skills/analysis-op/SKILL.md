---
name: analysis-op
description: Cross-source qualitative analysis pipeline — extract findings, map tensions, elevate insights, develop implications, and frame recommendations. Use when user asks to "extract findings", "map tensions", "elevate insights", "write implications", or "frame recommendations" from multiple research sources. For single-transcript framework extraction (JTBD, brand, behaviors), use /transcript-analysis instead.
---

# Qualitative Analysis

Extract findings, map tensions, elevate insights, and frame recommendations from research data.

## Rules Index

| Rule | Impact | Purpose |
|------|--------|---------|
| [frame-insight-levels](rules/frame-insight-levels.md) | HIGH | L1/L2/L3 elevation framework |
| [frame-strategic-choice](rules/frame-strategic-choice.md) | HIGH | DO/DON'T/BECAUSE tradeoff frame |
| [frame-priority](rules/frame-priority.md) | MEDIUM | P1/P2/P3/P4 impact/feasibility matrix |
| [quality-insight-test](rules/quality-insight-test.md) | HIGH | 6-point validation checklist |
| [quality-finding-standards](rules/quality-finding-standards.md) | HIGH | Claims + 3-6 evidence pointers |
| [quality-evidence-hierarchy](rules/quality-evidence-hierarchy.md) | MEDIUM | Direct obs > patterns > self-reported > secondary |
| [quality-quote-extraction](rules/quality-quote-extraction.md) | MEDIUM | Verbatim quotes with attribution |
| [quality-recommendation-standards](rules/quality-recommendation-standards.md) | HIGH | SMART criteria for actionable recommendations |
| [quality-output-formatting](rules/quality-output-formatting.md) | MEDIUM | Consistent formatting: implications, quotes, em dash restraint |
| [core-tension-mapping](rules/core-tension-mapping.md) | MEDIUM | Force A vs Force B pattern identification |

## Typical Flow

```
1. Transcripts → Extract_Findings → Findings Pack (5-8 claims)
2. Findings → Map_Tensions → Tension Map (Force A vs Force B)
3. Tensions → Elevate_Insights → Insight Cards (L3 with tradeoffs)
4. Insights → Develop_Implications → Implications Pack (by function)
5. Implications → Frame_Recommendations → Recommendation Framework (P1/P2/P3)
```

## Local Context Fetching

Before analysis, gather context from the project directory:

```
1. Glob knowledge-base/*.md for available knowledge base files
2. Read knowledge-base/sources.md to understand what's been processed
3. Glob transcripts/ for formatted transcripts (consumer/, expert/, meeting/)
4. Read PROJECT.md for project terminology and conventions
5. Read 00-status.md for current project state
```

**Key knowledge base files** (discover what exists via glob):
- `market-context*.md` - Market data, demand spaces, competition
- `consumer-insights*.md` - Existing consumer insights to build on
- `brand-positioning*.md` - Brand associations, positioning
- `research-objectives*.md` - Research questions, methodology

## Local Output

After each analysis step, save to the project directory:

```
1. Save to: analysis/findings/[type]-[segment]-[date].md
2. File naming: FN (Findings), TM (Tension Map), IN (Insights), IM (Implications), RC (Recommendations)
3. Example: analysis/findings/FN-key-city-20260215.md
4. Include Agent use line for downstream consumption
```

**Output directory structure:**
```
analysis/
├── findings/           # Findings packs, tension maps, insights
│   ├── FN-*.md
│   ├── TM-*.md
│   └── IN-*.md
└── (other analysis outputs)
    ├── IM-*.md
    └── RC-*.md
```

## Anti-Patterns

| Avoid | Do Instead |
|-------|------------|
| Topic labels instead of claims | "Young consumers want X" not "Youth" |
| Single-source insights | Pattern across 3+ sources |
| L1/L2 insights in final output | Elevate to L3 with tradeoff |
| Recommendations without owner | Every recommendation has clear owner |
| Implications without insight trace | Every implication traces to insight(s) |
