# Vault Knowledge Base

You are helping [Your Name], [Your Role] at [Your Company], manage their knowledge base and research projects.

## Role & Background

[Your Name] is a consultant in qualitative/market research, trends, and foresight. This vault is their central knowledge management system — a structured markdown directory.

Be helpful, concise. Take the mindset of a senior consultant with deep domain expertise.

**Primary Workflow**: Claude drafts updates, user approves. Project pages serve as source of truth.

---

## Vault Structure

```
/path/to/vault/                       # Working directory (git root)
├── CLAUDE.md                         # This file
├── .claude/
│   ├── skills/                       # Skill definitions
│   │   └── knowledge/references/     # Personal knowledge base (concepts, books, articles)
│   └── settings.json                 # Hooks configuration
└── vault/                            # Markdown vault root
    ├── sessions/                     # Auto-generated session logs (YYYYMMDD.md)
    ├── current.md                    # Cross-project open threads (auto-updated)
    ├── Active-Projects.md            # Quick reference for current work
    ├── Databases/
    │   ├── Projects/                 # Active client projects (source of truth)
    │   │   ├── {active-project}/     # Currently active projects in root
    │   │   ├── personal/             # Personal/non-client projects
    │   │   └── past-projects/        # Archived/completed projects
    │   ├── Clients/                  # Client organizations
    │   ├── Meetings/                 # Meeting notes & transcripts
    │   ├── Artifacts/                # Research deliverables
    │   ├── Documents/                # Reference documents
    │   ├── Prompts/                  # Reusable prompt templates
    │   └── Skills/                   # Workflow documentation (reference)
    └── Templates/                    # Document templates
```

---

## Project Structure

**Active projects** live in `vault/Databases/Projects/` root. **Past projects** live in `vault/Databases/Projects/past-projects/`. When a project completes, move it to `past-projects/`.

**Personal projects** (blog posts, open-source repos, thought leadership, biz-dev initiatives) live in `vault/Databases/Projects/personal/`. Same directory structure as client projects but no `Client:` frontmatter. Tag with `personal` in frontmatter.

Two formats exist:

### New Format: Directory-Based
```
vault/Databases/Projects/
├── project-name/                        # kebab-case, lowercase
│   ├── 00-status.md                    # Project hub (overview + live truth)
│   ├── PROJECT.md                      # Claude context for this project
│   ├── briefing/
│   ├── proposal/
│   ├── recruitment/
│   ├── discussion-guide/
│   ├── knowledge-base/
│   │   └── sources.md                  # Tracks processed documents
│   ├── meeting-takeaways/              # Decisions extracted from Databases/Meetings
│   ├── transcripts/                    # RESEARCH transcripts (not client meetings)
│   │   ├── consumer/
│   │   ├── expert/
│   │   └── notes/                      # Informal notes, colleague observations
│   ├── analysis/
│   └── reporting/
```

### Legacy Format: Single Files
```
vault/Databases/Projects/
├── Client - Project Name.md            # Flat file projects (e.g., migrated from Notion)
```

### Working with Projects

For directory-based projects:
1. **Read `00-status.md` first** — Look for "Agent use:" line at top for TL;DR
2. **Read `PROJECT.md`** — Project-specific context and terminology (if exists)
3. **Glob `knowledge-base/*.md`** — Discover available knowledge files
4. **Check `knowledge-base/sources.md`** — What's been processed
5. **Follow `## Context Loading` directives** — If `00-status.md` has a `## Context Loading` section, follow its skip directives (e.g., folders to ignore unless explicitly asked)

For legacy projects:
- The project `.md` file is the source of truth
- Updates go in "Team Notes and Updates" section

### Finding Content

All content lives under `vault/Databases/`. Search within the specific subdirectory, not vault-wide.

| Content | Location | Naming Convention |
|---------|----------|-------------------|
| Active Projects | `vault/Databases/Projects/` | kebab-case directories |
| Personal Projects | `vault/Databases/Projects/personal/` | kebab-case directories |
| Past Projects | `vault/Databases/Projects/past-projects/` | kebab-case directories |
| Meetings | `vault/Databases/Meetings/` | `YYYYMMDD - Title.md` |
| Clients | `vault/Databases/Clients/` | `lowercase.md` |
| Documents | `vault/Databases/Documents/` | Varies |
| Artifacts | `vault/Databases/Artifacts/` | `TYPE-Project-Desc-CLIENT-YYYYMMDD.md` |
| Prompts | `vault/Databases/Prompts/` | `kebab-case.md` |

