# Column sizing — mechanisms, relationships, and candidate evaluations

Grounded in `documentation/ag-grid-docs/src/content/docs/column-sizing/index.mdoc` and
`packages/ag-grid-community/src` (`interfaces/autoSize.ts`, `entities/agColumn.ts`,
`columns/columnFlexService.ts`, `columns/columnStateUtils.ts`,
`columnAutosize/columnAutosizeService.ts`, `validation/rules/colDefValidations.ts`).

---

## 1. The mechanisms

**Per-column, declarative**

- `colDef.width` — fixed pixel width. Default 200px if neither `width` nor `flex` is set.
- `colDef.flex` — unitless share of _remaining_ space after fixed-width columns are laid out.
- `colDef.minWidth` / `maxWidth` — clamps, applied to every mechanism including flex.
- `colDef.initialWidth` / `initialFlex` — same, but applied **only at column creation**; ignored on
  column-definition updates.
- `colDef.resizable` (default `true`), `suppressSizeToFit`, `suppressAutoSize` — opt individual
  columns out of user resizing, fit-to-grid and fit-to-content respectively.

**Grid-level, declarative, one-shot**

- `gridOptions.autoSizeStrategy`, three types:
    - `fitGridWidth` — scale columns to the grid's width, preserving their default-width ratios;
      takes `defaultMinWidth`/`defaultMaxWidth`/`columnLimits`.
    - `fitProvidedWidth` — same but against a supplied `width` number.
    - `fitCellContents` — measure rendered cells; takes `skipHeader`, `colIds`, `columnLimits`,
      `scaleUpToFitGridWidth`, `applyToUiActions`.
- `scaleUpToFitGridWidth` (on `fitCellContents` only) — after content-fitting, proportionally scale
  up to consume leftover space. **This is the single option that satisfies "fit the content _and_
  fill the width", and it is the reference answer the `column-sizing` runs all missed.**
- `applyToUiActions` — makes the column-menu autosize actions reuse the strategy's options.

**Grid-level, declarative, ambient**

- `skipHeaderOnAutoSize`, `autoSizePadding` (default 20), `colResizeDefault: 'shift'`,
  `suppressColumnVirtualisation` (required to autosize off-screen columns).

**Imperative**

- `api.sizeColumnsToFit(params?)` — fit-to-grid on demand.
- `api.autoSizeColumns(colIds, skipHeader?)` / `api.autoSizeAllColumns(skipHeader?)` —
  fit-to-content on demand. Note these API methods take **no** `scaleUpToFitGridWidth`.
- `api.getColumnState()` / `applyColumnState()` / `resetColumnState()` — read and write
  `{ colId, width, flex }` among other fields.

**State / persistence**

- `initialState.columnSizing`, `onStateUpdated` — grid-managed persistence.
- `onColumnResized` (`finished`, `flexColumns`, `source`) — the event to persist from.

---

## 2. The relationships that matter

**Precedence.** Flex beats width. A column with both gets flex; `width` is only consulted when
`flex == null || flex <= 0` (`agColumn.ts:306-310`, `columnStateUtils.ts:391-398`). This is why
`defaultColDef: { flex: 1 }` silently defeats a `width: 80` on an individual column — to pin one
column you must also set `flex: 0` (or `null`) on it.

**Declared conflict (warned).** `colDef.flex` + `gridOptions.autoSizeStrategy` → `warning #318`
(`colDefValidations.ts:198-208`). This is the only sizing conflict the grid declares, and it is only
visible if `enableDevValidations()` is called — which 1 of our 51 apps did.

**Undeclared exclusivity (silent).** Every imperative sizing call clears flex as a side effect:
`sizeColumnsToFit`, `autoSizeColumns` and `autoSizeAllColumns` all route through
`setActualWidth`, which nulls `flex` for any source other than `'flex'`/`'gridInitializing'`
(`agColumn.ts:778-792`). So `flex` plus `autoSizeAllColumns()` doesn't warn — flex just stops
existing after the first call, and nothing says so.

**One-shot versus reactive.** `flex` is continuously reactive — it re-divides space on every
container resize, column show/hide and pin. `autoSizeStrategy` fires **once**: `fitGridWidth` and
`fitProvidedWidth` on grid init, `fitCellContents` on `firstDataRendered`
(`columnAutosizeService.ts:48-68, 560-593`). It is also an _initial_ grid option, so changing the
prop later does nothing. Anything that must survive window resizes or later data arrivals therefore
needs either flex or an explicit API re-invocation.

