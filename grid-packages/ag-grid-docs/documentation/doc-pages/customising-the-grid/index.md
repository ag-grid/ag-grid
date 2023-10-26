---
title: "Customising the Grid"
---

This tutorial is designed to demonstrate how to style, customise and extend the grid.

_Note: We recommend completing the [introductory tutorial](/deep-dive) first._

## Overview

In this tutorial you will:

- Customise the look and feel of the grid
- Format grid values
- Customise cell content
- Handle cell editing ___(Not sure if this fits here...)___

Once complete, you will have a custom styled grid, with formatted currency values and manufacturer logos in place of names in the make column:

***TODO: Add grid example***

## Theming & Styling

Themes are simply CSS classes and there are currently five themes to choose from:

- [Alpine](https://www.ag-grid.com/example/?theme=ag-theme-alpine)
- [Alpine Dark](https://www.ag-grid.com/example/?theme=ag-theme-alpine-dark)
- [Balham](https://www.ag-grid.com/example/?theme=ag-theme-balham)
- [Balham Dark](https://www.ag-grid.com/example/?theme=ag-theme-balham-dark)
- [Material](https://www.ag-grid.com/example/?theme=ag-theme-material)

To use a theme, set the classname of the grid's parent div to the name of the theme, as outlined in the [first tutorial](/deep-dive/). For example, to use the `ag-theme-material` theme:

<snippet transform={false} language="jsx">
|&lt;div className="ag-theme-material" style={{ width: 600, height: 500 }}>
|  &lt;AgGridReact ... />
|&lt;/div>
</snippet>

### Customising Themes

All themes can be customised by modifying CSS variables. Let's explore this by creating a new `ag-theme-custom.css` file with the following variables:

<snippet transform={false} language=css>
|.ag-theme-custom {
|  --ag-foreground-color: #fff !important;
|  --ag-secondary-foreground-color: #c6c6c6 !important;
|  --ag-header-foreground-color: #fff !important;
|  --ag-background-color: #313131 !important;
|  --ag-header-background-color: #313131 !important;
|  --ag-column-hover-color:#15266b !important;
|  --ag-row-hover-color: #6750A4 !important;
|  --ag-header-cell-hover-background-color: #313131 !important;
|}
</snippet>

_Note: The file must be named `ag-theme-*` or it will not be picked up by the grid. Read more in our [Customisation Guide](/global-style-customisation/#creating-a-reusable-package-of-design-customisations)_

We can then add this class to our grid to modify the existing theme:

<snippet transform={false} language=jsx>
|return (
|  &lt;div className="ag-theme-custom" style={{ width: 600, height: 500 }}>
|    &lt;AgGridReact ... />
|  &lt;/div>
|);
</snippet>

We should now have a dark grid, with a purple highlight when hovering rows, that still uses the base Material theme:

***TODO: Example of grid w/ custom CSS***

_Note: Refer to our [documentation](#) for a full list of CSS variables_

### Styling Rows & Cells

Themes are used to configure the default look and feel of the grid. We can also style rows & cells directly, in one of three ways:

- __Styles:__ Apply CSS to the row / cell directly ___(not recommended)___
- __Classes:__ Apply CSS to the row / cell via classes
- __Class Rules:__ Conditionally apply CSS based on arbitrary conditions
  
Rows & Cells are styled in the same way, however, Row Styles are applied directly to the grid via the `rowStyle`, `rowClass` and `rowClassRules` props, whereas Cell Styles are applied via `cellStyle`, `cellClass` and `cellClassrules` properties within the `colDefs` array.

First, let's take a look at applying Styles & Classes to Rows:

<snippet transform={false} language=jsx>
|const rowStyle = { background: 'red' }; // Apply Styles Directly
|const rowClass = 'my-green-class'; // Apply CSS Class
|
|return (
|  &lt;div className="ag-theme-custom" style={{ width: 600, height: 500 }}>
|    &lt;AgGridReact rowStyle={rowStyle} rowClass={rowClass} />
|  &lt;/div>
|);
</snippet>

And the same with Cells:

<snippet transform={false} language=jsx>
|const [colDefs] = useState([
|  { field: "make" },
|  {
|    field: "model",
|    cellClass: 'my-class' // Apply CSS Class
|  },
|  {
|    field: "price",
|    cellStyle: { background: 'red' } // Apply Styles Directly
|  }
|]);
|
|return (
|  &lt;div className="ag-theme-custom" style={{ width: 600, height: 500 }}>
|    &lt;AgGridReact colDefs={colDefs} />
|  &lt;/div>
|);
</snippet>

_Note: Refer to our documentation for more detail on [Row Styles]() / [Row Classes]() and [Cell Styles]() / [Cell Classes]()_

Styles & Classes are the easiest way to configure rows & cells, but we can also use Class Rules to conditionally format the grid.

Class Rules are JavaScript maps where the keys are classnames and the values are functions that describe when the classnames should be applied. The functions should accept a `RowClassParams` / `CellClassParams` object that can then be used to conditionally format the row, based on the data contained within it.

We'll start with Row Class Rules, which are passed directly to the grid via the `rowClassRules` prop. Let's start by creating our `rowClassRules` object which contains the logic for the CSS classes and passing this to the grid:

<snippet transform={false} language=jsx>
|const rowClassRules = {
|  'rag-green-outer': (params) => { return params.data.make === 'Ford'; },
|  'rag-amber-outer': (params) => { return params.data.make === 'Toyota'; }
|};
|
|return (
|  &lt;div className="ag-theme-custom" style={{ width: 600, height: 500 }}>
|    &lt;AgGridReact rowClassRules={rowClassRules} />
|  &lt;/div>
|);
</snippet>

In this example, we're using the params.data.make property to conditionally format the row based on the data within the make column.

_Note: Refer to our [Row Class Rules](/row-styles/#row-class-rules) documentation for a full list of properties available on the `RowClassParams` object._

We then need to add the `rag-green-outer` and `rag-amber-outer` styles to our `ag-theme-custom.css` file:

<snippet transform={false} language=css>
|.rag-green-outer {
|  background-color: blue !important;
|}
|
|.rag-amber-outer {
|  background-color: red !important;
|}
</snippet>

Cell Class Rules are used in a similar way, but are passed to the grid via the Column Defs prop. Let's apply the same logic using the slightly different approach for Cell Class Rules:

<snippet transform={false} language=jsx>
|const [colDefs] = useState([
|  { field: "make" },
|  { field: "model" },
|  {
|    field: "price",
|    cellClassrules: {
|      'rag-green-outer': params => return params.data.price > 20000,
|      'rag-amber-outer': params => return params.data.price < 20000
|    }
|]);
|
|return (
|  &lt;div className="ag-theme-custom" style={{ width: 600, height: 500 }}>
|    &lt;AgGridReact colDefs={colDefs} />
|  &lt;/div>
|);
</snippet>

Putting this all together, we should have a grid that applies CSS to rows & cells directly and, where appropriate, styles rows/cells based on their values:

***TODO: Grid Example, styles, classes and class rules***

### Design Tools

We have several tools to help modify the look and feel of the grid:

- __Figma Design System:__ ...
- __Theme Builder:__ ...

## Formatting Grid Values

The data displayed within a grid usually requires some formatting to help improve UX. We can easily format our `rowData` using Value Formatters. Let's explore this by formatting the price column so that it displays the currency. Value Formatters are a property within the `colDefs` array, so in order to format the price column, we need to add a `valueFormatter` to our price property within `colDefs`, like so:

<snippet transform={false} language=jsx>
|const [colDefs] = useState([
|  { field: "make" },
|  { field: "model" },
|  {
|    field: "price",
|    valueFormatter: params => return '£' + params.value;
|  }
|]);
|
|return (
|  &lt;div className="ag-theme-custom" style={{ width: 600, height: 500 }}>
|    &lt;AgGridReact colDefs={colDefs} />
|  &lt;/div>
|);
</snippet>

The grid should now display the price with the '£' symbol added:

***TODO: Grid Example Value Formatter***

## Custom Components in Cells

Value Formatters are for text formatting, but what if we require more complex control over the cell content? This is where Cell Renderers come in, which can be used to include HTML markup, and functionality, within a cell.

Cell Renderers, like Value Formatters, are set via the `colDef` array with the `cellRenderer` property. Cell renderers can be any of the following types:

- __Undefined:__ Value is rendered as a string
- __String:__ Name of cell renderer component
- __Class:__  Direct reference to cell renderer component
- __Function:__ A function that returns a HTML String or DOM element

In the interest of brevity, we'll be using ...

Let's demonstrate this by creating a custom Cell Renderer that replaces the manufacturer string with their logo. First, we need to create our Cell Renderer component, which should accept a `props` variable, which contains information about the cell:

<snippet transform={false} language=jsx>
|// Define Cell Renderer
|const ManufacturerLogoCellRenderer = (props) => {
|  return (
|    &lt;span>
|      { props.value === 'Ford' && &lt;img src='/ford-logo.jpeg' height={30}>&lt;/img> }
|      { props.value === 'Toyota' && &lt;img src='/toyota-logo-svg-vector.svg' height={30}>&lt;/img> }
|      { props.value === 'Porsche' && &lt;img src='/porsche-logo.png' height={30}>&lt;/img> }
|    &lt;/span>
|  );
|}
|
|const [colDefs] = useState([
|  {
|    field: "make",
|    cellRenderer: ManufacturerLogoCellRenderer // Add CellRenderer to 'make' column
|  },
|  { field: "model" },
|  { field: "price" }
|]);
|
|return (
|  &lt;div className="ag-theme-custom" style={{ width: 600, height: 500 }}>
|    &lt;AgGridReact colDefs={colDefs} />
|  &lt;/div>
|);
</snippet>

Now, when we run the grid, we should see a manufacturer logo in place of to name:

***TODO: Cell Renderer Example***

## Handling Cell Editing (?)

## Summary

## Next Steps
