---
title: "Export"
---

This page covers the export options that are common to both CSV and Excel.

The grid provides APIs to export data to CSV and Excel. You can download a file to the user's computer or generate a string to be uploaded to a server. For more detail on the specific options for each format see:

- [CSV Export](../csv-export/)
- [Excel Export](../excel-export/)<enterprise-icon></enterprise-icon>

## Selecting Data to Export

Data can be exported using one of the following API methods:

<api-documentation source='grid-api/api.json' section='export'></api-documentation>

Each of these methods takes an optional `params` object, which has the following properties for all exports:

<api-documentation source='export/resources/export.json' section='properties'></api-documentation>

Additional properties are included depending on the export type; please see the pages specific to each export type for more details.

## Example: Selecting Data to Export

This example demonstrates the options that control what data to export. Note that:

- Filtered rows are not included in the export.
- The sort order is maintained in the export.
- The order of the columns is maintained in the export.
- Only visible columns are export.
- Value getters are used to work out the value to export (the 'Name Length' col in the example below uses a value getter return the number of characters in the name)
- Aggregated values are exported.
- For groups, the first exported value (column) will always have the group key.
- Heading groups are exported as part of the csv.

<grid-example title='Selecting data to export' name='data-selection' type='generated' options='{ "enterprise": true, "exampleHeight": "80vh" }'></grid-example>

## What Gets Exported

The same data that is in the grid gets exported, but none of the GUI representation of the data will be. What this means is:

- The raw values, and not the result of cell renderer, will get used, meaning:
    - Cell Renderers will NOT be used.
    - Value Getters will be used.
    - Cell Formatters will NOT be used (use `processCellCallback` instead).
- Cell styles are not exported by default. CSV does not allow styling. For details on styling the Excel export, see [Excel Export](../excel-export/).
- If row grouping:
    - all data will be exported regardless of whether groups are open in the UI.
    - by default, group names will be in the format "-> Parent Name -> Child Name" (use `processRowGroupCallback` to change this)
    - row group footers (groupIncludeFooter=true) will NOT be exported - this is a GUI addition that happens for displaying the data in the grid.

[[note]]
| If you want to disable export, you can set the properties `suppressCsvExport = true` and `suppressExcelExport = true` in your `gridOptions`.

## Example: Formatting Exported Data

This example demonstrates the options that modify the exported data:

- Aggregated values are exported.
- For groups, the first exported value (column) will always have the group key.
- Heading groups are exported as part of the csv.

<grid-example title='Formatting exported data' name='formatting' type='generated' options='{ "enterprise": true, "exampleHeight": "60vh" }'></grid-example>

## Custom Headers and Footers

`customHeader` and `customFooter` both take a 2D array of ExcelCell objects:

```ts
interface ExcelCell {
    data: ExcelData;
    // Optional style to apply
    styleId?: string;
    // Optional The number of _additional_ cells to span across, so
    // 1 means that the cell will span 2 columns
    mergeAcross?: number;
}

interface ExcelData {
    // Excel data type. Case sensitive.
    type: 'String' | 'Number' | 'Boolean' | 'DateTime' | 'Error';
    value: string | null;
}
```

See the styles section of the [Excel Export](../excel-export/) page for more information how the `styleId` property is interpreted. The CSV exporter will ignore style information.

The CSV exporter can accept a multi-line string for `customHeader` and `customFooter`, see the [CSV Export](../csv-export/) page for more information.

## Export on iOS

It is not possible to download files directly from JavaScript to an iPad / iPhone. This is a restriction of iOS and not something wrong with AG Grid. For this reason, the download links in the context menu are removed when running on iPad / iPhone. If you do want to download on iPad / iPhone, then it is recommended you use the api function `getDataAsCsv()` to get the export data and then send this to the server to allow building an endpoint for doing the download.
