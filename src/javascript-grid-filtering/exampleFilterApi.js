
var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150, filter: 'set'},
    {headerName: "Age", field: "age", width: 90, filter: 'number'},
    {headerName: "Country", field: "country", width: 120},
    {headerName: "Year", field: "year", width: 90},
    {headerName: "Date", field: "date", width: 110, filter:'date', filterParams:{
        comparator:function (filterLocalDateAtMidnight, cellValue){
            var dateAsString = cellValue;
            var dateParts  = dateAsString.split("/");
            var cellDate = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));

            if (filterLocalDateAtMidnight.getTime() == cellDate.getTime()) {
                return 0
            }

            if (cellDate < filterLocalDateAtMidnight) {
                return -1;
            }

            if (cellDate > filterLocalDateAtMidnight) {
                return 1;
            }
        }
    }},
    {headerName: "Sport", field: "sport", width: 110},
    {headerName: "Gold", field: "gold", width: 100, filter: 'number'},
    {headerName: "Silver", field: "silver", width: 100, filter: 'number'},
    {headerName: "Bronze", field: "bronze", width: 100, filter: 'number'},
    {headerName: "Total", field: "total", width: 100, filter: 'number', suppressFilter: true}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    enableFilter: true,
    enableSorting: true,

    // these hide enterprise features, so they are not confusing
    // you if using ag-Grid standard
    suppressContextMenu: true,
    suppressMenuMainPanel: true,
    suppressMenuColumnPanel: true
};

function irelandAndUk() {
    var countryFilterComponent = gridOptions.api.getFilterInstance('country');
    countryFilterComponent.selectNothing();
    countryFilterComponent.selectValue('Ireland');
    countryFilterComponent.selectValue('Great Britain');
    gridOptions.api.onFilterChanged();
}

function clearCountryFilter() {
    var countryFilterComponent = gridOptions.api.getFilterInstance('country');
    countryFilterComponent.selectEverything();
    gridOptions.api.onFilterChanged();
}

function destroyCountryFilter() {
    gridOptions.api.destroyFilter('country');
}

function endingStan() {
    var countryFilterComponent = gridOptions.api.getFilterInstance('country');
    countryFilterComponent.selectNothing();
    for (var i = 0; i<countryFilterComponent.getUniqueValueCount(); i++) {
        var value = countryFilterComponent.getUniqueValue(i);
        var valueEndsWithStan = value.indexOf('stan') === value.length - 4;
        if (valueEndsWithStan) {
            countryFilterComponent.selectValue(value);
        }
    }
    gridOptions.api.onFilterChanged();
}

function setCountryModel() {
    var countryFilterComponent = gridOptions.api.getFilterInstance('country');
    var model = ['Algeria','Argentina'];
    countryFilterComponent.setModel(model);
    gridOptions.api.onFilterChanged();
}

function printCountryModel() {
    var countryFilterComponent = gridOptions.api.getFilterInstance('country');
    var model = countryFilterComponent.getModel();
    if (model) {
        console.log('Country model is: [' + model.join(',') + ']');
    } else {
        console.log('Country model filter is not active');
    }
}

function ageBelow25() {
    var ageFilterComponent = gridOptions.api.getFilterInstance('age');
    ageFilterComponent.setType('lessThan');
    ageFilterComponent.setFilter(25);
    ageFilterComponent.setVisibilityOnDateToPanel();
    gridOptions.api.onFilterChanged();
}

function ageAbove30() {
    var ageFilterComponent = gridOptions.api.getFilterInstance('age');
    ageFilterComponent.setType('greaterThan');
    ageFilterComponent.setFilter(30);
    ageFilterComponent.setVisibilityOnDateToPanel();
    gridOptions.api.onFilterChanged();
}

function ageBetween25And30() {
    var ageFilterComponent = gridOptions.api.getFilterInstance('age');
    ageFilterComponent.setType('inRange');
    ageFilterComponent.setFilter(25);
    ageFilterComponent.setFilterTo(30);
    ageFilterComponent.setVisibilityOnDateToPanel();
    gridOptions.api.onFilterChanged();
}

function clearAgeFilter() {
    var ageFilterComponent = gridOptions.api.getFilterInstance('age');
    ageFilterComponent.setFilter(null);
    gridOptions.api.onFilterChanged();
}

function after2010(){
    var dateFilterComponent = gridOptions.api.getFilterInstance('date');
    dateFilterComponent.setFilterType('greaterThan');
    dateFilterComponent.setDateFrom('2010-01-01');
    gridOptions.api.onFilterChanged();
}

function before2012(){
    var dateFilterComponent = gridOptions.api.getFilterInstance('date');
    dateFilterComponent.setFilterType('lessThan');
    dateFilterComponent.setDateFrom('2012-01-01');
    gridOptions.api.onFilterChanged();
}

function clearDateFilter(){
    var dateFilterComponent = gridOptions.api.getFilterInstance('date');
    dateFilterComponent.setDateFrom(null);
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
