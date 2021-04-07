---
title: "Excel Export - Multiple Sheets"
enterprise: true
---

Excel Export provides a way to export an Excel file with multiple sheets, this can be useful when you need to combine different data sets into a single file.

## How it works

A raw Excel Sheet can be exported from the grid by calling the `getSheetDataForExcel` method. This will start the `Multiple Sheet Export` process. The results of calling `getSheetDataForExcel` should be stored in an Array, and once all needed sheets have been stored, the `exportMultipleSheetsAsExcel` or `getMultipleSheetsAsExcel` method should be called.

[[note]]
| When using modules, the `exportMultipleSheetsAsExcel` and `getMultipleSheetsAsExcel` functions can be imported directly from the `excel-export` module as `import { exportMultipleSheetsAsExcel, getMultipleSheetsAsExcel } from '@ag-grid-enterprise/excel-export'`.

[[warning]]
| Calling `getSheetDataForExcel` will start a Multiple Sheet export process, that can only be ended by calling `exportMultipleSheetsAsExcel` or `getMultipleSheetsAsExcel`. Before this process is ended, no data will be able to be exported from the grid using `exportDataAsExcel` or `getDataAsExcel`.

## Example with Data Selection
In this example, we combine the `onlySelected=true` property to limit the export to 100 rows per sheet.

Note the following: 

- The header is exported on each page, so each page will contain 101 records (including the header).
- Because each export did not have a specified `sheetName`, they will be named `ag-grid`, `ag-grid_1`, `ag-grid_2` and so on.

<grid-example title='Excel Export - Multiple Sheets with Data Selection' name='excel-export-multiple-sheets-selected' type='generated' options='{ "enterprise": true }'></grid-example>

## Example with Data Filtering

Note the following: 

- The exported Excel file will contain one sheet for each sport result.
- Each sheet was exported using the sport name as the name of the sheet.

<grid-example title='Excel Export - Multiple Sheets with Filtered Data' name='excel-export-multiple-sheets-by-filter' type='generated' options='{ "enterprise": true }'></grid-example>

## Example with Multiple Grids

Note the following:

- The contents of the `Athletes` grid will be exported to the `Athletes` sheet.
- The contents of the `Selected Athletes` grid will be exported to the `Selected Athletes` sheet.
- Only the `onExcelExport` method is relevant to **Excel Export**

<grid-example title='Excel Export - Multiple Sheets with Multiple Grids' name='excel-export-multiple-sheets-multiple-grids' type='multi' options='{ "enterprise": true, "extras": ["fontawesome", "bootstrap"] }'></grid-example>

## API

### API Methods

<api-documentation source='grid-api/api.json' section='export' names='["getSheetDataForExcel()", "getMultipleSheetsAsExcel()", "exportMultipleSheetsAsExcel()"]'></api-documentation>