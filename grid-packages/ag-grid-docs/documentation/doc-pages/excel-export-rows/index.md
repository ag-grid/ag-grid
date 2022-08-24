---
title: "Excel Export - Rows"
enterprise: true
---

Excel Export allows you  to select which rows get exported to Excel.

By default, all the rows in the grid are included in the Excel export. However, you can set which rows are exported and configure how they are rendered within the Excel file.

## Export Selected Rows

By default, all visible rows are exported, but by using the `onlySelected` param, only the selected rows will be exported.

<grid-example title='Excel Export - Selected Rows' name='excel-export-selected-rows' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "excel", "csv"] }'></grid-example>

## Export Multi Line Cells

By default Excel renders every exported value in a cell using a single line. If you need to display a cell value on multiple lines, please set the [Excel Alignment](../excel-export-api/#excelalignment) `wrapText` option as shown in sample below.

<grid-example title='Excel Export - Multi Line' name='excel-export-multi-line' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "excel", "csv"] }'></grid-example>

## Export All Unprocessed Rows

By default, all visible rows are exported, by using the `exportedRows` param, you can configure to export all rows, rather than the default which is after filtering and sorting has been applied.

Note that when all rows is selected, the exported file ignores any filter or sort applied to the data.

<grid-example title='Excel Export - All Rows' name='excel-export-all-rows' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "excel", "csv"] }'></grid-example>

## Pinned Rows

If you'd like to exclude pinned top/bottom rows in AG Grid from the Excel export, please set the `skipPinnedTop` and `skipPinnedBottom` properties to true.

Note the following:

- By default, all pinned rows are exported.
- If `Skip Pinned Top Rows` is checked, the rows pinned at the top will be skipped.
- If `Skip Pinned Bottom Rows` is checked, the rows pinned at the bottom will be skipped.

<grid-example title='Excel Export - Pinned Rows' name='excel-export-pinned-rows' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "excel", "csv"], "exampleHeight": 815 }'></grid-example>

## Next Up

Continue to the next section: [Columns](../excel-export-columns/).