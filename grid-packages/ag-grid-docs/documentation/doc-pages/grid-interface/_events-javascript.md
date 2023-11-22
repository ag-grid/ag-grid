<framework-specific-section frameworks="javascript">
|
| The `gridOptions` object is used to configure grid event handlers.
|
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
| const gridOptions = {
|
|     // Add event handlers
|     onRowClicked: event => console.log('A row was clicked'),
|     onColumnResized: event => console.log('A column was resized'),
|     onGridReady: event => console.log('The grid is now ready'),
| }
|
| // Pass gridOptions to createGrid to build a new Grid
| const api = createGrid(gridDiv, gridOptions)
</snippet>
</framework-specific-section>
