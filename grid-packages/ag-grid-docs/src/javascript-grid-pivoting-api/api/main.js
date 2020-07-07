var gridOptions = {
    columnDefs: [
        { field: 'athlete', enableRowGroup: true, enablePivot: true, minWidth: 200 },
        { field: 'age', enableValue: true },
        { field: 'country', enableRowGroup: true, enablePivot: true },
        { field: 'year', enableRowGroup: true, enablePivot: true },
        { field: 'date', enableRowGroup: true, enablePivot: true },
        { field: 'sport', enableRowGroup: true, enablePivot: true, minWidth: 200 },
        { field: 'gold', enableValue: true, aggFunc: 'sum' },
        { field: 'silver', enableValue: true },
        { field: 'bronze', enableValue: true },
        { field: 'total', enableValue: true }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        filter: true,
        resizable: true
    },
    autoGroupColumnDef: {
        minWidth: 250,
    },
    sideBar: true,
};
function turnOffPivotMode() {
    gridOptions.columnApi.setPivotMode(false);
}
function turnOnPivotMode() {
    gridOptions.columnApi.setPivotMode(true);
}
function addPivotColumn() {
    gridOptions.columnApi.addPivotColumn('country');
}
function addPivotColumns() {
    gridOptions.columnApi.addPivotColumns(['year', 'country']);
}
function removePivotColumn() {
    gridOptions.columnApi.removePivotColumn('country');
}
function emptyPivotColumns() {
    gridOptions.columnApi.setPivotColumns([]);
}
function exportToCsv() {
    gridOptions.api.exportDataAsCsv({
        columnGroups: true
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
