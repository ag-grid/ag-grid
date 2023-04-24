[[only-react]]
|
| ## Properties, Events, Callbacks and APIs
|
| - **Properties**: properties are defined by passing React props down to AG Grid (e.g. `columnDefs={this.state.columnDefs}`)
| - **Callbacks**: callbacks are also defined using React Props (e.g. `getRowHeight={this.myGetRowHeightFunction}`).
| - **Event Handlers**: event handlers are also defined using React Props (e.g. `onCellClicked={this.onCellClicked}`).
| - **API**: The grid API and column API are provided to you via the `onGridReady()` event callback.
|
| So in summary, in React, everything is done via props. Here is an example:
|
| ```jsx
| <AgGridReact
|    ref={gridRef} // useful for accessing the grid's API
|
|    rowSelection="multiple" // simple attributes, not bound to any state or prop
|
|    // these are bound props, so can use anything in React state or props
|    columnDefs={columnDefs}
|    showToolPanel={showToolPanel}
|
|    // this is a callback
|    getRowHeight={myGetRowHeightFunction}
|
|    // these are registering event callbacks
|    onCellClicked={onCellClicked}
|    onColumnResized={onColumnEvent}
|
|    // inside onGridReady, you receive the grid APIs if you want them
|    onGridReady={onGridReady}
| />
| ```
|
| ## React Hooks
|
| When setting properties, it's best to treat non-simple types as immutable objects (e.g. by using `useState` or `useMemo`). See [React Hooks](/react-hooks/) for best practices on using React Hooks with the grid.
|
| ## Access the Grid & Column API
|
| The API of the grid can be referenced through the component's React Reference.
|
| ```jsx
| // React reference
| const gridRef = useRef();
|
| const myListener = ()=> {
|     // api and columnApi on the gridRef object
|     const {api, columnApi} = gridRef.current;
|
|     // api's will be null before grid initialised
|     if (api==null || columnApi==null) { return; }
|
|     // access the Grid API
|     gridRef.api.deselectAll();
|
|     // access the Grid Column API
|     gridRef.columnApi.resetColumnState();
| }
|
| <button click={myListener}>Do Something</button>
| <AgGridReact
|     ref={gridRef}
|     //...
| />
| ```
|
| The Grid API and Column API are also provided as part of all the grid events as well as a parameters
| to all grid callbacks.
|
| ```jsx
| // access API from event object
| onGridReady = e => {
|     e.api.sizeColumnsToFit();
|     e.columnApi.resetColumnState();
| }
|
| // access API from callback params object
| sendToClipboard = params => {
|     e.api.sizeColumnsToFit();
|     e.columnApi.resetColumnState();
| }
|
| <AgGridReact
|     onGridReady={onGridReady} // register event listener
|     sendToClipboard={sendToClipboard} // register callback
|     //...
| />
| ```
|
|[[note]]
|| Given React is asynchronous, the grid may not be initialised when you access the API from the
|| React reference. If you want to access the API as soon as it's available (ie do initialisation
|| work), consider listening to the `gridReady` event and doing such initialisation there.
|
| ## Grid Options
|
| The `gridOptions` object is a 'one stop shop' for the entire interface into the grid, commonly used if using plain JavaScript.
| Grid options can however be used instead of, or in addition to, normal framework bindings. If an option is set via `gridOptions`, as well as a property on the component, then the component property will take precedence.
|
| The GridOptions interface supports a generic parameter for row data as detailed in [Typescript Generics](/typescript-generics).
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
|     onRowClicked: event => console.log('A row was clicked'),
|     onColumnResized: event => console.log('A column was resized'),
|     onGridReady: event => console.log('The grid is now ready'),
|
|     // CALLBACKS
|     getRowHeight: (params) => 25
| }
| ```
|
| ```jsx
| <AgGridReact
|     gridOptions={gridOptions}
| ```
|
| Note the if using Grid Options, the grid will not react to property changes. For example `gridOptions.rowData` will only get used once when the grid is initialised, not if you change `gridOptions.rowData` after the grid is initialised. For this reason, while using React, it's best only use Grid Options for properties that do not change.
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
