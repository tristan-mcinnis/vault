# Question Design Standards

## Critical Rules

### Hard Filters First (Q1-Q5)

Place terminating criteria early to avoid wasting recruiter time:

1. Gender (quota)
2. Age (cohort assignment)
3. Industry exclusion
4. Research participation recency
5. Category/brand exclusions

### Single-Barreled Questions

Ask one thing at a time.

| Bad                                     | Good                                       |
| --------------------------------------- | ------------------------------------------ |
| How often do you buy and wear sneakers? | Q1: Purchase frequency, Q2: Wear frequency |
| Do you like the brand and use it?       | Q1: Brand attitude, Q2: Usage behavior     |

### Specific Timeframes

Never use "recently", "often", "sometimes".

| Bad                                   | Good                                                    |
| ------------------------------------- | ------------------------------------------------------- |
| Have you purchased sneakers recently? | Have you purchased sneakers in the past 3 months?       |
| Do you often go to the gym?           | How many times did you go to the gym in the past month? |

### Multi-Layer Attitudinal Screening

Attitudinal criteria require 2-3 questions to validate:

1. **Awareness**: How familiar are you with brand X? (scale)
2. **Understanding**: What does brand X stand for? (open-ended)
3. **Resonance**: How much does brand X's spirit resonate with you? (scale)

Never assume awareness = resonance.

### Conditional Routing

Verify prior state before asking about change.

**Bad**: Q16 asks about purchases (including 0), Q17 asks "Why did you purchase fewer?"
**Good**: Q17 only appears IF Q16 >= 1

## Question Formats

### Standard Question Format

```
Q#. [Topic] [中文标题]

Question: [Question text] [中文问题]

| Option | Code | Action |
|--------|------|--------|
| [Option 1] [中文] | 1 | Continue |
| [Option 2] [中文] | 2 | Terminate |
```

### Multi-Answer Questions

Mark with **(MA)** after title:

```
Q5. Category Participation 品类参与 (MA)
```

### Notes Below Tables

- **Quota**: `Quota: [Specify quota]`
- **Requirement**: `Requirement: Must select Code 1`

## Standard Questions Library

### Q1. Gender 性别

| Option      | Code | Action   |
| ----------- | ---- | -------- |
| Female 女性 | 1    | Continue |
| Male 男性   | 2    | Continue |

Quota: [Specify gender quota]

### Q2. Age 年龄

Question: How old are you? 请问您今年多大了？

| Option            | Code | Action                |
| ----------------- | ---- | --------------------- |
| Under 18 18岁以下 | 1    | Terminate             |
| 18-24 18-24岁     | 2    | Continue → [Cohort A] |
| 25-34 25-34岁     | 3    | Continue → [Cohort B] |
| 35-44 35-44岁     | 4    | Continue → [Cohort C] |
| 45+ 45岁以上      | 5    | Terminate             |

### Q3. Industry Exclusion 行业排除 (MA)

Question: Do you or your family members work in the following industries? 请问您或您的家人是否在以下行业工作？

| Option                         | Code | Action    |
| ------------------------------ | ---- | --------- |
| Market research 市场调研       | 1    | Terminate |
| Advertising / PR 广告/公关     | 2    | Terminate |
| [Category industry] [品类行业] | 3    | Terminate |
| None of the above 以上均无     | 4    | Continue  |

### Q4. Research Participation 调研参与

Question: When did you last participate in a market research study? 您上次参加市场调研是什么时候？

| Option                               | Code | Action    |
| ------------------------------------ | ---- | --------- |
| Within past 3 months 过去3个月内     | 1    | Terminate |
| 3-6 months ago 3-6个月前             | 2    | Terminate |
| 6-12 months ago 6-12个月前           | 3    | Continue  |
| More than 12 months ago 超过12个月前 | 4    | Continue  |
| Never participated 从未参加过        | 5    | Continue  |

### Q5. Category Participation 品类参与 (MA)

Question: Which of the following have you purchased in the past 12 months? 过去12个月内，您购买过以下哪些产品？

| Option                       | Code | Action      |
| ---------------------------- | ---- | ----------- |
| [Target item] [目标产品]     | 1    | Must select |
| [Related item] [相关产品]    | 2    | Record      |
| [Related item] [相关产品]    | 3    | Record      |
| None of the above 以上均没有 | 4    | Terminate   |

Requirement: Must select Code 1

## Methodology Guidelines

| Methodology              | Questions | Completion Time | Over-Recruit |
| ------------------------ | --------- | --------------- | ------------ |
| Focus Group (FGD)        | 30-45     | 18-22 min       | 30-40%       |
| In-Depth Interview (IDI) | 15-25     | 10-15 min       | 20-40%       |
| Ethnography              | 15-20     | 10-12 min       | 25-50%       |
| Online Community         | 12-20     | 8-12 min        | 50%          |
| Expert / B2B             | 10-18     | 8-12 min        | 20-25%       |

## China Market Localization

### Bilingual Format

All questions use English / Chinese side-by-side.

### Localized Retailers

- Tmall / 天猫
- JD.com / 京东
- Dewu / 得物
- Douyin Shopping / 抖音商城
- Xiaohongshu Shopping / 小红书商城
- WeChat Mini Programs / 微信小程序

### Income Thresholds (Monthly RMB)

- Less than ¥5,000 / 少于5,000元
- ¥5,000-¥9,999 / 5,000-9,999元
- ¥10,000-¥19,999 / 10,000-19,999元
- ¥20,000-¥29,999 / 20,000-29,999元
- ¥30,000-¥49,999 / 30,000-49,999元
- ¥50,000+ / 50,000元及以上
- Prefer not to answer / 不方便透露

### City Tier Classification

- **Tier 1**: Beijing, Shanghai, Guangzhou, Shenzhen
- **Tier 2**: Chengdu, Hangzhou, Wuhan, Chongqing, Nanjing, Xi'an
- **Tier 3+**: Other cities

### Contact Collection

Collect WeChat ID as primary contact (more reliable than email in China).

## Anti-Patterns to Avoid

| Anti-Pattern                                  | Correct Approach                                                        |
| --------------------------------------------- | ----------------------------------------------------------------------- |
| Late hard filters (industry exclusion at Q25) | Hard filters in Q1-Q5                                                   |
| Missing numeric codes                         | Every option gets a code (1, 2, 3...)                                   |
| Prose-style skip logic ("If no, skip to Q10") | Action column: Terminate, Continue, Continue → [Cohort]                 |
| Missing Quality Check section                 | Always include Talkability Assessment                                   |
| No Quick Reference                            | Always include termination summary, cohort assignment, mix requirements |
| Double-barreled questions                     | Single-barreled (one concept per question)                              |
| Vague timeframes ("recently", "often")        | Specific timeframes ("past 3 months", "past 12 months")                 |
