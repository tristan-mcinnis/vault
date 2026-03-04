# Design Hints for Slides

Add `[HINT: type — description]` annotations to slides when a visual encoding would communicate faster than a paragraph of bullets. Hints travel from markdown → PowerPoint rendering via `/pptx`.

**The hint vocabulary is format-dependent.** DOCX and oral debriefs use structural hints (Section A). PPTX uses conceptual hints (Section B). Choose the right vocabulary before writing hints.

## The Decision

For each slide, ask: **"Is a paragraph of bullets the fastest way for a human to understand this — or is there a better encoding?"**

| If the answer is... | Then... |
|---|---|
| "Yes, the argument needs careful prose" | No hint. Leave blank. Text is the right choice. |
| "No, this is really a flow/sequence" | DOCX: `diagram` / PPTX: conceptual hint with spatial metaphor |
| "No, this is really a side-by-side" | DOCX: `comparison` / PPTX: conceptual hint with split layout |
| "No, one number IS the whole point" | DOCX: `data` / PPTX: conceptual hint with hero stat |
| "No, these are 3-6 parallel things" | DOCX: `grid` / PPTX: conceptual hint with character cards or columns |
| "No, this describes something physical/real" | `photo` (same in both formats) |
| "No, each item needs a memory symbol" | DOCX: `icon` / PPTX: conceptual hint with iconography |

## How to Write the Description

Descriptions are **sourcing briefs**, not creative writing. Concise and specific enough that a designer or AI can execute without follow-up questions.

---

## Section A — DOCX / Oral Debrief: Structural Hints

Use these when the target format is Word or when building an oral debrief (Decision Document). Structural hints name the layout type explicitly.

### photo
Name the subject, a distinguishing detail, and the setting.
```
[HINT: photo — product package, front-facing, premium line, on white]
[HINT: photo — young woman ~25, snacking alone, city apartment evening]
[HINT: photo — competitive shelf, convenience store, multiple brands visible]
```

### diagram
Name the spatial metaphor and the key nodes/lanes.
```
[HINT: diagram — 2×2 matrix: energy level (low↔high) × permission (need-driven↔want-driven), 4 states plotted]
[HINT: diagram — three parallel lanes (SKU A / SKU B / base), each showing occasion → need state → price]
[HINT: diagram — funnel: awareness → trial → repeat → loyalty, with drop-off at each stage]
```

### comparison
Name what's being compared and the key dimension of contrast.
```
[HINT: comparison — current packaging vs trade-up target, side by side, 4 design changes highlighted]
[HINT: comparison — effective upgrade vs ineffective upgrade, two-column contrast with examples]
[HINT: comparison — concept A and B side by side: target segment / occasion / texture / price]
```

### data
Name the metric(s) and why the number matters. If it's one hero stat, say so.
```
[HINT: data — single hero stat: concept X avg 8.2 — highest across all concepts]
[HINT: data — three stats: current users 6.3 / lapsed users 9.0 / gap 3.3 pts]
[HINT: data — bar chart: all concepts ranked by average score]
```

### grid
Name the item count and what each item contains.
```
[HINT: grid — 4 need states, each with: name / trigger / consumer quote / brand opportunity]
[HINT: grid — 3 consumer archetypes: name / snacking style / brand relationship / lead concept]
[HINT: grid — 5 concepts, each with name + score + one-line verdict]
```

### icon
Name the concepts and suggest what the icons represent.
```
[HINT: icon — 3 principles: texture layers (stacked blocks), quality ingredients (leaf), segment clarity (target)]
[HINT: icon — 4 packaging hierarchy tiers: tin / box / individual pack / plastic bag]
```

---

## Section B — PPTX: Conceptual Hints

Use these when the target format is PowerPoint. Conceptual hints describe the **feeling and spatial intent** of the slide rather than naming a layout type. This gives `/pptx` creative latitude while constraining the visual weight.

### The Conceptual Hint Formula

```
[HINT: {Visual anchor} — {Spatial instruction} — {Tone/palette} — {Constraint}]
```

Not every hint needs all four parts. At minimum, provide the visual anchor and one other element.

### Visual Anchors

