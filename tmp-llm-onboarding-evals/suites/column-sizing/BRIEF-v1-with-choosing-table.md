# AG Grid column sizing: the mechanisms and how they relate

Column sizing in AG Grid is not one feature but several, and they are largely mutually exclusive.
Most sizing problems come from combining two of them rather than choosing one. This page describes
what each mechanism does, which ones conflict, and which of the conflicts the grid will tell you
about.

## The mechanisms

**Per-column, declarative**

- `colDef.width` — a fixed pixel width. If neither `width` nor `flex` is set a column is 200px.
- `colDef.flex` — a unitless share of the space left over after fixed-width columns are laid out.
  A column with `flex: 2` ends up twice as wide as one with `flex: 1`. It is a ratio, never a pixel
  value.
- `colDef.minWidth` / `colDef.maxWidth` — clamps, respected by every mechanism including flex.
- `colDef.initialWidth` / `colDef.initialFlex` — the same, but applied **only when the column is
  created** and ignored on subsequent column-definition updates.
- `colDef.resizable` (default `true`) — whether the user can drag this column's edge.
- `colDef.suppressSizeToFit` — exempt this column from fit-to-grid-width sizing. The column keeps
  its own width while everything else is scaled.
- `colDef.suppressAutoSize` — exempt this column from fit-to-content sizing.

**Grid-level, declarative**

`gridOptions.autoSizeStrategy` runs once, automatically, and comes in three types:

- `{ type: 'fitGridWidth' }` — scale the columns to the grid's width, preserving the ratios between
  their default widths. Takes `defaultMinWidth`, `defaultMaxWidth` and `columnLimits`.
- `{ type: 'fitProvidedWidth', width }` — the same against a width you supply.
- `{ type: 'fitCellContents' }` — measure the rendered cells and size each column to its content.
  Takes `skipHeader`, `colIds`, `columnLimits` and `scaleUpToFitGridWidth`.

Two options on `fitCellContents` are worth knowing because they remove the need to write code:

- `scaleUpToFitGridWidth: true` — after content-fitting, proportionally scale the columns up to
  consume any space left over. This is how you get "sized to content, but still fills the width"
  without measuring anything yourself.
- `applyToUiActions: true` — make the column menu's autosize actions reuse this strategy's options
  instead of their defaults.

**Imperative**

- `api.sizeColumnsToFit(params?)` — fit to the grid width on demand.
- `api.autoSizeColumns(colIds)` / `api.autoSizeAllColumns()` — fit to cell contents on demand.
  Note these take no `scaleUpToFitGridWidth` equivalent.
- `api.getColumnState()` / `applyColumnState()` / `resetColumnState()` — read and write column
  state, which includes both `width` and `flex` per column.

**State**

- `initialState.columnSizing` and the `onStateUpdated` event — the grid's own persistence route.
- `onColumnResized` — fires as a column is dragged, with a `finished` flag for the end of the drag.

## How they relate

**Flex beats width, including inherited flex.** A column's `width` is only consulted when its
`flex` is null or zero. Because `defaultColDef` is merged into every column, a grid with
`defaultColDef: { flex: 1 }` will silently ignore a `width` you add to one column. To give one
column a fixed width in a flex grid, set `flex: 0` on it alongside the width, or clamp it with
equal `minWidth` and `maxWidth`.

**`flex` and `autoSizeStrategy` conflict, and the grid says so.** Using both raises
`warning #318`. This is the only sizing conflict the grid declares — and you will only see it if
you have called `enableDevValidations()`, which is not on by default.

**Every imperative sizing call silently clears flex.** `sizeColumnsToFit`, `autoSizeColumns` and
`autoSizeAllColumns` all set actual widths, and setting a width clears that column's flex. There is
no warning, because there is no conflict: flex simply stops existing from that point on. A column
whose flex was cleared this way gets it back if the column definitions are later replaced.

**`flex` is reactive; `autoSizeStrategy` is not.** Flex re-divides the available space continuously
— on container resize, on columns being shown, hidden or pinned. `autoSizeStrategy` fires exactly
once: at grid initialisation for the fit-to-width types, and when the first row renders for
`fitCellContents`. It is also an _initial_ grid option, so changing the prop afterwards does
nothing. If the sizing has to survive later data arriving, either use flex or call the matching API
method again when the data changes.

**Do not re-fit on resize; that is what flex is for.** `sizeColumnsToFit` should not be called
rapidly in response to window resize events or an animating container — it causes the scrollbar to
flicker. Column flex produces smoother results and is the intended answer for "columns should
always fill the width". Debouncing the call treats the symptom rather than the cause.

**Content fitting measures rendered rows only.** Both `fitCellContents` and `autoSizeAllColumns`
measure the cells currently in the DOM, which is the rows on screen plus a small buffer. This is by
design: it keeps sizing O(visible) rather than O(dataset), and it is why the grid does not need to
know how your data is formatted. If you need off-screen rows considered, `suppressColumnVirtualisation`
covers the horizontal case; measuring text yourself with a canvas or cloned DOM nodes is not a
supported approach and will disagree with the grid's own measurements about padding, borders and
theme fonts.

**Widths are grid state, not application state.** The grid holds current widths and exposes them
through column state. Persisting them means saving that state and restoring it — through
`initialState` or `applyColumnState` — not mirroring widths into your own store. An application
that keeps its own width map and regenerates `columnDefs` from it has taken over ownership, and
must then keep that store authoritative: adding `flex` to such a grid overrides every stored width on the next render.

**React: column definitions rebuilt every render re-apply their sizing.** `colDef.flex` and
`colDef.width` are re-applied whenever column definitions are updated, and a new array identity
from an unrelated re-render counts as an update. A user's manual resize will therefore be undone by
the next state change unless the definitions have a stable identity (module scope or `useMemo`), or
you use `initialFlex` / `initialWidth`, which are applied only at creation.

## Choosing

- Columns should always fill the available width → `flex`.
- Columns should fit their content → `autoSizeStrategy: { type: 'fitCellContents' }`.
- Both → `fitCellContents` with `scaleUpToFitGridWidth: true`.
- One column exempt from the above → `suppressSizeToFit` or `suppressAutoSize` on that column.
- One column at a fixed size in a flex grid → `width` plus `flex: 0`.
- Content fitting that keeps up with changing data → the strategy plus `autoSizeAllColumns()` when
  the data changes.
- Widths that survive a reload → save and restore the grid's column state.

Reach for a second mechanism only when the first genuinely cannot express what you need, and when
you do, remove the first.
