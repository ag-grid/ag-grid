---
title: "Excel Export - Page Setup"
enterprise: true
---

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

<api-documentation source='excel-export/resources/excel-export-params.json' section='excelSheetMargin'></api-documentation>

### ExcelSheetPageSetup

<api-documentation source='excel-export/resources/excel-export-params.json' section='excelSheetPageSetup'></api-documentation>