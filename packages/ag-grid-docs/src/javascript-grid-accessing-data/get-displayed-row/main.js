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
    console.log('getDisplayedRowAtIndex(0) => ' + this.nodeToString(rowNode));
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

// inScope[nodeToString]
function nodeToString(rowNode) {
    return rowNode.data.athlete + ' ' + rowNode.data.year;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json'}).then(function(data) {
        gridOptions.api.setRowData(data.slice(0, 100));
    });
});