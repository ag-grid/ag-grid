---
title: "Excel Export API Reference"
enterprise: true
---
This page documents the Excel Export API and Interfaces.

### Grid Properties

<api-documentation source='grid-properties/properties.json' section='export' names='["defaultExcelExportParams", "suppressExcelExport", "excelStyles"]'></api-documentation>

### API Methods

<api-documentation source='grid-api/api.json' config='{"isApi": true}' section='export' names='["exportDataAsExcel", "getDataAsExcel", "getSheetDataForExcel", "getMultipleSheetsAsExcel", "exportMultipleSheetsAsExcel"]'></api-documentation>

## Interfaces

### ExcelExportParams:

<api-documentation source='excel-export-api/resources/excel-export-params.json' section='excelExportParams'></api-documentation>

### ExcelExportMultipleSheetParams:

<api-documentation source='excel-export-api/resources/excel-export-params.json' section='excelExportMultipleSheetParams'></api-documentation>

### ExcelCell

<api-documentation source='excel-export-api/resources/excel-export-params.json' section='excelCell'></api-documentation>

### ExcelData

<api-documentation source='excel-export-api/resources/excel-export-params.json' section='excelData'></api-documentation>

### ExcelImage

<api-documentation source='excel-export-api/resources/excel-export-params.json' section='excelImage'></api-documentation>

### ExcelStyle

<api-documentation source='excel-export-api/resources/excel-export-params.json' section='excelStyle'></api-documentation>

### ExcelAlignment

<api-documentation source='excel-export-api/resources/excel-export-params.json' section='excelAlignment'></api-documentation>

### ExcelBorders

<api-documentation source='excel-export-api/resources/excel-export-params.json' section='excelBorders'></api-documentation>

### ExcelBorder

<api-documentation source='excel-export-api/resources/excel-export-params.json' section='excelBorder'></api-documentation>

### ExcelFont

<api-documentation source='excel-export-api/resources/excel-export-params.json' section='excelFont'></api-documentation>

### ExcelInterior

<api-documentation source='excel-export-api/resources/excel-export-params.json' section='excelInterior'></api-documentation>

### ExcelNumberFormat

<api-documentation source='excel-export-api/resources/excel-export-params.json' section='excelNumberFormat'></api-documentation>

### ExcelProtection

<api-documentation source='excel-export-api/resources/excel-export-params.json' section='excelProtection'></api-documentation>

### ExcelSheetMargin

<api-documentation source='excel-export-api/resources/excel-export-params.json' section='excelSheetMargin'></api-documentation>

### ExcelSheetPageSetup

<api-documentation source='excel-export-api/resources/excel-export-params.json' section='excelSheetPageSetup'></api-documentation>

### ExcelHeaderFooterConfig

<api-documentation source='excel-export-api/resources/excel-export-params.json' section='excelHeaderFooterConfig'></api-documentation>

### ExcelHeaderFooter

<api-documentation source='excel-export-api/resources/excel-export-params.json' section='excelHeaderFooter'></api-documentation>

### ExcelHeaderFooterContent

<api-documentation source='excel-export-api/resources/excel-export-params.json' section='excelHeaderFooterContent'></api-documentation>


## Types

### ExcelDataType

```ts
type ExcelDataType = 'String' | 'Formula' | 'Number' | 'Boolean' | 'DateTime' | 'Error'
```

### ExcelOOXMLDataType

```ts
type ExcelOOXMLDataType = 'str' | 's' | 'f' | 'inlineStr' | 'n' | 'b' | 'd' | 'e' | 'empty'
```