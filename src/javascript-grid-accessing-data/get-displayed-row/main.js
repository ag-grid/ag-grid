var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150},
    {headerName: "Age", field: "age", width: 90},
    {headerName: "Country", field: "country", width: 120},
    {headerName: "Group", valueGetter: "data.country.charAt(0)", width: 120},
    {headerName: "Year", field: "year", width: 90},
    {headerName: "Date", field: "date", width: 110},
    {headerName: "Sport", field: "sport", width: 110},
    {headerName: "Gold", field: "gold", width: 100},
    {headerName: "Silver", field: "silver", width: 100},
    {headerName: "Bronze", field: "bronze", width: 100},
    {headerName: "Total", field: "total", width: 100}
];

var gridOptions = {
    columnDefs: columnDefs,
    pagination: true,
    paginationAutoPageSize: true,
    enableFilter: true,
    enableSorting: true
};

function getDisplayedRowAtIndex() {
    var rowNode = gridOptions.api.getDisplayedRowAtIndex(0);
    console.log('getDisplayedRowAtIndex(0) => ' + nodeToString(rowNode));
}

function getDisplayedRowCount() {
    var count = gridOptions.api.getDisplayedRowCount();
    console.log('getDisplayedRowCount() => ' + count);
}

function printAllDisplayedRows() {
    var count = gridOptions.api.getDisplayedRowCount();
    console.log('## printAllDisplayedRows');
    for (var i = 0; i<count; i++) {
        var rowNode = gridOptions.api.getDisplayedRowAtIndex(i);
        console.log('row ' + i + ' is ' + rowNode.data.athlete);
    }
}

function printPageDisplayedRows() {
    var rowCount = gridOptions.api.getDisplayedRowCount();
    var lastGridIndex = rowCount - 1;
    var currentPage = gridOptions.api.paginationGetCurrentPage();
    var pageSize = gridOptions.api.paginationGetPageSize();
    var startPageIndex = currentPage * pageSize;
    var endPageIndex = ((currentPage + 1) * pageSize) - 1;

    if (endPageIndex > lastGridIndex) {
        endPageIndex = lastGridIndex;
    }

    console.log('## printPageDisplayedRows');
    for (var i = startPageIndex; i<=endPageIndex; i++) {
        var rowNode = gridOptions.api.getDisplayedRowAtIndex(i);
        console.log('row ' + i + ' is ' + rowNode.data.athlete);
    }
}

function nodeToString(rowNode) {
    return rowNode.data.athlete + ' ' + rowNode.data.year;
}

// do http request to get our sample data - not using any framework to keep the example self contained.
// you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
function fetchData(url, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', url);
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            callback(httpResult);
        }
    };
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetchData( 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/olympicWinnersSmall.json', function(data) {
        gridOptions.api.setRowData(data.slice(0, 100));
    })
});