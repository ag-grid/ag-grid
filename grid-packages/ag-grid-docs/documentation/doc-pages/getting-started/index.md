--- 
title: "Quick Start" 
---

Create a grid in 60 Seconds

At a minimum, three things are required to create a grid:

- **Container:** for the grids placement in your application.
- **Styles:** to define the grid's theme & dimensions.
- **Row Data & Column Definitions:** to define the data and how it should be displayed.

<framework-specific-section frameworks="react,angular,vue">

## Install

</framework-specific-section>

<framework-specific-section frameworks="react">

<!-- Install React -->

First, install the `ag-grid-react` library:

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
|    { mission: "Voyager", company: "NASA", location: "Cape Canaveral", date: "1977-09-05", rocket: "Titan-Centaur ", price: 86580000, successful: true },
|    { mission: "Apollo 13", company: "NASA", location: "Kennedy Space Center", date: "1970-04-11", rocket: "Saturn V", price: 3750000, successful: false },
|    { mission: "Falcon 9", company: "SpaceX", location: "Cape Canaveral", date: "2015-12-22", rocket: "Falcon 9", price: 9750000, successful: true }
|  ],
|  // Column Definitions: Defines & controls grid columns.
|  columnDefs: [
|    { field: "mission" },
|    { field: "company" },
|    { field: "location" },
|    { field: "date" },
|    { field: "price" },
|    { field: "successful" },
|    { field: "rocket" }
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

## Create a Component

Then, create a new component in your application with the required dependencies:

<snippet transform={false} language="jsx">
|import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
|import "ag-grid-community/styles/ag-grid.css"; // Core CSS
|import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme
|
|const GridExample = () => {
|  return (&lt;div>&lt;/div>);
|}
</snippet>

## Row Data & Column Definitions

Next, add the `rowData` and `colDefs` arrays to your component to define the data and how it should be displayed:

<snippet transform={false} language="jsx">
|const GridExample = () => {
|  // Row Data: The data to be displayed.
|  const [rowData, setRowData] = useState([
|    { mission: "Voyager", company: "NASA", location: "Cape Canaveral", date: "1977-09-05", rocket: "Titan-Centaur ", price: 86580000, successful: true },
|    { mission: "Apollo 13", company: "NASA", location: "Kennedy Space Center", date: "1970-04-11", rocket: "Saturn V", price: 3750000, successful: false },
|    { mission: "Falcon 9", company: "SpaceX", location: "Cape Canaveral", date: "2015-12-22", rocket: "Falcon 9", price: 9750000, successful: true }
|  ]);
|  
|  // Column Definitions: Defines & controls grid columns.
|  const [colDefs, setColDefs] = useState([
|    { field: "mission" },
|    { field: "company" },
|    { field: "location" },
|    { field: "date" },
|    { field: "price" },
|    { field: "successful" },
|    { field: "rocket" }
|  ]);
|
|  // ...
|
|}
</snippet>

This is a basic example of Row Data & Column Definitions. The column definitions will access data via the provided `field` property, which maps directly to fields inside of the `rowData` objects.

## Rendering the Grid

Then, return the `AgGridReact` component (wrapped in a container div) with `rowData` and `colDefs` as props:

<snippet transform={false} language="jsx">
|return (
|  // Container
|  &lt;div>
|    {/* The AG Grid component */}
|    &lt;AgGridReact rowData={rowData} columnDefs={colDefs} />
|  &lt;/div>
|)
</snippet>

## Styling the Grid

Finally, configure the theme & dimensions for the grid, which are controlled by the grid's container element.

In the container `<div>` add the `ag-theme-quartz` CSS class to apply the Quartz theme and specify a height:

<snippet transform={false} language="jsx">
|// Container with theme & dimensions
|&lt;div className="ag-theme-quartz" style={{ height: 500 }}>
|  {/* The AG Grid component */}
|  &lt;AgGridReact rowData={rowData} columnDefs={colDefs} />
|&lt;/div>
</snippet>

<note>
Other included themes can be found on the [Themes](../themes/) page.
</note>

</framework-specific-section>

<framework-specific-section frameworks="angular">

## Create a Component

Then, create a new component in your application with the required dependencies:

<snippet transform={false} language="jsx">
|import { Component } from '@angular/core';
|import { AgGridModule } from 'ag-grid-angular'; // Angular Grid Logic
|import { ColDef } from 'ag-grid-community'; // Column Definitions Interface
|
|@Component({
|  selector: 'app-root',
|  standalone: true,
|  imports: [AgGridModule], // Add AG Grid Module to component
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
|    { mission: "Voyager", company: "NASA", location: "Cape Canaveral", date: "1977-09-05", rocket: "Titan-Centaur ", price: 86580000, successful: true },
|    { mission: "Apollo 13", company: "NASA", location: "Kennedy Space Center", date: "1970-04-11", rocket: "Saturn V", price: 3750000, successful: false },
|    { mission: "Falcon 9", company: "SpaceX", location: "Cape Canaveral", date: "2015-12-22", rocket: "Falcon 9", price: 9750000, successful: true }
|  ];
|
|  // Column Definitions: Defines & controls grid columns.
|  colDefs: ColDef[] = [
|    { field: "mission" },
|    { field: "company" },
|    { field: "location" },
|    { field: "date" },
|    { field: "price" },
|    { field: "successful" },
|    { field: "rocket" }
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
|    { mission: "Voyager", company: "NASA", location: "Cape Canaveral", date: "1977-09-05", rocket: "Titan-Centaur ", price: 86580000, successful: true },
|    { mission: "Apollo 13", company: "NASA", location: "Kennedy Space Center", date: "1970-04-11", rocket: "Saturn V", price: 3750000, successful: false },
|    { mission: "Falcon 9", company: "SpaceX", location: "Cape Canaveral", date: "2015-12-22", rocket: "Falcon 9", price: 9750000, successful: true }
|    ]);
|
|  // Column Definitions: Defines & controls grid columns.
|  const colDefs = ref([
|    { field: "mission" },
|    { field: "company" },
|    { field: "location" },
|    { field: "date" },
|    { field: "price" },
|    { field: "successful" },
|    { field: "rocket" }
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

## Result

When you run your application, you should see a basic grid with three rows. To see the full code, click the `</> Code` button below the example.

<grid-example title='Quick Start Example' name='quick-start-example' type='mixed' options='{ "exampleHeight": 350 }'></grid-example>

<note>To live-edit the code, open the example in CodeSandbox or Plunkr using the buttons to the lower-right.</note>

## Next Steps

- Read our [Introductory Tutorial](/deep-dive/).
- Watch our <a href="https://www.youtube.com/watch?v=&list=PLsZlhayVgqNwHNHeqpCkSgdRV08xrKtzW" target="_blank">Video Tutorials</a>.