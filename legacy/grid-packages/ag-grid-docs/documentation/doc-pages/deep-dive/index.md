---
title: "Creating a Basic Grid"
---

An introduction to the key concepts of AG Grid.

## Overview

In this tutorial you will:

1. [Create a basic grid](/deep-dive/#create-a-basic-grid)
2. [Load external data into the grid](/deep-dive/#load-new-data)
3. [Configure columns](/deep-dive/#configure-columns)
4. [Configure grid features](/deep-dive/#configure-the-grid)
5. [Format cell values](/deep-dive/#format-cell-values)
6. [Add custom components to cells](/deep-dive/#custom-cell-components)
7. [Hook into grid events](/deep-dive/#handle-grid-events)

Once complete, you'll have an interactive grid, with custom components and formatted data - Try it out for yourself by __sorting__, __filtering__, __resizing__, __selecting__, or __editing__ data in the grid:

<grid-example title='Testing Example' name='testing-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

## Create a Basic Grid

<framework-specific-section frameworks="javascript">

<!-- Create a Basic Grid -->

Complete our [Quick Start](/getting-started/) (or open the example below in CodeSandbox / Plunker) to start with a basic grid, comprised of:

1. __Grid Options:__ An object which holds all of the options for the grid, such as Row Data & Column Definitions.
2. __Row Data:__ The data to be displayed.
3. __Column Definition:__ Defines & controls grid columns.
4. __Container:__ A div that contains and defines the grid's theme & dimensions.
5. __Grid API:__ Provides access to Grid API methods. Initialised when creating a new grid.

<grid-example title='Basic Example' name='basic-example' type='mixed' options='{ "exampleHeight": 220 }'></grid-example>

---

</framework-specific-section>

<framework-specific-section frameworks="react">

<!-- Create a Basic Grid -->

Complete our [Quick Start](/getting-started/) (or open the example below in CodeSandbox / Plunker) to start with a basic grid, comprised of:

1. __Row Data:__ The data to be displayed.
2. __Column Definition:__ Defines & controls grid columns.
3. __Container:__ A div that contains the grid and defines it's theme & dimensions.
4. __Grid Component:__ The `AgGridReact` component with __Row Data__ and __Column Definition__ props.

<grid-example title='Basic Example' name='basic-example' type='mixed' options='{ "exampleHeight": 220 }'></grid-example>

_Note: `rowData` and `columnDefs` arrays use the `useState` hook. We recommend `useState` if the data is mutable, otherwise `useMemo` is preferable. Read our [Best Practices](/react-hooks/) guide to learn more about using React hooks with AG Grid._

---

</framework-specific-section>

<framework-specific-section frameworks="angular">

<!-- Create a Basic Grid -->

Complete our [Quick Start](/getting-started/) (or open the example below in CodeSandbox / Plunker) to start with a basic grid, comprised of:

1. __Row Data:__ The data to be displayed.
2. __Column Definition:__ Defines & controls grid columns.
3. __Grid Component:__ The `ag-grid-angular` component, with Dimensions, CSS Theme, Row Data, and Column Definition attributes

<grid-example title='Basic Example' name='basic-example' type='mixed' options='{ "exampleHeight": 220 }'></grid-example>

---

</framework-specific-section>

<framework-specific-section frameworks="vue">

<!-- Create a Basic Grid -->

Complete our [Quick Start](/getting-started/) (or open the example below in CodeSandbox / Plunker) to start with a basic grid, comprised of:

1. __Row Data:__ The data to be displayed.
2. __Column Definition:__ Defines & controls grid columns.
3. __Grid Component:__ The `ag-grid-vue` component, with Dimensions, CSS Theme, Row Data, and Column Definition attributes

<grid-example title='Basic Example' name='basic-example' type='mixed' options='{ "exampleHeight": 220 }'></grid-example>

---

</framework-specific-section>

## Load New Data

<framework-specific-section frameworks="javascript">

<!-- Load New Data -->

The Grid API provides a way of interacting with the grid. To update the data within the grid, we can use the `setGridOption` API. Let's test this by fetching some data and updating our grid with the response:

<snippet transform={false} language="jsx">
|fetch('https://www.ag-grid.com/example-assets/space-mission-data.json')
|  .then(response => response.json())
|  .then((data: any) => gridApi.setGridOption('rowData', data))
</snippet>

Now that we're loading data from an external source, we can empty our `rowData` array (which will allow the grid to display a loading spinner whilst the data is being fetched) and update our `colDefs` to match the new dataset:

<snippet transform={false} language="jsx">
|const gridOptions = {
|  rowData: [],
|  colDefs: [
|    { field: "mission" },
|    { field: "company" },
|    { field: "location" },
|    { field: "date" },
|    { field: "price" },
|    { field: "successful" },
|    { field: "rocket" }
|  ]
|}
</snippet>

When we run our application, we should see a grid with ~1,400 rows of new data, and new column headers to match:

<grid-example title='Updating Example' name='updating-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Note: There are a large number of APIs available. See our [API Docs](/grid-api/) for an exhaustive list._

---

</framework-specific-section>

<framework-specific-section frameworks="react">

<!-- Load New Data -->

As `rowData` is a reactive property, any updates to its state will be reflected in the grid. Let's test this by fetching some data from an external server and updating `rowData` with the response:

<snippet transform={false} language="jsx">
|// Fetch data & update rowData state
|useEffect(() => {
|  fetch('https://www.ag-grid.com/example-assets/space-mission-data.json') // Fetch data from server
|    .then(result => result.json()) // Convert to JSON
|    .then(rowData => setRowData(rowData)); // Update state of `rowData`
|}, [])
</snippet>

Now that we're loading data from an external source, we can empty our `rowData` array (which will allow the grid to display a loading spinner whilst the data is being fetched) and update our `colDefs` to match the new dataset:

<snippet transform={false} language="jsx">
|const GridExample = () => {
|  // Row Data: The data to be displayed.
|  const [rowData, setRowData] = useState([]);
|  const [colDefs, setColDefs] = useState([
|    { field: "mission" },
|    { field: "company" },
|    { field: "location" },
|    { field: "date" },
|    { field: "price" },
|    { field: "successful" },
|    { field: "rocket" }
|  ]);
|  // ...
|}
</snippet>

When we run our application, we should see a grid with ~1,400 rows of new data, and new column headers to match:

<grid-example title='Updating Example' name='updating-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Note: All properties that are not tagged as 'initial' are reactive. See our [API docs](/grid-options/) for a complete list._

---

</framework-specific-section>

<framework-specific-section frameworks="angular">

<!-- Load New Data -->

As rowData is a managed property, any updates to its value will be reflected in the grid. Let's test this by fetching some data from an external server with <a href="https://angular.dev/guide/http" target="_blank">Angular's HttpClient</a> and updating rowData with the response.

First we need to hook into the `gridReady` event by adding `(gridReady)="onGridReady($event)"` to the `ag-grid-angular` component:

<snippet transform={false} language="html">
|&lt;!-- The AG Grid component, with various Grid Option properties -->
|&lt;ag-grid-angular
|  style="width: 100%; height: 550px;"
|  class="ag-theme-quartz-dark"
|  [rowData]="rowData"
|  [columnDefs]="colDefs"
|  (gridReady)="onGridReady($event)"
|>
|&lt;/ag-grid-angular>
</snippet>

_Note: [Grid Events](/deep-dive/#grid-events) are covered in more detail later on_

And then executing a HTTP request when the onGridReady event is fired, subscribing to the result to update our rowData asynchronously:

<snippet transform={false} language="ts">
|// Load data into grid when ready
|onGridReady(params: GridReadyEvent) {
|  this.http
|    .get&lt;any[]>('https://www.ag-grid.com/example-assets/space-mission-data.json')
|    .subscribe(data => this.rowData = data);
|}
</snippet>

Finally, now that we're loading data from an external source, we can empty our `rowData` array (which will allow the grid to display a loading spinner whilst the data is being fetched) and update our `colDefs` to match the new dataset:

<snippet transform={false} language="jsx">
|export class AppComponent {
|  // Row Data: The data to be displayed.
|  rowData: IRow[] = [];
|  colDefs: ColDef[] = [
|    { field: "mission" },
|    { field: "company" },
|    { field: "location" },
|    { field: "date" },
|    { field: "price" },
|    { field: "successful" },
|    { field: "rocket" }
|  ];
|  // ...
|}
</snippet>

When we run our application, we should see a grid with ~1,400 rows of new data, and new column headers to match:

<grid-example title='Updating Example' name='updating-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Note: All [Grid Option](/grid-options/) properties tagged as 'managed' are automatically updated when their value changes._

---

</framework-specific-section>

<framework-specific-section frameworks="vue">

<!-- Load New Data -->

As rowData is a managed property, any updates to its value will be reflected in the grid. Let's test this by fetching some data from an external server and updating rowData with the response.

<snippet transform={false} language="jsx">
|// Fetch data when the component is mounted
|onMounted(async () => {
|  rowData.value = await fetchData();
|});
|
|const fetchData = async () => {
|  const response = await fetch('https://www.ag-grid.com/example-assets/space-mission-data.json');
|  return response.json();
|};
</snippet>

Now that we're loading data from an external source, we can empty our `rowData` array (which will allow the grid to display a loading spinner whilst the data is being fetched) and update our `colDefs` to match the new dataset:

<snippet transform={false} language="jsx">
|const App = {
|  setup() {
|    const rowData = ref([]);
|    const colDefs = ref([
|      { field: "mission" },
|      { field: "company" },
|      { field: "location" },
|      { field: "date" },
|      { field: "price" },
|      { field: "successful" },
|      { field: "rocket" }
|    ]);
|    // ...
|  }
|  // ...
|}
</snippet>

When we run our application, we should see a grid with ~1,400 rows of new data, and new column headers to match:

<grid-example title='Updating Example' name='updating-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

Note: All [Grid Option](/grid-options/) properties tagged as 'managed' are automatically updated when their value changes.

---

</framework-specific-section>

## Configure Columns

<framework-specific-section frameworks="javascript">

<!-- Configure Columns -->

Now that we have a basic grid with some arbitrary data, we can start to configure the grid with ___Column Properties___.

Column Properties can be added to one or more columns to enable/disable column-specific features. Let's try this by adding the `filter: true` property to the 'mission' column:

<snippet transform={false} language="jsx">
|columnDefs: [
|  { field: "mission", filter: true },
|  // ...
|],
</snippet>

We should now be able to filter the 'mission' column - you can test this by filtering for the 'Apollo' missions:

<grid-example title='Configuring Columns Example' name='configure-columns-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Note: Column properties can be used to configure a wide-range of features; refer to our [Column Properties](/column-properties/) page for a full list of features._

</framework-specific-section>

<framework-specific-section frameworks="react">

<!-- Configure Columns -->

Now that we have a basic grid with some arbitrary data, we can start to configure the grid with ___Column Properties___.

Column Properties can be added to one or more columns to enable/disable column-specific features. Let's try this by adding the `filter: true` property to the 'mission' column:

<snippet transform={false} language="jsx">
|const [colDefs] = useState([
|  { field: "mission", filter: true },
|  // ...
|]);
</snippet>

We should now be able to filter the 'mission' column - you can test this by filtering for the 'Apollo' missions:

<grid-example title='Configuring Columns Example' name='configure-columns-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Note: Column properties can be used to configure a wide-range of features; refer to our [Column Properties](/column-properties/) page for a full list of features._

</framework-specific-section>

<framework-specific-section frameworks="angular">

<!-- Configure Columns -->

Now that we have a basic grid with some arbitrary data, we can start to configure the grid with ___Column Properties___.

Column Properties can be added to one or more columns to enable/disable column-specific features. Let's try this by adding the `filter: true` property to the 'mission' column:

<snippet transform={false} language="jsx">
|colDefs: ColDef[] = [
|  { field: "mission", filter: true },
|  // ...
|];
</snippet>

We should now be able to filter the 'mission' column - you can test this by filtering for the 'Apollo' missions:

<grid-example title='Configuring Columns Example' name='configure-columns-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Note: Column properties can be used to configure a wide-range of features; refer to our [Column Properties](/column-properties/) page for a full list of features._

</framework-specific-section>

<framework-specific-section frameworks="vue">

<!-- Configure Columns -->

Now that we have a basic grid with some arbitrary data, we can start to configure the grid with ___Column Properties___.

Column Properties can be added to one or more columns to enable/disable column-specific features. Let's try this by adding the `filter: true` property to the 'mission' column:

<snippet transform={false} language="jsx">
|const colDefs = ref([
|  { field: "mission", filter: true },
|  // ...
|];
</snippet>

We should now be able to filter the 'mission' column - you can test this by filtering for the 'Apollo' missions:

<grid-example title='Configuring Columns Example' name='configure-columns-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Note: Column properties can be used to configure a wide-range of features; refer to our [Column Properties](/column-properties/) page for a full list of features._

</framework-specific-section>

### Default Column Definitions

<framework-specific-section frameworks="javascript">

<!-- Default Column Definitions -->

The example above demonstrates how to configure a single column. To apply this configuration across all columns we can use ___Default Column Definitions___ instead. Let's make all of our columns filterable by adding the `defaultColDef` property to our Grid Options object, and setting `filter: true`:

<snippet transform={false} language="jsx">
|const gridOptions = {
|  defaultColDef: {
|    filter: true
|  }
|  // ...
|}
</snippet>

The grid should now allow filtering on all columns:

<grid-example title='Default Column Definitions Example' name='default-columns-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Note: Column Definitions take precedence over Default Column Definitions_

---

</framework-specific-section>

<framework-specific-section frameworks="react">

<!-- Default Column Definitions -->

The example above demonstrates how to configure a single column. To apply this configuration across all columns we can use ___Default Column Definitions___ instead. Let's make all of our columns filterable by creating a `defaultColDef` object, setting `filter: true`, and passing this to the grid via the `defaultColDef` prop:

<snippet transform={false} language="jsx">
|// Apply settings across all columns
|const defaultColDef = useMemo(() => ({
|  filter: true // Enable filtering on all columns
|}))
|
|&lt;div className="ag-theme-quartz" style={{ width: 600, height: 500 }}>
|  &lt;AgGridReact
|    defaultColDef={defaultColDef}
|    //...
|  />
|&lt;/div>
</snippet>

The grid should now allow filtering on all columns:

<grid-example title='Default Column Definitions Example' name='default-columns-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Note: Column Definitions take precedence over Default Column Definitions_

---

</framework-specific-section>

<framework-specific-section frameworks="angular">

<!-- Default Column Definitions -->

The example above demonstrates how to configure a single column. To apply this configuration across all columns we can use ___Default Column Definitions___ instead. Let's make all of our columns filterable by creating a `defaultColDef` object, setting `filter: true`, and passing this to our template:

<snippet transform={false} language="jsx">
|@Component({
|  template:
|  `
|  &lt;div class="content">
|    &lt;ag-grid-angular
|      ...
|      [defaultColDef]="defaultColDef"
|    >
|    &lt;/ag-grid-angular>
|  &lt;/div>
|  `,
|  // ...
|})
|
|export class AppComponent {
|  // Default Column Definitions: Apply configuration across all columns
|  defaultColDef: ColDef = {
|    filter: true
|  }
|  // ...
|}
</snippet>

The grid should now allow filtering on all columns:

<grid-example title='Default Column Definitions Example' name='default-columns-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Note: Column Definitions take precedence over Default Column Definitions_

---

</framework-specific-section>

<framework-specific-section frameworks="vue">

<!-- Default Column Definitions -->

The example above demonstrates how to configure a single column. To apply this configuration across all columns we can use ___Default Column Definitions___ instead. Let's make all of our columns filterable by creating a `defaultColDef` object with the property `filter: true`:

<snippet transform={false} language="jsx">
|const App = {
|  setup() {
|    const defaultColDef = ref({
|      filter: true
|    });
|    // ...
|  }
|  return {
|    defaultColDef
|    // ...
|  };
|  // ...
|}
</snippet>

And then adding this to our `ag-grid-vue` component:

<snippet transform={false} language="jsx">
|const App = {
|  template:
|    `
|    &lt;ag-grid-vue
|      style="width: 100%; height: 100%"
|      class="ag-theme-quartz-dark"
|      :columnDefs="colDefs"
|      :rowData="rowData"
|      :defaultColDef="defaultColDef"
|    >
|    &lt;/ag-grid-vue>
|    `,
|  // ...
}
</snippet>

The grid should now allow filtering on all columns:

<grid-example title='Default Column Definitions Example' name='default-columns-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Note: Column Definitions take precedence over Default Column Definitions_

---

</framework-specific-section>

## Configure The Grid

<framework-specific-section frameworks="javascript">

<!-- Configure The Grid-->

So far we've covered creating a grid, updating the data within the grid, and configuring columns. This section introduces __Grid Options__, which control functionality that extends across both rows & columns, such as Pagination and Row Selection.

To use Grid Options, simply add the relevant property to the Grid Options object. Let's try this by adding `pagination: true` to our Grid Options:

<snippet transform={false} language="jsx">
|const gridOptions: GridOptions = {
|  pagination: true
|  // ...
|}
</snippet>

We should now see Pagination has been enabled on the grid:

<grid-example title='Grid Options Example' name='grid-options-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Refer to our detailed [Grid Options](/grid-options/) documentation for a full list of options._

---

</framework-specific-section>

<framework-specific-section frameworks="react">

<!-- Configure The Grid-->

So far we've covered creating a grid, updating the data within the grid, and configuring columns. This section introduces __Grid Options__, which control functionality that extends across both rows & columns, such as Pagination and Row Selection.

Grid Options are passed to the grid component directly as props. Let's enable pagination by adding `pagination={true}`:

<snippet transform={false} language="jsx">
|&lt;div className="ag-theme-quartz" style={{ width: 600, height: 500 }}>
|  &lt;AgGridReact
|    // ...
|    pagination={true} // Enable Pagination
|  />
|&lt;/div>
</snippet>

We should now see Pagination has been enabled on the grid:

<grid-example title='Grid Options Example' name='grid-options-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Refer to our detailed [Grid Options](/grid-options/) documentation for a full list of options._

---

</framework-specific-section>

<framework-specific-section frameworks="angular">

<!-- Configure The Grid-->

So far we've covered creating a grid, updating the data within the grid, and configuring columns. This section introduces __Grid Options__, which control functionality that extends across both rows & columns, such as Pagination and Row Selection.

Grid Options are passed to the grid via attributes on the `ag-grid-angular` component. Let's enable pagination by adding `[pagination]="true"`:

<snippet transform={false} language="html">
|&lt;!-- The AG Grid component, with various Grid Option properties -->
|&lt;ag-grid-angular
|  ...
|  [pagination]="true"
|>
|&lt;/ag-grid-angular>
</snippet>

We should now see Pagination has been enabled on the grid:

<grid-example title='Grid Options Example' name='grid-options-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Refer to our detailed [Grid Options](/grid-options/) documentation for a full list of options._

---

</framework-specific-section>

<framework-specific-section frameworks="vue">

<!-- Configure The Grid-->

So far we've covered creating a grid, updating the data within the grid, and configuring columns. This section introduces __Grid Options__, which control functionality that extends across both rows & columns, such as Pagination and Row Selection.

Grid Options are added directly to the `ag-grid-vue` component. Let's test this out by adding the `:pagination="true"` to the grid:

<snippet transform={false} language="jsx">
|const App = {
|  name: "App",
|  template: 
|    `
|    &lt;ag-grid-vue
|      style="width: 100%; height: 100%"
|      class="ag-theme-quartz-dark"
|      :columnDefs="colDefs"
|      :rowData="rowData"
|      :defaultColDef="defaultColDef"
|      :pagination="true"
|    >
|    &lt;/ag-grid-vue>
|    `,
|  //...
|}
</snippet>

We should now see Pagination has been enabled on the grid:

<grid-example title='Grid Options Example' name='grid-options-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Refer to our detailed [Grid Options](/grid-options/) documentation for a full list of options._

---

</framework-specific-section>

## Format Cell Values

<framework-specific-section frameworks="javascript">

<!-- Format Cell Values-->

The data supplied to the grid usually requires some degree of formatting. For basic text formatting we can use __Value Formatters__.

__Value Formatters__ are basic functions which take the value of the cell, apply some basic formatting, and return a new value to be displayed by the grid. Let's try this by adding the `valueFormatter` property to our 'price' column and returning the formatted value:

<snippet transform={false} language="jsx">
|columnDefs: [
|  {
|    field: "price",
|    // Return formatted value
|    valueFormatter: (params) => { return '£' + params.value.toLocaleString(); }
|  },
|],
</snippet>

The grid should now show the formatted value in the 'price' column:

<grid-example title='Value Formatter Example' name='value-formatter-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Note: Read our [Value Formatter](/value-formatters/) page for more information on formatting cell values_

---

</framework-specific-section>

<framework-specific-section frameworks="react">

<!-- Format Cell Values-->

The data supplied to the grid usually requires some degree of formatting. For basic text formatting we can use __Value Formatters__.

__Value Formatters__ are basic functions which take the value of the cell, apply some basic formatting, and return a new value to be displayed by the grid. Let's try this by adding the `valueFormatter` property to our 'price' column and returning the formatted value:

<snippet transform={false} language="jsx">
|const [colDefs] = useState([
|  {
|    field: "price",
|    // Return a formatted string for this column
|    valueFormatter: params => { return '£' + params.value.toLocaleString(); }
|  },
|  // ...
|]);
</snippet>

The grid should now show the formatted value in the 'price' column:

<grid-example title='Value Formatter Example' name='value-formatter-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Note: Read our [Value Formatter](/value-formatters/) page for more information on formatting cell values_

---

</framework-specific-section>

<framework-specific-section frameworks="angular">

<!-- Format Cell Values-->

The data supplied to the grid usually requires some degree of formatting. For basic text formatting we can use __Value Formatters__.

__Value Formatters__ are basic functions which take the value of the cell, apply some basic formatting, and return a new value to be displayed by the grid. Let's try this by adding the `valueFormatter` property to our 'price' column and returning the formatted value:

<snippet transform={false} language="ts">
|colDefs: ColDef[] = [
|  {
|    field: "price",
|    valueFormatter: params => { return '£' + params.value.toLocaleString(); } // Format with inline function
|  },
|  // ...
|];
</snippet>

The grid should now show the formatted value in the 'price' column:

<grid-example title='Value Formatter Example' name='value-formatter-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Note: Read our [Value Formatter](/value-formatters/) page for more information on formatting cell values_

---

</framework-specific-section>

<framework-specific-section frameworks="vue">

<!-- Format Cell Values-->

The data supplied to the grid usually requires some degree of formatting. For basic text formatting we can use __Value Formatters__.

__Value Formatters__ are basic functions which take the value of the cell, apply some basic formatting, and return a new value to be displayed by the grid. Let's try this by adding the `valueFormatter` property to our 'price' column and returning the formatted value:

<snippet transform={false} language="jsx">
const colDefs = ref([
  { field: "price", valueFormatter: (params) => { return '£' + params.value.toLocaleString(); } },
  // ...
]);
</snippet>

The grid should now show the formatted value in the 'price' column:

<grid-example title='Value Formatter Example' name='value-formatter-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Note: Read our [Value Formatter](/value-formatters/) page for more information on formatting cell values_

</framework-specific-section>

## Custom Cell Components

<framework-specific-section frameworks="javascript">

<!-- Custom Cell Components-->

__Value Formatters__ are useful for basic formatting, but for more advanced use-cases we can use __Cell Renderers__ instead.

__Cell Renderers__ allow you add custom HTML & JS within cells. To use a Cell Renderer, set the `cellRenderer` prop on a column, with the value as the name of your Cell Renderer.

Let's try this by creating a new component to display the company logo in the 'company' column:

<snippet transform={false} language="jsx">
|class CompanyLogoRenderer {
|  eGui;
|
|  // Optional: Params for rendering. The same params that are passed to the cellRenderer function.
|  init(params) {
|    let companyLogo = document.createElement('img');
|    companyLogo.src = `https://www.ag-grid.com/example-assets/space-company-logos/${params.value.toLowerCase()}.png`
|    companyLogo.setAttribute('style', 'display: block; width: 25px; height: auto; max-height: 50%; margin-right: 12px; filter: brightness(1.1)');
|    let companyName = document.createElement('p');
|    companyName.textContent = params.value;
|    companyName.setAttribute('style', 'text-overflow: ellipsis; overflow: hidden; white-space: nowrap;');
|    this.eGui = document.createElement('span');
|    this.eGui.setAttribute('style', 'display: flex; height: 100%; width: 100%; align-items: center')
|    this.eGui.appendChild(companyLogo)
|    this.eGui.appendChild(companyName)
|  }
|
|  // Required: Return the DOM element of the component, this is what the grid puts into the cell
|  getGui() {
|    return this.eGui;
|  }
|
|  // Required: Get the cell to refresh.
|  refresh(params) {
|    return false
|  }
|}
</snippet>

And then adding `cellRenderer: CompanyLogoRenderer` to the 'company' column definition:

<snippet transform={false} language="jsx">
|columnDefs: [
|  {
|    field: "company",
|    cellRenderer: CompanyLogoRenderer
|  },
|  // ...
|],
</snippet>

Now, when we run the grid, we should see a company logo next to the name:

<grid-example title='Cell Renderer Example' name='cell-renderer-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Note: Read our [Cell Components](/component-cell-renderer/) page for more information on using custom components in cells_

---

</framework-specific-section>

<framework-specific-section frameworks="react">

<!-- Custom Cell Components-->

__Value Formatters__ are useful for basic formatting, but for more advanced use-cases we can use __Cell Renderers__ instead.

__Cell Renderers__ allow you to use your own React components within cells. To use a custom component, set the `cellRenderer` prop on a column, with the value as the name of your component.

Let's try this by creating a new component to display the company logo in the 'company' column:

<snippet transform={false} language="jsx">
|// Custom Cell Renderer (Display flags based on cell value)
|const CompanyLogoRenderer = ({ value }) => (
|  &lt;span style={{ display: "flex", height: "100%", width: "100%", alignItems: "center" }}>{value && &lt;img alt={`${value} Flag`} src={`https://www.ag-grid.com/example-assets/space-company-logos/${value.toLowerCase()}.png`} style={{display: "block", width: "25px", height: "auto", maxHeight: "50%", marginRight: "12px", filter: "brightness(1.1)"}} />}&lt;p style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{value}&lt;/p>&lt;/span>
);
</snippet>

And then adding the `cellRenderer` prop on our 'company' column to use our component:

<snippet transform={false} language="jsx">
|const [colDefs] = useState([
|  {
|    field: "company",
|    // Add component to column via cellRenderer
|    cellRenderer: CompanyLogoRenderer
|  },
|  // ...
|]);
</snippet>

Now, when we run the grid, we should see a company logo next to the name:

<grid-example title='Cell Renderer Example' name='cell-renderer-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Note: Read our [Cell Components](/component-cell-renderer/) page for more information on using custom components in cells_

---

</framework-specific-section>

<framework-specific-section frameworks="angular">

<!-- Custom Cell Components-->

__Value Formatters__ are useful for basic formatting, but for more advanced use-cases we can use __Cell Renderers__ instead.

__Cell Renderers__ allow you to use your own components within cells. To use a custom component, add the `cellRenderer` prop to a column and set the value to the name of your component.

Let's try this by creating a new component to display the company logo in the 'company' column:

<snippet transform={false} language="jsx">
|// Custom Cell Renderer Component
|@Component({
|  selector: 'app-company-logo-renderer',
|  standalone: true,
|  imports: [CommonModule],
|  template: `&lt;span *ngIf="value" >&lt;img [alt]="value" [src]="'https://www.ag-grid.com/example-assets/space-company-logos/' + value.toLowerCase() + '.png'" /> &lt;p>{{ value }}&lt;/p>&lt;/span>`,
|  styles: ["img {display: block; width: 25px; height: auto; max-height: 50%; margin-right: 12px; filter: brightness(1.2);} span {display: flex; height: 100%; width: 100%; align-items: center} p { text-overflow: ellipsis; overflow: hidden; white-space: nowrap }"]
|})
|
|export class CompanyLogoRenderer implements ICellRendererAngularComp {
|  // Init Cell Value
|  public value!: string;
|  agInit(params: ICellRendererParams): void {
|    this.value = params.value;
|  }
|
|  // Return Cell Value
|  refresh(params: ICellRendererParams): boolean {
|    this.value = params.value;
|    return true;
|  }
|}
</snippet>

And then adding the cellRenderer prop on our 'company' column to use our component:

<snippet transform={false} language="ts">
|colDefs: ColDef[] = [
|  {
|    field: "company",
|    cellRenderer: CompanyLogoRenderer // Render a custom component
|  }
|  // ...
|];
</snippet>

Now, when we run the grid, we should see a company logo next to the name:

<grid-example title='Cell Renderer Example' name='cell-renderer-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Note: Read our [Cell Components](/component-cell-renderer/) page for more information on using custom components in cells_

---

</framework-specific-section>

<framework-specific-section frameworks="vue">

<!-- Custom Cell Components-->

__Value Formatters__ are useful for basic formatting, but for more advanced use-cases we can use __Cell Renderers__ instead.

__Cell Renderers__ allow you to use your own components within cells. To use a custom component, set the `cellRenderer` prop on a column, with the value as the name of your component.

Let's try this by creating a new component to display the company logo in the 'company' column:

<snippet transform={false} language="jsx">
|const CompanyLogoRenderer = {
|  template:
|    `
|    &lt;span style="display: flex; height: 100%; width: 100%; align-items: center;">
|      &lt;img :src="'https://www.ag-grid.com/example-assets/space-company-logos/' + cellValueLowerCase + '.png'" style="display: block; width: 25px; height: auto; max-height: 50%; margin-right: 12px; filter: brightness(1.1);" />
|      &lt;p style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">{{ cellValue }}&lt;/p>
|    &lt;/span>
|    `,
|  setup(props) {
|    const cellValue = props.params.value;
|    const cellValueLowerCase = cellValue.toLowerCase();
|    return {
|      cellValue,
|      cellValueLowerCase
|    };
|  },
|};
</snippet>

And then adding the `cellRenderer` property to the 'company' column:

<snippet transform={false} language="jsx">
|const App = {
|  components: {
|    AgGridVue,
|    companyLogoRenderer: CompanyLogoRenderer
|  },
|  setup() {
|    const colDefs = ref([
|      { field: "company", cellRenderer: "companyLogoRenderer" },
|      // ...
|    ]);
|    // ...
|  }
|  // ...
|}
</snippet>

Now, when we run the grid, we should see a company logo next to the name:

<grid-example title='Cell Renderer Example' name='cell-renderer-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Note: Read our [Cell Components](/component-cell-renderer/) page for more information on using custom components in cells_

---

</framework-specific-section>

## Handle Grid Events

<framework-specific-section frameworks="javascript">

<!-- Handle Grid Events-->

In the last section of this tutorial we're going to hook into events raised by the grid using ___Grid Events___.

To be notified of when an event is raised by the grid we need to add the relevant `on[EventName]` property to our Grid Options, and provide a function to handle the event.

Let's try this out by enabling cell editing in our DefaultColDefs with `editable: true` and hooking into the `onCellValueChanged` event to log the new value to the console:

<snippet transform={false} language="jsx">
|const gridOptions = {
|  // Configurations applied to all columns
|  defaultColDef: {
|    editable: true,
|    // ...
|  },
|  // Log new value when cell value changes
|  onCellValueChanged: (event) => {
|    console.log(`New Cell Value: ${event.value}`)
|  }
|  // ...
|}
</snippet>

Now, when we click on a cell we should be able to edit it and see the new value logged to the console:

<grid-example title='Complete Example' name='grid-events-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Refer to our [Grid Events](/grid-events/) documentation for a full list of events raised by the grid_

---

</framework-specific-section>

<framework-specific-section frameworks="react">

<!-- Handle Grid Events-->

In the last section of this tutorial we're going to hook into events raised by the grid using ___Grid Events___.

To be notified of when an event is raised by the grid we need to use the relevant `on[EventName]` prop on the grid component. Let's try this out by enabling cell editing with `editable: true` and hooking into the `onCellValueChanged` event to log the new value to the console:

<snippet transform={false} language="jsx">
|const defaultColDef = useMemo(() => ({
|  editable: true, // Enable editing on all cells
|  // ...
|}))
|
|&lt;div className="ag-theme-quartz" style={{ width: 600, height: 500 }}>
|  &lt;AgGridReact
|    // Hook into CellValueChanged event and log value
|    onCellValueChanged={event => console.log(`New Cell Value: ${event.value}`)}
|    // ...
|  />
|&lt;/div>
</snippet>

Now, when we click on a cell we should be able to edit it and see the new value logged to the console:

<grid-example title='Complete Example' name='grid-events-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Refer to our [Grid Events](/grid-events/) documentation for a full list of events raised by the grid_

---

</framework-specific-section>

<framework-specific-section frameworks="angular">

<!-- Handle Grid Events-->

In the last section of this tutorial we're going to hook into events raised by the grid using ___Grid Events___.

To be notified of when an event is raised by the grid we need to add the relevant event name attribute to the `ag-grid-angular` component.

Let's try this out by enabling cell editing with `editable: true` on the Default Column Definitions:

<snippet transform={false} language="ts">
|// Default Column Definitions: Apply configuration across all columns
|defaultColDef: ColDef = {
|  editable: true
|  // ...
|}
</snippet>

Next, lets create a function to handle the event:

<snippet transform={false} language="jsx">
|// Handle cell editing event
|onCellValueChanged = (event: CellValueChangedEvent) => {
|  console.log(`New Cell Value: ${event.value}`)
|}
</snippet>

Finally, let's add the `gridReady` attribute to the `ag-grid-angular` component, with the value as the function we've just created:

<snippet transform={false} language="ts">
|&lt;!-- The AG Grid component, with various Grid Option properties -->
|&lt;ag-grid-angular
|  (gridReady)="onGridReady($event)"
|  ...
|>
|&lt;/ag-grid-angular>
</snippet>

Now, when we click on a cell we should be able to edit it and see the new value logged to the console:

<grid-example title='Complete Example' name='grid-events-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Refer to our [Grid Events](/grid-events/) documentation for a full list of events raised by the grid_

---

</framework-specific-section>

<framework-specific-section frameworks="vue">

<!-- Handle Grid Events-->

In the last section of this tutorial we're going to hook into events raised by the grid using ___Grid Events___.

To be notified of when an event is raised by the grid we need to use the relevant `@[event-name]` attribute on the `ag-grid-vue` component. Let's try this out by enabling cell editing with `editable: true` and hooking into the `onCellValueChanged` event to log the new value to the console:

<snippet transform={false} language="jsx">
|const App = {
|  template:
|    `
|    &lt;ag-grid-vue
|      ...
|      @cell-value-changed="onCellValueChanged"
|    >
|    &lt;/ag-grid-vue>
|    `,
|  methods: {
|    onCellValueChanged(event) {
|      console.log(`New Cell Value: ${event.value}`);
|    }
|  },
|  setup() {
|    const defaultColDef = ref({
|      editable: true,
|      // ...
|    });
|    // ...
|  }
|  // ...
|}
</snippet>

Now, when we click on a cell we should be able to edit it and see the new value logged to the console:

<grid-example title='Complete Example' name='grid-events-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

_Refer to our [Grid Events](/grid-events/) documentation for a full list of events raised by the grid_

</framework-specific-section>

## Test Your Knowledge

<framework-specific-section frameworks="javascript">

<!-- Test Your Knowledge-->

Let's put what you've learned so far into action by modifying the grid:

1. Enable Checkbox Selection on the 'mission' column

   _Hint: `checkboxSelection` is a Column Definition property_

2. Enable multiple row selection

   _Hint: `rowSelection` is a Grid Option property_

3. Log a message to the console when a row selection is changed

   _Hint: `onSelectionChanged` is a Grid Event_

4. Format the Date column using `.toLocaleDateString()`;

    _Hint: Use a `valueFormatter` on the 'Date' column to format its value_

5. Add a Cell Renderer to display [ticks](https://www.ag-grid.com/example-assets/icons/tick-in-circle.png) and [crosses](https://www.ag-grid.com/example-assets/icons/cross-in-circle.png) in place of checkboxes on the 'Successful' column:

   _Hint: Use a `cellRenderer` on the 'successful' column_

Once complete, your grid should look like the example below. If you're stuck, check out the source code to see how its done:

<grid-example title='Testing Example' name='testing-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

---

</framework-specific-section>

<framework-specific-section frameworks="react">

<!-- Test Your Knowledge-->

Let's put what you've learned so far into action by modifying the grid:

1. Enable Checkbox Selection on the 'mission' column

   _Hint: `checkboxSelection` is a Column Definition property_

2. Enable multiple row selection

   _Hint: `rowSelection` is a Grid Option property_

3. Log a message to the console when a row selection is changed

   _Hint: `onSelectionChanged` is a Grid Event_

4. Format the Date column using `.toLocaleDateString()`;

    _Hint: Use a `valueFormatter` on the 'Date' column to format its value_

5. Add a Cell Renderer to display [ticks](https://www.ag-grid.com/example-assets/icons/tick-in-circle.png) and [crosses](https://www.ag-grid.com/example-assets/icons/cross-in-circle.png) in place of checkboxes on the 'Successful' column:

   _Hint: Use a `cellRenderer` on the 'successful' column_

Once complete, your grid should look like the example below. If you're stuck, check out the source code to see how its done:

<grid-example title='Testing Example' name='testing-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

---

</framework-specific-section>

<framework-specific-section frameworks="angular">

<!-- Test Your Knowledge-->

Let's put what you've learned so far into action by modifying the grid:

1. Enable Checkbox Selection on the 'mission' column

   _Hint: `checkboxSelection` is a Column Definition property_

2. Enable multiple row selection

   _Hint: `rowSelection` is a Grid Option property_

3. Log a message to the console when a row selection is changed

   _Hint: `onSelectionChanged` is a Grid Event_

4. Format the Date column using `.toLocaleDateString()`;

    _Hint: Use a `valueFormatter` on the 'Date' column to format its value_

5. Add a Cell Renderer to display [ticks](https://www.ag-grid.com/example-assets/icons/tick-in-circle.png) and [crosses](https://www.ag-grid.com/example-assets/icons/cross-in-circle.png) in place of checkboxes on the 'Successful' column:

   _Hint: Use a `cellRenderer` on the 'successful' column_

Once complete, your grid should look like the example below. If you're stuck, check out the source code to see how its done:

<grid-example title='Testing Example' name='testing-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

---

</framework-specific-section>

<framework-specific-section frameworks="vue">

<!-- Test Your Knowledge-->

Let's put what you've learned so far into action by modifying the grid:

1. Enable Checkbox Selection on the 'mission' column

   _Hint: `checkboxSelection` is a Column Definition property_

2. Enable multiple row selection

   _Hint: `rowSelection` is a Grid Option property_

3. Log a message to the console when a row selection is changed

   _Hint: `onSelectionChanged` is a Grid Event_

4. Format the Date column using `.toLocaleDateString()`;

    _Hint: Use a `valueFormatter` on the 'Date' column to format its value_

5. Add a Cell Renderer to display [ticks](https://www.ag-grid.com/example-assets/icons/tick-in-circle.png) and [crosses](https://www.ag-grid.com/example-assets/icons/cross-in-circle.png) in place of checkboxes on the 'Successful' column:

   _Hint: Use a `cellRenderer` on the 'successful' column_

Once complete, your grid should look like the example below. If you're stuck, check out the source code to see how its done:

<grid-example title='Testing Example' name='testing-example' type='mixed' options='{ "exampleHeight": 550 }'></grid-example>

---

</framework-specific-section>

## Summary

<framework-specific-section frameworks="javascript">

<!-- Summary-->

Congratulations! You've completed the tutorial and built your first grid. By now, you should be familiar with the key concepts of AG Grid:

- __Row Data:__ Your data, in JSON format, that you want the grid to display.

- __Column Definitions:__ Define your columns and control column-specific functionality, like sorting and filtering.

- __Default Column Definitions:__ Similar to Column Definitions, but applies configurations to all columns.

- __Grid Options:__ Configure functionality which extends across the entire grid.

- __Grid Events:__ Events raised by the grid, typically as a result of user interaction.

- __Value Formatters:__ Functions used for basic text formatting

- __Cell Renderers:__ Add your own components to cells

</framework-specific-section>

<framework-specific-section frameworks="react">

<!-- Summary-->

Congratulations! You've completed the tutorial and built your first grid. By now, you should be familiar with the key concepts of AG Grid:

- __Row Data:__ Your data, in JSON format, that you want the grid to display.

- __Column Definitions:__ Define your columns and control column-specific functionality, like sorting and filtering.

- __Default Column Definitions:__ Similar to Column Definitions, but applies configurations to all columns.

- __Grid Options:__ Configure functionality which extends across the entire grid.

- __Grid Events:__ Events raised by the grid, typically as a result of user interaction.

- __Value Formatters:__ Functions used for basic text formatting

- __Cell Renderers:__ Add your own components to cells

</framework-specific-section>

<framework-specific-section frameworks="angular">

<!-- Summary-->

Congratulations! You've completed the tutorial and built your first grid. By now, you should be familiar with the key concepts of AG Grid:

- __Row Data:__ Your data, in JSON format, that you want the grid to display.

- __Column Definitions:__ Define your columns and control column-specific functionality, like sorting and filtering.

- __Default Column Definitions:__ Similar to Column Definitions, but applies configurations to all columns.

- __Grid Options:__ Configure functionality which extends across the entire grid.

- __Grid Events:__ Events raised by the grid, typically as a result of user interaction.

- __Value Formatters:__ Functions used for basic text formatting

- __Cell Renderers:__ Add your own components to cells

</framework-specific-section>

<framework-specific-section frameworks="vue">

<!-- Summary-->

Congratulations! You've completed the tutorial and built your first grid. By now, you should be familiar with the key concepts of AG Grid:

- __Row Data:__ Your data, in JSON format, that you want the grid to display.

- __Column Definitions:__ Define your columns and control column-specific functionality, like sorting and filtering.

- __Default Column Definitions:__ Similar to Column Definitions, but applies configurations to all columns.

- __Grid Options:__ Configure functionality which extends across the entire grid.

- __Grid Events:__ Events raised by the grid, typically as a result of user interaction.

- __Value Formatters:__ Functions used for basic text formatting

- __Cell Renderers:__ Add your own components to cells

</framework-specific-section>

## Next Steps

<framework-specific-section frameworks="javascript">

<!-- Next Steps-->

Browse our guides to dive into specific features of the grid:

- [Theming & Styling](/global-style-customisation/)
- [Testing](/testing/)
- [Security](/security/)

</framework-specific-section>

<framework-specific-section frameworks="react">

<!-- Next Steps-->

Browse our guides to dive into specific features of the grid:

- [Theming & Styling](/global-style-customisation/)
- [Testing](/testing/)
- [Security](/security/)
- [Using Hooks](/react-hooks/)

</framework-specific-section>

<framework-specific-section frameworks="angular">

<!-- Next Steps-->

Browse our guides to dive into specific features of the grid:

- [Theming & Styling](/global-style-customisation/)
- [Testing](/testing/)
- [Security](/security/)

</framework-specific-section>

<framework-specific-section frameworks="vue">

Browse our guides to dive into specific features of the grid:

- [Theming & Styling](/global-style-customisation/)
- [Testing](/testing/)
- [Security](/security/)

</framework-specific-section>