var thisYear = new Date().getFullYear();

var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150},
    {headerName: "Age", field: "age", width: 90},
    {headerName: "Year", field: "year", width: 90},
    {headerName: "Age Now", width: 90, valueGetter: ageNowValueGetter, filter: 'number'},
    {headerName: "Total Medals", width: 90,
        valueGetter: 'data.gold + data.silver + data.bronze'
    }
];

function ageNowValueGetter(params) {
    return thisYear - params.data.year + params.data.age;
}

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    enableSorting: true,
    enableFilter: true,
    enableColResize: true,
    onGridReady: function() {
        gridOptions.api.sizeColumnsToFit()
    }
};

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
