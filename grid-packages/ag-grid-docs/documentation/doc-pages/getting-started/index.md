--- 
title: "Quick Start" 
---

Create a Grid in 60 seconds.

<framework-specific-section frameworks="react,angular,vue">

## Install

</framework-specific-section>

<framework-specific-section frameworks="react">

<!-- Install-->

Create a new React project and install the `ag-grid-react` library:

<snippet transform={false} language="bash">
npm install ag-grid-react
</snippet>

</framework-specific-section>

<framework-specific-section frameworks="angular">

<!-- Install-->

Create a new Angular project and install the `ag-grid-angular` library:

<snippet transform={false} language="bash">
npm install ag-grid-angular
</snippet>

</framework-specific-section>

<framework-specific-section frameworks="vue">

<!-- Install-->

Create a new Vue3 project and install the `ag-grid-vue3` library:

<snippet transform={false} language="bash">
npm install ag-grid-vue3
</snippet>

</framework-specific-section>

## Create

<framework-specific-section frameworks="javascript">

<!-- Create-->

Create a new `index.html` file with the following code:

<snippet transform={false} language="html">
|&lt;!DOCTYPE html>
|&lt;html lang="en">
|  &lt;head>
|    &lt;title>Ag Grid Quick Start&lt;/title>
|    &lt;!-- Include all JS & CSS for AG Grid -->
|    &lt;script src="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.js">&lt;/script>
|    &lt;!-- Include Grid Configuration File -->
|    &lt;script src='index.js'></script>
|  &lt;/head>
|  &lt;body>
|    &lt;!-- Container Div: Holds the grid and defines its theme & dimensions. -->
|    &lt;div id="myGrid" class="ag-theme-quartz" style="height: 500px">&lt;/div>
|  &lt;/body>
|&lt;/html>
</snippet>

And a new `index.js` file, in the same directory, with the following code:

<snippet transform={false} language="jsx">
|// Grid API: Access to Grid API methods
|let gridApi;
|
|// Grid Options: Contains all of the grid configurations
|const gridOptions = {
|    // Row Data: The data to be displayed.
|    rowData: [        
|      {company: "CASC", country: "China", date: "2022-07-24", mission: "Wentian", price: 2150000, successful: true},
|      {company: "SpaceX", country: "USA", date: "2022-07-24", mission: "Starlink Group 4-25", price: 3230000, successful: true},
|      {company: "SpaceX", country: "USA", date: "2022-07-22", mission: "Starlink Group 3-2", price: 8060000, successful: true}
|    ],
|    // Column Definitions: Defines & controls grid columns.
|    columnDefs: [
|      { field: "mission" },
|      { field: "country" },
|      { field: "successful" },
|      { field: "date" },
|      { field: "price" },
|      { field: "company" }
|    ]
|}
|
|// Create Grid: Create new grid within the #myGrid div, using the Grid Options object
|gridApi = agGrid.createGrid(document.querySelector('#myGrid'), gridOptions);
</snippet>

</framework-specific-section>

<framework-specific-section frameworks="react">

<!-- Create-->

Replace your `index.js` file with the following code:

<snippet transform={false} language="jsx">
|import React, { useState } from 'react';
|import { createRoot } from 'react-dom/client';
|import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
|import "ag-grid-community/styles/ag-grid.css"; // Core CSS
|import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme
|
|// Create new GridExample component
|const GridExample = () => {
|  // Row Data: The data to be displayed.
|  const [rowData, setRowData] = useState([
|    {company: "SpaceX", country: "USA", date: "2022-07-24", mission: "Starlink Group 4-25", price: 3230000, successful: true},
|    {company: "CASC", country: "China", date: "2022-07-24", mission: "Wentian", price: 2150000, successful: true},
|    {company: "SpaceX", country: "USA", date: "2022-07-22", mission: "Starlink Group 3-2", price: 8060000, successful: true}
|  ]);
|  
|  // Column Definitions: Defines & controls grid columns.
|  const [colDefs] = useState([
|    { field: "mission" },
|    { field: "country" },
|    { field: "successful" },
|    { field: "date" },
|    { field: "price" },
|    { field: "company" }
|  ]);
|
|  // Container: Defines the grid's theme & dimensions.
|  return (
|    &lt;div className="ag-theme-quartz" style={{ width: 600, height: 500 }}>
|      {/* The AG Grid component, with Row Data & Column Definition props */}
|      &lt;AgGridReact rowData={rowData} columnDefs={colDefs} />
|    &lt;/div>
|  );
|}
|
|// Render GridExample
|const root = createRoot(document.getElementById('root'));
|root.render(&lt;GridExample />);
</snippet>

