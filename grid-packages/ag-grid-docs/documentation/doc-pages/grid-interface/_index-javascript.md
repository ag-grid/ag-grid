<framework-specific-section frameworks="javascript">
| The `gridOptions` object is used to configure the grid. The example below shows the different types of items available on `gridOptions`.
|
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
| const gridOptions = {
|     // PROPERTIES
|     columnDefs: myColDefs,
|     pagination: true,
|
|     // EVENTS
|     onRowClicked: event => console.log('A row was clicked'),
|
|     // CALLBACKS
|     getRowHeight: (params) => 25
| }
|
| // Pass gridOptions to createGrid
| const api = createGrid(gridDiv, gridOptions)
</snippet>
</framework-specific-section>
