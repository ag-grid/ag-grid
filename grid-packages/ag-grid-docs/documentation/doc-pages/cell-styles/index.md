---
title: "Cell Styles"
---

Cell customisation is done a the column level via the column definition. You can mix and match any of the following mechanisms:


- **Cell Style:** Providing a CSS style for the cells.
- **Cell Class:** Providing a CSS class for the cells.
- **Cell Class Rules:** Providing rules for applying CSS classes.

Each of these approaches are presented in the following sections.

Some cell styles may also be overridden with CSS variables. See the full [CSS variables reference](/global-style-customisation-variables/).

## Cell Style

Used to provide CSS styles directly (not using a class) to the cell. Can be either an object
of CSS styles, or a function returning an object of CSS styles.

<api-documentation source='column-properties/properties.json' section='styling' names='["cellStyle"]' ></api-documentation>

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        // same style for each row
        {
            headerName: 'Static Styles',
            field: 'static',
            cellStyle: {color: 'red', 'background-color': 'green'}
        },
        // different styles for each row
        {
            headerName: 'Dynamic Styles',
            field: 'dynamic',
            cellStyle: params => {
                if (params.value === 'Police') {
                    //mark police cells as red
                    return {color: 'red', backgroundColor: 'green'};
                }
                return null;
            }
        },
    ]
}
</snippet>


## Cell Class


Provides a class for the cells in this column. Can be a string (a class), array of strings
(array of classes), or a function (that returns a string or an array of strings).

<api-documentation source='column-properties/properties.json' section='styling' names='["cellClass"]' ></api-documentation>

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        // return same class for each row
        {
            headerName: 'Static Class',
            field: 'static',
            cellClass: 'my-class'
        },
        // return same array of classes for each row
        {
            headerName: 'Static Array of Classes',
            field: 'staticArray',
            cellClass: ['my-class1','my-class2'],
        },
        // return class based on function
        {
            headerName: 'Function Returns String',
            field: 'function',
            cellClass: params => {
                return params.value === 'something' ? 'my-class-1' : 'my-class-2';
            },
        },
        // return array of classes based on function
        {
            name: 'Function Returns Array',
            field: 'functionArray',
            cellClass: params => ['my-class-1','my-class-2'],
        }
    ]
}
</snippet>

## Cell Class Rules


You can define rules which can be applied to include certain CSS classes via `colDef.cellClassRules`.
These rules are provided as a JavaScript map where the keys are the class names and the values are expressions
that if evaluated to true, the class gets used. The expression can either be a JavaScript function,
or a string which is treated as a shorthand for a function by the grid.


<api-documentation source='column-properties/properties.json' section='styling' names='["cellClassRules"]' ></api-documentation>

The following snippet is cellClassRules using functions on a year column:


<snippet suppressFrameworkContext="true">
const gridOptions = {
    columnDefs: [
        {
            field: 'year',
            cellClassRules: {
                // apply green to 2008
                'rag-green-outer': params => params.value === 2008,
                // apply amber 2004
                'rag-amber-outer': params => params.value === 2004,
                // apply red to 2000
                'rag-red-outer': params => params.value === 2000,
            }
        }
    ]
}
</snippet>

## Cell Style, Cell Class & Cell Class Rules Params


All cellClass cellStyle and cellClassRules functions take a `CellClassParams`.

<interface-documentation interfaceName='CellClassParams' ></interface-documentation>

As an alternative, you can also provide shorthands of the functions using an expression.
The column Age in the example uses expressions. An expression is evaluated by the grid
by executing the string as if it were a Javascript expression. The expression
has the following attributes available to it (mapping the the attributes of the equivalent
params object):

- `x`: maps value
- `ctx`: maps context
- `node`: maps node
- `data`: maps data
- `colDef`: maps colDef
- `rowIndex`: maps rowIndex
- `api`: maps the grid api

In other words, x and ctx map value and context, all other attributes map the parameters of the same name.

The following snippet is cellClassRules using expressions on an age column:

<snippet suppressFrameworkContext="true">
const gridOptions = {
    columnDefs: [
        {
            field: 'age',
            cellClassRules: {
                'rag-green': 'x < 20',
                'rag-amber': 'x >= 20 && x < 25',
                'rag-red': 'x >= 25',
            }
        }
    ]
}
</snippet>

## Refresh of Styles

If you refresh a cell, or a cell is updated due to editing, the cellStyle,
cellClass and cellClassRules are all applied again. This has the following
effect:

- `cellStyle`: All new styles are applied. If a new style is the same as an old style, the new style overwrites the old style. If a new style is not present, the old style is left (the grid will NOT remove styles).
- `cellClass`: All new classes are applied. Old classes are not removed so be aware that classes will accumulate. If you want to remove old classes, then use cellClassRules.
- `cellClassRules`: Rules that return true will have the class applied the second time. Rules that return false will have the class removed second time.

[[note]]
| If you are using cellStyle to highlight changing data, then please take note that grid will not remove styles. For example if you are setting text color to 'red' for a condition, then you should explicitly set it back to default eg 'black' when the condition is not met. Otherwise the highlight will remain once it's first applied.
|
| ```js
| // unsafe, the red will stay after initially applied
| cellStyle: params => params.value > 80 ? { color: 'red' } : null
| ```
|
| ```js
| // safe, to black will override the red when the condition is not true
| cellStyle: params => params.value > 80 ? { color: 'red' } : { color: 'black' }
| ```

## Cell Styling Example

Below shows both cssClassRules snippets above in a full working example. The example demonstrates the following:

- Age uses `cellClassRules` with expressions (strings instead of functions). Editing the cell will update the style.
- Year uses `cellClassRules` with functions. Editing the cell will update the style.
- Date and Sport use `cellClass`, Date sets explicitly, Sport sets using a function. Because a function is used for Sport, it can select class based on data value. Editing Sport will have undetermined results as the class values will accumulate.
- Gold sets `cellStyle` implicitly. It is not dependent on the cell value.
- Silver and Bronze set `cellStyle` using a function and depends on the value. Editing will update the cellStyle.

<grid-example title='Cell Styling' name='cell-styling' type='mixed'></grid-example>
