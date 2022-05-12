[[only-javascript]]
| AG Grid is the industry standard for JavaScript Enterprise Applications. Developers using
| AG Grid are building applications that would not be possible if AG Grid did not exist.
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
|     <script src="https://unpkg.com/ag-grid-community/dist/ag-grid-community.min.js"></script>
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
| <a class="btn btn-dark mb-2 mr-3" href="https://plnkr.co/edit/nmWxAxWONarW5gj2?p=preview?p=preview" target="_blank">
|     Open in <img src="resources/plunker_icon.svg" alt="Open in Plunker" style="width: 2.5rem" /> Plunker
| </a>
|
|</div>
|</div>
|</section>
|
| ## Getting Started
|
| <video-section id="KS-wg5zfCXc" title="Getting Started Video Tutorial">
|     In this article, we will walk you through the necessary steps to add AG Grid to an existing JavaScript
|     project, and configure some of the essential features of it. We will show you some of the fundamentals
|     of the grid (passing properties, using the API, etc).
| </video-section>
|
| ## The Project Setup
|
| During the last couple of years, we are witnessing a Cambrian Explosion of JavaScript project stacks.
| It seems like everyday there is a new, better way for JavaScript developers to build and distribute their apps.
| However,  for the purposes of this setup, we are going to stick to tried-and-true no-build, single HTML file setup
| which loads the AG Grid scripts from CDN (our favorite one is [unpkg](https://unpkg.com/)). Let's start from
| this clean html file:
|
| ```html
| <!DOCTYPE html>
| <html>
|   <head>
|   </head>
|   <body>
|     <h1>Hello from AG Grid!</h1>
|   </body>
| </html>
| ```
|
| [[note]]
| | You can either use your favorite programming text editor, or you can execute the steps in the
| | tutorial using [this Plunker as a starting point](https://plnkr.co/edit/nmWxAxWONarW5gj2?p=preview).
|
| ## Add AG Grid to Your Project
|
| We are going to load the necessary scripts and styles from the unpkg CDN. Add the following to the `head` element:
|
| ```html
| <!DOCTYPE html>
| <html>
|   <head>
|     <script src="https://unpkg.com/ag-grid-community/dist/ag-grid-community.min.noStyle.js"></script>
|     <link rel="stylesheet" href="https://unpkg.com/ag-grid-community/dist/styles/ag-grid.css">
|     <link rel="stylesheet" href="https://unpkg.com/ag-grid-community/dist/styles/ag-theme-alpine.css">
|   </head>
|   <body>
|     <h1>Hello from AG Grid!</h1>
|   </body>
| </html>
| ```
|
| The lines above import the `AgGrid` component, the grid "structure" stylesheet (`ag-grid.css`), and one
| of the available grid themes: (`ag-theme-alpine.css`). The grid ships several different themes; pick one
| that matches your project design.
|
| Now, let's instantiate a grid!
|
| ```html
| <!DOCTYPE html>
| <html>
| <head>
|   <script src="https://unpkg.com/ag-grid-community/dist/ag-grid-community.min.noStyle.js"></script>
|   <link rel="stylesheet" href="https://unpkg.com/ag-grid-community/dist/styles/ag-grid.css">
|   <link rel="stylesheet" href="https://unpkg.com/ag-grid-community/dist/styles/ag-theme-alpine.css">
| </head>
| <body>
|   <h1>Hello from AG Grid!</h1>
|
|   <div id="myGrid" class="ag-theme-alpine" style="height: 600px; width:500px;"></div>
|
|   <script type="text/javascript" charset="utf-8">
|     // specify the columns
|     const columnDefs = [
|       { field: "make" },
|       { field: "model" },
|       { field: "price" }
|     ];
|
|     // specify the data
|     const rowData = [
|       { make: "Toyota", model: "Celica", price: 35000 },
|       { make: "Ford", model: "Mondeo", price: 32000 },
|       { make: "Porsche", model: "Boxster", price: 72000 }
|     ];
|
|     // let the grid know which columns and what data to use
|     const gridOptions = {
|       columnDefs: columnDefs,
|       rowData: rowData
|     };
|
|   // lookup the container we want the Grid to use
|   const eGridDiv = document.querySelector('#myGrid');
|
|   // create the grid passing in the div to use together with the columns & data we want to use
|   new agGrid.Grid(eGridDiv, gridOptions);
|
|   </script>
| </body>
| </html>
| ```
|
| The variables above present two essential configuration properties of the grid -
| <a href="../column-definitions/" target="_blank">the column definitions</a>
| (`columnDefs`) and the data (`rowData`). In our case, the column definitions contain three columns; each
| column entry specifies the header label and the data field to be displayed in the body of the table.
|
| The actual data is defined in the `rowData` as an array of objects. Notice that the fields of the objects
| match the `field` values in the `columnDefs` configuration object.
|
| Finally, the `DIV` element is the DOM entry point of the grid. It sets the grid dimensions and specifies the
| grid's theme by setting the `class` to `ag-theme-alpine`. As you may have already noticed, the CSS class
| matches the name of CSS file we imported earlier.
|
| ![AG Grid in its simplest form](resources/step1.png)
|
| ## Enable Sorting And Filtering
|
| So far, so good. But wouldn't it be nice to be able to sort the data to help us see which car is the least/most
| expensive Well, enabling sorting in AG Grid is actually quite simple - all you need to do is add `sortable` to
| each column.
|
| ```js
| const columnDefs = [
|     { field: "make", sortable: true },
|     { field: "model", sortable: true },
|     { field: "price", sortable: true }
| ];
| ```
|
| After adding the property, you should be able to sort the grid by clicking on the column headers. Clicking on
| a header toggles through ascending, descending and no-sort.
|
| Our application doesn't have too many rows, so it's fairly easy to find data. But it's easy to imagine how
| a real-world application may have hundreds (or even hundreds of thousands!) of rows, with many columns. In a
| data set like this filtering is your friend.
|
| As with sorting, enabling filtering is as easy as adding the `filter` property:
|
| ```js
| const columnDefs = [
|     { field: "make", sortable: true, filter: true },
|     { field: "model", sortable: true, filter: true },
|     { field: "price", sortable: true, filter: true }
| ];
| ```
|
| With this property set, the grid will display a small column menu icon when you hover the header. Pressing
| it will display a popup with a filtering UI which lets you choose the kind of filter and the text that you
| want to filter by.
|
| ![AG Grid sorting and filtering](resources/step2.png)
|
| ## Fetch Remote Data
|
| Displaying hard-coded data in JavaScript is not going to get us very far. In the real world, most of the
| time, we are dealing with data that resides on a remote server. Nowadays, implementing this is actually
| quite simple. Notice that the actual data fetching is performed outside of the grid component - we are
| using the HTML5 `fetch` API.
|
| [[note]]
| | If you have to support older browsers but you want to use fetch, you can add
| | [the appropriate polyfill](https://github.com/github/fetch).
|
| ```html
| <!DOCTYPE html>
| <html>
| <head>
|   <script src="https://unpkg.com/ag-grid-community/dist/ag-grid-community.min.noStyle.js"></script>
|   <link rel="stylesheet" href="https://unpkg.com/ag-grid-community/dist/styles/ag-grid.css">
|   <link rel="stylesheet" href="https://unpkg.com/ag-grid-community/dist/styles/ag-theme-alpine.css">
| </head>
| <body>
|   <h1>Hello from AG Grid!</h1>
|
|   <div id="myGrid" style="height: 600px;width:500px;" class="ag-theme-alpine"></div>
|
|   <script type="text/javascript" charset="utf-8">
|     // specify the columns
|     const columnDefs = [
|       { field: "make" },
|       { field: "model" },
|       { field: "price" }
|     ];
|
|     // let the grid know which columns to use
|     const gridOptions = {
|       columnDefs: columnDefs
|     };
|
|   // lookup the container we want the Grid to use
|   const eGridDiv = document.querySelector('#myGrid');
|
|   // create the grid passing in the div to use together with the columns & data we want to use
|   new agGrid.Grid(eGridDiv, gridOptions);
|
|   // fetch the row data to use and one ready provide it to the Grid via the Grid API
|   fetch('https://www.ag-grid.com/example-assets/small-row-data.json')
|       .then(response => response.json())
|       .then(data => {
|           gridOptions.api.setRowData(data);
|       });
|
|   </script>
| </body>
| </html>
| ```
|
| Here, we replaced the `rowData` assignment  with a data fetch from a remote service. The remote data is the
| same as the one we initially had, so you should not notice any actual changes to the grid.
|
| Notice that we also did something new - we accessed the [grid API](/grid-api/) instance through the
| `gridOptions.api`. The api object exposes a whole plethora of methods that allow us to implement complex scenarios
| with the grid.
|
| ## Enable Selection
|
| Being a programmer is a hectic job. Just when we thought that we are done with our assignment, the manager
| shows up with a fresh set of requirements!
| It turned out that we need to allow the user to select certain rows from the grid and to mark them as
| flagged in the system.
| We will leave the flag toggle state and persistence to the backend team. On our side, we should enable the
| selection and, afterwards, to obtain the selected records and pass them with an API call to a remote service endpoint.
|
| Fortunately, the above task is quite simple with AG Grid. As you may have already guessed, it is just a
| matter of adding and changing couple of properties:
|
| ```js
| // specify the columns
| const columnDefs = [
|   { field: "make", checkboxSelection: true },
|   { field: "model" },
|   { field: "price" }
| ];
|
| // let the grid know which columns and what data to use
| const gridOptions = {
|   columnDefs: columnDefs,
|   rowSelection: 'multiple'
| };
| ```
|
| Great! Now the first column contains a checkbox that, when clicked, selects the row. The only thing we have
| to add is a button that gets the selected data and sends it to the server. To do this, we need the following
| change:
|
| ```html
|<button onclick="getSelectedRows()">Get Selected Rows</button>
|<div id="myGrid" class="ag-theme-alpine" style="height: 600px; width:500px;"></div>
| ```
|
| ```js
| const getSelectedRows = () => {
|     const selectedNodes = gridOptions.api.getSelectedNodes()
|     const selectedData = selectedNodes.map( node => node.data )
|     const selectedDataStringPresentation = selectedData.map( node => `${node.make} ${node.model}`).join(', ')
|     alert(`Selected nodes: ${selectedDataStringPresentation}`);
| }
| ```
|
| Well, we cheated a bit. Calling `alert` is not exactly a call to our backend. Hopefully you will forgive us
| this shortcut for the sake of keeping the article short and simple. Of course, you can substitute that bit
| with a real-world application logic after you are done with the tutorial.
|
| What happened above? Several things:
|
| - We added a button with an event handler;
| - Inside the event handler, we accessed the grid API to get the currently selected grid row nodes;
| - Afterwards, we extracted the row nodes' underlying data items and converted them to a string suitable to be
| presented to the user in an alert box.
|
| ## Grouping (enterprise)
|
| [[note]]
| | Grouping is a feature exclusive to AG Grid Enterprise. You are free to trial AG Grid Enterprise to see what
| | you think - you only need to get in touch if you want to start using AG Grid Enterprise in a project intended
| | for production.
|
| In addition to filtering and sorting, [grouping](/grouping/) is another effective way for the user to make
| sense out of large amounts of data.
|
| Let's enable the enterprise features of ag-grid. Install the additional package:
|
| Now, let's use ag-grid-enterprise! Replace the ag-grid script reference in the `head` with this one:
|
| ```diff
| <head>
|     <title>Ag-Grid Basic Example</title>
| -   <script src="https://unpkg.com/ag-grid-community/dist/ag-grid-community.min.js"></script>
| +   <script src="https://unpkg.com/ag-grid-enterprise/dist/ag-grid-enterprise.min.noStyle.js"></script>
|     <script src="main.js"></script>
| </head>
| ```
|
| If everything is ok, you should see a message in the console that tells you there is no enterprise license key.
| You can ignore the message as we are simply trialing AG Grid Enterprise for the time being.
| In addition to that, the grid got a few UI improvements - a custom
| context menu and fancier column menu popup - feel free to look around:
|
| ![AG Grid final](resources/step3.png)
|
| Now let's enable grouping! Change the configuration to this:
|
| ```js
| const columnDefs = [
|     { field: "make", rowGroup: true },
|     { field: "price" }
| ];
|
| const autoGroupColumnDef = {
|     headerName: "Model",
|     field: "model",
|     cellRenderer:'agGroupCellRenderer',
|     cellRendererParams: {
|         checkbox: true
|     }
| }
|
| // let the grid know which columns and what data to use
| const gridOptions = {
|     columnDefs: columnDefs,
|     autoGroupColumnDef: autoGroupColumnDef,
|     groupSelectsChildren: true,
|     rowSelection: 'multiple'
| };
| ```
|
| There we go! The grid now groups the data by `make`, while listing the `model` field value when expanded.
| Notice that grouping works with checkboxes as well - the `groupSelectsChildren` property adds a group-level
| checkbox that selects/deselects all items in the group.
|
| [[note]]
| | Don't worry if this step feels a bit overwhelming - the  grouping feature is very powerful and supports
| | complex interaction scenarios which you might not need initially. The grouping documentation section
| | contains plenty of real-world runnable examples that can get you started for your particular  case.
|
| This is how the final code should look:
|
| ```html
| <!DOCTYPE html>
| <html>
| <head>
|   <script src="https://unpkg.com/ag-grid-enterprise/dist/ag-grid-enterprise.min.noStyle.js"></script>
|   <link rel="stylesheet" href="https://unpkg.com/ag-grid-community/dist/styles/ag-grid.css">
|   <link rel="stylesheet" href="https://unpkg.com/ag-grid-community/dist/styles/ag-theme-alpine.css">
| </head>
| <body>
|   <h1>Hello from AG Grid!</h1>
|   <button onclick="getSelectedRows()">Get Selected Rows</button>
|   <div id="myGrid" style="height: 600px;width:500px;" class="ag-theme-alpine"></div>
|
|   <script type="text/javascript" charset="utf-8">
|        // specify the columns
|        const columnDefs = [
|            { field: "make", rowGroup: true },
|            { field: "price" }
|        ];
|        
|        const autoGroupColumnDef = {
|            headerName: "Model",
|            field: "model",
|            cellRenderer:'agGroupCellRenderer',
|            cellRendererParams: {
|                checkbox: true
|            }
|        }
|        
|        // let the grid know which columns and what data to use
|        const gridOptions = {
|            columnDefs: columnDefs,
|            autoGroupColumnDef: autoGroupColumnDef,
|            groupSelectsChildren: true,
|            rowSelection: 'multiple'
|        };
|        
|        // lookup the container we want the Grid to use
|        const eGridDiv = document.querySelector('#myGrid');
|        
|        // create the grid passing in the div to use together with the columns & data we want to use
|        new agGrid.Grid(eGridDiv, gridOptions);
|        
|        fetch('https://www.ag-grid.com/example-assets/small-row-data.json')
|            .then(response => response.json())
|            .then(data => {
|               gridOptions.api.setRowData(data);
|            });
|        
|        const getSelectedRows = () => {
|            const selectedNodes = gridOptions.api.getSelectedNodes()
|            const selectedData = selectedNodes.map( node => node.data )
|            const selectedDataStringPresentation = selectedData.map( node => `${node.make} ${node.model}` ).join(', ')
|            alert('Selected nodes: ' + selectedDataStringPresentation);
|        }
|   </script>
| </body>
| </html>
| ```
|
| ## Summary
|
| With this Javascript datagrid tutorial, we managed to accomplish a lot. Starting from the humble beginnings
| of a three row / column setup, we now have a grid that supports sorting, filtering, binding to remote data,
| selection and even grouping! While doing so, we learned how to configure the grid and how how to use its api
| object to call methods.
|
| ## Next Steps
|
| The best thing you can check after the Javascript grid tutorial is the [features overview](/grid-features/).
| It provides an extensive review of what you can achieve with AG Grid. In addition, you can go through the
| following help articles to learn more about the features we enabled:
| <style>
|    .btn.btn-outline-primary:hover {
|        color: #fff;
|    }
| </style>
| <div>
|   <a class="btn btn-outline-primary" href="../row-sorting/" role="button">Row Sorting</a>
|   <a class="btn btn-outline-primary" href="../filtering/" role="button">Filtering</a>
|   <a class="btn btn-outline-primary" href="../grouping/" role="button">Grouping</a>
|   <a class="btn btn-outline-primary" href="../row-selection/" role="button">Selection</a>
| </div>
