var columnDefs = [
    { field: 'athlete' },
    { field: 'country' },
    { field: 'year', width: 100 },
    { field: 'gold', width: 100, cellRenderer: 'medalCellRenderer' },
    { field: 'silver', width: 100, cellRenderer: 'medalCellRenderer' },
    { field: 'bronze', width: 100, cellRenderer: 'medalCellRenderer' },
    { field: 'total', width: 100 }
];

var gridOptions = {
    columnDefs: columnDefs,
    components: {
        'medalCellRenderer': MedalCellRenderer
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
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://www.ag-grid.com/example-assets/olympic-winners.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