**Continuous re-fitting is flex's job, not the API's.** `sizeColumnsToFit` documents this
explicitly: *"it is not recommended to call this method rapidly e.g. in response to window resize
events or as the container size is animated. This can cause the scrollbar to flicker. Use column
flex for smoother results."* (`api/gridApi.ts:605-609`). So responding to a container-resize signal
— `onGridSizeChanged`, a `window` resize listener or a `ResizeObserver` — by calling
`sizeColumnsToFit` is the documented anti-pattern, and `flex` is the documented answer. This is the
single most useful exclusivity rule in the whole feature, and nothing in the product enforces it.

**Content-fitting against empty data.** The same JSDoc records a related trap: when cell data types
are being inferred and `rowData` is initially empty or not yet set, the sizing happens
asynchronously once row data arrives, unless `cellDataType: false` is set on `defaultColDef`
(`api/gridApi.ts:611-614`). Relevant to any app that renders the grid before its fetch resolves.

**Flex is cleared by the user, but restored by React.** Manual resize clears flex on that column.
But `colDef.flex` (unlike `initialFlex`) is re-applied on every column-definition update
(`columnFlexService.ts:222-230`), so a new `columnDefs` array identity from an unrelated re-render
wipes the user's widths. `initialFlex`/`initialWidth` are the create-only escape hatch.

**Ownership.** Column widths are grid-owned by default and there is normally no reason to change
that: the grid holds current widths, `getColumnState`/`applyColumnState` and `initialState` cover
persistence. An app that mirrors widths into React state and regenerates `columnDefs` from it is
taking on ownership deliberately — and is then fighting both flex and every autosize API.

---

## 3. Candidate evaluations

Each trio is **setup → the literal prompt the implementing agent receives → the literal expected
result handed to the verifier.**

**Prompt framing.** A prompt pins the _outcome_ unambiguously and never the _mechanism_ — it names
no API, option or feature. Symptom framing ("it snaps back when I filter") is used only for the four
criteria that test diagnosis, 4, 7, 11 and 12, where working out the cause is the task; even there
the last sentence states the desired end state. Everywhere else the prompt states the goal directly,
because a symptom underdetermines it and a defensible alternative reading would be scored as a
failure it isn't.

**Expected-result framing.** Named APIs and options, with every acceptable alternative listed. The
verifier additionally gets a standing instruction that the change should be simple and add no more
code than the task needs — the expected text carries the specifics, not that instruction.

Two entries are marked ⚠ where the setup's premise needs confirming in a browser before the template
is built.

### A. Adopting one mechanism implies dropping another

**1. Flex → fit content** _(the known failure, kept as the control)_

- `defaultColDef: { flex: 1 }`, no widths anywhere.
- **Prompt:** "Make each column exactly as wide as it needs to be to show its longest value without truncating, and no wider."
- **Expected:** `flex` removed from `defaultColDef`, and `autoSizeStrategy: { type: 'fitCellContents' }` added to the grid options. Also acceptable: `flex` removed and `api.autoSizeAllColumns()` called from `onFirstDataRendered`. Wrong: keeping `flex` at all; measuring text with `measureText`, `getBoundingClientRect` or `offsetWidth`; computing pixel widths and assigning them to `width` or `flex`.

**2. Flex → fit content _and_ fill the width**

- `defaultColDef: { flex: 1 }`.
- **Prompt:** "Each column should be wide enough to show its longest value without truncating. If that leaves empty space at the right-hand edge, the columns should then be scaled up proportionally so the table fills the full width."
- **Expected:** `flex` removed and `autoSizeStrategy: { type: 'fitCellContents', scaleUpToFitGridWidth: true }` added. That single option covers both halves of the request. Wrong: `autoSizeAllColumns()` followed by `sizeColumnsToFit()` (the second re-scales from default widths, not the fitted ones); any measure-then-scale loop in application code; computed pixel widths assigned to `flex`; keeping `flex` alongside `autoSizeStrategy`, which triggers `warning #318`.

**3. Fit-to-grid strategy → fit-to-content strategy**

- `autoSizeStrategy: { type: 'fitGridWidth', defaultMinWidth: 100 }`.
- **Prompt:** "Columns are currently scaled to fill the width of the grid, which makes some of them much wider than their contents. Size each column to its own content instead, even if the table then doesn't fill the width."
- **Expected:** the existing `autoSizeStrategy.type` changes from `'fitGridWidth'` to `'fitCellContents'`, in place. Retaining or dropping `defaultMinWidth` are both fine. Wrong: adding `flex`; adding `sizeColumnsToFit`, `autoSizeColumns` or `autoSizeAllColumns` calls alongside it; keeping both behaviours; adding `scaleUpToFitGridWidth`, which reintroduces the width-filling the prompt asked to drop.

