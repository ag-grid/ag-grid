---
title: "Value Formatters"
---

Value formatters allow you to format values for display. This is useful when data is one type (e.g. numeric) but needs to be converted for human reading (e.g. putting in currency symbols and number formatting).

Below shows the column definition properties for value formatters.

<api-documentation source='column-properties/properties.json' section="columnsOnly" names='["valueFormatter(params)", "floatingCellFormatter(params)"]'></api-documentation>

The interface for `valueFormatter` is as follows:

```ts
// function for valueFormatter
function valueFormatter(params: ValueFormatterParams) => any;

// interface for params
interface ValueFormatterParams {
    value: any, // the value before the change
    data: any, // the data you provided for this row
    node: RowNode, // the row node for this row
    colDef: ColDef, // the column def for this column
    column: Column, // the column for this column
    api: GridApi, // the grid API
    columnApi: ColumnApi, // the grid Column API
    context: any  // the context
}

// example value formatter, simple currency formatter
colDef.valueFormatter = params => {
    return '£' + params.value;
}
```

## Value Formatter vs Cell Renderer


A [cell renderer](/component-cell-renderer/) allows you to put whatever HTML you want into a cell. This sounds like value formatters and a cell renderers have cross purposes, so you may be wondering, when do you use each one and not the other?

The answer is that value formatters are for text formatting and cell renderers are for when you want to include HTML markup and potentially functionality to the cell. So for example, if you want to put punctuation into a value, use a value formatter, but if you want to put buttons or HTML links use a cell renderer. It is possible to use a combination of both, in which case the result of the value formatter will be passed to the cell renderer.

[[note]]
| Be aware that the Value Formatter params won't always have 'data' and 'node' supplied, e.g. the
| params supplied to the Value Formatter in the [Set Filter](/filter-set/).
| As a result favour formatter implementations that rely upon the 'value' argument instead, as this
| will lead to better reuse of your Value Formatters.

## Value Formatter Example

The example below shows value formatters in action.

<grid-example title='Value Formatters' name='value-formatters' type='generated'></grid-example>

## Floating Cell Formatter

Use `floatingCellFormatter` instead of `colDef.cellFormatter` to allow different formatting for pinned rows. If you don't specify a `colDef.floatingCellFormatter`, then `cellFormatter` will get used instead if it is present.

[[note]]
| You can use the same formatter for pinned rows and normal rows and check the row type. You can check if the row is floating by checking `params.node.floating` property.
