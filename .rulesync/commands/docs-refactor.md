---
targets: ['*']
description: 'Systematically improve a documentation section organisation, clarity, and cross-referencing'
---

# Docs Refactor

Systematically improve the documentation section specified in `${ARGUMENTS}` — its organisation, navigation, value propositions, cross-references, and content balance — to match best practices established in well-organised sections like Row Grouping.

> **Primary goal: reorganise, not rewrite.** Move content, restructure navigation, merge or split pages. Add new prose only where genuinely missing and clearly justified — never pad for length or to hit a line-count target.
>
> Apply the writing style guidelines from the [Documentation Pages Guide](.rulesync/rules/docs-pages.md) to any new or revised prose.

## When to Use

Use this command when a documentation section:

-   Has a flat, unorganised navigation structure
-   Lacks clear value propositions on pages
-   Has weak or missing cross-references between related topics
-   Contains orphan pages that are too short to stand alone
-   Is too long with multiple self-contained topics that could be split into focused sub-pages

## Process

### Phase 1: Analysis

1. **Read the current section structure** from `docs-nav/nav.json`
2. **Identify issues**:

    - Flat navigation (all pages at same level)?
    - Missing value propositions (pages jump straight to content)?
    - Weak cross-referencing
    - Orphan pages (< 50 lines, too short)?
    - Inconsistent page length or structure across the section?

3. **Compare to reference sections**:

    - Row Grouping: `documentation/ag-grid-docs/src/content/docs/grouping-data/index.mdoc`
    - Filtering: Well-organised multi-level structure
    - Look for patterns: workflow steps, feature-based organisation, logical grouping

4. **Create improvement plan**:
    - Navigation structure (what groups make sense?)
    - Value propositions (which pages are missing them?)
    - Cross-references (which pages should link to each other?)
    - Content balance (orphans to merge, long pages to split)
    - Are adjacent pages candidates for being mentioned or linked or affect navigation?

### Phase 2: Navigation Restructuring

**File**: `documentation/ag-grid-docs/src/content/docs-nav/nav.json`

**Grouping principles**:

-   **Workflow groups**: Steps in a process (e.g., "Editing Basics" for start → parse → save)
-   **Feature groups**: Related functionality (e.g., "Cell Editors" for provided vs custom)
-   **Mode groups**: Alternative approaches (e.g., "Editing Modes" for full row vs batch)
-   **Quality groups**: Safety/validation features (e.g., "Data Quality" for validation and undo)

**Naming conventions**:

-   Use consistent terminology across similar items
-   "Provided" before "Custom" (users learn built-ins first)
-   Descriptive names that indicate scope (e.g., "Full Row Editing" not just "Full Row")

**Structure example**:

```json
{
    "type": "group",
    "title": "Section Name",
    "children": [
        {
            "type": "item",
            "title": "Overview",
            "path": "section-overview"
        },
        {
            "type": "item",
            "title": "Basics",
            "path": "section-basics",
            "children": [
                { "type": "item", "title": "Step 1", "path": "step-1" },
                { "type": "item", "title": "Step 2", "path": "step-2" }
            ]
        },
        {
            "type": "item",
            "title": "Advanced",
            "path": "section-advanced",
            "children": [{ "type": "item", "title": "Feature A", "path": "feature-a" }]
        }
    ]
}
```

> **Inner groupings require a page:** Unlike top-level sections (`type: "group"` at the nav root level), inner groupings must use `type: "item"` with a `path` pointing to an actual overview page. A `type: "group"` without a `path` inside another group creates a non-clickable section label with no page behind it — an anti-pattern not found elsewhere in the docs. If no suitable overview page exists for a sub-grouping, flatten the structure instead of creating an empty parent.

> **⚠️ Nesting depth limit:** Items nested more than 4 levels deep from the nav root will not render in the sidebar. Count carefully from the first rendered sidebar level: top-level group (1) → item with children (2) → child items (3) → grandchild items (4). Level 4 is the maximum that renders; if adding an inner grouping would push items to level 5+, come up with another way to organise the pages maybe by flattening instead, promoting items as siblings of the parent rather than children of children or a new way of organizing pages.