**4. Imperative fit → reactive fit** _(diagnosis)_

- `onFirstDataRendered` calls `api.sizeColumnsToFit()`; no flex, no strategy.
- **Prompt:** "The columns fill the width when the page first loads, but when I resize the browser window they keep their old widths and I'm left with either a gap on the right or a horizontal scrollbar. They should always fill the width."
- **Expected:** the `onFirstDataRendered` handler is removed and `flex: 1` is set on `defaultColDef`. This is the only correct answer: `sizeColumnsToFit` documents that it should not be called rapidly in response to resize, because the scrollbar flickers, and names column flex as the remedy (`api/gridApi.ts:605-609`). Wrong, and specifically including the near-misses: re-invoking `api.sizeColumnsToFit()` from `onGridSizeChanged`, which fires continuously while the window is dragged and is the documented anti-pattern — as is the same call behind a debounce or throttle, which treats the symptom rather than the cause; `window.addEventListener('resize')`; `ResizeObserver`; storing the container width in React state; re-rendering the grid on resize.

**5. Default widths → fill the container**

- No sizing configuration at all; grid narrower than its container, whitespace on the right.
- **Prompt:** "The columns don't use the full width of the page — there's empty space to the right of the last column. The columns should share out the whole width between them."
- **Expected:** `flex: 1` added to `defaultColDef`, or `flex` set on the individual columns. Also acceptable: `autoSizeStrategy: { type: 'fitGridWidth' }`. Wrong: CSS width or `min-width` changes; `api.sizeColumnsToFit()` wired to a handler when a declarative option would do; computing widths from the container size.

**6. Flex → one pinned-width column**

- `defaultColDef: { flex: 1 }`, columns include a four-digit `id`.
- **Prompt:** "The ID column only ever holds a four-digit number but it's as wide as everything else. It should be exactly 80 pixels and stay that way, while the remaining columns carry on sharing out the rest of the width."
- **Expected:** on the `id` column definition, `width: 80` **together with** `flex: 0` (or `flex: null`), because `flex` is inherited from `defaultColDef` and takes precedence over `width`. Equally acceptable: `minWidth: 80, maxWidth: 80` on that column, with or without `flex`. Wrong: `width: 80` alone, which is silently ignored; removing `flex` from `defaultColDef` and re-adding it to every other column; CSS.

### B. Grid ownership vs application ownership

**7. Grid-owned widths that must survive a re-render** _(diagnosis)_

- `defaultColDef: { flex: 1 }`, with `columnDefs` and `defaultColDef` both built inline in the component body, alongside a filter `useState`.
- **Prompt:** "If I drag a column wider and then type in the filter box, the column snaps straight back to its original width. A column I've resized should keep the width I gave it when the filter changes."
- **Expected:** `columnDefs` and `defaultColDef` stop being recreated on every render — hoisted to module scope or wrapped in `useMemo` — and/or `flex` is changed to `initialFlex`, which is applied only at column creation. A few lines, no new state. Wrong: an `onColumnResized` handler storing widths in React state and writing them back into `columnDefs`; a `getColumnState`/`applyColumnState` round-trip on every filter change; remounting the grid with a changed `key`. The grid already holds the widths; the bug is that they are being overwritten.

**8. Persisting user resizes**

- `defaultColDef: { flex: 1 }`, no persistence.
- **Prompt:** "Column widths should survive a page reload — if someone drags a column wider and then reloads, it should still be that width. Keep it in local storage."
- **Expected:** `onColumnResized` saves `api.getColumnState()` to `localStorage`, and the saved state is restored either through the `initialState` grid option or through `applyColumnState` in `onGridReady`. Wrong: a hand-rolled `{ field: width }` map fed back into `columnDefs`; persisting the column definitions themselves; tracking per-column widths in React state — all of which duplicate state the grid already owns.

**9. App-owned widths that must be preserved**

