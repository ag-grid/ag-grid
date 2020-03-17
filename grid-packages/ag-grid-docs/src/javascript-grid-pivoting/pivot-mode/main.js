var gridOptions = {
    columnDefs: [
        { field: "country", rowGroup: true, enableRowGroup: true },
        { field: "year", rowGroup: true, enableRowGroup: true, enablePivot: true },
        { field: "date" },
        { field: "sport" },
        { field: "gold", aggFunc: 'sum' },
        { field: "silver", aggFunc: 'sum' },
        { field: "bronze", aggFunc: 'sum' }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        sortable: true,
        resizable: true
    },
    autoGroupColumnDef: {
        minWidth: 250,
    },
    sideBar: 'columns',
};

function onBtNormal() {
    gridOptions.columnApi.setPivotMode(false);
    gridOptions.columnApi.setPivotColumns([]);
    gridOptions.columnApi.setRowGroupColumns(['country','year']);
}

function onBtPivotMode() {
    gridOptions.columnApi.setPivotMode(true);
    gridOptions.columnApi.setPivotColumns([]);
    gridOptions.columnApi.setRowGroupColumns(['country','year']);
}

function onBtFullPivot() {
    gridOptions.columnApi.setPivotMode(true);
    gridOptions.columnApi.setPivotColumns(['year']);
    gridOptions.columnApi.setRowGroupColumns(['country']);
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
