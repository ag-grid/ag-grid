---
title: "Cell Rendering"
---

By default the grid renders values into the cells as strings. If you want something more complex you use a cell renderer.

<api-documentation source='column-properties/properties.json' section='styling' names='["cellRenderer"]'></api-documentation>

The cell renderer for a column is set via `colDef.cellRenderer` and can be any of the following types:
 
[[only-javascript]]
|1. `undefined`: Grid renders the value as a string.
|1. `String`: The name of a cell renderer component.
|1. `Class`: Direct reference to a cell renderer component.
|1. `Function`: A function that returns either an HTML string or DOM element for display.
[[only-angular]]
|1. `undefined`: Grid renders the value as a string.
|1. `String`: The name of a cell renderer component.
|1. `Class`: Direct reference to a cell renderer component.
|1. `Function`: A function that returns either an HTML string or DOM element for display.
[[only-vue]]
|1. `undefined`: Grid renders the value as a string.
|1. `String`: The name of a registered Vue cell renderer component.
|1. `Function`: A function that returns either an HTML string or DOM element for display.
[[only-react]]
|1. `undefined`: Grid renders the value as a string.
|1. `String`: The name of a cell renderer component.
|1. `Class`: Direct reference to a cell renderer component.
|1. `Function`: A function that returns JSX for display.

The code snippet below demonstrates each of these method types.

[[only-javascript-or-angular-or-react]]
| <snippet spaceBetweenProperties="true">
| const gridOptions = {
|     columnDefs: [
|         // 1 - undefined - Grid renders the value as a string.
|         {
|             field: 'name',
|             cellRenderer: undefined,
|         },
|         // 2 - String - The name of a cell renderer registered with the grid.
|         {
|             field: 'age',
|             cellRenderer: 'agGroupCellRenderer',
|         },
|         // 3 - Class - Provide your own cell renderer component directly without registering.
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
| </snippet>

[[only-vue]]
| <snippet spaceBetweenProperties="true">
| const gridOptions = {
|     columnDefs: [
|         // 1 - undefined - Grid renders the value as a string.
|         {
|             field: 'name',
|             cellRenderer: undefined,
|         },
|         // 2 - String - The name of a cell renderer registered with the grid.
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
| </snippet>


This remainder of this documentation page goes through the grid provided cell renderer's. To build your own cell renderer see the section [Cell Rendering Components](/component-cell-renderer/).

## No Cell Renderer

If you have no requirements for custom cells, then you should use no cell renderer. Having no custom cell renderers will result in the fastest possible grid, as even the simplest cell renderer will result in some extra div's in the DOM

If you just want to do simple formatting of the data (eg currency or date formatting) then you can use `colDef.valueFormatter`.

<api-documentation source='column-properties/properties.json' section='columns' names='["valueFormatter"]'></api-documentation>

## Cell Renderer Components

Cell renderer components can be referenced by string or directly by class. They can be [Provided Cell Renderers](#provided-cell-renderers) (that come with the grid) or [Custom Cell Renderers](/component-cell-renderer/) (built by you).

## Many Renderers One Column

It is also possible to use different renderers for different rows in the same column. To configure this set `colDef.cellRendererSelector` to a function that returns alternative values for `cellRenderer` and `cellRendererParams`.

The `params` passed to `cellRendererSelector` are the same as those passed to the [Cell Renderer Component](/component-cell-renderer/). Typically the selector will use this to check the rows contents and choose a renderer accordingly.

The result is an object with `component` and `params` to use instead of `cellRenderer` and `cellRendererParams`.

This following shows the Selector always returning back a Mood Cell Renderer:

[[only-javascript]]
md-include:selector-common.md
[[only-angular]]
md-include:selector-common.md
[[only-react]]
md-include:selector-common.md
[[only-vue]]
md-include:selector-vue.md

Here is a full example.
- The column 'Value' holds data of different types as shown in the column 'Type' (numbers/genders/moods).
- `colDef.cellRendererSelector` is a function that selects the renderer based on the row data.
- The column 'Rendered Value' show the data rendered applying the component and params specified by `colDef.cellRendererSelector`

<grid-example title='Dynamic Rendering Component' name='dynamic-rendering-component' type='mixed' options='{ "exampleHeight": 335 }'></grid-example>

## Example: Rendering Order

This example is configured with a custom cell render to make the order of cell rendering clear. Cells are numbered in order of rendering, and rendering function takes 10ms to execute, allowing you to see the process of incremental rendering more clearly. Note the cell values do not correspond to row or cell indexes.

Notice the following in the example below:

[[only-javascript-or-angular-or-vue]]
|- The grid remains interactive while cells are rendering. For example, you can click on any row to select it while cells are still rendering.
|- In initial rendering and when scrolling down, rows render top to bottom
|- When scrolling up, rows render bottom to top
|- Cells within a row render left to right regardless of scroll direction
|- Only visible cells are rendered. The grid contains 1000 rows and 20,000 cells. If you take about 10 seconds to scroll from the top to the bottom, only a few hundred cells will actually be rendered. Any cells that are scrolled into view and then back out of view again before they have a chance to be rendered will be skipped.

[[only-react]]
|- The grid remains interactive while cells are rendering. For example, you can click on any row to select it while cells are still rendering.
|- In initial rendering and when scrolling down, rows render top to bottom
|- When scrolling up, rows render bottom to top
|- Only visible cells are rendered. The grid contains 1000 rows and 20,000 cells. If you take about 10 seconds to scroll from the top to the bottom, only a few hundred cells will actually be rendered. Any cells that are scrolled into view and then back out of view again before they have a chance to be rendered will be skipped.

<grid-example title='Rendering Order' name='rendering-order' type='generated' ></grid-example>

## Provided Cell Renderers

The grid comes with some provided cell renderers out of the box. These cell renderers cover some common complex cell rendering requirements.

- [Group Cell Renderer](/group-cell-renderer/): For showing group details with expand & collapse functionality when using any of the [Row Grouping](/grouping/), [Master Detail](/master-detail/) or [Tree Data](/tree-data/).

- [Show Change Cell Renderers](/change-cell-renderers/): For animating changes when data is changing.

