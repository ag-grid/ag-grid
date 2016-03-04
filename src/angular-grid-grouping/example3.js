var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 200,
        comparator: agGrid.defaultGroupComparator,
        cellRenderer: {
            renderer: 'group'
        }
    },
    {headerName: "Gold", field: "gold", width: 100},
    {headerName: "Silver", field: "silver", width: 100},
    {headerName: "Bronze", field: "bronze", width: 100},
    {headerName: "Total", field: "total", width: 100},
    {headerName: "Age", field: "age", width: 90},
    {headerName: "Country", field: "country", width: 120, rowGroupIndex: 0},
    {headerName: "Year", field: "year", width: 90, rowGroupIndex: 1},
    {headerName: "Date", field: "date", width: 110},
    {headerName: "Sport", field: "sport", width: 110}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    groupUseEntireRow: false,
    enableSorting: true,
    groupAggFunction: groupAggFunction,
    groupSuppressAutoColumn: true
};

function groupAggFunction(rows) {

    var sums = {
        gold: 0,
        silver: 0,
        bronze: 0,
        total: 0
    };

    rows.forEach(function(row) {

        var data = row.data;

        sums.gold += data.gold;
        sums.silver += data.silver;
        sums.bronze += data.bronze;
        sums.total += data.total;

    });

    return sums;
}

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
        }
    };
});