| Anchor | When to Use | Example |
|--------|-------------|---------|
| **hero quote** | One verbatim carries the entire slide | Consumer language as centerpiece |
| **hero stat** | One number is the story | Score, percentage, gap |
| **character cards** | Consumer archetypes or personas | 3-4 cards with name, trait, quote |
| **solar system** | Brand/competitor relationships | Center entity with orbiting elements |
| **before/after** | Transformation or contrast | Two states of the same thing |
| **price spectrum** | Value positioning or tier structure | Linear range with markers |
| **visual timeline** | Sequence or evolution | Horizontal progression |
| **ascending step-ladder** | Hierarchy or ranking | Low → high with clear winner |
| **product cards** | Concept or SKU evaluation | Cards with image area + verdict |
| **iconography trio** | Three key principles or pillars | Large icons with short labels |

### Spatial Instructions

| Instruction | Effect |
|-------------|--------|
| split 30/70 | Narrow left column (label/context), wide right (main content) |
| split 50/50 | Equal halves for comparison or before/after |
| full bleed center | Single element dominates center, minimal margins |
| 3 horizontal columns | Three equal-width sections side by side |
| left-heavy | Primary content left, supporting detail right |
| right-heavy | Build-up on left, payoff on right |
| stacked vertical | Elements flow top to bottom, clear hierarchy |

### Tone/Palette Directions

Be concrete enough to translate to CSS colors or slide backgrounds. Avoid abstract mood words.

| Direction | Translates To |
|-----------|---------------|
| warm golden hour | Amber/gold tones, cream backgrounds, soft shadows |
| deep luxurious | Dark navy/burgundy backgrounds, gold accents, serif type |
| muted functional | Light grays, minimal color, clean sans-serif |
| high contrast stark | White background, black type, one accent color |
| vibrant product | Saturated product colors as accents, white space dominant |
| earth organic | Greens, browns, natural textures |

### Visual Physics (Directing the Eye)

The human eye moves in rapid involuntary jumps (saccades). When a new slide appears, the audience's eyes dart around seeking an anchor in ~200ms. Use these principles to control where attention lands:

**Scale:** The most important element should be 3-5x larger than the next most important. If a hero stat and a supporting label are the same size, neither dominates and the eye bounces.

**Contrast:** Make everything monochromatic/muted *except* the single element that matters. One accent color on a neutral slide screams louder than a rainbow.

**Empty space as amplifier:** A single sentence centered on an otherwise empty slide is louder than a 60pt bold header crowded by charts. Amateurs fear white space; masters weaponize it.

**The Squint Test (prescriptive, not just evaluative):** Before finalizing a hint, mentally blur the slide. The brightest/largest shape should be the data point or quote that carries the finding. If the dominant shape would be a logo, a decorative element, or the chart axis — the visual weight is wrong.

These principles inform how you write constraints. If a hint produces a layout where multiple elements compete at similar scale, add a constraint to suppress the secondary ones.

### Constraints

Constraints prevent the competing-hierarchy problem. Add one when the slide is at risk of overload.

- `no tables` — force visual alternatives
- `no more than 3 bullets` — enforce billboard density
- `text secondary to image` — image occupies 60%+ of slide
- `no competing visuals` — one dominant visual element only
- `quote occupies 50%+ of slide` — hero quote at billboard scale

### Conceptual Hint Examples

```
[HINT: character cards — 3 horizontal columns, each card with color-coded header, name, one hero quote, warm golden hour — no more than 3 bullets per card]

[HINT: hero quote — full bleed center, single verbatim at billboard scale, muted functional — text secondary to image of snacking moment]

[HINT: solar system — brand at center with competitors orbiting at distance proportional to threat level, high contrast stark — no tables]

[HINT: product cards — 3 horizontal columns, each card with product image area + verdict badge (WIN/CUT/FIX), vibrant product — no more than 3 bullets per card]

[HINT: ascending step-ladder — 4 tiers from base to premium, each tier with format name and one key signal, deep luxurious — no competing visuals]

[HINT: hero stat — single number centered massive, supporting context below in small type, high contrast stark — quote occupies 50%+ of slide]

[HINT: iconography trio — 3 horizontal columns, each with large icon + 2-line label, muted functional — no more than 3 bullets]
```

