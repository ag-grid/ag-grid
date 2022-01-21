---
title: "Excel Export - Page Setup"
enterprise: true
---

Excel Export allows you to configure the page settings for the exported Excel file.

## Page Setup

You can customise the Excel export page settings such as **page size**, **orientation**, and **margin**, using the `pageSetup` and `margins` configs of the [Excel Export Params](../excel-export-api/#excelexportparams). These settings are visible when printing the exported Excel file or exporting to PDF. 

<snippet>
const gridOptions = {
    defaultExcelExportParams: {
        pageSetup: {
            orientation: 'Landscape',
            pageSize: 'A3'
        },
        margins: {
            top: 1,
            right: 1,
            bottom: 1,
            left: 1,
            header: 0.5,
            footer: 0.5,
        }
    }
}
</snippet>

[[warning]]
| The value of the margins must be provided in `inches`.

Note the following:

- The sample below allow you to configure the page size, orientation and margin values.
- Page size and orientation are stored in the `pageSetup` object.
- Margin values are stored in the `margins` object.

<grid-example title='Excel Export - Page Setup' name='excel-export-page-setup' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "excel"], "exampleHeight": 815 }'></grid-example>

## Interfaces

### ExcelExportParams
```ts
interface ExcelExportParams {
    // ...
    margins?: ExcelSheetMargin;
    pageSetup?: ExcelSheetPageSetup
}
```

### ExcelSheetMargin

<api-documentation source='excel-export-api/resources/excel-export-params.json' section='excelSheetMargin'></api-documentation>

### ExcelSheetPageSetup

<api-documentation source='excel-export-api/resources/excel-export-params.json' section='excelSheetPageSetup'></api-documentation>