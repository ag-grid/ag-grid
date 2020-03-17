var columnDefs = [
    {
        field: "athlete",
        minWidth: 200,
        enableRowGroup: true,
        enablePivot: true
    },
    {
        field: "age",
        enableValue: true
    },
    {
        field: "country",
        minWidth: 200,
        enableRowGroup: true,
        enablePivot: true,
        rowGroupIndex: 1
    },
    {
        field: "year",
        enableRowGroup: true,
        enablePivot: true,
        pivotIndex: 1
    },
    {
        field: "date",
        minWidth: 180,
        enableRowGroup: true,
        enablePivot: true
    },
    {
        field: "sport",
        minWidth: 200,
        enableRowGroup: true,
        enablePivot: true,
        rowGroupIndex: 2
    },
    {
        field: "gold",
        hide: true,
        enableValue: true
    },
    {
        field: "silver",
        hide: true,
        enableValue: true,
        aggFunc: 'sum'
    },
    {
        field: "bronze",
        hide: true,
        enableValue: true,
        aggFunc: 'sum'
    },
    {
        headerName: "Total",
        field: "totalAgg",
        valueGetter: "node.group ? data.totalAgg : data.gold + data.silver + data.bronze",
    }
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        sortable: true,
        resizable: true,
    },
    autoGroupColumnDef: {
        minWidth: 250,
    },
    pivotMode: true,
    sideBar: 'columns',
    rowGroupPanelShow: 'always',
    pivotPanelShow: 'always',
    functionsReadOnly: false
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
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
