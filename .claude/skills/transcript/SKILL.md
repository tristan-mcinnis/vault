---
name: transcript
description: Process and render research transcripts with speaker diarization, formatting, and bilingual support. End-to-end workflow from raw transcript to branded Word document. Use when user asks to "format the transcript", "process the interview", "render the transcript", "create a takeaway", or provides a raw transcript file. Supports IDIs, FGDs, and expert interviews with EN/ZH bilingual handling.
---

# Transcript Processing

Process and render research transcripts — from raw input to branded Word document via docx-op.

## Workflow

```
Phase 1: PROCESS — Format transcript with speaker labels, metadata
Phase 2: REVIEW — User validates speaker mapping, formatting
Phase 3: RENDER — Convert to JSON spec → docx-op → branded .docx
```

### Phase 1: Process

1. **Read raw transcript** — file, paste, or local file path
2. **Map speaker labels** — replace SPEAKER_XX IDs with real names
3. **Apply formatting** — bold names, timestamps, annotations
4. **Add metadata header** — project, date, participants, duration
5. **Handle bilingual content** if EN/ZH mixed

### Phase 2: Review

6. **Present formatted transcript** for user review
7. **Validate speaker mapping** — confirm identities are correct
8. **User confirms** formatting is final

### Phase 3: Render

**For transcripts:**
```bash
cat transcript-spec.json | bun run .claude/skills/docx-op/tools/Generate.ts --type transcript output.docx
```

**For takeaways:**
```bash
cat takeaway-spec.json | bun run .claude/skills/docx-op/tools/Generate.ts --type takeaway output.docx
```

**For reformatting existing DOCX transcripts:**
```bash
# 1. Unpack the document
bun run .claude/skills/docx-op/tools/OoxmlManager.ts unpack input.docx ./editing
# 2. Apply formatting (bold speaker labels in XML)
# 3. Repack to DOCX
bun run .claude/skills/docx-op/tools/OoxmlManager.ts pack ./editing output-formatted.docx
```

Save artifacts to project directory.

## Rules

| Rule | Impact | When to Apply |
|------|--------|---------------|
| [frame-vf-standards](rules/frame-vf-standards.md) | HIGH | VF brand projects |
| [quality-formatting-conventions](rules/quality-formatting-conventions.md) | HIGH | All transcripts |
| [quality-speaker-mapping](rules/quality-speaker-mapping.md) | MEDIUM | Replacing SPEAKER_XX IDs |
| [core-bilingual-handling](rules/core-bilingual-handling.md) | MEDIUM | EN/CN transcripts |

## References

| Reference | Purpose |
|-----------|---------|
| [references/formatting-spec.md](references/formatting-spec.md) | Typography, colors, spacing |

### Assets

| File | Purpose |
|------|---------|
| `assets/ic-transcript-template.docx` | Visual reference template |
| `assets/ic-logo.png` | Header logo PNG |

## Local Context Fetching

```
1. Glob knowledge-base/*.md for available knowledge files
2. Read PROJECT.md for project terminology and conventions
3. Read 00-status.md for current project state
```

## JSON Spec Formats

### Transcript Spec

```json
{
  "version": "1.0",
  "document_type": "transcript",
  "metadata": {
    "title": "Expert Interview - Orange King",
    "expert": "Orange King (Kim Eun-su)",
    "date": "2026-01-21",
    "duration": "86 min 34 sec",
    "market": "Korea",
    "project": "Jordan Collectibles",
    "language": "English"
  },
  "paragraphs": [
    { "text": "Welcome to the interview.", "type": "speaker", "speaker": "Moderator" },
    { "text": "Thank you for having me.", "type": "speaker", "speaker": "Orange King" },
    { "text": "[00:01:30]", "type": "timestamp" },
    { "text": "[laughs]", "type": "annotation" }
  ]
}
```

### Takeaway Spec

```json
{
  "version": "1.0",
  "document_type": "takeaway",
  "metadata": {
    "title": "Orange King Interview Takeaway",
    "expert": "Orange King (Kim Eun-su)",
    "role": "Sneaker Columnist (GQ Korea), Sneaker YouTuber",
    "date": "2026-01-21",
    "project": "Jordan Collectibles"
  },
  "sections": [
    { "heading": "Expert Profile", "level": 1 },
    { "heading": "Key Insights", "level": 2, "bullets": ["Point 1", "Point 2"] },
    { "heading": "Strategic Implications", "level": 2, "content": "Narrative text here." }
  ]
}
```

## Output

Save to the appropriate transcripts subdirectory:

```
{project}/transcripts/idi/      # In-depth interviews
{project}/transcripts/fgd/      # Focus group discussions
{project}/transcripts/expert/   # Expert interviews
{project}/transcripts/meeting/  # Meeting transcripts
```

**File naming:**
- IDI: `shanghai-idi-01-20260203.md` + `.docx`
- FGD: `changsha-fgd-g1-20260205.md` + `.docx`
- Expert: `expert-name-20260121.md` + `.docx`

Original transcript is always preserved — create a new formatted artifact.

## Anti-Patterns

| Avoid | Do Instead |
|-------|------------|
| Overwriting original transcript | Create new formatted artifact |
| Missing metadata fields | Complete header with all fields |
| Inconsistent speaker labels | M/P1-P##/R format throughout |
| Product callouts without specifics | Include season/color in callouts |
