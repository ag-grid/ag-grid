---
title: "Excel Export - Columns"
enterprise: true
---

Excel Export allows you to select which columns get exported to Excel.

By default, all the currently visible columns in the grid are included in the Excel export. However, you can easily control which specific columns are exported to the Excel file.

## Column Headers

By default column headers and group column headers are included in the Excel export. However, you can suppress the export for column header rows using the `skipColumnGroupHeaders` and `skipColumnHeaders` properties to `true`.

Note the following:

- By default, all grouped column header rows and the column header row are exported.
- Group Headers will be skipped if Skip Column Group Headers is checked.
- Normal headers will be skipped if Skip Column Headers is checked.

<grid-example title='Excel Export - Column Headers' name='excel-export-column-headers' type='generated' options='{ "enterprise": true, "modules": ["clientside", "csv", "excel", "menu"], "exampleHeight": 815 }'></grid-example>

## Hidden Columns

By default, hidden columns are not included in the export. If you need all columns to be exported even if they're currently hidden in the grid, set the allColumns property to true.

Note the following:

- By default, **only visible columns will be exported**. The bronze, silver and gold columns will not.
- If `All Columns` is checked, the bronze, silver and gold columns will be included in the exported file.

<grid-example title='Excel Export - Hidden Columns' name='excel-export-hidden-columns' type='generated' options='{ "enterprise": true, "modules": ["clientside", "csv", "excel", "menu"], "exampleHeight": 815 }'></grid-example>

## Collapsible Columns

[Grouped columns](../column-groups/) can be exported to Excel as grouped columns. However, there are a few points to keep in mind to configure this correctly: 

1. By default only visible columns are exported. Collapsed columns are hidden and as such aren’t exported to Excel. In order to export collapsed columns, set `allColumns: true` in the [ExcelExportParams](../excel-export-api/#excelexportparams) provided to the grid. However, this will also export all hidden columns in the grid. If you want to export collapsed columns but not all hidden columns, you can set the list of columns to be exported via the [columnKeys](../excel-export-api/#reference-excelExportParams-columnKeys) property.

1. Excel doesn't have a `columnGroupShow: 'closed'` equivalent, so this option will not work the same when collapsing columns in Excel.

1. If two collapsible groups are side-by-side, Excel will merge these two groups into one.

In the example below, export the grid to Excel, open the exported Excel document and note the following:

- The columns **Gold**, **Silver**, **Bronze** will appear as a collapsible column group in the exported Excel document.

- The exported Excel document will also contain the Total column, but this column will not be included in the "collapsible" group.

[[note]]
| When using pivoting to export [secondary columns](../pivoting/#primary-vs-secondary-columns), only currently visible columns are exported as grouped. Collapsed secondary columns aren’t exported at all, even when the [ExcelExportParams](../excel-export-api/#excelexportparams) option `allColumns:true` is set.

<grid-example title='Excel Export - Collapsible Columns' name='excel-export-collapsible-columns' type='generated' options='{ "enterprise": true, "modules": ["clientside", "csv", "excel", "menu"] }'></grid-example>


## Next Up

Continue to the next section: [Data Types](../excel-export-data-types/).