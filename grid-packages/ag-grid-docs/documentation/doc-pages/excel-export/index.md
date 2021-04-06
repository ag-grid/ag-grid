---
title: "Excel Export"
enterprise: true
---

The grid data can be exported to Excel using Open Office XML format (xlsx). The export can be initiated with with an API call or by using the right-click context menu on the Grid.

## Exporting to Excel

The following example has the default settings for exporting the grid data to Excel format.

Note the following:

- The column grouping is **NOT** exported.
- Filtered rows are not included in the export.
- The sort order is maintained in the export.
- The order of the columns is maintained in the export.
- Only visible columns are exported.
- Value getters are used to work out the value to export (the 'Group' col in the example below uses a value getter to take the first letter of the country name).

<grid-example title='Default Excel Export' name='excel-default-export' type='generated' options='{ "enterprise": true, "exampleHeight": 600 }'></grid-example>

## What Gets Exported

The same data that is in the grid gets exported, but none of the GUI representation of the data will be. What this means is:

- The raw values, and not the result of cell renderer will get used, meaning:
  - Value Getters will be used.
  - Cell Renderers will **NOT** be used.
  - Cell Formatters will **NOT** be used (use `processCellCallback` instead).

- Cell styles are not exported by default, see [Export Excel Style](/excel-export-styles/) for a detailed guide on how to export styles.

- If row grouping:

  - All data will be exported regardless of whether groups are open in the UI.
  - By default, group names will be in the format "-> Parent Name -> Child Name" (use `processRowGroupCallback` to change this).
  - Row group footers (`groupIncludeFooter=true`) will **NOT** be exported - this is a GUI addition only.

[[note]]
|1. The column width in Excel will be the same as the actual width of the column in the application at the time that the export happens, or 75px, whichever is wider. "Actual width" may be different from the width in the column definition if column has been resized or uses flex sizing. This can be overridden using the `columnWidth` export parameter.
|
| 1. The data types of your columns are passed to Excel as part of the export so that if you can to work with the data within Excel in the correct format.
|
|1. The cells of the column header groups are merged in the same manner as the group headers in AG Grid.

## Dealing With Errors In Excel

If you get an error when opening the Excel file, the most likely reason is that there is an error in the definition of the styles. If that is the case, we recommend that you remove all style definitions from your configuration and add them one-by-one until you find the definition that is causing the error.

Some of the most likely errors you can encounter when exporting to Excel are:

- Not specifying all the attributes of an Excel Style property. If you specify the interior for an Excel style and don't provide a pattern, just color, Excel will fail to open the spreadsheet

- Using invalid characters in attributes, we recommend you not to use special characters.

- Not specifying the style associated to a cell, if a cell has an style that is not passed as part of the grid options, Excel won't fail opening the spreadsheet but the column won't be formatted.

- Specifying an invalid enumerated property. It is also important to realise that Excel is case sensitive, so Solid is a valid pattern, but SOLID or solid are not.

## API

### Grid Properties

<api-documentation source='grid-properties/properties.json' section='miscellaneous' names='["suppressExcelExport", "excelStyles"]'></api-documentation>

### API Methods

<api-documentation source='grid-api/api.json' section='export' names='["exportDataAsExcel()", "getDataAsExcel()", "getGridRawDataForExcel()", "getMultipleSheetsAsExcel()", "exportMultipleSheetsAsExcel()"]'></api-documentation>

## Interfaces

### ExcelExportParams:

<api-documentation source='excel-export/resources/excel-export-params.json' section='excelExportParams'></api-documentation>

### ExcelCell

<api-documentation source='excel-export/resources/excel-export-params.json' section='excelCell'></api-documentation>

### ExcelData

<api-documentation source='excel-export/resources/excel-export-params.json' section='excelData'></api-documentation>

### ExcelStyle

<api-documentation source='excel-export/resources/excel-export-params.json' section='excelStyle'></api-documentation>

### ExcelAlignment

<api-documentation source='excel-export/resources/excel-export-params.json' section='excelAlignment'></api-documentation>

### ExcelBorders

<api-documentation source='excel-export/resources/excel-export-params.json' section='excelBorders'></api-documentation>

### ExcelBorder

<api-documentation source='excel-export/resources/excel-export-params.json' section='excelBorder'></api-documentation>

### ExcelFont

<api-documentation source='excel-export/resources/excel-export-params.json' section='excelFont'></api-documentation>

### ExcelInterior

<api-documentation source='excel-export/resources/excel-export-params.json' section='excelInterior'></api-documentation>

### ExcelNumberFormat

<api-documentation source='excel-export/resources/excel-export-params.json' section='excelNumberFormat'></api-documentation>

### ExcelProtection

<api-documentation source='excel-export/resources/excel-export-params.json' section='excelProtection'></api-documentation>

### ExcelSheetConfig

<api-documentation source='excel-export/resources/excel-export-params.json' section='excelSheetConfig'></api-documentation>

### ExcelSheetMargin

<api-documentation source='excel-export/resources/excel-export-params.json' section='excelSheetMargin'></api-documentation>

### ExcelSheetPageSetup

<api-documentation source='excel-export/resources/excel-export-params.json' section='excelSheetPageSetup'></api-documentation>

## Types

### ExcelDataType

```ts
type ExcelDataType = 'String' | 'Formula' | 'Number' | 'Boolean' | 'DateTime' | 'Error'
```

### ExcelOOXMLDataType

```ts
type ExcelOOXMLDataType = 'str' | 's' | 'f' | 'inlineStr' | 'n' | 'b' | 'd' | 'e' | 'empty'
```