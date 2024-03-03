<framework-specific-section frameworks="javascript">
|
| You can access the grid api by storing a reference to the `api` as returned from `createGrid`.
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
| // create the grid
| const api = createGrid(div, gridOptions);
|
| // Call an api method
| const cell = api.getFocusedCell(); 
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
| ### API within Events and Callbacks
|
| Alternatively all Grid [callbacks](/grid-options/) and [events](/grid-events/) include the `api` as part of their arguments.
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
| const gridOptions: GridOptions = {
|    onGridReady: (event: GridReadyEvent) {
|       // use api from event
|       event.api.ensureIndexVisible(10);
|    }
| }
</snippet>
</framework-specific-section>