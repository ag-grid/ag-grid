var columnDefs = [
    { field: "country", rowGroup: true, hide: true },
    { field: "year", filter: 'agNumberColumnFilter' },
    { field: "gold", aggFunc: 'sum' },
    { field: "silver", aggFunc: 'sum' },
    { field: "bronze", aggFunc: 'sum' },
    { field: "total", aggFunc: 'sum' }
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        resizable: true
    },
    autoGroupColumnDef: {
        headerName: "Country",
        field: "athlete"
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
