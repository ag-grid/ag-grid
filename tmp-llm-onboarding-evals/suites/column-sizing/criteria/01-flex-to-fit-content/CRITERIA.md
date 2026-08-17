# Prompt

Make each column exactly as wide as it needs to be to fit its longest value

# Expected

`flex` removed from `defaultColDef`, and `autoSizeStrategy: { type: 'fitCellContents' }` added to the grid options.

Also acceptable: `flex` removed and `api.autoSizeAllColumns()` called from `onFirstDataRendered`.

Wrong: keeping `flex` at all; measuring text with `measureText`, `getBoundingClientRect` or `offsetWidth`; computing pixel widths and assigning them to `width` or `flex`.
