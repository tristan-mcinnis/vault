# Micro: Data & Visualization

Evaluate charts, tables, and evidence for clarity, accuracy, and persuasive power.

## Zelazny Chart Selection

Gene Zelazny's framework: Chart type should match the data relationship you're showing.

### The Five Relationships

| Relationship | What You're Showing | Best Chart Types |
|--------------|---------------------|------------------|
| **Component** | Parts of a whole | Pie, stacked bar, treemap |
| **Item** | Comparing discrete items | Bar (horizontal), column |
| **Time Series** | Change over time | Line, area, column |
| **Frequency** | Distribution of values | Histogram, box plot |
| **Correlation** | Relationship between variables | Scatter plot, bubble chart |

### Common Mismatches

| Data Relationship | Wrong Choice | Why It Fails | Right Choice |
|-------------------|--------------|--------------|--------------|
| Time series | Pie chart | Can't show trends | Line chart |
| Parts of whole | Line chart | Implies time/sequence | Pie or stacked bar |
| 2 items | Pie chart | Overcomplicates simple comparison | Two bars |
| 10+ categories | Pie chart | Too many slices | Horizontal bar |
| Correlation | Bar chart | Hides the relationship | Scatter plot |
| Distribution | Pie chart | Doesn't show spread | Histogram |

### The Pie Chart Rule

Use pie charts only when:
- Showing parts of 100%
- 2-5 segments (6+ is too many)
- One segment is the story (e.g., "X is 60% of the market")
- Order matters (arrange by size)

If none of these apply, use a bar chart.

---

## Signal-to-Noise Ratio

**Definition**: The key message should be immediately visible. Everything else is noise.

### Elements That Add Noise

| Element | When It's Noise | When It's Signal |
|---------|-----------------|------------------|
| Gridlines | When too many or too dark | When very faint, helps read values |
| Legends | When away from data | When data is labeled directly |
| 3D effects | Almost always | Never |
| Decorative icons | When they don't add meaning | Rarely justified |
| Borders/boxes | When enclosing empty space | When separating content areas |
| Data labels on every point | When there are 50 points | When highlighting 2-3 key points |

### The Newspaper Test

Would a business newspaper print this chart? Newspapers:
- Use minimal decoration
- Label data directly
- Remove unnecessary gridlines
- Make the headline obvious
- Keep it readable at small sizes

### Data-Ink Ratio

Edward Tufte's principle: Maximize the share of ink devoted to data.

**High data-ink ratio**: Every mark serves a purpose
**Low data-ink ratio**: Decoration competes with data

### Quick Diagnosis

If someone asks "what am I looking at?" within 3 seconds, signal-to-noise ratio is too low.

---

## Source Integrity

**Definition**: Data should be sourced, credible, and recent enough to support the claim.

### Source Citation Standards

Every data point should be traceable:

```
Source: Euromonitor, 2024 | Base: Premium cookie sales, APAC
```

Include:
- Source name (not just "internal data")
- Year/date
- Base (what population or scope)
- Sample size for research data

### Credibility Hierarchy

| Source Type | Credibility | Watch Out For |
|-------------|-------------|---------------|
| Primary research | High | Confirm sample size and methodology |
| Industry databases (Euromonitor, Nielsen) | High | Check recency |
| Government statistics | High | May be outdated |
| Academic studies | Medium-High | Check relevance to context |
| Industry association data | Medium | Potential bias |
| Company self-reported data | Medium | Verify independently if possible |
| News articles | Low-Medium | May be anecdotal |
| Blogs/social media | Low | Don't use as primary evidence |

### Source Red Flags

- "Source: Internal analysis" (what inputs?)
- No date (could be 10 years old)
- Single-source claims for major assertions
- Data doesn't match publicly available figures
- Sample size not disclosed for research

---

## Annotation Quality

**Definition**: Callouts should highlight what matters and tell the reader what to notice.

### Effective Callouts

| Element | Standard |
|---------|----------|
| **Placement** | Next to the data point it references |
| **Content** | States the insight, not just the number |
| **Visual weight** | Prominent enough to see, not so heavy it overwhelms |
| **Quantity** | 1-2 per chart (more dilutes impact) |

