# Prompt

If I resize a column wider and then type in the filter box, the column snaps straight back to its original width. A column I've resized should keep the width I gave it when the filter changes.

# Expected

`columnDefs` and `defaultColDef` stop being recreated on every render — hoisted to module scope or wrapped in `useMemo`.

Wrong: an `onColumnResized` handler storing widths in React state and writing them back into `columnDefs`; a `getColumnState`/`applyColumnState` round-trip on every filter change; remounting the grid with a changed `key`. The grid already holds the widths; the bug is that they are being overwritten.

Wrong: `flex` is changed to `initialFlex`
