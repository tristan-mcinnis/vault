# Root Cause Analysis Reference

Identify fundamental underlying causes of problems rather than treating surface symptoms.

## Symptom vs. Root Cause

| Symptom | Proximate Cause | Root Cause |
|---------|-----------------|------------|
| Customer complaints | Shipping delays | Compensation below market prevents hiring |
| Defect rate increased | Assembly errors | Wage freeze caused experienced worker attrition |
| Projects miss deadlines | Scope creep | No portfolio prioritization; over-commitment |

## The Five Whys Method

**Why #1:** Immediate surface cause
**Why #2:** Reason for first cause
**Why #3:** Deeper systemic factor
**Why #4:** Organizational or structural issue
**Why #5:** Root cause (often cultural, incentive, or design)

**Stop when:**
- Further "why" brings no new insight
- You've reached something controllable/actionable
- The answer is "that's how we designed it"

## Root Cause Types

| Type | Definition | Examples |
|------|------------|----------|
| **Systemic** | How system is designed | Process flaws, misaligned incentives, bottlenecks |
| **Cultural** | Organizational norms | Blame culture, short-term thinking, risk avoidance |
| **Capability** | Skills and resources | Knowledge gaps, tool limitations, training deficiencies |
| **Decision** | Past choices creating problems | Technical debt, deferred maintenance, strategic misalignment |

## Causal Chain Structure

```
Symptom → Proximate Cause → Intermediate Cause → Root Cause
```

Example:
- Symptom: Customers complaining about delays
- Proximate: Shipping takes too long
- Intermediate: Warehouse understaffed
- Root: Compensation below market prevents hiring

## Common Root Cause Traps

**Stopping at First Level**
- "Sales are down because we lost a major client"
- Ask: Why did we lose them? Why were we vulnerable?

**Blaming People Not Systems**
- "Employee made a mistake"
- Ask: Why was mistake possible? What system allowed it?

**Accepting Vague Causes**
- "Poor communication"
- Ask: What specifically? Between whom? Why?

**Missing Multiple Root Causes**
- Problems often have several contributing roots
- Identify all major roots, rank by impact and addressability

## Quality Benchmarks

**Weak Root Cause (avoid)**:
- "Website traffic is down because fewer people are visiting"
  - Circular reasoning, restates symptom as cause

**Strong Root Cause (aim for)**:
- "Traffic down because site speed degraded to 8 seconds; users abandon before page loads due to script bloat and unoptimized images"
  - Specific technical cause, mechanism explained, actionable

**Weak Root Cause (avoid)**:
- "Customer complaints increased because customer service is overwhelmed"
  - Proximate cause, not root; doesn't explain why

**Strong Root Cause (aim for)**:
- "Complaints increased because product complexity grew 40% while documentation unchanged; users can't self-serve, overwhelm support"
  - Traces chain, identifies systemic cause, points to real solution

## Root Cause Test

Ask: "If we fix this, would the problem recur?"
- Yes → Keep digging, not at root yet
- No → Likely at root cause

## Output Structure

```markdown
## Root Cause Analysis: [Problem Name]

**Date**: [Today]
**Problem Owner**: [Who]

---

## The Problem

[One sentence describing the observable problem or symptom]

---

## Symptoms

- [15-word symptom description]
- [15-word symptom description]
- [15-word symptom description]

---

## Five Whys Analysis

### Symptom: [Primary symptom]

**Why #1:** [Answer]
**Why #2:** [Answer]
**Why #3:** [Answer]
**Why #4:** [Answer]
**Why #5:** [Answer - Root Cause]

---

## Root Causes Identified

### Systemic Causes
- [Root cause related to system design]

### Cultural Causes
- [Root cause related to organizational norms]

### Capability Causes
- [Root cause related to skills/resources]

### Decision Causes
- [Root cause related to past choices]

---

## Causal Chains

**Chain 1: [Name]**
```
[Root] → [Intermediate] → [Intermediate] → [Proximate] → [Symptom]
```

---

## Recommendations

| Root Cause | Recommended Action | Impact |
|------------|-------------------|--------|
| [Cause 1] | [Action] | High/Med/Low |
| [Cause 2] | [Action] | High/Med/Low |
```