</framework-specific-section>

<framework-specific-section frameworks="angular">

<!-- Create-->

Replace the `app.component.ts` file with the following code:

<snippet transform={false} language="jsx">
|import { Component } from '@angular/core';
|import { AgGridModule } from 'ag-grid-angular'; // Angular Grid Logic
|import { ColDef } from 'ag-grid-community'; // Column Definitions Interface
|
|// Row Data Interface
|interface IRow {
|  company: string;
|  country: 'USA' | 'China' | 'Kazakhstan';
|  date: string;
|  mission: string;
|  price: number;
|  successful: boolean;
|}
|
|@Component({
|  selector: 'app-root',
|  standalone: true,
|  imports: [AgGridModule], // Add AG Grid Module to component
|  styleUrls: ['./app.component.css'],
|  template:
|  `
|   &lt;div class="content">
|     &lt;!-- The AG Grid component, with Dimensions, CSS Theme, Row Data, and Column Definition -->
|     &lt;ag-grid-angular
|       style="width: 600px; height: 500px;"
|       class="ag-theme-alpine"
|       [rowData]="rowData"
|       [columnDefs]="colDefs">
|     &lt;/ag-grid-angular>
|   &lt;/div>
|  `
|})
|
|export class AppComponent {
|  // Row Data: The data to be displayed.
|  rowData: IRow[] = [
|    {company: "CASC", country: "China", date: "2022-07-24", mission: "Wentian", price: 2150000, successful: true},
|    {company: "SpaceX", country: "USA", date: "2022-07-24", mission: "Starlink Group 4-25", price: 3230000, successful: true},
|    {company: "SpaceX", country: "USA", date: "2022-07-22", mission: "Starlink Group 3-2", price: 8060000, successful: true}
|  ];
|
|  // Column Definitions: Defines & controls grid columns.
|  colDefs: ColDef[] = [
|    { field: "mission" },
|    { field: "country" },
|    { field: "successful" },
|    { field: "date" },
|    { field: "price" },
|    { field: "company" }
|  ];
|}
</snippet>

Replace the `styles.css` file with the following code:

<snippet transform={false} language="css">
|/* Core Grid CSS */
|@import 'ag-grid-community/styles/ag-grid.css';
|/* Theme Specific CSS */
|@import 'ag-grid-community/styles/ag-theme-quartz.css';
</snippet>

</framework-specific-section>

<framework-specific-section frameworks="vue">

<!-- Create-->

Replace the `app.vue` file with the following code:

<snippet transform={false} language="html">
|&lt;template>
|  &lt;!-- The AG Grid component, with Dimensions, CSS Theme, Row Data, and Column Definition -->
|  &lt;ag-grid-vue
|    style="width: 500px; height: 500px"
|    class="ag-theme-quartz"
|    :rowData="rowData"
|    :columnDefs="colDefs"
|  >
|  &lt;/ag-grid-vue>
|&lt;/template>
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
|  setup() {
|    // Row Data: The data to be displayed.
|    const rowData = ref([
|      { company: "SpaceX", country: "USA", date: "2022-07-24", mission: "Starlink Group 4-25", price: 3230000, successful: true },
|      { company: "CASC", country: "China", date: "2022-07-24", mission: "Wentian", price: 2150000, successful: true },
|      { company: "SpaceX", country: "USA", date: "2022-07-22", mission: "Starlink Group 3-2", price: 8060000, successful: true }
|    ]);
|
|    // Column Definitions: Defines & controls grid columns.
|    const colDefs = ref([
|      { field: "mission" },
|      { field: "country" },
|      { field: "successful" },
|      { field: "date" },
|      { field: "price" },
|      { field: "company" }
|    ]);
|
|    return {
|      rowData,
|      colDefs,
|    };
|  },
|};
|&lt;/script>
</snippet>

</framework-specific-section>

## Run

When you run your application, you should see a basic grid with three rows:

<grid-example title='Quick Start Example' name='quick-start-example' type='mixed' options='{ "exampleHeight": 201 }'></grid-example>

_Note: To live-edit the code, open the example in CodeSandbox or Plunkr using the buttons in the lower-right_

## Next Steps

- Read our [Introductory Tutorial](/deep-dive/).
- Watch our <a href="https://www.youtube.com/watch?v=&list=PLsZlhayVgqNwHNHeqpCkSgdRV08xrKtzW" target="_blank">Video Tutorials</a>.
