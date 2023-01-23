[[only-javascript]]
|
|<section class="code-tab mb-3">
|<div class="card">
|<div class="card-header">Quick Look Code Example</div>
|<div class="card-body">
|<ul class="nav nav-tabs">
|<li class="nav-item">
|<a  class="nav-link active" id="component-tab" data-toggle="tab" href="#component" role="tab" aria-controls="component" aria-selected="true">
|
| main.js
|
|
|</a>
|</li>
|<li class="nav-item">
|<a class="nav-link" id="template-tab" data-toggle="tab" href="#template" role="tab" aria-controls="template" aria-selected="false">
|
|index.html
|
|</a>
|</li>
|</ul>
|<div class="tab-content">
|<div class="tab-pane show active" id="component" role="tabpanel" aria-labelledby="component-tab">
|
| ```js
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
| ```
|
|</div>
|<div class="tab-pane" id="template" role="tabpanel" aria-labelledby="template-tab">
|
| ```html
| <!DOCTYPE html>
| <html lang="en">
| <head>
|     <title>Ag-Grid Basic Example</title>
|     <script src="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.js"></script>
|     <script src="main.js"></script>
| </head>
| <body>
|     <div id="myGrid" style="height: 200px; width:500px;" class="ag-theme-alpine"></div>
| </body>
| </html>
| ```
|
|</div>
|</div>
|</div>
|<div class="text-right" style="margin-top: -1.5rem;">
|
| <a class="btn btn-dark mb-2 mr-3" href="https://plnkr.co/edit/nmWxAxWONarW5gj2?p=preview?p=preview" target="_blank">
|     Open in <img src="resources/plunker_icon.svg" alt="Open in Plunker" style="width: 2.5rem" /> Plunker
| </a>
|
|</div>
|</div>
|</section>
|
| ## Getting Started with Community Video
|
| <video-section id="j-Odsb0EjVo" title="Video Tutorial for Getting Started with AG Grid Community">
| <p>
|     In this video we detail the steps to get an application working with AG Grid Community. We show how to set up Rows and Columns, set some Grid Properties, use the Grid's API and listen to Grid events.
| </p>
| </video-section>
| <br/>
| <br/>
|
| ## Getting Started with Enterprise Video
|
| <video-section id="EIkxDliHFYw" title="Getting Started with AG Grid Enterprise">
| <p>
|     The video then follows showing how to get started with <a href="../licensing/">AG Grid Enterprise</a>. Please take a look at Enterprise, you don't need a license to trial AG Grid Enterprise, you only need to get in touch if you decide to use it in your project.
| </p>
| <br/>
| </video-section>
| <br/>
| <br/>
|
| ## Getting Started with AG Grid Community
|
| Below we provide code for a simple AG Grid application. To get this working locally,
| create a new application with one `index.html` page and have it served from a local web
| server. If you are not able to set up a web server, then you can start with a new
| JS project from <a href="https://plnkr.co/">Plunker</a>.
|
| <br/>
|
| ### Copy in Application Code
|
| Copy the content below into the file `index.html`:
|
|```html
|<!DOCTYPE html>
|<html lang="en">
|  <head>
|    <meta charset="UTF-8" />
|    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
|    <meta
|      name="viewport"
|      content="width=device-width, initial-scale=1.0"
|    />
|    <title>Ag Grid App</title>
|    <!-- Include the JS for AG Grid -->
|    <script src="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.noStyle.js"></script>
|    <!-- Include the core CSS, this is needed by the grid -->
|    <link rel="stylesheet"
|      href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-grid.css"/>
|    <!-- Include the theme CSS, only need to import the theme you are going to use -->
|    <link rel="stylesheet"
|      href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-theme-alpine.css"/>
|  </head>
|  <body>
|    <!-- Button to demonstrate calling the grid's API. -->
|    <button onclick="deselect()">Deselect Rows</button>
|    <!-- The div that will host the grid. ag-theme-alpine is the theme. -->
|    <!-- The gid will be the size that this element is given. -->
|    <div id="myGrid" class="ag-theme-alpine" style="height: 500px"></div>
|    <script type="text/javascript">
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
|    </script>
|  </body>
|</html>
|```
|
| If everything is correct, you should see a simple grid that looks like this:<br/><br/>
| ![AG Grid in its simplest form](resources/step1.png)
|
| We will now break this file down and explain the different parts...
|
| <br/>
|
| ### Importing JS & CSS, Setting Theme & Style
|
| You can import all JS and CSS with `ag-grid-community.min.js`, or you can be selective
| and import just the JS `ag-grid-community.min.noStyle.js` and selectively include the CSS,
| so you don't download themes you don't want to use.
|
|```html
|    <!-- Include the JS for AG Grid -->
|    <script src="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.noStyle.js"></script>
|    <!-- Include the core CSS, this is needed by the grid -->
|    <link rel="stylesheet"
|      href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-grid.css"/>
|    <!-- Include the theme CSS, only need to import the theme you are going to use -->
|    <link rel="stylesheet"
|      href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-theme-alpine.css"/>
|```
|
|OR
|
|```html
|    <!-- Include the JS and CSS (all themes) for AG Grid. Larger download than needed -->
|    <!-- as will includes themes you don't use -->
|    <script src="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.js"></script>
|```
|
| You can select from any of the [Grid Provided Themes](/themes/). If you don't like the provided themes you can [Customise the Provided Theme](/themes/) or do not use a Theme and style the grid yourself from scratch.
|
| The dimension of the Grid is also set on the parent DIV via `style="height: 500px"`.
|
| ```html
|<div id="myGrid" class="ag-theme-alpine" style="height: 500px"></div>
| ```
|
|
|
| <br/>
|
| ### Grid Options
|
| Options are provided to the grid using a Grid Options object.
|
| ```js
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
| ```
|
| <br/>
|
| ### Creating New Grid Instance
| 
| The grid instance is created using `new agGrid.Grid()` passing in the DOM
| element to host the grid and the Grid Options.
|
| ```js
| // get div to host the grid
| const eGridDiv = document.getElementById("myGrid");
| // new grid instance, passing in the hosting DIV and Grid Options
| new agGrid.Grid(eGridDiv, gridOptions);
|```
|
| <br/>
|
| ### Setting Row Data
|
| Data is loaded from the server and set using the grid API `setRowData()`.
|
| ```js
| // Fetch data from server
| fetch("https://www.ag-grid.com/example-assets/row-data.json")
|   .then(response => response.json())
|   .then(data => {
|      // load fetched data into grid
|      gridOptions.api.setRowData(data);
|   });
| ```
|
| <br/>
|
| ### Accessing Grid's API
| 
| Once created, the grid places an API object on the Grid Options.
| This can then be accessed to use the grid's API.
|
| ```js
| // Function to demonstrate calling grid's API
| function deselect(){
|     gridOptions.api.deselectAll()
| }
|```
|
| <br/>
|
| ### Consuming Grid Events
|
| Listen to [Grid Events](/grid-events/) by adding a callback to the appropriate `on[eventName]` onto
| the Grid Options. This example demonstrates consuming the `cellClicked` event.
|
|```jsx
| const gridOptions = {
|   onCellClicked: params => { // example event handler
|     console.log('cell was clicked', params)
|   }
|   ....
|```
|
| <br/>
|
|
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
|
|```diff
|- <script src="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.js"></script>
|+ <script src="https://cdn.jsdelivr.net/npm/ag-grid-enterprise/dist/ag-grid-enterprise.min.js"></script>
|```
|
| And that is all, you create the grid the same way, except this time it comes installed
| with all the Enterprise features.
|
| For example, you can now Row Group (an Enterprise Feature) by a particular Column by
| setting `rowGroup=true` on the Column Definition.
|
|```js
| const gridOptions = {
|   columnDefs: [
|     { field: "make", rowGroup: true },
|     { field: "model" },
|     { field: "price" },
|   ],
|   ...
|```
|
