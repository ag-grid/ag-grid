---
title: "Styling the Grid"
---

This tutorial demonstrates how to style, customise and extend the grid.

## Overview

In this tutorial you will:

1. [Pick a theme](/styling-the-grid/#choosing-a-theme)
2. [Customise the Theme](/styling-the-grid/#customising-themes)
3. [Style rows & cells](/styling-the-grid/#styling-rows--cells)
4. [Apply styles dynamically](/styling-the-grid/#applying-styles-dynamically)

Once complete, you will have a grid with custom styles applied to rows & cells, formatted price & date values, and a component in place of the country values.

Try it out by editing the success or price columns to see the styles update in real-time:

<grid-example title='Full Example' name='fully-customised-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

## Setup

<note disableMarkdown='true'>To follow this tutorial clone our <a href='#'>Basic Grid Template</a> or fork the <a href='#'>CodeSandbox Example</a>.</note>

## Introduction

There are three ways to style the grid:

- __Themes:__ CSS Classes which style all elements, including rows and cells.
- __Styles:__ Applies CSS classes to rows or cells.
- __Class Rules:__ Applies Styles to rows or cells based on their value.

## Customising Themes

All themes can be customised by overriding [CSS variables](/global-style-customisation-variables/).

Let's test this out by creating a new `styles.css` file with a single selector that matches our chosen theme (`ag-theme-alpine-dark`) and override the `--ag-alpine-active-colour` to change the colour of active elements within the grid:

<snippet transform={false} language="css">
.ag-theme-alpine-dark {
  --ag-checkbox-checked-color: rgb(126, 46, 132);
}
</snippet>

We should now see the checkboxes styled with our new colour:

<grid-example title='Custom Theme Example' name='custom-theme-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

_Note: You can also create your own theme entirely. Read our [Style Customisation](/global-style-customisation/) guide for more info._

## Styling Rows & Cells

In addition to themes, CSS classes can be applied to rows with __Row Classes__ and to cells with __Cell Classes__.

__Row Classes__ are defined using the `rowClass` prop, with a CSS classname as the value. Let's try this by adding a new `.row` selector in our `styles.css` file to control the font of our rows:

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

## Applying Styles Dynamically

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

## Test Your Knowledge

Let's put what you've learned so far into action by modifying the grid:

1. Set the colour of `--ag-header-column-resize-handle-color` to `rgb(155, 155, 155)`

    _Hint: `--ag-header-column-resize-handle-color` is a theme CSS variable_

2. Apply a CSS Class to the 'mission' column that sets `cursor: pointer`.

    _Hint: Use the `cellClass` property on the 'Mission' column to provide a CSS class to the cells_

Once complete, your grid should look like the example below. If you're stuck, check out the source code to see how its done:

<grid-example title='Full Example' name='fully-customised-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

---

## Summary

Congratulations! You've completed the tutorial and customised, styled, & extended your grid. By now, you should be familiar with several concepts:

- __Themes:__ CSS Classes that control the look and feel of the entire grid. Choose from and 1 of 5 pre-made themes, or create your own.
- __Styles:__ Apply CSS Classes to rows & cells directly, either by default or based on arbitrary data in the grid.

---

## Next Steps

Check out our other guides to explore more features of AG Grid:

- [...]()