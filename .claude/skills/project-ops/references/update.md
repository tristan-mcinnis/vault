# Project Update Reference

Draft changes to project pages with user approval before applying.

## Workflow

### 1. Identify Project

Search `vault/Databases/Projects/` for matching project.

### 2. Read Current State

Parse the project page:
- Current frontmatter (status, links, dates)
- Section structure
- Team Notes section (for appending)

### 3. Gather Update Information

Ask what updates to make:
- Status changes
- Timeline updates
- New decisions or scope changes
- Team/stakeholder updates
- New deliverables or artifacts
- General notes to add

### 4. Draft Changes

**Frontmatter Updates**
```yaml
# Changes to frontmatter
Project Status: Proposal -> Active
Timeline Start: 2026-01-15 to 2026-02-28  # Extended
```

**Section Updates**
```markdown
## Timeline
| Milestone | Date | Status | Notes |
| Fieldwork | Feb 5-8 -> Feb 10-12 | Not Started | Moved due to recruitment |
```

**Team Notes Addition**
```markdown
### [Date] - [Update Title]
[Summary of update]
- Key point 1
- Key point 2
```

### 5. Present for Approval

Show complete diff and get approval before applying.

## Update Types

### Status Change
Updates the `Project Status` frontmatter field.
Valid values: `Proposal`, `Active`, `Fieldwork`, `Analysis`, `Delivery`, `Complete`, `On Hold`

### Timeline Update
Modifies the Timeline table or `Timeline Start` frontmatter.

### Scope Change
Updates project understanding sections, adds to scope/out-of-scope lists.

### Stakeholder Update
Updates the Key Stakeholders table.

### Deliverable Update
Adds to deliverables list, updates status.

### Note Addition
Appends dated entry to Team Notes section.

## Bulk Updates

For multiple updates across a project page:

1. List all changes to make
2. Group by section (frontmatter, timeline, scope, notes)
3. Present as single approval request
4. Apply atomically
