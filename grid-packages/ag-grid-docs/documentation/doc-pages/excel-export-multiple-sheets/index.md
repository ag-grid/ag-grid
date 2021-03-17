---
title: "Excel Export - Multiple Sheets"
enterprise: true
---

Excel Export provides a way to export an Excel file with multiple sheets, this can be useful when you need to combine different data sets into a single file.

## How it works

A raw Excel Sheet can be exported from the grid by calling the `getGridRawDataForExcel` method. This will start the `Multiple Sheet Export` process. The results of calling `getGridRawDataForExcel` should be stored in an Array, and once all needed sheets have been stored, the `exportMultipleSheetsAsExcel` or `getMultipleSheetsAsExcel` method should be called.

[[warning]]
| Calling `getGridRawDataForExcel` will start a Multiple Sheet export process, that can only be ended by calling `exportMultipleSheetsAsExcel` or `getMultipleSheetsAsExcel`. Before this process is ended, no data will be able to be exported from the grid using `exportDataAsExcel` or `getDataAsExcel`.

## Example with Data Filtering

## Example with Multiple Grids


## API

<api-documentation source='grid-api/api.json' section='export' names='["getGridRawDataForExcel()", "getMultipleSheetsAsExcel()", "exportMultipleSheetsAsExcel()"]'></api-documentation>

## Interfaces