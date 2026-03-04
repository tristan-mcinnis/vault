---
name: core-bilingual-proposals
category: core
impact: medium
tags: [proposal, bilingual, chinese, localization]
description: Formatting standards for Chinese/English bilingual proposals
---

# Bilingual Proposals

Standards for EN/ZH proposal documents.

## Header Format

Section headers use English followed by Chinese on same line:

```markdown
## 01. Context 项目背景

### Background 背景

### Research Objectives 研究目标
```

## Body Text Options

| Approach | When to Use |
|----------|-------------|
| **Single language** | When audience is primarily one language |
| **Side-by-side** | When both audiences need equal access |
| **English primary, Chinese summary** | International teams with local stakeholders |

## Table Headers

Tables should have bilingual column headers:

```markdown
| Phase 阶段 | Activity 活动 | Duration 时长 |
|------------|---------------|---------------|
| Phase 1    | Consumer IDIs | 2 weeks       |
```

## Typography Consistency

- Use consistent font that supports both scripts (Aptos, Calibri, or Noto)
- Maintain same size for both languages
- Chinese text may appear slightly smaller visually — acceptable

## Avoid

| Pattern | Problem |
|---------|---------|
| Mixing traditional and simplified Chinese | Inconsistent, confusing |
| Different fonts for EN vs ZH | Visual inconsistency |
| Machine-translating without review | Terminology errors |
| Literal translations of idioms | Loses meaning |

## Common Bilingual Sections

| English | Chinese |
|---------|---------|
| Executive Summary | 执行摘要 |
| Context | 项目背景 |
| Background | 背景 |
| Research Objectives | 研究目标 |
| Methodology | 研究方法 |
| Sample Design | 样本设计 |
| Timeline | 项目时间表 |
| Investment | 项目费用 |
| Team | 项目团队 |
| Contact | 联系方式 |

## Related Rules

- See [visual-style](../references/visual-style.md) for typography specs
