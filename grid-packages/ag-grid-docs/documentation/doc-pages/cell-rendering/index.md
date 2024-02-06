---
title: "Components in Cells"
---

By default the grid renders values into Cells as strings. If you want more complex HTML, such as a Button or Image, you use a Cell Component.



## Setting Cell Components

The Cell Component for a Column is set via `colDef.cellRenderer` and can be any of the following types:

<framework-specific-section frameworks="javascript">
|1. `undefined`: Grid renders the value as a string.
|1. `String`: The name of a cell renderer component.
|1. `Class`: Direct reference to a cell renderer component.
|1. `Function`: A function that returns either an HTML string or DOM element for display.
</framework-specific-section>

<framework-specific-section frameworks="angular">
|1. `undefined`: Grid renders the value as a string.
|1. `String`: The name of a cell renderer component.
|1. `Class`: Direct reference to a cell renderer component.
|1. `Function`: A function that returns either an HTML string or DOM element for display.
</framework-specific-section>

<framework-specific-section frameworks="vue">
|1. `undefined`: Grid renders the value as a string.
|1. `String`: The name of a registered Vue cell renderer component.
|1. `Function`: A function that returns either an HTML string or DOM element for display.
</framework-specific-section>

<framework-specific-section frameworks="react">
|1. `undefined`: Grid renders the value as a string.
|1. `String`: The name of a cell renderer component.
|1. `Class`: Direct reference to a cell renderer component.
|1. `Function`: A function that returns JSX for display.
</framework-specific-section>

