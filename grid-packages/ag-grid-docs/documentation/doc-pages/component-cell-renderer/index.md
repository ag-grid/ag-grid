---
title: "Cell Components"
---

<framework-specific-section frameworks="javascript">
|Custom HTML / DOM inside Cells is achieved using Cell Components.
|Create Custom Cell Components to have any HTML markup
|in a cell. The grid comes with some Provided Cell Components for common grid tasks.
</framework-specific-section>

<framework-specific-section frameworks="vue">
|Custom HTML / DOM inside Cells is achieved using Cell Components.
|Create Custom Cell Components to have any HTML markup
|in a cell. The grid comes with some Provided Cell Components for common grid tasks.
</framework-specific-section>

<framework-specific-section frameworks="react">
<video-section id="9IbhW4z--mg" title="React Cell Renderers" header="true">
Custom HTML / DOM inside Cells is achieved using Cell Components.
Create Custom Cell Components to have any HTML markup
in a cell. The grid comes with some Provided Cell Components for common grid tasks.
</video-section>
</framework-specific-section>

<framework-specific-section frameworks="angular">
<video-section id="xsafnM77NVs" title="Angular Cell Renderers" header="true">
Custom HTML / DOM inside Cells is achieved using Cell Components.
Create Custom Cell Components to have any HTML markup
in a cell. The grid comes with some Provided Cell Components for common grid tasks.
</video-section>
</framework-specific-section>

The example below shows some Custom Cell Components.

<grid-example title='Simple Cell Renderer' name='simple' type='mixed' options='{ "exampleHeight": 460 }'></grid-example>

## Custom Components

md-include:component-interface-angular.md
md-include:component-interface-javascript.md
md-include:component-interface-react.md
md-include:component-interface-vue.md

<framework-specific-section frameworks="javascript,angular,vue">
<interface-documentation interfaceName='ICellRendererParams' config='{"description":""}' ></interface-documentation>
</framework-specific-section>
<framework-specific-section frameworks="react">
<interface-documentation interfaceName='CustomCellRendererProps' config='{"description":""}' ></interface-documentation>
</framework-specific-section>

md-include:params_vue.md

<note>
Note that if [Row Selection](/row-selection/) is enabled, it is recommended to set `suppressKeyboardEvent` on the column definition to prevent the <kbd>␣ Space</kbd> key from triggering both row selection and toggling the checkbox.
</note>

## Provided Components

The grid comes with some Cell Components out of the box. These Provided Cell Components cover common some common complex cell rendering requirements.

- [Group Cell Component](/group-cell-renderer/): For showing group details with expand & collapse functionality when using any of the [Row Grouping](/grouping/), [Master Detail](/master-detail/) or [Tree Data](/tree-data/).

- [Show Change Cell Renderers](/change-cell-renderers/): For animating changes when data is changing.

- [Checkbox Cell Renderer](/cell-data-types/): For displaying boolean values with a checkbox when `cellDataType` of Boolean is used.


## Selecting Components

The Cell Component for a Column is set via `colDef.cellRenderer` and can be any of the following types:

<framework-specific-section frameworks="javascript">
|1. `String`: The name of a cell renderer component.*
|1. `Class`: Direct reference to a cell renderer component.
|1. `Function`: A function that returns either an HTML string or DOM element for display.
</framework-specific-section>

<framework-specific-section frameworks="angular">
|1. `String`: The name of a cell renderer component.*
|1. `Class`: Direct reference to a cell renderer component.
|1. `Function`: A function that returns either an HTML string or DOM element for display.
</framework-specific-section>

<framework-specific-section frameworks="vue">
|1. `String`: The name of a registered Vue cell renderer component.*
|1. `Function`: A function that returns either an HTML string or DOM element for display.
</framework-specific-section>

<framework-specific-section frameworks="react">
|1. `String`: The name of a cell renderer component.*
|1. `Class`: Direct reference to a cell renderer component.
|1. `Function`: A function that returns JSX for display.
</framework-specific-section>

