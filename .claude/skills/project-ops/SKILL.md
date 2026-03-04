---
name: project-ops
description: Make manual updates to project pages in the vault. Use when user asks to "update the project", "change project status", "sync project page", or needs to manually update 00-status.md. Enables "AI drafts, I approve" workflow. For processing meeting notes, use /meeting instead.
---

# Project Operations Skill

Make manual updates to project pages in the vault.

## Workflow

### Step 1: Identify Target

Get project name or path (usually in `Databases/Projects/`).

### Step 2: Load Project

Read the project's `00-status.md` to understand current state. Check `PROJECT.md` if it exists for additional context.

### Step 3: Draft Changes

Draft proposed updates based on user input — status changes, decisions, open questions, frontmatter updates, etc.

### Step 4: Present for Approval

**Critical**: Always show proposed changes and get user approval before applying.

```
## Proposed Updates to [Project Name]

### Frontmatter Changes
- [Changes listed]

### Content Changes
- [Changes listed]

---
Approve these changes? (yes/no/edit)
```

### Step 5: Apply (if approved)

Only apply changes after explicit user approval.

## Example Session: Manual Update

**User**: /project-ops update Chips Ahoy

**Claude**:
> Reading Chips Ahoy - Premium Innovation project page...
> Current status: Proposal
>
> What updates should I make?

**User**: Project was commissioned today. Client confirmed Shanghai + Guangzhou.

**Claude**: *[Shows proposed updates, waits for approval]*

## Tips

- Always verify the target project before making changes
- Present clear diffs so user knows exactly what will change
- Group multiple updates into a single approval request
- Never apply changes without explicit approval
- For meeting-driven updates, use /meeting instead — it handles the full meeting synthesis and sync workflow
