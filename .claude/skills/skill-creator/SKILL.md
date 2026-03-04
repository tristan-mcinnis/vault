---
name: skill-creator
description: Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations.
license: Complete terms in LICENSE.txt
---

# Skill Creator

Skills are modular packages that extend Claude's capabilities with specialized knowledge, workflows, and tools. They transform Claude from a general-purpose agent into a domain specialist.

## Core Principles

### Concise is Key

The context window is shared. Only add what Claude doesn't already have. Challenge each piece: "Does this justify its token cost?"

Prefer concise examples over verbose explanations.

### Router Pattern (Primary Approach)

For methodology-heavy skills, use SKILL.md as a **lean router** (~80 lines) pointing to **atomic rules**:

```
skill-name/
├── SKILL.md              # Router: index + workflow + context
├── rules/                # Atomic rule files (one concept each)
│   ├── frame-*.md        # Output frameworks
│   ├── quality-*.md      # Validation criteria
│   └── core-*.md         # Analytical patterns
├── references/           # Domain documentation
├── scripts/              # Executable code
└── assets/               # Output resources
```

**SKILL.md contains:** Workflow overview, rules index table, local context fetching, output format, anti-patterns.

**Rules contain:** Discrete frameworks, quality standards, reusable patterns—each with frontmatter and "Avoid/Do Instead" sections.

See [references/rules-patterns.md](references/rules-patterns.md) for detailed guidance on rule structure and extraction.

### Degrees of Freedom

Match specificity to task fragility:

| Freedom | When | Example |
|---------|------|---------|
| High | Multiple valid approaches | Text instructions, heuristics |
| Medium | Preferred pattern exists | Pseudocode, parameterized scripts |
| Low | Fragile/critical operations | Specific scripts, exact sequences |

## Anatomy of a Skill

### SKILL.md (required)

```yaml
---
name: skill-name
description: What it does AND when to use it. Include triggers.
---
```

**Frontmatter fields:**
- `name`: Skill identifier (hyphen-case)
- `description`: Primary trigger mechanism—must include both purpose AND usage scenarios

**Body:** Instructions for using the skill. Only loaded after skill triggers.

### rules/ (for methodology-heavy skills)

Atomic rule files with extended frontmatter:

```yaml
---
name: rule-name
category: frame | quality | core
impact: high | medium | low
tags: [analysis, insights]
description: One-line description
---
```

One concept per file. Include "Avoid" and "Do Instead" tables.

### references/ (domain documentation)

Documentation loaded as needed: schemas, API docs, company-specific knowledge.

- For files >100 lines, include table of contents
- Keep one level deep from SKILL.md

### scripts/ (executable code)

Deterministic operations, repeatedly-needed utilities.

- Token efficient (can execute without loading into context)
- Test scripts before finalizing

### assets/ (output resources)

Files used in output, not loaded into context: templates, images, fonts.

## Skill Creation Process

### Step 1: Understand with Examples

Gather concrete usage examples. Ask:
- "What should trigger this skill?"
- "Can you give examples of how it would be used?"

### Step 2: Plan Contents

For each example, identify:
- **Rules:** What frameworks or quality standards apply?
- **References:** What domain knowledge is needed?
- **Scripts:** What code gets rewritten repeatedly?
- **Assets:** What templates or files are used in output?

### Step 3: Initialize

```bash
scripts/init_skill.py <skill-name> --path <output-directory>
```

Creates skill directory with SKILL.md template, example rules/, references/, scripts/, and assets/.

### Step 4: Implement

1. **Start with rules/** - Extract methodology into atomic rule files
2. **Add references/** - Domain documentation as needed
3. **Add scripts/** - Test executable code
4. **Write SKILL.md** - Router with rules index, workflow, context fetching

#### SKILL.md Router Template

```markdown
# Skill Name

Brief overview (1-2 sentences).

## Rules Index

| Rule | Impact | Description |
|------|--------|-------------|
| [frame-example](rules/frame-example.md) | high | Framework description |
| [quality-example](rules/quality-example.md) | medium | Standard description |

## Workflow

1. Gather context
2. Load relevant rules based on task
3. Execute with quality checks

## Local Context Fetching

[How to gather project-specific context]

## Output Format

[Output specifications]

## Anti-Patterns

[Common mistakes]
```

### Step 5: Package

```bash
scripts/package_skill.py <path/to/skill-folder>
```

Validates and creates distributable .skill file.

### Step 6: Iterate

Use the skill on real tasks, notice struggles, update rules or references.

## Design Patterns

- **Multi-step workflows:** See [references/workflows.md](references/workflows.md)
- **Output formats:** See [references/output-patterns.md](references/output-patterns.md)
- **Atomic rules:** See [references/rules-patterns.md](references/rules-patterns.md)

## What NOT to Include

- README.md, CHANGELOG.md, INSTALLATION_GUIDE.md
- User-facing documentation
- Setup and testing procedures
- Auxiliary context about skill creation process
