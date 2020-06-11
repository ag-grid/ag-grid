var gridOptions = {
    columnDefs: [
        { field: "country", rowGroup: true, enableRowGroup: true },
        { field: "athlete" },
        { field: "sport", pivot: true, enablePivot: true },
        // { field: "year", pivot: true, enablePivot: true },
        // { field: "age", pivot: true },
        { field: "gold", aggFunc: 'sum' },
        { field: "silver", aggFunc: 'sum' },
        { field: "bronze", aggFunc: 'sum' }
    ],
    defaultColDef: {
        // flex: 1,
        // maxWidth: 140,
        filter: true,
        resizable: true,
    },
    autoGroupColumnDef: {
        minWidth: 150,
    },
    pivotMode: true,
    sideBar: true,
    pivotColumnGroupTotals: 'before',
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
