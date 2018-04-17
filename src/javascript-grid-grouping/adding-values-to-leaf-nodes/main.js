var columnDefs = [
    {headerName: "Sport", field: "sport", width: 110},
    {headerName: "Gold", field: "gold", width: 100},
    {headerName: "Silver", field: "silver", width: 100},
    {headerName: "Bronze", field: "bronze", width: 100},
    {headerName: "Total", field: "total", width: 100},
    {headerName: "Age", field: "age", width: 90},
    {headerName: "Date", field: "date", width: 110},

    {field: "country", rowGroup:true, hide:true},
    {field: "year", rowGroup:true, hide:true}
];

var gridOptions = {
    enableColResize: true,
    columnDefs: columnDefs,
    animateRows: true,
    enableRangeSelection: true,
    rowData: null,
    enableSorting:true,
    enableFilter:true,
    autoGroupColumnDef: {
        headerName:'Group',
        field: 'athlete'
    }
};

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
            gridOptions.api.setRowData(httpResult);
        }
    };
});
