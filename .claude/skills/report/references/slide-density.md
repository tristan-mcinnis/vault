# Slide Density Rules (PPTX)

A slide is a billboard, not a document. The speaker is the presenter — the slide is the visual anchor. When the target format is PowerPoint, every piece of markdown must pass through these density limits before rendering.

## Density Limits

| Element | Maximum | Notes |
|---------|---------|-------|
| Bullets | 3–5 per slide | If you need 6, split the slide |
| Words per bullet | 12–15 | One clause, not a sentence |
| Hero quote | 1 per slide | Large enough to read from back of room |
| Tables | 3 cols × 4 rows | Beyond this → simplify or move to notes |
| Prose paragraphs on slide face | 0 | Prose belongs in speaker notes or a Word doc |
| Distinct visual elements | ≤ 4 | Quote + bullets + table = overloaded |

## The `[NOTES:]` Convention

Content between `[NOTES:]` and `[/NOTES]` tags in markdown becomes **speaker notes** in PPTX output. In DOCX output, these blocks are ignored.

Use this to separate billboard content (what the audience sees) from supporting evidence (what the presenter says).

### Syntax

```markdown
## Consumers treat premium cookies as earned rewards, not everyday snacks

- "Earned indulgence" framing dominates across all three markets
- Permission is occasion-gated: celebrations > solo treats > daily snacking
- Price sensitivity drops sharply when the occasion is social

> "I only buy the expensive ones when I've done something to deserve it" — Shanghai, F, 28

[HINT: hero quote — single verbatim centered large, with occasion spectrum below as three horizontal zones]

[NOTES:]
Supporting evidence from fieldwork:
- 14 of 18 respondents spontaneously used reward/earn language
- Shanghai skewed more toward "self-reward"; Sydney toward "hosting reward"
- Melbourne respondents mentioned gift-giving as a distinct permission occasion
- Verbatim runner-up: "It's not Tuesday biscuits, it's Friday night biscuits" — Melbourne, M, 34
[/NOTES]
```

### When to use `[NOTES:]`

- Evidence-heavy slides where you show 1 quote but have 5
- Data slides where you show the verdict but have the full breakdown
- Recommendation slides where rationale exceeds 3 bullets
- Any slide where cutting content hurts the presenter but keeping it hurts the audience

## Density Reduction Checklist

Before finalizing any slide for PPTX:

- [ ] **One Idea Per Slide** — Can you state the slide's point in one sentence?
- [ ] **Headline Carries the Finding** — Cover the body; does the headline tell the story alone?
- [ ] **Body Supports, Not Repeats** — Bullets add evidence or nuance, not restate the headline
- [ ] **Zero Prose Paragraphs** — Every paragraph has been converted to bullets or moved to notes
- [ ] **One Hero Quote** — If multiple quotes, pick the most powerful; move rest to `[NOTES:]`
- [ ] **Tables Are Sparse** — Max 3 × 4; if bigger, simplify or move full table to notes
- [ ] **Hints Are Conceptual** — No structural hints (grid, table); use visual anchors instead
- [ ] **Notes Exist for Evidence-Heavy Slides** — Supporting data, extra quotes, methodology details in `[NOTES:]`

## Text Reduction Heuristics

### Billboard Test
Cover the slide body. Does the headline tell the full story?
- **Pass:** "Premium cookies win in social occasions but lose in daily snacking"
- **Fail:** "Occasion Analysis" (topic label, not a finding)

### Quote Test
You have five great verbatims. Pick the single most powerful one for the slide face. The rest go to `[NOTES:]`.
- **Pick the quote that:** is most vivid, most specific, carries the most emotional weight
- **Not the quote that:** is longest, is most "representative", covers the most ground

### Table Test
Can this table become a visual metaphor instead?
- Competitive landscape table → solar system diagram (brand at center, competitors orbiting)
- Score table → product cards with verdict badges
- Comparison matrix → before/after or side-by-side contrast

### Competing Hierarchy Test
If a slide has a quote AND a table AND a bullet list — pick one. The other two either move to notes or become a second slide.

One dominant element per slide. Everything else is supporting detail at lower visual weight.

## Cinematic Velocity (Pacing by Cognitive Load)

Slide count is not pacing. Cognitive load is pacing. A 30-slide deck can feel slower than a 60-slide deck if every slide is dense.

Masters treat a deck like a film storyboard with two types of slides:

### Anchor Slides (High Cognitive Load)
Dense, carefully constructed. A framework, a scorecard, a key data chart. The audience needs 2-3 minutes to process. Stay here. Let the room go quiet.

- These are your analytical slides: scorecards, need state frameworks, portfolio maps
- They earn their density because the presenter narrates each cell/element live
- Typically 3-6 per deck — they carry the intellectual weight

### Flash Slides (Low Cognitive Load)
Sparse, single-element. One quote. One number. One image. The audience processes in 3-5 seconds. Use sequences of flash slides to build momentum, emotion, or evidence before landing on an anchor.

**Example — building a case through quick cuts:**
```markdown
## "Too sweet."
## "Childish."
## "Boring."
## "They left."
## Four words that explain why the base product is losing 18-25s
```

The first four slides flash past in 15 seconds — each is just a headline. The fifth is the anchor where you land and explain.

### Pacing Rules

- **Don't treat every slide equally.** Not every slide needs 3-5 bullets. Some slides are intentionally just a headline, or just a quote, or just a number.
- **Use flash sequences before key anchors.** Build emotional evidence (consumer quotes, rejection language, market signals) through rapid single-element slides, then land on the analytical framework that makes sense of it all.
- **Mark pacing intent in markdown.** A slide with only a headline and no body is a flash slide. A slide with headline + bullets + quote + hint is an anchor. Both are valid — but they serve different functions.
- **The audience computes ideas per minute, not slides per minute.** You can move through 10 sparse flash slides faster than an audience can read one dense slidument.

### The Redundancy Effect

Cognitive science (Mayer's Multimedia Learning principles): if an audience reads the exact same words they hear the speaker say, comprehension drops. The brain cannot process two identical linguistic streams simultaneously.

**The implication for slide writing:** The slide is not a teleprompter. The speaker delivers the nuanced conclusion; the slide shows the visual proof — a number, a quote, an image. Speaker is melody; slide is bassline. They complement, they don't duplicate.

This reinforces why headlines should be findings (the slide's anchor point) while the speaker's narration adds context, caveats, and implications that do NOT appear on the slide face.

## Cross-Reference

See `deck-audit` skill's `references/meso-slide-architecture.md` for:
- **One Idea Per Slide** — test method and symptoms of overloaded slides
- **Action Titles** — claim-based titles vs. topic labels
- **Visual Hierarchy** — squint test, 3-second test, prominence ordering
- **CRAP Principles** — Contrast, Repetition, Alignment, Proximity for layout
