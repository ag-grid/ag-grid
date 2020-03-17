var gridOptions = {
    columnDefs: [
        { field: "country", rowGroup: true, enableRowGroup: true },
        { field: "year", pivot: true, enablePivot: true },
        { field: "gold", aggFunc: 'sum' },
        { field: "silver", aggFunc: 'sum' },
        { field: "bronze", aggFunc: 'sum' }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        filter: true,
        sortable: true,
        resizable: true
    },
    autoGroupColumnDef: {
        minWidth: 250,
    },
    pivotMode: true,
    sideBar: true,
    suppressAggFuncInHeader: true,
};

function clearSort() {
    gridOptions.api.setSortModel({});
}

function sort2000Bronze() {
    var column = gridOptions.columnApi.getSecondaryPivotColumn(['2000'], 'bronze');
    var sort = [{colId: column.getId(), sort: 'desc'}];
    gridOptions.api.setSortModel(sort);
}

function sort2002Gold() {
    var column = gridOptions.columnApi.getSecondaryPivotColumn(['2002'], 'gold');
    var sort = [{colId: column.getId(), sort: 'desc'}];
    gridOptions.api.setSortModel(sort);
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
