---
title: "Create a Simple Grid"
---

How to create and configure your first Grid

## Overview

In this tutorial you will:

- Create a basic Grid using AG Grid
- Load data from a web server into the Grid at run-time
- Configure the Grid to enable functionality such as Sorting, Filtering & Pagination
- Hook into Grid events triggered by user actions

Once complete, you will have an interactive Grid, populated with data from an external source that responds to user-interaction:

***TODO: Create Inline Demo***

### Pre-requisities

Before starting this tutorial, make sure you have:

- Installed AG Grid:

<framework-specific-section frameworks="react">
<snippet transform={false} language="bash">
npm install ag-grid-react
</snippet>
</framework-specific-section>

- Imported the required packages:

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css'; // Core CSS;
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Alpine Theme
</snippet>
</framework-specific-section>

_For more information on installation and imports, refer to our detailed [installation guide]()._

<framework-specific-section frameworks="react">

## Creating a Basic Grid

Before we can create our first grid, we need to define two things: ___Row Data___ and ___Column Definitions___

- Row Data is the data that we want the Grid to display.
- Column Definitions are used to tell the Grid what to do with our Row Data.

We define our Row Data by creating a JSON array, where each object within this array represents a row within the Grid:

<snippet transform={false} language="jsx">
const [rowData, setRowData] = useState([
    { make: 'Toyota', model: 'Celica', price: 35000 },
	{ make: 'Ford', model: 'Mondeo', price: 32000 },
	{ make: 'Porsche', model: 'Boxter', price: 72000 }
]);
</snippet>

You may have noticed that we've wrapped our Row Data with the useState hook. This will be important later in the tutorial when we want to update our Row Data. _Read our [Best Practices]() guide to learn more about using React Hooks with AG Grid._

Now that we have our Row Data defined, we need to tell the grid what to do with it by creating our Column Definitions to map the properties within our Row Data to columns:

<snippet transform={false} language="jsx">
const [columnDefs, setColumnDefs] = useState([
    { field: 'make' },
    { field: 'model' },
    { field: 'price' }
]);
</snippet>

As you can see, each object within our columnDefs array maps to a property within our Row Data.

With our Row Data & Coloumn Definitions created, we're ready to implement the Grid itself. In order for the Grid to be displayed correctly, we need to wrap the Grid in a container Div which will define the size & theme of the grid.

<snippet transform={false} language="jsx">
&lt;div className='ag-theme-alpine' style={{width: 600, height: 500}}>
    &lt;AgGridReact rowData={rowData} columnDefs={columnDefs} />
&lt;/div>
</snippet>

_For simplicity, we've used ag-theme-alpine, a pre-built theme included within the library. If you want to, you can [change your theme]() or [build your own]()._

Finally, we can wrap our code so far into a function to make our Grid component reuseable. At this point, your code should look something like:

<snippet transform={false} language="jsx">
|import { useState } from 'react';
|import { AgGridReact } from 'ag-grid-react';
|import "ag-grid-community/styles/ag-grid.css";
|import "ag-grid-community/styles/ag-theme-alpine.css";
| 
|function GridExample() {
| 
|  const [rowData, setRowData] = useState([
|    { make: 'Toyota', model: 'Celica', price: 35000 },
|    { make: 'Ford', model: 'Mondeo', price: 32000 },
|    { make: 'Porsche', model: 'Boxter', price: 72000 }
|  ]);
| 
|  const [colDefs] = useState([
|    { field: "make" },
|    { field: "model" },
|    { field: "price" }
|  ]);
| 
|  return (
|    &lt;div className="ag-theme-alpine" style={{ width: 600, height: 500 }}>
|      &lt;AgGridReact rowData={rowData} columnDefs={colDefs} />
|    &lt;/div>
|  );
|}
</snippet>

When we run the code, we should have a grid with three columns and three rows:

***TODO: Show Grid Running***

## Updating Row Data

In our first step, we created a Grid with hard-coded Row Data, but what if our data is dynamic? Well, all we need to do is update the state of our rowData with our new data, and the Grid will automatically update:

<snippet transform={false} language="jsx">
|useEffect(() => {
|   fetch('https://www.ag-grid.com/example-assets/row-data.json')
|    .then(result => result.json())
|    .then(rowData => setRowData(rowData))
|}, [])
</snippet>

In this step, we've fetched data from a web-server, converted this to JSON and called `setRowData` to update the state of our `rowData` array with the response from the server. At this point, we should have a grid populated with around 3,000 rows:

***TODO: Show Grid at this point***

## Configuring Columns

So far we've created a basic grid, and populated this with data from a web-server. In this step, we'll configure our columns tweak the way they are presented to the user. and enable some basic functionality, like sorting and filtering.

To achieve this, we need to configure some properties of the Column. We'll start by modifying the column header text. By default, the grid will use the property name contained within the `rowData` array, but often times our data will contain machine-readable labels, where as our Grid needs to be human-readable. We can override this default functionality by configuring the `headerName` property within our `colDefs` array to explicitly define the header text for our column:

