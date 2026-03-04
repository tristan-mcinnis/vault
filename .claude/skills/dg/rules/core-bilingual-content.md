---
name: core-bilingual-content
category: core
impact: medium
tags: [dg, methodology, localization, china]
description: EN/ZH inline format, encoding, italicization for bilingual guides
---

# Bilingual Content Guidelines

Standards for creating bilingual (English/Chinese) discussion guides.

## Inline Format

For bilingual DGs (EN/ZH), include Chinese translations inline with `\n` separators:

```json
{
  "text": "What's your first reaction?\n看到这个，你的第一反应是什么？"
}
```

The generator preserves newlines and renders both languages in the Word output.

## Application Points

### Questions
```json
{
  "id": "q1",
  "text": "What's your first reaction?\n看到这个，你的第一反应是什么？",
  "probes": [
    "What stands out?\n有什么特别吸引你的？"
  ]
}
```

### Front Matter
```json
{
  "title": "DG: Premium Cookie Innovation",
  "title_zh": "座谈会大纲：高端饼干创新研究"
}
```

### Closing
```json
{
  "closing": {
    "text": "Thank you for your participation today.",
    "text_zh": "感谢您今天的参与。"
  }
}
```

## Encoding Requirements

When creating specs with Chinese characters (especially curly quotes "" or special punctuation), use Python for JSON generation to ensure proper UTF-8 encoding:

```python
import json
spec = { ... }
with open('dg-spec.json', 'w', encoding='utf-8') as f:
    json.dump(spec, f, ensure_ascii=False, indent=2)
```

### Why Python
- Shell heredocs can corrupt Chinese characters
- Manual JSON writing risks encoding issues
- `ensure_ascii=False` preserves characters directly

## Styling Conventions

### Chinese Text Formatting
| Element | English | Chinese |
| ------- | ------- | ------- |
| Quotes | "double quotes" | "中文引号" or 「」 |
| Emphasis | *italics* | **bold** (italics don't render well for CJK) |
| Lists | En-dash (–) | Em-dash (—) or bullet (•) |

### Language Order
- **Primary language first** (usually English for international projects)
- Chinese follows on new line
- Maintain consistent order throughout document

## Translation Principles

### Functional Equivalence
Translate meaning, not words:
- "Walk me through..." → "请跟我说说..."  (not literal "请走我通过...")
- "What comes to mind?" → "你想到什么？" (natural phrasing)

### Register Matching
Match formality level:
- Casual IDI: 你 (informal "you")
- Formal FGD: 您 (formal "you")
- Professional context: Maintain appropriate politeness level

### Probe Adaptation
Some probes need cultural adaptation:
- "If this brand were a celebrity..." → May need local celebrity examples
- Time references → Convert to relevant local context

## Common Pitfalls

| Issue | Solution |
| ----- | -------- |
| Encoding corruption | Use Python with `ensure_ascii=False` |
| Inconsistent quotes | Standardize on one style per document |
| Literal translation | Focus on meaning, adapt idioms |
| Missing Chinese for new additions | Always add both languages when editing |
| Italics for Chinese emphasis | Use bold instead |
