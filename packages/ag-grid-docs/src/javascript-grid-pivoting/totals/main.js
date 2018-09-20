var gridOptions = {
    columnDefs: [
        {headerName: "Athlete", field: "athlete",  minWidth: 150},
        {headerName: "Age", field: "age", minWidth: 50, filter: 'agNumberColumnFilter'},
        {headerName: "Country", field: "country", width: 120, rowGroup: true, enableRowGroup:true},
        {headerName: "Sport", field: "sport", width: 110, pivot: true, enablePivot:true},
        {headerName: "Year", field: "year", width: 90, pivot: true, enablePivot:true},
        {headerName: "Date", field: "date", width: 110},
        {headerName: "Gold", field: "gold", width: 150, aggFunc: 'sum'},
        {headerName: "Silver", field: "silver", width: 150, aggFunc: 'sum'},
        {headerName: "Bronze", field: "bronze", width: 150, aggFunc: 'sum'}
    ],

    enableColResize: true,
    pivotMode: true,
    pivotColumnGroupTotals: 'before',
    sideBar: true,
};


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});