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

By default, the grid exports grid rows after filtering and sorting has been applied. This means that if you’ve filtered the grid, only the filtered rows will be exported in the order they appear in visually at the time of export. 

You can override this and export all rows instead of only the filtered rows by setting the `exportedRows` param to ‘all’. 

[[note]]
| When exporting all rows, any column filters or sort applied to the grid are ignored and all rows are exported in the original order.

You can verify this in the example below:
- Filter the Country column to only show rows for Australia
- Sort descending by Athlete column
- Uncheck the All Rows checkbox and click the Export to Excel button

Observe how only the filtered rows are exported in the Excel file in descending order by Athlete column

- Check the All Rows checkbox and click the Export to Excel button

Observe how all rows are exported in the Excel file in the original unsorted row order

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