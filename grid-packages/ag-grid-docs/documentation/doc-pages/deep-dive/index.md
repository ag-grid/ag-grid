---
title: "Creating a Basic Grid"
---

An introduction to the key concepts of AG Grid.

## Overview

In this tutorial you will:

1. [Create a basic grid](/deep-dive/#create-a-basic-grid)
2. [Pick a theme](/deep-dive/#pick-a-theme)
3. [Load external data into the grid](/deep-dive/#load-new-data)
4. [Configure columns](/deep-dive/#configure-columns)
5. [Configure grid features](/deep-dive/#configure-the-grid)
6. [Hook into grid events](/deep-dive/#handle-grid-events)
7. [Format cell values](/deep-dive/#format-cell-values)
8. [Add custom components to cells](/deep-dive/#custom-cell-components)

Once complete, you'll have an interactive grid, with custom components and formatting - Try it out for yourself by __sorting__, __filtering__, __resizing__, __selecting__, or __editing__ data in the grid:

<grid-example title='Testing Example' name='testing-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

<framework-specific-section frameworks="react">

## Create a Basic Grid

Complete our [Quick Start]() or fork our [CodeSandbox example]() to start with a basic grid, made up of four things:

1. __Row Data:__ The data to be displayed.
2. __Column Definition:__ Defines & controls grid columns.
3. __Container:__ A `div` that contains and defines the grid's theme & dimensions.
4. __Grid Component:__ The `AgGridReact` component with __Row Data__ and __Column Definition__ props.

</framework-specific-section>

<grid-example title='Basic Example' name='basic-example' type='generated' options='{ "exampleHeight": 220 }'></grid-example>

_Note: `rowData` and `columnDefs` arrays use the `useState` hook. We recommend `useState` if the data is mutable, otherwise `useMemo` is preferable. Read our [Best Practices](/react-hooks/) guide to learn more about using React hooks with AG Grid._

---

## Choose a Theme

All grids require a theme. We provide 5 themes out-of-the-box: [Alpine](https://www.ag-grid.com/example/?theme=ag-theme-alpine), [Alpine Dark](https://www.ag-grid.com/example/?theme=ag-theme-alpine-dark), [Balham](https://www.ag-grid.com/example/?theme=ag-theme-balham), [Balham Dark](https://www.ag-grid.com/example/?theme=ag-theme-balham-dark), & [Material](https://www.ag-grid.com/example/?theme=ag-theme-material).

To use a theme, set the `className` of the div that contains the grid to the name of the theme. Let's try this out by adding `ag-theme-alpine-dark` to our container div:

<snippet transform={false} language="jsx">
|&lt;div className="ag-theme-alpine-dark" style={{ width: 600, height: 500 }}>
|  &lt;AgGridReact ... />
|&lt;/div>
</snippet>

Now when we run our code we should see the grid styled with the `ag-theme-alpine-dark` theme:

<grid-example title='Theme Example' name='theme-example' type='generated' options='{ "exampleHeight": 220 }'></grid-example>

_Note: You can customise themes or create your own theme entirely. Read our [Styling the Grid](/styling-the-grid/) guide for more info._

---

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

When we run our application, we should see a grid with ~2,500 rows:

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

When using Default Column Definitions, we can selectively enable/disable features for specific columns by overriding the property in our `colDefs` array:

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

Resizing should now be disabled for the "mission" column, and enabled for all others:

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

## Format Cell Values

The data supplied to the grid usually requires some degree of formatting. For basic text formatting we can use __Value Formatters__.

__Value Formatters__ are basic functions which take the value of the cell, apply some basic formatting, and return a new value to be displayed by the grid. Let's try this by adding the `valueFormatter` property to our 'price' column and returning the formatted value:

<snippet transform={false} language=jsx>
|const [colDefs] = useState([
|  ...
|  {
|    field: "price",
|    valueFormatter: params => return '£' + params.value.toLocaleString(); // Returns a formatted string
|  }
|  ...
|]);
|
|return (
|  &lt;div className="ag-theme-custom" style={{ width: 600, height: 500 }}>
|    &lt;AgGridReact columnDefs={colDefs} />
|  &lt;/div>
|);
</snippet>

The grid should now show the formatted value in the 'price' column:

<grid-example title='Value Formatter Example' name='value-formatter-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

## Custom Cell Components

__Value Formatters__ are useful for basic formatting, but for more advanced use-cases we can use __Cell Renderers__ instead.

__Cell Renderers__ allow you to use your own React components within cells. To use a custom component, set the `cellRenderer` prop on a column, with the value as the name of your component.

Let's try this by creating a new component to display a flag in the 'country' column:

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

And then adding the `cellRenderer` prop on our 'country' column to use our component:

<snippet transform={false} language=jsx>
|const [colDefs] = useState([
|  {
|    field: "country",
|    cellRenderer: 'CountryFlagCellRenderer' // Use 'CountryFlagCellRenderer' for this column
|  },
|  ...
|]);
</snippet>

Now, when we run the grid, we should see a country flag in place of the name:

<grid-example title='Cell Renderer Example' name='cell-renderer-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

---

## Handle Grid Events

In the last section of this tutorial we're going to hook into events raised by the grid using ___Grid Events___.

To be notified of when an event is raised by the grid we need to use the relevant `on[EventName]` prop on the grid component. Let's try this out by enabling cell editing with `editable: true` and hooking into the `onCellValueChanged` event to log the new value to the console:

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

## Test Your Knowledge

Let's put what you've learned so far into action by modifying the grid:

1. Enable multiple row selection

   _Hint: `rowSelection` is a Grid Option property_

2. Enable Checkbox Selection on the 'mission' column

   _Hint: `checkboxSelection` is a Column Definition property_

3. Log a message to the console when a row selection is changed

   _Hint: `onSelectionChanged` is a Grid Event_

4. Format the Date column using `.toLocaleDateString()`;

    _Hint: Use a `valueFormatter` on the 'Date' column to format its value_

Once complete, your grid should look like the example below. If you're stuck, check out the source code to see how its done:

<grid-example title='Testing Example' name='testing-example' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

---

## Summary

Congratulations! You've completed the tutorial and built your first grid. By now, you should be familiar with the key concepts of AG Grid:

- __Row Data:__ Your data, in JSON format, that you want the grid to display.

- __Column Definitions:__ Define your columns and control column-specific functionality, like sorting and filtering.

- __Default Column Definitions:__ Similar to Column Definitions, but applies configurations to all columns.

- __Grid Options:__ Configure functionality which extends across the entire grid.

- __Grid Events:__ Events raised by the grid, typically as a result of user interaction.

- __Value Formatters:__ Functions used for basic text formatting

- __Cell Renderers:__ Add your own components to cells

## Next Steps

Browse our guides to dive into specific features of the grid:

- [Theming & Styling]()
- [Testing]()
- [Security]()
- [Best Practices]()

</framework-specific-section>