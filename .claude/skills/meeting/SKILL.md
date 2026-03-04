---
name: meeting
description: Process meeting transcripts or notes into structured summaries with decisions, actions, and next steps. Optionally syncs updates to linked project pages and renders to branded Word document. Use when user asks to "summarize the meeting", "process meeting notes", "extract action items", "write up the meeting", or shares a meeting transcript. Also handles project-page sync after meetings — replaces the need for /project-ops meeting mode.
---

# Meeting Synthesis

Transform meeting transcripts or notes into structured, actionable summaries. Extract real tasks and optionally render to branded Word document.

## Workflow

```
Phase 1: PROCESS — Synthesize transcript into structured summary
Phase 2: CONFIRM — User validates tasks and open questions
Phase 2.5: SYNC (optional) — Update linked project page
Phase 3: RENDER (optional) — Generate branded Word document via docx-op
```

### Phase 1: Process

1. **Gather context** from project knowledge base
2. **Synthesize** transcript/notes into structured summary
3. **Extract candidate tasks** — only genuinely actionable items with named owners
4. **Present summary** to user for review

### Phase 2: Confirm

5. **User confirms** which candidate tasks are real tasks
6. **Append confirmed tasks** to project `tasks.md`
7. **Update 00-status.md** if decisions were made

### Phase 2.5: Sync to Project (Optional)

After confirming tasks, offer to sync changes to the linked project page:

> Should I update the project page with these decisions and next steps?

If yes:
8. **Read project's 00-status.md** — check current state
9. **Draft proposed updates** — decisions, status changes, new open questions
10. **Present diff for approval** — show exactly what will change
11. **Apply changes** — only after explicit user approval
12. **Update bidirectional links** — add meeting link to project's Meetings frontmatter, add project link to meeting's Projects frontmatter

### Phase 3: Render (Optional)

When user requests a Word document of the meeting summary:

**For structured takeaway documents:**
```bash
cat takeaway-spec.json | bun run .claude/skills/docx-op/tools/Generate.ts --type takeaway output.docx
```

**Takeaway spec format:**
```json
{
  "version": "1.0",
  "document_type": "takeaway",
  "metadata": {
    "title": "Meeting Takeaway: [Meeting Title]",
    "date": "2026-01-22",
    "project": "[Project Name]",
    "attendees": "Names"
  },
  "sections": [
    { "heading": "Summary", "level": 1, "content": "2-3 paragraph summary..." },
    { "heading": "Decisions Made", "level": 2, "bullets": ["Decision 1", "Decision 2"] },
    { "heading": "Action Items", "level": 2, "bullets": ["Task — Owner — Due date"] },
    { "heading": "Open Questions", "level": 2, "bullets": ["Question 1"] },
    { "heading": "Next Steps", "level": 2, "bullets": ["Step 1"] }
  ]
}
```

**For simple prose meeting summaries:**
```bash
bun run .claude/skills/docx-op/tools/MarkdownToDocx.ts meeting-summary.md output.docx
```

Save Word output to:
```
{project}/meeting-takeaways/[meeting-name]-takeaways-YYYYMMDD.docx
```

## Rules Index

| Rule | Impact | When to Apply |
|------|--------|---------------|
| [quality-task-extraction](rules/quality-task-extraction.md) | HIGH | Every meeting — validates candidate tasks |
| [frame-meeting-types](rules/frame-meeting-types.md) | MEDIUM | Choosing tone, focus, follow-up approach |
| [quality-tone-calibration](rules/quality-tone-calibration.md) | MEDIUM | Writing summaries |

## Output Structure

1. **Summary** (2-3 paragraphs max)
2. **Decisions Made** (clear list with context)
3. **Real Tasks** (only genuinely actionable items)
4. **Open Questions** (requiring follow-up)
5. **Next Steps** (what happens next)

## Local Context Fetching

```
1. Glob knowledge-base/*.md for available knowledge base files
2. Read knowledge-base/sources.md to understand what's been processed
3. Glob transcripts/meeting/ for previous meeting summaries
4. Read PROJECT.md for project terminology and conventions
5. Read 00-status.md for current project state
```

## Output

### Markdown (always)
```
{project}/meeting-takeaways/[meeting-name]-takeaways-YYYYMMDD.md
```

### Tasks
Append confirmed tasks to `{project}/tasks.md`:
```markdown
## Open
- [ ] Task description | Source: meeting-name | Due: YYYY-MM-DD | Owner: @name
```

## Agent Use Line

Every synthesis must include:
```
**Agent use:** [What to assume as locked facts, what's uncertain, when/how to proceed]
```

## Anti-Patterns

| Avoid | Do Instead |
|-------|------------|
| Auto-creating tasks from transcript | Show candidates, let user confirm |
| Extracting "we should..." statements | Only extract with named owner |
| Vague action items ("explore options") | Specific: "Tristan drafts 3 options by Oct 28" |
| Missing owners | Every task has clear assignee |
| No deadlines | Every task has due date |
| Exhaustive transcript | Concise 2-3 paragraph summary |
