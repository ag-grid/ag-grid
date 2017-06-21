var gridOptions = {
    columnDefs: [
        {headerName: "Athlete", field: "athlete",  minWidth: 150},
        {headerName: "Age", field: "age", minWidth: 50, filter: 'number'},
        {headerName: "Country", field: "country", width: 120},
        {headerName: "Year", field: "year", width: 90},
        {headerName: "Date", field: "date", width: 110},
        {headerName: "Sport", field: "sport", width: 110},
        {headerName: "Gold", field: "gold", width: 150, aggFunc: 'sum'},
        {headerName: "Silver", field: "silver", width: 150, aggFunc: 'sum'},
        {headerName: "Bronze", field: "bronze", width: 150, aggFunc: 'sum'}
    ],

    enableColResize: true,
    floatingFilter: true,
    pivotTotals: true, <!-- turns on pivot total columns when pivot mode is enabled -->

    onGridReady: function () {
        initialise();
    }
};

var pivotingOn = true;
var groupOn = true;

function initialise() {
    gridOptions.api.sizeColumnsToFit();
    gridOptions.columnApi.setPivotMode(true);
    gridOptions.columnApi.setRowGroupColumns(['country']);
    gridOptions.columnApi.setPivotColumns(['sport', 'year']);
}

function pivot() {
    var pivotBtn = document.getElementById('pivotBtn');

    if(pivotingOn) {
        pivotBtn.innerHTML = 'Pivot';
        gridOptions.columnApi.setPivotMode(false);
    } else {
        pivotBtn.innerHTML = 'Unpivot';
        gridOptions.columnApi.setPivotMode(true);
    }

    pivotBtn.blur();
    pivotingOn = !pivotingOn;
}

function group() {
    var groupBtn = document.getElementById('groupBtn');

    if(groupOn) {
        groupBtn.innerHTML = 'Group';
        gridOptions.columnApi.setRowGroupColumns([]);
    } else {
        groupBtn.innerHTML = 'Ungroup';
        gridOptions.columnApi.setRowGroupColumns(['country']);
    }

    groupBtn.blur();
    groupOn = !groupOn;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', '../olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});