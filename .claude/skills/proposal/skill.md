---
name: proposal
description: Create and render research proposals. Use when drafting client proposals, scoping new projects, or responding to briefs. Two modes — draft (content creation and iteration) and render (format-fork to Word or PowerPoint). Do NOT use for reports (use /report), discussion guides (use /dg), or screeners (use /screener).
---

# Proposal

Create and render research proposals following Inner Chapter's methodology. Supports two modes matching the draft→render pipeline.

## Modes

### Mode 1: Draft (Content Creation)

Create structured markdown proposals for iteration and feedback.

**Trigger:** User asks to draft, write, or create a proposal.

**Workflow:**
1. **Gather context** from user, briefing docs, and project knowledge base
2. **Draft proposal** in structured markdown format
3. **Iterate** with user feedback
4. **Quality check** using proposal checklist before moving to render

**Steps:**
1. Read any briefing documents provided by user
2. Check `vault/Databases/Clients/{client}.md` for client background
3. Glob past proposals for this client in `vault/Databases/Documents/*{client}*proposal*.md`
4. Check if project directory exists with `PROJECT.md` context
5. Draft using section structure, thought-starters, and methodology patterns from references
6. Validate against quality checklist before handoff

### Mode 2: Render (Final Delivery)

Render finalized proposal markdown into branded PowerPoint or Word documents.

**Trigger:** User says the proposal is approved/final and ready for rendering, or asks to render/output/deliver a proposal.

**⚠️ IMPORTANT: Always confirm with the user before rendering to PPTX or DOCX.** The density pass and annotation can proceed autonomously, but final rendering (calling `/pptx` or `/docx-op`) requires explicit user approval. Present the annotated markdown for review first.

**Workflow:**
1. **Receive finalized markdown** from draft mode
2. **Determine output format** — ask if unclear:
   > Should this be rendered as a PowerPoint deck or Word document?
3. **Format-fork** — apply format-specific processing (density pass, annotations)
4. **Present annotated markdown to user for review and approval**
5. **Only after user confirms** → Render using appropriate skill
6. **Validate** using delivery checklist
7. **Save artifact** to project directory

## Format Fork (Render Mode)

### Word Path

Full prose density. Clean markdown goes directly to `/docx-op`.

- No `[HINT:]` or `[NOTES:]` annotations needed
- Full paragraphs, detailed tables, complete prose
- See [visual-style](references/visual-style.md) for typography

**Document Setup:**
- Page size: A4, Margins: 2.5cm all sides
- Headers: Project name left, "Private & Confidential" right
- Footers: Page numbers centered

**Rendering:**
```bash
bun run .claude/skills/docx-op/tools/MarkdownToDocx.ts proposal-draft.md output.docx
```

### PowerPoint Path

Billboard density. Requires a density pass before rendering via `/pptx`.

**Steps:**
1. **Density pass** — Load [proposal-density](references/proposal-density.md). Cut prose to billboard density. Headlines become claims, not topic labels.
2. **Add `[HINT:]` annotations** — Use conceptual vocabulary from [slide-architecture](references/slide-architecture.md) and the ic-slides `[HINT:]` vocabulary (hero quote, character cards, product cards, before/after, iconography trio, etc.)
3. **Extract supporting evidence into `[NOTES:]` blocks** — These become speaker notes in the final deck.
4. **Map sections to archetype recommendations** — See [slide-architecture](references/slide-architecture.md) for proposal section → archetype guidance.

**Rendering:** `/pptx` with annotated markdown.

## Required Inputs (Draft Mode)

Gather from user if not provided:

| Input | Example | Notes |
|-------|---------|-------|
| **Client** | Nike/Jordan | Organization name |
| **Project title** | Jordan Collectibles Muse | Working title |
| **Brief/Context** | 2-3 sentences or briefing doc | What is the business situation? |
| **Objectives** | List of 3-5 | What questions need answering? |
| **Markets** | China, Japan, US | Where is fieldwork? |
| **Methodology preference** | IDIs, FGDs, ethnography | If known |
| **Timeline constraints** | Delivery by March | If known |
| **Budget range** | ~$100k | If known |

## Rules Index

