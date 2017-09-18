var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150},
    {headerName: "Age", field: "age", width: 90},
    {headerName: "Country", field: "country", width: 120, rowGroup: true, hide: true},
    {headerName: "Year", field: "year", width: 90},
    {headerName: "Date", field: "date", width: 110},
    {headerName: "Sport", field: "sport", width: 110, rowGroup: true, hide: true},
    {headerName: "Gold", field: "gold", width: 100},
    {headerName: "Silver", field: "silver", width: 100},
    {headerName: "Bronze", field: "bronze", width: 100},
    {headerName: "Total", field: "total", width: 100}
];

var gridOptions = {
    columnDefs: columnDefs,
    enableSorting: true,
    rememberGroupStateWhenNewData: true,
    rowData: null,
    onGridReady: function(params) {
        params.api.setSortModel([
            {colId: 'ag-Grid-AutoColumn', sort: 'asc'}
        ]);
    }
};

var allRowData;
var pickingEvenRows = false;

function refreshData() {
    // in case user hits the 'refresh groups' data before the data was loaded
    if (!allRowData) {
        return;
    }

    // pull out half the data, different half to the last time
    var dataThisTime = [];
    allRowData.forEach( function(item, index) {
        var rowIsEven = index % 2 === 0;
        if ( (pickingEvenRows && rowIsEven) || (!pickingEvenRows && !rowIsEven) ) {
            dataThisTime.push(item);
        }
    });

    gridOptions.api.setRowData(dataThisTime);

    pickingEvenRows = !pickingEvenRows;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/olympicWinnersSmall.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            allRowData = httpResult;
            refreshData();
        }
    };
});