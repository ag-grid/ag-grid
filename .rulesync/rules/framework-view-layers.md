---
globs:
  - 'packages/ag-grid-community/src/rendering/**'
  - 'packages/ag-grid-community/src/headerRendering/**'
  - 'packages/ag-grid-community/src/gridBodyComp/**'
  - 'packages/ag-grid-community/src/gridComp/**'
  - 'packages/ag-grid-enterprise/src/rowHierarchy/rendering/**'
  - 'packages/ag-grid-react/src/**'
alwaysApply: false
targets: ['*']
---

# Shared Controllers vs the React View Layer

The community core is framework-agnostic. Most cells/rows/headers split into a shared **controller** (`*Ctrl`, e.g. `CellCtrl`, `RowCtrl`, `HeaderCellCtrl`) and a **view** (`*Comp`) that handles rendering, mounting, refresh, and teardown.

There are **two** view implementations, not one per framework:

-   **Vanilla `*Comp.ts`** — used directly by the vanilla grid **and by Angular and Vue**. Angular/Vue only wrap user-supplied components (cell renderers/editors); they reuse the vanilla view layer.
-   **React `*Comp.tsx`** — React re-implements the view layer in JSX under `packages/ag-grid-react/src/reactUi/` (e.g. `cellComp.tsx` + `showJsRenderer.tsx`, `rowComp.tsx`, `gridComp.tsx`), driving mounting/teardown through React reconciliation instead.

So a fix placed in a vanilla `*Comp.ts` reaches vanilla, Angular, and Vue — but **NOT** React, which has its own `reactUi` equivalent. This asymmetry is a recurring source of React-only regressions.

React re-implements the **core grid scaffolding** — cells, rows, row containers, headers, grid body, grid root — plus the **group cell renderer** (`reactUi/cellRenderer/groupCellRenderer.tsx`), whose controller lives in `ag-grid-enterprise` (`rowHierarchy/rendering/`). Everything else — filters, tool panels, status-bar panels, the advanced filter, pagination, the detail cell renderer, etc. — has **no** React twin: React renders those via the shared vanilla component system, so a fix there already reaches every framework. This rule is scoped to the twinned set for that reason.

## Rules

-   **Default to the controller.** Behaviour that is not purely view-specific — lifecycle, teardown, state resets, event wiring, ordering — belongs in the shared `*Ctrl`, not in a `*Comp`. There it holds for vanilla, Angular, Vue, and React by construction.
-   **If you must touch a `*Comp`, check the React twin.** When you change vanilla `*Comp.ts`, find the matching `packages/ag-grid-react/src/reactUi/**` implementation and apply the equivalent change (or relocate the logic to the `*Ctrl`). The reverse also holds: a fix in `reactUi` may need the vanilla `*Comp.ts` too.
-   **Ask "is this the right layer?" before "is this the right file?"** Localising a bug to the file where you first see the symptom is the trap; the symptom often surfaces in the vanilla view while the correct fix point is the shared controller.

## Verification

-   **Vanilla behavioural tests do not exercise React.** The behavioural suite defaults to the vanilla grid (which Angular and Vue share), so green vanilla tests say nothing about React's `reactUi` layer.
-   **Add (or explicitly reason about) a React `.test.tsx` case** for any view-layer behaviour, since React is the one implementation the vanilla tests miss, and its async mount + reconciliation diverges most. See [Testing Guide](.rulesync/rules/testing.md) for the `render(<AgGridReact .../>)` pattern.
-   If you knowingly ship without React coverage, say so and flag the gap for the reviewer rather than letting green vanilla tests imply full coverage.
