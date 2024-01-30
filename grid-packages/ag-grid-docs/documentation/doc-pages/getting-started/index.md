--- 
title: "Quick Start" 
---

Welcome to the AG Grid documentation. After reading this page you will have an overview of the key concepts of AG Grid that you will use on a daily basis.

## Your First Grid

Add AG Grid to your application in these steps:

**1. NPM Install**

<framework-specific-section frameworks="react,angular,vue">
</framework-specific-section>

<framework-specific-section frameworks="react">

<!-- Install React -->

<snippet transform={false} language="bash">
npm install ag-grid-react
</snippet>

</framework-specific-section>

<framework-specific-section frameworks="angular">

<!-- Install Angular -->

First, install the `ag-grid-angular` library:

<snippet transform={false} language="bash">
npm install ag-grid-angular
</snippet>

</framework-specific-section>

<framework-specific-section frameworks="vue">

<!-- Install Vue3 -->

First, install the `ag-grid-vue3` library:

<snippet transform={false} language="bash">
npm install ag-grid-vue3
</snippet>

</framework-specific-section>

<framework-specific-section frameworks="javascript">

## Providing a Container

<!-- Create JavaScript -->

First, load the AG Grid library and create a blank container element which will be used to contain the grid:

<snippet transform={false} language="html">
|&lt;html lang="en">
|  &lt;head>
|    &lt;!-- Includes all JS & CSS for AG Grid -->
|    &lt;script src="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.js">&lt;/script>
|  &lt;/head>
|  &lt;body>
|    &lt;!-- Your grid container -->
|    &lt;div id="myGrid">&lt;/div>
|  &lt;/body>
|&lt;/html>
</snippet>

## Instantiating the Grid

Then, create the grid inside of your container by calling `createGrid` on the agGrid package.

<snippet transform={false} language="jsx">
|// Grid Options: Contains all of the grid configurations
|const gridOptions = {};
|
|// Your Javascript code to create the grid
|const myGridElement = document.querySelector('#myGrid');
|agGrid.createGrid(myGridElement, gridOptions);
</snippet>

In this snippet, the grid is created using the `agGrid.createGrid()` method. This method takes two parameters:
- **Container:** The DOM element that the grid will be placed into.
- **Grid Options:** An object containing all of the grid's configuration options.

## Row Data & Column Definitions

Next, provide the grid with some data to display and some column definitions to define how to display it.

In the `gridOptions` object, add the following properties:

<snippet transform={false} language="jsx">
|// Grid Options: Contains all of the grid configurations
|const gridOptions = {
|  // Row Data: The data to be displayed.
|  rowData: [
|    { make: "Tesla", model: "Model Y", price: 64950, electric: true },
|    { make: "Ford", model: "F-Series", price: 33850, electric: false },
|    { make: "Toyota", model: "Corolla", price: 29600, electric: false },
|  ],
|  // Column Definitions: Defines & controls grid columns.
|  columnDefs: [
|    { field: "make" },
|    { field: "model" },
|    { field: "price" },
|    { field: "electric" }
|  ]
|};
</snippet>

This is a basic example of Row Data & Column Definitions. The column definitions will access data via the provided `field` property, which maps directly to fields inside of the `rowData` objects.

## Styling the Grid

Finally, add the `ag-theme-quartz` CSS class to your grid container element to apply the grid's theme. You should also set the grid's dimensions using CSS.

<snippet transform={false} language="html">
|&lt;!-- Your grid container -->
|&lt;div id="myGrid" class="ag-theme-quartz" style="height: 500px">&lt;/div>
</snippet>

<note>
Other included themes can be found on the [Themes](../themes/) page.
</note>

</framework-specific-section>

<framework-specific-section frameworks="react">

<!-- Create React -->

**2. Import the Grid**

<snippet transform={false} language="jsx">
|import { AgGridReact } from 'ag-grid-react'; // AG Grid Component
|import "ag-grid-community/styles/ag-grid.css"; // Mandatory Grid CSS
|import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme
</snippet>

**3. Define Rows and Columns**

<snippet transform={false} language="jsx">
|const GridExample = () => {
|  // Row Data: The data to be displayed.
|  const [rowData, setRowData] = useState([
|    { make: "Tesla", model: "Model Y", price: 64950, electric: true },
|    { make: "Ford", model: "F-Series", price: 33850, electric: false },
|    { make: "Toyota", model: "Corolla", price: 29600, electric: false },
|  ]);
|  
|  // Column Definitions: Defines & controls grid columns.
|  const [colDefs, setColDefs] = useState([
|    { field: "make" },
|    { field: "model" },
|    { field: "price" },
|    { field: "electric" }
|  ]);
|
|  // ...
|
|}
</snippet>

**4. Grid Component**

