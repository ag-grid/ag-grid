<framework-specific-section frameworks="javascript">
|Register callbacks for events through the `GridOptions` interface. The name of the callback is constructed by prefixing the event name with `on`. For example, the callback for the `cellClicked` event is `gridOptions.onCellClicked`.
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
| const gridOptions = {
|     // Add event handlers
|     onCellClicked: (event: CellClickedEvent) => console.log('Cell was clicked'),
| }
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
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