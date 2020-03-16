var columnDefs = [
    { field: "country", rowGroup: true, hide: true },
    {
        field: "gold",
        aggFunc: 'sum',
        enableValue: true,
        allowedAggFuncs: ['sum','min','max']
    },
    { field: "silver", aggFunc: 'min', enableValue: true},
    { field: "bronze", aggFunc: 'max', enableValue: true},
    { field: "total", aggFunc: 'avg', enableValue: true, minWidth: 200},
    { field: "age" },
    { field: "year" },
    { field: "date" },
    { field: "sport" }
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        filter: true,
        sortable: true,
        resizable: true,
    },
    autoGroupColumnDef: {headerName: "Athlete",
        field: "athlete",
        minWidth: 250,
        cellRenderer:'agGroupCellRenderer',
        cellRendererParams: {
            footerValueGetter: '"Total (" + x + ")"'
        }
    },
    groupIncludeFooter: true,
    sideBar: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
