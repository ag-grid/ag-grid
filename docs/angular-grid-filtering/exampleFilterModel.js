var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150, filter: 'text'},
    {headerName: "Age", field: "age", width: 90, filter: 'number'},
    {headerName: "Country", field: "country", width: 120},
    {headerName: "Year", field: "year", width: 90},
    {headerName: "Date", field: "date", width: 110},
    {headerName: "Sport", field: "sport", width: 110},
    {headerName: "Gold", field: "gold", width: 100, filter: 'number'},
    {headerName: "Silver", field: "silver", width: 100, filter: 'number'},
    {headerName: "Bronze", field: "bronze", width: 100, filter: 'number'},
    {headerName: "Total", field: "total", width: 100, filter: 'number'}
];

// this gets set when you hit the button 'save filter'
var savedModel = null;

var hardcodedFilter = {
    country: ['Ireland', 'United States'],
    age: {type: 2, filter: '30'},
    athlete: {type: 3, filter: 'Mich'}
};

var savedFilters = '[]';

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    enableFilter: true,
    enableSorting: true
};

function clearFilters() {
    gridOptions.api.setFilterModel(null);
    gridOptions.api.onFilterChanged();
}

function saveFilterModel() {
    savedModel = gridOptions.api.getFilterModel();
    if (savedModel) {
        savedFilters = Object.keys(savedModel);
    } else {
        savedFilters = '-none-';
    }
    document.querySelector('#savedFilters').innerHTML = JSON.stringify(savedFilters);
}

function restoreFilterModel() {
    gridOptions.api.setFilterModel(savedModel);
    gridOptions.api.onFilterChanged();
}

function restoreFromHardCoded() {
    gridOptions.api.setFilterModel(hardcodedFilter);
    gridOptions.api.onFilterChanged();
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
