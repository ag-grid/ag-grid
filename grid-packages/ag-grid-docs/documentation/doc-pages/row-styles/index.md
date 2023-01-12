---
title: "Row Styles"
---

Row customisation can be achieved in the following ways:

- **Row Style:** Providing a CSS style for the rows.
- **Row Class:** Providing a CSS class for the rows.
- **Row Class Rules:** Providing rules for applying CSS classes.

Each of these approaches are presented in the following sections. 

Some row styles may also be overridden with CSS variables. See the [full variable reference](/global-style-customisation-variables/).

## Row Style

You can add CSS styles to each row in the following ways:

<api-documentation source='grid-options/properties.json' section='styling' names='["rowStyle", "getRowStyle"]' ></api-documentation>

<snippet spaceBetweenProperties="true">
const gridOptions = {
    // set background colour on every row, this is probably bad, should be using CSS classes
    rowStyle: { background: 'black' },
    // set background colour on even rows again, this looks bad, should be using CSS classes
    getRowStyle: params => {
        if (params.node.rowIndex % 2 === 0) {
            return { background: 'red' };
        }
    }
}
</snippet>

## Row Class

You can add CSS classes to each row in the following ways:

<api-documentation source='grid-options/properties.json' section='styling' names='["rowClass", "getRowClass"]'></api-documentation>

<snippet spaceBetweenProperties="true">
const gridOptions = {
    // all rows assigned CSS class 'my-green-class'
    rowClass: 'my-green-class',
    // all even rows assigned 'my-shaded-effect'
    getRowClass: params => {
        if (params.node.rowIndex % 2 === 0) {
            return 'my-shaded-effect';
        }
    },
}
</snippet>

## Row Class Rules

You can define rules which can be applied to include certain CSS classes via the grid option `rowClassRules`. These rules are provided as a JavaScript map where the keys are class names and the values are expressions that if evaluated to `true`, the class gets used. The expression can either be a JavaScript function, or a string which is treated as a shorthand for a function by the grid.

<api-documentation source='grid-options/properties.json' section='styling' names='["rowClassRules"]' ></api-documentation>

The following snippet shows `rowClassRules` that use functions and the value from the year column:

<snippet>
|const gridOptions = {
|    rowClassRules: {
|        // apply green to 2008
|        'rag-green-outer': function(params) { return params.data.year === 2008; },
|
|        // apply amber 2004
|        'rag-amber-outer': function(params) { return params.data.year === 2004; },
|
|        // apply red to 2000
|        'rag-red-outer': function(params) { return params.data.year === 2000; }
|    }
|}
</snippet>

All rowStyle, rowClass and rowClassRules functions take a `RowClassParams` params object.

<interface-documentation interfaceName='RowClassParams' ></interface-documentation>


As an alternative, you can also provide shorthands of the functions using an expression.
An expression is evaluated by the grid by executing the string as if it were a Javascript expression. The expression has the following attributes available to it (mapping the the attributes of the equivalent
params object):

- `ctx`: maps context
- `node`: maps node
- `data`: maps data
- `rowIndex`: maps rowIndex
- `api`: maps the grid api

The following snippet shows `rowClassRules` applying classes to rows using expressions on an age column value:

<snippet>
const gridOptions = {
    rowClassRules: {
        'rag-green': 'data.age < 20',
        'rag-amber': 'data.age >= 20 && data.age < 25',
        'rag-red': 'data.age >= 25',
    }
}
</snippet>

## Refresh of Styles

If you refresh a row, or a cell is updated due to editing, the `rowStyle`, `rowClass` and `rowClassRules` are all applied again. This has the following effect:

- **rowStyle**: All new styles are applied. If a new style is the same as an old style, the new style overwrites the old style.
- **rowClass**: All new classes are applied. Old classes are not removed so be aware that classes will accumulate. If you want to remove old classes, then use rowClassRules.
- **rowClassRules**: Rules that return true will have the class applied the second time. Rules that return false will have the class removed second time.

## Example Row Class Rules


The example below demonstrates `rowClassRules`:

- `rowClassRules` are used to apply the class `sick-days-warning` when the number of sick days > 5 and <= 7, and the class `sick-days-breach` is applied when the number of sick days >= 8.

- The grid re-evaluates the rowClassRules when the data is changed. The example
shows changing the data in the three different ways: `rowNode.setDataValue`, `rowNode.setData` and `api.applyTransaction`. See [Updating Data](/data-update/) for details on these update functions.

<grid-example title='Row Class Rules' name='row-class-rules' type='generated'></grid-example>

## Highlighting Rows and Columns

The grid can highlight both Rows and Columns as the mouse hovers over them. 

Highlighting Rows is on by default. To turn it off, set the grid property `suppressRowHoverHighlight=true`.

Highlighting Columns is off by default. To turn it on, set the grid property `columnHoverHighlight=true`.

<snippet>
const gridOptions = {
    // turns OFF row hover, it's on by default
    suppressRowHoverHighlight: true,
    // turns ON column hover, it's off by default
    columnHoverHighlight: true
}
</snippet>

In this example Rows and Columns are highlighted.

Note if you hover over a header group, all columns in the group will be highlighted.

<grid-example title='Highlight Rows And Columns' name='highlight-rows-and-columns' type='generated'></grid-example>

In this example both Rows and Columns are not highlighted by setting.

<grid-example title='No Highlighting Rows And Columns' name='highlight-nothing' type='generated'></grid-example>

Rows highlight by default as this is a common requirement. Column highlighting is less common and as such needs to be opted it.

Row Highlighting works by the grid adding the CSS class `ag-row-hover` to the row's getting hovered. The grid cannot depend on using CSS `:hover` selector as this will not highlight the entire row if Columns are pinned.

Column Highlighting works by the grid adding the CSS class `ag-column-hover`
to all Cells to be highlighted.
