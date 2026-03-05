# vault

A complete knowledge management and research operations system built on [Claude Code](https://docs.anthropic.com/en/docs/claude-code).

This is the actual setup I use daily as a qualitative research consultant. It manages projects, generates branded deliverables, processes research transcripts, runs cross-source analysis, and maintains continuity across sessions — all from the terminal.

## What This Is

A structured markdown directory that turns Claude Code into a domain-specific operating system. Instead of writing detailed prompts every session, the system's architecture — file structure, naming conventions, relationship rules, and 25 callable skills — provides the context. Claude reads the files, follows the rules, and produces consistent, high-quality output.

**The core idea: engineer your file system, not your prompts.**

## Architecture

```
vault/
├── CLAUDE.md                        # Operating manual — Claude reads this first, always
├── .claude/
│   ├── settings.json                # Hooks (automated behaviors)
│   └── skills/                      # 25 callable workflows
│       ├── analysis-op/             # Cross-source qualitative analysis
│       │   ├── SKILL.md             # Lean router (~80 lines)
│       │   └── rules/               # Atomic methodology files
│       │       ├── frame-insight-levels.md
│       │       ├── frame-strategic-choice.md
│       │       ├── quality-insight-test.md
│       │       └── ...
│       ├── proposal/                # Research proposals → branded .docx
│       ├── screener/                # Recruitment screeners
│       ├── dg/                      # Discussion guides
│       ├── transcript/              # Transcript processing + rendering
│       ├── synthesis/               # Cross-source pattern synthesis
│       ├── report/                  # Reports and oral debriefs
│       ├── docx-op/                 # Document generation engine
│       │   └── tools/               # TypeScript + Python toolchain
│       ├── pptx/                    # PowerPoint generation
│       ├── knowledge/               # Searchable personal knowledge base
│       ├── meeting/                 # Meeting note processing
│       ├── project-setup/           # Project directory scaffolding
│       ├── project-ops/             # Project status updates
│       ├── skill-creator/           # Self-hosting: create new skills from within Claude
│       └── ...
└── vault/                           # Markdown vault root
    ├── sessions/                    # Auto-generated session logs (YYYYMMDD.md)
    ├── current.md                   # Cross-project open threads tracker
    ├── Active-Projects.md           # Dashboard
    └── Databases/
        ├── Projects/                # Active client work
        │   ├── {project}/           # Directory-based projects
        │   │   ├── 00-status.md     # Source of truth
        │   │   ├── PROJECT.md       # Claude context for this project
        │   │   ├── knowledge-base/  # Project-specific knowledge
        │   │   ├── transcripts/     # Research transcripts
        │   │   ├── analysis/        # Findings, insights
        │   │   └── reporting/       # Final deliverables
        │   ├── personal/            # Non-client projects
        │   └── past-projects/       # Archived projects
        ├── Meetings/                # YYYYMMDD - Title.md
        ├── Clients/                 # Client profiles
        ├── Artifacts/               # Deliverables
        ├── Documents/               # Reference materials
        └── Prompts/                 # Reusable prompt templates
```

## Key Concepts

### 1. CLAUDE.md as Operating System

The `CLAUDE.md` file is 400+ lines of instructions that load before every session. It tells Claude:

- **Who you are** and what you do
- **How the vault is structured** — directories, naming conventions, relationships
- **The rules** — bidirectional linking, content routing, source tracking
- **How to find things** — search patterns, path conventions
- **What skills are available** — a routing table mapping tasks to slash commands
- **What NOT to do** — never save to Desktop, respect Context Loading directives

This isn't a prompt. It's an operating system. You write it once, refine it over weeks, and every session benefits from every improvement you've ever made.

### 2. Skills with the Router Pattern

Each skill is a callable workflow (invoked as `/skill-name`). Complex skills use the **router pattern**:

```
skill-name/
├── SKILL.md              # Lean router: ~80 lines, index + workflow
└── rules/                # Atomic rule files (one concept each)
    ├── frame-*.md         # Output frameworks
    ├── quality-*.md       # Validation criteria
    └── core-*.md          # Analytical patterns
```

**Why this works:**
- Claude loads only the rules relevant to the current task (token efficiency)
- Rules are reusable across skills (the evidence hierarchy works in analysis, synthesis, and reporting)
- Methodology evolves independently (update one rule, improve every skill that uses it)

**Degrees of freedom** — match instruction specificity to task fragility:
| Freedom | When | Example |
|---------|------|---------|
| High | Multiple valid approaches | Heuristics, text instructions |
| Medium | Preferred pattern exists | Pseudocode, parameterized scripts |
| Low | Fragile/critical operations | Exact scripts, specific sequences |

### 3. Automated Session Continuity

Claude Code has no memory between sessions. The `SessionEnd` hook solves this:

```json
// .claude/settings.json
{
  "hooks": {
    "SessionEnd": [{
      "hooks": [{
        "type": "prompt",
        "prompt": "Before this session ends, create a session log entry..."
      }]
    }]
  }
}
```

When any session closes, it automatically:
1. Identifies which projects were discussed
2. Appends a timestamped log to `vault/sessions/YYYYMMDD.md`
3. Updates `vault/current.md` (Waiting On / In Progress / To Revisit)
4. Skips trivial sessions

Result: perfect continuity across conversations with zero effort.

### 4. Document Generation Pipeline

The `docx-op` skill ships a TypeScript + Python toolchain for generating branded Word and PowerPoint files:

- `MarkdownToDocx.ts` — Markdown → branded .docx
- `Generate.ts` — JSON spec → .docx for complex document types
- `ContentExtractor.ts` — Extract text/structure from .docx
- `OoxmlManager.ts` — Raw OOXML manipulation

Every research deliverable (proposal, screener, discussion guide, transcript, report) renders to branded output through this pipeline. No manual formatting. Client-ready from the terminal.

### 5. Relationship Model

```
Meeting → Project → Client
   ↓         ↓
Artifacts  Documents
```

Bidirectional links are enforced: when a meeting is linked to a project, both files are updated. Content is routed by **processing intent** — what happens next, not what it "is":
- **Analyze for research insights** → `{project}/transcripts/consumer/` or `expert/` (feeds into analysis pipeline)
- **Summarize for decisions & actions** → `vault/Databases/Meetings/` (feeds into meeting processing)
- **Extracted decisions** → `{project}/meeting-takeaways/`

### 6. Knowledge Base

800+ searchable markdown files organized as:
- **Concepts** — atomic notes on ideas and frameworks
- **Books** — key takeaways and applications
- **Articles** — saved articles with annotations
- **Professional frameworks** — business development, client management, leadership, marketing psychology

Searchable via `/knowledge`. Claude draws on your accumulated thinking rather than generic AI knowledge.

## Skills Reference

### Research Operations
| Skill | Purpose |
|-------|---------|
| `/proposal` | Draft and render research proposals (markdown → iterate → Word or PPTX) |
| `/screener` | Recruitment screeners with hard-filter logic and bilingual support |
| `/dg` | Discussion guides for IDIs, FGDs, triads |
| `/transcript` | Process raw transcripts with speaker diarization → branded Word |
| `/analysis-op` | Extract findings → map tensions → elevate insights → implications → recommendations |
| `/synthesis` | Cross-source synthesis: corpus themes, consumer segments, expert takeaways |
| `/report` | Research reports, oral debriefs, SCQA narrative summaries |

### Document Generation
| Skill | Purpose |
|-------|---------|
| `/docx-op` | Word document engine (markdown → .docx, JSON spec → .docx) |
| `/pptx` | PowerPoint creation and editing |
| `/pdf` | PDF operations |
| `/xlsx` | Excel operations |

### Project Management
| Skill | Purpose |
|-------|---------|
| `/project-setup` | Scaffold new project directories |
| `/project-ops` | Update project status pages |
| `/meeting` | Process meeting notes → summary, decisions, actions |

### Meta
| Skill | Purpose |
|-------|---------|
| `/knowledge` | Search personal knowledge base |
| `/skill-creator` | Create new skills from within Claude |

## Getting Started

### If you want to adapt this for your own work:

1. **Fork this repo**
2. **Edit `CLAUDE.md`** — replace my role/context with yours
3. **Keep the structure** — the directory layout, naming conventions, and relationship model are domain-agnostic
4. **Start with 3 things:**
   - Your `CLAUDE.md` (who you are, how your files work, what rules to follow)
   - The `SessionEnd` hook (free continuity across sessions)
   - One skill for your most repeated workflow
5. **Add skills as you identify repeated workflows** — use the router pattern for anything methodology-heavy

### Minimum viable setup:

```
your-project/
├── CLAUDE.md              # Your operating manual
├── .claude/
│   └── settings.json      # SessionEnd hook
└── your-files/            # Whatever structure fits your work
```

The CLAUDE.md alone — even without skills — will dramatically improve your Claude Code experience.

## What's Redacted

This is my actual production setup. The following have been removed:
- Client project data and meeting notes
- Personal knowledge base entries (concepts, books, articles)
- Client names in example paths (replaced with generic examples)
- Session logs and open threads

The architecture, skills, tooling, and methodology are all real and unmodified.

## Context

I'm a Managing Partner at a qualitative research consultancy. This system handles the full project lifecycle: brief → proposal → recruitment → fieldwork → analysis → synthesis → reporting. The skills encode 15+ years of consulting methodology as loadable context.

Built on Claude Code (Anthropic's CLI). Not Claude Desktop, not the API directly — Claude Code with its file system access, hooks, and skill architecture.

## License

MIT — use it however you want.
