<framework-specific-section frameworks="angular">
|
| All grid events have corresponding Outputs on the `ag-grid-angular` component which fire as required with the relevant parameters.
|
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
| &lt;ag-grid-angular
|    // Register an event handler
|    (cellClicked)="onCellClicked($event)">
| &lt;/ag-grid-angular>
</snippet>
</framework-specific-section>