*If referenced by name then the Cell Component must [first be registered](/components/#registering-custom-components).

The code snippet below demonstrates each of these method types.

<framework-specific-section frameworks="javascript">
<snippet spaceBetweenProperties="true">
| const gridOptions = {
|     columnDefs: [
|         // 1 - String - The name of a Cell Component registered with the grid.
|         {
|             field: 'age',
|             cellRenderer: 'agGroupCellRenderer',
|         },
|         // 2 - Class - Provide your own Cell Component directly without registering.
|         {
|             field: 'sport',
|             cellRenderer: MyCustomCellRendererClass,
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

<framework-specific-section frameworks="angular">
<snippet spaceBetweenProperties="true">
| const gridOptions = {
|     columnDefs: [
|         // 1 - String - The name of a Cell Component registered with the grid.
|         {
|             field: 'age',
|             cellRenderer: 'agGroupCellRenderer',
|         },
|         // 2 - Class - Provide your own Cell Component directly without registering.
|         {
|             field: 'sport',
|             cellRenderer: MyCustomCellRendererClass,
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

<framework-specific-section frameworks="react">
<snippet spaceBetweenProperties="true">
| const gridOptions = {
|     columnDefs: [
|         // 1 - String - The name of a Cell Component registered with the grid.
|         {
|             field: 'age',
|             cellRenderer: 'agGroupCellRenderer',
|         },
|         // 2 - Class - Provide your own Cell Component directly without registering.
|         {
|             field: 'sport',
|             cellRenderer: MyCustomCellRendererClass,
|         },
|         // 3 - Function - A function that returns a JSX element for display
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
|         // 1 - String - The name of a Cell Component registered with the grid.
|         {
|             field: 'age',
|             cellRenderer: 'agGroupCellRenderer',
|         },
|         // 2 - Function - A function that returns an HTML string or DOM element for display
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


## Custom Props

The `props` passed to the Cell Component can be complimented with custom props. This allows configuring reusable Cell Components - e.g. a component could have buttons that are optionally displayed via additional props.

Compliment props to a cell renderer using the Column Definition attribute  `cellRendererParams`. When provided, these props will be merged with the grid provided props.

md-include:complementing-component-javascript.md
md-include:complementing-component-angular.md
md-include:complementing-component-react.md
md-include:complementing-component-vue.md

md-include:renderer-function-javascript.md
md-include:renderer-function-angular.md
md-include:renderer-function-vue.md 

<framework-specific-section frameworks="javascript">
<note>
| You might be wondering how the grid knows if you have provided a Cell Renderer component class or
| a simple function, as JavaScript uses functions to implement classes. The answer is the grid looks
| for the `getGui()` method in the prototype of the function (a mandatory method in the cell renderer
| interface). If the `getGui()` method exists, it assumes a component, otherwise it assumes a function.
</note>
</framework-specific-section>

## Complex Example

The example below combines many of the features above and shows the following:

- `Max Temp` and `Min Temp` columns uses a function Cell Component.
- `Sunshine`, `Frost`, and `Rainfall` use functions to display icons.
- `Randomise Frost` button triggers the cell components to refresh by randomising the frost data.

<grid-example title='Cell Renderer' name='cell-renderer' type='mixed'></grid-example>

## Accessing Instances

After the grid has created an instance of a Cell Component for a cell it is possible to access that instance. This is useful if you want to call a method that you provide on the Cell Component that has nothing to do with the operation of the grid. Accessing Cell Components is done using the grid API `getCellRendererInstances(params)`.

<api-documentation source='grid-api/api.json' section='rendering' names='["getCellRendererInstances"]' ></api-documentation>

An example of getting the Cell Component for exactly one cell is as follows:

<snippet transform={false}>
|// example - get cell renderer for first row and column 'gold'
|const firstRowNode = api.getDisplayedRowAtIndex(0);
|const params = { columns: ['gold'], rowNodes: [firstRowNode] };
|const instances = api.getCellRendererInstances(params);
|
|if (instances.length > 0) {
|    // got it, user must be scrolled so that it exists
|    const instance = instances[0];
|}
</snippet>

Note that this method will only return instances of the Cell Component that exists. Due to Row and Column Virtualisation, Cell Components will only exist for Cells that are within the viewport of the Vertical and Horizontal scrolls.

The example below demonstrates custom methods on Cell Components called by the application. The following can be noted:

- The medal columns are all using the user defined `MedalCellRenderer`. The Cell Component has an arbitrary method `medalUserFunction()` which prints some data to the console.
- The **Gold** method executes a method on all instances of the Cell Component in the gold column.
- The **First Row Gold** method executes a method on the gold cell of the first row only. Note that the `getCellRendererInstances()` method will return nothing if the grid is scrolled far past the first row showing row virtualisation in action.
- The **All Cells** method executes a method on all instances of all Cell Components.

<grid-example title='Get Cell Renderer' name='get-cell-renderer' type='mixed'></grid-example>

<framework-specific-section frameworks="react">
<note>
Note that the hook version of the above example makes use of `useImperativeHandle` to expose methods to the grid (and other components). Please
refer to the [hook specific](../react-hooks/) documentation for more information.
</note>
</framework-specific-section>

