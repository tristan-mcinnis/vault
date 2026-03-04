---
name: quality-formatting-conventions
category: quality
impact: high
tags: [transcript, formatting, verbatim]
description: Standard formatting conventions for transcript elements
---

# Formatting Conventions

Consistent formatting ensures transcripts are readable and analyzable.

## Element Standards

| Element | Standard | Example |
|---------|----------|---------|
| Speaker labels | Brackets, colon | `[MOD]:`, `[P1]:` |
| Timestamps | Brackets, HH:MM:SS | `[00:15:30]` at start of turn |
| Overlapping speech | Annotation | `[overlapping]` |
| Inaudible | Annotation with optional timestamp | `[inaudible]` or `[inaudible, 00:15:30]` |
| Non-verbal cues | Brackets, lowercase | `[laughs]`, `[pause]`, `[gestures]` |
| Spoken emphasis | ALL CAPS | `I REALLY liked it` |
| Filler words | Include verbatim | `um`, `uh`, `like` |
| Chinese text | Simplified + pinyin | `好的 (hǎo de)` |

## Speaker Label Format

| Role | Label |
|------|-------|
| Moderator | `[M]:` or `[MOD]:` |
| Participants | `[P1]:`, `[P2]:`, etc. |
| Respondent (IDI) | `[R]:` |

## Quick Formatting Reference

| Element | Format |
|---------|--------|
| Speaker labels | **Bold**, followed by colon |
| Timestamps | `[00:15:30]` preserved as-is |
| Non-verbal | `[laughs]`, `[pause]` preserved |
| Body text | Original verbatim content preserved |

## Avoid

| Pattern | Problem |
|---------|---------|
| Inconsistent speaker labels | Confusion in analysis |
| Missing timestamps | Can't locate quotes in audio |
| Cleaning filler words | Loses authenticity of verbatim |
| Translating Chinese inline | Harder to verify original |

## Related Rules

- See [quality-speaker-mapping](quality-speaker-mapping.md) for ID replacement
- See [core-bilingual-handling](core-bilingual-handling.md) for EN/CN processing
