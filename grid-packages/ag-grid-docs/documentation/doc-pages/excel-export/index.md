---
title: "Excel Export"
enterprise: true
---

The grid provides in-built Excel (xlsx) export functionality without the need for any third party libraries. Exporting to 
Excel can be performed from the [Context Menu](/context-menu/) or programmatically via the [Grid API](/grid-api/) and 
the exported spreadsheets can be fully customised and styled to meet user requirements.

<image-caption src="excel-export/resources/excel-export-context-menu.png" alt="Set Filter" maxWidth="48rem" constrained="true" centered="true"></image-caption>

## Enabling Excel Export

The enterprise version of the grid provides an 'Excel Export' option via the grids [Context Menu](/context-menu/) by default.

Excel export is also possible via the [Grid API](/grid-api/) using the following method: 

<snippet>
 gridOptions.api.exportDataAsExcel();
</snippet>

No special configurations or third party libraries are required for either approach.

## Default Excel Export

The default Excel export behaviour will export the current state of the data in the grid. This means the exported 
spreadsheet will match what is displayed in the grid at the time of export following any sorting, filtering, row 
grouping etc...

Note that the raw values, and not the result from a cell renderer will be used, meaning the results from:
- Value Getters will be used.
- Cell Renderers / Formatters will **NOT** be used.

Also note that cell styles are not exported by default, see [Export Excel Style](/excel-export-styles/) for a detailed guide on how to export styles.

In the following example reorder some columns and apply some filter and sort operations - then export from the 'Excel Export' option 
in the context menu, or the 'Export to Excel' button provided. Note the following:

- The current order of the columns is exported and any hidden columns will not be exported.
- Filtered out rows are not included in the export, and the sort order is maintained.

<grid-example title='Default Excel Export' name='excel-default-export' type='generated' options='{ "enterprise": true, "exampleHeight": 600 }'></grid-example>

[[note]]
|1. The column width in Excel will be the same as the actual width of the column in the application at the time that the export happens, or 75px, whichever is wider. "Actual width" may be different from the width in the column definition if column has been resized or uses flex sizing. This can be overridden using the `columnWidth` export parameter.
|
|1. The data types of your columns are passed to Excel as part of the export so that if you can to work with the data within Excel in the correct format.
|
|1. The cells of the column header groups are merged in the same manner as the group headers in AG Grid.

## Custom Excel Export 

The [Default Excel Export](/excel-export/#default-excel-export) will meet the requirements of most applications, 
however extensive customisation to the layout and styling of the exported spreadsheets are supported.

The following sub sections cover the various ways the exported Excel spreadsheets can be customised:

- **[Styles](/excel-export-styles/)**: provide custom styling to exported spreadsheets.
- **[Formulas](/excel-export-formulas/)**: export the grids value getters to Excel formulas.
- **[Multiple Sheets](/excel-export-multiple-sheets/)**: export grid data across multiple sheets.
- **[Data Types](/excel-export-data-types/)**: export values to Excels built-in data types.
- **[Hyperlinks](/excel-export-hyperlinks/)**: add hyperlinks to exported spreadsheets.
- **[Master Detail](/excel-export-master-detail/)**: master detail grids can be exported to single or multiple sheets.
- **[Extra Content](/excel-export-extra-content/)**: extra content not shown in the grid can be added to the exported spreadsheets.
- **[Page Setup](/excel-export-page-setup/)**: the page setup of the exported spreadsheets can be customised.

## Next Up

Continue to the next section: [API Reference](/excel-export-api/).

