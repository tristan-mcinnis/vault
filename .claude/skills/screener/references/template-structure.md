# IC Screener Template Structure

All screeners follow a 7-section structure. Each section is required.

## Section 1: Study Overview

Opens with a parameter table summarizing study logistics.

**Table format**: 2 columns (Parameter | Details)

| Parameter | Details                                 |
| --------- | --------------------------------------- |
| City      | [Location]                              |
| Format    | [Duration] [format], [in-person/online] |
| Groups    | [Total groups] across [# cohorts]       |
| Target    | [Target description]                    |
| Fieldwork | [Date range]                            |

## Section 2: Cohort Structure

Define cohorts and recruitment notes.

### Cohort Definitions Table

| Cohort     | Definition              |
| ---------- | ----------------------- |
| [Cohort A] | [Definition / criteria] |
| [Cohort B] | [Definition / criteria] |
| [Cohort C] | [Definition / criteria] |

### Recruitment Notes

Bullet list of special instructions, exclusions, or reminders for recruiters.

- [Note 1]
- [Note 2]
- [Note 3]

## Section 3: Screener Questions

Questions use the **Option / Code / Action** table format with bilingual text.

### Question Format Template

```
Q#. [Topic] [中文标题]

Question: [Question text] [中文问题]

| Option | Code | Action |
|--------|------|--------|
| [Option 1] [中文] | 1 | Continue |
| [Option 2] [中文] | 2 | Terminate |
| [Option 3] [中文] | 3 | Continue → [Cohort A] |
```

### Standard Actions

- **Continue**: Proceed to next question
- **Terminate**: End screening, respondent disqualified
- **Continue → [Cohort]**: Proceed and assign to cohort
- **Must select**: Required for qualification (multi-select)
- **Record**: Capture for analysis but not qualifying
- **Thank and Close**: End screening politely (Invitation section)

### Notation

- **(MA)** after title for multi-answer questions
- **Quota:** note below table for quota tracking
- **Requirement:** note below table for special conditions

## Section 4: Quality Check

Talkability assessment during screening call.

### Talkability Assessment Table

| Criteria           | Pass                               | Fail                        |
| ------------------ | ---------------------------------- | --------------------------- |
| Articulation       | Speaks clearly, complete sentences | One-word answers, mumbles   |
| Descriptiveness    | Can describe in detail             | Cannot elaborate            |
| Engagement         | Shows interest, asks questions     | Distracted, disengaged      |
| Opinion Expression | Shares opinions with reasoning     | No opinions, "I don't know" |

### Test Question

Include one open-ended question to assess articulation.

**Test Question:** "[Insert open-ended question]"

- **Pass:** Vivid, detailed response with context
- **Fail:** Vague, minimal response → **Terminate**

## Section 5: Invitation

Script for inviting qualified respondents.

**Script:** "You are invited to participate in a [duration] [format] on [DATE] at [TIME]. Are you interested?"

| Option | Code | Action          |
| ------ | ---- | --------------- |
| Yes 是 | 1    | Continue        |
| No 否  | 2    | Thank and Close |

### Pre-Interview Confirmation

Contact the respondent the day before to confirm time and location.

## Section 6: Quick Reference

Summary tables for recruiters.

### Termination Criteria

| Question      | Terminate If                 |
| ------------- | ---------------------------- |
| Q1            | [Condition]                  |
| Q2            | [Condition]                  |
| Q3            | [Condition]                  |
| Quality Check | Fails talkability assessment |

### Cohort Assignment

| Condition     | Assign To  |
| ------------- | ---------- |
| [Condition 1] | [Cohort A] |
| [Condition 2] | [Cohort B] |
| [Condition 3] | [Cohort C] |

### Mix Requirements

| Dimension   | Requirement   |
| ----------- | ------------- |
| Gender      | [Requirement] |
| [Dimension] | [Requirement] |

## Section 7: Recruitment Quota

Tracking table for recruiters.

| Group | Cohort     | Target  | Recruited |
| ----- | ---------- | ------- | --------- |
|       | **TOTAL**  | **[#]** |           |
| G1    | [Cohort A] | [#]     |           |
| G2    | [Cohort B] | [#]     |           |
| G3    | [Cohort C] | [#]     |           |

**Notes:**

- [Note 1]
- [Note 2]

**Footer:** -- End of Screener --

## Pre-Deployment Checklist

### Criteria Coverage

- [ ] Every recruitment criterion maps to 1+ screening questions
- [ ] Attitudinal criteria have multi-layered screening
- [ ] Quota variables are explicitly tracked

### Format Consistency

- [ ] All questions use Option / Code / Action table format
- [ ] Bilingual text on all options
- [ ] (MA) notation on multi-answer questions
- [ ] Quota/Requirement notes where needed

### Quick Reference Complete

- [ ] Termination Criteria table filled
- [ ] Cohort Assignment table filled
- [ ] Mix Requirements table filled
- [ ] Recruitment Quota table ready

### Test Scenarios

Run 3 fictional respondents through screener:

1. Perfect qualifier (Continue all the way)
2. Early terminate (hit hard filter by Q5)
3. Edge case (0 purchases, borderline answers)
