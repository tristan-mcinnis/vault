#!/usr/bin/env python3
"""
Skill Initializer - Creates a new skill from template

Usage:
    init_skill.py <skill-name> --path <path>

Examples:
    init_skill.py my-new-skill --path skills/public
    init_skill.py my-api-helper --path skills/private
    init_skill.py custom-skill --path /custom/location
"""

import sys
from pathlib import Path


SKILL_TEMPLATE = """---
name: {skill_name}
description: [TODO: What the skill does AND when to use it. Include specific triggers - scenarios, file types, or tasks.]
---

# {skill_title}

[TODO: 1-2 sentences explaining what this skill enables]

## Rules Index

| Rule | Impact | Description |
|------|--------|-------------|
| [frame-example](rules/frame-example.md) | high | [TODO: Framework description] |
| [quality-example](rules/quality-example.md) | medium | [TODO: Standard description] |

[TODO: Add rules for each distinct framework, quality standard, or analytical pattern. Delete example rows above.]

## Workflow

[TODO: Describe the typical workflow. Example:

1. Gather context (read project files, understand requirements)
2. Load relevant rules based on task type
3. Execute with quality checks from rules]

## Local Context Fetching

[TODO: How to gather project-specific context before executing. Example:

```bash
# Find relevant files
glob "project/**/*.md"

# Check for existing patterns
grep "pattern" project/
```]

## Output Format

[TODO: Specify output structure, format requirements]

## Anti-Patterns

[TODO: Common mistakes to avoid. Example:

| Pattern | Problem |
|---------|---------|
| Skipping context gathering | Misses project-specific requirements |
| Ignoring quality rules | Output doesn't meet standards |]

---

**Delete this guidance section when done:**

This template uses the **Router Pattern** - SKILL.md stays lean (~80 lines) and points to atomic rules.

**Folder purposes:**
- `rules/` - Frameworks, quality standards, patterns (one concept per file)
- `references/` - Domain documentation, schemas, API docs
- `scripts/` - Executable code for deterministic operations
- `assets/` - Templates, images, fonts used in output

**Delete any unneeded folders.**
"""

EXAMPLE_RULE = """---
name: frame-example
category: frame
impact: high
tags: [{skill_name}]
description: Example framework for structuring output
---

# Example Framework

This is a template rule file. Replace with actual framework content.

## Framework

| Level | Description | Example |
|-------|-------------|---------|
| L1 | First level | Basic application |
| L2 | Second level | Intermediate application |
| L3 | Third level | Advanced application |

## Avoid

| Pattern | Problem |
|---------|---------|
| Skipping framework | Output lacks structure |
| Misapplying levels | Confuses the reader |

## Do Instead

| Pattern | Why It Works |
|---------|--------------|
| Apply framework consistently | Creates clear structure |
| Match level to content depth | Appropriate categorization |

## Related Rules

- See quality-example.md for validation criteria
"""

EXAMPLE_QUALITY_RULE = """---
name: quality-example
category: quality
impact: medium
tags: [{skill_name}]
description: Example quality standards for validation
---

# Quality Standards

This is a template quality rule. Replace with actual validation criteria.

## Criteria

| Standard | Requirement |
|----------|-------------|
| Evidence | Claims must have supporting data |
| Specificity | Avoid vague generalizations |
| Actionability | Recommendations must be implementable |

## Avoid

| Pattern | Problem |
|---------|---------|
| Unsupported claims | No credibility |
| Generic advice | Not actionable |

## Do Instead

| Pattern | Why It Works |
|---------|--------------|
| Cite specific evidence | Builds trust |
| Provide concrete steps | Enables action |

## Related Rules

- See frame-example.md for output structure
"""

EXAMPLE_SCRIPT = '''#!/usr/bin/env python3
"""
Example helper script for {skill_name}

This is a placeholder script that can be executed directly.
Replace with actual implementation or delete if not needed.

Example real scripts from other skills:
- pdf/scripts/fill_fillable_fields.py - Fills PDF form fields
- pdf/scripts/convert_pdf_to_images.py - Converts PDF pages to images
"""

def main():
    print("This is an example script for {skill_name}")
    # TODO: Add actual script logic here
    # This could be data processing, file conversion, API calls, etc.

if __name__ == "__main__":
    main()
'''

EXAMPLE_REFERENCE = """# Reference Documentation for {skill_title}

This is a placeholder for detailed reference documentation.
Replace with actual reference content or delete if not needed.

Example real reference docs from other skills:
- product-management/references/communication.md - Comprehensive guide for status updates
- product-management/references/context_building.md - Deep-dive on gathering context
- bigquery/references/ - API references and query examples

## When Reference Docs Are Useful

Reference docs are ideal for:
- Comprehensive API documentation
- Detailed workflow guides
- Complex multi-step processes
- Information too lengthy for main SKILL.md
- Content that's only needed for specific use cases

## Structure Suggestions

### API Reference Example
- Overview
- Authentication
- Endpoints with examples
- Error codes
- Rate limits

### Workflow Guide Example
- Prerequisites
- Step-by-step instructions
- Common patterns
- Troubleshooting
- Best practices
"""

