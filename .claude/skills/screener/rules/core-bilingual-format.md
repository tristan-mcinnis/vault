---
name: core-bilingual-format
category: core
impact: medium
tags: [screener, bilingual, json]
description: EN/ZH bilingual format for screener JSON specifications
---

# Bilingual Format

All screener content must be bilingual (English/Chinese) for China market research.

## JSON Structure

Questions and options use nested `en`/`zh` objects:

```json
{
  "question": {
    "en": "What is your gender?",
    "zh": "请问您的性别是？"
  },
  "options": [
    {
      "text": { "en": "Female", "zh": "女性" },
      "code": 1,
      "action": "Continue"
    },
    {
      "text": { "en": "Male", "zh": "男性" },
      "code": 2,
      "action": "Continue"
    }
  ]
}
```

## Topic Headers

Question topics also need bilingual format:

```json
{
  "id": "Q1",
  "topic": "Gender",
  "topic_zh": "性别"
}
```

## Rendered Output

In Word documents, bilingual content appears side-by-side:

```
Q1. Gender 性别

What is your gender? 请问您的性别是？

| Option | Code | Action |
|--------|------|--------|
| Female 女性 | 1 | Continue |
| Male 男性 | 2 | Continue |
```

## Avoid

| Pattern | Problem |
|---------|---------|
| English-only options | Recruiters may not understand |
| Chinese-only options | Client review impossible |
| Separate EN/ZH documents | Version control nightmare |

## Related Rules

- See [core-china-localization](core-china-localization.md) for China-specific content