---

## Section C — Before/After Examples (DOCX → PPTX)

These pairs show how the same content gets different hints depending on format. Drawn from real revision patterns.

### Consumer Archetypes

**DOCX (structural):**
```
[HINT: grid — 3 consumer archetypes: name / snacking style / brand relationship / lead concept]
```

**PPTX (conceptual):**
```
[HINT: character cards — 3 horizontal columns, each card with color-coded header band, archetype name large, one hero quote in italics, signature snacking behavior as subhead — warm golden hour — no tables]
```

### Need State Deep-Dive

**DOCX (structural):**
```
[HINT: diagram — visual with pull quote + occasion table + key insights below]
```

**PPTX (conceptual):**
```
[HINT: hero quote — full bleed center, single massive verbatim capturing the need state, pairing imagery of the occasion moment below — muted functional — no competing visuals]
```

### Methodology / Evidence Base

**DOCX (structural):**
```
[HINT: grid — city/format/respondent count in 3×4 table]
```

**PPTX (conceptual):**
```
[HINT: iconography trio — three massive numbers (cities, interviews, hours) each with city-flag icon, stacked vertical — high contrast stark — no tables]
```

### Competitive Landscape

**DOCX (structural):**
```
[HINT: grid — brand comparison table with positioning, price tier, key associations]
```

**PPTX (conceptual):**
```
[HINT: solar system — focal brand at center, 4-5 competitors orbiting at proportional distance, each with one-word positioning label — high contrast stark — no tables]
```

### Concept Scorecard

**DOCX (structural):**
```
[HINT: data — 5-column score table: concept / taste / value / intent / verdict]
```

**PPTX (conceptual):**
```
[HINT: product cards — 3 horizontal columns, each card with product image zone + large verdict badge (WIN / CUT / FIX) + 2-bullet rationale — vibrant product — no more than 3 bullets per card]
```

### Packaging / Price Hierarchy

**DOCX (structural):**
```
[HINT: comparison — packaging format comparison table: format / occasion / perception / price]
```

**PPTX (conceptual):**
```
[HINT: ascending step-ladder — 4 tiers from everyday to ultra-premium, each step with format name + one consumer signal quote, visual height conveys price progression — deep luxurious — no competing visuals]
```

---

## Section D — PPTX Hint Anti-Patterns

### Banned Words in PPTX Hints

These structural words produce rigid layouts that fight slide density:

| Banned | Why | Use Instead |
|--------|-----|-------------|
| `table` | Produces dense grids unreadable on slides | `product cards`, `ascending step-ladder`, `solar system` |
| `matrix` | Same problem as table | `2×2 diagram` only if truly a 2×2 conceptual framework |
| `list` | Produces bullet dumps | `iconography trio`, `character cards` |
| `grid` (as PPTX hint) | Forces equal-weight cells | `character cards`, `horizontal columns` with hierarchy |

**Exception:** `table` is acceptable in PPTX only for true 2×2 conceptual frameworks (e.g., a strategy matrix where the axes carry meaning).

### Scale Rules

- If a hint says "massive" or "hero", the element should occupy **50%+ of the slide**
- Never ask for **>4 distinct visual elements** on one slide
- Never combine a **table + a quote + a bullet list** on the same slide face

### Competing Hierarchy Test

Before writing a hint, check: does the slide have more than one element vying for dominance?

| Combination | Problem | Fix |
|-------------|---------|-----|
| Quote + table + bullets | Three competing hierarchies | Pick one; move others to `[NOTES:]` |
| Hero stat + chart + callout | Stat and chart fight for attention | Hero stat on slide, chart in notes |
| Two quotes + commentary | Neither quote lands | Pick the stronger quote, cut the other |
| Photo + diagram + text block | Visual chaos | Photo or diagram, not both |

---

## Rules of Thumb