- Widths held in React state, written into `columnDefs`, with `onColumnResized` writing back and persisting — the application genuinely owns them.
- **Prompt:** "There's empty space to the right of the last column. The columns should be widened to fill it — and as now, whatever widths end up in place must still be there after a reload."
- **Expected:** the application's stored widths remain the source of truth, and the widths produced by filling the space end up in that store. For example `api.sizeColumnsToFit()` called once, with the existing `onColumnResized` handler capturing the resulting widths. Wrong: `flex: 1` added to `defaultColDef` or to the column definitions, which overrides every stored width on the next render and leaves the existing persistence as dead code; `autoSizeStrategy`, which sizes the columns without the store ever learning the new widths; removing the existing ownership model.

**10. Resetting to grid defaults**

- Sizes persisted to `localStorage` and restored through `initialState`.
- **Prompt:** "Add a 'Reset columns' button that puts the widths back to the application's own defaults, and make sure they're still the defaults after a reload."
- **Expected:** a button whose handler calls `api.resetColumnState()` and removes the saved `localStorage` entry. Wrong: `location.reload()`; remounting the grid with a changed `key`; rebuilding `columnDefs` from a saved copy of the originals; `applyColumnState` with a hand-built list of default widths.

### C. One-shot vs reactive

**11. Strategy plus changing data** _(diagnosis)_

- `autoSizeStrategy: { type: 'fitCellContents' }` and a feed that appends rows every few seconds.
- **Prompt:** "Rows keep arriving with longer values than the ones already on screen, and they get truncated. The columns should grow to fit the new content as it arrives."
- **Expected:** the existing `autoSizeStrategy` stays, and `api.autoSizeAllColumns()` (or `autoSizeColumns`) is called when the data updates — from the update callback, from `onRowDataUpdated`, or from a `useEffect` on the data. The strategy alone runs once at `firstDataRendered`. Wrong: adding `flex`, which conflicts with `autoSizeStrategy` and raises `warning #318`; measuring text in application code; rebuilding `columnDefs` on every update; deleting the strategy in favour of imperative sizing on every render.

**12. Strategy plus late-loading data** ⚠ _premise to confirm: that `fitCellContents` runs against the initial empty array and is never re-applied_

- `autoSizeStrategy: { type: 'fitCellContents' }`, `rowData` initialised to `[]` and replaced when a simulated fetch resolves.
- **Prompt:** "The data is fetched after the page loads. When it arrives the columns are all at the same default width instead of being sized to their content."
- **Expected:** the content sizing runs against the real data — either by passing `null`/`undefined` rather than `[]` until the fetch resolves so the grid's first render is the real data, or by calling `api.autoSizeAllColumns()` once the data arrives. Wrong: adding `flex` on top of the strategy; measuring content in application code; delaying the grid's mount behind a timer.

### D. Additive traps — the mechanism is already there

**13. Constraining an existing strategy**

- `autoSizeStrategy: { type: 'fitCellContents' }`, one long free-text `comments` column.
- **Prompt:** "The Comments column comes out so wide that it pushes the other columns off the screen. It should never be wider than 300 pixels; leave everything else as it is."
- **Expected:** either `columnLimits: [{ colId: 'comments', maxWidth: 300 }]` added to the existing `autoSizeStrategy`, or `maxWidth: 300` on the comments column definition. One line either way. Wrong: a cell renderer that truncates; CSS `max-width` or `text-overflow`; clamping the width after render via `setColumnWidths` or `applyColumnState`; changing the strategy type.

**14. Fit-to-grid with an exception**

- `autoSizeStrategy: { type: 'fitGridWidth' }`.
- **Prompt:** "Every column except Date should be scaled to fill the width of the grid. Date should stay at its natural width."
- **Expected:** `suppressSizeToFit: true` on the date column definition. Wrong: giving date a fixed `width`, which `fitGridWidth` scales anyway; `minWidth`/`maxWidth` pinning as a substitute; switching the grid to a different sizing mechanism; adjusting the column after render.

**15. Menu action inconsistent with the strategy** ⚠ _premise to confirm: that the autosize menu action is reachable in this app's edition_

- `autoSizeStrategy: { type: 'fitCellContents', scaleUpToFitGridWidth: true }` with the column menu enabled.
- **Prompt:** "When I pick 'Autosize All Columns' from the column menu, the columns come out narrower than they are when the page first loads. The menu action should produce the same layout as the initial sizing."
- **Expected:** `applyToUiActions: true` added to the existing `autoSizeStrategy`. Wrong: replacing the menu item through `getMainMenuItems`; adding a custom menu item that calls `autoSizeAllColumns` and then re-scales; re-fitting from `onColumnResized`; duplicating the scale-up logic in application code.
