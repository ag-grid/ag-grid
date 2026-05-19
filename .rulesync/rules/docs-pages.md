---
root: false
targets: ['*']
description: 'Documentation page conventions for AG Charts — loads /spruce-docs skill for details'
globs:
    [
        'packages/ag-charts-website/src/content/docs/**/*.mdoc',
        'packages/ag-charts-website/src/content/docs/**/_examples/**/*',
    ]
---

# Documentation Page Conventions

When editing `.mdoc` documentation files for AG Charts, follow these conventions:

1. **Frontmatter**: Include `title` and `description` (with `$framework` placeholder)
2. **Progressive disclosure**: Start simple, progress to complex — API Reference always at end
3. **Examples first**: Show `chartExampleRunner` before explaining configuration
4. **Code snippets**: Always use `format="snippet"` for configuration objects
5. **UK/British English**: For documentation text (US English for API property names)
6. **Cross-references**: Use `./page-name/` for links between docs pages (e.g., `./tooltips/`, `./axes-types/`). Never use `../page-name/` — all docs pages are siblings under the same base path

## Where to Document a New Feature

-   If the feature is a new top-level chart option (e.g., title, legend, tooltip) or significantly expands an existing one, create a **dedicated page**. Check `nav.json` for existing pages covering the same chart element — if none exists, add one.
-   Don't add interactive examples or detailed configuration docs to pages that are currently text-only layout descriptions or getting-started tutorials — these have a deliberately minimal scope. Link to the dedicated page instead.
-   Getting-started tutorials (`create-a-basic-chart`, `quick-start`) should only show basic usage. Advanced configuration belongs on the feature's own page.

For full reference (page types, Markdoc components, content patterns, writing guidelines), load the `/ag-product:spruce-docs` skill.
