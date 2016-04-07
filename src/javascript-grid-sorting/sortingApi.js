var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150},
    {headerName: "Age", field: "age", width: 90},
    {headerName: "Country", field: "country", width: 120},
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
    rowData: null,
    enableSorting: true
};

function sortByAthleteAsc() {
    var sort = [
        {colId: 'athlete', sort: 'asc'}
    ];
    gridOptions.api.setSortModel(sort);
}

function sortByAthleteDesc() {
    var sort = [
        {colId: 'athlete', sort: 'desc'}
    ];
    gridOptions.api.setSortModel(sort);
}

function sortByCountryThenSport() {
    var sort = [
        {colId: 'country', sort: 'asc'},
        {colId: 'sport', sort: 'asc'}
    ];
    gridOptions.api.setSortModel(sort);
}

function sortBySportThenCountry() {
    var sort = [
        {colId: 'sport', sort: 'asc'},
        {colId: 'country', sort: 'asc'}
    ];
    gridOptions.api.setSortModel(sort);
}

function printSortStateToConsole() {
    var sortState = gridOptions.api.getSortModel();
    if (sortState.length==0) {
        console.log('No sort active');
    } else {
        console.log('State of sorting is:');
        for (var i = 0; i<sortState.length; i++) {
            var item = sortState[i];
            console.log(i + ' = {colId: ' + item.colId + ', sort: ' + item.sort + '}');
        }
    }
}

function clearSort() {
    // pass null or undefined or empty list
    gridOptions.api.setSortModel(null);
}

var savedSort;

function saveSort() {
    savedSort = gridOptions.api.getSortModel();
    console.log('Saved sort: ' + JSON.stringify(savedSort));
}

function restoreFromSave() {
    gridOptions.api.setSortModel(savedSort);
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