EXAMPLE_ASSET = """# Example Asset File

This placeholder represents where asset files would be stored.
Replace with actual asset files (templates, images, fonts, etc.) or delete if not needed.

Asset files are NOT intended to be loaded into context, but rather used within
the output Claude produces.

Example asset files from other skills:
- Brand guidelines: logo.png, slides_template.pptx
- Frontend builder: hello-world/ directory with HTML/React boilerplate
- Typography: custom-font.ttf, font-family.woff2
- Data: sample_data.csv, test_dataset.json

## Common Asset Types

- Templates: .pptx, .docx, boilerplate directories
- Images: .png, .jpg, .svg, .gif
- Fonts: .ttf, .otf, .woff, .woff2
- Boilerplate code: Project directories, starter files
- Icons: .ico, .svg
- Data files: .csv, .json, .xml, .yaml

Note: This is a text placeholder. Actual assets can be any file type.
"""


def title_case_skill_name(skill_name):
    """Convert hyphenated skill name to Title Case for display."""
    return ' '.join(word.capitalize() for word in skill_name.split('-'))


def init_skill(skill_name, path):
    """
    Initialize a new skill directory with template SKILL.md.

    Args:
        skill_name: Name of the skill
        path: Path where the skill directory should be created

    Returns:
        Path to created skill directory, or None if error
    """
    # Determine skill directory path
    skill_dir = Path(path).resolve() / skill_name

    # Check if directory already exists
    if skill_dir.exists():
        print(f"❌ Error: Skill directory already exists: {skill_dir}")
        return None

    # Create skill directory
    try:
        skill_dir.mkdir(parents=True, exist_ok=False)
        print(f"✅ Created skill directory: {skill_dir}")
    except Exception as e:
        print(f"❌ Error creating directory: {e}")
        return None

    # Create SKILL.md from template
    skill_title = title_case_skill_name(skill_name)
    skill_content = SKILL_TEMPLATE.format(
        skill_name=skill_name,
        skill_title=skill_title
    )

    skill_md_path = skill_dir / 'SKILL.md'
    try:
        skill_md_path.write_text(skill_content)
        print("✅ Created SKILL.md")
    except Exception as e:
        print(f"❌ Error creating SKILL.md: {e}")
        return None

    # Create resource directories with example files
    try:
        # Create rules/ directory with example rules (primary for methodology-heavy skills)
        rules_dir = skill_dir / 'rules'
        rules_dir.mkdir(exist_ok=True)
        frame_rule = rules_dir / 'frame-example.md'
        frame_rule.write_text(EXAMPLE_RULE.format(skill_name=skill_name))
        print("✅ Created rules/frame-example.md")
        quality_rule = rules_dir / 'quality-example.md'
        quality_rule.write_text(EXAMPLE_QUALITY_RULE.format(skill_name=skill_name))
        print("✅ Created rules/quality-example.md")

        # Create scripts/ directory with example script
        scripts_dir = skill_dir / 'scripts'
        scripts_dir.mkdir(exist_ok=True)
        example_script = scripts_dir / 'example.py'
        example_script.write_text(EXAMPLE_SCRIPT.format(skill_name=skill_name))
        example_script.chmod(0o755)
        print("✅ Created scripts/example.py")

        # Create references/ directory with example reference doc
        references_dir = skill_dir / 'references'
        references_dir.mkdir(exist_ok=True)
        example_reference = references_dir / 'api_reference.md'
        example_reference.write_text(EXAMPLE_REFERENCE.format(skill_title=skill_title))
        print("✅ Created references/api_reference.md")

        # Create assets/ directory with example asset placeholder
        assets_dir = skill_dir / 'assets'
        assets_dir.mkdir(exist_ok=True)
        example_asset = assets_dir / 'example_asset.txt'
        example_asset.write_text(EXAMPLE_ASSET)
        print("✅ Created assets/example_asset.txt")
    except Exception as e:
        print(f"❌ Error creating resource directories: {e}")
        return None

    # Print next steps
    print(f"\n✅ Skill '{skill_name}' initialized successfully at {skill_dir}")
    print("\nNext steps:")
    print("1. Extract methodology into rules/ (one concept per file)")
    print("2. Update SKILL.md as router (rules index, workflow, context)")
    print("3. Add references/, scripts/, assets/ as needed")
    print("4. Delete unused example files and folders")
    print("5. Run package_skill.py to validate and package")

    return skill_dir


def main():
    if len(sys.argv) < 4 or sys.argv[2] != '--path':
        print("Usage: init_skill.py <skill-name> --path <path>")
        print("\nSkill name requirements:")
        print("  - Hyphen-case identifier (e.g., 'data-analyzer')")
        print("  - Lowercase letters, digits, and hyphens only")
        print("  - Max 40 characters")
        print("  - Must match directory name exactly")
        print("\nExamples:")
        print("  init_skill.py my-new-skill --path skills/public")
        print("  init_skill.py my-api-helper --path skills/private")
        print("  init_skill.py custom-skill --path /custom/location")
        sys.exit(1)

    skill_name = sys.argv[1]
    path = sys.argv[3]

    print(f"🚀 Initializing skill: {skill_name}")
    print(f"   Location: {path}")
    print()

    result = init_skill(skill_name, path)

    if result:
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
