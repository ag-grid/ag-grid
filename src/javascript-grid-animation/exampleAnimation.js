var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150},
    {headerName: "Age", field: "age", width: 90},
    {headerName: "Country", field: "country", width: 120},
    {headerName: "Year", field: "year", width: 90},
    {headerName: "Date", field: "date", width: 110},
    {headerName: "Sport", field: "sport", width: 110},
    {headerName: "Gold", field: "gold", width: 100, aggFunc: 'sum'},
    {headerName: "Silver", field: "silver", width: 100, aggFunc: 'sum'},
    {headerName: "Bronze", field: "bronze", width: 100, aggFunc: 'sum'},
    {headerName: "Total", field: "total", width: 100, aggFunc: 'sum'}
];

var gridOptions = {
    columnDefs: columnDefs,
    enableRangeSelection: true,
    enableSorting: true,
    enableFilter: true,
    animateSort: true,
    animateFilter: true,
    animateRowExpand: true,
    suppressAggFuncInHeader: true, // so we don't see sum() in gold, silver and bronze headers
    groupColumnDef: { // to get 'athlete' showing in the leaf level in this column
        cellRenderer: 'group',
        headerName: 'Athlete',
        field: 'athlete'
    }
};

// the code below executes and action every 2,000 milliseconds.
// it's an interval, and each time it runs, it takes the next action
// from the 'actions' list below
var actionIndex = 0;
setInterval( function() {
    var action = actions[actionIndex];
    action();
    actionIndex++;
    if (actionIndex >= actions.length) {
        actionIndex = 0;
    }
}, 2000);

var actions = [
    function() {
        gridOptions.api.setSortModel([{colId: 'country', sort: 'asc'}]);
    },
    function() {
        gridOptions.api.setSortModel([{colId: 'country', sort: 'asc'},{colId: 'year', sort: 'asc'}]);
    },
    function() {
        gridOptions.api.setSortModel([{colId: 'country', sort: 'asc'},{colId: 'year', sort: 'desc'}]);
    },
    function() {
        gridOptions.api.setSortModel([{colId: 'country', sort: 'asc'}]);
    },
    function() {
        gridOptions.api.setSortModel([]);
        gridOptions.api.setFilterModel({country: ['Ireland']});
    },
    function() {
        gridOptions.api.setSortModel([{colId: 'year', sort: 'asc'}]);
    },
    function() {
        gridOptions.api.setSortModel([{colId: 'year', sort: 'desc'}]);
    },
    function() {
        gridOptions.api.setSortModel([]);
        gridOptions.api.setFilterModel({});
    },
    function() {
        gridOptions.columnApi.setRowGroupColumns(['country','year','sport']);
        gridOptions.columnApi.setColumnVisible('athlete', false);
        gridOptions.api.sizeColumnsToFit();
    },
    function() {
        var topLevelNodes = gridOptions.api.getModel().getTopLevelNodes();
        topLevelNodes[2].setExpanded(true);
    },
    function() {
        var topLevelNodes = gridOptions.api.getModel().getTopLevelNodes();
        topLevelNodes[2].childrenAfterSort[1].setExpanded(true);
    },
    function() {
        var topLevelNodes = gridOptions.api.getModel().getTopLevelNodes();
        topLevelNodes[2].childrenAfterSort[1].childrenAfterSort[0].setExpanded(true);
    },
    function() {
        var topLevelNodes = gridOptions.api.getModel().getTopLevelNodes();
        topLevelNodes[2].childrenAfterSort[1].setExpanded(false);
    },
    function() {
        gridOptions.columnApi.setRowGroupColumns([]);
        gridOptions.columnApi.setColumnVisible('athlete', true);
        gridOptions.api.sizeColumnsToFit();
    }
];

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', '../olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
            gridOptions.api.sizeColumnsToFit();
        }
    };
});