1. **One hint per slide.** Two visual types = split the slide, or pick one and make the other secondary.
2. **No hint = deliberate choice.** Synthesis, recommendations, and nuanced arguments are text-native. Don't force visuals onto prose.
3. **Descriptions are sourcing briefs.** "Young woman, ~25, city cafe" works. "A beautiful atmospheric portrait capturing the essence of urban snacking culture" doesn't.
4. **Diagram and grid hints need structure, not just topic.** "Consumer journey flow" is too vague. "Funnel: awareness → trial → repeat, with drop-off at each stage" tells `/pptx` exactly what to build.
5. **When in doubt between photo and diagram:** If the content is about something that exists physically, use photo. If it's about relationships between concepts, use diagram. If it's about parallel instances of a category, use grid (DOCX) or character cards (PPTX).
6. **Match vocabulary to format.** Structural hints for DOCX. Conceptual hints for PPTX. Mixing them produces "sliduments."

## Slide Types That Almost Always Get a Hint

| Slide content | DOCX hint | PPTX hint |
|---|---|---|
| Need states / segmentation | `diagram` (2×2 or parallel lanes) | hero quote or solar system |
| Consumer archetypes | `grid` (3 cards) | character cards |
| Score tables / concept performance | `data` (bar chart or hero stat) | product cards with verdict badges |
| Side-by-side concept comparison | `comparison` | before/after or split 50/50 |
| Packaging before/after | `comparison` | ascending step-ladder |
| Day-in-the-life / emotional journey | `diagram` (timeline) | visual timeline |
| Positioning map (brand vs. competitors) | `diagram` (2×2 or perceptual map) | solar system |
| Competitive landscape | `grid` or `diagram` | solar system |
| Language translation (remove/replace) | `comparison` | before/after |
| Portfolio architecture | `grid` or `diagram` | ascending step-ladder or solar system |

## Slide Types That Rarely Need a Hint

- Strategic summary (answer in summary slide)
- Principle-based arguments ("three things to know")
- Verbatim-heavy evidence slides (PPTX: these become hero quote slides instead)
- Recommendations with rationale
- Next steps

---

## Section E — HINT → `**Visual:**` Mapping (for /pptx pipeline)

When rendering via the `slide-outline-to-layout` + `pptx-from-layout` pipeline, each `[HINT:]` conceptual anchor must be translated to an explicit `**Visual: type**` declaration. The parser does NOT read `[HINT:]` comments — it needs `**Visual:**`.

### Anchor → Visual Type

| HINT Anchor / Pattern | `**Visual:**` Declaration | Notes |
|---|---|---|
| `hero quote` / `hero stat` / single statement | `hero-statement` | 1-2 sentences max; no bullets |
| `character cards` / `iconography trio` / N parallel columns | `cards-3` / `cards-4` / `cards-5` | Match N to item count |
| `split 50/50` (true comparison) | `comparison-2` | Use `[Column 1:]` / `[Column 2:]` syntax |
| `split 30/70` (label + content) | `bullets` with `{signpost}LABEL{/signpost}` | No column syntax needed |
| `visual timeline` / `ascending step-ladder` (sequential) | `process-3-phase` / `process-4-phase` / `process-5-phase` | Match phase count |
| `ascending step-ladder` (ranked, non-sequential) | `cards-5` | Discrete items, not flow |
| `visual timeline` (date-based weeks/months) | `timeline-horizontal` | Use `[Week N]` / `[Month]` entries |
| `section divider` | *(empty slide — no content)* | Parser auto-detects from empty body |
| `narrative` / `bullets` / evidence with data points | `bullets` | Default; add `[Image:]` placeholder |
| `data` / `hero stat` (two-metric tension) | `data-contrast` | Exactly 2 metrics |
| `2×2 matrix` / `quadrant diagram` | `cards-4` | One card per quadrant |
| `product cards` / concept scorecard | `cards-3` / `cards-4` | One card per concept |
| `table` (genuine rows × columns) | `table` | Only if both axes carry meaning |

### Parser Quirks — Known Issues

**Title slide:** Do NOT use `# Slide 1:` for the cover slide. Use preamble (content before first `# Slide N:` header):
```markdown
# Project Title

## Subtitle

Client × Partner
Month Year

---

# Slide 2: First Content Slide
```
Using `# Slide 1:` produces a `title-centered` (section divider) layout instead of `title-cover`.

