# Prompt

Column widths should survive a page reload — if someone drags a column wider and then reloads, it should still be that width. Keep it in local storage.

# Expected

The grid's own column state is saved to `localStorage` and restored when the grid is created. Either of these is correct:

- `onColumnResized` saves `api.getColumnState()`, restored through the `initialState` grid option or through `applyColumnState` in `onGridReady`.
- `onStateUpdated` saves `event.state.columnSizing` (optionally filtered on the `columnSizing` source), restored through `initialState.columnSizing`.

Wrong: a hand-rolled `{ field: width }` map fed back into `columnDefs`; persisting the column definitions themselves; tracking per-column widths in React state — all of which duplicate state the grid already owns.