The `AgGridReact` component is wrapped in a container div. Style is applied to the parent.
Rows and Columns are bound to the grid.

<snippet transform={false} language="jsx">
|return (
|  // wrapping container with theme & size
|  &lt;div className="ag-theme-quartz" // grid comes with multiple themes out of the box
|       style={{ height: 500 }} // the grid will fill the size of it's wrapping container
|  >
|    &lt;AgGridReact rowData={rowData} columnDefs={colDefs} /> // bind rows and columns
|  &lt;/div>
|)
</snippet>

</framework-specific-section>

<framework-specific-section frameworks="angular">

## Create a Component

Then, create a new component in your application with the required dependencies:

<snippet transform={false} language="jsx">
|import { Component } from '@angular/core';
|import { AgGridAngular } from 'ag-grid-angular';
|import { ColDef } from 'ag-grid-community'; // Column Definition Type Interface
|
|@Component({
|  selector: 'app-root',
|  standalone: true,
|  imports: [AgGridAngular], // Add AG Grid component
|  styleUrls: ['./app.component.css'],
|  template: ``
|})
|
|export class AppComponent {}
</snippet>

## Row Data & Column Definitions

Next, add the `rowData` and `colDefs` arrays to your component to define the data and how it should be displayed:

<snippet transform={false} language="jsx">
|export class AppComponent {
|  // Row Data: The data to be displayed.
|  rowData = [
|    { make: "Tesla", model: "Model Y", price: 64950, electric: true },
|    { make: "Ford", model: "F-Series", price: 33850, electric: false },
|    { make: "Toyota", model: "Corolla", price: 29600, electric: false },
|  ];
|
|  // Column Definitions: Defines & controls grid columns.
|  colDefs: ColDef[] = [
|    { field: "make" },
|    { field: "model" },
|    { field: "price" },
|    { field: "electric" }
|  ];
|}
</snippet>

This is a basic example of Row Data & Column Definitions. The column definitions will access data via the provided `field` property, which maps directly to fields inside of the `rowData` objects.

## Rendering the Grid

Then, add the `ag-grid-angular` component to the template with `rowData` and `colDefs` as props:

<snippet transform={false} language="jsx">
|template:
|`
|  &lt;!-- The AG Grid component -->
|  &lt;ag-grid-angular
|    [rowData]="rowData"
|    [columnDefs]="colDefs">
|  &lt;/ag-grid-angular>
|`
</snippet>

## Styling the Grid

Finally, configure the theme & dimensions for the grid. First, import the required dependencies into your `styles.css` file:

<snippet transform={false} language="css">
|/* Core Grid CSS */
|@import 'ag-grid-community/styles/ag-grid.css';
|/* Quartz Theme Specific CSS */
|@import 'ag-grid-community/styles/ag-theme-quartz.css';
</snippet>

Then add the `class` and `style` props to the `ag-grid-angular` component to define the theme and dimensions for the grid:

<snippet transform={false} language="jsx">
|&lt;ag-grid-angular
|  class="ag-theme-quartz"
|  style="height: 500px;"
|  ...
|>
|&lt;/ag-grid-angular>
</snippet>

<note>
Other included themes can be found on the [Themes](../themes/) page.
</note>

</framework-specific-section>

<framework-specific-section frameworks="vue">

## Create a Component

Then, create a new component in your application with the required dependencies:

<snippet transform={false} language="html">
|&lt;template>&lt;/template>
|
|&lt;script>
|import { ref } from 'vue';
|import "ag-grid-community/styles/ag-grid.css"; // Core CSS
|import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme
|import { AgGridVue } from "ag-grid-vue3"; // Vue Grid Logic
|
|export default {
|  name: "App",
|  components: {
|    AgGridVue, // Add AG Grid Vue3 component
|  },
|  setup() {},
|};
|&lt;/script>
</snippet>

## Row Data & Column Definitions

Next, add the `rowData` and `colDefs` arrays to your component to define the data and how it should be displayed:

<snippet transform={false} language="js">
|setup() {
|  // Row Data: The data to be displayed.
|  const rowData = ref([
|    { make: "Tesla", model: "Model Y", price: 64950, electric: true },
|    { make: "Ford", model: "F-Series", price: 33850, electric: false },
|    { make: "Toyota", model: "Corolla", price: 29600, electric: false },
|  ]);
|
|  // Column Definitions: Defines & controls grid columns.
|  const colDefs = ref([
|    { field: "make" },
|    { field: "model" },
|    { field: "price" },
|    { field: "electric" }
|  ]);
|
|  return {
|    rowData,
|    colDefs,
|  };
|},
</snippet>

This is a basic example of Row Data & Column Definitions. The column definitions will access data via the provided `field` property, which maps directly to fields inside of the `rowData` objects.

