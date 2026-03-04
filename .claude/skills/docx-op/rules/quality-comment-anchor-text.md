---
name: quality-comment-anchor-text
category: quality
impact: high
tags: [comments, feedback, editing]
description: Always use anchor text when processing document feedback comments
---

# Comment Anchor Text

When processing comments from Word documents, always consider the **anchor text** — the text the comment is attached to.

## Why This Matters

Comments like "delete" or "change this" are meaningless without context. The anchor text shows exactly WHAT text the commenter is referring to.

## Workflow

```bash
# List comments with anchor text
bun run .claude/skills/docx-op/tools/CommentManager.ts list document.docx
```

Output includes both comment text AND anchor text:

```
Comment 1: "Please revise this"
  Anchor: "The methodology was developed in 2019"

Comment 2: "Delete"
  Anchor: "including preliminary findings"
```

## Processing Feedback

When implementing feedback:

1. **Read the comment** — What action is requested?
2. **Read the anchor text** — What content does it apply to?
3. **Apply the change** — To the specific anchored content

## Avoid

| Pattern | Problem |
|---------|---------|
| Reading comments without anchor text | Ambiguous; "delete this" means nothing without context |
| Guessing what comment refers to | May change wrong content |
| Batch processing comments by text alone | Same comment text may apply to different anchors |

## Related Rules

- See SKILL.md for full comment management commands
