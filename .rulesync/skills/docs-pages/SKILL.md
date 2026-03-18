---
targets: ['*']
name: docs-pages
description: 'Use this skill when creating, editing, reviewing, or restructuring AG Grid documentation pages. Trigger whenever working with .mdoc files, writing new documentation, improving page structure or prose quality, or reviewing docs for consistency — even if the user doesn't say "documentation" explicitly.'
---

# Documentation Pages Guide

This guide covers creating and maintaining documentation pages for AG Grid — structure, writing style, tone, and quality standards. Documentation lives in `documentation/ag-grid-docs/` and uses Astro with Markdoc for content.

## Page Structure

```
documentation/ag-grid-docs/src/content/docs/
├── feature-category/
│   ├── index.mdoc           # Category overview
│   ├── specific-feature/
│   │   ├── index.mdoc       # Feature documentation
│   │   └── _examples/       # Feature examples
```

## Creating New Pages

1. Create the `.mdoc` file in the appropriate directory
2. Add frontmatter with title and description
3. Write content following the [writing guidelines](#writing-style) below
4. Add examples in `_examples/` if needed
5. Update navigation in `nav.json` if required

## Frontmatter

```yaml
---
title: Feature Name
description: Brief description of the feature
---
```

**Internal links in `.mdoc` files:** Always use `./page-path/` (framework-relative prefix). Do not use `../` — it's not supported by the docs URL resolver.

## Language Conventions

-   **Documentation text**: UK/British English (e.g., "colour", "behaviour")
-   **API option names**: US English (e.g., "color", "behavior")
-   **Comments and JSDocs**: UK/British English

## Writing Style

### Core Principles

Content and structure decisions should follow these principles:

1. **Example-driven** — Illustrate concepts with live demos rather than prose alone; let examples do the heavy lifting
2. **Progressive disclosure** — Simple concepts before complex ones; don't front-load edge cases
3. **Consistent structure** — Predictable section ordering (see [Section Ordering](#section-ordering)) that starts with user benefit
4. **Cross-reference** — Link to related documentation where it adds genuine context or aids discovery; avoid gratuitous links

For prose style (voice, tense, contractions, framing), see [Prose Style](#prose-style) below.

### Prose Style

| Principle        | ✅ Do This                       | ❌ Avoid This                    |
| ---------------- | -------------------------------- | -------------------------------- |
| **Voice**        | "The grid requests rows"         | "Rows are requested" (passive)   |
| **Mood**         | "Enable editing" (imperative)    | "Editing can be enabled"         |
| **Tense**        | "The grid calls" (present)       | "will call" (future)             |
| **Contractions** | "doesn't", "can't", "won't"      | "does not", "cannot", "will not" |
| **Clarity**      | Direct statements                | "In a nutshell", "Basically"     |
| **Framing**      | "Use X instead" (positive)       | "cannot do Y" (negative)         |
| **Structure**    | Value prop → examples → advanced | API reference first, no examples |

### Section Headings

Use concise noun or action phrases:

| ✅ Do This       | ❌ Avoid This                |
| ---------------- | ---------------------------- |
| "Start Triggers" | "Customizing Start Triggers" |
| "Stop Triggers"  | "Customizing Stop Behavior"  |
| "Editing API"    | "Programmatic Control"       |
| "Navigation"     | "Understanding Navigation"   |

### Positive Framing

Transform limitations into requirements or alternatives:

**Before (negative):**

```markdown
Aggregation and grouping are not available in infinite scrolling.
The grid cannot do sorting for you.
```

**After (positive):**

```markdown
For aggregation and grouping, use [Server-Side Row Model](./server-side-model/) instead.
Sorting must be performed server-side.
```

**Pattern:** Lead with the solution, then explain why.

### Value Propositions (Page Subtitles)

Every page opens with a subtitle — the first paragraph immediately after the frontmatter. This renders as the page subtitle and is distinct from the frontmatter `description` field.

```markdown
---
title: 'Page Title'
---

One-sentence subtitle describing what the feature is or does.

## First Section Heading
```

**Writing guidelines:**

-   **One sentence.** Two sentences are occasionally acceptable; never more.
-   **Declarative** — describe what the feature IS or DOES, not what the user should do or learn.
-   Start with the subject ("The grid...", "Row selection...") or an action verb ("Configure...", "Stage...", "Prevent...").
-   Focus on the feature's purpose, not implementation detail.
-   Answer "What does this page cover?" not "How do I use this?"

**Before / after examples:**

| ❌ Avoid                                                                                                                                                                                                                                  | ✅ Prefer                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| "Understand the complete cell editing lifecycle — how edits begin and end, how user input is converted to the correct data type, and how changes are written back to your data."                                                          | "The cell editing lifecycle covers how edits start and stop, how user input is parsed, and how changes are written back to your data." |
| "The grid keeps the blocks in a cache. You have the choice to never expire the blocks, or to set a limit to the number of blocks kept. If you set a limit, then as you scroll down, previous blocks will be discarded…"                   | "The grid caches row data in blocks, with configurable limits on how many blocks are kept in memory."                                  |
| "The grid comes with some cell editors provided out of the box. These cell editors are listed here."                                                                                                                                      | "The grid provides several built-in cell editors for common data types."                                                               |
| "An alternative to using the browser's `select` popup for dropdowns inside the grid. The Rich Select Cell Editor allows users to enter a cell value from a list of provided values by searching or filtering the list."                   | "Drop-down cell editor with search and filter support, as an alternative to the browser's native `select` element."                    |
| "Batch editing allows you to edit multiple cells or rows in the grid before committing or reverting these edits. This is useful for scenarios where you want to make several edits at once without immediately updating the data source." | "Stage multiple cell edits before committing or discarding them all at once."                                                          |

### Code Snippets

Show only relevant code with clarifying comments. Apply `frameworkTransform=true` only when the snippet contains `gridOptions` configuration — the transform rewrites `gridOptions` object syntax into framework-idiomatic equivalents (e.g. React props, Angular bindings).

**With `gridOptions` — requires `frameworkTransform=true`:**

````markdown
```{% frameworkTransform=true %}
const gridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true }, // enable row grouping on this column
    ],
    // ...other options
};
```
````

**`colDef` only — no transform needed:**

````markdown
```js
const colDef = {
    field: 'country',
    rowGroup: true, // enable row grouping on this column
};
```
````

### Section Ordering

Not every page includes all sections; follow this order for the sections that are relevant:

1. Value proposition (what & why)
2. Context statement (prerequisites, when to use)
3. Simple example (get users running)
4. Basic configuration (enable/setup)
5. Core concepts (ordered by complexity)
6. Advanced features (power user territory)
7. Events (lifecycle hooks)
8. See Also — only when linking to a page in a **different nav section** that is directly relevant and not discoverable from the sidebar. Omit it for sibling or child pages — those are already visible in the nav.

Within each section, always use **show then tell** ordering — the live demo before the code snippet. The canonical pattern is:

```markdown
[Optional: brief prose or bullet list only when context is needed to work the demo]

{% gridExampleRunner title="Example" name="example" /%}

The example above uses the following configuration:

​`{% frameworkTransform=true %}
const gridOptions = { ... };
​`
```

The optional preamble exists only to explain what to interact with or what to look for — never to explain the code. The code explanation always follows the demo. Use "The example above uses the following configuration:" as the standard connector phrase.

### Inline Cross-References

For sibling-page links that are too important to omit but don't qualify for See Also, use an inline `{% note %}` block:

```markdown
{% note %}
Cell Editing can also be performed via [Cell Editor Components](./cell-editors/).
{% /note %}
```

Use sparingly — only when users commonly miss or confuse a closely related feature.

### API Documentation Blocks

Use `{% apiDocumentation %}` sparingly and inline — place it **immediately after the relevant code snippet** within the section it relates to. Do not create a standalone "API reference" section at the end of a page.

**Rules:**

-   **Max 2 `names` entries** per block — the purpose is to show users how to use the main API member based on its type and a brief description, not to provide exhaustive documentation. Pages that need to introduce many API members should use a dedicated API section at the bottom instead (as seen in other parts of the docs).
-   **Object/complex types only** — use `{% apiDocumentation %}` for members whose values are objects, interfaces, or callback signatures where the shape needs explaining. For members that accept only a boolean, string, or number, explain them inline in prose or code snippet comments instead.

### Parent / Overview Pages

Pages that act as nav parents (they have both a `path` and `children` in `nav.json`) follow a different content model from leaf pages.

**Do include:**

-   A brief mental model or lifecycle overview — conceptual content that ties the children together and doesn't duplicate any single child
-   Per-child introductions: 1–3 sentences on what each child covers, when to use it, and any key limitations
-   Inline links to child pages embedded in the prose (preferred over standalone "See [X] for details" sentences)
-   A comparison table when children represent mutually exclusive alternative approaches

**Do not include:**

-   Code examples or prose duplicated from child pages — the same content must not appear in both places
-   Detailed "how it works" steps or event lists that live in child pages
-   API reference sections (those belong in child pages)
-   Standalone "See [Child] for full details" sentences — the nav already exposes children

A basic enabling snippet or brief illustrative example may appear on the parent page if it is removed from (or never added to) the child page — the same code must not exist in both places.
