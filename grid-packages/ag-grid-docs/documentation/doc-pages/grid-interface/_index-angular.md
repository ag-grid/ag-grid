<framework-specific-section frameworks="angular">
|
| All properties and callbacks are passed into the `ag-grid-angular` component as `Inputs`.
|
| ### Initial Only 
|
| TODO: Explain initial only vs reactive
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
| &lt;ag-grid-angular
|    // Bind property / callback to component
|    [columnDefs]="columnDefs"
|    [getRowHeight]="myGetRowHeight"
|
|    // Register event handler
|    (cellClicked)="onCellClicked($event)">
| &lt;/ag-grid-angular>
</snippet>
</framework-specific-section>