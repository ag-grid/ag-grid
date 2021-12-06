[[only-javascript]]
| ## Grid Options
|
| The `gridOptions` object is a 'one stop shop' for the entire interface into the grid. 
|
| The example below shows the different types of items available on `gridOptions`.
|
| ```js
| var gridOptions = {
|     // PROPERTIES
|     // Objects like myRowData and myColDefs would be created in your application
|     rowData: myRowData,
|     columnDefs: myColDefs,
|     pagination: true,
|     rowSelection: 'single',
|
|     // EVENTS
|     // Add event handlers
|     onRowClicked: event => console.log('A row was clicked'),
|     onColumnResized: event => console.log('A column was resized'),
|     onGridReady: event => console.log('The grid is now ready'),
|
|     // CALLBACKS
|     getRowHeight: (params) => 25
| }
| ```
|
| Once the grid is initialised, you will also have access to the grid API (`api`) and column API (`columnApi`) on the `gridOptions` object as shown:
|
| ```js
| // refresh the grid
| gridOptions.api.redrawRows();
|
| // resize columns in the grid to fit the available space
| gridOptions.columnApi.sizeColumnsToFit();
| ```
|
| ### Access the Grid & Column API
|
| The Grid API (both `api` and `columnApi`) will only be available after the `gridReady` event has been fired.
|
| You can access the APIs in the following ways:
|
| - Store them from the `gridReady` event - they'll be available via the `params` argument passed into the event
| - Provide a `gridOptions` object to the grid pre-creation time. Post-creation the APIs will be available on the `gridOptions` object.
|
| ## Listening to Events
|
| In addition to adding event listeners directly via the `gridOptions` object, it is possible to register for events, similar to registering for events on native DOM elements. This means there are two ways to listen for events: either use the `onXXX()` method on the API (where XXX is replaced with the event name), or register a listener for the event. The latter option allows you to add multiple handlers for the same event. The following example demonstrates the two options:
|
| ```js
| // create handler function
| function myRowClickedHandler(event) {
|     console.log('The row was clicked');
| }
|
| // option 1: use the API
| gridOptions.onRowClicked = myRowClickedHandler;
|
| // option 2: register the handler
| gridOptions.api.addEventListener('rowClicked', myRowClickedHandler);
| ```
