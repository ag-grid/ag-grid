[[only-vue]]
|
| ## Properties, Events, Callbacks and APIs
|
| - **Attributes**: attributes are properties, but aren't bound - they are instead provided literal values (e.g. `rowSelection="multiple"`).
| - **Properties**: properties are bound attributes (e.g. `:columnDefs="columnDefs"`).
| - **Callbacks**: callbacks are bound in the same as properties are (e.g. `:getRowHeight="myGetRowHeightFunction"`).
| - **Event Handlers**: event handlers are are bound in the standard way (e.g. `@cell-clicked="onCellClicked"`). Event names must use `kebab-case`.
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
|    :getRowHeight="myGetRowHeightFunction"
|
|    // these are registering event callbacks
|    @model-updated="onModelUpdated"
|    @cell-clicked="onCellClicked">
| </ag-grid-vue>
| ```
|
| ## Access the Grid & Column API
|
| When the grid is initialised, it will fire the `gridReady` event. If you want to use the APIs of
| the grid, you should put an `onGridReady(params)` callback onto the grid and grab the api(s)
| from the params. You can then call these apis at a later stage to interact with the
| grid (on top of the interaction that can be done by setting and changing the properties).
|
| ```jsx
| <ag-grid-vue
|     #myGrid // assign an angular ID to the grid - optional
|
|     // provide gridReady callback to the grid
|     @grid-ready="onGridReady"
|     // ...
| />
|
| // in onGridReady, store the api for later use
| onGridReady = (params) => {
|     this.api = params.api;
|     this.columnApi = params.columnApi;
| }
| ```
|
| The APIs are accessible through the component. For example, above the ID is given as `'#myGrid'` which then allows the API to be accessed like this:
|
| ```html
| <button @click="myGrid.api.deselectAll()">Clear Selection</button>
| ```
|
| ## Grid Options
|
| The `gridOptions` object is a 'one stop shop' for the entire interface into the grid, commonly used if using plain JavaScript.
| Grid options can however be used instead of, or in addition to, normal framework binding.
|
| The example below shows the different types of items available on `gridOptions`.
|
| ```js
| const gridOptions = {
|     // PROPERTIES
|     // Objects like myRowData and myColDefs would be created in your application
|     rowData: myRowData,
|     columnDefs: myColDefs,
|     pagination: true,
|     rowSelection: 'single',
|
|     // EVENTS
|     // Add event handlers
|     onRowClicked: event => console.log('A row was clicked')
|     onColumnResized: event => console.log('A column was resized')
|     onGridReady: event => console.log('The grid is now ready')
|
|     // CALLBACKS
|     getRowHeight: (params) => 25
| }
| ```
|
| ```jsx
| <ag-grid-vue
|     :gridOptions="gridOptions"
| ```
|
| Once the grid is initialised, you will also have access to the grid API (`api`) and column API (`columnApi`) on the `gridOptions` object as shown:
|
| ```js
| // refresh the grid
| this.gridOptions.api.redrawRows();
|
| // resize columns in the grid to fit the available space
| this.gridOptions.columnApi.sizeColumnsToFit();
| ```
