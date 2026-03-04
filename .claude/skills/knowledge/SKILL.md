---
name: Knowledge Base Search
description: Search Tristan's personal knowledge base of concepts, books, and articles. Use when asked to "check my knowledge", "what do my notes say about X", "search concepts for Y", or when the user explicitly wants to draw on their accumulated frameworks and readings rather than general AI knowledge.
---

# Knowledge Base Search

Search the personal knowledge base for relevant frameworks, concepts, and references.

## Knowledge Domains

| Domain | Content | Path |
|--------|---------|------|
| **concepts** | Frameworks, terminology, methodologies (~460 entries) | `references/concepts/` |
| **books** | Book notes and key takeaways (~110 entries) | `references/books/` |
| **articles** | Saved articles and commentary (~220 entries) | `references/articles/` |

## Usage Triggers

Use this skill when user says:
- "Check my concepts for..."
- "What do my notes say about..."
- "Search my knowledge base for..."
- "Do I have anything on [topic]?"
- "What frameworks do I have for..."

Do NOT use for general questions where user wants your training knowledge.

## Workflow

### Step 1: Identify Search Terms

Extract key concepts from user's query. Consider:
- Direct terms mentioned
- Related/adjacent concepts
- Methodological frameworks that might apply

### Step 2: Search Knowledge Base

```bash
# Search all domains
grep -r -i -l "search_term" .claude/skills/knowledge/references/

# Search specific domain
grep -r -i -l "search_term" .claude/skills/knowledge/references/concepts/

# Search with context
grep -r -i -C 3 "search_term" .claude/skills/knowledge/references/concepts/
```

### Step 3: Read and Synthesize

Read the most relevant files found. Synthesize findings into a response that:
- Cites specific concepts/frameworks from the knowledge base
- Notes which domain(s) the information came from
- Identifies gaps if the knowledge base doesn't cover the query

### Step 4: Offer to Go Deeper

If relevant content found:
> I found [X] related entries. Want me to read any of these in full?
> - [file1.md] - brief description
> - [file2.md] - brief description

## Example Session

**User**: /knowledge storytelling frameworks

**Claude**:
*[Searches references/concepts/ and references/books/ for storytelling]*

Found 3 relevant entries in your knowledge base:

**From concepts:**
- `narrative-transportation.md` - How stories create immersion and persuasion
- `hero-journey-framework.md` - Campbell's monomyth structure

**From books:**
- `robert-mckee-story.md` - Story structure principles for compelling narratives

Want me to read any of these in detail?

## Tips

- Concepts tend to be atomic ideas and frameworks
- Books contain synthesis of entire works with key takeaways
- Articles are more topical/timely, often with Tristan's annotations
- Use multiple search terms if first search yields few results
- Some concepts have Chinese names or mixed language content
