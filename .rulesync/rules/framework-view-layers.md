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
-   **A shared-controller fix still needs a React test.** "It lives in the `*Ctrl`, so React is covered by construction" is a hypothesis, not a verification. The shared method runs under React's async mount and reconciliation, whose timing diverges from vanilla's synchronous render — a fix that holds for vanilla can still break under React. Confirm it; don't assert it.
-   **A React `.test.tsx` is the default for any lifecycle, teardown, or state-reset change to a twinned controller**, not an optional extra. Make it a real regression guard: confirm it fails without the fix and passes with it. See [Testing Guide](.rulesync/rules/testing.md) for the `render(<AgGridReact .../>)` pattern.
-   **Skip the React test only when it is genuinely infeasible** — for example, no way to drive the scenario through `AgGridReact`. Then trace the exact React call path that reaches your fix, state that trace, and flag the missing coverage to the reviewer. Never let a green vanilla suite stand in for React.

## Pre-PR checkpoint

Before opening a PR whose diff touches a twinned `*Ctrl` or `*Comp` (the set named above), confirm one of:

1.  A React `.test.tsx` covers the changed behaviour and is a real regression guard (red without the fix, green with it); **or**
2.  A React test is infeasible, and the PR description states the React call path reaching the fix plus the explicit coverage gap.

Treat green vanilla tests alone as **not done** for these files.
