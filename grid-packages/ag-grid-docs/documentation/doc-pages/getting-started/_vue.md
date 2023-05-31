<framework-specific-section frameworks="vue">
| ### Quick Look Code Example
</framework-specific-section>

<framework-specific-section frameworks="vue">
<tabs>

<tabs-links>
<open-in-cta type="codesandbox" href="https://codesandbox.io/s/ag-grid-vue-3-example-bvwik?file=/src/main.js" />
</tabs-links>

<div tab-label="App.vue">
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="jsx" lineNumbers="true">
|&lt;template>
|  &lt;ag-grid-vue
|    style="width: 500px; height: 200px"
|    class="ag-theme-alpine"
|    :columnDefs="columnDefs"
|    :rowData="rowData"
|  >
|  &lt;/ag-grid-vue>
|&lt;/template>
|
|&lt;script>
|import "ag-grid-community/styles/ag-grid.css";
|import "ag-grid-community/styles/ag-theme-alpine.css";
|import { AgGridVue } from "ag-grid-vue3";
|
|export default {
|  name: "App",
|  components: {
|    AgGridVue,
|  },
|  setup() {
|    return {
|      columnDefs: [
|        { headerName: "Make", field: "make" },
|        { headerName: "Model", field: "model" },
|        { headerName: "Price", field: "price" },
|      ],
|      rowData: [
|        { make: "Toyota", model: "Celica", price: 35000 },
|        { make: "Ford", model: "Mondeo", price: 32000 },
|        { make: "Porsche", model: "Boxster", price: 72000 },
|      ],
|    };
|  },
|};
|&lt;/script>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
</div>
<div tab-label="main.js">
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="jsx" lineNumbers="true">
|import { createApp } from "vue";
|import App from "./App.vue";
|
|createApp(App).mount("#app");
</framework-specific-section>

<framework-specific-section frameworks="vue">
</div>

</tabs>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| ## Getting Started with Community Video
</framework-specific-section>

<framework-specific-section frameworks="vue">
 <video-section id="V14w_NFuZB4" title="Video Tutorial for Getting Started with AG Grid Community">
 <p>
     In this video we detail the steps to get an application working with Vue and AG Grid Community. We show how to set up Rows and Columns, set some Grid Properties, use the Grid's API and listen to Grid events.
 </p>
 </video-section>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| ## Getting Started with Enterprise Video
</framework-specific-section>

<framework-specific-section frameworks="vue">
 <video-section id="9WnYqSxTuE8" title="Getting Started with AG Grid Enterprise">
 <p>
     The video then follows showing how to get started with <a href="../licensing/">AG Grid Enterprise</a>. Please take a look at Enterprise, you don't need a license to trial AG Grid Enterprise, you only need to get in touch if you decide to use it in your project.
 </p>
 </video-section>
</framework-specific-section>

<framework-specific-section frameworks="vue">
|## Vue 2 vs Vue 3
| There are two versions of Vue support, one for Vue 2 and one for Vue 3. The only difference
| in use is how you import the dependency:
|
</framework-specific-section>

<framework-specific-section frameworks="vue">
<div class="font-size-responsive">
    <table>
        <thead>
        <tr>
            <th>Version</th>
            <th>Package Import</th>
            <th>Module Import</th>
        </tr>
        </thead>
        <tbody>
        <tr>
            <td>Vue 2</td>
            <td>ag-grid-vue</td>
            <td>@ag-grid-community/vue</td>
        </tr>
        <tr>
            <td>Vue 3</td>
            <td>ag-grid-vue3</td>
            <td>@ag-grid-community/vue3</td>
        </tr>
        </tbody>
    </table>
</div>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| If you are unsure between Package Import and Module Import, you should use the Package Import
| (i.e. `ag-grid-vue`/ `ag-grid-vue3`). For more information on import types please refer to the 
| documentation [here.](../modules/)
|
| This tutorial covers the use of Vue 3 with AG Grid - for the Vue 2 version of this tutorial please see the documentation [here.](/vue2/)
|
| ## Getting Started with AG Grid Community
|
| Below we provide code for a simple AG Grid Vue application. To get this working locally,
| create a new Vue application as follows (when prompted select Vue 3):
|
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="bash">
| npx -p @vue/cli vue create this-place
| cd this-place
| npm install --save ag-grid-community
| npm install --save ag-grid-vue3
| npm run serve
</snippet>
</framework-specific-section> 

