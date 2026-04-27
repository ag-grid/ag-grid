---
targets: ['*']
description: 'Working with examples in AG Grid documentation'
globs: ['_examples/**/*', 'documentation/**/_examples/**/*']
---

# Examples Guide

This guide covers working with examples in the AG Grid documentation.

## Overview

Examples demonstrate AG Grid features in the documentation. They are automatically transformed from vanilla TypeScript into React, Angular, and Vue variants.

## Example Structure

Examples are located in `_examples/` directories within documentation:

```
documentation/ag-grid-docs/src/content/docs/feature-name/
├── index.mdoc           # Documentation page
└── _examples/
    └── example-name/
        ├── main.ts      # Main example code
        ├── index.html   # HTML template
        ├── styles.css   # Optional styles
        └── data.ts      # Optional data file
```

## Framework Compatibility

All public documentation examples MUST work across all frameworks:

-   Vanilla JavaScript/TypeScript
-   React
-   Angular
-   Vue 3

### Writing Framework-Compatible Examples

-   Use `document.getElementById('myGrid')` or `document.querySelector('#myGrid')` for grid container references
-   Store options in top-level variables
-   Keep event handlers as simple function calls
-   Avoid complex DOM manipulation
-   No external library dependencies

## Validation

```bash
# Validate all examples typecheck
yarn nx validate-examples ag-grid-docs

# Generate framework variants
yarn nx generate-examples ag-grid-docs
```

## Best Practices

1. Keep examples focused on a single feature
2. Use realistic but minimal data
3. Include comments explaining key concepts
4. Test in dev server across all frameworks
