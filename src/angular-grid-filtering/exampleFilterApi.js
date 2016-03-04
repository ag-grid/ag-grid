
var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150, filter: 'set'},
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

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    enableFilter: true,
    enableSorting: true
};

function irelandAndUk() {
    var filterApi = gridOptions.api.getFilterApi('country');
    filterApi.selectNothing();
    filterApi.selectValue('Ireland');
    filterApi.selectValue('Great Britain');
    gridOptions.api.onFilterChanged();
}

function clearCountryFilter() {
    var filterApi = gridOptions.api.getFilterApi('country');
    filterApi.selectEverything();
    gridOptions.api.onFilterChanged();
}

function endingStan() {
    var filterApi = gridOptions.api.getFilterApi('country');
    filterApi.selectNothing();
    for (var i = 0; i<filterApi.getUniqueValueCount(); i++) {
        var value = filterApi.getUniqueValue(i);
        var valueEndsWithStan = value.indexOf('stan') === value.length - 4;
        if (valueEndsWithStan) {
            filterApi.selectValue(value);
        }
    }
    gridOptions.api.onFilterChanged();
}

function setCountryModel() {
    var filterApi = gridOptions.api.getFilterApi('country');
    var model = ['Algeria','Argentina'];
    filterApi.setModel(model);
    gridOptions.api.onFilterChanged();
}

function printCountryModel() {
    var filterApi = gridOptions.api.getFilterApi('country');
    var model = filterApi.getModel();
    if (model) {
        console.log('Country model is: [' + model.join(',') + ']');
    } else {
        console.log('Country model filter is not active');
    }
}

function ageBelow25() {
    var filterApi = gridOptions.api.getFilterApi('age');
    filterApi.setType(filterApi.LESS_THAN);
    filterApi.setFilter(25);
    gridOptions.api.onFilterChanged();
}

function ageAbove30() {
    var filterApi = gridOptions.api.getFilterApi('age');
    filterApi.setType(filterApi.GREATER_THAN);
    filterApi.setFilter(30);
    gridOptions.api.onFilterChanged();
}

function clearAgeFilter() {
    var filterApi = gridOptions.api.getFilterApi('age');
    filterApi.setFilter('');
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