## Rendering the Grid

Then, add the `ag-grid-vue` component to the component template with `rowData` and `colDefs` as props:

<snippet transform={false} language="html">
|&lt;template>
|  &lt;!-- The AG Grid component -->
|  &lt;ag-grid-vue
|    :rowData="rowData"
|    :columnDefs="colDefs"
|  >
|  &lt;/ag-grid-vue>
|&lt;/template>
</snippet>

## Styling the Grid

Finally, configure the theme & dimensions for the grid by adding the class and style props to the `ag-grid-vue` component to define the theme and dimensions for the grid:

<snippet transform={false} language="html">
|&lt;template>
|  &lt;!-- The AG Grid component -->
|  &lt;ag-grid-vue
|    style="height: 500px"
|    class="ag-theme-quartz"
|    // ...
|  >
|  &lt;/ag-grid-vue>
|&lt;/template>
</snippet>

<note>
Other included themes can be found on the [Themes](../themes/) page.
</note>

</framework-specific-section>

When you run the application, you should see a basic grid with three rows. To see the full code, click the `</> Code` button below the example.

<grid-example title='Quick Start Example' name='quick-start-example' type='mixed' options='{ "exampleHeight": 350 }'></grid-example>

<note>To live-edit the code, open the example in CodeSandbox or Plunkr using the buttons to the lower-right.</note>

<framework-specific-section frameworks="react">

Now that you have a basic grid running, the remained of this page explores some of the key concepts. 
## Showing Data

This section gives an overview of getting data into your grid, formatting the data and inserting custom components.

### Mapping Values

The `field` or `valueGetter` attributes map data to columns. A field maps to a field in the data. A [Value Getter](../value-getters/) is a function callback that returns the cell value.

The `headerName` provides the title for the header. If missing the title is derived from `field`.

<snippet transform={false} language="jsx">
| const [colDefs, setColDefs] = useState([
|    { headerName: "Make & Model", valueGetter: p => p.make + ' ' + p.model},
|    { field: "price" },
|  ]);
</snippet>

### Formatting

Format cell content using a [Value Formatter](../value-formatters/):

<snippet transform={false} language="jsx">
| const [colDefs, setColDefs] = useState([
|    { field: "price", valueFormatter: p => '£' + formatNumber(p.value) },
|    // ...
|  ]);
</snippet>

### Cell Components

Add buttons, checkboxes or images to cells with a [Cell Renderer](../cell-rendering/):

<snippet transform={false} language="jsx">
| const CustomButtonComponent = (props) => {
|    return &lt;button onClick={() => window.alert('clicked') }>Push Me!&lt;/button>;
|  };
|
| const [colDefs, setColDefs] = useState([
|    { field: "button", cellRenderer: CustomButtonComponent },
|    // ...
|  ]);
</snippet>

### Resizing Coumns

Columns are resized by dragging the Column Header edges. Additionaly assign `flex` values to 
allow columns to flex to the grid width.

<snippet transform={false} language="jsx">
| const [colDefs, setColDefs] = useState([
|    { field: "make", flex: 2 }, //This column will be twice as wide as the others
|    { field: "model", flex: 1 },
|    { field: "price", flex: 1 },
|    { field: "electric", flex: 1 }
|  ]);
</snippet>

## Working with Data

This section gives an overview of filtering, editing and sorting data in the grid.

### Filtering

[Column Filters](../filtering/) are embedded into each column menu. These are configured using the `filter` attribute.

<snippet transform={false} language="jsx">
| const [colDefs, setColDefs] = useState([
|    { field: "make", filter: 'agTextColumnFilter' }, // use the text filter
|    { field: "price", filter: 'agNumberColumnFilter' }, // use the number filter
|    // ...
|  ]);
</snippet>

There are 5 [Provided Filters](../filtering/) which can be set through this attribute.
You can also create your own [Custom Filter](../filter-custom/).

[Floating Filters](../floating-filters/) embed the Column Filter into the header for ease of access.

<snippet transform={false} language="jsx">
| const [colDefs, setColDefs] = useState([
|    { field: "make", filter: 'agTextColumnFilter', floatingFilter: true },
|    // ...
|  ]);
</snippet>

### Editing

Enable editing by setting the `editable` attribute to `true`. This uses the default [Cell Editor](../cell-editing/) for the cell data type:

<snippet transform={false} language="jsx">
| const [colDefs, setColDefs] = useState([
|    { field: "make", editable: true },
|    // ...
|  ]);
</snippet>

Set the cell editor type using the `cellEditor` attribute. There are 7 [Provided Cell Editors](../provided-cell-editors/) which can be set through this attribute.
You can also create your own [Custom Editors](../component-cell-editor/).