<snippet transform={false} language="jsx">
|const [colDefs] = useState([
| { field: "make" },
| { field: "model" },
| { field: "price", headerName: "Cost" }
|]);
</snippet>

The snippet above should convert the Header for the "price" column into "cost":

***TODO: Show grid current state***

We can follow the same pattern to configure any Column Property, like filters, for example:

<snippet transform={false} language="jsx">
|const [colDefs] = useState([
| { field: "make" },
| { field: "model" },
| { field: "price", headerName: "Cost", filter: true, floatingFilter: true }
|]);
</snippet>

***TODO: Show grid current state***

So far, we've seen how we can use Column Properties to configure indivudal columns, but what if we want to apply configurations across all columns? Instead of manually configuring each column, we can leverage __Default Column Definitions__ to apply configurations accross all columns:

<snippet transform={false} language="jsx">
|const defaultColDefs = useMemo(() => ({
|  filter: true,
|  floatingFilter: true
|}))
</snippet>

We can then pass this configuration to our grid by using the defaultColDefs property on our Grid component:

<snippet transform={false} language="jsx">
|&lt;div className="ag-theme-alpine" style={{ width: 600, height: 500 }}>
| &lt;AgGridReact rowData={rowData} columnDefs={colDefs} defaultColDef={defaultColDefs} />
|&lt;/div>
</snippet>

Which in turn, applies the configuration to all of our Columns. At this point, we should have floating filters enabled across all our columns:

***TODO: Show grid current state***

When using Default Column Definitions, we can selectively turn features off for specific columns by overriding the property in our `colDef` array:

<snippet transform={false} language="jsx">
|const [colDefs] = useState([
| { field: "make" },
| { field: "model" },
| { field: "price", headerName: "Cost", filter: false, floatingFilter: false }
|]);
</snippet>

***TODO: Show grid current state***

in this step we've.... summarize

_For a full list of Column Properties, refer to our detailed [Column Properties]() page._

## Configuring Grid Options

So far we've covered creating a grid, updating the data within the grid, and controlling specific columns. But what about controlling grid-wide features, like Pagination or Row Selection? Well, this is configured via __Grid Options__, which controls functionality that extends accross both rows & columns.

To enable pagination on the grid, we need to create a Grid Options array which contains the options we'd like to control:

<snippet transform={false} language="jsx">
|const gridOptions = useMemo(() => ({
| pagination: true
|}))
</snippet>

Then, just like we did with Default Col Defs, we pass this to our grid component through the GridOptions property:

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

summary....

_For a full list of Grid Options, refer to our detailed [Grid Options]() page._

## Hooking into Grid Events

In the last section of this tutorial we're going to hook into __Grid Events__ which are events that the grid raises, typically in response to some user-action. As we've already enabled filtering across our columns, we'll hook into the `filterOpened` event, which is triggered whenever a user opens the filter, to log a message to the console. 

The first thing to do is create the function which will be called when the Grid Event is triggered, which accepts a parameter `event` that will contain information about the event raised by the grid, and then logs this to the console:

<snippet transform={false} language="jsx">
|const onFilterOpened = (event) => {
|   console.log(event)
|}
</snippet>

Once defined, we can then set this function to be called when the relevant event is triggered by adding the `on[EventName]` property to the grid. In this case, the event is called `onFilterOpened`:

<snippet transform={false} language="jsx">
|&lt;div className="ag-theme-alpine" style={{ width: 600, height: 500 }}>
|   &lt;AgGridReact 
|       rowData={rowData} 
|       columnDefs={colDefs} 
|       defaultColDef={defaultColDefs} 
|       gridOptions={gridOptions} 
|       onFilterOpened={onFilterOpened}
|   />
|&lt;/div>
</snippet>

Now, when we open the filter on the grid, we should see a message in the console:

***TODO: Show Console Message***

_For a full list of Grid Events, refer to our detailed [Grid Events]() page._

</framework-specific-section>

## Summary

Congratulations! You've completed the tutorial and build your first grid.

We have introduced several concepts which form the basis of all Grids build using AG Grid - To recap:

- __Row Data__ is simply your data, in JSON format, that you want the grid to display.

- __Column Definitions__ are used to define your columns and control column-specific functionality, like sorting and filtering.

- __Default Column Definitions__ are similar Column Definitions, but rather than controlling specific columns, Default Column Definitions are used to apply configurations to all columns.

- __Grid Options__ are used to configure functionality which extends accross the entire Grid, such as ... We also use Grid Options to provide our Row Data, Column Definitions and Default Column Definitions to the Grid.

- __Grid Events__ are events which are raised by the Grid, such as when a cell is clicked, or sorting is changed.

## Next Steps

Read our next tutorial to learn how to customise and extend the grid with your own components and logic:

- [Customising The Grid](/customise-the-grid)


---

__Notes:__

- Content missing?
  - Column Groups
  - Row Selection
- Fairly long...
- Code then what the grid looks like... Combine these?
