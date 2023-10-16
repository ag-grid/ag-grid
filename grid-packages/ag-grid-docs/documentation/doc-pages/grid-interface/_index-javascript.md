<framework-specific-section frameworks="javascript">
| ## Grid Options
|
| The `gridOptions` object is used to configure the grid. The GridOptions interface supports a generic parameter for row data as detailed in [Typescript Generics](/typescript-generics).
|
| The example below shows the different types of items available on `gridOptions`.
|
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
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
|     onRowClicked: event => console.log('A row was clicked'),
|     onColumnResized: event => console.log('A column was resized'),
|     onGridReady: event => console.log('The grid is now ready'),
|
|     // CALLBACKS
|     getRowHeight: (params) => 25
| }
|
| // Pass gridOptions to createGrid to build a new Grid
| const api = createGrid(gridDiv, gridOptions)
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
| ### Access the Grid API
|
| You can access the api in the following ways:
|
| - Store the `api` when creating the grid via `createGrid`. 
| - Store the `api` from the `gridReady` event - it will be available on the `params` argument.
|
| ## Listening to Events
|
| In addition to adding event listeners directly via the `gridOptions` object, it is possible to register for events, similar to registering for events on native DOM elements. This means there are two ways to listen for events: either use the `onXXX()` method on the api (where XXX is replaced with the event name), or register a listener for the event. The latter option allows you to add multiple handlers for the same event. The following example demonstrates the two options:
|
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
| // create handler function
| function myRowClickedHandler(event) {
|     console.log('The row was clicked');
| }
|
| // option 1: use the gridOptions
| gridOptions.onRowClicked = myRowClickedHandler;
|
| // option 2: register the handler
| api.addEventListener('rowClicked', myRowClickedHandler);
</snippet>
</framework-specific-section>