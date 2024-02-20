---
title: "Text Formatting"
---

Use a Value Formatter to provide text formatting of values.

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        // simple currency formatter
        { field: 'price', valueFormatter: p => '$' + params.value },
        // simple UPPER CASE formatter
        { field: 'code', valueFormatter: p => params.value.toUpperCase() }
    ]
}
</snippet>

## Value Formatter Definition

Below shows the column definition properties for value formatters.

<api-documentation source='column-properties/properties.json' section="columns" names='["valueFormatter"]' ></api-documentation>

Be aware that the Value Formatter params won't always have 'data' and 'node' supplied, e.g. the
params supplied to the Value Formatter in the [Set Filter](../filter-set/).
As a result favour formatter implementations that rely upon the 'value' argument instead, as this
will lead to better reuse of your Value Formatters.

<note>
If using [Cell Data Types](../cell-data-types/), value formatters are set by default to handle the display of each of the different data types.
</note>


If you want more than text formatting, e.g. you need Buttons in the Cell, then use a [Cell Component](/component-cell-renderer/).


The example below shows value formatters in action.

 - Columns `A` and `B` display the value of the `field` property
 - Columns `£A` and `£B` use a `currencyFormatter` to display the value as a currency
 - Columns`(A)` and `(B)` use a `bracketsFormatter` to display the value inside brackets

<grid-example title='Value Formatters' name='value-formatters' type='generated'></grid-example>

## Formating for Export

By default, the grid uses the value formatter when performing other grid operations that need values in string format.

This behaviour can be prevented by setting the column definition property `useValueFormatterForExport = false` (note this does not apply to rendering).

<api-documentation source='column-properties/properties.json' section="display" names='["useValueFormatterForExport"]' ></api-documentation>

Using the value formatter for export applies to the following features:
- [Copy/Cut](/clipboard/#processing-pasted-data)
- [Fill Handle](/range-selection-fill-handle/)
- [Copy Range Down](/range-selection/#copy-range-down)
- [CSV Export](/csv-export/)
- [Excel Export](/excel-export-customising-content/)

Using a value formatter for export is normally used in conjunction with [Using a Value Parser for Import](/value-parsers/#use-value-parser-for-import), where a [Value Parser](/value-parsers/) is defined that does the reverse of the value formatter.

The following example demonstrates the default behaviour using the value formatter for export with each of the supported features mentioned above.

<grid-example title='Use Value Formatter for Export' name='use-value-formatter-for-export' type='generated' options='{ "enterprise": true, "modules": ["clientside", "range", "clipboard", "excel", "menu"] }'></grid-example>

Note that if any of the following conditions are true, then `useValueFormatterForExport` is ignored for that feature and the value will be either the original value or that set in the custom handler:
- If `processCellForClipboard` is provided when using copy/cut.
- If `fillOperation` is provided when using fill handle.
- If `processCellForClipboard` is provided when using copy range down.
- If `processCellCallback` is provided when using CSV export.
- If `processCellCallback` or [Excel Data Types](/excel-export-data-types/) are provided when using Excel export.
- If the underlying value is a number when using Excel export. To export formatted number values to Excel, please use the [Excel Data Type](/excel-export-data-types/#strings-number-and-booleans) feature.