| Rule | Impact | When to Apply |
|------|--------|---------------|
| [frame-proposal-types](rules/frame-proposal-types.md) | MEDIUM | Adapting structure for project type (draft mode) |
| [quality-proposal-checklist](rules/quality-proposal-checklist.md) | HIGH | Before moving from draft to render |
| [quality-delivery-checklist](rules/quality-delivery-checklist.md) | HIGH | Before sending any rendered proposal |
| [core-bilingual-proposals](rules/core-bilingual-proposals.md) | MEDIUM | EN/ZH proposals for China market |

## References Index

| Reference | Purpose |
|-----------|---------|
| [section-structure](references/section-structure.md) | Detailed guidance for each proposal section |
| [thought-starters](references/thought-starters.md) | Format and examples for thought-starters |
| [methodology-patterns](references/methodology-patterns.md) | Common methodology approaches |
| [sample-design](references/sample-design.md) | Profile templates and quota structures |
| [investment-tables](references/investment-tables.md) | Budget format and line-item examples |
| [visual-style](references/visual-style.md) | Brand colors, typography, slide layouts |
| [slide-architecture](references/slide-architecture.md) | Proposal section → archetype mapping + PPTX hint vocabulary |
| [proposal-density](references/proposal-density.md) | How to reduce proposal prose to PPTX billboard density |

## Output Format (Draft Mode)

### Frontmatter

```yaml
---
date: 2026-01-25
type: proposal
client: Jordan
project: Collectibles Muse
status: draft
version: V1
---
```

### Document Structure

```markdown
# [Project Title]

**Inner Chapter Research Proposal**
**[Date]**

---

## Executive Summary
[3-4 sentences: What we're proposing, why it matters, what client gets]

---

## 01. Context
### Background
[Strategic situation, market context, business challenge]

### Strategic Imperative
> [Single statement of what success looks like]

### Objectives
[Research questions organized into 2-4 clusters]

---

## 02. Thought-starters
[2-4 hypotheses showing IC's POV on the problem]
[Each ends with: > Strategic Question: How might we...?]

---

## 03. Methodology
### Approach Overview
[Visual or table showing phases]

### Phase 1: [Name]
[Method, sample, focus areas, outputs]

### Phase 2: [Name]
[Method, sample, focus areas, outputs]

### Phase N: Synthesis & Delivery
[Analysis approach, deliverables list]

---

## 04. Sample Design
### Recruitment Profiles
[Named profiles with Who/What/Why structure]

### Sample Breakdown
[Table with quotas by city, segment, demographics]

### Recruitment Criteria
[Bullet list of screening requirements]

---

## 05. Deliverables
[Numbered list of what client receives]

---

## 06. Timeline
[Week-by-week or Gantt-style table]

---

## 07. Investment
[Line-item table by phase]

---

## 08. Team
[Key team members with roles]

---

## 09. Relevant Experience
[2-4 case studies relevant to this project type]

---

## Contact
[Team contact details]
```

## Output Location

### Draft Mode

Markdown drafts and PPTX-annotated drafts go in the project proposal directory:
```
vault/Databases/Projects/{project}/proposal/
```

**Naming convention (kebab-case):**
```
proposal-draft-{YYYYMMDD}.md              # Prose draft
proposal-pptx-draft-{YYYYMMDD}.md         # Density-passed, [HINT:]-annotated draft for PPTX
proposal-docx-draft-{YYYYMMDD}.md         # Word-formatted draft (if different from prose)
```

### Render Mode (Final Files)

**If project directory exists:**
```
vault/Databases/Projects/{project}/proposal/
```

**If legacy project:**
```
vault/Databases/Documents/
```

**Naming convention:**
```
ic-x-{client}-{project}-proposal-{YYYYMMDD}.{pptx|docx}
```

## Anti-Patterns

| Pattern | Problem | Instead |
|---------|---------|---------|
| Starting without briefing context | Generic proposal that misses client needs | Read briefing docs and client background first |
| Objectives as statements | "Understand X" isn't actionable | Write as questions: "How do consumers...?" |
| Skipping thought-starters | Proposal is just logistics, no POV | Show IC's strategic perspective |
| Generic sample profiles | Just demographics, no strategic rationale | Named personas explaining "why we need them" |
| Applying `[HINT:]` to Word output | Clutters the clean prose | Hints are PPTX-only |
| Skipping density pass for PPTX | Slides become Word paragraphs on screen | Always run density reduction for PowerPoint |
