# Prompt

Start Date should be 140px wide initially

# Expected

`suppressSizeToFit: true` and `width: 80` on the `startDate` column definition, leaving the existing
`autoSizeStrategy: { type: 'fitGridWidth' }` in place.

Wrong: giving the column a fixed `width` _instead of_ `suppressSizeToFit`, which `fitGridWidth`
scales anyway; replacing `fitGridWidth` with a different sizing mechanism such as per-column `flex`
plus a scoped `fitCellContents` strategy, which raises `warning #318` and does not work; adjusting
the column after render.

Wrong: adding minWidth and maxWidth, which will prevent later resizing.
