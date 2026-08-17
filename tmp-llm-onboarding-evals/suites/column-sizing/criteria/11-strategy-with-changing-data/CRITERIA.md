# Prompt

When new rows arrive, the size of columns is still based on the old values. The column size should always be based on the current data.

# Expected

The existing `autoSizeStrategy` stays, and `api.autoSizeAllColumns()` (or `autoSizeColumns`) is called when the data updates — from the update callback, from `onRowDataUpdated`, or from a `useEffect` on the data. The strategy alone runs once at `firstDataRendered`.

Wrong: adding `flex`, which conflicts with `autoSizeStrategy` and raises `warning #318`; measuring text in application code; rebuilding `columnDefs` on every update; deleting the strategy in favour of imperative sizing on every render.
