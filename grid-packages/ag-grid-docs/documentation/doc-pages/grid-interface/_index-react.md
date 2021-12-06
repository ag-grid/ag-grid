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
|    ref="agGrid" // useful for accessing the component directly via ref - optional
|
|    rowSelection="multiple" // simple attributes, not bound to any state or prop
|
|    // these are bound props, so can use anything in React state or props
|    columnDefs={this.props.columnDefs}
|    showToolPanel={this.state.showToolPanel}
|
|    // this is a callback
|    getRowHeight={this.myGetRowHeightFunction}
|
|    // these are registering event callbacks
|    onCellClicked={this.onCellClicked}
|    onColumnResized={this.onColumnEvent}
|
|    // inside onGridReady, you receive the grid APIs if you want them
|    onGridReady={this.onGridReady}
| />
| ```
|
| ## Access the Grid & Column API
|
| When the grid is initialised, it will fire the `gridReady` event. If you want to use the APIs of
| the grid, you should put an `onGridReady(params)` callback onto the grid and grab the api(s)
| from the params. You can then call these apis at a later stage to interact with the
| grid (on top of the interaction that can be done by setting and changing the props).
|
| ```jsx
| // provide gridReady callback to the grid
| <AgGridReact
|     onGridReady={onGridReady}
|     //...
| />
|
| // in onGridReady, store the api for later use
| onGridReady = (params) => {
|     // using hooks - setGridApi/setColumnApi are returned by useState
|     setGridApi(params.api);
|     setColumnApi(params.columnApi);
|
|     // or setState if using components
|     this.setState({
|         gridApi: params.api,
|         columnApi: params.columnApi
|     });
| }
|
| // use the api some point later!
| somePointLater() {
|     // hooks
|     gridApi.selectAll();
|     columnApi.setColumnVisible('country', visible);
|
|     // components
|     this.state.gridApi.selectAll();
|     this.state.columnApi.setColumnVisible('country', visible);
| }
| ```
|
| The `api` and `columnApi` are also stored inside the `AgGridReact` component, so you can also
| look up the backing object via React and access the `api` and `columnApi` that way if you'd prefer.
|
|  The APIs are also accessible through the component itself. For example, above the `ref` is given as `'myGrid'` which then allows the API to be accessed like this:
|
| ```jsx
| <button onClick={() => this.refs.agGrid.api.deselectAll()}>Clear Selection</button>
| ```
|
| ## Grid Options
|
| The `gridOptions` object is a 'one stop shop' for the entire interface into the grid, commonly used if using plain JavaScript.
| Grid options can however be used instead of, or in addition to, normal framework bindings.
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
| Once the grid is initialised, you will also have access to the grid API (`api`) and column API (`columnApi`) on the `gridOptions` object as shown:
|
| ```js
| // refresh the grid
| gridOptions.api.redrawRows();
|
| // resize columns in the grid to fit the available space
| gridOptions.columnApi.sizeColumnsToFit();
| ```
