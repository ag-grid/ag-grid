---
title: "Excel Export - Multiple Sheets"
enterprise: true
---

Excel Export provides a way to export an Excel file with multiple sheets, this can be useful when you need to combine different data sets into a single file.

## How it works

A raw Excel Sheet can be exported from the grid by calling the `getGridRawDataForExcel` method. This will start the `Multiple Sheet Export` process. The results of calling `getGridRawDataForExcel` should be stored in an Array, and once all needed sheets have been stored, the `exportMultipleSheetsAsExcel` or `getMultipleSheetsAsExcel` method should be called.

[[warning]]
| Calling `getGridRawDataForExcel` will start a Multiple Sheet export process, that can only be ended by calling `exportMultipleSheetsAsExcel` or `getMultipleSheetsAsExcel`. Before this process is ended, no data will be able to be exported from the grid using `exportDataAsExcel` or `getDataAsExcel`.

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

## Export Master Detail

Note the following:

- The `Master Detail` data is only available for `expanded` nodes, for more info see [Detail Grids](/master-detail-grids/).
- The `RowBuffer` was set to **100** so all Detail Grids would be available.
- The `Detail Grids` get exported into different sheets.

<grid-example title='Excel Export - Multiple Sheets with Master Detail' name='excel-export-multiple-sheets-master-detail' type='generated' options='{ "enterprise": true }'></grid-example>

## Example with Multiple Grids

<grid-example title='Excel Export - Multiple Sheets with Multiple Grids' name='excel-export-multiple-sheets-multiple-grids' type='multi' options='{ "enterprise": true, "extras": ["fontawesome", "bootstrap"] }'></grid-example>

## API

### API Methods

<api-documentation source='grid-api/api.json' section='export' names='["getGridRawDataForExcel()", "getMultipleSheetsAsExcel()", "exportMultipleSheetsAsExcel()"]'></api-documentation>

## Interfaces

### ExcelExportMultipleSheetParams

```ts
// This interface is the same as `ExcelExportParams`, with one addition data param.
interface ExcelExportMultipleSheetParams extends ExcelExportParams {
    /**
     * This should contain an array of strings, where each string is the return
     * of the `api.getGridRawDataForExcel()` method.
     */
    data: string[];
}
```

### ExcelExportParams

