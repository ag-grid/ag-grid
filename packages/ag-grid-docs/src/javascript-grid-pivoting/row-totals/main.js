var gridOptions = {
    defaultColDef: {
        resizable: true,
        filter: true,
        width: 100
    },
    columnDefs: [
        {headerName: "Athlete", field: "athlete", enablePivot:true, enableRowGroup:true},
        {headerName: "Country", field: "country", rowGroup: true, enableRowGroup:true},
        {headerName: "Sport", field: "sport", rowGroup: true, enablePivot:true, enableRowGroup:true},
        {headerName: "Year", field: "year", pivot: true, enablePivot:true},
        {headerName: "Age", field: "age", filter: 'agNumberColumnFilter', enablePivot:true, enableRowGroup:true},
        {headerName: "Date", field: "date"},
        {headerName: "Gold", field: "gold", aggFunc: 'sum'},
        {headerName: "Silver", field: "silver", aggFunc: 'sum'},
        {headerName: "Bronze", field: "bronze", aggFunc: 'sum'}
    ],
    pivotMode: true,
    rowGroupPanelShow: 'always',
    pivotPanelShow: 'always',
    pivotColumnGroupTotals: 'after',
    pivotRowTotals: 'before',
    onFirstDataRendered(params) {
    },
    autoGroupColumnDef: {
      width: 200
    },
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