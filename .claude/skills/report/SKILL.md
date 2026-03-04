---
name: report
description: Create and render research reports, oral debriefs, and SCQA narrative summaries for client delivery. End-to-end workflow from headline skeleton to branded PowerPoint or Word document. Use when user asks to "write the debrief", "build the report", "create the oral debrief", "structure the report", "write up the findings", "create a slide deck from research", "draft the report skeleton", "render the final deliverable", "write an executive summary", or "create a SCQA memo". Do NOT use for discussion guides (use /dg), raw transcript analysis (use /transcript-analysis), or synthesis across sources (use /synthesis).
---

# Research Report

Create and render research reports — from headline skeleton through iteration to final branded deliverable via `/pptx` or `/docx-op`.

## Report Types

| Type | Purpose | When to Use |
|------|---------|-------------|
| **Decision Document** | Oral debrief for go/no-go decisions | Post-fieldwork, before full report |
| **Full Report** | Comprehensive slide documentation | 1-2 weeks after oral debrief |
| **SCQA Narrative** | Executive summary or strategic memo | Quick turnaround, exec audience |

## Workflow

```
Phase 1: DRAFT — Create headline skeleton with [TBD] placeholders
Phase 2: ITERATE — Fill headlines with findings, refine argument
Phase 3: RENDER — Format-fork to PowerPoint or Word → branded deliverable
```

### Phase 1: Draft (Pre-Fieldwork)

1. **Identify project** — read `00-status.md`
2. **Load research objectives** — read `knowledge-base/0*-research-objectives*.md`
3. **Choose presentation shape** — see `references/presentation-shapes.md`
4. **Create skeleton** — map objectives to slide structure with [TBD] slots
5. **Save draft** to `{project}/reporting/oral-debrief/` or `{project}/reporting/full-report/`

### Phase 2: Iterate (Post-Fieldwork)

6. **Read existing skeleton** if available
7. **Load analysis outputs** — transcripts, synthesis docs, analysis files
8. **Map the audience** — Who are the decision-makers? What are their KPIs? What fear could kill the project on slide 5?
9. **Fill headlines** — replace [TBD] with findings. Apply headline checklist.
10. **Murder Board** — stress-test the argument. What's the fatal flaw? Where would a cynical stakeholder shoot it down?
11. **User confirms** the filled report is final

### Phase 3: Render

12. **Determine format** — ask user: PowerPoint or Word?
13. **Format-aware density pass:**
    - **PPTX:** Load `references/slide-density.md`. Cut body text to billboard density. Move supporting evidence to `[NOTES:]...[/NOTES]` blocks. Apply conceptual `[HINT:]` vocabulary from `references/design-hints.md`.
    - **DOCX:** Full prose density is fine. `[HINT:]` and `[NOTES:]` blocks are ignored during rendering.
14. **Present annotated markdown** to user for review
15. **Render** using appropriate skill:
    - **PowerPoint:** Use `/pptx` with annotated markdown
    - **Word:**
      ```bash
      bun run .claude/skills/docx-op/tools/MarkdownToDocx.ts input.md output.docx
      ```
16. **Save** to `{project}/reporting/ic-{project}-{type}-{YYYYMMDD}.{pptx|docx}`

## The `[NOTES:]` Convention

Content between `[NOTES:]` and `[/NOTES]` tags becomes **speaker notes** in PPTX output. In DOCX output, these blocks are ignored. Use for:
- Extra verbatims beyond the hero quote on the slide face
- Full data breakdowns when the slide shows only the verdict
- Methodology details and sample sizes
- Rationale that exceeds 3 bullets

## Quality References

