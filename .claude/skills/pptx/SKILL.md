---
name: pptx
description: "Presentation creation, editing, and analysis. When Claude needs to work with presentations (.pptx files) for: (1) Creating new presentations, (2) Modifying or editing content, (3) Working with layouts, (4) Adding comments or speaker notes, or any other presentation tasks"
license: Proprietary. LICENSE.txt has complete terms
---

# PPTX creation, editing, and analysis

## Overview

A user may ask you to create, edit, or analyze the contents of a .pptx file. A .pptx file is essentially a ZIP archive containing XML files and other resources that you can read or edit. You have different tools and workflows available for different tasks.

## Reading and analyzing content

### Text extraction
If you just need to read the text contents of a presentation, you should convert the document to markdown:

```bash
# Convert document to markdown
python -m markitdown path-to-file.pptx
```

### Raw XML access
You need raw XML access for: comments, speaker notes, slide layouts, animations, design elements, and complex formatting. For any of these features, you'll need to unpack a presentation and read its raw XML contents.

#### Unpacking a file
`python ooxml/scripts/unpack.py <office_file> <output_dir>`

**Note**: The unpack.py script is located at `skills/pptx/ooxml/scripts/unpack.py` relative to the project root. If the script doesn't exist at this path, use `find . -name "unpack.py"` to locate it.

#### Key file structures
* `ppt/presentation.xml` - Main presentation metadata and slide references
* `ppt/slides/slide{N}.xml` - Individual slide contents (slide1.xml, slide2.xml, etc.)
* `ppt/notesSlides/notesSlide{N}.xml` - Speaker notes for each slide
* `ppt/comments/modernComment_*.xml` - Comments for specific slides
* `ppt/slideLayouts/` - Layout templates for slides
* `ppt/slideMasters/` - Master slide templates
* `ppt/theme/` - Theme and styling information
* `ppt/media/` - Images and other media files

#### Typography and color extraction
**When given an example design to emulate**: Always analyze the presentation's typography and colors first using the methods below:
1. **Read theme file**: Check `ppt/theme/theme1.xml` for colors (`<a:clrScheme>`) and fonts (`<a:fontScheme>`)
2. **Sample slide content**: Examine `ppt/slides/slide1.xml` for actual font usage (`<a:rPr>`) and colors
3. **Search for patterns**: Use grep to find color (`<a:solidFill>`, `<a:srgbClr>`) and font references across all XML files

## Creating a new PowerPoint presentation **without a template**

When creating a new PowerPoint presentation from scratch, use the **html2pptx** workflow to convert HTML slides to PowerPoint with accurate positioning.

See [`references/design-guidelines.md`](references/design-guidelines.md) for design principles, color palettes (18 options), visual detail options (geometric patterns, borders, typography treatments, chart styling, layout innovations, background treatments), and layout tips.

### Workflow
1. **MANDATORY - READ ENTIRE FILE**: Read [`html2pptx.md`](html2pptx.md) completely from start to finish. **NEVER set any range limits when reading this file.** Read the full file content for detailed syntax, critical formatting rules, and best practices before proceeding with presentation creation.
2. Create an HTML file for each slide with proper dimensions (e.g., 720pt x 405pt for 16:9)
   - Use `<p>`, `<h1>`-`<h6>`, `<ul>`, `<ol>` for all text content
   - Use `class="placeholder"` for areas where charts/tables will be added (render with gray background for visibility)
   - **CRITICAL**: Rasterize gradients and icons as PNG images FIRST using Sharp, then reference in HTML
   - **LAYOUT**: For slides with charts/tables/images, use either full-slide layout or two-column layout for better readability
3. Create and run a JavaScript file using the [`html2pptx.js`](scripts/html2pptx.js) library to convert HTML slides to PowerPoint and save the presentation
   - Use the `html2pptx()` function to process each HTML file
   - Add charts and tables to placeholder areas using PptxGenJS API
   - Save the presentation using `pptx.writeFile()`
4. **Visual validation**: Generate thumbnails and inspect for layout issues
   - Create thumbnail grid: `python scripts/thumbnail.py output.pptx workspace/thumbnails --cols 4`
   - Read and carefully examine the thumbnail image for text cutoff, overlap, positioning, and contrast issues
   - If issues found, adjust HTML margins/spacing/colors and regenerate
   - Repeat until all slides are visually correct

## Editing an existing PowerPoint presentation

When edit slides in an existing PowerPoint presentation, you need to work with the raw Office Open XML (OOXML) format. This involves unpacking the .pptx file, editing the XML content, and repacking it.

### Workflow
1. **MANDATORY - READ ENTIRE FILE**: Read [`ooxml.md`](ooxml.md) (~500 lines) completely from start to finish.  **NEVER set any range limits when reading this file.**  Read the full file content for detailed guidance on OOXML structure and editing workflows before any presentation editing.
2. Unpack the presentation: `python ooxml/scripts/unpack.py <office_file> <output_dir>`
3. Edit the XML files (primarily `ppt/slides/slide{N}.xml` and related files)
4. **CRITICAL**: Validate immediately after each edit and fix any validation errors before proceeding: `python ooxml/scripts/validate.py <dir> --original <file>`
5. Pack the final presentation: `python ooxml/scripts/pack.py <input_directory> <office_file>`

## Creating a new PowerPoint presentation **using a template**

When you need to create a presentation that follows an existing template's design, you'll duplicate and re-arrange template slides, then replace placeholder content. This is a 7-step workflow involving template analysis, outline creation, slide rearrangement via `rearrange.py`, text inventory extraction via `inventory.py`, replacement JSON generation, and application via `replace.py`.

See [`references/template-workflow.md`](references/template-workflow.md) for the complete 7-step template workflow with detailed instructions, JSON formats, and examples.

## Thumbnail Grids and Slide Images

Use `scripts/thumbnail.py` to create visual thumbnail grids for template analysis, content review, and quality checks. Use LibreOffice + pdftoppm for converting individual slides to images.

See [`references/thumbnail-and-images.md`](references/thumbnail-and-images.md) for full usage, options, and examples.

## Code Style Guidelines
**IMPORTANT**: When generating code for PPTX operations:
- Write concise code
- Avoid verbose variable names and redundant operations
- Avoid unnecessary print statements

## Dependencies

Required dependencies (should already be installed):

- **markitdown**: `pip install "markitdown[pptx]"` (for text extraction from presentations)
- **pptxgenjs**: `npm install -g pptxgenjs` (for creating presentations via html2pptx)
- **playwright**: `npm install -g playwright` (for HTML rendering in html2pptx)
- **react-icons**: `npm install -g react-icons react react-dom` (for icons)
- **sharp**: `npm install -g sharp` (for SVG rasterization and image processing)
- **LibreOffice**: `sudo apt-get install libreoffice` (for PDF conversion)
- **Poppler**: `sudo apt-get install poppler-utils` (for pdftoppm to convert PDF to images)
- **defusedxml**: `pip install defusedxml` (for secure XML parsing)
