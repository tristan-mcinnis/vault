---
name: synthesis
description: >
  Synthesize findings across multiple research sources. Use this skill when:
  (1) User has multiple transcripts and wants unified themes across them (corpus synthesis),
  (2) User wants to identify distinct consumer segments from research (segment synthesis),
  (3) User has 2+ expert interview takeaways for a market and wants a combined synthesis or "expert takeaways" write-up,
  (4) User asks to "synthesize", "combine", or "write up takeaways" across multiple sources,
  (5) User is preparing final deliverables and needs cross-source patterns.
  Do NOT use for single-source analysis (use /analysis-op instead).
---

# Research Synthesis Skill

Synthesize findings across multiple research sources.

## Synthesis Types Available

| Type | Purpose | Reference |
|------|---------|-----------|
| **corpus** | Unified themes across multiple sources | [[references/corpus]] |
| **segments** | Identify and characterize consumer segments | [[references/segments]] |
| **expert** | Synthesize expert interviews into takeaways | [[references/expert-takeaways]] |

## Workflow

### Step 1: Gather Sources

If sources not specified, prompt:
> What sources should I synthesize?
> Provide paths or describe what to include.

Identify all sources:
- Primary: Transcripts, insight extractions, field notes
- Secondary: Articles, reports, competitor analysis
- Prior work: Previous project learnings

### Step 2: Select Synthesis Type

Ask user:
> What type of synthesis should I run?
> - **corpus** - Synthesize themes across sources
> - **segments** - Identify distinct consumer segments
> - **expert** - Synthesize expert interviews into takeaways

### Step 3: Load Reference and Execute

Read the appropriate reference file and follow its methodology.

### Step 4: Save Output

Save synthesis to:
`Databases/Artifacts/[TYPE]-[ProjectName]-[Date].md`

## Example Session

**User**: /synthesis

**Claude**:
> What sources should I synthesize?

**User**: All the Chips Ahoy transcripts from this week plus the market sizing doc

**Claude**:
> Found 4 sources:
> - [[20260205 - Chips Ahoy Shanghai MG1]]
> - [[20260206 - Chips Ahoy Shanghai MG2]]
> - [[20260207 - Chips Ahoy Guangzhou MG1]]
> - [[DOC-ChipsAhoy-MarketSizing-2026]]
>
> What type of synthesis should I run?
> - corpus (unified themes) or segments (consumer segmentation)?

**User**: corpus

**Claude**: *[Loads corpus.md reference, executes synthesis]*

---

**User**: /synthesis

**Claude**:
> What sources should I synthesize?

**User**: The two GC expert takeaways - Huang Kaiqi and Guo Cheng

**Claude**:
> Found 2 sources:
> - [[huang-kaiqi-takeaway-20260126]]
> - [[guo-cheng-takeaway-20260126]]
>
> What type of synthesis should I run?
> - corpus, segments, or expert?

**User**: expert

**Claude**: *[Loads expert-takeaways.md reference, produces memo-style synthesis]*

## Tips

- Run **corpus** synthesis when you need to find patterns across all sources
- Run **segments** when behaviors/attitudes vary significantly across participants
- Run **expert** when synthesizing 2-5 expert interviews into executive-ready takeaways
- Corpus synthesis is typically a prerequisite for SCQA narratives
- Expert synthesis produces tight narrative memos (claim → mechanism → implication per bullet)
- Consider running individual transcript analyses first, then synthesizing those outputs
