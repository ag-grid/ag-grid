---
title: "Excel Export"
enterprise: true
---

The grid provides in-built Excel (xlsx) export functionality without the need for any third party libraries. Exporting to 
Excel can be performed from the [Context Menu](/context-menu/) or programmatically via the [Grid API](/grid-api/) and 
the exported spreadsheets can be fully customised and styled to meet user requirements.

<image-caption src="excel-export/resources/excel-export-context-menu.png" alt="Set Filter" width="48rem" centered="true"></image-caption>

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

In the following example reorder some columns and apply some filter and sort operations - then export the data using
the 'Excel Export' context menu option, or the 'Export to Excel' button. Note the following:

- The current order of the columns is exported and any hidden columns will not be exported.
- Filtered out rows are not included in the export, and the sort order is maintained.

<grid-example title='Default Excel Export' name='excel-default-export' type='generated' options='{ "enterprise": true, "exampleHeight": 600 }'></grid-example>

## Custom Excel Export 

The [Default Excel Export](/excel-export/#default-excel-export) will meet the requirements of most applications, 
however extensive customisation to the layout and styling of the exported spreadsheets are supported.

[[warning]]
| TODO: Unfinished Section!


## Next Up

Continue to the next section: [API Reference](/excel-export-api/).

