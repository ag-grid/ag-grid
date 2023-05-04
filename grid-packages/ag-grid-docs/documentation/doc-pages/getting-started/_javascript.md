<framework-specific-section frameworks="javascript">
<section class="code-tab mb-3">
<div class="card">
<div class="card-header">Quick Look Code Example</div>
<div class="card-body">
<ul class="nav nav-tabs">
<li class="nav-item">
<a  class="nav-link active" id="component-tab" data-toggle="tab" href="#component" role="tab" aria-controls="component" aria-selected="true">

 main.js

</a>
</li>
<li class="nav-item">
<a class="nav-link" id="template-tab" data-toggle="tab" href="#template" role="tab" aria-controls="template" aria-selected="false">

index.html

</a>
</li>
</ul>
<div class="tab-content">
<div class="tab-pane show active" id="component" role="tabpanel" aria-labelledby="component-tab">
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
| const columnDefs = [
|   { field: "make" },
|   { field: "model" },
|   { field: "price" }
| ];
|
| // specify the data
| const rowData = [
|   { make: "Toyota", model: "Celica", price: 35000 },
|   { make: "Ford", model: "Mondeo", price: 32000 },
|   { make: "Porsche", model: "Boxster", price: 72000 }
| ];
|
| // let the grid know which columns and what data to use
| const gridOptions = {
|   columnDefs: columnDefs,
|   rowData: rowData
| };
|
| // setup the grid after the page has finished loading
| document.addEventListener('DOMContentLoaded', () => {
|     const gridDiv = document.querySelector('#myGrid');
|     new agGrid.Grid(gridDiv, gridOptions);
| });
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
</div>
<div class="tab-pane" id="template" role="tabpanel" aria-labelledby="template-tab">
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false} language="html">
| &lt;!DOCTYPE html>
| &lt;html lang="en">
| &lt;head>
|     &lt;title>Ag-Grid Basic Example&lt;/title>
|     &lt;script src="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.js">&lt;/script>
|     &lt;script src="main.js">&lt;/script>
| &lt;/head>
| &lt;body>
|     &lt;div id="myGrid" style="height: 200px; width:500px;" class="ag-theme-alpine">&lt;/div>
| &lt;/body>
| &lt;/html>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
</div>
</div>
</div>
<div class="text-right" style="margin-top: -1.5rem;">

 <a class="btn btn-dark mb-2 mr-3" href="https://plnkr.co/edit/nmWxAxWONarW5gj2?p=preview?p=preview" target="_blank">
     Open in <img src="../../images/resources/getting-started/plunker_icon.svg" alt="Open in Plunker" style="width: 2.5rem" /> Plunker
 </a>

</div>
</div>
</section>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
| ## Getting Started with Community Video
</framework-specific-section>

<framework-specific-section frameworks="javascript">
 <video-section id="j-Odsb0EjVo" title="Video Tutorial for Getting Started with AG Grid Community">
 <p>
     In this video we detail the steps to get an application working with AG Grid Community. We show how to set up Rows and Columns, set some Grid Properties, use the Grid's API and listen to Grid events.
 </p>
 </video-section>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
| ## Getting Started with Enterprise Video
</framework-specific-section>

<framework-specific-section frameworks="javascript">
 <video-section id="EIkxDliHFYw" title="Getting Started with AG Grid Enterprise">
 <p>
     The video then follows showing how to get started with <a href="../licensing/">AG Grid Enterprise</a>. Please take a look at Enterprise, you don't need a license to trial AG Grid Enterprise, you only need to get in touch if you decide to use it in your project.
 </p>
 </video-section>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
