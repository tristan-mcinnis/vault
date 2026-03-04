# Codebook Development Reference

Develop and maintain qualitative coding frameworks for systematic analysis.

## Codebook Purpose

A codebook provides:
- **Consistency**: Same data coded the same way across analysts
- **Transparency**: Clear audit trail for how insights were derived
- **Completeness**: Ensures all relevant concepts are captured
- **Communication**: Shared language for discussing findings

## Codebook Structure

### Code Anatomy

Each code should include:

| Element | Description | Example |
|---------|-------------|---------|
| **Code Name** | Short, descriptive label | "Price Sensitivity" |
| **Definition** | Clear explanation of what it captures | "Expressions of concern about cost or value" |
| **Inclusion Criteria** | What counts as this code | "Direct price complaints, comparison shopping mentions" |
| **Exclusion Criteria** | What doesn't count | "Quality concerns without price reference" |
| **Example Quotes** | Representative verbatims | "It's too expensive for what you get" |

### Code Hierarchy

```
Parent Code (Theme Level)
├── Child Code (Category Level)
│   ├── Grandchild Code (Specific Level)
│   └── Grandchild Code
└── Child Code
    └── Grandchild Code
```

## Code Types

| Type | Purpose | Example |
|------|---------|---------|
| **Descriptive** | What is being discussed | "Product Quality", "Customer Service" |
| **Interpretive** | Meaning or significance | "Trust Building", "Risk Mitigation" |
| **Pattern** | Recurring behaviors/attitudes | "Workaround Behavior", "Decision Delay" |
| **In Vivo** | Participant's own language | "Just works", "Game changer" |

## Codebook Development Process

### 1. Initial Coding (Open/Emergent)
- Read through data without predefined codes
- Note recurring concepts, phrases, patterns
- Create provisional codes as they emerge

### 2. Code Consolidation
- Group similar codes together
- Identify redundant codes to merge
- Create hierarchy structure

### 3. Code Refinement
- Write clear definitions
- Add inclusion/exclusion criteria
- Select representative examples

### 4. Testing & Calibration
- Apply codes to subset of data
- Check for inter-coder reliability
- Refine ambiguous definitions

### 5. Full Application
- Code complete dataset
- Track new emergent codes
- Update codebook iteratively

## Quality Guidelines

**Good Codes**:
- Mutually exclusive (data fits one code only)
- Collectively exhaustive (all data can be coded)
- Clear boundaries (easy to apply consistently)
- Grounded in data (not theoretical assumptions)

**Poor Codes**:
- Overlapping definitions
- Too abstract to apply
- Too narrow (rarely used)
- Too broad (everything fits)

## Output Structure

```markdown
## Codebook: [Project Name]

**Date**: [Today]
**Project**: [[Project link]]
**Version**: [1.0]

---

## Code Summary

| Code | Type | Frequency | Description |
|------|------|-----------|-------------|
| [Code 1] | Descriptive | High | [Brief description] |
| [Code 2] | Interpretive | Medium | [Brief description] |

---

## Detailed Codes

### Parent Code: [Theme Name]

#### [Code Name]

**Definition**: [Clear explanation of what this code captures]

**Inclusion Criteria**:
- [What counts as this code]
- [Specific signals to look for]

**Exclusion Criteria**:
- [What doesn't count]
- [Common misapplications]

**Example Quotes**:
- "[Quote 1]" - Participant A
- "[Quote 2]" - Participant B

**Notes**: [Any additional guidance for applying this code]

---

### Parent Code: [Theme Name 2]

#### [Code Name]
...

---

## Code Hierarchy Visualization

```
Quality Perceptions
├── Functional Quality
│   ├── Durability
│   ├── Performance
│   └── Reliability
├── Perceived Quality
│   ├── Brand Reputation
│   └── Price Signal
└── Quality Gaps
    ├── Expectation vs. Reality
    └── Inconsistency
```

---

## Emergent Codes (Uncategorized)

Codes that emerged during analysis but haven't been placed:
- [Code A]: [Brief description]
- [Code B]: [Brief description]

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | [Date] | Initial codebook |
| 1.1 | [Date] | Added [codes], refined [definitions] |
```
