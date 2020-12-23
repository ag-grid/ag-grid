---
title: "CSV Export"
---

The data can be exported to CSV with an API call, or using the right-click context menu on the Grid.

[[note]]
| This page covers CSV-specific features. For information on how to control what data is included in the export
| and to format/transform the data as it is exported, see the [Export documentation](../export/).

## API

### Grid Properties

<api-documentation source='grid-properties/properties.json' section='miscellaneous' names='["suppressCsvExport"]'></api-documentation>

### Grid API

<api-documentation source='grid-api/api.json' section='export' names='["exportDataAsCsv(params)", "getDataAsCsv(params)"]'></api-documentation>

The `params` object can contain all the [common export options](../export/), as well as these CSV-specific options:

<api-documentation source='csv-export/resources/csv.json' section='exportProperties'></api-documentation>

## Appending header and footer content

The recommended way to append header and footer content is by passing an array of ExcelCell objects to `customHeader` or `customFooter`, as described in the [Export](../export/) documentation. This ensures that your header content is correctly escaped, and if your application also exports Excel data you can use the same data for both exports.

For compatibility with earlier versions of the Grid you can also pass a string, which will be inserted into the CSV file without any processing. You are responsible for formatting the string according to the CSV standard.

## Example: CSV Export Options

- `suppressQuotes` and `columnSeparator` have the effects documented above. Use the "api.getTextAsCsv()" button to see their effect, because changing their default values will prevent the file from opening properly in Excel
- With `customHeader=ExcelCell[][]`, custom content will be inserted containing commas and quotes. These commas and quotes will be visible when opened in Excel because they have been escaped properly.
- Setting `customHeader=string` causes a string to be inserted into the CSV file without any processing, and without being affected by `suppressQuotes` and `columnSeparator`. It contains commas and quotes what will not be visible in Excel.

<grid-example title='CSV Export Options' name='csv-export' type='generated' options='{ "enterprise": true, "exampleHeight": 400 }'></grid-example>
