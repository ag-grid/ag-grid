---
title: "Creating a Basic Grid"
---

This tutorial provides an introduction to the key concepts of AG Grid.

## Overview

In this tutorial you will:

1. [Create a basic grid](/deep-dive/#create-a-basic-grid)
2. [Load external data into the grid](/deep-dive/#load-new-data)
3. [Configure columns](/deep-dive/#configure-columns)
4. [Configure grid features](/deep-dive/#configure-the-grid)
5. [Hook into grid events](/deep-dive/#handle-grid-events)

Once complete, you'll have an interactive grid, populated with data from an external source that responds to user-interaction.

Try it out for yourself by __sorting__, __filtering__, __resizing__, __selecting__, or __editing__ data in the grid.

<grid-example title='Testing Example' name='testing-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

<framework-specific-section frameworks="react">

## Setup

<note disableMarkdown='true'>To follow this tutorial <a href='#'>Clone our Quick Start</a> or <a href='#'>Fork the CodeSandbox Example</a>.</note>

## Create a Basic Grid

The [Quick Start](#) shows how to create a basic grid, made up of four things:

1. __Row Data:__ The data to be displayed.
2. __Column Definition:__ Defines & controls grid columns.
3. __Container:__ A `div` that contains and defines the grid's theme & dimensions.
4. __Grid Component:__ The `AgGridReact` component with __Row Data__ and __Column Definition__ props.

Putting these things together creates basic grid:

</framework-specific-section>

<grid-example title='Basic Example' name='basic-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

_Note: `rowData` and `colDefs` arrays use a `useState` hook. We recommend `useState` if the data is mutable, otherwise `useMemo` is preferable. Read our [Best Practices](/react-hooks/) guide to learn more about using React hooks with AG Grid._

---

<!--- Updating Row Data Section -->

## Load New Data

<framework-specific-section frameworks="react">

As `rowData` is a reactive property, any updates to its state will be refelcted in the grid. Let's test this by fetching some data from an external server and updating `rowData` with the response:

<snippet transform={false} language="jsx">
|useEffect(() => {
|  fetch('https://downloads.jamesswinton.com/space-mission-data.json') // Fetch data from server
|    .then(result => result.json()) // Convert to JSON
|    .then(rowData => setRowData(rowData)) // Update state of `rowData`
|}, [])
</snippet>

</framework-specific-section>

When we run our application, we should see a grid with ~4,000 rows:

<grid-example title='Updating Example' name='updating-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

---

<!--- Configuring Columns Section -->

## Configure Columns

<framework-specific-section frameworks="react">

Now that we have a basic grid with some arbitrary data, we can start to configure the grid by using ___Column Properties___.

Column Properties can be added to one or more columns to enable/disable column-specific features. Let's try this by adding the `resizable: true` property to the 'mission' column:

<snippet transform={false} language="jsx">
|const [colDefs] = useState([
|  { field: "mission", resizable: true },
|  { field: "country" },
|  { field: "successful" },
|  { field: "date" },
|  { field: "price" },
|  { field: "company" }
|]);
</snippet>

</framework-specific-version>

We should now be able to drag & resize the 'mission' column:

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
|  { field: "mission", resizable: false }, // Override default column definition
|  { field: "country" },
|  { field: "successful" },
|  { field: "date" },
|  { field: "price" },
|  { field: "company" }
|]);
</snippet>

Resizing should now be disabled for the "mission" column only:

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

<grid-example title='Complete Example' name='grid-events-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

_Refer to our [Grid Events](/grid-events/) documentation for a full list of events raised by the grid_

---

</framework-specific-section>

## Test Your Knowledge

Let's put what you've learned so far into action by modifying the grid:

1. Enable multiple row selection

   _Hint: `rowSelection` is a Grid Option property_

2. Enable Checkbox Selection on the 'mission' column

   _Hint: `checkboxSelection` is a Column Definiton property_

3. Log a message to the console when a row selection is changed

   _Hint: `onSelectionChanged` is a Grid Event_

Once complete, your grid should look like the example below. If you're stuck, check out the source code to see how its done:

<grid-example title='Testing Example' name='testing-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

---

## Summary

Congratulations! You've completed the tutorial and built your first grid. By now, you should be familiar with the key concepts of AG Grid:

- __Row Data:__ Your data, in JSON format, that you want the grid to display.

- __Column Definitions:__ Define your columns and control column-specific functionality, like sorting and filtering.

- __Default Column Definitions:__ Similar to Column Definitions, but applies configurations to all columns.

- __Grid Options:__ Configure functionality which extends accross the entire grid.

- __Grid Events:__ Events raised by the grid, typically as a result of user interaction.

## Next Steps

Read our next tutorial to learn how to customise and extend the grid with your own design, components and logic, or jump straight into our advanced tutorial

<next-step-tiles tutorial1="false" tutorial2="true" tutorial3="false"/>