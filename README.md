# vault

A project management and knowledge system built on [Claude Code](https://docs.anthropic.com/en/docs/claude-code) that turns a folder of markdown files into an operating system for your work.

I use this daily to manage client projects, generate branded documents, process meeting notes, and maintain continuity across sessions — all from the terminal. The domain-specific workflows (my industry skills) sit on top of this foundation. This repo is the foundation.

## What This Is

A structured markdown directory that gives Claude Code persistent context, enforced rules, and callable workflows. Instead of re-explaining yourself every session, the architecture — file structure, naming conventions, relationship rules, and skills — provides the context automatically.

**The core idea: engineer your file system, not your prompts.**

## Architecture

```
vault/
├── CLAUDE.md                        # Operating manual — Claude reads this first, always
├── .claude/
│   ├── settings.json                # Hooks (automated behaviors)
│   └── skills/                      # Callable workflows
│       ├── docx-op/                 # Document generation engine
│       │   └── tools/               # TypeScript + Python toolchain
│       ├── pptx/                    # PowerPoint generation
│       ├── pdf/                     # PDF operations
│       ├── xlsx/                    # Spreadsheet operations
│       ├── meeting/                 # Meeting note processing
│       ├── project-setup/           # Project directory scaffolding
│       ├── project-ops/             # Project status updates
│       ├── knowledge/               # Searchable personal knowledge base
│       ├── skill-creator/           # Create new skills from within Claude
│       └── {your-domain-skills}/    # ← Add your industry workflows here
└── vault/                           # Markdown vault root
    ├── sessions/                    # Auto-generated session logs (YYYYMMDD.md)
    ├── current.md                   # Cross-project open threads tracker
    ├── Active-Projects.md           # Dashboard
    └── Databases/
        ├── Projects/                # Active work
        │   ├── {project}/           # Directory-based projects
        │   │   ├── 00-status.md     # Source of truth
        │   │   ├── PROJECT.md       # Claude context for this project
        │   │   ├── knowledge-base/  # Project-specific knowledge
        │   │   └── ...              # Your project subdirectories
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
- **The rules** — bidirectional linking, content routing by processing intent, source tracking
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
    └── core-*.md          # Patterns and heuristics
```

**Why this works:**
- Claude loads only the rules relevant to the current task (token efficiency)
- Rules are reusable across skills
- Methodology evolves independently (update one rule, improve every skill that uses it)

**Degrees of freedom** — match instruction specificity to task fragility:
| Freedom | When | Example |
|---------|------|---------|
| High | Multiple valid approaches | Heuristics, text instructions |
| Medium | Preferred pattern exists | Pseudocode, parameterized scripts |
| Low | Fragile/critical operations | Exact scripts, specific sequences |

This repo includes infrastructure skills (document generation, project management, meeting processing). You add your own domain skills on top — whatever workflows are specific to your industry.

### 3. Memory Loop (Session Continuity)

Claude Code has no built-in memory between sessions. This system creates a complete memory loop with two halves:

**Write side — `SessionEnd` hook (automatic):**

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

**Read side — Session Start rule (in CLAUDE.md):**

The CLAUDE.md includes a "Session Start" section that instructs Claude to read `current.md` and the latest session log **before doing anything else**. This closes the loop — the hook writes state, the rule reads it back.

```
Session ends → SessionEnd hook writes to sessions/ and current.md
Session starts → CLAUDE.md rule reads current.md and latest session log
```

**Three memory layers in total:**
| Layer | Scope | Mechanism |
|-------|-------|-----------|
| **Auto-memory** (`.claude/.../memory/MEMORY.md`) | User identity, preferences, stable patterns | Claude Code built-in — persists across sessions automatically |
| **Session logs** (`vault/sessions/YYYYMMDD.md`) | What happened, when, in which project | SessionEnd hook writes, Session Start rule reads |
| **Open threads** (`vault/current.md`) | Cross-project state: waiting, in progress, to revisit | SessionEnd hook writes, Session Start rule reads |

Result: perfect continuity across conversations. The write side is automated. The read side is enforced by CLAUDE.md.

### 4. Document Generation Pipeline

The `docx-op` skill ships a TypeScript + Python toolchain for generating branded Word and PowerPoint files:

- `MarkdownToDocx.ts` — Markdown → branded .docx
- `Generate.ts` — JSON spec → .docx for complex document types
- `ContentExtractor.ts` — Extract text/structure from .docx
- `OoxmlManager.ts` — Raw OOXML manipulation

Any skill you build can render its output through this pipeline. Write in markdown, deliver in .docx or .pptx with your branding.

### 5. Relationship Model

```
Meeting → Project → Client
   ↓         ↓
Artifacts  Documents
```

Bidirectional links are enforced: when a meeting is linked to a project, both files are updated. Content is routed by **processing intent** — what happens next, not what it "is":
- **Needs deep analysis** → project subdirectory (feeds into your domain skills)
- **Summarize for decisions & actions** → `vault/Databases/Meetings/` (feeds into meeting processing)
- **Extracted decisions** → `{project}/meeting-takeaways/`

### 6. Knowledge Base

Searchable markdown files organized by type:
- **Concepts** — atomic notes on ideas and frameworks
- **Books** — key takeaways and applications
- **Articles** — saved articles with annotations
- **Professional frameworks** — domain-specific reference material

Searchable via `/knowledge`. Claude draws on your accumulated thinking rather than generic AI knowledge. The knowledge base is empty in this repo — populate it with your own references.

## Skills Included

### Infrastructure (included in this repo)
| Skill | Purpose |
|-------|---------|
| `/docx-op` | Word document engine (markdown → .docx, JSON spec → .docx) |
| `/pptx` | PowerPoint creation and editing |
| `/pdf` | PDF operations |
| `/xlsx` | Excel operations |
| `/meeting` | Process meeting notes → summary, decisions, actions |
| `/project-setup` | Scaffold new project directories |
| `/project-ops` | Update project status pages |
| `/knowledge` | Search personal knowledge base |
| `/skill-creator` | Create new skills from within Claude |

### Domain Skills (add your own)

The infrastructure above is domain-agnostic. On top of it, I run ~15 additional skills specific to my industry (primary research workflows — fieldwork planning, data collection, analysis, synthesis, reporting). Those aren't included here because they're specific to my work.

**To add your own domain skills:**
1. Use `/skill-creator` to scaffold a new skill
2. Use the router pattern for methodology-heavy workflows
3. Wire your skills into the document generation pipeline for branded output

Examples of what domain skills might look like:
- **Sales**: lead qualification → proposal generation → contract drafting
- **Legal**: case research → brief drafting → filing preparation
- **Product**: user research → spec writing → PRD generation
- **Consulting**: data analysis → insight extraction → slide deck creation
- **Content**: research → outline → draft → editing → publishing

## Getting Started

1. **Fork this repo**
2. **Edit `CLAUDE.md`** — replace the role/context with yours
3. **Start with 3 things:**
   - Your `CLAUDE.md` (who you are, how your files work, what rules to follow)
   - The `SessionEnd` hook (free continuity across sessions)
   - One skill for your most repeated workflow
4. **Add skills as you identify repeated workflows** — use the router pattern for anything methodology-heavy

### Minimum viable setup:

```
your-project/
├── CLAUDE.md              # Your operating manual
├── .claude/
│   └── settings.json      # SessionEnd hook
└── your-files/            # Whatever structure fits your work
```

The CLAUDE.md alone — even without skills — will dramatically improve your Claude Code experience.

## What's Included vs. What's Not

**Included (the platform):**
- Complete CLAUDE.md with project management rules, relationship model, naming conventions
- Memory loop (SessionEnd hook + Session Start rule)
- Document generation pipeline (Word, PowerPoint, PDF, Excel)
- Project scaffolding and status management
- Meeting processing
- Knowledge base architecture
- Skill creator (build new skills from within Claude)

**Not included (my domain layer):**
- Industry-specific workflow skills (research planning, data collection, analysis, reporting)
- Client project data
- Personal knowledge base entries
- Session logs

The platform is domain-agnostic. The domain layer is where your industry expertise lives.

## Context

I run a consultancy focused on primary and secondary research. This system handles the full project lifecycle — from initial brief through fieldwork, analysis, and final deliverable. The infrastructure in this repo is what makes that possible, but the research-specific skills sit on top and aren't included here.

Built on Claude Code (Anthropic's CLI). Not Claude Desktop, not the API directly — Claude Code with its file system access, hooks, and skill architecture.

## License

MIT — use it however you want.
