---
name: quality-speaker-mapping
category: quality
impact: medium
tags: [transcript, speakers, diarization]
description: Speaker ID replacement and label conventions
---

# Speaker Mapping

Replace generic speaker IDs from transcription services with meaningful labels.

## Mapping Format

```json
{
  "mappings": [
    { "speaker_id": "SPEAKER_00", "name": "Moderator", "role": "moderator" },
    { "speaker_id": "SPEAKER_01", "name": "Zhang Wei", "role": "participant" },
    { "speaker_id": "SPEAKER_02", "name": "Li Ming", "role": "participant" }
  ]
}
```

## Label Conventions

| Input | Output | When |
|-------|--------|------|
| `SPEAKER_00` (moderator) | `[M]:` or `[MOD]:` | Always for moderator |
| `SPEAKER_01` | `[P1]:` | FGD participants |
| `SPEAKER_01` | `[R]:` | IDI respondent |
| Named participant | `[Zhang Wei]:` | When names are known |

## Workflow

1. **Identify moderator** - Usually SPEAKER_00 or most frequent speaker
2. **Map participants** - Sequential P1, P2, P3... or actual names
3. **Apply consistently** - Same speaker = same label throughout
4. **Verify** - Spot-check a few turns for accuracy

## Avoid

| Pattern | Problem |
|---------|---------|
| Mixing label styles | `[P1]` and `[Participant 1]` in same doc |
| Changing labels mid-document | Breaks analysis continuity |
| Guessing speaker identity | Better to use generic P# if unsure |

## Related Rules

- See [quality-formatting-conventions](quality-formatting-conventions.md) for label formatting
