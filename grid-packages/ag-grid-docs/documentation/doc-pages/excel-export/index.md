---
title: "Excel Export"
enterprise: true
---

The grid provides in-built Excel (xlsx) export functionality without the need for any third party libraries. Exporting to 
Excel can be performed from the [Context Menu](../context-menu/) or programmatically via the [Grid API](../grid-api/) and 
the exported spreadsheets can be fully customised and styled to meet user requirements.

<image-caption src="excel-export/resources/excel-export-context-menu.png" alt="Excel Export" maxWidth="48rem" constrained="true" centered="true"></image-caption>

## Enabling Excel Export

The enterprise version of the grid provides an 'Excel Export' option via the grids [Context Menu](../context-menu/) by default. (If you are using Enterprise [Modules](../modules/) ensure the `ExcelExportModule` is registered.)

Excel export is also possible via the [Grid API](../grid-api/) using the following method: 

<snippet>
 gridOptions.api.exportDataAsExcel();
</snippet>

No special configurations or third party libraries are required for either approach.

## Default Excel Export

The default Excel export behaviour will export the grid as it is currently rendered. This means the exported spreadsheet will match what is displayed in the grid at the time of export following any sorting, filtering, row grouping, columns visible, grouped columns etc...

Note that the raw values, and not the result from a cell renderer will be used, meaning the results from:

- Value Getters will be used. 
- Cell Renderers / Formatters will **NOT** be used. 
- Cell styles will **NOT** be exported by default. 

In the following example reorder some columns and apply some filter and sort operations - then export from the 'Excel Export' option 
in the context menu, or the 'Export to Excel' button provided. Note the following:

- The current order of the columns is exported and any hidden columns will not be exported.
- Filtered out rows are not included in the export, and the sort order is maintained.

<grid-example title='Default Excel Export' name='excel-default-export' type='generated' options='{ "enterprise": true, "modules": ["clientside", "csv", "excel", "menu"], "exampleHeight": 600 }'></grid-example>

[[note]]
|1. The column width in Excel will be the same as the actual width of the column in the application at the time that the export happens, or 75px, whichever is wider. "Actual width" may be different from the width in the column definition if column has been resized or uses flex sizing. This can be overridden using the `columnWidth` export parameter.
|
|1. The data types of your columns are passed to Excel as part of the export so that you can work with the data within Excel in the correct format.
|
|1. The cells of the column header groups are merged in the same manner as the group headers in AG Grid.

## Custom Excel Export 

The [Default Excel Export](../excel-export/#default-excel-export) behaviour will meet the requirements of most applications. However, you can apply extensive customisation to the values exported, layout, value formatting and styling of the exported spreadsheets.

The sections below cover the various ways the exported Excel spreadsheets can be customised:

- **[Styles](../excel-export-styles/)**: Apply custom styling to exported spreadsheets
- **[Formulas](../excel-export-formulas/)**: Export the grid's value getters to Excel formulas
- **[Extra Content](../excel-export-extra-content/)**: Add to the exported spreadsheets extra content not shown in the grid
- **[Images](../excel-export-images/)**: Export images as extra content or within grid cells
- **[Multiple Sheets](../excel-export-multiple-sheets/)**: Export grid data across multiple sheets of an Excel workbook
- **[Rows](../excel-export-rows/)**: Set which rows are exported
- **[Columns](../excel-export-columns/)**: Set which columns are exported
- **[Data Types](../excel-export-data-types/)**:  Export grid values to the Excel built-in data types.
- **[Hyperlinks](../excel-export-hyperlinks/)**: Add hyperlinks to exported spreadsheets.
- **[Master Detail](../excel-export-master-detail/)**: Export master detail grids to single or multiple sheets
- **[Page Setup](../excel-export-page-setup/)**: Customize the page setup of the exported spreadsheets

## Next Up

Continue to the next section: [API Reference](../excel-export-api/).
