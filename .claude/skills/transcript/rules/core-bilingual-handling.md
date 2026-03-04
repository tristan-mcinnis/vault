---
name: core-bilingual-handling
category: core
impact: medium
tags: [transcript, bilingual, chinese, translation]
description: Processing EN/CN bilingual transcript content
---

# Bilingual Processing

Handle mixed English/Chinese transcripts while preserving original content.

## Core Principles

| Principle | Implementation |
|-----------|----------------|
| Detect language | Tag each utterance with `original_language` |
| Preserve original | Never overwrite source text |
| Add translations | Inline or in separate field |
| Maintain attribution | Speaker links preserved through translations |

## Language Detection

```json
{
  "text": "Good morning everyone...",
  "text_cn": null,
  "original_language": "en"
}
```

```json
{
  "text": null,
  "text_cn": "大家早上好...",
  "original_language": "cn"
}
```

## Translation Approaches

| Approach | When to Use |
|----------|-------------|
| Inline pinyin | Short phrases: `好的 (hǎo de)` |
| Parallel fields | Full utterances: `text` + `text_cn` |
| Footnotes | Key terms needing cultural context |

## Chinese Text Standards

| Element | Standard |
|---------|----------|
| Character set | Simplified Chinese |
| Romanization | Pinyin in brackets |
| Proper nouns | Keep original + transliteration |

## Avoid

| Pattern | Problem |
|---------|---------|
| Overwriting original with translation | Loses verbatim authenticity |
| Mixing traditional/simplified | Inconsistent output |
| Translating without marking | Can't verify accuracy |

## Related Rules

- See [quality-formatting-conventions](quality-formatting-conventions.md) for Chinese text formatting
