var gridOptions = {
    columnDefs: [
        { field: 'country', rowGroupIndex: 1, hide: true },
        { field: 'year', rowGroupIndex: 0, hide: true },
        { field: 'sport', },
        { field: 'athlete' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        sortable: true,
        resizable: true,
    },
    autoGroupColumnDef: {
        minWidth: 250,
    },
    groupDisplayType: 'multipleColumns',
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
