---
targets: ['*']
description: 'Creating and maintaining documentation pages for AG Grid'
globs: ['documentation/**/*.mdoc', 'documentation/**/*.md']
---

# Documentation Pages Guide

This guide covers creating and maintaining documentation pages for AG Grid — its structure, writing style, tone, and quality standards. Documentation is located in `documentation/ag-grid-docs/` and uses Astro with Markdoc for content.

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
3. Write content following existing patterns and the [writing guidelines](#writing-style) below
4. Add examples in `_examples/` if needed
5. Update navigation in `nav.json` if required

## Frontmatter

```yaml
---
title: Feature Name
description: Brief description of the feature
---
```

## Language Conventions

-   **Documentation text**: UK/British English (e.g., "colour", "behaviour")
-   **API option names**: US English (e.g., "color", "behavior")
-   **Comments and JSDocs**: UK/British English

## Writing Style

### Core Principles

1. **Example-driven** - Illustrate concepts with examples rather than prose alone
2. **Progressive disclosure** - Present simple concepts before complex ones
3. **Active voice** - Direct and clear; say who does what
4. **Present tense** - Describe current behaviour, not future state
5. **Positive framing** - Lead with solutions, not limitations
6. **Appropriate length** - Calibrate to content complexity; don't pad or compress artificially
7. **Consistent structure** - Predictable patterns that start with user benefit aid navigation
8. **Cross-reference** - Link to related documentation where it adds context or discovery value

### Quick Reference

| Principle        | ✅ Do This                       | ❌ Avoid This                    |
| ---------------- | -------------------------------- | -------------------------------- |
| **Voice**        | "The grid requests rows"         | "Rows are requested" (passive)   |
| **Voice**        | "Set `rowGroup` to true"         | "rowGroup should be set"         |
| **Tense**        | "The grid calls" (present)       | "will call" (future)             |
| **Mood**         | "Enable editing" (imperative)    | "Editing can be enabled"         |
| **Contractions** | "doesn't", "can't", "won't"      | "does not", "cannot", "will not" |
| **Clarity**      | Direct statements                | "In a nutshell", "Basically"     |
| **Framing**      | "Use X instead" (positive)       | "cannot do Y" (negative)         |
| **Structure**    | Value prop → examples → advanced | API reference first, no examples |

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

**Pattern:** Lead with solution, then explain why.

### Value Propositions

Every page should open with a value proposition immediately after the frontmatter:

```markdown
---
title: 'Page Title'
---

One-sentence value proposition describing the user benefit.

## First Section Heading
```

**Writing guidelines**:

-   Start with an action verb (e.g., "Create", "Control", "Prevent", "Recover")
-   Focus on user benefit, not implementation
-   Keep it under 15 words
-   Answer "Why would I use this?"

### Code Snippets

Use `frameworkTransform=true` and show only relevant code with clarifying comments:

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

### Section Ordering

Not every page will include all sections; follow this order for the sections that are relevant:

1. Value proposition (what & why)
2. Context statement (prerequisites, when to use)
3. Basic configuration (enable/setup)
4. Simple example (get users running)
5. Core concepts (ordered by complexity)
6. Advanced features (power user territory)
7. API reference (programmatic control)
8. Events (lifecycle hooks)
9. See Also — only for pages in **other sections** of the docs that are highly relevant. Never use See Also to link to child pages or sibling pages within the same nav section — those are already visible in the sidebar. If all candidate links are within the same section, omit the section entirely.

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

**URL format for internal links in `.mdoc` files:** Use `./page-path/` (framework-relative prefix). Do not use `../` (not supported by the docs URL resolver).

## Validation

Test documentation changes:

```bash
# Start dev server
yarn nx dev

# Run E2E tests
yarn nx e2e ag-grid-docs
```
