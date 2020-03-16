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

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
