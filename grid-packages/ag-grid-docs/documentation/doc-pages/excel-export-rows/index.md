---
title: "Excel Export - Rows"
enterprise: true
---

Excel Export exports the grid as you see it by default. However, it also allows you to configure which rows should be exported and to configure how rows should be visible within excel.

## Export Selected Rows

By default, all visible rows are exported, but by using the `onlySelected` param, only the selected rows will be exported.

<grid-example title='Excel Export - Selected Rows' name='excel-export-selected-rows' type='generated' options='{ "enterprise": true }'></grid-example>

## Export Multi Line Cells

By default excel renders everything as a single line cell. If there is a requirement to display a cell as multi-line text, the [Excel Alignment](../excel-export-api/#excelalignment) `wrapText` option should be used.
<grid-example title='Excel Export - Multi Line' name='excel-export-multi-line' type='generated' options='{ "enterprise": true }'></grid-example>

## Pinned Rows

If the pinned rows are not relevant to the data, they can be excluded from the export by using the `skipPinnedTop=true` and `skipPinnedBottom=true` params.

Note the following:

- By default, all pinned rows are exported.
- If `Skip Pinned Top Rows` is checked, the rows pinned at the top will be skipped.
- If `Skip Pinned Bottom Rows` is checked, the rows pinned at the bottom will be skipped.

<grid-example title='Excel Export - Pinned Rows' name='excel-export-pinned-rows' type='generated' options='{ "enterprise": true, "exampleHeight": 815 }'></grid-example>
