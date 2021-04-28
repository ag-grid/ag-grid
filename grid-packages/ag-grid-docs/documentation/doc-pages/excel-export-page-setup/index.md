---
title: "Excel Export - Page Setup"
enterprise: true
---

Excel Export exports allows you to configure the page settings when exporting your document.

## Page Setup

By using the `pageSetup` and `margins` configs of the [Excel Export Params](../excel-export-api/#excelexportparams) it's possible to change how the document will look when printing or exporting to PDF.

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

<grid-example title='Excel Export - Page Setup' name='excel-export-page-setup' type='generated' options='{ "enterprise": true, "exampleHeight": 815 }'></grid-example>

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