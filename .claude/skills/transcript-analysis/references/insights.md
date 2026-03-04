# Insights Extraction Reference

Extract structured insights from qualitative research transcripts using the 15-word bullet format.

## Insight Types

1. **Behavioral insights** - What people do
2. **Attitudinal insights** - How they feel/think
3. **Unmet needs** - Gaps and frustrations
4. **Category perceptions** - Mental models
5. **Decision drivers** - What influences choices

## Extraction Process

1. **Read completely** - Absorb full transcript before extracting
2. **Identify insight candidates** - Quotes, behaviors, contradictions, patterns
3. **Classify by type** - Use categories above
4. **Write 15-word bullets** - Each insight must:
   - Be exactly 15 words (+/-2 acceptable)
   - Capture one specific observation
   - Be grounded in evidence from transcript
   - Avoid generic statements

## 15-Word Bullet Pattern

```
[Subject] [verb] [specific behavior/attitude] [context] [implication/consequence]
```

## Quality Benchmarks

**Weak (avoid)**:
- "Consumers want products that are good quality and worth the money" (generic)
- "People like convenience" (too obvious)
- "Participants mentioned price several times" (observation, not insight)

**Strong (aim for)**:
- "Shoppers mentally calculate cost-per-use for premium items, justifying higher prices through extended durability expectations"
- "Morning routines create 'sacred time' windows where brand switching feels emotionally disruptive, not just inconvenient"
- "Parents describe 'permission purchases' - treats that feel indulgent but defensible through functional benefits"

## Insight Density Guidelines

| Transcript Length | Expected Insights |
|------------------|-------------------|
| 30-minute interview | 8-15 insights |
| 60-minute interview | 15-25 insights |
| 90-minute focus group | 20-35 insights |

Quality over quantity - fewer strong insights beats many weak ones.

## Output Structure

```markdown
## Insights: [Transcript Name]

**Source**: [[Path/to/transcript]]
**Date Analyzed**: [Today's date]
**Project**: [[Project link if applicable]]

---

### [Theme 1]

1. [15-word insight bullet]
2. [15-word insight bullet]
3. [15-word insight bullet]

**Supporting Evidence**:
> "Verbatim quote from transcript" - Participant

---

### [Theme 2]

1. [15-word insight bullet]
2. [15-word insight bullet]

**Supporting Evidence**:
> "Quote" - Participant

---

## Summary

[2-3 sentence synthesis of key findings]

### Implications

- [Strategic implication 1]
- [Strategic implication 2]
```

## Save Location

Default: `Databases/Artifacts/INSIGHTS-[ProjectName]-[Source]-[Date].md`
