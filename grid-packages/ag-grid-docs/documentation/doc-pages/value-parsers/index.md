---
title: "Value Parsers"
---

After editing cells in the grid you have the opportunity to parse the value before inserting it into your data. This is done using Value Parsers.

A Value Parser is the inverse of a [Value Formatter](/value-formatters/).

The parameters passed to a value parser are as follows:

```ts
// interface for params
interface ValueParserParams {
    oldValue: any, // the value before the change
    newValue: any, // the value after the change
    data: any, // the data you provided for this row
    node: RowNode, // the row node for this row
    colDef: ColDef, // the column def for this column
    column: Column, // the column for this column
    api: GridApi, // the grid API
    columnApi: ColumnApi, // the grid Column API
    context: any  // the context
}
```

The return value of a value parser should be the result of the parse, i.e. return the value you want stored in the data.

## Example: Value Parser

Below shows an example using value parsers. The following can be noted:

- All columns are editable. After any edit, the console prints the new data for that row.
- Column 'Name' is a string column. No parser is needed.
- Column 'Bad Number' is bad because after an edit, the value is stored as a string in the data, whereas the data value should be number type.
- Column 'Good Number' is good because after an edit, the value is converted to a number using the value parser.

<grid-example title='Value Parsers' name='example-parsers' type='generated' options='{ "exampleHeight": 550 }'></grid-example>
