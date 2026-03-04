---
name: quality-task-extraction
category: quality
impact: high
tags: [meetings, tasks, extraction]
description: Four-point validation criteria for extracting real tasks from meetings
---

# Real Task Extraction

Only extract tasks that meet ALL four criteria. This prevents task lists from filling with vague intentions and resolved items.

## Validation Criteria

| Criterion | Must Have | Pass | Fail |
|-----------|-----------|------|------|
| Explicit owner | Named person assigned | "Tristan will..." | "We should..." |
| Deadline mentioned | Specific date or timeframe | "by Friday" | "soon" |
| Unresolved at meeting end | Not discussed and closed | Still pending | Decided in meeting |
| Concrete deliverable | Tangible output | "Send deck" | "Think about" |

## Bullshit Filter

Reject these common false positives:

| False Positive | Why It Fails |
|----------------|--------------|
| Things resolved during the meeting | No longer actionable |
| Vague intentions ("explore", "consider", "look into") | No concrete deliverable |
| Context statements disguised as tasks | Information, not action |
| Low-priority items mentioned in passing | Not genuinely committed |
| "We should..." statements | No explicit owner |

## Workflow

```
1. Extract candidate tasks from transcript
2. Apply 4-point validation to each
3. Run through bullshit filter
4. SHOW user the candidates - never auto-create
5. User confirms which are real
6. Append confirmed tasks to project tasks file
```

**Never auto-create tasks. Always confirm with user first.**

## Avoid

| Pattern | Problem |
|---------|---------|
| Auto-creating tasks from transcript | Creates noise, user loses trust |
| Extracting "we should..." statements | No accountability without owner |
| Vague action items ("explore options") | Not actionable |
| Missing owners or deadlines | Can't be tracked or followed up |
| Creating tasks for resolved items | Already done, clutters list |

## Related Rules

- See [frame-meeting-types](frame-meeting-types.md) for type-specific follow-up expectations
