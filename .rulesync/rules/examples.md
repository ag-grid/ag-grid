---
root: false
targets: ['*']
description: 'Example conventions for AG Charts — loads /example skill for full guide'
globs: ['**/_examples/**/*', 'packages/ag-charts-website/src/content/gallery/**/*']
---

# Example Conventions

When creating or editing AG Charts examples, follow these conventions:

1. **Module registration**: Register modules with `ModuleRegistry` before chart creation
2. **Object-based axes** (v13+): Use `axes: { x: { type: 'category' }, y: { type: 'number' } }` — not legacy array syntax
3. **Container pattern**: Use `document.getElementById('myChart')` for container setup
4. **Top-level functions**: Event handlers and chart update functions must be top-level
5. **Framework compatible**: All public docs examples MUST work across all frameworks (NO `@ag-skip-fws`)
6. **Controls in HTML**: Place controls BEFORE chart div using this structure:
    ```html
    <div class="example-controls">
        <div class="controls-row">
            Label Text:
            <button onclick="handler('value')"><code>'value'</code></button>
        </div>
    </div>
    ```

## API surface verification

Before writing any chart code in an example or plunker, verify every API surface against `packages/ag-charts-types/src` — never trust training data for AG Charts. The rule applies to **all** shapes you touch, not just top-level options:

-   **Option properties** — top-level option names, nesting, value shapes.
-   **Event payload fields** — before reading `ev.foo` in a listener, grep the relevant `Ag...Event` interface (e.g. `AgSelectionChangeEvent`, `AgNodeClickEvent`). A throwing listener can make the library look broken.
-   **Listener callback arguments** — `itemStyler`, `formatter`, `label` callbacks each have their own `*Params` interface.
-   **Chart instance methods** — verify against `AgChartInstance` / `AgTypedChartInstance` before calling something that sounds plausible (e.g. `getSelection()` does not exist).

When a type definition is not obvious, cross-check with a working example under `packages/ag-charts-website/src/content/docs/*/_examples/` or `packages/ag-charts-website/src/content/gallery/_examples/`. Do this _before_ writing the code, not after the user reports a bug.

## Verification gate — no behaviour claims without browser evidence

Any claim about user-visible behaviour in a plunker or example requires browser evidence captured during the current session before the claim is made:

-   "This works" / "it renders correctly"
-   "This is fixed"
-   "This reproduces the bug"
-   "Selection / hover / click behaves as expected"

Evidence = a screenshot of the relevant state, or a console-log capture showing the expected output, taken via the Chrome extension MCP tools (`mcp__claude-in-chrome__*`) against staging or a plunker URL. Reading source code, reviewing the diff, or reasoning about the change is **not** evidence of runtime behaviour.

If the Chrome extension is not connected, say so explicitly and state what was not verified — do not assert behaviour.

When the user gives you a reference plunker that "works" and yours "doesn't", open both in the browser first and compare observed behaviour before theorising about differences in the code. Static diffs can mislead — a listener that throws at runtime is only visible from the browser console.

## Regenerating Examples After Source Changes

The `generate-examples` target depends on ~800 per-example sub-tasks. `--skip-nx-cache` on the parent does NOT always invalidate child caches.

To force a clean regeneration of specific examples:

1. Delete the specific example's output across all framework dirs:
   `rm -rf dist/packages/ag-charts-website/{reactFunctional,reactFunctionalTs,angular,vue3,vanilla,typescript}/<page>/`
2. Run the full generation: `NX_DAEMON=false yarn nx generate-examples ag-charts-website --skip-nx-cache`
3. Or for a full clean rebuild: `yarn nx clean && yarn nx generate-examples ag-charts-website`

For full reference (guidelines, validation, framework generation, Plnkr integration), load the `/ag-product:example` skill.