**Section dividers with keyword titles:** If the slide title contains "deliverable", "you'll get", "what we deliver", the parser misdetects it as a deliverables type. Fix with explicit visual:
```markdown
# Slide 28: 05 — Deliverables

**Visual: title-centered**

---
```

**`**Layout:**` override requires `**Visual:**`:** Always pair them — a `**Layout:**` without `**Visual:**` causes a parse error:
```markdown
# Slide N: Title

**Visual: closing**
**Layout: title-cover**
```

**Contact slide:** Use `**Visual: contact-black**` (not `contact`):
```markdown
# Slide N: Contact

**Visual: contact-black**

**Name**
Title
email@domain.com
```

---

## Section F — HINT → IC Archetype Mapping (for IC Slide System pipeline)

When rendering via the IC Slide System (`/ic-slides`), each `[HINT:]` anchor maps to a specific archetype component. The IC parser reads `[HINT:]` comments directly — no `**Visual:**` declaration needed.

### Anchor → IC Archetype

| HINT Anchor / Pattern | IC Archetype | Component | Notes |
|---|---|---|---|
| `hero quote` | C1 | HeroQuote | Single dominant quote, display scale |
| `hero stat` / single number | C1b | HeroStat | One number fills the slide |
| `key takeaway` / bold statement | C1d | KeyTakeaway | Mid-section breath, white space |
| `photo` — product | C11 | AnnotatedProductShot | Product image + numbered callouts |
| `photo` — portrait / person | C4 | QuotePortrait | Quote + person photo |
| `photo` — environment / scene | C5 | EditorialImage | Full-bleed scene photo |
| `character cards` / 3 columns | I12 | ThreePillars | 3 parallel profiles/items |
| `character cards` / 4 columns | I13 | FourPillars | 4 parallel profiles/items |
| `product cards` / with verdict | D7 | ProductLineup | Product cards with Win/Fix/Cut badges |
| `solar system` / hub-and-spoke | E5 | Ecosystem | Center node + orbiting elements |
| `ascending step-ladder` | E8 | VisualLadder | Tiered progression with badges |
| `visual timeline` | E7 | DayTimeline | Horizontal timeline |
| `process` / flow / journey | E3 | ProcessFlow | Sequential steps |
| `before/after` / `comparison` | D1 | TwoColumnCompare | Side-by-side contrast |
| `split 50/50` (two perspectives) | I23 | ColorSplit | Two-tone color split |
| `split 30/70` (sidebar + content) | I26 | SidebarAccent | Colored sidebar + main area |
| `data` / stats (2-3 metrics) | F3 | StatCallout | Hero metrics with labels |
| `data` / `scorecard` / table | F2 | DataTable | Structured reference data |
| `iconography trio` / 3 pillars | I12 | ThreePillars | With icon descriptions |
| `grid` / 5+ items | D5 | ColorColumns | Color-banded column grid |
| `section divider` | A2 | SectionDivider | Section transition |
| `2×2 matrix` | E1 | Matrix | 2×2 conceptual framework |
| (no hint — text-native) | C2 | HeadlineEvidence | Analytical workhorse |

### IC-Specific Markdown Conventions

The IC parser supports these additional markdown patterns:

**Stat line** — A bold number followed by a label becomes a stat prop:
```markdown
**73%** of respondents prefer texture over flavor in premium cookies
```

**Section labels** — Use `**Section: Name**` to group slides for section dividers:
```markdown
**Section: Consumer Landscape**

# Slide 5: Premium cookies win in celebration occasions
```

**Quote attribution** — Standard `> "quote" — Attribution` format:
```markdown
> "I only buy the expensive ones when I've done something to deserve it" — Female, 28, Shanghai
```

### Choosing Between Pipelines

| Pipeline | Best for | Output format |
|---|---|---|
| Section E (`**Visual:**` → `/pptx`) | Quick PPTX from structured markdown | PowerPoint (native text) |
| Section F (`[HINT:]` → IC Slide System) | High-design archetype-based decks with live preview | PDF or PPTX (image-based) |

Use Section F when visual quality and archetype variety matter more than editable text in the PPTX. The IC pipeline renders 140+ distinct visual layouts with consistent design tokens.
