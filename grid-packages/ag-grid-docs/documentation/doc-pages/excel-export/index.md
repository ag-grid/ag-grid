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

### ExcelExportMultipleSheetParams

This interface is only relevant when exporting multiple sheets in a single Excel file. For more info see [Excel Export - Multiple Sheets](/excel-export-multiple-sheets/).

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