<snippet transform={false} language="jsx">
| const [colDefs, setColDefs] = useState([
|    {
|        cellEditor: 'agSelectCellEditor',
|        cellEditorParams: {
|            values: ['Tesla', 'Ford', 'Toyota'],
|        },
|    },
|    // ...
|  ]);
</snippet>

### Sorting

[Row Sorting](../row-sorting/) is enabled by default. Configure custom sorting using the `comparator` attribute:

<snippet transform={false} language="jsx">
| //Sorts months into date order
| const monthComparator = (valueA, valueB) => {
|    const months = [
|      'January', 'February', 'March', 'April',
|      'May', 'June', 'July', 'August',
|      'September', 'October', 'November', 'December',
|    ];
|    const idxA = months.indexOf(valueA);
|    const idxB = months.indexOf(valueB);
|    return idxA - idxB;
|  };
|
| const [colDefs, setColDefs] = useState([
|   { field: "month", comparator: monthComparator },
|   // ...
|  ]);
</snippet>

## Themes & Style

This section gives an overview of changing the look and feel of the grid.

### Themes

Apply a [Theme](../themes/) as a class to the grid's container element to style the grid:

<snippet transform={false} language="jsx">
|return (
|  // Container
|  &lt;div id="myGrid" class="ag-theme-quartz">
|    {/* The AG Grid component */}
|    &lt;AgGridReact rowData={rowData} columnDefs={colDefs} />
|  &lt;/div>
|)
</snippet>

### Customising a Theme

Customise themes using CSS variables:

<snippet transform={false} language="jsx">
|.ag-theme-quartz {
|    --ag-foreground-color: rgb(126, 46, 132); // Changes the color of the grid text
|}
</snippet>

### Figma

If you are designing within Figma, you can use the [AG Grid Design System](../ag-grid-design-system/) to replicate Alpine and Alpine Dark AG Grid themes within Figma. These default themes can be extended with Figma variables to match any existing visual design or create entirely new AG Grid themes. These can then be exported and generated into new AG Grid themes.

### Cell Style

Define rules to apply styling to cells using `cellClassRules`:

<snippet transform={false} language="jsx">
|const [colDefs, setColDefs] = useState([
|    // ...
|    {
|        field: 'electric',
|        cellClassRules: {
|            // apply green to electric cars
|            'rag-green-outer': params => params.value === true,
|        }
|    }
|    // ...
|]);
</snippet>

### Row Style

Define rules to apply styling to rows using  and `rowClassRules`:

<snippet transform={false} language="jsx">
|const rowClassRules = {
|     // apply red to Ford cars
|     'rag-red-outer': params => params.data.electric === 'Ford',
| };
|
|&lt;AgGridReact rowClassRules={rowClassRules}  />
</snippet>

### Row Height

Change the [Row Height](../row-height/) to any positive number or set the row height based on cell content using `autoHeight`:

<snippet transform={false} language="jsx">
|const rowHeight = 50;
|
| const [colDefs, setColDefs] = useState([
|    // ...
|    // Without wrapText, autoHeight cell contents will display on one line
|    { field: "make", wrapText: true, autoHeight: true },
|    // ...
|  ]);
|
|&lt;AgGridReact rowHeight={rowHeight} columnDefs={colDefs} />
</snippet>

### Pagination

Enable [Pagination](../row-pagination/) by setting `pagination` to be true:

<snippet transform={false} language="jsx">
|&lt;AgGridReact pagination={true} />
</snippet>

<!-- To [Pin a Column](../column-pinning/), use the `pinned` attribute:

<snippet transform={false} language="jsx">
| const [colDefs, setColDefs] = useState([
|    // ...
|    { field: "make", pinned: "left" },
|    // ...
|  ]);
</snippet> -->

<!-- You can define [Pinned Rows](../row-pinning/) by setting either `pinnedTopRowData` or `pinnedBottomRowData` in the same way you set `rowData`:

<snippet transform={false} language="jsx">
|const pinnedTopRowData = useMemo(() => {
|    return [ { make: "Tesla", model: "Model Y", price: 64950, electric: true } ];
|  }, []);
|
|&lt;AgGridReact pinnedTopRowData={pinnedTopRowData} />
</snippet> -->

<!-- Define a [Column Group](../column-groups/) using the `children` property:

<snippet transform={false} language="jsx">
| const [colDefs, setColDefs] = useState([
|    {
|       headerName: "model",
|       children: [
|           { field: 'model' },
|           { field: 'price' },
|           { field: 'electric' },
|       ]
|   },
|    // ...
|  ]);
</snippet> -->

</framework-specific-section>

## Next Steps

- Read our [Introductory Tutorial](/deep-dive/).
- Watch our [Video Tutorials](/videos/).