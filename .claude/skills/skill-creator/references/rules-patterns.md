# Rules Patterns

Use the atomic rules pattern for methodology-heavy skills where SKILL.md would otherwise exceed ~100 lines of procedural content.

## When to Use Rules

**Use `rules/` for:**
- Frameworks and mental models (L1/L2/L3 levels, DO/DON'T/BECAUSE)
- Quality standards and validation criteria
- Reusable analytical patterns
- Any methodology that can be decomposed into discrete concepts

**Use `references/` for:**
- Domain-specific documentation (schemas, API docs)
- Client or company-specific knowledge
- Large reference material (>100 lines)

**Keep in SKILL.md:**
- Workflow overview and decision trees
- Local context fetching instructions
- Output format specifications
- Anti-patterns and gotchas
- Rules index table

## Rule File Structure

Each rule file follows this template:

```markdown
---
name: rule-name
category: frame | quality | core
impact: high | medium | low
tags: [tag1, tag2]
description: One-line description of what this rule covers
---

# Rule Title

Brief intro explaining the rule's purpose (1-2 sentences).

## [Main Content]

Tables, frameworks, or structured content as appropriate.

## Avoid

| Pattern | Problem |
|---------|---------|
| Bad approach | Why it fails |
| Another bad approach | Why it fails |

## Do Instead

| Pattern | Why It Works |
|---------|--------------|
| Good approach | Why it succeeds |
| Another good approach | Why it succeeds |

## Related Rules

- See [other-rule.md](other-rule.md) for connection
```

## Category Prefixes

Organize rules with consistent prefixes:

| Prefix | Purpose | Examples |
|--------|---------|----------|
| `frame-` | Output frameworks, structures | `frame-insight-levels.md`, `frame-priority-matrix.md` |
| `quality-` | Validation criteria, standards | `quality-evidence-hierarchy.md`, `quality-quote-standards.md` |
| `core-` | Core analytical patterns | `core-tension-mapping.md`, `core-segmentation.md` |

## Impact Taxonomy

Tag rules by how critical they are to skill execution:

| Level | When to Use | Example |
|-------|-------------|---------|
| `high` | Core to the skill's value; skip this and output quality drops significantly | Insight level framework for analysis skill |
| `medium` | Important but not essential; improves quality when applied | Quote attribution standards |
| `low` | Nice-to-have; edge cases or polish | Formatting preferences |

## SKILL.md as Router

When using rules, SKILL.md becomes a lean index (~80 lines):

```markdown
# Skill Name

Brief overview of what the skill does.

## Rules Index

| Rule | Impact | Description |
|------|--------|-------------|
| [frame-insight-levels](rules/frame-insight-levels.md) | high | L1/L2/L3 insight depth framework |
| [quality-evidence](rules/quality-evidence.md) | high | Evidence hierarchy for claims |
| [core-tension-mapping](rules/core-tension-mapping.md) | medium | Force A vs Force B patterns |

## Workflow

1. Step one
2. Step two (load relevant rules as needed)
3. Step three

## Local Context Fetching

[Instructions for gathering project-specific context]

## Output Format

[Output specifications]

## Anti-Patterns

[Common mistakes to avoid]
```

## Extracting Rules from Existing Skills

When refactoring a monolithic SKILL.md:

1. **Audit** - List all distinct concepts, frameworks, and patterns
2. **Group** - Assign category prefixes (frame-, quality-, core-)
3. **Extract** - Move each concept to its own rule file with proper frontmatter
4. **Index** - Create rules table in SKILL.md with impact levels
5. **Prune** - Remove extracted content from SKILL.md, keep workflow and context

**Keep in SKILL.md:** Workflow diagrams, decision trees, local context instructions, output format, anti-patterns.

**Move to rules/:** Frameworks, quality criteria, reusable patterns, methodology details.
