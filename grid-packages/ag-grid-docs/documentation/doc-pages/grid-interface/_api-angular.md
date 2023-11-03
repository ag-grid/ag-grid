<framework-specific-section frameworks="angular">
|
| The api can be accessed from the `AgGridAngular` component via a `@ViewChild` decorator from within your component. This will be defined after `ngAfterViewInit` has run.
|
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
| &lt;ag-grid-angular
|    #myGrid // assign a template reference
|    // ...
| />
|
| // Select grid via template reference
| @ViewChild('myGrid') grid!: AgGridAngular;
|
| onClick() {
|    // Use the api
|    this.grid.api.deselectRows();
| }
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| ### API within Events and Callbacks
|
| The `api` is also provided on the params for all grid events and callbacks.
|
| The first event fired is the `gridReady` event and that can be used to store a reference to the api within your component as an alternative to using a `ViewChild`.
|
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
| &lt;ag-grid-angular
|    // provide gridReady callback to the grid
|    (gridReady)="onGridReady($event)"
|    // ...
| />
|
| private api!: GridApi;
|
| // in onGridReady, store the api for later use
| onGridReady = (event: GridReadyEvent) => {
|     this.api = event.api;
| }
|
| onClick() {
|    // Use the api
|    this.api.deselectRows();
| }
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| The api is also accessible within the component template. If the Grid is given the template reference of `'#myGrid'` the api can be accessed as follows:
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
| &lt;button (click)="myGrid.api.deselectAll()">Clear Selection&lt;/button>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| ## Grid Options
|
| The `gridOptions` object can be used instead of, or in addition to, the component bindings. If an option is set via `gridOptions`, as well as directly on the component, then the component value will take precedence.
|
| The GridOptions interface supports a generic parameter for row data as detailed in [Typescript Generics](/typescript-generics).
|
| The example below shows the different types of items available on `gridOptions`.
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
| const gridOptions : GridOptions = {
|     // PROPERTIES
|     pagination: true,
|     rowSelection: 'single',
|
|     // EVENTS
|     // Add event handlers
|     onRowClicked: event => console.log('A row was clicked'),
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