| Reference | What It Covers | When to Load |
|---|---|---|
| `references/horizontal-test.md` | Headlines-only readability test | Before finalizing any deck |
| `references/headline-checklist.md` | Per-headline validation — findings not topics | When writing or reviewing headlines |
| `references/design-hints.md` | `[HINT: type — description]` annotations | When writing slide markdown |
| `references/presentation-shapes.md` | Four project types and their narrative structures | At start of any report |
| `references/slide-density.md` | PPTX density limits, text reduction heuristics | When target format is PowerPoint |
| `references/scqa.md` | SCQA framework, element guidelines, output template | When creating executive summaries or strategic memos |
| `references/memo.md` | Executive decision memo structure and writing guidelines | When creating exec memos |
| `references/narrative-connective-tissue.md` | Inter-section transitions, behavioral grounding, competitive set justification | When reviewing deck flow or getting "I don't follow the logic" feedback |
| `references/sections.md` | Standard section frameworks for research reports | When structuring full reports |

## Decision Document Structure (14-15 slides)

| # | Slide | Purpose |
|---|-------|---------|
| 1 | Title | Project name, date, evidence base |
| 2 | Strategic Question | Core question + one-sentence answer |
| 3 | The Mechanism | Structural insight (why it works) |
| 4 | Soul Question | Address the obvious objection |
| 5 | Defining the Opportunity | Consumer language definition |
| 6 | Scorecard | Evaluate options against criteria |
| 7 | Where [Product] Wins | Occasion-specific assessment |
| 8 | Key Decision 1 | "If X → Signals → Requires" |
| 9 | Key Decision 2 | Secondary decision framework |
| 10 | Portfolio Impact | Cannibalization / growth paths |
| 11 | Portfolio Clarity | Side-by-side positioning |
| 12 | Recommendations | Ranked, actionable |
| 13 | Bottom Line | Memorable formula |
| 14 | Work Still Needed | Honest gaps |
| 15 | Contact | Team info |

## Full Report Architecture

Full reports vary from 25-40+ slides. See `references/presentation-shapes.md` for argument order by project type.

### Creative / Concept Testing (most common)

| Section | Slides | Purpose |
|---------|--------|---------|
| Title + Context | 2-3 | Project name, evidence base, business problem |
| The Answer | 1-2 | Executive summary with verdict upfront |
| Occasion / Consumer Landscape | 4-6 | Need states, archetypes, competitive context |
| Brand & Filter | 3-4 | Brand assets, trade-up principles, packaging |
| What Didn't Work | 2-3 | Failed concepts with clear failure modes |
| What Worked | 4-6 | Winning concepts, 2-3 slides each |
| Implications & Next Steps | 3-4 | Portfolio architecture, R&D directives, timeline |
| Contact | 1 | Team info |

### Optional: Vanguard + Armory Split

For high-stakes live presentations, the deck can split into:
- **Vanguard (~20 slides):** Cinematic narrative at billboard density for 20 minutes of presenting
- **Armory (appendix):** Dense reference library for Q&A — full data tables, methodology, extended quotes

## SCQA Narrative Framework

For concise narrative deliverables (executive summaries, strategic memos).

### When to Use
- Executive summaries for leadership
- Strategic memos
- Quick-turnaround narrative outputs
- When user says "executive summary", "strategic memo", "narrative summary", or "SCQA"

### Structure
- **Situation:** The stable context everyone agrees on
- **Complication:** What changed or is at risk (most important element — creates urgency)
- **Question:** The strategic question this raises
- **Answer:** The recommendation with supporting evidence

### Workflow
1. **Identify Source Material** — corpus synthesis docs, insight extractions, project research questions
2. **Identify Audience** — Who is this for? What do they care about?
3. **Structure the Narrative** using S-C-Q-A above
4. **Save Output** to `{project}/reporting/scqa-{topic}-{YYYYMMDD}.md`

## Anti-Patterns

| Avoid | Do Instead |
|-------|------------|
| Starting without reading existing skeleton | Always check for prior drafts first |
| Headlines as topic labels ("Snacking") | Headlines as complete thoughts ("Premium cookies win in celebration occasions") |
| Applying `[HINT:]` to Word output | Hints are PPTX-only |
| Skipping density pass for PPTX | Always run density reduction for PowerPoint |
| No Murder Board | Stress-test argument before rendering |
