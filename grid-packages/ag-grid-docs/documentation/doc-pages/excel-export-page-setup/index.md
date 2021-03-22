---
title: "Excel Export - Page Setup"
enterprise: true
---

<grid-example title='Excel Export - Page Setup' name='excel-export-page-setup' type='generated' options='{ "enterprise": true, "exampleHeight": 815 }'></grid-example>

## Interfaces

### ExcelExportParams

```ts
interface ExcelExportParams {
    // ...
    sheetConfig?: ExcelSheetConfig;
}
```

### ExcelExportParams
```ts
interface ExcelSheetConfig {
    margins?: ExcelSheetMargin;
    setup?: ExcelSheetPageSetup;
}
```

### ExcelSheetMargin
```ts
export interface ExcelSheetMargin {
    top?: number; // Default: 0.75
    right?: number; // Default: 0.7
    bottom?: number; // Default: 0.75
    left?: number; // Default: 0.7
    header?: number; // Default: 0.3
    footer?: number; // Default: 0.3
}
```

### ExcelSheetPageSetup
```ts
export interface ExcelSheetPageSetup {
    orientation?: 'Portrait' | 'Landscape'; // Default: 'Portrait'
    /** 
     * Default: 'Letter'
     */
    pageSize?: 'Letter' | 'Letter Small' | 'Tabloid' | 'Ledger' | 'Legal' | 'Statement' | 'Executive' | 'A3' | 'A4' | 'A4 Small' | 'A5' | 'A6' | 'B4' | 'B5' | 'Folio' | 'Envelope' | 'Envelope DL' | 'Envelope C5' | 'Envelope B5' | 'Envelope C3' | 'Envelope C4' | 'Envelope C6' | 'Envelope Monarch' | 'Japanese Postcard' | 'Japanese Double Postcard';
}
```