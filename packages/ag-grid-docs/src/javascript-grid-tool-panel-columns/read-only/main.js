var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150, enableRowGroup: true, enablePivot: true},
    {headerName: "Age", field: "age", width: 90, enableValue: true},
    {headerName: "Country", field: "country", width: 120, enableRowGroup: true, enablePivot: true, rowGroupIndex: 1},
    {headerName: "Year", field: "year", width: 90, enableRowGroup: true, enablePivot: true, pivotIndex: 1},
    {headerName: "Date", field: "date", width: 110, enableRowGroup: true, enablePivot: true},
    {headerName: "Sport", field: "sport", width: 110, enableRowGroup: true, enablePivot: true, rowGroupIndex: 2},
    {headerName: "Gold", field: "gold", width: 100, hide: true, enableValue: true},
    {headerName: "Silver", field: "silver", width: 100, hide: true, enableValue: true, aggFunc: 'sum'},
    {headerName: "Bronze", field: "bronze", width: 100, hide: true, enableValue: true, aggFunc: 'sum'},
    {headerName: "Total", field: "totalAgg", valueGetter: "node.group ? data.totalAgg : data.gold + data.silver + data.bronze", width: 100}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    pivotMode: true,
    enableSorting: true,
    sideBar: 'columns',
    rowGroupPanelShow: 'always',
    pivotPanelShow: 'always',
    functionsReadOnly: true
};

function setReadOnly() {
    gridOptions.api.setFunctionsReadOnly(document.getElementById('read-only').checked);
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
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});