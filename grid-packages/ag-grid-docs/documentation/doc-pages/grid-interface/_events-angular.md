<framework-specific-section frameworks="angular">
| To listen to an event pass your event handler to the relevant `Output` property on the `ag-grid-angular` component. 
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="html">
|onCellClicked(event: CellClickedEvent) {
|   console.log("Cell was clicked")   
|}
|
| &lt;ag-grid-angular (cellClicked)="onCellClicked($event)">
</snippet>
</framework-specific-section>