### Callout Types

| Type | Use When | Example |
|------|----------|---------|
| **Number highlight** | One figure tells the story | "60% of growth from premium segment" |
| **Trend annotation** | Inflection point matters | "Sales accelerated after campaign launch" |
| **Comparison callout** | Gap/difference is the point | "3x higher than category average" |
| **Context note** | External factor explains data | "Reflects COVID lockdown period" |

### Common Annotation Failures

| Problem | Description |
|---------|-------------|
| **Missing callout** | Chart with no guidance; reader must interpret |
| **Obvious callout** | Restates the title; adds nothing |
| **Too many callouts** | 5+ annotations; nothing stands out |
| **Wrong emphasis** | Callout on secondary point, not key insight |
| **Orphan callout** | Annotation doesn't connect to a data point |

---

## Number Consistency

**Definition**: Numeric formatting should be consistent throughout the deck.

### Formatting Standards

| Element | Standard |
|---------|----------|
| **Currency** | Same symbol throughout ($, €, ¥) |
| **Decimal places** | Consistent (don't mix 3.5% and 3.52%) |
| **Date format** | Consistent (don't mix Q1 2024, 2024Q1, Jan '24) |
| **Units** | Consistent (don't mix millions and billions) |
| **Rounding** | Appropriate to precision (don't show $1,234,567.89 for estimates) |

### Rounding Guidelines

| Context | Appropriate Precision |
|---------|----------------------|
| Exact financials | Full precision |
| Market estimates | Round to meaningful unit (e.g., $2.3B) |
| Percentages | Usually 1 decimal (45.2%), sometimes whole (45%) |
| Large numbers | Use K, M, B notation for readability |

### Consistency Check

Pick 5 random slides with numbers. Are they formatted the same way?

---

## Table Design

Tables often fail where charts succeed. Evaluate against these standards:

### Table Principles

| Principle | Standard |
|-----------|----------|
| **Right tool** | Tables for lookup; charts for patterns |
| **Row/column headers** | Clear, concise labels |
| **Alignment** | Numbers right-aligned; text left-aligned |
| **Highlighting** | Key cells visually emphasized |
| **White space** | Adequate padding; not cramped |

### When Tables Beat Charts

- Precise values matter more than patterns
- Reader needs to look up specific figures
- Many dimensions (3+) in one view
- Comparing exact numbers across items

### Common Table Failures

| Problem | Description |
|---------|-------------|
| **Too many rows** | 20+ rows; consider a chart |
| **No emphasis** | All cells look the same; key data buried |
| **Merged cells** | Create confusion about structure |
| **Over-decoration** | Alternating colors, borders everywhere |
| **Tiny font** | Squeezed to fit; unreadable |

---

## Chart Best Practices by Type

### Bar/Column Charts

- Baseline at zero (don't truncate)
- Sort by value (largest to smallest) unless logical order
- Label directly when possible (no separate legend)
- Use horizontal bars for long labels

### Line Charts

- Time on x-axis, left to right
- Limit to 4-5 lines (more is confusing)
- Differentiate lines clearly (not just color)
- Start y-axis at zero unless showing rates of change

### Pie Charts

- Order slices by size (largest at 12 o'clock, clockwise)
- Max 5-6 slices (use "Other" for rest)
- Label directly (no separate legend)
- Consider donut if center text adds value

### Scatter Plots

- Axes labeled clearly
- Trend line if relationship matters
- Outliers labeled if significant
- Quadrant lines if framework applies

---

## Data Visualization Red Flags

Immediate concerns when auditing:

| Red Flag | Problem | Fix |
|----------|---------|-----|
| 3D charts | Distorts data; looks amateurish | Use 2D |
| Rainbow colors | No logic to color choices | Use intentional palette |
| Truncated axes | Exaggerates differences | Start at zero or label break |
| Dual axes | Often misleads | Separate into two charts |
| Chartjunk | Icons, images, decoration | Remove; let data speak |
| Tiny text | Unreadable when projected | Minimum 12pt for charts |
| Missing units | "Sales: 500" (500 what?) | Always label units |
| Inconsistent scales | Two charts, different y-axes, compared | Same scale or note difference |
