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
        ├── main.ts          # Main example code
        ├── index.html       # HTML template
        ├── example.spec.ts  # Playwright test (required — see below)
        ├── styles.css       # Optional — required when using a wrapper div
        └── data.ts          # Optional data file
```

## Framework Compatibility

All public documentation examples MUST work across all frameworks:

- Vanilla JavaScript/TypeScript
- React
- Angular
- Vue 3

### Writing Framework-Compatible Examples

- Use `document.getElementById('myGrid')` or `document.querySelector('#myGrid')` for grid container references
- Store options in top-level variables
- Keep event handlers as simple function calls
- Avoid complex DOM manipulation
- No external library dependencies

## Validation

```bash
# Validate all examples typecheck
yarn nx validate-examples ag-grid-docs

# Generate framework variants
yarn nx generate-examples ag-grid-docs

# Run Playwright E2E tests for a specific example
./docs-e2e.sh "example-name"

# Run a specific test by name
./docs-e2e.sh "example-name" --grep "test name"

# Run against a specific framework
./docs-e2e.sh "example-name" --framework react
```

## HTML Container Patterns

The docs site renders examples in an iframe with a fixed height. The grid must fill the available space or it collapses to zero height.

### Simple grid (no buttons or controls)

Use a single div with `height: 100%`:

```html
<div id="myGrid" style="height: 100%"></div>
```

### Grid with buttons or controls

Wrap everything in an `example-wrapper` div and add a `styles.css`:

**index.html:**
```html
<div class="example-wrapper">
    <div style="margin-bottom: 1rem">
        <button onclick="onDoSomething()">Do Something</button>
    </div>
    <div id="myGrid"></div>
</div>
```

**styles.css:**
```css
.example-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
}

#myGrid {
    flex: 1 1 0px;
    width: 100%;
}
```

The flexbox layout makes the controls sit at the top and the grid fills the remaining vertical space.

## Example Spec File (Required)

Every example **must** have an `example.spec.ts` file. Without it, the build fails. At minimum, use this placeholder template:

```typescript
import { clickAllButtons, ensureGridReady, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page }) => {
        // PLACEHOLDER - MINIMAL TEST TO ENSURE GRID LOADS WITHOUT ERRORS
        await ensureGridReady(page);
        await waitForGridContent(page);
        await clickAllButtons(page);
        // END PLACEHOLDER
    });
});
```

Replace the placeholder with meaningful assertions when the example demonstrates specific interactive behaviour.

## Best Practices

1. Keep examples focused on a single feature
2. Use realistic but minimal data
3. Include comments explaining key concepts
4. Test in dev server across all frameworks