<framework-specific-section frameworks="vue">
| If everything went well `npm run serve` started the web server and conveniently opened a browser
| pointing to [localhost:8080](http://localhost:8080) (if the browser wasn't automatically launched simply navigate to [localhost:8080](http://localhost:8080)
| in your browser of choice.
|
| ### Grid Dependencies
|
| Note the `package.json` has the following dependencies:
|
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
|"dependencies": {
|    "ag-grid-community": "@AG_GRID_VERSION@",
|    "ag-grid-vue3": "@AG_GRID_VERSION@",
|    ...
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| `ag-grid-community` is the core logic of the Grid, and `ag-grid-vue3` is the Vue Rendering Engine.
| Both are needed for the grid to work with Vue and their versions **must** match.
|
| ### Copy in Application Code
|
| Copy the content below into the file `src/App.vue`:
|
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="html">
|&lt;template>
|  &lt;button @click="deselectRows">deselect rows&lt;/button>
|  &lt;ag-grid-vue
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
|  &lt;/ag-grid-vue>
|&lt;/template>
|
|&lt;script>
|import { AgGridVue } from "ag-grid-vue3";  // the AG Grid Vue Component
|import { reactive, onMounted, ref } from "vue";
|
|import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
|import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS
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
|    // Example load data from server
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
|&lt;/script>
|
|&lt;style lang="scss">&lt;/style>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| If everything is correct, you should see a simple grid that looks like this:
</framework-specific-section>
<framework-specific-section frameworks="vue">
<image-caption src="step1.png" alt="AG Grid in its simplest form" maxWidth="80%" constrained="true" centered="true"></image-caption>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| We will now break this file down and explain the different parts...
|
| ### Grid CSS and Themes
|
| Two CSS files were loaded as follows:
|
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="jsx">
|import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
|import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| The first `ag-grid.css` is always needed. It's the core structural CSS needed by the grid. Without this, the Grid will not work.
|
| The second `ag-theme-alpine.css` is the chosen [Grid Theme](/themes/). This is then subsequently applied to the Grid by including the Theme's CSS Class in the Grid's element `class="ag-theme-alpine"`.
|
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="jsx">
| &lt;ag-grid-vue
|    class="ag-theme-alpine"
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| You can select from any of the [Grid Provided Themes](../themes/). If you don't like the provided themes you can [Customise the Provided Theme](/themes/) or do not use a Theme and style the grid yourself from scratch.
|
| The dimension of the Grid is also set on the grid's element `style="height: 500px"`.
|
| ### Setting Row Data
|
| The Grid is provided Row Data via the `rowData` Grid Property. This is wired up using `reactive`
| so that it can be updated to data loaded from the server.
|
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="jsx">
|  &lt;ag-grid-vue
|    :rowData="rowData.value"
|...
|
| const rowData = reactive({});
|
|...
|
| // Example load data from server
| onMounted(() => {
|   fetch("https://www.ag-grid.com/example-assets/row-data.json")
|     .then((result) => result.json())
|     .then((remoteRowData) => (rowData.value = remoteRowData));
| });
|
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| ### Setting Column Definitions
|
| Columns are defined by setting [Column definitions](../column-definitions/). Each Column Definition
| defines one Column. Properties can be set for all Columns using the Default Column Definition.
|
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="jsx">
|  &lt;ag-grid-vue
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
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| ### Accessing the Grid's API
|
| The grid's API is provided in the `onGridReady` event. Save a reference to it and then use it later.
|
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="jsx">
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
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| ### Consuming Grid Events
|
| Listen to [Grid Events](../grid-events/) by adding a callback to the appropriate `@[event-name]` property.
| This example demonstrates consuming the Cell Clicked event via the `@cell-clicked` property.
|
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="jsx">
|  &lt;ag-grid-vue
|    @cell-clicked="cellWasClicked"
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| ### Grid Properties
|
| Set other [Grid Options](/grid-options/) by adding parameters to `<ag-grid-vue/>` component.
| This example demonstrates setting `animateRows` and `rowSelection`.
|
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="jsx">
|  &lt;ag-grid-vue
|    rowSelection="multiple"
|    animateRows="true"
|    ...
|/>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="jsx">
| ## Getting Started with AG Grid Enterprise
|
| We would love for you to try out AG Grid Enterprise. There is no cost to trial.
| You only need to get in touch if you want to start using AG Grid Enterprise
| in a project intended for production.
|
| The following steps continues from above and installs AG Grid Enterprise.
|
| ### Install Dependency
|
| In addition to `ag-grid-community` and `ag-grid-vue3`, AG Grid Enterprise also needs
| `ag-grid-enterprise`.
|
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="bash">
| npm install --save ag-grid-enterprise
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| The `package.json` should now contain the following dependencies:
|
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="jsx">
|"dependencies": {
|    "ag-grid-community": "@AG_GRID_VERSION@",
|    "ag-grid-enterprise": "@AG_GRID_VERSION@",
|    "ag-grid-vue3": "@AG_GRID_VERSION@",
|    ...
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| `ag-grid-enterprise` contains the Enterprise features only, it does not contain the core grid,
| hence you still need `ag-grid-community` and `ag-grid-vue3`. Versions of all three **must** match.
|
| ### Import Enterprise
|
| Import AG Grid Enterprise intro your application as follows:
|
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="jsx">
|import 'ag-grid-enterprise';
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| And that is all, you use the same `&lt;ag-grid-vue/>` component, except this time it comes installed
| with all the Enterprise features.
|
| For example, you can now Row Group (an Enterprise Feature) by a particular Column by
| setting `rowGroup=true` on the Column Definition.
|
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="jsx">
|// Each Column Definition results in one Column.
| const columnDefs = reactive({
|   value: [
|        { field: "make", rowGroup: true }, 
|        { field: "model" }, 
|        { field: "price" }
|   ]});
|
</snippet>
</framework-specific-section>