```ts
interface ExcelExportParams {
    /**
     * The author of the exported file.
     * Default: 'Ag Grid';
     */
    author?: string;

    /**
     * If set to `true`, this will try to convert any cell that starts with `=` to a formula,
     * instead of setting the cell value as regular string that starts with `=`.
     * Default: false;
     */
    autoConvertFormulas?: boolean;

    /**
     * Defines the default column width. If no value is present, each column will have
     * value currently set in the application with a min value of 75px. This property can
     * also be a callback function the returns a number.
     * 
     * Default: undefined
     */
    columnWidth?: number | ((params: ColumnWidthCallbackParams) => number);

    /**
     * For backwards compatibility, this property could be set to `xml`, which will export an
     * Excel Spreadsheet compatible with old Office versions (prior to Office 2007).
     * 
     * Note: Setting this to `xml` is not recommended as some features will not work in legacy mode.
     * 
     * Default: 'xlsx'
     */
    exportMode?: 'xlsx' | 'xml';

    /**
     * The default value for the font size of the Excel document.
     *
     * Default: 11
     */
    fontSize?: number;

    /**
     * The height in pixels of header rows.
     * 
     * Default: The grid's current rowHeight value
     */
    headerRowHeight?: number;

    /**
     * The height in pixels of all rows.
     * 
     * Default: The Excel default value
     */
    rowHeight?: number;

    /**
     * The name of the sheet in Excel where the grid will be exported. 
     * 
     * Note: 31 characters max.
     * 
     * Default: 'ag-grid'
     */
    sheetName?: string;

    /**
     * Pass true and text content will be encoded with XML character entities like &lt; and &gt;.
     * 
     * Note: This is only relevant when `exportMode='xml'`.
     * 
     * Default: false
     */
    suppressTextAsCDATA?:boolean;

    /**
     * Content to put at the top of the file export. A 2D array of ExcelCell objects (see 
     * Custom Headers and Footers section).
     *
     * Default: undefined;
     */
    customHeader?: ExcelCell;

    /**
     * Content to put at the bottom of the file export. A 2D array of ExcelCell objects (see 
     * Custom Headers and Footers section).
     *
     * Default: undefined;
     */
    customFooter?: ExcelCell;

    /**
     * If true, all columns will be exported in the order they appear in the columnDefs.
     * Default: false - only the columns currently being displayed will be exported.
     */
    allColumns?: boolean;

    /**
     * Set to true to include header column groups.
     * Default: false
     */
    columnGroups?: boolean;

    /**
     * Provide a list (an array) of column keys or Column objects if you want to 
     * export specific columns.
     *
     * Default: undefined
     */
    columnKeys?: (string | Column)[];

    /**
     * String to use as the file name.
     *
     * Default: `export.xlsx`
     */
    fileName?: string;

    /**
     * Export only selected rows.
     * Default: false
     */
    onlySelected?: boolean;

    /**
     * Only export selected rows including other pages (only makes sense when using pagination).
     * Default: false
     */
    onlySelectedAllPages?: boolean;

    /**
     * Set to true to skip row group headers if grouping rows.
     * Only relevant when grouping rows.
     *
     * Default: false
     */
    skipGroups?: boolean;

    /**
     * Set to true if you don't want to export column headers.
     * Default: false
     */
    skipHeader?: boolean;

    /**
     * Set to true to suppress exporting rows pinned to the top of the grid.
     * Default: false
     */
    skipPinnedTop?: boolean;

    /**
     * Set to true to suppress exporting rows pinned to the bottom of the grid.
     * Default: false
     */
    skipPinnedBottom?: boolean;

    /**
     * A callback function to return content to be inserted below a row in the export.
     * Default: undefined
     */
    getCustomContentBelowRow?: (params: ProcessRowGroupForExportParams) => ExcelCell | undefined;

    /**
     * A callback function that will be invoked once per row in the grid. Return true to omit 
     * the row from the export.
     *
     * Default: undefined
     */
    shouldRowBeSkipped?(params: ShouldRowBeSkippedParams): boolean;

    /**
     * A callback function invoked once per cell in the grid. Return a string value to 
     * be displayed in the export. Useful e.g. for formatting date values.
     *
     * Default: undefined
     */
    processCellCallback?(params: ProcessCellForExportParams): string;

    /**
     * 	A callback function invoked once per column. Return a string to be displayed 
     * in the column header.
     *
     * Default: undefined
     */
    processHeaderCallback?(params: ProcessHeaderForExportParams): string;

    /**
     * A callback function invoked once per column group. Return a string to be displayed 
     * in the column group header. Note that column groups are not exported by default, 
     * you must pass columnGroups=true.
     *
     * Default: undefined
     */
    processGroupHeaderCallback?(params: ProcessGroupHeaderForExportParams): string;

    /**
     * A callback function invoked once per row group. Return a string to be displayed 
     * in the group cell.
     *
     * Default: undefined
     */
    processRowGroupCallback?(params: ProcessRowGroupForExportParams): string;
}
```

### ExcelCell

```ts
interface ExcelCell {
    data: ExcelData;
    styleId?: string; // style to apply
    mergeAcross?: number; // the of cells to span across, (1 means span 2 columns)
}

```

### ExcelData

```ts
interface ExcelData {
    type: ExcelDataType
    value: string | null;
}
```

### ExcelDataType

```ts
type ExcelDataType = 'String' | 'Formula' | 'Number' | 'Boolean' | 'DateTime' | 'Error';
```

### ProcessRowGroupForExportParams

```ts
interface ProcessRowGroupForExportParams {
    node: RowNode;
    api: GridApi;
    columnApi: ColumnApi;
    context: any;
}
```

### ShouldRowBeSkippedParams

```ts
interface ShouldRowBeSkippedParams {
    node: RowNode;
    api: GridApi;
    context: any;
}
```

### ProcessCellForExportParams

```ts
interface ProcessCellForExportParams {
    value: any;
    accumulatedRowIndex?: number // the row number including headers (useful for formulas)
    node?: RowNode | null;
    column: Column;
    api: GridApi;
    columnApi: ColumnApi;
    context: any;
    type: string;
}
```

### ProcessHeaderForExportParams

```ts
interface ProcessHeaderForExportParams {
    column: Column;
    api: GridApi;
    columnApi: ColumnApi;
    context: any;
}
```

### ProcessGroupHeaderForExportParams

```ts
interface ProcessGroupHeaderForExportParams {
    columnGroup: ColumnGroup;
    api: GridApi;
    columnApi: ColumnApi;
    context: any;
}
```