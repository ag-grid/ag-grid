---
title: "Creating a Basic Grid"
---

This tutorial provides an introduction to the key concepts of AG Grid.

## Overview

In this tutorial you will:

1. Create a basic grid
2. Populate the grid with data from a server
3. Configure basic features
4. Hook into grid events

Once complete, you'll have an interactive grid, populated with data from an external source that responds to user-interaction. Try it our for yourself by:

1. Clicking Column Headers to sort
2. Clicking hamburger menu on Column Headers to filter
3. Draging Column Header Dividers to resize columns
4. Clicking cells to select them (hold 'ctrl' to select multiple rows)
5. Switching pages with the pagination controls

<grid-example title='Testing Example' name='testing-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

---

## Introduction

This tutorial uses the Quick Start as a starting point. If you haven't already, complete the [Quick Start](/getting-started/) to install the grid.

<framework-specific-section frameworks="react">

### Load Rows

The `rowData` array contains the data we want to display within the grid:

<snippet transform={false} language="jsx">
|const [rowData, setRowData] = useState([
|  { make: 'Toyota', model: 'Celica', price: 35000 },
|  { make: 'Ford', model: 'Mondeo', price: 32000 },
|  { make: 'Porsche', model: 'Boxter', price: 72000 }
|]);
</snippet>

### Define Columns

The `colDefs` array defines the columns that we want the grid to display. The `field` property is used to match the column with the data from our `rowData` array:

<snippet transform={false} language="jsx">
|const [colDefs] = useState([
|  { field: "make" },
|  { field: "model" },
|  { field: "price" }
|]);
</snippet>

_Note: We've wrapped our `rowData` and `colDefs` arrays in a `useState` hook. We recommend `useState` if the data is mutable, otherwise `useMemo` is preferable. Read our [Best Practices](/react-hooks/) guide to learn more about using React hooks with AG Grid._

### Create the Grid

To create the grid, we first wrap the `AgGridReact` component in a parent container, which is used to define the dimension and theme for the grid. We can then pass our `rowData` and `columnDefs` variables as props to the `AgGridReact` component, which will render the grid:

<snippet transform={false} language="jsx">
|return (
|  &lt;div className="ag-theme-alpine" style={{ width: 600, height: 500 }}>
|    &lt;AgGridReact rowData={rowData} columnDefs={colDefs} />
|  &lt;/div>
|);
</snippet>

Running our code at this point will display a basic grid, with three rows:

</framework-specific-section>

<grid-example title='Basic Example' name='basic-example' type='generated' options='{ "exampleHeight": 215 }'></grid-example>

_Note: Themes & Styling are covered in the next tutorial, [Customising the Grid](/customising-the-grid/)._

---

<!--- Updating Row Data Section -->

## Load New Data

<framework-specific-section frameworks="react">

`rowData` is a reactive property which means that to update the data within the grid all we need to do is update the state of our `rowData` variable. Let's test this by fetching some data from an external server and updating our `rowData` with the response:

<snippet transform={false} language="jsx">
|useEffect(() => {
|  fetch('https://www.ag-grid.com/example-assets/row-data.json') // Fetch data from server
|    .then(result => result.json()) // Convert to JSON
|    .then(rowData => setRowData(rowData)) // Update state of `rowData`
|}, [])
</snippet>

</framework-specific-section>

When we run our application, we should see a grid with ~3,000 rows:

<grid-example title='Updating Example' name='updating-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

---

<!--- Configuring Columns Section -->

## Configure Columns

<framework-specific-section frameworks="react">

Now that we have a basic grid with some arbitrary data, we can start to configure the grid by using ___Column Properties___.

Column Properties are propreties that can be set on one or more columns to enable/disable column-specific features, like resizing. Let's try this by setting the `resizeable` property of the price column to __true__:

<snippet transform={false} language="jsx">
|const [colDefs] = useState([
|  { field: "make", resizeable: true }, // Enable resizing on this column
|  { field: "model" },
|  { field: "price" }
|]);
</snippet>

</framework-specific-version>

We should now be able to drag & resize the 'make' column:

<grid-example title='Configuring Columns Example' name='configure-columns-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

_Note: Column properties can be used to configure a wide-range of features; refer to our [Column Properties](/column-properties/) page for a full list of features._

### Default Column Definitions

<framework-specific-section frameworks="react">

