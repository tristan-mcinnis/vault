# Meeting Processing Reference

Process meeting notes to extract actionable updates and draft changes to the linked project page.

## Workflow

### 1. Read Meeting Notes

Meeting files are typically in `vault/Databases/Meetings/`.

### 2. Identify Linked Project

Check meeting frontmatter for `Projects:` field. If present, read the linked project page.

If no project linked, offer options:
1. Link it to an existing project
2. Create a new project page
3. Process without project linkage

### 3. Extract Meeting Intelligence

**Decisions Made**
- Any commitments or agreements
- Scope changes
- Methodology decisions
- Timeline adjustments

**Action Items**
- Tasks assigned
- Deadlines mentioned
- Follow-ups needed

**Key Updates**
- New information about the project
- Stakeholder changes
- Budget/pricing discussions
- Strategic shifts

**Deliverables**
- New deliverables mentioned
- Changes to existing deliverables
- Quality criteria discussed

### 4. Draft Project Page Updates

Generate proposed changes:

1. **Add Meeting Link**: Add this meeting to the project's `Meetings:` frontmatter
2. **Timeline Updates**: If dates changed, update Timeline section
3. **Team Notes Section**: Add dated entry under "Team Notes and Updates"
4. **Scope Changes**: Update relevant sections if scope expanded/changed
5. **New Artifacts**: If deliverables mentioned, note them

### 5. Present for Approval

Always show proposed changes and get user approval before applying.

## Meeting Summary Format (for project page)

```markdown
### [Date] - [Meeting Title Summary]

[2-3 sentence summary of meeting purpose and outcome]

**Key Decisions:**
- [Decision with context]

**Action Items:**
- [ ] [Action] - [Owner] - [Due date if known]

**Updates to Scope/Timeline:**
- [Any changes noted]

---
Updated from [[Meeting Link]] - [Date]
```

## Error Handling

- **No project found**: Offer to create new project or process standalone
- **Multiple projects linked**: Ask user which project to update
- **Project page locked/missing**: Report error, save draft for manual application
