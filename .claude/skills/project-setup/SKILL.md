---
name: project-setup
description: Scaffold new qualitative research project directories with consistent architecture, knowledge base, and Claude context. Use when user asks to "set up a new project", "create a project folder", "scaffold the project", or "start a new research project". Creates 00-status.md, PROJECT.md, and standard directory structure.
---

# Project Setup Skill

Scaffold new qualitative research project directories inside the vault with consistent document architecture, shared skills access, and a single source of truth pattern.

## When to Use

- Starting a new research project
- Converting an existing project page to full directory structure
- Setting up project context for Claude workflows

## Workflow

### Phase 1: Gather Project Parameters

Ask for required information if not provided:

| Parameter | Example | Notes |
|-----------|---------|-------|
| **Project Name** | Jordan - Collectibles | Format: Client - Topic |
| **Client** | Nike/Jordan | Organization name |
| **Markets** | China, Japan, US | List of countries/cities |
| **Methodology** | IDIs, FGDs | Research methods |
| **Timeline Start** | 2026-02-01 | Fieldwork start |
| **Timeline End** | 2026-03-15 | Delivery date |
| **Budget** | $110,000 | Optional |
| **Overview** | 2-3 sentences | What is this project about? |

### Phase 2: Create Directory Structure

Create project directory at `vault/vault/Databases/Projects/[Project Name]/`:

```
[Project Name]/
├── 00-status.md                 # Project overview + live truth
├── PROJECT.md                   # Claude context for this project
├── briefing/                    # Original client briefing docs
├── proposal/                    # Proposal versions & updates
├── recruitment/                 # Screeners, grids, profiles
│   └── screener/
├── pre-tasks/                   # Pre-fieldwork exercises
├── discussion-guide/            # Final discussion guides
├── knowledge-base/              # Project knowledge (flexible)
│   └── sources.md               # Always present: tracks processed docs
├── transcripts/                 # Research transcripts
│   ├── meeting/                 # Client meeting transcripts
│   ├── expert/                  # Expert interviews
│   └── consumer/                # Consumer interviews (IDI/FGD)
├── analysis/                    # Analysis outputs
│   └── findings/
└── reporting/                   # Client deliverables
```

### Phase 3: Generate Core Files

1. **00-status.md** - Full project page content (overview, timeline, stakeholders, market context, change log)
2. **PROJECT.md** - Claude context specific to this project
3. **knowledge-base/sources.md** - Empty sources tracker

### Phase 4: Output Checklist

Return next steps for the user:

```markdown
## Project Created: [Project Name]

**Location:** `vault/vault/Databases/Projects/[Project Name]/`

### Next Steps
- [ ] Add briefing materials to `briefing/`
- [ ] Update knowledge base as you learn more
- [ ] Run `/screener-spec` when recruitment criteria defined
- [ ] Run `/dg-spec` when research objectives finalized
```

## Template Files

| Template | Output | Purpose |
|----------|--------|---------|
| [`templates/00-status.template.md`](templates/00-status.template.md) | `00-status.md` | Project hub document |
| [`templates/PROJECT.template.md`](templates/PROJECT.template.md) | `PROJECT.md` | Claude context |
| [`templates/knowledge-base/sources.template.md`](templates/knowledge-base/sources.template.md) | `knowledge-base/sources.md` | Source tracking |

## Parameter Placeholders

Use these placeholders in templates (replaced during generation):

| Placeholder | Maps To |
|-------------|---------|
| `{{PROJECT_NAME}}` | Project Name |
| `{{CLIENT}}` | Client |
| `{{MARKETS}}` | Markets (comma-separated) |
| `{{METHODOLOGY}}` | Methodology |
| `{{TIMELINE_START}}` | Timeline Start date |
| `{{TIMELINE_END}}` | Timeline End date |
| `{{BUDGET}}` | Budget |
| `{{OVERVIEW}}` | Overview paragraph |
| `{{DATE}}` | Creation date (YYYY-MM-DD) |

## Knowledge Base Approach

The knowledge base is **flexible per project**. Only `sources.md` is required.

Skills should discover what exists:
```
1. Glob knowledge-base/*.md for available files
2. Read sources.md to understand what's been processed
3. Create new KB files as needed based on project content
```

**Common KB files** (create as needed):
- `market-context.md` - Market data, demand spaces, competition
- `consumer-insights.md` - Consumer needs, behaviors
- `brand-positioning.md` - Brand associations
- `research-objectives.md` - Research questions, methodology

## Migrating Existing Projects

For projects with existing `.md` page files:

1. Create the directory structure
2. Extract content from existing page into `00-status.md`
3. Preserve Obsidian frontmatter and wikilinks
4. Move original file to archive or delete

## Validation

After creation, verify:
- [ ] All directories created
- [ ] `00-status.md` contains project overview
- [ ] `PROJECT.md` has Claude context
- [ ] `knowledge-base/sources.md` exists
- [ ] No broken wikilinks from existing content
