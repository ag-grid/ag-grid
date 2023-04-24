---
title: "CSV Export"
---

The grid data can be exported to CSV with an API call, or using the right-click context menu (Enterprise only) on the Grid.

## What Gets Exported

The same data that is in the grid gets exported, but none of the GUI representation of the data will be. What this means is:

- The raw values, and not the result of cell renderer will get used, meaning:
    - Value Getters will be used.
    - Cell Renderers will **NOT** be used.
    - Cell Formatters will **NOT** be used (use `processCellCallback` instead).

- Cell styles are not exported.
- If row grouping:

    - All data will be exported regardless of whether groups are open in the UI.
    - By default, group names will be in the format "-> Parent Name -> Child Name" (use `processRowGroupCallback` to change this).
    - Row group footers (`groupIncludeFooter=true`) will **NOT** be exported - this is a GUI addition only.

[[note]]
| The CSV export will be enabled by default. If you want to disable it, you can set the property `suppressCsvExport = true` in your gridOptions.

## Security Concerns

When opening CSV files, spreadsheet applications like Excel, Apple Numbers, Google Sheets and others will automatically execute cell values that start with the following symbols as formulas: `+`, `-`, `=`, `@`, `Tab (0x09)` and `Carriage Return (0x0D)`. In order to prevent any malicious content from being exported we recommend using the `callback` methods shown in the [CSV Export Params](/csv-export/#csvexportparams) to modify the exported cell values so that they do NOT start with any of the characters listed above. This way the applications will not execute the cell value directly if it starts with the characters listed above. If you'd like to keep the cell values unchanged when exporting, please allow exporting to Excel only.

[[note]]
| Detailed info regarding CSV Injection can be found in the [OWASP CSV Injection](https://owasp.org/www-community/attacks/CSV_Injection) website.

## Standard Export

The example below shows the default behaviour when exporting the grid's data to CSV.

Note the following:

- You can use the `Show CSV export content text` button, to preview the output.
- You can use the `Download CSV export file` button to download a csv file.
- The file will be exported using the default name: `export.csv`.
- Community version supports api CSV Export but not Context Menu.

<grid-example title='CSV Export' name='csv-export' type='generated' options='{  "modules":["clientside", "csv"], "exampleHeight": 400 }'></grid-example>

## Changing the column separator

By default, a CSV file separates its columns using `,`. But this value `token` could be changed using the `columnSeparator` param.

Note the following:

- You can use the select field at the top to switch the value of the `columnSeparator` param.
- You can use the `Show CSV export content text` button, to preview the output.
- Enterprise version enables CSV Export using right click via the Context Menu.

<grid-example title='CSV Export - Column Separator' name='csv-export-column-separator' type='generated' options='{ "enterprise": true, "modules":["clientside", "csv", "menu"], "exampleHeight": 400 }'></grid-example>

## Suppress Quotes

By default cell values are encoded according to CSV format rules: values are wrapped in double quotes, and any double quotes within the values are escaped, so `my"value` becomes `"my""value"`. Pass true to insert the value into the CSV file without escaping. In this case it is your responsibility to ensure that no cells contain the columnSeparator character.

Note the following:

- You can use the select field at the top to switch the value of the `suppressQuotes` param.
- You can edit the cells to preview the results with different inputs.
- You can use the `Show CSV export content text` button, to preview the output.
- You can use the `Download CSV export file` button to download a csv file.

<grid-example title='CSV Export - Suppress Quotes' name='csv-export-suppress-quotes' type='generated' options='{ "enterprise": true, "modules":["clientside", "csv", "menu"], "exampleHeight": 400 }'></grid-example>

## Prepending and Appending Content

The recommended way to prepend or append content, is by passing an array of CsvCell objects to `appendContent` or `prependContent`. This ensures that your content is correctly escaped.

For compatibility with earlier versions of the Grid you can also pass a string, which will be inserted into the CSV file without any processing. You are responsible for formatting the string according to the CSV standard.

Note the following:

- You can use select fields at the top to switch the value of `prependContent` and `appendContent`.
    - With `prependContent=CsvCell[][]` or `appendContent=CsvCell[][]`, custom content will be inserted containing 
    commas and quotes. These commas and quotes will be visible when opened in Excel because they have been escaped properly.
    - With `prependContent=string` or `appendContent=string`, a string to be inserted into the CSV file without any processing, and without being affected by suppressQuotes and columnSeparator. It contains commas and quotes that will not be visible in Excel.

- You can use the `Show CSV export content text` button, to preview the output.
- You can use the `Download CSV export file` button to download a csv file.

<grid-example title='CSV Export - Custom Header and Footer' name='csv-export-header-footer' type='generated' options='{ "enterprise": true, "modules":["clientside", "csv", "menu"], "exampleHeight": 400 }'></grid-example>

## Column Headers

In some situations, you could be interested in exporting only the grid data, without exporting the header cells. For this scenario, we provide the `skipColumnGroupHeaders=true` and `skipColumnHeaders=true` params.

Note the following: 

- Initially, grouped headers and header are exported.
- Group Headers will be skipped if `Skip Column Group Headers` is checked.
- Normal headers will be skipped if `Skip Column Headers` is checked.

<grid-example title='CSV Export - Column Headers' name='csv-export-column-headers' type='generated' options='{ "enterprise": true, "modules":["clientside", "csv", "menu"], "exampleHeight": 400 }'></grid-example>

## Pinned Rows

If the pinned rows are not relevant to the data, they can be excluded from the export by using the `skipPinnedTop=true` and `skipPinnedBottom=true` params.

Note the following: 

- By default, all pinned rows are exported.
- If `Skip Pinned Top Rows` is checked, the rows pinned at the top will be skipped.
- If `Skip Pinned Bottom Rows` is checked, the rows pinned at the bottom will be skipped.

<grid-example title='CSV Export - Pinned Rows' name='csv-export-pinned-rows' type='generated' options='{ "enterprise": true, "modules":["clientside", "csv", "menu"], "exampleHeight": 400 }'></grid-example>

## Hidden Columns

By default, hidden columns are not exported. If you would like all columns to be exported regardless of the current state of grid, use the `allColumns=true` params.

Note the following: 

- By default, only visible columns will be exported. The bronze, silver, and gold columns will not.
- If `Export All Columns` is checked, the bronze, silver, and gold columns will be included in the export.

<grid-example title='CSV Export - Hidden Columns' name='csv-export-hidden-columns' type='generated' options='{ "enterprise": true, "modules":["clientside", "csv", "menu"], "exampleHeight": 400 }'></grid-example>

## API
### Grid Properties

<api-documentation source='grid-options/properties.json' section='export' names='["defaultCsvExportParams", "suppressCsvExport"]'></api-documentation>

### API Methods

<api-documentation source='grid-api/api.json' section='export' names='["exportDataAsCsv", "getDataAsCsv"]'></api-documentation>

## Interfaces

### CsvExportParams
<interface-documentation interfaceName='CsvExportParams' overrideSrc='csv-export/resources/csv.json'></interface-documentation>

### CsvCell
<interface-documentation interfaceName='CsvCell' overrideSrc='csv-export/resources/csv.json'></interface-documentation>

### CsvCellData
<interface-documentation interfaceName='CsvCellData' overrideSrc='csv-export/resources/csv.json'></interface-documentation>
