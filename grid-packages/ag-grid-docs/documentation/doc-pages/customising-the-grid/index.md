---
title: "Customising the Grid"
---

This tutorial demonstrates how to style, customise and extend the grid.

## Overview

In this tutorial you will:

1. [Pick a theme](/customising-the-grid/#choosing-a-theme)
2. [Style rows & cells](/customising-the-grid/#styling-rows--cells)
3. [Apply styles dynamically](/customising-the-grid/#applying-styles-dynamically)
4. [Format grid values](/customising-the-grid/#formatting-cell-values)
5. [Add custom components to Cells](/customising-the-grid/#custom-cell-components)

Once complete, you will have a grid with custom styles applied to rows & cells, formatted price & date values, and a component in place of the country values.

Try it out by editing the country, success, price or date columns to see the styles update in real-time:

<grid-example title='Full Example' name='fully-customised-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

## Setup

<note disableMarkdown='true'>To follow this tutorial clone our <a href='#'>Basic Grid Template</a> or fork the <a href='#'>CodeSandbox Example</a>.</note>

## Theming & Styling

There are three ways to style the grid:

- __Themes:__ CSS Classes which style all elements, including rows and cells.
- __Styles:__ Applies CSS classes to rows or cells.
- __Class Rules:__ Applies Styles to rows or cells based on their value.

### Choosing a Theme

All grids require a theme and we provide 5 themes out-of-the-box: [Alpine](https://www.ag-grid.com/example/?theme=ag-theme-alpine), [Alpine Dark](https://www.ag-grid.com/example/?theme=ag-theme-alpine-dark), [Balham](https://www.ag-grid.com/example/?theme=ag-theme-balham), [Balham Dark](https://www.ag-grid.com/example/?theme=ag-theme-balham-dark), and [Material](https://www.ag-grid.com/example/?theme=ag-theme-material).

To use a theme, set the classname of the div that contains the grid to the name of the theme. Let's try this out by adding `ag-theme-material` to our container div:

<snippet transform={false} language="jsx">
|&lt;div className="ag-theme-material" style={{ width: 600, height: 500 }}>
|  &lt;AgGridReact ... />
|&lt;/div>
</snippet>

_Note: Themes can be customised by overriding [CSS variables](/global-style-customisation-variables/), or you can [create your own theme](/global-style-customisation/#creating-a-reusable-package-of-design-customisations) entirely. Read our [Style Customisation](/global-style-customisation/) guide for more info._

### Styling Rows & Cells

In addition to themes, CSS classes can be applied to rows with __Row Classes__ and to cells with __Cell Classes__.

__Row Classes__ are defined using the `rowClass` prop, with a CSS classname as the value. Let's try this by creating a new `styles.css` file with a `.row` selector to control the font of our rows:

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

<grid-example title='Row Class Example' name='row-class-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

__Cell Classes__ work in the same way but are applied by adding a `cellClass` property to the column we want the styles to apply to. Let's try this by adding a new selector to `styles.css` to set the font-weight of the 'Mission' column:

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

<grid-example title='Cell Class Example' name='cell-class-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

### Applying Styles Dynamically

Styles can also be dynamically applied to rows with __Row Class Rules__ and to cells with __Cell Class Rules__.

__Row Class Rules__ are configured by providing a JavaScript map to the `rowClassRules` prop where the keys are the CSS classnames and the values are functions that describe when the selectors should be applied.

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

<grid-example title='Row Class Rule Example' name='row-class-rule-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

__Cell Class Rules__ work in the same but are applied by adding a `cellClassRules` property to the column we want the styles to apply to.

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

And then creating another map and setting it as the value for our `cellClassRules` prop on otheur 'Price' column:

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

<grid-example title='Cell Class Rule Example' name='cell-class-rule-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

---

## Formatting Cell Values

The data supplied to the grid usually requires some degree of formatting. For basic text formatting we can use __Value Formatters__.

__Value Formatters__ are basic functions which take the value of the cell, apply some basic formatting, and return a new value to be displayed by the grid. Let's try this by adding the `valueFormatter` property to our 'price' column and returning the formatted value:

<snippet transform={false} language=jsx>
|const [colDefs] = useState([
|  ...
|  {
|    field: "price",
|    valueFormatter: params => return '£' + params.value.toLocaleString(); // Function which returns a formatted string
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

<grid-example title='Value Formatter Example' name='value-formatter-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

## Custom Cell Components

__Value Formatters__ are useful for basic formatting, but for more advanced use-cases we can use __Cell Renderers__ instead.

__Cell Renderers__ allow you to provide your own React components to the grid and are configured by setting the value of the `cellRenderer` prop to the component name on the relevant column.

Let's try this by creating a new component to display a flag in the 'country' column. First, we need to create a component that accepts a single prop (which contains information about the cell) and returns an `<img>` element with the correct flag:

<snippet transform={false} language=jsx>
|const CountryFlagCellRenderer = (props) => {
|  {* Return flag based on cell value *}
|  return (
|    &lt;span>
|      { props.value === 'usa' && &lt;img src='https://downloads.jamesswinton.com/flags/us-flag.png)' height={30}>&lt;/img> }
|      { props.value === 'china' && &lt;img src='https://downloads.jamesswinton.com/flags/cn-flag.png)' height={30}>&lt;/img> }
|      { props.value === 'Kazakhstan' && &lt;img src='https://downloads.jamesswinton.com/flags/kz-flag.png)' height={30}>&lt;/img> }
|    &lt;/span>
|  );
|}
</snippet>

And then adding the `cellRenderer` prop on our 'country' column, referencing our component:

<snippet transform={false} language=jsx>
|const [colDefs] = useState([
|  {
|    field: "country",
|    cellRenderer: 'CountryFlagCellRenderer' // Use 'CountryFlagCellRenderer' for this column
|  },
|  ...
|]);
|
|return (
|  &lt;div className="ag-theme-custom" style={{ width: 600, height: 500 }}>
|    &lt;AgGridReact colDefs={colDefs} />
|  &lt;/div>
|);
</snippet>

Now, when we run the grid, we should see a country flag in place of the name:

<grid-example title='Cell Renderer Example' name='cell-renderer-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

---

## Test Your Knowledge

Let's put what you've learned so far into action by modifying the grid:

1. Format the Date column using `.toLocaleDateString()`;

    _Hint: Use a `valueFormatter` on the 'Date' column to format its value_

2. Apply a CSS Class to the 'mission' column that sets `cursor: pointer`.

    _Hint: Use the `cellClass` property on the 'Mission' column to provide a CSS class to the cells_

3. Implement a Custom Tooltip on the 'Mission' column.

    _Hint: Use the `customTooltip` property on the 'Mission' Column to provide a custom Tooltip component_

Once complete, your grid should look like the example below. If you're stuck, check out the source code to see how its done:

<grid-example title='Full Example' name='fully-customised-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

---

## Summary

Congratulations! You've completed the tutorial and customised, styled, & extended your grid. By now, you should be familiar with several concepts:

- __Themes:__ CSS Classes that control the look and feel of the entire grid. Choose from and customise 5 pre-made themes, or create your own.
- __Styles:__ Apply CSS Classes to rows & cells directly, either by default or based on arbirary data in the grid.
- __Value Formatters:__ Format basic text values into more human readable content
- __Cell Renderers:__ Add your own custom components to change the look & feel and extend the capabilities of the grid.

---

## Next Steps

Take a look at our final tutorial in the series which introduces some of the more advanced features of the grid:

<next-step-tiles tutorial1="false" tutorial2="false" tutorial3="true"/>