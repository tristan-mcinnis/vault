---
name: core-split-paths
category: core
impact: medium
tags: [dg-draft, segmentation, respondents]
description: Formatting split question paths for different respondent types
---

# Split Paths

When different respondent types need different questions within the same guide.

## When to Use

- Mixed sample with distinct segments (current vs. lapsed users)
- Category users vs. brand users
- Different usage occasions requiring different probes
- Any time questions diverge based on respondent characteristics

## Format

```markdown
### PATH A: Current Users (X respondents)

1. Question for current users?
   当前用户问题？

2. Follow-up specific to current behavior?

---

### PATH B: Lapsed Users (X respondents)

1. Question for lapsed users?
   流失用户问题？

2. Follow-up about why they stopped?
```

## Rules

1. **Label clearly** — Use descriptive path names (not just "Path A/B")
2. **Include counts** — Note how many respondents per path
3. **Separate with rules** — Use `---` between paths for clarity
4. **Mirror structure** — Keep question numbering parallel when possible
5. **Rejoin explicitly** — If paths merge back, note "ALL RESPONDENTS CONTINUE"

## Multi-Path Example

For 3+ segments:

```markdown
### PATH A: Heavy Users (3 respondents)
[Questions...]

---

### PATH B: Light Users (3 respondents)
[Questions...]

---

### PATH C: Non-Users (2 respondents)
[Questions...]

---

### ALL RESPONDENTS CONTINUE

4. Now thinking about [common topic]...
```

## Avoid

| Pattern | Problem |
|---------|---------|
| Unlabeled paths | Moderator confusion during fieldwork |
| Missing respondent counts | Can't validate sample coverage |
| Paths without rejoining | Unclear if guide continues together |
| Too many paths (4+) | Consider separate guides instead |

## Related Rules

- See [frame-document-structure](frame-document-structure.md) for overall guide structure
