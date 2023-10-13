<framework-specific-section frameworks="angular">
|
| ## Properties, Events, Callbacks and APIs
|
| - **Properties**: properties are bound via @Inputs (e.g. `[columnDefs]="columnDefs"`).
| - **Attributes**: attributes are properties that also accept literal values (e.g. `rowSelection="multiple"`).
| - **Callbacks**: callbacks are bound via @Inputs like properties (e.g. `[getRowHeight]="myGetRowHeight"`).
| - **Event Handlers**: event handlers are are bound via @Outputs (e.g. `(cellClicked)="onCellClicked($event)"`).
| - **API**: the grid api is accessible through the component.
|
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
| &lt;ag-grid-angular
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
| &lt;/ag-grid-angular>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| ## Access the Grid API
|
| When the grid is initialised, it will fire the `gridReady` event. If you want to use the `api` of
| the grid, you can put an `onGridReady(params)` callback onto the grid and grab the api(s)
| from the params. 
|
| Alternatively, you can retrieve the grid component with a `@ViewChild` attribute from within your component. This will be defined after `ngAfterViewInit` has run.
|
| You can then call the api at a later stage to interact with the
| grid (on top of the interaction that can be done by setting and changing the properties).
|
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
| &lt;ag-grid-angular
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
| }
|
| // Reference grid to access api
| @ViewChild('myGrid') grid!: AgGridAngular;
|
| // Then later access api
| this.grid.api.deselectRows();
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| The api is also accessible within the component template. In the snippet above the Grid is given the ID of `'#myGrid'` which allows the API to be accessed as follows:
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
| &lt;button (click)="myGrid.api.deselectAll()">Clear Selection&lt;/button>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| ## Grid Options
|
| The `gridOptions` object is a 'one stop shop' for the entire interface into the grid and can be used instead of, or in addition to, the component bindings. If an option is set via `gridOptions`, as well as directly on the component, then the component value will take precedence.
|
| The GridOptions interface supports a generic parameter for row data as detailed in [Typescript Generics](/typescript-generics).
|
| The example below shows the different types of items available on `gridOptions`.
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
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
|
| &lt;ag-grid-angular
|     [gridOptions]="gridOptions"
</snippet>
</framework-specific-section>