> **Hub and spoke:** When a topic has 5+ distinct sub-features, organise with a hub page (breadth: overview + navigation, ~100–150 lines) and spoke pages (depth: comprehensive coverage of one aspect, ~80–150 lines each). For simpler topics, a single focused page is better.

For guidance on what content belongs on parent/overview pages, see [Parent / Overview Pages](.rulesync/rules/docs-pages.md#parent--overview-pages) in the Documentation Pages Guide.

### Phase 3: Value Propositions

Where a page is missing a value proposition, add one immediately after the frontmatter:

```markdown
---
title: 'Page Title'
---

One-sentence value proposition describing the user benefit.

## First Section Heading
```

See the [Documentation Pages Guide](.rulesync/rules/docs-pages.md#value-propositions) for writing guidelines on value propositions.

### Phase 4: Cross-References

**Add "See Also" section** at the end of pages only when it adds genuine discovery value:

```markdown
## See Also

-   [Related Topic 1](./related-topic-1/) - Brief description of how it relates
-   [Related Topic 2](./related-topic-2/) - Brief description of how it relates
-   [Related Topic 3](./related-topic-3/) - Brief description of how it relates
```

Note: Use actual paths like `./cell-editing/`, `./value-parsers/`, etc. The examples above use placeholders.

**Cross-reference principles**:

-   Hub pages (Overview) could link to pages in the section
-   Feature pages could link to 0-3 closely related pages (if highly relevant and necessary)
-   Create bi-directional links if meaningful (if A links to B meaningfully, B can link to A meaningfully)
-   Link descriptions should clarify the relationship

See [Section Ordering — See Also](.rulesync/rules/docs-pages.md#section-ordering) in the Documentation Pages Guide for rules on when See Also is and isn't appropriate.

### Phase 5: Content Balance

#### For Orphan Pages (< 50 lines)

**Default: Option B - Merge** if content is too thin:

-   Identify logical parent page
-   Move content as a section
-   Update all cross-references
-   Remove from navigation

**Option A - Expand** only if substantial existing candidate content (examples, API details, complex configuration) justifies a standalone page. Do not write new explanatory prose to reach a line-count target.

#### For Overly Long Pages (> 300-400 lines)

**When to break down a page**:

-   Page exceeds 400 lines
-   Contains multiple distinct sub-topics that could stand alone
-   Users would benefit from focused, digestible sub-pages
-   Natural hierarchy exists within the content

**How to identify split points**:

1. **Look for major section headers** - Each H2 (##) is a potential sub-page
2. **Identify self-contained topics** - Sections that don't heavily depend on each other
3. **Check existing patterns** - Look at similar sections for precedent
4. **Consider user journey** - Does the split make sense for learning progression?

**Steps to break down a page**:

1. **Create parent page** as overview/hub:

    ```markdown
    ---
    title: 'Feature Name'
    ---

    Brief overview of the entire feature.

    ## Core Concepts

    Brief explanation of key concepts.

    ## Getting Started

    Link to basic setup sub-page.

    ## Advanced Topics

    -   [Sub-topic 1](./feature-subtopic-1/) - Description
    -   [Sub-topic 2](./feature-subtopic-2/) - Description

    ## See Also

    Links to related features.
    ```

2. **Create sub-pages** for each major topic:

    - Use clear, descriptive names
    - Each sub-page should be 100-200 lines
    - Each sub-page should have value proposition
    - Each sub-page should link back to parent

3. **Update navigation** in `nav.json` — follow the same group/item structure shown in Phase 2.

4. **Update cross-references**:

    - Parent page links to all sub-pages
    - Sub-pages link back to parent
    - Sub-pages link to related sub-pages where appropriate
    - Other pages linking to the original page may need updates

5. **Handle examples** (CRITICAL - prevents hydration errors):

    Each page must have its own `_examples/` directory containing the examples it references. When splitting pages, you must create the directory structure and copy examples to the correct locations.

    **Example structure**:

    ```
    docs/feature-name/
    ├── index.mdoc              # Parent page references "simple" example
    └── _examples/
        └── simple/             # Example for parent page

    docs/feature-name-datasource/
    ├── index.mdoc              # Sub-page references "simple", "advanced" examples
    └── _examples/
        ├── simple/             # Copy of example (used by multiple pages)
        └── advanced/           # Example specific to this sub-page

    docs/feature-name-advanced/
    ├── index.mdoc              # Sub-page references "simple", "complex" examples
    └── _examples/
        ├── simple/             # Copy of example (used by multiple pages)
        └── complex/            # Example specific to this sub-page
    ```

    **Critical steps**:

    1. **Identify examples**: List all `{% gridExampleRunner name="example-name" /%}` references in each sub-page
    2. **Copy examples**: Use `cp -r` (not `mv`) to copy example directories to each sub-page's `_examples/` folder
    3. **Verify**: Check that each sub-page has its own `_examples/` directory with required examples

    **Common mistakes**:

    - ❌ Moving examples instead of copying (breaks other pages)
    - ❌ Forgetting to create `_examples/` directories (hydration errors)
    - ❌ Assuming examples can be referenced from parent directory (they can't - must be in same directory)

6. **Verify content fidelity** — diff each sub-page section-by-section against the source file. Every sentence from the original must appear verbatim in exactly one sub-page. See "Content Fidelity When Splitting Pages" below for what changes are acceptable.

**Real examples from the codebase**:

-   **Provided Cell Editors** (`provided-cell-editors/`) - Parent page with 7 editor-type sub-pages
-   **Server-Side Row Model** (`server-side-model/`) - Hub with 10+ focused sub-pages for distinct features
-   **Row Grouping** (`grouping-data/`) - Well-balanced pages (100-250 lines each) with clear hierarchy

#### Content Fidelity When Splitting Pages

When moving content from a long page to sub-pages, the prose must be transplanted verbatim. Rewriting while moving is the most common failure mode — an LLM asked to "split" a page will silently paraphrase, condense, reformat, and invent content.

**The verbatim transplant rule**: Every sentence in the original must appear unchanged in exactly one sub-page. The only new prose allowed is:

-   A 1-sentence page-level introduction (e.g. "The datasource provides data to the Infinite Row Model.")
-   `## See Also` / `## Next Steps` navigation sections
-   Cross-page links added to existing bullets

**Cosmetically acceptable changes** (do not alter content):

| Change                  | Example                                                        |
| ----------------------- | -------------------------------------------------------------- |
| Heading level promotion | `###` → `##` when a section becomes a page's top-level heading |
| Section reordering      | Moving a logically misplaced section to a better sub-page      |
| Example relocation      | Moving an example to the sub-page where it fits best           |

**Not acceptable** (reverts required):

| Change                    | Example                                                                          |
| ------------------------- | -------------------------------------------------------------------------------- |
| Prose paraphrase          | "In a nutshell, every time..." → "The grid calls `getRows()` each time..."       |
| Paragraph → bullet list   | 3 sentences converted to bullet points covering the same content                 |
| Dropped sentence          | Removing a factual sentence to "simplify"                                        |
| Invented section          | Adding "Performance Tips", "How it Works" numbered lists, marketing bullets      |
| Invented code example     | Adding a `fetch()`-based usage example that wasn't in the original               |
| Code syntax modernisation | `function(params)` → `(params) =>` (arrow function)                              |
| Spelling normalisation    | `initialised` → `initialized` (repo uses UK English in prose and comments)       |
| Embellished descriptions  | "Calls for the cache to be purged" → "Clears the cache and reloads from scratch" |

**Review step**: After writing sub-pages, diff each sub-page section-by-section against the corresponding section in the source file. For every difference, ask: is this cosmetic (heading level, new nav section) or a content change? Content changes must be reverted.

## Quality Checklist

Before completing, verify:

### Navigation

-   [ ] Clear logical grouping of related topics
-   [ ] Easier discovery of features
-   [ ] Better learning progression (basic → advanced)
-   [ ] Consistent with other well-organised sections

### Content

-   [ ] Every page has a value proposition (see [Documentation Pages Guide](.rulesync/rules/docs-pages.md#value-propositions) for writing guidelines)
-   [ ] Writing style follows [Documentation Pages Guide](.rulesync/rules/docs-pages.md#writing-style) (active voice, imperative mood, positive framing)
-   [ ] Each page includes at least one working example
-   [ ] No orphan pages (all pages are 50+ lines or merged)
-   [ ] No new prose added without clear justification

### Cross-References

-   [ ] Hub page links to all section pages
-   [ ] (Optional if necessary and highly relevant) See Also sections only contain links to other sections of the docs (not child/sibling pages)
-   [ ] Bi-directional links are in place where meaningful
-   [ ] Link descriptions clarify relationships
-   [ ] Parent pages use inline links to children (not standalone "See [X]..." sentences)
-   [ ] No code or prose duplicated between parent and child pages

### Balance

-   [ ] Similar pages have similar depth (~100-150 lines)
-   [ ] No pages are too short (< 50 lines) or too long (> 300 lines)
-   [ ] Content density is appropriate for topic complexity

### Content Fidelity (when splitting pages)

-   [ ] All moved prose is verbatim from the source (no paraphrasing)
-   [ ] No sentences dropped from the original
-   [ ] No new explanatory prose added beyond page intros and nav sections
-   [ ] Code examples match the original exactly (function syntax, UK spelling in comments)
-   [ ] No section invented that wasn't in the original (e.g. "Performance Tips", "How it Works" lists)
-   [ ] Prose paragraphs not reformatted into bullet lists

### Examples

-   [ ] Each page has its own `_examples/` directory
-   [ ] All `{% gridExampleRunner %}` references work without hydration errors
-   [ ] Examples used by multiple pages are copied (not moved) to each location

## Example: Editing Section Improvements

### Before

```
Editing (flat structure)
├── Overview
├── Start / Stop Editing
├── Parsing Values
├── Saving Values
├── Edit Components
├── Provided Cell Editors (7 children)
├── Undo / Redo Edits
├── Full Row (36 lines - too short!)
├── Validation
└── Batch Editing
```

### After

```
Editing
├── Overview                        → cell-editing
├── Editing Basics                  → cell-editing-basics  (type: item, new overview page)
│   ├── Start / Stop Editing        → cell-editing-start-stop
│   ├── Parsing Values              → value-parsers
│   └── Saving Values               → value-setters
├── Provided Cell Editors           → provided-cell-editors  (type: item, existing page)
│   ├── Text Editor                 → provided-cell-editors-text
│   ├── Large Text Editor           → provided-cell-editors-large-text
│   ├── Number Editor               → provided-cell-editors-number
│   ├── Date Editors                → provided-cell-editors-date
│   ├── Checkbox Editor             → provided-cell-editors-checkbox
│   ├── Select Editor               → provided-cell-editors-select
│   ├── Rich Select Editor          → provided-cell-editors-rich-select
│   ├── Rich Select Customisation   → provided-cell-editors-rich-select-customisation
│   └── Rich Select Async Values    → provided-cell-editors-rich-select-async
├── Custom Edit Components          → cell-editors
├── Editing Modes                   → cell-editing-modes  (type: item, new overview page)
│   ├── Full Row Editing            → cell-editing-full-row
│   └── Batch Editing               → cell-editing-batch
├── Validation                      → cell-editing-validation
└── Undo / Redo Edits               → undo-redo-edits
```

## Related Documentation

-   Row Grouping section: `documentation/ag-grid-docs/src/content/docs/grouping-data/index.mdoc` - Model for excellent organisation
-   [Documentation Pages Guide](.rulesync/rules/docs-pages.md) - Writing style, tone, and content standards
-   [Examples Guide](.rulesync/rules/examples.md) - Working with examples
-   [Code Quality Guide](.rulesync/rules/code-quality.md) - Writing quality standards
