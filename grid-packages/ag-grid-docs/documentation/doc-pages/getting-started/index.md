--- 
title: "Get Started with AG Grid" 
---
<style>
    .gatsby-resp-image-wrapper {
        margin-left: 0 !important;
        margin-right: 0 !important; 
        margin-bottom: 1rem; 
    }
    .gatsby-resp-image-image {  
        box-shadow: none !important;  
    }

</style> 

[//]: # (Javascript Section)
<framework-specific-section frameworks="javascript">
| ### Quick Look Code Example
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<tabs>

<div tabs-links="true">
<open-in-cta type="plunker" href="https://plnkr.co/edit/nmWxAxWONarW5gj2?p=preview?p=preview" />
</div>

<div tab-label="main.js">
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false} lineNumbers="true">
|const columnDefs = [
|  { field: "make" },
|  { field: "model" },
|  { field: "price" }
|];
|
|// specify the data
|const rowData = [
|  { make: "Toyota", model: "Celica", price: 35000 },
|  { make: "Ford", model: "Mondeo", price: 32000 },
|  { make: "Porsche", model: "Boxster", price: 72000 }
|];
|
|// let the grid know which columns and what data to use
|const gridOptions = {
|  columnDefs: columnDefs,
|  rowData: rowData
|};
|
|// setup the grid after the page has finished loading
|document.addEventListener('DOMContentLoaded', () => {
|  const gridDiv = document.querySelector('#myGrid');
|  new agGrid.Grid(gridDiv, gridOptions);
|});
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
</div>

<div tab-label="index.html">
</framework-specific-section>


<framework-specific-section frameworks="javascript">
<snippet language="html" transform={false} lineNumbers="true">
|&lt;!DOCTYPE html>
|&lt;html lang="en">
|&lt;head>
|    &lt;title>Ag-Grid Basic Example&lt;/title>
|    &lt;script src="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.js">&lt;/script>
|    &lt;script src="main.js">&lt;/script>
|&lt;/head>
|&lt;body>
|    &lt;div id="myGrid" style="height: 200px; width:500px;" class="ag-theme-alpine">&lt;/div>
|&lt;/body>
|&lt;/html>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
</div>

</tabs>
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

</framework-specific-section>

<framework-specific-section frameworks="javascript">
<image-caption src="step1.png" alt="AG Grid in its simplest form" maxWidth="80%" constrained="true" centered="true"></image-caption>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
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