The example above demonstrates how to configure a single column. To apply this configuration across all columns we can use ___Default Column Definitions___ instead. Let's make all of our columns resizeable by creating a `defaultColDefs` object, setting `resizeable: true`, and passing this to the grid via the `defaultColDef` prop:

<snippet transform={false} language="jsx">
|const defaultColDefs = useMemo(() => ({
|  resizeable: true // Enable resizing on all columns
|}))
|
|&lt;div className="ag-theme-alpine" style={{ width: 600, height: 500 }}>
|  &lt;AgGridReact rowData={rowData} columnDefs={colDefs} defaultColDef={defaultColDefs} />
|&lt;/div>
</snippet>

</framework-specific-section>

The grid should now allow re-sizing on all columns:

<grid-example title='Default Column Definitions Example' name='default-columns-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

<framework-specific-section frameworks="react">

When using Default Column Definitions, we can selectively enable/disable features for specific columns by overriding the property in our `colDef` array:

<snippet transform={false} language="jsx">
|const [colDefs] = useState([
|  { field: "make", resizable: false }, // Override Default Column Definition configuration
|  { field: "model" },
|  { field: "price" }
|]);
</snippet>

Resizing should now be disabled for the "make" column only:

<grid-example title='Exclude Default Column Definitions Example' name='override-default-columns-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

---

## Configure The Grid

So far we've covered creating a grid, updating the data within the grid, and configuring columns. This section introduces __Grid Options__, which control functionality that extends across both rows & columns, such as Pagination and Row Selection.

Grid Options are passed to the grid component directly as props. Let's enable pagination by adding `pagination={true}`:

<snippet transform={false} language="jsx">
|&lt;div className="ag-theme-alpine" style={{ width: 600, height: 500 }}>
|  &lt;AgGridReact
|    ...
|    pagination={true} // Enable Pagination
|  />
|&lt;/div>
</snippet>

We should now see Pagination has been enabled on the grid:

<grid-example title='Grid Options Example' name='grid-options-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

_Refer to our detailed [Grid Options](/grid-options/) documentation for a full list of options._

---

## Handle Grid Events

In the last section of this tutorial we're going to hook into events raised by the grid using ___Grid Events___.

To be notified of when an event is raised by the grid we need to add the relevant `on[EventName]` property on the grid component. Let's try this out by setting `editable: true` and hooking into the `onCellValueChanged` event to log the new value to the console:

<snippet transform={false} language="jsx">
|const defaultColDefs = useMemo(() => ({
|  editable: true // Enable editing on all columns
|}))
|
|&lt;div className="ag-theme-alpine" style={{ width: 600, height: 500 }}>
|  &lt;AgGridReact
|    ...
|    {/* Log new value to console when cell value is changed */}
|    onCellValueChanged={event => console.log(`New Cell Value: ${event.value}`)}
|  />
|&lt;/div>
</snippet>

Now, when we click on a cell we should be able to edit it and see the new value logged to the console:

<grid-example title='Complete Example' name='complete-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

_Refer to our [Grid Events](/grid-events/) documentation for a full list of events raised by the grid_

---

</framework-specific-section>

## Test Your Knowledge

Let's put what you've learned so far into action by modifying the grid:

1. Add an new column to the start of the grid

   _Hint: Modify the column definitons array to include an empty object at the start_

2. Enable Checkbox Selection on the new empty column

   _Hint: `checkboxSelection` is a Column Definiton property_

3. Allow multiple row selection

   _Hint: `rowSelection` is a Grid Option property_

4. Log a message to the console when a row selection is changed

   _Hint: `onSelectionChanged` is a Grid Event_

Once complete, your grid should look like the example below. If you're stuck, check out the source code to see how its done:

<grid-example title='Testing Example' name='testing-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

## Summary

Congratulations! You've completed the tutorial and built your first grid.

By now, you should be familiar with the key concepts of AG Grid:

- __Row Data:__ Your data, in JSON format, that you want the grid to display.

- __Column Definitions:__ Define your columns and control column-specific functionality, like sorting and filtering.

- __Default Column Definitions:__ Similar to Column Definitions, but applies configurations to all columns.

- __Grid Options:__ Configure functionality which extends accross the entire grid.

- __Grid Events:__ Events raised by the grid, typically as a result of user interaction.

## Next Steps

Read our next tutorial to learn how to customise and extend the grid with your own design, components and logic, or jump straight into our advanced tutorial

- [Customising The Grid](/customising-the-grid/)
- TBC