| ## Getting Started with AG Grid Community
|
| Below we provide code for a simple AG Grid application. To get this working locally,
| create a new application with one `index.html` page and have it served from a local web
| server. If you are not able to set up a web server, then you can start with a new
| JS project from [Plunker](https://plnkr.co/)
|
| ### Copy in Application Code
|
| Copy the content below into the file `index.html`:
|
</framework-specific-section>


<framework-specific-section frameworks="javascript">
<snippet transform={false} language="html">
|&lt;!DOCTYPE html>
|&lt;html lang="en">
|  &lt;head>
|    &lt;meta charset="UTF-8" />
|    &lt;meta http-equiv="X-UA-Compatible" content="IE=edge" />
|    &lt;meta
|      name="viewport"
|      content="width=device-width, initial-scale=1.0"
|    />
|    &lt;title>Ag Grid App&lt;/title>
|    &lt;!-- Include the JS for AG Grid -->
|    &lt;script src="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.noStyle.js">&lt;/script>
|    &lt;!-- Include the core CSS, this is needed by the grid -->
|    &lt;link rel="stylesheet"
|      href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-grid.css"/>
|    &lt;!-- Include the theme CSS, only need to import the theme you are going to use -->
|    &lt;link rel="stylesheet"
|      href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-theme-alpine.css"/>
|  &lt;/head>
|  &lt;body>
|    &lt;!-- Button to demonstrate calling the grid's API. -->
|    &lt;button onclick="deselect()">Deselect Rows&lt;/button>
|    &lt;!-- The div that will host the grid. ag-theme-alpine is the theme. -->
|    &lt;!-- The gid will be the size that this element is given. -->
|    &lt;div id="myGrid" class="ag-theme-alpine" style="height: 500px">&lt;/div>
|    &lt;script type="text/javascript">
|        // Function to demonstrate calling grid's API
|        function deselect(){
|            gridOptions.api.deselectAll()
|        }
|
|        // Grid Options are properties passed to the grid
|        const gridOptions = {
|
|          // each entry here represents one column
|          columnDefs: [
|            { field: "make" },
|            { field: "model" },
|            { field: "price" },
|          ],
|
|          // default col def properties get applied to all columns
|          defaultColDef: {sortable: true, filter: true},
|
|          rowSelection: 'multiple', // allow rows to be selected
|          animateRows: true, // have rows animate to new positions when sorted
|
|          // example event handler
|          onCellClicked: params => {
|            console.log('cell was clicked', params)
|          }
|        };
|
|        // get div to host the grid
|        const eGridDiv = document.getElementById("myGrid");
|        // new grid instance, passing in the hosting DIV and Grid Options
|        new agGrid.Grid(eGridDiv, gridOptions);
|
|        // Fetch data from server
|        fetch("https://www.ag-grid.com/example-assets/row-data.json")
|        .then(response => response.json())
|        .then(data => {
|          // load fetched data into grid
|          gridOptions.api.setRowData(data);
|        });
|    &lt;/script>
|  &lt;/body>
|&lt;/html>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
| If everything is correct, you should see a simple grid that looks like this:
|
| ![AG Grid in its simplest form](../../images/resources/getting-started/step1.png)
|
| We will now break this file down and explain the different parts...
|
| ### Importing JS & CSS, Setting Theme & Style
|
| You can import all JS and CSS with `ag-grid-community.min.js`, or you can be selective
| and import just the JS `ag-grid-community.min.noStyle.js` and selectively include the CSS,
| so you don't download themes you don't want to use.
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false} language="html">
|    &lt;!-- Include the JS for AG Grid -->
|    &lt;script src="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.noStyle.js">&lt;/script>
|    &lt;!-- Include the core CSS, this is needed by the grid -->
|    &lt;link rel="stylesheet"
|      href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-grid.css"/>
|    &lt;!-- Include the theme CSS, only need to import the theme you are going to use -->
|    &lt;link rel="stylesheet"
|      href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-theme-alpine.css"/>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
|OR
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false} language="html">
|    &lt;!-- Include the JS and CSS (all themes) for AG Grid. Larger download than needed -->
|    &lt;!-- as will includes themes you don't use -->
|    &lt;script src="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.js">&lt;/script>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
| You can select from any of the [Grid Provided Themes](/themes/). If you don't like the provided themes you can [Customise the Provided Theme](/themes/) or do not use a Theme and style the grid yourself from scratch.
|
| The dimension of the Grid is also set on the parent DIV via `style="height: 500px"`.
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false} language="html">
|&lt;div id="myGrid" class="ag-theme-alpine" style="height: 500px">&lt;/div>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
| ### Grid Options
|
| Options are provided to the grid using a Grid Options object.
|
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
| // Grid Options are properties passed to the grid
| const gridOptions = {
|
|   // each entry here represents one column
|   columnDefs: [
|     { field: "make" },
|     { field: "model" },
|     { field: "price" },
|   ],
|
|   // default col def properties get applied to all columns
|   defaultColDef: {sortable: true, filter: true},
|
|   rowSelection: 'multiple', // allow rows to be selected
|   animateRows: true, // have rows animate to new positions when sorted
|
|   // example event handler
|   onCellClicked: params => {
|     console.log('cell was clicked', params)
|   }
| };
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
| ### Creating New Grid Instance
| 
| The grid instance is created using `new agGrid.Grid()` passing in the DOM
| element to host the grid and the Grid Options.
|
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
| // get div to host the grid
| const eGridDiv = document.getElementById("myGrid");
| // new grid instance, passing in the hosting DIV and Grid Options
| new agGrid.Grid(eGridDiv, gridOptions);
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
| ### Setting Row Data
|
| Data is loaded from the server and set using the grid API `setRowData()`.
|
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
| // Fetch data from server
| fetch("https://www.ag-grid.com/example-assets/row-data.json")
|   .then(response => response.json())
|   .then(data => {
|      // load fetched data into grid
|      gridOptions.api.setRowData(data);
|   });
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
| ### Accessing Grid's API
| 
| Once created, the grid places an API object on the Grid Options.
| This can then be accessed to use the grid's API.
|
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
| // Function to demonstrate calling grid's API
| function deselect(){
|     gridOptions.api.deselectAll()
| }
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
| ### Consuming Grid Events
|
| Listen to [Grid Events](../grid-events/) by adding a callback to the appropriate `on[eventName]` onto
| the Grid Options. This example demonstrates consuming the `cellClicked` event.
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
| const gridOptions = {
|   onCellClicked: params => { // example event handler
|     console.log('cell was clicked', params)
|   }
|   ....
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
| ## Getting Started with AG Grid Enterprise
|
| We would love for you to try out AG Grid Enterprise. There is no cost to trial.
| You only need to get in touch if you want to start using AG Grid Enterprise
| in a project intended for production.
|
| To use AG Grid Enterprise instead of AG Grid Community, use the imports
| `ag-grid-enterprise.min.noStyle.js` and `ag-grid-enterprise.min.js`
| instead of `ag-grid-community.min.noStyle.js` and `ag-grid-community.min.js`.
|
| For example if you were using `ag-grid-community.min.js` then make the follow change to enable all the Enterprise features.
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false} language="diff">
|- &lt;script src="https://cdn.jsdelivr.net/npm/ag-grid-community@@AG_GRID_VERSION@/dist/ag-grid-community.min.js">&lt;/script>
|+ &lt;script src="https://cdn.jsdelivr.net/npm/ag-grid-enterprise@@AG_GRID_VERSION@/dist/ag-grid-enterprise.min.js">&lt;/script>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
| And that is all, you create the grid the same way, except this time it comes installed
| with all the Enterprise features.
|
| For example, you can now Row Group (an Enterprise Feature) by a particular Column by
| setting `rowGroup=true` on the Column Definition.
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
| const gridOptions = {
|   columnDefs: [
|     { field: "make", rowGroup: true },
|     { field: "model" },
|     { field: "price" },
|   ],
|   ...
</snippet>
</framework-specific-section>