**Efficient search patterns:**
```bash
# Active projects (in root, excludes personal/ and past-projects/)
ls vault/Databases/Projects/ | grep -v -E 'past-projects|personal'

# Personal projects
ls vault/Databases/Projects/personal/

# Past projects
ls vault/Databases/Projects/past-projects/ | grep -i "keyword"

# Meetings (by date or keyword)
ls vault/Databases/Meetings/ | grep "2026-01"
ls vault/Databases/Meetings/ | grep -i "kickoff"
```

**Do NOT:**
- Omit the `vault/` prefix from paths
- Use nested wildcards when a simple `ls | grep` works

### Creating New Projects

Use `/project-setup` to scaffold a new directory-based project.

---

## Relationship Model

```
Meeting → Project → Client
   ↓         ↓
Artifacts  Documents
```

- **Meetings** link to Projects via `Projects:` frontmatter
- **Projects** link to Clients via `Client:` frontmatter
- **Artifacts** (deliverables) link to Projects
- **Documents** (reference materials) link to Projects

---

## Relationship Maintenance Rules

### Rule 1: Bidirectional Links
When linking a meeting to a project, **update BOTH files**:
1. Meeting's `Projects:` frontmatter array → add project link
2. Project's `Meetings:` frontmatter array (in `00-status.md`) → add meeting link

Example:
```yaml
# In vault/Databases/Meetings/20260122 - Kickoff Call.md
Projects:
  - "Databases/Projects/project-name/00-status.md"

# In vault/Databases/Projects/project-name/00-status.md
Meetings:
  - "Databases/Meetings/20260122 - Kickoff Call.md"
```

Note: Use relative paths from vault root (without `vault/` prefix).

### Rule 2: Content Routing

All transcripts (meetings and research) are the same raw material. Route by **processing intent** — what happens next — not by content type.

| Processing Intent | Location | What Happens Next |
|-------------------|----------|-------------------|
| **Analyze for research insights** | `{project}/transcripts/consumer/` or `expert/` | → `/transcript-analysis` → `/analysis-op` → `/synthesis` → `/report` |
| **Summarize for decisions & actions** | `vault/Databases/Meetings/` | → `/meeting` → takeaways extracted → project status updated |
| **Extracted decisions/actions** | `{project}/meeting-takeaways/` | Reference artifact, already processed |

Decision tree:
- **What happens next with this transcript?**
  - **It gets analyzed for research insights** (consumer behavior, brand perception, market dynamics) → `{project}/transcripts/consumer/` or `expert/`
  - **It gets summarized for decisions, actions, and status updates** (internal alignment, client feedback, project planning) → `vault/Databases/Meetings/`
- **Are you extracting decisions/actions from a meeting?** → `{project}/meeting-takeaways/`

### Rule 3: Source Tracking
When processing any document into knowledge-base, add entry to `sources.md`:
```markdown
## Processed Sources
- `filename.md` — processed YYYY-MM-DD, extracted to 0X-topic.md
```

---

## Frontmatter Schema

### Projects
| Field | Type | Example |
|-------|------|---------|
| `Timeline Start` | Date range | `2026-01-15 to 2026-02-12` |
| `Client` | Link | `"Databases/Clients/client-name.md"` |
| `Meetings` | Link[] | Array of meeting links |
| `Artifacts` | Link[] | Array of artifact links |
| `Project Status` | Enum | `Proposal`, `Active`, `Complete`, `On Hold` |
| `Markets` | String[] | `China`, `Australia`, etc. |

### Meetings
| Field | Type | Purpose |
|-------|------|---------|
| `Meeting Summary` | Text | AI-generated meeting summary |
| `Projects` | Link[] | Linked projects |
| `Client Name` | Link[] | Client references |
| `Meeting Type` | Enum | Type classification |

---

## Skills Available

**Executable skills** (slash commands) live at `.claude/skills/`.

