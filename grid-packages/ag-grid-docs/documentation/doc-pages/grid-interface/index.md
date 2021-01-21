---
title: "Grid Interface"
---

This section details the public interface that your application can use to interact with the grid, including methods, properties and events.

The grid interface is the combination of the following items:

- [Grid Properties](../grid-properties/): properties used to configure the grid, e.g. `pagination = true`.
- [Grid API](../grid-api/): methods used to interact with the grid after it's created, e.g. `api.getSelectedRows()`.
- [Grid Events](../grid-events/): events published by the grid to inform applications of changes in state, e.g. `rowSelected`.
- [Grid Callbacks](../grid-callbacks/): callbacks are used by the grid to retrieve required information from your application, e.g. `getRowHeight()`.
- [Row Node](../row-object/): each row in the grid is represented by a Row Node object, which in turn has a reference to the piece of row data provided by the application. The Row Node wraps the row data item. The Row Node has attributes, methods and events for interacting with the specific row e.g. `rowNode.setSelected(true)`.


[[only-javascript]]
|## Grid Options
|
|The `gridOptions` object is a 'one stop shop' for the entire interface into the grid. The grid options can be used regardless of the framework you are using, but if you are using a framework you might find it easier to use your framework's bindings. How to configure for a particular framework is explained further down this page.
|
|The example below shows the different types of items available on `gridOptions`.
|
|```js
|var gridOptions = {
|    // PROPERTIES
|    // Objects like myRowData and myColDefs would be created in your application
|    rowData: myRowData,
|    columnDefs: myColDefs,
|    pagination: true,
|    rowSelection: 'single',
|
|    // EVENTS
|    // Add event handlers
|    onRowClicked: function(event) { console.log('A row was clicked'); },
|    onColumnResized: function(event) { console.log('A column was resized'); },
|    onGridReady: function(event) { console.log('The grid is now ready'); },
|
|    // CALLBACKS
|    isScrollLag: function() { return false; }
|}
|```
|
|Once the grid is initialised, you will also have access to the grid API (`api`) and column API (`columnApi`) on the `gridOptions` object as shown:
|
|```js
|// refresh the grid
|gridOptions.api.refreshView();
|
|// resize columns in the grid to fit the available space
|gridOptions.columnApi.sizeColumnsToFit();
|```
|
| ### Grid API
|
| The Grid API (both `api` and `columnApi`) will only be available after the `gridReady` event has been fired.
|
| You can access the APIs in the following ways:
|
| - Store them from the `gridReady` event - they'll be available via the `params` argument passed into the event
| - Provide a `gridOptions` object to the grid pre-creation time. Post-creation the APIs will be available on the `gridOptions` object.
|
|
|## Listening to Events
|
|In addition to adding event listeners directly via the `gridOptions` object, it is possible to register for events, similar to registering for events on native DOM elements. This means there are two ways to listen for events: either to use the `onXXX()` method on the API (where XXX is replaced with the event name), or to register for the event. The latter option allows you to add multiple handlers for the same event. The following example demonstrates the two options:
|
|```js
|// create handler function
|function myRowClickedHandler(event) {
|    console.log('The row was clicked');
|}
|
|// option 1: use the API
|gridOptions.onRowClicked = myRowClickedHandler;
|
|// option 2: register the handler
|gridOptions.api.addEventListener('rowClicked', myRowClickedHandler);
|```
|
[[only-angular]]
|
| ## Properties, Events, Callbacks and APIs
|
| - **Attributes**: attributes are properties, but aren't bound - they are instead provided literal values (e.g. `rowSelection="multiple"`).
| - **Properties**: properties are bound attributes (e.g. `[columnDefs]="columnDefs"`).
| - **Callbacks**: callbacks are bound in the same as properties are (e.g. `[isScrollLag]="myIsScrollLagFunction"`).
| - **Event Handlers**: event handlers are are bound in the standard Angular way (e.g. `(cellClicked)="onCellClicked($event)"`).
| - **API**: the grid API and column API are accessible through the component.
|
| ```jsx
| <ag-grid-angular
|    #myGrid // assign an angular ID to the grid - optional
|
|    // these are boolean values, which if included without a value, default to true
|    // (if they are not specified, the default is false)
|    rowAnimation
|    pagination
|
|    // these are attributes, not bound, give literal values 
|    rowSelection="multiple"
|
|    // these are bound properties
|    [columnDefs]="columnDefs"
|    [showToolPanel]="showToolPanel"
|
|    // register a callback
|    [isScrollLag]="myIsScrollLagFunction"
|
|    // register events
|    (cellClicked)="onCellClicked($event)"
|    (columnResized)="onColumnEvent($event)">
| </ag-grid-angular>
| ```
|## Access the Grid & Column API
|
|When the grid is initialised, it will fire the `gridReady` event. If you want to use the APIs of
|the grid, you should put an `onGridReady(params)` callback onto the grid and grab the api(s)
|from the params. You can then call these apis at a later stage to interact with the
|grid (on top of the interaction that can be done by setting and changing the properties).
|
| ```jsx
| <ag-grid-angular
|    #myGrid // assign an angular ID to the grid - optional
|
|    // provide gridReady callback to the grid
|    (onGridReady)="onGridReady($event)"
|    // ...
| />
|
|// in onGridReady, store the api for later use
|onGridReady = (params) => {
|    this.api = params.api;
|    this.columnApi = params.columnApi;
|}
|```
|
|The APIs are also accessible through the component. For example in the snippet above the Grid is give the ID of `'#myGrid'` which then allows the API to be accessed as follows:
|
| ```jsx
| <button (click)="myGrid.api.deselectAll()">Clear Selection</button>
| ```
|## Grid Options
|
|The `gridOptions` object is a 'one stop shop' for the entire interface into the grid, commonly used if using plain JavaScript.
|Grid options can however be used instead of, or in addition to, normal framework binding.
|
|The example below shows the different types of items available on `gridOptions`.
|
|```js
|const gridOptions = {
|    // PROPERTIES
|    // Objects like myRowData and myColDefs would be created in your application
|    rowData: myRowData,
|    columnDefs: myColDefs,
|    pagination: true,
|    rowSelection: 'single',
|
|    // EVENTS
|    // Add event handlers
|    onRowClicked: function(event) { console.log('A row was clicked'); },
|    onColumnResized: function(event) { console.log('A column was resized'); },
|    onGridReady: function(event) { console.log('The grid is now ready'); },
|
|    // CALLBACKS
|    isScrollLag: function() { return false; }
|}
|```
| ```jsx
| <ag-grid-angular
|    [gridOptions]={gridOptions}
|```
|
|Once the grid is initialised, you will also have access to the grid API (`api`) and column API (`columnApi`) on the `gridOptions` object as shown:
|
|```js
|// refresh the grid
|this.gridOptions.api.refreshView();
|
|// resize columns in the grid to fit the available space
|this.gridOptions.columnApi.sizeColumnsToFit();
|```
[[only-react]]
|
| ## Properties, Events, Callbacks and APIs
|
| - **Properties**: properties are defined by passing React props down to ag-Grid (e.g. `columnDefs={this.state.columnDefs}`)
| - **Callbacks**: callbacks are also defined using React Props (e.g. `isScrollLag={this.isScrollLagFunction}`).
| - **Event Handlers**: event handlers are also defined using React Props (e.g. `onCellClicked={this.onCellClicked}`).
| - **API**: The grid API and column API are provided to you via the `onGridReady()` event callback.
|
| So in summary, in React, everything is done via props. Here is an example:
|
| ```jsx
| <AgGridReact
|    ref="agGrid" // useful for accessing the component directly via ref - optional
|
|    rowSelection="multiple" // simple attributes, not bound to any state or prop
|
|    // these are bound props, so can use anything in React state or props
|    columnDefs={this.props.columnDefs}
|    showToolPanel={this.state.showToolPanel}
|
|    // this is a callback
|    isScrollLag={this.myIsScrollLagFunction}
|
|    // these are registering event callbacks
|    onCellClicked={this.onCellClicked}
|    onColumnResized={this.onColumnEvent}
|
|    // inside onGridReady, you receive the grid APIs if you want them
|    onGridReady={this.onGridReady}
| />
| ```
|## Access the Grid & Column API
|
|When the grid is initialised, it will fire the `gridReady` event. If you want to use the APIs of
|the grid, you should put an `onGridReady(params)` callback onto the grid and grab the api(s)
|from the params. You can then call these apis at a later stage to interact with the
|grid (on top of the interaction that can be done by setting and changing the props).
|
|```jsx
|// provide gridReady callback to the grid
|<AgGridReact
|    onGridReady={onGridReady}
|    //...
|/>
|
|// in onGridReady, store the api for later use
|onGridReady = (params) => {
|    // using hooks - setGridApi/setColumnApi are returned by useState
|    setGridApi(params.api);
|    setColumnApi(params.columnApi);
|
|    // or setState if using components
|    this.setState({
|        gridApi: params.api,
|        columnApi: params.columnApi
|    });
|}
|
|// use the api some point later!
|somePointLater() {
|    // hooks
|    gridApi.selectAll();
|    columnApi.setColumnVisible('country', visible);
|
|    // components
|    this.state.gridApi.selectAll();
|    this.state.columnApi.setColumnVisible('country', visible);
|}
|```
|
|The `api` and `columnApi` are also stored inside the `AgGridReact` component, so you can also
|look up the backing object via React and access the `api` and `columnApi` that way if you'd prefer.
|
| The APIs are also accessible through the component itself. For example, above the `ref` is given as `'myGrid'` which then allows the API to be accessed like this:
|
| ```jsx
| <button onClick={() => this.refs.agGrid.api.deselectAll()}>Clear Selection</button>
| ```
|
|## Grid Options
|
|The `gridOptions` object is a 'one stop shop' for the entire interface into the grid, commonly used if using plain JavaScript.
|Grid options can however be used instead of, or in addition to, normal framework binding.
|
|The example below shows the different types of items available on `gridOptions`.
|
|```js
|const gridOptions = {
|    // PROPERTIES
|    // Objects like myRowData and myColDefs would be created in your application
|    rowData: myRowData,
|    columnDefs: myColDefs,
|    pagination: true,
|    rowSelection: 'single',
|
|    // EVENTS
|    // Add event handlers
|    onRowClicked: function(event) { console.log('A row was clicked'); },
|    onColumnResized: function(event) { console.log('A column was resized'); },
|    onGridReady: function(event) { console.log('The grid is now ready'); },
|
|    // CALLBACKS
|    isScrollLag: function() { return false; }
|}
|```
| ```jsx
| <AgGridReact
|    gridOptions={gridOptions}
|```
|
|Once the grid is initialised, you will also have access to the grid API (`api`) and column API (`columnApi`) on the `gridOptions` object as shown:
|
|```js
|// refresh the grid
|gridOptions.api.refreshView();
|
|// resize columns in the grid to fit the available space
|gridOptions.columnApi.sizeColumnsToFit();
|```
[[only-vue]]
|
| ## Properties, Events, Callbacks and APIs
|
| - **Attributes**: attributes are properties, but aren't bound - they are instead provided literal values (e.g. `rowSelection="multiple"`).
| - **Properties**: properties are bound attributes (e.g. `:columnDefs="columnDefs"`).
| - **Callbacks**: callbacks are bound in the same as properties are (e.g. `:isScrollLag="myIsScrollLagFunction"`).
| - **Event Handlers**: event handlers are are bound in the standard Angular way (e.g. `@cell-clicked="onCellClicked"`). Event names must use `kebab-case`. 
| - **API**: the grid API and column API are accessible through the component.
|
| All of the above (attributes, properties, callbacks and event handlers) are registered using their 'dash' syntax and not camel-case. For example, the property `pivotMode` is bound using `pivot-mode`. The following example shows some bindings:
|
| ```jsx
| <ag-grid-vue
|    // these are attributes, not bound, give explicit values here
|    rowSelection="multiple"
|
|    // these are boolean values
|    // (leaving them out will default them to false)
|    :rowAnimation="true"
|    :pivot-mode="true"
|
|    // these are bound properties
|    :gridOptions="gridOptions"
|    :columnDefs="columnDefs"
|
|    // this is a callback
|    :isScrollLag="myIsScrollLagFunction"
|
|    // these are registering event callbacks
|    @model-updated="onModelUpdated"
|    @cell-clicked="onCellClicked">
| </ag-grid-vue>
| ```
|
|## Access the Grid & Column API
|
|When the grid is initialised, it will fire the `gridReady` event. If you want to use the APIs of
|the grid, you should put an `onGridReady(params)` callback onto the grid and grab the api(s)
|from the params. You can then call these apis at a later stage to interact with the
|grid (on top of the interaction that can be done by setting and changing the properties).
|
| ```jsx
| <ag-grid-vue
|    #myGrid // assign an angular ID to the grid - optional
|
|    // provide gridReady callback to the grid
|    @grid-ready="onGridReady"
|    // ...
| />
|
|// in onGridReady, store the api for later use
|onGridReady = (params) => {
|    this.api = params.api;
|    this.columnApi = params.columnApi;
|}
|```
|
| The APIs are accessible through the component. For example, above the ID is given as `'#myGrid'` which then allows the API to be accessed like this:
|
| ```html
| <button @click="myGrid.api.deselectAll()">Clear Selection</button>
| ```
|## Grid Options
|
|The `gridOptions` object is a 'one stop shop' for the entire interface into the grid, commonly used if using plain JavaScript.
|Grid options can however be used instead of, or in addition to, normal framework binding.
|
|The example below shows the different types of items available on `gridOptions`.
|
|```js
|const gridOptions = {
|    // PROPERTIES
|    // Objects like myRowData and myColDefs would be created in your application
|    rowData: myRowData,
|    columnDefs: myColDefs,
|    pagination: true,
|    rowSelection: 'single',
|
|    // EVENTS
|    // Add event handlers
|    onRowClicked: function(event) { console.log('A row was clicked'); },
|    onColumnResized: function(event) { console.log('A column was resized'); },
|    onGridReady: function(event) { console.log('The grid is now ready'); },
|
|    // CALLBACKS
|    isScrollLag: function() { return false; }
|}
|```
| ```jsx
| <ag-grid-vue
|    :gridOptions="gridOptions"
|```
|
|Once the grid is initialised, you will also have access to the grid API (`api`) and column API (`columnApi`) on the `gridOptions` object as shown:
|
|```js
|// refresh the grid
|this.gridOptions.api.refreshView();
|
|// resize columns in the grid to fit the available space
|this.gridOptions.columnApi.sizeColumnsToFit();
|```
## Events Are Asynchronous

Grid events are asynchronous so that the state of the grid will be settled by the time your event callback gets invoked.

## Default Boolean Properties

Where the property is a boolean (`true` or `false`), then `false` (or left blank) is the default value. For this reason, on / off items are presented in a way that causes the most common behaviour
to be used when the value is `false`. For example, `suppressCellSelection` is named as such because most people will want cell selection to be enabled.

## Next Steps

That's it, Doc! Now you know how to interface with the grid. Go now and find out about all the great [properties](../grid-properties/), [methods](../grid-api/), [callbacks](../grid-callbacks/) and [events](../grid-events/) you can use.
