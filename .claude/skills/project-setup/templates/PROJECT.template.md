# {{PROJECT_NAME}}

This is a qualitative research project for {{CLIENT}}.

## Start Here

**Read `00-status.md` first** to understand:
- Current phase and next milestone
- Active workstreams and open questions
- Key documents and where to find them
- Recent decisions and updates

## Study Context

**Client:** {{CLIENT}}
**Markets:** {{MARKETS}}
**Methodology:** {{METHODOLOGY}}
**Timeline:** {{TIMELINE_START}} to {{TIMELINE_END}}

## Skills Available

These skills can help with project work:

| Skill | When to Use |
|-------|-------------|
| `/screener-spec` | Create recruitment screener from criteria |
| `/dg-spec` | Create discussion guide from objectives |
| `/meeting-op` | Process meeting notes into updates |
| `/analysis-op` | Extract findings, insights, recommendations |
| `/project-ops` | Update project status |

## Document Architecture

```
{{PROJECT_NAME}}/
├── 00-status.md         # Live truth: phase, timeline, decisions
├── PROJECT.md           # This file (Claude context)
├── briefing/            # Original client briefing docs
├── proposal/            # Proposal versions
├── recruitment/         # Screeners, grids
├── pre-tasks/           # Pre-fieldwork exercises
├── discussion-guide/    # Final discussion guides
├── knowledge-base/      # Synthesized facts (flexible)
│   └── sources.md       # Tracks processed documents
├── transcripts/         # Research transcripts
│   ├── meeting/
│   ├── expert/
│   └── consumer/
├── analysis/            # Analysis outputs
└── reporting/           # Client deliverables
```

## Knowledge Base

The knowledge base is flexible. Discover what exists:
```
1. Glob knowledge-base/*.md for available files
2. Read sources.md to understand what's been processed
3. Create new files as needed based on content
```

## File Naming

- Always kebab-case
- End with date: `YYYYMMDD`
- Examples: `screener-draft-20260120.docx`, `dg-consumer-20260122.docx`

## Workflow Triggers

When certain tasks happen, update related documents:

### Meeting Transcript Added
1. Create takeaway summary
2. Extract facts → update knowledge-base
3. Update sources.md

### Transcript Added
1. Save to `transcripts/[type]/`
2. Extract insights → update knowledge-base

### Status Changes
Update `00-status.md` when:
- Phase changes
- Key documents added
- Decisions made
- Open questions resolved