[//]: # (Angular Section)
<framework-specific-section frameworks="angular">
| ### Quick Look Code Example
</framework-specific-section>

<framework-specific-section frameworks="angular">
<tabs>

 <div tabs-links="true">
 <open-in-cta type="codesandbox" href="https://codesandbox.io/p/sandbox/ag-grid-angular-example-zly6rt?file=%2Fsrc%2Fapp%2Fapp.component.ts%3A1%2C1-2%2C1" />
 </div>

<div tab-label="app.component.ts">
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="ts" lineNumbers="true">
|import { Component } from '@angular/core';
|import { ColDef } from 'ag-grid-community';
|
|@Component({
|    selector: 'app-root',
|    templateUrl: './app.component.html',
|    styleUrls: [ './app.component.scss' ]
|})
|export class AppComponent  {
|
|    columnDefs: ColDef[] = [
|        { field: 'make' },
|        { field: 'model' },
|        { field: 'price' }
|    ];
|
|    rowData = [
|        { make: 'Toyota', model: 'Celica', price: 35000 },
|        { make: 'Ford', model: 'Mondeo', price: 32000 },
|        { make: 'Porsche', model: 'Boxster', price: 72000 }
|    ];
|
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
</div>
<div tab-label="app.component.html">
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="html" lineNumbers="true">
|&lt;ag-grid-angular
|    style="width: 500px; height: 350px;"
|    class="ag-theme-alpine"
|    [rowData]="rowData"
|    [columnDefs]="columnDefs">
|&lt;/ag-grid-angular>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
</div>
<div tab-label="styles.scss">
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="scss" lineNumbers="true">
|@import 'ag-grid-community/styles/ag-grid.css';
|@import 'ag-grid-community/styles/ag-theme-alpine.css';
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
</div>
</tabs>
<note>
| Please refer to our [Compatibility Guide](/angular-compatibility/) for Supported Versions of
| Angular & AG Grid.
</note>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| ## Getting Started with Community Video
</framework-specific-section>

<framework-specific-section frameworks="angular">
<video-section id="_cRDVM6NlPk" title="Video Tutorial for Getting Started with AG Grid Community">
 <p>
     In this video we detail the steps to get an application working with Angular and AG Grid Community. We show how to set up Rows and Columns, set some Grid Properties, use the Grid's API and listen to Grid events.
 </p>
 </video-section> 
</framework-specific-section>

<framework-specific-section frameworks="angular">
| ## Getting Started with Enterprise Video
</framework-specific-section>

<framework-specific-section frameworks="angular">
<video-section id="xe6i3W6qW5k" title="Getting Started with AG Grid Enterprise">
 <p>
     The video then follows showing how to get started with <a href="../licensing/">AG Grid Enterprise</a>. Please take a look at Enterprise, you don't need a license to trial AG Grid Enterprise, you only need to get in touch if you decide to use it in your project.
 </p>
 <br/>
 </video-section>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| ## Getting Started with AG Grid Community
|
| Below we provide code for a simple AG Grid Angular application. To get this working locally,
| create a new Angular application as follows:
|
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="bash">
|ng new my-app --style scss --routing false
|cd my-app
|npm install --save ag-grid-community
|npm install --save ag-grid-angular
|npm run start
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
If everything goes well, `npm run start` has started the web server and conveniently opened a browser
pointing to <a href="http://localhost:4200">localhost:4200</a>
</framework-specific-section>
<framework-specific-section frameworks="angular">
|### Grid Dependencies
|
|Note the `package.json` has the following dependencies:
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
|"dependencies": {
|    "ag-grid-community": "@AG_GRID_VERSION@",
|    "ag-grid-angular": "@AG_GRID_VERSION@",
|    ...
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
|
| `ag-grid-community` is the core logic of the Grid, and `ag-grid-angular` is the Angular Rendering Engine.
| Both are needed for the grid to work with Angular and their versions **must** match.
|
| ### Copy in Application Code
|
| Copy the content below into the file `app.modules.ts`:
|
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
|import { NgModule } from '@angular/core';
|import { BrowserModule } from '@angular/platform-browser';
|import { HttpClientModule } from '@angular/common/http'
|import { AgGridModule } from 'ag-grid-angular';
|import { AppComponent } from './app.component';
|
|@NgModule({
|  declarations: [
|    AppComponent
|  ],
|  imports: [
|    BrowserModule,
|    HttpClientModule,
|    AgGridModule
|  ],
|  providers: [],
|  bootstrap: [AppComponent]
|})
|export class AppModule { }
|
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
|
| Copy the content below into the file `app.component.ts`:
|
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform="{false}">
|import { HttpClient } from '@angular/common/http';
|import { Component, ViewChild } from '@angular/core';
|import { AgGridAngular } from 'ag-grid-angular';
|import { CellClickedEvent, ColDef, GridReadyEvent } from 'ag-grid-community';
|import { Observable } from 'rxjs';
|
|@Component({
|  selector: 'app-root',
|  templateUrl: './app.component.html',
|  styleUrls: ['./app.component.scss']
|})
|export class AppComponent {
|
|  // Each Column Definition results in one Column.
|  public columnDefs: ColDef[] = [
|    { field: 'make'},
|    { field: 'model'},
|    { field: 'price' }
|  ];
|
|  // DefaultColDef sets props common to all Columns
|  public defaultColDef: ColDef = {
|    sortable: true,
|    filter: true,
|  };
|  
|  // Data that gets displayed in the grid
|  public rowData$!: Observable&lt;any[]>;
|
|  // For accessing the Grid's API
|  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
|
|  constructor(private http: HttpClient) {}
|
|  // Example load data from server
|  onGridReady(params: GridReadyEvent) {
|    this.rowData$ = this.http
|      .get&lt;any[]>('https://www.ag-grid.com/example-assets/row-data.json');
|  }
|
|  // Example of consuming Grid Event
|  onCellClicked( e: CellClickedEvent): void {
|    console.log('cellClicked', e);
|  }
|
|  // Example using Grid's API
|  clearSelection(): void {
|    this.agGrid.api.deselectAll();
|  }
|}
|
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
|
| Copy the content below into the file `app.component.html`:
|
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform="{false}">
|&lt;!-- Button to clear selection -->
|&lt;button (click)="clearSelection()">Clear Selection&lt;/button>
|&lt;!-- AG Grid Angular Component -->
|&lt;ag-grid-angular
|    style="width: 100%; height: 100%"
|    class="ag-theme-alpine"
|    [columnDefs]="columnDefs"
|    [defaultColDef]="defaultColDef"
|    [rowData]="rowData$ | async"
|    [rowSelection]="'multiple'"
|    [animateRows]="true"
|    (gridReady)="onGridReady($event)"
|    (cellClicked)="onCellClicked($event)"
|  >&lt;/ag-grid-angular>
</snippet> 
</framework-specific-section>


<framework-specific-section frameworks="angular">
| Copy the content below into the file `styles.scss`:
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="css">
|@import 'ag-grid-community/styles/ag-grid.css';
|@import 'ag-grid-community/styles/ag-theme-alpine.css';
|
|html, body {
|    height: 100%;
|    width: 100%;
|    padding: 5px;
|    box-sizing: border-box;
|    -webkit-overflow-scrolling: touch;
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
|
| If everything is correct, you should see a simple grid that looks like this:
|
</framework-specific-section>

<framework-specific-section frameworks="angular">
<image-caption src="step1.png" alt="AG Grid in its simplest form" maxWidth="80%" constrained="true" centered="true"></image-caption>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| We will now break this file down and explain the different parts...
|
| ### Grid Module
|
| The AG Grid Module was included inside the app.
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="css">
| import { AgGridModule } from 'ag-grid-angular';
|
| ...
|
|  imports: [
|    BrowserModule,
|    HttpClientModule,
|    AgGridModule
|  ],
|
</snippet>
</framework-specific-section>


<framework-specific-section frameworks="angular">
| This allows access to the AG Grid component throughout the application.
|
| ### Grid CSS and Themes
|
| Two CSS files were loaded as follows:
|
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform="{false}" language="css">
|@import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
|@import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
|
| The first `ag-grid.css` is always needed. It's the core structural CSS needed by the grid. Without this, the Grid will not work.
|
| The second `ag-theme-alpine.css` is the chosen [Grid Theme](/themes/). This is then subsequently applied to the grid by applying the Theme's CSS Class to the grid element `class="ag-theme-alpine"`.
|
| You can select from any of the [Grid Provided Themes](/themes/). If you don't like the provided themes you can [Customise the Provided Theme](/themes/) or do not use a Theme and style the grid yourself from scratch.
|
| The dimension of the Grid is also set on the parent DIV via `style={{width: 500, height: 500}}`. The grid will fill 100% in both directions, so size it's parent element to the required dimensions.
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="html">
|&lt;ag-grid-angular
|    style="width: 100%; height: 100%"
|    class="ag-theme-alpine"/>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| ### Setting Row Data
|
| The Grid is provided Row Data via the `rowData` Grid Property. This is wired up using an `Observable`.
|
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform="{false}">
| // Data that gets displayed in the grid
| public rowData$!: Observable&lt;any[]>;
| ...
|
| // Example load data from server
| onGridReady(params: GridReadyEvent) {
|   this.rowData$ = this.http
|     .get&lt;any[]>('https://www.ag-grid.com/example-assets/row-data.json');
| }
|
| ...
|
|&lt;ag-grid-angular
|    [rowData]="rowData$ | async"
|    ...
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
|
| ### Setting Column Definitions
|
| Columns are defined by setting [Column definitions](../column-definitions/). Each Column Definition
| defines one Column. Properties can be set for all Columns using the Default Column Definition.
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
| // Each Column Definition results in one Column.
| public columnDefs: ColDef[] = [
|   { field: 'make'},
|   { field: 'model'},
|   { field: 'price' }
| ];
|
| // DefaultColDef sets props common to all Columns
| public defaultColDef: ColDef = {
|   sortable: true,
|   filter: true,
| };
|
|...
|
|&lt;ag-grid-angular
|    [columnDefs]="columnDefs"
|    [defaultColDef]="defaultColDef"
|    ...
|/>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| ### Accessing the Grid's API
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform="{false}">
| // For accessing the Grid's API
| @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
| ...
| // Example using Grid's API
| clearSelection(): void {
|   this.agGrid.api.deselectAll();
| }
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| ### Consuming Grid Events
|
| Listen to [Grid Events](/grid-events/) by adding a callback to the appropriate `(eventName)` output property.
| This example demonstrates consuming the `cellClicked` event.
|
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="html">
|&lt;ag-grid-angular
|    (cellClicked)="onCellClicked($event)"
|    ...
|/>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
|
| ### Grid Properties
|
| Set other [Grid Options](../grid-options/) by adding parameters to `&lt;ag-grid-angular/>` component.
| This example demonstrates setting `animateRows` and `rowSelection`.
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform="{false}">
|&lt;ag-grid-angular
|    [rowSelection]="'multiple'"
|    [animateRows]="true"
|    ...
|/>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
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
| In addition to `ag-grid-community` and `ag-grid-angular`, AG Grid Enterprise also needs
| `ag-grid-enterprise`.
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="bash">
| npm install --save ag-grid-enterprise
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| The `package.json` should now contain the following dependencies:
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
|"dependencies": {
|    "ag-grid-community": "@AG_GRID_VERSION@",
|    "ag-grid-enterprise": "@AG_GRID_VERSION@",
|    "ag-grid-angular": "@AG_GRID_VERSION@",
|    ...
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| `ag-grid-enterprise` contains the Enterprise features only, it does not contain the core grid,
| hence you still need `ag-grid-community` and `ag-grid-angular`. Versions of all three **must** match.
|
|### Import Enterprise
|
| Import AG Grid Enterprise intro your application as follows:
</framework-specific-section>
<framework-specific-section frameworks="angular">
<snippet transform={false}>
|import 'ag-grid-enterprise';
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| And that is all, you use the same `&lt;ag-grid-angular/>` component, except this time it comes installed
| with all the Enterprise features.
|
| For example, you can now Row Group (an Enterprise Feature) by a particular Column by
| setting `rowGroup=true` on the Column Definition.
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
| // Each Column Definition results in one Column.
| public columnDefs: ColDef[] = [
|   { field: 'make', rowGroup: true},
|   { field: 'model'},
|   { field: 'price' }
| ];
</snippet>
</framework-specific-section>

[//]: # (React Section)
<framework-specific-section frameworks="react">
| ### Quick Look Code Example
</framework-specific-section>

<framework-specific-section frameworks="react">
<tabs>

<div tabs-links="true">
<open-in-cta type="codesandbox" href="https://codesandbox.io/s/ag-grid-react-hello-world-9pnf3n?file=/src/App.js" />
</div>

<div tab-label="index.js">
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx" lineNumbers="true">
|import React, { useState } from 'react';
|import { createRoot } from 'react-dom/client';
|import { AgGridReact } from 'ag-grid-react';
|
|import 'ag-grid-community/styles/ag-grid.css';
|import 'ag-grid-community/styles/ag-theme-alpine.css';
|
|const App = () => {
|    const [rowData] = useState([
|        {make: "Toyota", model: "Celica", price: 35000},
|        {make: "Ford", model: "Mondeo", price: 32000},
|        {make: "Porsche", model: "Boxster", price: 72000}
|    ]);
|    
|    const [columnDefs] = useState([
|        { field: 'make' },
|        { field: 'model' },
|        { field: 'price' }
|    ]);
|
|    return (
|        &lt;div className="ag-theme-alpine" style={{height: 400, width: 600}}>
|            &lt;AgGridReact
|                rowData={rowData}
|                columnDefs={columnDefs}>
|            &lt;/AgGridReact>
|        &lt;/div>
|    );
|};
|
|const root = createRoot(document.getElementById('root'));
|root.render(&lt;GridExample />);
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
</div>
<div tab-label="index.html">
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="html" lineNumbers="true">
|&lt;div id="root">&lt;/div>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
</div>

</tabs>
</framework-specific-section>

<framework-specific-section frameworks="react">
<note>
| Please refer to our [Compatibility Chart](../react-compatibility) for Supported Versions of React & AG Grid.
</note>
</framework-specific-section>

<framework-specific-section frameworks="react">
| ## Getting Started with Community Video
</framework-specific-section>

<framework-specific-section frameworks="react">
 <video-section id="Pr__B6HM_s4" title="Video Tutorial for Getting Started with AG Grid Community">
 <p>
     In this video we detail the steps to get an application working with React and AG Grid Community. We show how to set up Rows and Columns, set some Grid Properties, use the Grid's API and listen to Grid events.
 </p>
 </video-section>
</framework-specific-section>


<framework-specific-section frameworks="react">
| ## Getting Started with Enterprise Video
</framework-specific-section>

<framework-specific-section frameworks="react">
 <video-section id="pKUhYE1VTP4" title="Getting Started with AG Grid Enterprise">
 <p>
     The video then follows showing how to get started with <a href="../licensing/">AG Grid Enterprise</a>. Please take a look at Enterprise, you don't need a license to trial AG Grid Enterprise, you only need to get in touch if you decide to use it in your project.
 </p>
 </video-section>
</framework-specific-section>

<framework-specific-section frameworks="react">
|
| ## Getting Started with AG Grid Community
|
| Below we provide code for a simple AG Grid React application. To get this working locally,
| create a new React application as follows:
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="bash">
| npx create-react-app hello
| cd hello
| npm install --save ag-grid-community
| npm install --save ag-grid-react
| npm start
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
If everything goes well, `npm start` has started the web server and conveniently opened a browser
pointing to <a href="http://localhost:3000">localhost:3000</a>
</framework-specific-section>
<framework-specific-section frameworks="react">
| ### Grid Dependencies
|
| Note the `package.json` has the following dependencies:
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|"dependencies": {
|    "ag-grid-community": "@AG_GRID_VERSION@",
|    "ag-grid-react": "@AG_GRID_VERSION@",
|    ...
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| `ag-grid-community` is the core logic of the Grid, and `ag-grid-react` is the React Rendering Engine.
| Both are needed for the grid to work with React and their versions **must** match.
|
| ### Copy in Application Code
|
| Copy the content below into the file `App.js`:
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|import React, { useState, useRef, useEffect, useMemo, useCallback} from 'react';
|import { createRoot } from 'react-dom/client';
|import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
|
|import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
|import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
|
|const App = () => {
|
|  const gridRef = useRef(); // Optional - for accessing Grid's API
|  const [rowData, setRowData] = useState(); // Set rowData to Array of Objects, one Object per Row
|
|  // Each Column Definition results in one Column.
|  const [columnDefs, setColumnDefs] = useState([
|    {field: 'make', filter: true},
|    {field: 'model', filter: true},
|    {field: 'price'}
|  ]);
|
|  // DefaultColDef sets props common to all Columns
|  const defaultColDef = useMemo( ()=> ({
|      sortable: true
|    }));
|
|  // Example of consuming Grid Event
|  const cellClickedListener = useCallback( event => {
|    console.log('cellClicked', event);
|  }, []);
|
|  // Example load data from server
|  useEffect(() => {
|    fetch('https://www.ag-grid.com/example-assets/row-data.json')
|    .then(result => result.json())
|    .then(rowData => setRowData(rowData))
|  }, []);
|
|  // Example using Grid's API
|  const buttonListener = useCallback( e => {
|    gridRef.current.api.deselectAll();
|  }, []);
|
|  return (
|    &lt;div>
|
|      {/* Example using Grid's API */}
|      &lt;button onClick={buttonListener}>Push Me&lt;/button>
|
|      {/* On div wrapping Grid a) specify theme CSS Class Class and b) sets Grid size */}
|      &lt;div className="ag-theme-alpine" style={{width: 500, height: 500}}>
|
|        &lt;AgGridReact
|            ref={gridRef} // Ref for accessing Grid's API
|
|            rowData={rowData} // Row Data for Rows
|
|            columnDefs={columnDefs} // Column Defs for Columns
|            defaultColDef={defaultColDef} // Default Column Properties
|
|            animateRows={true} // Optional - set to 'true' to have rows animate when sorted
|            rowSelection='multiple' // Options - allows click selection of rows
|
|            onCellClicked={cellClickedListener} // Optional - registering for Grid Event
|            />
|      &lt;/div>
|    &lt;/div>
|  );
|};
|
|export default App;
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| If everything is correct, you should see a simple grid that looks like this:
</framework-specific-section>
<framework-specific-section frameworks="react">
<image-caption src="step1.png" alt="AG Grid in its simplest form" maxWidth="80%" constrained="true" centered="true"></image-caption>
</framework-specific-section>
<framework-specific-section frameworks="react">
|
| We will now break this file down and explain the different parts...
|
| ### Grid CSS and Themes
|
| Two CSS files were loaded as follows:
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false}>
|import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
|import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| The first `ag-grid.css` is always needed. It's the core structural CSS needed by the grid. Without this, the Grid will not work.
|
| The second `ag-theme-alpine.css` is the chosen [Grid Theme](/themes/). This is then subsequently applied to the Grid by including the Theme's CSS Class in the Grid's parent DIV `className="ag-theme-alpine"`.
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|&lt;div className="ag-theme-alpine" style={{width: 500, height: 500}}>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| You can select from any of the [Grid Provided Themes](/themes/). If you don't like the provided themes you can [Customise the Provided Theme](/themes/) or do not use a Theme and style the grid yourself from scratch.
|
| The dimension of the Grid is also set on the parent DIV via `style={{width: 500, height: 500}}`. The grid will fill 100% in both directions, so size it's parent element to the required dimensions.
|
| ### Setting Row Data
|
| The Grid is provided Row Data via the `rowData` Grid Property. This is wired up using React `useState()` hook and loading the data from the server.
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|const [rowData, setRowData] = useState(); // Set rowData to Array of Objects, one Object per Row
|
|...
|
|// Example load data from server
|useEffect(() => {
|    fetch('https://www.ag-grid.com/example-assets/row-data.json')
|    .then(result => result.json())
|    .then(rowData => setRowData(rowData))
|}, []);
|
|...
|
|&lt;AgGridReact
|    rowData={rowData} // Row Data for Rows
|    ...
|    />
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| ### Setting Column Definitions
|
| Columns are defined by setting [Column definitions](/column-definitions/). Each Column Definition
| defines one Column. Properties can be set for all Columns using the Default Column Definition.
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|// Each Column Definition results in one Column.
|const [columnDefs, setColumnDefs] = useState([
|    {field: 'make', filter: true},
|    {field: 'model', filter: true},
|    {field: 'price'}
|]);
|
|// DefaultColDef sets props common to all Columns
|const defaultColDef = useMemo( ()=> ({
|    sortable: true
|}));
|
|...
|
|&lt;AgGridReact
|    columnDefs={columnDefs} // Column Defs for Columns
|    defaultColDef={defaultColDef} // Default Column Properties
|    ...
|/>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| ### Accessing the Grid's API
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|const gridRef = useRef(); // Optional - for accessing Grid's API
|// Example using Grid's API
|const buttonListener = useCallback( e => {
|    gridRef.current.api.deselectAll();
|}, []);
|
|&lt;AgGridReact
|    ref={gridRef} // Ref for accessing Grid's API
|    />
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| ### Consuming Grid Events
|
| Listen to [Grid Events](../grid-events/) by adding a callback to the appropriate `on[eventName]` property.
| This example demonstrates consuming the `cellClicked` event.
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|&lt;AgGridReact
|    onCellClicked={cellClickedListener} // Optional - registering for Grid Event
|    ...
|/>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| ### Grid Properties
|
| Set other [Grid Options](../grid-options/) by adding parameters to `&lt;AgGridReact/>` component.
| This example demonstrates setting `animateRows` and `rowSelection`.
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|&lt;AgGridReact
|    animateRows={true} // Optional - set to 'true' to have rows animate when sorted
|    rowSelection='multiple' // Options - allows click selection of rows
|    ...
|/>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
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
| In addition to `ag-grid-community` and `ag-grid-react`, AG Grid Enterprise also needs
| `ag-grid-enterprise`.
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="bash">
| npm install --save ag-grid-enterprise
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| The `package.json` should now contain the following dependencies:
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false}>
|"dependencies": {
|    "ag-grid-community": "@AG_GRID_VERSION@",
|    "ag-grid-enterprise": "@AG_GRID_VERSION@",
|    "ag-grid-react": "@AG_GRID_VERSION@",
|    ...
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| `ag-grid-enterprise` contains the Enterprise features only, it does not contain the core grid,
| hence you still need `ag-grid-community` and `ag-grid-react`. Versions of all three **must** match.
|
| ### Import Enterprise
|
| Import AG Grid Enterprise intro your application as follows:
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|import 'ag-grid-enterprise';
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| And that is all, you use the same `&lt;AgGridReact/>` component, except this time it comes installed
| with all the Enterprise features.
|
| For example, you can now Row Group (an Enterprise Feature) by a particular Column by
| setting `rowGroup=true` on the Column Definition.
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|// Each Column Definition results in one Column.
|const [columnDefs, setColumnDefs] = useState([
|    {field: 'make', rowGroup: true},
|    {field: 'model'},
|    {field: 'price'}
|]);
</snippet>
</framework-specific-section>

[//]: # (Vue Section)
<framework-specific-section frameworks="vue">
| ### Quick Look Code Example
</framework-specific-section>

<framework-specific-section frameworks="vue">
<tabs>

<div tabs-links="true">
<open-in-cta type="codesandbox" href="https://codesandbox.io/s/ag-grid-vue-3-example-bvwik?file=/src/main.js" />
</div>

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
If everything went well `npm run serve` started the web server and conveniently opened a browser
pointing to <a href="http://localhost:8080">localhost:8080</a> (if the browser wasn't automatically launched simply navigate to <a href="http://localhost:8080">localhost:8080</a>
in your browser of choice.
</framework-specific-section>

<framework-specific-section frameworks="vue">
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

  
