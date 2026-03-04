---
name: transcript-analysis
description: Extract insights from individual qualitative research transcripts using specific frameworks — general insights (15-word bullets), jobs-to-be-done, pain points, brand associations, competitive comparisons, consumer behaviors, and journey mapping. Use after fieldwork when analyzing a single interview or focus group transcript. For cross-source analytical pipeline (findings, tensions, insights, implications, recommendations), use /analysis-op instead.
---

# Transcript Analysis Skill

Analyze qualitative research transcripts using specialized frameworks.

## Analysis Types Available

| Type | Purpose | Reference |
|------|---------|-----------|
| **insights** | General insights using 15-word bullet format | [[references/insights]] |
| **jtbd** | Jobs-to-be-done (functional, emotional, social) | [[references/jtbd]] |
| **pain-points** | Pain points, frustrations, barriers | [[references/pain-points]] |
| **brand** | Brand associations and perceptions | [[references/brand]] |
| **compare** | Competitive comparisons | [[references/compare]] |
| **behaviors** | Observable consumer behaviors | [[references/behaviors]] |
| **journey** | Customer journey mapping | [[references/journey]] |

## Workflow

### Step 1: Get Transcript

If no file path provided, prompt:
> Which transcript should I analyze? (Provide path or name)

Read the transcript file and identify:
- Participant/respondent information
- Interview structure and topics covered
- Research context from linked project (if available)

### Step 2: Select Analysis Type(s)

Ask user:
> What type of analysis should I run?
> - **insights** - General insights (15-word bullets)
> - **jtbd** - Jobs-to-be-done
> - **pain-points** - Pain points and frustrations
> - **brand** - Brand associations
> - **compare** - Competitive comparisons
> - **behaviors** - Observable behaviors
> - **journey** - Customer journey mapping
> - **all** - Run multiple analyses

Multiple types can be selected for comprehensive analysis.

### Step 3: Load Reference and Execute

Read the appropriate reference file for the selected analysis type(s) and follow its methodology.

### Step 4: Save Output

Save findings to:
`Databases/Artifacts/[TYPE]-[ProjectName]-[Source]-[Date].md`

Link the artifact to the project page if applicable.

## Example Session

**User**: /transcript-analysis

**Claude**:
> Which transcript should I analyze?

**User**: The Chips Ahoy mini-group from Feb 5

**Claude**:
> Reading transcript from Databases/Meetings/20260205 - Chips Ahoy Shanghai MG1...
>
> This is a 90-minute mini-group with 6 participants discussing cookie preferences.
>
> What type of analysis should I run?
> - insights, jtbd, pain-points, brand, compare, behaviors, journey, or all?

**User**: insights and jtbd

**Claude**: *[Loads insights.md and jtbd.md references, executes both analyses]*

## Tips

- Run **insights** first as a foundation, then specialized analyses
- **jtbd** and **pain-points** complement each other well
- **brand** and **compare** are useful together for competitive research
- **behaviors** reveals what people actually do vs. what they say
- **journey** works best with chronological narratives in the transcript
