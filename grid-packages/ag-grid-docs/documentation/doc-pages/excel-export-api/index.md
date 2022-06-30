---
title: "Excel Export API Reference"
enterprise: true
---
This page documents the Excel Export API and Interfaces.

### Grid Properties

<api-documentation source='grid-options/properties.json' section='export' names='["defaultExcelExportParams", "suppressExcelExport", "excelStyles"]'></api-documentation>

### API Methods

<api-documentation source='grid-api/api.json' config='{"isApi": true}' section='export' names='["exportDataAsExcel", "getDataAsExcel", "getSheetDataForExcel", "getMultipleSheetsAsExcel", "exportMultipleSheetsAsExcel"]'></api-documentation>

## Interfaces

### ExcelExportParams
<interface-documentation interfaceName='ExcelExportParams' overrideSrc='excel-export-api/resources/excel-api.json' ></interface-documentation>

### ExcelExportMultipleSheetParams
<interface-documentation interfaceName='ExcelExportMultipleSheetParams' overrideSrc='excel-export-api/resources/excel-api.json'></interface-documentation>

### ExcelAlignment
<interface-documentation interfaceName='ExcelAlignment'></interface-documentation>

### ExcelBorders
<interface-documentation interfaceName='ExcelBorders'></interface-documentation>

### ExcelBorder
<interface-documentation interfaceName='ExcelBorder'></interface-documentation>

### ExcelCell
<interface-documentation interfaceName='ExcelCell'></interface-documentation>

### ExcelData
<interface-documentation interfaceName='ExcelData' overrideSrc='excel-export-api/resources/excel-api.json'></interface-documentation>

### ExcelFont
<interface-documentation interfaceName='ExcelFont'></interface-documentation>

### ExcelHeaderFooter
<interface-documentation interfaceName='ExcelHeaderFooter'></interface-documentation>

### ExcelHeaderFooterContent
<interface-documentation interfaceName='ExcelHeaderFooterContent' overrideSrc='excel-export-api/resources/excel-api.json'></interface-documentation>

### ExcelImage
<interface-documentation interfaceName='ExcelImage' overrideSrc='excel-export-api/resources/excel-api.json'></interface-documentation>

### ExcelImagePosition
<interface-documentation interfaceName='ExcelImagePosition'></interface-documentation>

### ExcelInterior
<interface-documentation interfaceName='ExcelInterior'></interface-documentation>

### ExcelNumberFormat
<interface-documentation interfaceName='ExcelNumberFormat'></interface-documentation>

### ExcelProtection
<interface-documentation interfaceName='ExcelProtection'></interface-documentation>

### ExcelSheetMargin
<interface-documentation interfaceName='ExcelSheetMargin'></interface-documentation>

### ExcelSheetPageSetup
<interface-documentation interfaceName='ExcelSheetPageSetup'></interface-documentation>

### ExcelStyle
<interface-documentation interfaceName='ExcelStyle' overrideSrc='excel-export-api/resources/excel-api.json'></interface-documentation>

## Types

### ExcelDataType

```ts
type ExcelDataType = 
    'String'   |
    'Formula'  |
    'Number'   |
    'Boolean'  |
    'DateTime' |
    'Error'
```

### ExcelOOXMLDataType

```ts
type ExcelOOXMLDataType = 
    'str'       |
    's'         |
    'f'         |
    'inlineStr' |
    'n'         |
    'b'         |
    'd'         |
    'e'         |
    'empty'
```