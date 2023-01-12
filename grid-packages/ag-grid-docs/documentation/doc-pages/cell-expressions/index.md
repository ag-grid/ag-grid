---
title: "Cell Expressions"
---

Expressions can be used in two different ways as follows:

1. **Column Definition Expressions:** Inside column definitions instead of functions for `valueGetter`, `valueSetter`, `valueFormatter` and `valueParser`.

1. **Cell Expressions:** Inside cells within the grid, similar to placing expressions in cells in Excel.

## Column Definition Expressions

Expressions can be used inside column definitions instead of using functions for the getters, setters, formatters and parsers. To use an expression instead of a function, just put what the body of the function into a string.

<snippet>
const gridOptions = {
    columnDefs: [
        // column definition using standard functions
        {
            field: 'employee',
            valueGetter: params => params.data.firstName,
            valueFormatter: params => params.value.toUpperCase(),
        },
        // column definition using expressions
        {
            field: 'manager',
            valueGetter: 'data.firstName',
            valueFormatter: 'value.toUpperCase()'
        }
    ]
}
</snippet>

## Example Column Definition Expressions

In this example string expressions are used instead of functions for `valueGetter`, `valueSetter`, `valueFormatter` and `valueParser`.

<grid-example title='Column Definition Expressions' name='column-definition-expressions' type='mixed' options='{ "exampleHeight": 560 }'></grid-example>

## Variables to Expressions

The following variables are available to the expression with the following params mapping:

- `x` => Mapped from params.value
- `value` => Mapped from params.value
- `oldValue` => Mapped from params.oldValue
- `newValue` => Mapped from params.newValue
- `node` => Mapped from params.node
- `data` => Mapped from params.data
- `colDef` => Mapped from params.colDef
- `column` => Mapped from params.column
- `columnGroup` => Mapped from params.columnGroup
- `getValue` => Mapped from params.getValue
- `api` => Mapped from params.api
- `columnApi` => Mapped from params.columnApi
- `ctx` => Mapped from params.context


For example, for `valueFormatter`'s, you can access to the value via the 'x' and 'value' attributes. However in `valueGetter`'s, the 'x' and 'value' will be undefined as these are not part of the `valueGetter` params.

## Column Definition Expressions vs Functions

Expressions and functions are two ways of achieving identical results. So why have two methods?

The advantage of functions is that they are easier to work with for you. Functions will be treated by your IDE as functions and thus benefit from compile time checks, debugging e.t.c.


The advantage of expressions are:

- They keep your column definitions as simple JSON objects (just strings, no functions) which makes them candidates for saving in offline storage (eg storing a report definition in a database).
- They make the definitions more compact, thus may make your code more maintainable.

## Cell Expressions

Above we saw how you can have `expressions` instead of `valueGetters`. A shortcoming of this approach is that the expression belongs to the column and cannot be defined as part of the data, or in other words, the expression is for the entire column, it cannot be set to a particular cell.

Cell Expressions bring the expression power to the cell level, so your grid can act similar to how spreadsheets work.

[[note]]
| Although you can put expressions into cells like Excel, the intention is that your application
| will decide what the expressions are. It is not intended that you give this power to your user
| and have the cells editable. This is because AG Grid is not trying to give Excel expressions
| to the user, rather AG Grid is giving you, the developer, the power to design reports and
| include JavaScript logic inside the cells.

To enable cell expressions, set `enableCellExpressions=true` in the gridOptions. Then, whenever the grid comes across a value starting with '=', it will treat it as an expression.


The cell expressions have the same parameters of value getter expressions.

Because you have access to the context (ctx) in your expression, you can add functions to the context to be available in your expressions. This allows you limitless power in what you can calculate for your expression. For example, you could provide a function that takes values from outside of the grid.

## Example Cell Expressions

This example demonstrates cell expressions. The second column values in the LHS (Left Hand Side) grid all have expressions. The following can be noted:

- 'Number Squared' and 'Number x 2' both take the number from the header as an input.
- 'Today's Date' prints the date.
- 'Sum A' and 'Sum B' both call a user provided function that is attached to the context.

<grid-example title='Cell Expressions' name='cell-expressions' type='typescript' options='{ "exampleHeight": 455, "theme": "ag-theme-alpine-dark" }'></grid-example>

## How Expressions Work

When you provide and expression to the grid, the grid converts the expression into a function for you and then executes the function. Consider the example below, the example provides `data.firstName` as the expression. This snippet of code then gets wrapped into a function with all the params attributes as function attributes.

```js
// this is a simple expression on the column definition
colDef.valueGetter = 'data.firstName';

// the grid will then compile the above to this:
___compiledValueGetter = (node, data, colDef, column, api, columnApi, context, getValue) => {
    return data.firstName;
}
```

If your expression has the word `return` in it, then the grid will assume it is a multi line expression and will not wrap it.

If your valueGetter does not have the word 'return' in it, then the grid will insert the 'return' statement and the ';' for you.

If your expression has many lines, then you will need to provide the ';' at the end of each line and also provide the 'return' statement.
