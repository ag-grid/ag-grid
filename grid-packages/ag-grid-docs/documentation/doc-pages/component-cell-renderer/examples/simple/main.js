const columnDefs = [
    {field: 'athlete'},
    {field: 'year'},
    {field: 'gold', cellRenderer: 'medalCellRenderer'},
    {field: 'silver', cellRenderer: 'medalCellRenderer'},
    {field: 'bronze', cellRenderer: 'medalCellRenderer'},
    {field: 'total', minWidth: 175, cellRenderer: 'totalValueRenderer'}
];

const gridOptions = {
    columnDefs: columnDefs,
    components: {
        'medalCellRenderer': MedalCellRenderer,
        'totalValueRenderer': TotalValueRenderer
    },
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(data => {
            gridOptions.api.setRowData(data);
        });
});