### Research Operations
| Skill | When to Use |
|-------|-------------|
| `/proposal` | Create and render research proposals (draft → iterate → Word or PPTX) |
| `/screener` | Create and render recruitment screeners (draft → iterate → Word) |
| `/dg` | Create and render discussion guides (draft → iterate → Word) |
| `/meeting` | Process meeting notes into summaries, extract tasks, optional Word output |
| `/transcript` | Process and render research transcripts to branded Word |
| `/analysis-op` | Extract findings, insights, recommendations (markdown output) |

### Transcript Analysis
| Skill | When to Use |
|-------|-------------|
| `/transcript-analysis` | Analyze research transcripts |
| `/synthesis` | Synthesize insights across sources |

### Project Management
| Skill | When to Use |
|-------|-------------|
| `/project-setup` | Scaffold a new project directory |
| `/project-ops` | Update project status pages |

### Document Operations
| Skill | When to Use |
|-------|-------------|
| `/docx-op` | Word document engine (JSON spec → .docx, markdown → .docx) |
| `/report` | Create and render research reports, oral debriefs, and SCQA narratives |
| `/pdf` | PDF operations |

### Knowledge Base
| Skill | When to Use |
|-------|-------------|
| `/knowledge` | Search personal knowledge base |

### Utilities
| Skill | When to Use |
|-------|-------------|
| `/skill-creator` | Create new skills |

---

## Workflow Triggers

When certain events happen, cascade updates:

### Meeting Transcript Added
1. Create takeaway summary
2. Extract facts → update knowledge-base
3. Update sources.md
4. Update 00-status.md if decisions made

### Status Changes
Update 00-status.md when:
- Phase changes
- Key documents added
- Decisions made
- Open questions resolved

### Session End (Automated)
A `SessionEnd` hook automatically logs what was discussed when a session closes:
- Logs append to `vault/sessions/YYYYMMDD.md`
- Entries are project-tagged with 2-4 sentence summaries
- Updates `vault/current.md` with cross-project open threads
- Trivial sessions (greetings, quick questions) are skipped

---

## File Naming Conventions

- Always kebab-case
- End with date: `YYYYMMDD`
- Examples: `screener-draft-20260120.docx`, `dg-consumer-20260122.docx`

### Meetings
- Format: `YYYYMMDD - Meeting Title.md`

### Artifacts
- Format: `TYPE-ProjectName-Description-CLIENT-YYYYMMDD.md`
- Types: MS (Meeting Summary), PR (Proposal), NT (Notes), DG (Discussion Guide)

---

## For Claude

### Session Start (Do This First)

**Before doing anything else at the start of every session**, read these two files:
1. **`vault/current.md`** — Cross-project open threads (what's waiting, in progress, to revisit)
2. **`vault/sessions/`** — Check the most recent session log (`ls -t vault/sessions/ | head -1`, then read it) for context on where things left off

This is non-negotiable. The SessionEnd hook writes continuity data; this step reads it. Without this, you lose cross-session context.

### Quick Start (Read in Order)

Once session context is loaded, read project-specific files as needed:
1. **`vault/Active-Projects.md`** — Current work at a glance
2. **`vault/Databases/Projects/{project}/00-status.md`** — Project hub with "Agent use:" TL;DR
3. **`vault/Databases/Projects/{project}/PROJECT.md`** — Project-specific context (if exists)

### Path Prefix

Working directory is git root. Markdown vault is nested at `vault/`.

```bash
# Correct paths from working directory
vault/Databases/Projects/
vault/Databases/Meetings/
vault/Databases/Clients/
vault/Active-Projects.md
```

### Session Logs & Open Threads

Session logs at `vault/sessions/YYYYMMDD.md` provide continuity across conversations. `vault/current.md` tracks open threads across all projects.

```bash
# Check open threads first
cat vault/current.md

# Recent session logs
ls -t vault/sessions/ | head -5
```

### Rules

1. Draft updates to project pages; await approval before writing
2. Preserve frontmatter schema when editing files
3. Link meetings to projects bidirectionally after processing
4. Update `sources.md` when processing documents into knowledge-base
5. If `00-status.md` has a `## Context Loading` section, respect its skip directives
6. **Never save working files to Desktop or ~/Downloads.** All outputs belong inside the vault
