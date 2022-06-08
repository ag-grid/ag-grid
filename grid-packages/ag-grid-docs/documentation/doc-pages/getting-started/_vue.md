[[only-vue]]
|
|<section class="code-tab mb-3">
|<div class="card">
|<div class="card-header">Quick Look Code Example</div>
|<div class="card-body">
|<ul class="nav nav-tabs">
|<li class="nav-item">
|<a  class="nav-link active" id="component-tab" data-toggle="tab" href="#component" role="tab" aria-controls="component" aria-selected="true">
|
|App.vue
|
|</a>
|</li>
|<li class="nav-item">
|<a class="nav-link" id="template-tab" data-toggle="tab" href="#template" role="tab" aria-controls="template" aria-selected="false">
|
|main.js
|
|</a>
|</li>
|</ul>
|<div class="tab-content">
|<div class="tab-pane show active" id="component" role="tabpanel" aria-labelledby="component-tab">
|
|```jsx
|<template>
|   <ag-grid-vue
|     style="width: 500px; height: 200px"
|     class="ag-theme-alpine"
|     :columnDefs="columnDefs"
|     :rowData="rowData"
|   >
|   </ag-grid-vue>
|</template>
|
|<script>
|import "ag-grid-community/dist/styles/ag-grid.css";
|import "ag-grid-community/dist/styles/ag-theme-alpine.css";
|import { AgGridVue } from "ag-grid-vue3";
|
|export default {
|   name: "App",
|   components: {
|     AgGridVue,
|   },
|   setup() {
|     return {
|       columnDefs: [
|         { headerName: "Make", field: "make" },
|         { headerName: "Model", field: "model" },
|         { headerName: "Price", field: "price" },
|       ],
|       rowData: [
|         { make: "Toyota", model: "Celica", price: 35000 },
|         { make: "Ford", model: "Mondeo", price: 32000 },
|         { make: "Porsche", model: "Boxster", price: 72000 },
|       ],
|     };
|   },
|};
|</script>
|```
|
|</div>
|<div class="tab-pane" id="template" role="tabpanel" aria-labelledby="template-tab">
|
|[[only-vue]]
|```jsx
|import { createApp } from "vue";
|import App from "./App.vue";
|
|createApp(App).mount("#app");
|```
|
|</div>
|</div>
|</div>
|    <div class="text-right" style="margin-top: -1.5rem;">
|        <a class="btn btn-dark mb-2 mr-3" href="https://codesandbox.io/s/ag-grid-vue-3-example-bvwik?file=/src/App.vue" target="_blank">Open in CodeSandbox</a>
|    </div>
|</div>
|</section>
|
| ## Getting Started with Community Video
|
| <video-section id="V14w_NFuZB4" title="Video Tutorial for Getting Started with AG Grid Community">
| <p>
|     In this video we detail the steps to get an application working with Vue and AG Grid Community. We show how to set up Rows and Columns, set some Grid Properties, use the Grid's API and listen to Grid events.
| </p>
| </video-section>
| <br/>
| <br/>
|
| ## Getting Started with Enterprise Video
|
| <video-section id="9WnYqSxTuE8" title="Getting Started with AG Grid Enterprise">
| <p>
|     The video then follows showing how to get started with <a href="../licensing/">AG Grid Enterprise</a>. Please take a look at Enterprise, you don't need a license to trial AG Grid Enterprise, you only need to get in touch if you decide to use it in your project.
| </p>
| <br/>
| </video-section>
| <br/>
| <br/>
|
|## Vue 2 vs Vue 3
| There are two versions of Vue support, one for Vue 2 and one for Vue 3. The only difference
| in use is how you import the dependency:
|
| | Version | Package Import          | Module Import          |
| | ------- | ----------------------- | ----------------------- |
| | Vue 2   | ag-grid-vue             | @ag-grid-community/vue  |
| | Vue 3   | ag-grid-vue3            | @ag-grid-community/vue3 |
|
| If you are unsure between Package Import and Module Import, you should use the Package Import
| (i.e. `ag-grid-vue`/ `ag-grid-vue3`). For more information on import types please refer to the 
| documentation [here.](/modules/)
|
| This tutorial covers the use of Vue 3 with AG Grid - for the Vue 2 version of this tutorial please see the documentaiton [here.](/vue2/)
|
| <br/>
|
| ## Getting Started with AG Grid Community
|
| Below we provide code for a simple AG Grid Vue application. To get this working locally,
| create a new Vue application as follows (when prompted select Vue 3):
|
| ```bash
| npx -p @vue/cli vue create this-place
| cd this-place
| npm install --save ag-grid-community
| npm install --save ag-grid-vue3
| npm run serve
| ```
|
| If everything went well `npm run serve` started the web server and conveniently opened a browser
| pointing to [localhost:8080](http://localhost:8080) (if the browser wasn't automatically launched simply navigate to [localhost:8080](http://localhost:8080)
| in your browser of choice.
|
| ### Grid Dependencies
|
| Note the `package.json` has the following dependencies:
|
| ```jsx
|"dependencies": {
|    "ag-grid-community": "@AG_GRID_VERSION@",
|    "ag-grid-vue3": "@AG_GRID_VERSION@",
|    ...
| ```
|
| `ag-grid-community` is the core logic of the Grid, and `ag-grid-vue3` is the Vue Rendering Engine.
| Both are needed for the grid to work with Vue and their versions <b>must</b> match.
|
| ### Copy in Application Code
|
| Copy the content below into the file `src/App.vue`:
|
|```html
|<template>
|  <button @click="deselectRows">deselect rows</button>
|  <ag-grid-vue
|    class="ag-theme-alpine"
|    style="height: 500px"
|    :columnDefs="columnDefs.value"
|    :rowData="rowData.value"
|    :defaultColDef="defaultColDef"
|    rowSelection="multiple"
|    animateRows="true"
|    @cell-clicked="cellWasClicked"
|    @grid-ready="onGridReady"
|  >
|  </ag-grid-vue>
|</template>
|
|<script>
|import { AgGridVue } from "ag-grid-vue3";  // the AG Grid Vue Component
|import { reactive, onMounted, ref } from "vue";
|
|import "ag-grid-community/dist/styles/ag-grid.css"; // Core grid CSS, always needed
|import "ag-grid-community/dist/styles/ag-theme-alpine.css"; // Optional theme CSS
|
|export default {
|  name: "App",
|  components: {
|    AgGridVue,
|  },
|  setup() {
|    const gridApi = ref(null); // Optional - for accessing Grid's API
|
|    // Obtain API from grid's onGridReady event
|    const onGridReady = (params) => {
|      gridApi.value = params.api;
|    };
|
|    const rowData = reactive({}); // Set rowData to Array of Objects, one Object per Row
|
|    // Each Column Definition results in one Column.
|    const columnDefs = reactive({
|      value: [
|           { field: "make" },
|           { field: "model" },
|           { field: "price" }
|      ],
|    });
|
|    // DefaultColDef sets props common to all Columns
|    const defaultColDef = {
|      sortable: true,
|      filter: true,
|      flex: 1
|    };
|
|    // Example load data from sever
|    onMounted(() => {
|      fetch("https://www.ag-grid.com/example-assets/row-data.json")
|        .then((result) => result.json())
|        .then((remoteRowData) => (rowData.value = remoteRowData));
|    });
|
|    return {
|      onGridReady,
|      columnDefs,
|      rowData,
|      defaultColDef,
|      cellWasClicked: (event) => { // Example of consuming Grid Event
|        console.log("cell was clicked", event);
|      },
|      deselectRows: () =>{
|        gridApi.value.deselectAll()
|      }
|    };
|  },
|};
|</script>
|
|<style lang="scss"></style>
|```
|
| If everything is correct, you should see a simple grid that looks like this:<br/><br/>
| ![AG Grid in its simplest form](resources/step1.png)
|
| We will now break this file down and explain the different parts...
|
| <br/>
|
| ### Grid CSS and Themes
|
| Two CSS files were loaded as follows:
|
| ```js
|import 'ag-grid-community/dist/styles/ag-grid.css'; // Core grid CSS, always needed
|import 'ag-grid-community/dist/styles/ag-theme-alpine.css'; // Optional theme CSS
| ```
|
| The first `ag-grid.css` is always needed. It's the core structural CSS needed by the grid. Without this, the Grid will not work.
|
| The second `ag-theme-alpine.css` is the chosen [Grid Theme](/themes/). This is then subsequently applied to the Grid by including the Theme's CSS Class in the Grid's element `class="ag-theme-alpine"`.
|
| ```js
| <ag-grid-vue
|    class="ag-theme-alpine"
| ```
|
| You can select from any of the [Grid Provided Themes](/themes-provided/). If you don't like the provided themes you can [Customise the Provided Theme](/themes-customising/) or do not use a Theme and style the grid yourself from scratch.
|
| The dimension of the Grid is also set on the grid's element `style="height: 500px"`.
|
| <br/>
|
| ### Setting Row Data
|
| The Grid is provided Row Data via the `rowData` Grid Property. This is wired up using `reactive`
| so that it can be updated to data loaded from the server.
|
| ```jsx
|  <ag-grid-vue
|    :rowData="rowData.value"
|...
|
| const rowData = reactive({});
|
|...
|
| // Example load data from sever
| onMounted(() => {
|   fetch("https://www.ag-grid.com/example-assets/row-data.json")
|     .then((result) => result.json())
|     .then((remoteRowData) => (rowData.value = remoteRowData));
| });
|
|```
|
| <br/>
|
| ### Setting Column Definitions
|
| Columns are defined by setting [Column definitions](/column-definitions/). Each Column Definition
| defines one Column. Properties can be set for all Columns using the Default Column Definition.
|
| ```jsx
|  <ag-grid-vue
|    :columnDefs="columnDefs.value"
|    :defaultColDef="defaultColDef"
|
| ...
|
| // Each Column Definition results in one Column.
| const columnDefs = reactive({
|   value: [{ field: "make" }, { field: "model" }, { field: "price" }],
| });
|
|
| // DefaultColDef sets props common to all Columns
| const defaultColDef = {
|   sortable: true,
|   filter: true,
|   flex: 1
| };
|
| ```
|
| <br/>
|
| ### Accessing the Grid's API
|
| The grid's API is provided in the ```onGridReady`` event. Save a reference to it and then use it later.
|
|```jsx
| const gridApi = ref(null); // Optional - for accessing Grid's API
| ...
|
| // Obtain API from grid's onGridReady event
| const onGridReady = (params) => {
|   gridApi.value = params.api;
| };
| ...
|
| // Example using Grid's API
| deselectRows: () =>{
|   gridApi.value.deselectAll()
| }
|
|```
|
| <br/>
|
| ### Consuming Grid Events
|
| Listen to [Grid Events](/grid-events/) by adding a callback to the appropriate `@[event-name]` property.
| This example demonstrates consuming the Cell Clicked event via the `@cell-clicked` property.
|
|```jsx
|  <ag-grid-vue
|    @cell-clicked="cellWasClicked"
|```
|
| <br/>
|
| ### Grid Properties
|
| Set other [Grid Options](/grid-options/) by adding parameters to `<ag-grid-vue/>` component.
| This example demonstrates setting `animateRows` and `rowSelection`.
|
|```jsx
|  <ag-grid-vue
|    rowSelection="multiple"
|    animateRows="true"
|    ...
|/>
|```
|
| <br/>
| <br/>
|
| ## Getting Started with AG Grid Enterprise
|
| We would love for you to try out AG Grid Enterprise. There is no cost to trial.
| You only need to get in touch if you want to start using AG Grid Enterprise
| in a project intended for production.
|
| The following steps continues from above and installs AG Grid Enterprise.
|
| <br/>
|
| ### Install Dependency
|
| In addition to `ag-grid-community` and `ag-grid-vue3`, AG Grid Enterprise also needs
| `ag-grid-enterprise`.
|
| ```bash
| npm install --save ag-grid-enterprise
| ```
|
| The `package.json` should now contain the following dependencies:
|
| ```jsx
|"dependencies": {
|    "ag-grid-community": "@AG_GRID_VERSION@",
|    "ag-grid-enterprise": "@AG_GRID_VERSION@",
|    "ag-grid-vue3": "@AG_GRID_VERSION@",
|    ...
| ```
|
| `ag-grid-enterprise` contains the Enterprise features only, it does not contain the core grid,
| hence you still need `ag-grid-community` and `ag-grid-vue3`. Versions of all three <b>must</b> match.
|
| <br/>
|
| ### Import Enterprise
|
| Import AG Grid Enterprise intro your application as follows:
|
|```jsx
|import 'ag-grid-enterprise';
|```
|
| And that is all, you use the same `<ag-grid-vue/>` component, except this time it comes installed
| with all the Enterprise features.
|
| For example, you can now Row Group (an Enterprise Feature) by a particular Column by
| setting `rowGroup=true` on the Column Definition.
|
|```jsx
|// Each Column Definition results in one Column.
| const columnDefs = reactive({
|   value: [
|        { field: "make", rowGroup: true }, 
|        { field: "model" }, 
|        { field: "price" }
|   ]});
|
|```
