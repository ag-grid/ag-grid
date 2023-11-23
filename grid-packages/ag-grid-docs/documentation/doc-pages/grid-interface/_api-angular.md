<framework-specific-section frameworks="angular">
|
| The api can be accessed from the `AgGridAngular` component via a `@ViewChild` decorator from within your component. This will be defined after `ngAfterViewInit` has run.
|
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
| // Add a template reference to the grid
| &lt;ag-grid-angular #myGrid  />
|
| // Select grid via template reference
| @ViewChild('myGrid') grid!: AgGridAngular;
|
| // Access the api off the grid
| onClick() { this.grid.api.deselectRows() }
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
|
| The `api` is also provided on the params for all grid events and callbacks. The first event fired is the `gridReady` event and that can be used to store a reference to the api.
|
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
| &lt;ag-grid-angular (gridReady)="onGridReady($event)" />
|
| private api!: GridApi;
| onGridReady = (event: GridReadyEvent) => {
|     // Store the api for later use
|     this.api = event.api;
| }
</snippet>
</framework-specific-section>