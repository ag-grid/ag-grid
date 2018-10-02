var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150, enableRowGroup: true, enablePivot: true},
    {headerName: "Age", field: "age", width: 90, enableValue: true},
    {headerName: "Country", field: "country", width: 120, enableRowGroup: true, enablePivot: true},
    {headerName: "Year", field: "year", width: 90, enableRowGroup: true, enablePivot: true},
    {headerName: "Date", field: "date", width: 110, enableRowGroup: true, enablePivot: true},
    {headerName: "Sport", field: "sport", width: 110, enableRowGroup: true, enablePivot: true, pivot: true},
    {headerName: "Gold", field: "gold", width: 100, enableValue: true},
    {headerName: "Silver", field: "silver", width: 100, enableValue: true},
    {headerName: "Bronze", field: "bronze", width: 100, enableValue: true},
    {headerName: "Total", field: "total", width: 100, enableValue: true}
];

var gridOptions = {
    // set rowData to null or undefined to show loading panel by default
    showToolPanel: true,
    enableColResize: true,
    columnDefs: columnDefs,
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
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});