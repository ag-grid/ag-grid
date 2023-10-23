---
title: "Deep Dive"
---

An introduction to the key concepts and features of AG Grid.

## Pre-requisities

Before starting this tutorial, make sure you have either completed our [Quick Start](/getting-started/) ___or___ forked our [Plunkr Example](https://plunkr.com/).

## Overview

In this tutorial you will:

1. Create a basic grid
2. Populate the grid with data from a server
3. Configure basic features
4. Hook into grid events

Once complete, you will have an interactive grid, populated with data from an external source that responds to user-interaction:

***TODO: Create Inline Demo***

<framework-specific-section frameworks="react">

## Hello World

Our Quick Start & Plunkr examples provide a _Hello World_ implementation of the grid; we'll start by breaking down this example into its individual parts. 

___If you're comfortable with the concepts introduced in the quick-start, jump to [Updating Row Data](#updating-row-data)___

### Row Data

The `rowData` array contains the data we want to display within the grid:

<snippet transform={false} language="jsx">
|const [rowData, setRowData] = useState([
|  { make: 'Toyota', model: 'Celica', price: 35000 },
|  { make: 'Ford', model: 'Mondeo', price: 32000 },
|  { make: 'Porsche', model: 'Boxter', price: 72000 }
|]);
</snippet>

_Note: We've wrapped our `rowData` in a useState hook. Read our [Best Practices]() guide to learn more about using React hooks with AG Grid._

### Column Definitions

The `colDefs` array defines the columns that we want the grid to display. The `field` property is used to match the column with the data from our `rowData` array:

<snippet transform={false} language="jsx">
|const [colDefs] = useState([
|  { field: "make" },
|  { field: "model" },
|  { field: "price" }
|]);
</snippet>

### Creating the Grid

To create the grid, we wrap the `AgGridReact` component in a parent container, which is used to define the dimension and theme for the grid. We can then pass our `rowData` and `columnDefs` variables as props to the `AgGridReact` component, which will be used to render the grid:

<snippet transform={false} language="jsx">
|return (
|  &lt;div className="ag-theme-alpine" style={{ width: 600, height: 500 }}>
|    &lt;AgGridReact rowData={rowData} columnDefs={colDefs} />
|  &lt;/div>
|);
</snippet>

_Note: You can use a [pre-made theme](/themes/) or create your own. For more information on themeing, read our [Theming & Styling The Grid]() guide._

Bringing this all together creates a grid in its simplest form:

<snippet transform={false} language="jsx">
|import { useState } from 'react';
|import { AgGridReact } from 'ag-grid-react'; // Core Grid Logic
|import "ag-grid-community/styles/ag-grid.css"; // Core CSS
|import "ag-grid-community/styles/ag-theme-alpine.css"; // Theme
| 
|function GridExample() {
|  // Set Row Data
|  const [rowData, setRowData] = useState([
|    { make: 'Toyota', model: 'Celica', price: 35000 },
|    { make: 'Ford', model: 'Mondeo', price: 32000 },
|    { make: 'Porsche', model: 'Boxter', price: 72000 }
|  ]);
|  
|  // Define Columns (Should match properties in rowData)
|  const [colDefs] = useState([
|    { field: "make" },
|    { field: "model" },
|    { field: "price" }
|  ]);
|  
|  // Wrap the grid component in a parent container to set the theme & dimensions
|  return (
|    &lt;div className="ag-theme-alpine" style={{ width: 600, height: 500 }}>
|      &lt;AgGridReact rowData={rowData} columnDefs={colDefs} />
|    &lt;/div>
|  );
|}
</snippet>

## Updating Row Data

`rowData` is a reactive property, which means that to update the data within the grid, we simply need to update the state of our `rowData` variable. Let's test this by fetching some data from an external server and updating our `rowData` with the response:

<snippet transform={false} language="jsx">
|useEffect(() => {
|   fetch('https://www.ag-grid.com/example-assets/row-data.json') // Fetch data from server
|    .then(result => result.json()) // Convert to JSON
|    .then(rowData => setRowData(rowData)) // Update state of `rowData`
|}, [])
</snippet>

When we run our application, we should see a grid with ~3,000 rows:

***TODO: Show grid at this point***

## Configuring a Single Column

Now that we have a basic grid with some arbitrary data, we can start to configure the grid by using ___Column Properties___.

Column Properties are propreties that can be set on one or more columns to enable/disable features like resizing. Let's try this out by setting the `resizeable` property to __true__:

<snippet transform={false} language="jsx">
|const [colDefs] = useState([
| { field: "make" },
| { field: "model" },
| { field: "price", resizeable: true }
|]);
</snippet>

***TODO: Show grid current state***

We should now be able to drag & resize the price column.

_Note: Column properties can be used to configure a wide-range of features; refer to our [Column Properties](/column-properties/) page for a full list of features._

### Configuring All Columns

The example above demonstrates how to configure a single column. To apply this configuration to across all columns we can use ___Default Column Definitions___. To configure Default Column Definitions, create a `defaultColDefs` object, set the `resizeable: true`, and pass then this to the grid via the `defaultColDef` prop:

<snippet transform={false} language="jsx">
|const defaultColDefs = useMemo(() => ({
|  resizeable: true
|}))
|
|&lt;div className="ag-theme-alpine" style={{ width: 600, height: 500 }}>
| &lt;AgGridReact rowData={rowData} columnDefs={colDefs} defaultColDef={defaultColDefs} />
|&lt;/div>
</snippet>

The grid should now allow re-sizing on all columns:

***TODO: Show grid current state***

When using Default Column Definitions, we can selectively turn features off for specific columns by overriding the property in our `colDef` array:

<snippet transform={false} language="jsx">
|const [colDefs] = useState([
| { field: "make" },
| { field: "model" },
| { field: "price", resizable: false}
|]);
</snippet>

***TODO: Show grid current state***

in this step we've.... summarize

_For a full list of Column Properties, refer to our detailed [Column Properties]() page._

## Configuring Grid Options

So far we've covered creating a grid, updating the data within the grid, and controlling specific columns. But what about controlling grid-wide features, like Pagination or Row Selection? These features are configured via __Grid Options__, which controls functionality that extends across both rows & columns.

To enable Pagination on the grid, we need to create a `gridOptions` object which contains the options we'd like to control:

<snippet transform={false} language="jsx">
|const gridOptions = useMemo(() => ({
| pagination: true
|}))
</snippet>

Then, just like we did with Default Column Defs, we pass this to our grid component through the GridOptions property:

<snippet transform={false} language="jsx">
|&lt;div className="ag-theme-alpine" style={{ width: 600, height: 500 }}>
| &lt;AgGridReact 
|       rowData={rowData} 
|       columnDefs={colDefs}
|       defaultColDef={defaultColDefs}
|       gridOptions={gridOptions}
|   />
|&lt;/div>
</snippet>

***TODO: Show grid current state***

We should now see Pagination has been enabled on the grid.

_For a full list of grid Options, refer to our detailed [Grid Options]() page._

## Hooking into Grid Events

In the last section of this tutorial we're going to hook into __Grid Events__ which are events that the grid raises, typically in response to some user-action. As we've already enabled filtering across our columns, we'll hook into the `coulumnResized` event, which is triggered whenever a user resizes a colum, to log a message to the console.

The first thing to do is create the function which will be called when the grid event is triggered, which accepts a parameter `event` that will contain information about the event raised by the grid, and then logs this to the console:

<snippet transform={false} language="jsx">
|const onColumnResized = (event) => {
|   console.log(event)
|}
</snippet>

Once defined, we can then set this function to be called when the relevant event is triggered by adding the `on[EventName]` property to the grid. In this case, the event is called `onColumnResized`:

<snippet transform={false} language="jsx">
|&lt;div className="ag-theme-alpine" style={{ width: 600, height: 500 }}>
|   &lt;AgGridReact 
|       rowData={rowData} 
|       columnDefs={colDefs} 
|       defaultColDef={defaultColDefs} 
|       gridOptions={gridOptions} 
|       onColumnResized={onColumnResized}
|   />
|&lt;/div>
</snippet>

Now, when we open the filter on the grid, we should see a message in the console:

***TODO: Show Console Message***

_For a full list of grid Events, refer to our detailed [Grid Events]() page._

</framework-specific-section>

## Summary

Congratulations! You've completed the tutorial and build your first grid.

We have introduced several concepts which form the basis of all grids build using AG Grid - To recap:

- __Row Data__ is simply your data, in JSON format, that you want the grid to display.

- __Column Definitions__ are used to define your columns and control column-specific functionality, like sorting and filtering.

- __Default Column Definitions__ are similar Column Definitions, but rather than controlling specific columns, Default Column Definitions are used to apply configurations to all columns.

- __Grid Options__ are used to configure functionality which extends accross the entire grid, such as ... We also use grid Options to provide our Row Data, Column Definitions and Default Column Definitions to the grid.

- __Grid Events__ are events which are raised by the grid, such as when a cell is clicked, or sorting is changed.

## Next Steps

Read our next tutorial to learn how to customise and extend the grid with your own components and logic:

- [Customising The Grid](/customise-the-grid)