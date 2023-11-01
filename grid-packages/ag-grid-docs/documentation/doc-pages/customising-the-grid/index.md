---
title: "Customising the Grid"
---

This tutorial demonstrates how to style, customise and extend the grid.

<note disableMarkdown='true'>To follow this tutorial <a href='#'>Clone our Starter Template</a> or <a href='#'>Fork the CodeSandbox Example</a>.</note>

## Overview

In this tutorial you will:

1. [Pick a theme](/customising-the-grid/#choosing-a-theme)
2. [Style rows & cells](/customising-the-grid/#styling-rows--cells)
3. [Apply styles dynamically](/customising-the-grid/#applying-styles-dynamically)
4. [Format grid values](/customising-the-grid/#formatting-cell-values)
5. [Add custom content to Cells](/customising-the-grid/#custom-cell-content)

Once complete, you will have a grid with formatted price & date values, component in place of the country values and custom styles applied to rows & cells. 

Try it out for yourself by editing the country, success, price or date columns to see the styles update in real-time:

<grid-example title='Full Example' name='fully-customised-example' type='generated' options='{ "exampleHeight": 450 }'></grid-example>

## Theming & Styling

There are three ways to style the grid:

- __Themes:__ CSS Classes which style all elements, including rows and cells.
- __Styles:__ Applies CSS classes to rows or cells.
- __Class Rules:__ Applies Styles to rows or cells based on their value.

### Choosing a Theme

All grids require a theme and we provide 5 themes out-of-the-box: [Alpine](https://www.ag-grid.com/example/?theme=ag-theme-alpine), [Alpine Dark](https://www.ag-grid.com/example/?theme=ag-theme-alpine-dark), [Balham](https://www.ag-grid.com/example/?theme=ag-theme-balham), [Balham Dark](https://www.ag-grid.com/example/?theme=ag-theme-balham-dark), and [Material](https://www.ag-grid.com/example/?theme=ag-theme-material). To use a theme, set the classname of the div that contains the grid to the name of the theme:

<snippet transform={false} language="jsx">
|&lt;div className="ag-theme-material" style={{ width: 600, height: 500 }}>
|  &lt;AgGridReact ... />
|&lt;/div>
</snippet>

_Note: Themes can be customised by overriding [CSS variables](/global-style-customisation-variables/), or you can [create your own theme](/global-style-customisation/#creating-a-reusable-package-of-design-customisations) entirely. Read our [Style Customisation](/global-style-customisation/) guide for more info._

### Styling Rows & Cells

CSS classes can be applied to rows or cells by using __Row Classes__ and __Cell Classes__.

__Row Classes__ are defined using the `rowClass` prop, with our CSS classname as the value. Let's test this out by creating a new `styles.css` file with a `.row` selector to control the font of our rows:

<snippet transform={false} language="css">
.row {
  font-family: 'Courier New';
}
</snippet>

And then setting the value of the `rowClass` prop to the `.row` selector:

<snippet transform={false} language="jsx">
|&lt;div className="ag-theme-material" style={{ width: 600, height: 500 }}>
|  &lt;AgGridReact ... rowClass='row' />
|&lt;/div>
</snippet>

All rows should now use the <span style="font-family: 'Courier New'">Courier New</span> font:

***TODO: Add example w/ row fonts***

Cell Styles work in the same way but are applied via colDefs so that we can control the cells which the styles are applied to. Let's add a new selector to `styles.css` to control the font of the 'Mission' column:

<snippet transform={false} language="css">
.mission-cell {
  font-weight: 900;
}
</snippet>

And then setting the value of the `cellClass` prop on the 'Mission' column to the `.mission-cell` selector:

<snippet transform={false} language="jsx">
|const [colDefs] = useState([
|  {
|    field: "mission",
|    resizable: false,
|    cellClass: 'mission-row' // Apply 'mission-row' class to cells within this column
|  },
|  ...
|]);
</snippet>

We should now see our mission column with a heavy font-weight:

***TODO: Add example w/ cell font weight***

### Applying Styles Dynamically

Styles can be dynamically applied to rows or cells using __Row Class Rules__ and __Cell Class Rules__, respectively. 

Class Rules are applied in the same way as classes, but rather than supplying the selector name, we provide a JavaScript map where the keys are the selectors and the values are functions that describe when the selectors should be applied.

Let's try this out by adding a few new selectors to our `styles.css` file to control the colour of the row when hovered:

<snippet transform={false} language="css">
|.successful-mission:hover {
|  background: green;
|}
|
|.unsucessful-mission:hover {
|  background: red;
|}
</snippet>

And then creating a map to apply these classes based on the value of the 'Sucessful' column:

<snippet transform={false} language="jsx">
|const rowClassRules = {
|  'unsucessful-mission': (p: RowClassParams) => { return p.data.successful === false },
|  'successful-mission': (p: RowClassParams) => { return p.data.successful === true }
|}
|
|&lt;div className="ag-theme-material" style={{ width: 600, height: 500 }}>
|  &lt;AgGridReact ... rowClassRules=rowClassRules />
|&lt;/div>
</snippet>

We should now see that rows are either green or red when hovered, depending on the value of the 'succesful' column:

***TODO: Example using row class rules***

As with Cell Classes, __Cell Class Rules__ work in the same way as __Row Class Rules__ but are applied via the `colDefs` array instead, so that we can control the cells that the rules are applied to.

Let's try this out by adding a few new selectors to our `styles.css` file to control the style of the 'price' column:

<snippet transform={false} language="css">
|.very-low-cost {
|  background: linear-gradient(to right, #03682995 30%, #313131 1%);
|  border-right: #313131 !important;
|}
|
|.low-cost {
|  background: linear-gradient(to right, #03682995 45%, #313131 1%);
|  border-right: #313131 !important;
|}
|
|.medium-cost {
|  background: linear-gradient(to right, #FFA50095 60%, #313131 1%);
|  border-right: #313131 !important;
|}
|
|.high-cost {
|  background: linear-gradient(to right, #FF000095 75%, #313131 1%);
|  border-right: #313131 !important;
|}
|
|.very-high-cost {
|  background: linear-gradient(to right, #FF000095 90%, #313131 1%);
|  border-right: #313131 !important;
|}
</snippet>

And then creating another map which we can then set as the value for our `cellClassRules` prop on our 'price' column:

<snippet transform={false} language="jsx">
|const cellClassRules = {
|  'very-low-cost': (p: CellClassParams) => { return p.value < 2500000},
|  'low-cost': (p: CellClassParams) => { return p.value > 2500000 && p.value < 5000000},
|  'medium-cost': (p: CellClassParams) => { return p.value > 5000000 && p.value < 7500000},
|  'high-cost': (p: CellClassParams) => { return p.value > 7500000 && p.value < 9000000},
|  'very-high-cost': (p: CellClassParams) => { return p.value >= 9000000},
}
|
|const [colDefs] = useState([
|  {
|    field: "price",
|    cellClassRules: cellClassRules // Apply cellClassRules map to the price column
|  },
|  ...
|]);
</snippet>

We should now see our price column formatted based on its value:

***TODO: Cell Class Rules Example***

---

## Formatting Cell Values

The data supplied to the grid usually requires some degree of formatting. To achieve this, we can use __Value Formatters__.

__Value Formatters__ are basic functions which take the value of the cell, apply some basic formatting, and return a new value to be displayed by the grid. Let's try this by adding the valueFormatter property to our 'price' column to return the formatted value:

<snippet transform={false} language=jsx>
|const [colDefs] = useState([
|  ...
|  {
|    field: "price",
|    valueFormatter: params => return '£' + params.value.toLocaleString();
|  }
|  ...
|]);
|
|return (
|  &lt;div className="ag-theme-custom" style={{ width: 600, height: 500 }}>
|    &lt;AgGridReact colDefs={colDefs} />
|  &lt;/div>
|);
</snippet>

The grid should now display a nicely formatted value in the 'price' column:

***TODO: Grid Example Value Formatter***

## Custom Cell Content

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

---

## Test Your Knowledge

1. Format the Date column

_Hint:_

2. Modify the cell style on the mission column so that the cursor becomes a pointer

_Hint:_

3. Implement a custom tool tip?

_Hint:_

---

## Summary

---

## Next Steps

<!-- ## Theming & Styling

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

_Note: Themes can be customised by creating a new `ag-theme-*.css` file and overriding the relevant [CSS variables](/global-style-customisation-variables/). Learn more in our [Creating Your Own Theme](/themes/#creating-your-own-theme) guide_

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
- __Theme Builder:__ ... -->