Cell Components can be referenced by string or directly by class. They can be [Provided Cell Renderers](#provided-cell-renderers) (that come with the grid) or [Custom Cell Components](/component-cell-renderer/) (built by you).

The code snippet below demonstrates each of these method types.

<framework-specific-section frameworks="javascript">
<snippet spaceBetweenProperties="true">
| const gridOptions = {
|     columnDefs: [
|         // 1 - undefined - Grid renders the value as a string.
|         {
|             field: 'name',
|             cellRenderer: undefined,
|         },
|         // 2 - String - The name of a Cell Component registered with the grid.
|         {
|             field: 'age',
|             cellRenderer: 'agGroupCellRenderer',
|         },
|         // 3 - Class - Provide your own Cell Component directly without registering.
|         {
|             field: 'sport',
|             cellRenderer: MyCustomCellRendererClass,
|         },
|         // 4 - Function - A function that returns an HTML string or DOM element for display
|         {
|             field: 'year',
|             cellRenderer: params => {
|                 // put the value in bold
|                 return 'Value is &lt;b&gt;' + params.value + '&lt;/b&gt;';
|             }
|         }
|     ]
| }
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet spaceBetweenProperties="true">
| const gridOptions = {
|     columnDefs: [
|         // 1 - undefined - Grid renders the value as a string.
|         {
|             field: 'name',
|             cellRenderer: undefined,
|         },
|         // 2 - String - The name of a Cell Component registered with the grid.
|         {
|             field: 'age',
|             cellRenderer: 'agGroupCellRenderer',
|         },
|         // 3 - Class - Provide your own Cell Component directly without registering.
|         {
|             field: 'sport',
|             cellRenderer: MyCustomCellRendererClass,
|         },
|         // 4 - Function - A function that returns an HTML string or DOM element for display
|         {
|             field: 'year',
|             cellRenderer: params => {
|                 // put the value in bold
|                 return 'Value is &lt;b&gt;' + params.value + '&lt;/b&gt;';
|             }
|         }
|     ]
| }
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet spaceBetweenProperties="true">
| const gridOptions = {
|     columnDefs: [
|         // 1 - undefined - Grid renders the value as a string.
|         {
|             field: 'name',
|             cellRenderer: undefined,
|         },
|         // 2 - String - The name of a Cell Component registered with the grid.
|         {
|             field: 'age',
|             cellRenderer: 'agGroupCellRenderer',
|         },
|         // 3 - Class - Provide your own Cell Component directly without registering.
|         {
|             field: 'sport',
|             cellRenderer: MyCustomCellRendererClass,
|         },
|         // 4 - Function - A function that returns a JSX element for display
|         {
|             field: 'year',
|             cellRenderer: params => {
|                 // put the value in bold
|                 // return &lt;&gt;Value is &lt;b&gt; {params.value} &lt;/b&gt; &lt;/&gt;;
|             }
|         }
|     ]
| }
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet spaceBetweenProperties="true"> 
| const gridOptions = {
|     columnDefs: [
|         // 1 - undefined - Grid renders the value as a string.
|         {
|             field: 'name',
|             cellRenderer: undefined,
|         },
|         // 2 - String - The name of a Cell Component registered with the grid.
|         {
|             field: 'age',
|             cellRenderer: 'agGroupCellRenderer',
|         },
|         // 3 - Function - A function that returns an HTML string or DOM element for display
|         {
|             field: 'year',
|             cellRenderer: params => {
|                 // put the value in bold
|                 return 'Value is &lt;b&gt;' + params.value + '&lt;/b&gt;';
|             }
|         }
|     ]
| }
</snippet>
</framework-specific-section>


## Dynamic Selection

The `colDef.cellRendererSelector` function allows setting difference Cell Components for different Rows within a Column.

The `params` passed to `cellRendererSelector` are the same as those passed to the [Cell Renderer Component](/component-cell-renderer/). Typically the selector will use this to check the rows contents and choose a renderer accordingly.

The result is an object with `component` and `params` to use instead of `cellRenderer` and `cellRendererParams`.

This following shows the Selector always returning back a Mood Cell Renderer:

md-include:selector-common.md
md-include:selector-vue.md
 
Here is a full example.
- The column 'Value' holds data of different types as shown in the column 'Type' (numbers/genders/moods).
- `colDef.cellRendererSelector` is a function that selects the renderer based on the row data.
- The column 'Rendered Value' show the data rendered applying the component and params specified by `colDef.cellRendererSelector`

<grid-example title='Dynamic Rendering Component' name='dynamic-rendering-component' type='mixed' options='{ "exampleHeight": 335, "extras": ["fontawesome"] }'></grid-example>

## Provided Cell Components

The grid comes with some Cell Components out of the box. These provided components cover common some common complex cell rendering requirements.

- [Group Cell Component](/group-cell-renderer/): For showing group details with expand & collapse functionality when using any of the [Row Grouping](/grouping/), [Master Detail](/master-detail/) or [Tree Data](/tree-data/).

- [Show Change Cell Renderers](/change-cell-renderers/): For animating changes when data is changing.

- [Checkbox Cell Renderer](#checkbox-cell-renderer): For displaying boolean values with a checkbox.

## Checkbox Cell Renderer

Simple renderer for boolean values that uses the standard HTML checkbox `input`. The renderer also allows editing.

If editing is enabled, then it is recommended to also use the [Checkbox Cell Editor](/provided-cell-editors-checkbox/) so that the UI matches when in edit mode.

Specified with `agCheckboxCellRenderer` and configured with `ICheckboxCellRendererParams`.

<interface-documentation interfaceName='ICheckboxCellRendererParams' names='["disabled"]'></interface-documentation>

```js
columnDefs: [
    {
        cellRenderer: 'agCheckboxCellRenderer',
        cellRendererParams: {
            disabled: true,
        },
        // ...other props
    }
]
```

<grid-example title='Checkbox Cell Renderer' name='checkbox-cell-renderer' type='generated'></grid-example>


Note that if [Row Selection](/row-selection/) is enabled, it is recommended to set `suppressKeyboardEvent` on the column definition to prevent the <kbd>␣ Space</kbd> key from triggering both row selection and toggling the checkbox. This is shown in the example above.
