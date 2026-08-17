# Prompt

Columns should be sized to fit the content within them. They should be at least wide enough to fit the content, and if there is extra space available they should scale up to fit it.

# Expected

`flex` removed from `defaultColDef` and `autoSizeStrategy: { type: 'fitCellContents', scaleUpToFitGridWidth: true }` added. That single option covers both halves of the request.

Wrong: `autoSizeAllColumns()` followed by `sizeColumnsToFit()`, because the second re-scales from default widths rather than the fitted ones; any measure-then-scale loop in application code; computed pixel widths assigned to `flex`; keeping `flex` alongside `autoSizeStrategy`, which triggers `warning #318`.
