<framework-specific-section frameworks="javascript">
| ## Grid Options
|
| The `gridOptions` object is used to configure the grid. The GridOptions interface supports a generic parameter for row data as detailed in [Typescript Generics](/typescript-generics).
|
| The example below shows the different types of items available on `gridOptions`.
|
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
| const gridOptions = {
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
| // Pass gridOptions to createGrid to build a new Grid
| const api = createGrid(gridDiv, gridOptions)
</snippet>
</framework-specific-section>
