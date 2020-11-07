var gridOptions = {
    columnDefs: [
        { field: "athlete", minWidth: 200, filter: 'agTextColumnFilter' },
        { field: "age" },
        { field: "country", minWidth: 200 },
        { field: "year" },
        { field: "date", minWidth: 180 },
        { field: "gold", filter: false },
        { field: "silver", filter: false },
        { field: "bronze", filter: false },
        { field: "total", filter: false }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true
    },
    sideBar: 'filters'
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
