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

### Hand-authored `provided/` framework variants

Examples are generated from `main.ts` by `generate-examples` — this is the default and strongly
preferred path. A single `main.ts` yields all framework variants automatically, so there is
nothing to keep in sync.

Hand-authored `provided/` variants are a **last resort**, used only when an example cannot be
generated cleanly (e.g. it needs framework-specific idioms the generator can't express). Do **not** add a
`provided/` folder to work around a fixable generation issue — first try to make `main.ts`
generate correctly. Prefer deleting a `provided/` variant and reverting to pure generation if a
later change makes generation viable.

```
_examples/example-name/
├── main.ts                              # vanilla source (generation input)
└── provided/                            # last resort — only when generation can't express it
    ├── reactFunctionalTs/index.tsx
    ├── angular/app.component.ts
    └── vue3/main.ts
```

When a `provided/` folder **does** exist, its files are **not** overwritten by
`generate-examples` — they are the source of truth for their framework. So when you change
`main.ts` (modules, `columnDefs`, grid options, handlers, or the HTML controls), you **must**
make the equivalent change in every `provided/` variant so all frameworks stay consistent. Search
for a `provided/` folder before considering an example edit complete. Watch for per-framework
shape differences:

- **React** — `columnDefs` is typed React state (e.g. `useState<(ColDef | ColGroupDef)[]>`); grid
  options are JSX props; modules are passed via `AgGridProvider modules={...}` (no
  `ModuleRegistry`).
- **Angular** — `columnDefs` is a typed class field; grid options are template bindings
  (`[option]="..."`); modules via `ModuleRegistry.registerModules`.
- **Vue** — `columnDefs` is a typed `ref`; grid options are template bindings (`:option="..."`);
  modules via `ModuleRegistry.registerModules`. Note comments inside the `template:` string are
  in a template literal, but `setup()` body comments are ordinary code — don't escape backticks
  there.

After editing, run `yarn nx generate-examples ag-grid-docs` and
`yarn nx format --sort-root-tsconfig-paths=false` to confirm every variant still typechecks and is
formatted.

## Deleting or renaming an example

Grep the whole docs tree for references first, not just the parent page. Examples may be referenced from elsewhere, and an orphaned reference fails the build:

```bash
grep -r 'name="example-name"' documentation/ag-grid-docs/src/content/docs/ --include='*.mdoc'
```

Examples are referenced through the `{% gridExampleRunner %}` tag, so its `name` attribute is what to search for.

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

Every example **must** have an `example.spec.ts` file — without it, the build fails.

When you **add a new example** or **create a new doc page** with examples, the example is not complete until its `example.spec.ts` contains **meaningful** assertions — not the placeholder template — and passes across every framework. A placeholder that only proves the grid mounts asserts nothing about the behaviour the example exists to demonstrate.

Follow these steps (the `docs-e2e-tests` skill walks through them):

1. Read the page's `index.mdoc` and the example source to understand what the example demonstrates.
2. Write assertions that exercise that specific behaviour (not just that the grid loads).
3. Validate across all frameworks, e.g. `./docs-e2e.sh "<example-name>"`.

See [docs-e2e-tests/SKILL.md](../skills/docs-e2e-tests/SKILL.md) for the full procedure.

## Best Practices

1. Keep examples focused on a single feature
2. Use realistic but minimal data
3. Keep comments to a minimum — only annotate code when the comment genuinely adds value (a non-obvious concept or gotcha); do not narrate what the code plainly does
4. Test in dev server across all frameworks
