# Prompt

The columns don't use the full width of the page — there's empty space to the right of the last column. Fix this.

# Expected

`flex: 1` added to `defaultColDef`, or `flex` set on the individual columns.

Wrong: `autoSizeStrategy: { type: 'fitGridWidth' }`.

Wrong: CSS width or `min-width` changes; `api.sizeColumnsToFit()` wired to a handler when a declarative option would do; computing widths from the container size.
