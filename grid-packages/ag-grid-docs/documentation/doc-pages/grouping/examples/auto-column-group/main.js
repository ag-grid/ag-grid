var gridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true },
        { field: 'year', rowGroup: true },
        { field: 'sport' },
        { field: 'athlete' },
        { field: 'total' }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
        sortable: true,
        resizable: true,
    },
    autoGroupColumnDef: {
        minWidth: 200,
    },
    enableRangeSelection: true,
    animateRows: true,
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
