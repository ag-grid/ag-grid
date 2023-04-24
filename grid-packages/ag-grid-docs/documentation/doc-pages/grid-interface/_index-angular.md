[[only-angular]]
| ## Properties, Events, Callbacks and APIs
|
| - **Properties**: properties are bound via @Inputs (e.g. `[columnDefs]="columnDefs"`).
| - **Attributes**: attributes are properties that also accept literal values (e.g. `rowSelection="multiple"`).
| - **Callbacks**: callbacks are bound via @Inputs like properties (e.g. `[getRowHeight]="myGetRowHeight"`).
| - **Event Handlers**: event handlers are are bound via @Outputs (e.g. `(cellClicked)="onCellClicked($event)"`).
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
|    [getRowHeight]="myGetRowHeight"
|
|    // register events
|    (cellClicked)="onCellClicked($event)"
|    (columnResized)="onColumnEvent($event)">
| </ag-grid-angular>
| ```
|
| ## Access the Grid & Column API
|
| When the grid is initialised, it will fire the `gridReady` event. If you want to use the APIs of
| the grid, you can put an `onGridReady(params)` callback onto the grid and grab the api(s)
| from the params. Alternatively, you can retrieve the grid component with a `@ViewChild` attribute from within your component.
| 
| You can then call these apis at a later stage to interact with the
| grid (on top of the interaction that can be done by setting and changing the properties).
|
| ```jsx
| <ag-grid-angular
|    #myGrid // assign an angular ID to the grid - optional
|
|    // provide gridReady callback to the grid
|    (gridReady)="onGridReady($event)"
|    // ...
| />
|
| // in onGridReady, store the api for later use
| onGridReady = (params) => {
|     this.api = params.api;
|     this.columnApi = params.columnApi;
| }
| ```
|
| ```ts
| @ViewChild('myGrid') grid!: AgGridAngular;
|
| // Then later access api
| this.grid.api.deselectRows();
| ```
|
| The APIs are also accessible through the component. For example in the snippet above the Grid is give the ID of `'#myGrid'` which then allows the API to be accessed as follows:
|
| ```jsx
| <button (click)="myGrid.api.deselectAll()">Clear Selection</button>
| ```
| ## Grid Options
|
| The `gridOptions` object is a 'one stop shop' for the entire interface into the grid and can be used instead of, or in addition to, the component bindings. If an option is set via `gridOptions`, as well as directly on the component, then the component value will take precedence.
|
| The GridOptions interface supports a generic parameter for row data as detailed in [Typescript Generics](/typescript-generics).
|
| The example below shows the different types of items available on `gridOptions`.
|
| ```js
| const gridOptions : GridOptions = {
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
| <ag-grid-angular
|     [gridOptions]="gridOptions"
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
