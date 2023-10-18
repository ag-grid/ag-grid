<framework-specific-section frameworks="angular">
|
| When the grid is initialised, it will fire the `gridReady` event. If you want to use the `api` of
| the grid, you can put an `onGridReady(params)` callback onto the grid and grab the api(s)
| from the params. 
|
| Alternatively, you can retrieve the grid component with a `@ViewChild` attribute from within your component. This will be defined after `ngAfterViewInit` has run.
|
| You can then call the api at a later stage to interact with the grid.
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