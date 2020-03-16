var gridOptions = {
    columnDefs: [
        { field: "athlete", enableRowGroup: true, enablePivot: true },
        { field: "age", enableValue: true },
        { field: "country", enableRowGroup: true, enablePivot: true },
        { field: "year", enableRowGroup: true, enablePivot: true },
        { field: "date", enableRowGroup: true, enablePivot: true },
        { field: "sport", enableRowGroup: true, enablePivot: true, pivot: true },
        { field: "gold", enableValue: true },
        { field: "silver", enableValue: true },
        { field: "bronze", enableValue: true },
        { field: "total", enableValue: true }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        filter: true,
        resizable: true
    },
    autoGroupColumnDef: {
        minWidth: 300,
    },
    sideBar: true,
};

var savedState;
var savedPivotMode;

function printState() {
    var state = gridOptions.columnApi.getColumnState();
    console.log(state);
}

function saveState() {
    savedState = gridOptions.columnApi.getColumnState();
    savedPivotMode = gridOptions.columnApi.isPivotMode();
    console.log('column state saved');
}

function restoreState() {
    if (savedState) {
      gridOptions.columnApi.setColumnState(savedState);
      gridOptions.columnApi.setPivotMode(savedPivotMode);
      console.log('column state restored');
    } else {
      console.log('no previous column state to restore!');
    }
}

function togglePivotMode() {
    var pivotMode = gridOptions.columnApi.isPivotMode();
    gridOptions.columnApi.setPivotMode(!pivotMode);
}

function resetState() {
    gridOptions.columnApi.resetColumnState();
    gridOptions.columnApi.setPivotMode(false);
    console.log('column state reset');
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
