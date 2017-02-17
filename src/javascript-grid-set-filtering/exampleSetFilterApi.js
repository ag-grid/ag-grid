var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150, filter: 'set',
        filterParams: { cellHeight: 20} },
    {headerName: "Age", field: "age", width: 90, filter: 'number'},
    {headerName: "Country", field: "country", width: 140,
        cellRenderer: countryCellRenderer, keyCreator: countryKeyCreator},
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
    enableColResize: true
};

function countryCellRenderer(params) {
    return params.value.name + ' (' + params.value.code + ')';
}

function countryKeyCreator(params) {
    var countryObject = params.value;
    var key = countryObject.name;
    return key;
}

function onFilterChanged(value) {
    gridOptions.api.setQuickFilter(value);
}

function setDataIntoGrid(data) {
    // hack the data, replace each country with an object of country name and code
    data.forEach( function(row) {
        var countryName = row.country;
        var countryCode = countryName.substring(0,2).toUpperCase();
        row.country = {
            name: countryName,
            code: countryCode
        };
    });
    gridOptions.api.setRowData(data);
}

var athleteFilterModel = null;

function setAthleteFilterModel(){
    var athleteFilterComponent = gridOptions.api.getFilterInstance('athlete');
    athleteFilterComponent.setModel (['John Joe Nevin', 'Kenny Egan']);
    gridOptions.api.onFilterChanged();
}

function saveAthleteFilterModel(){
    var athleteFilterComponent = gridOptions.api.getFilterInstance('athlete');
    athleteFilterModel = athleteFilterComponent.getModel();
}

function restoreAthleteFilterModel(){
    var athleteFilterComponent = gridOptions.api.getFilterInstance('athlete');
    athleteFilterComponent.setModel(athleteFilterModel);
    gridOptions.api.onFilterChanged();
}

function clearAthleteFilterModel(){
    var athleteFilterComponent = gridOptions.api.getFilterInstance('athlete');
    athleteFilterComponent.setModel(null);
    gridOptions.api.onFilterChanged();
}

var changeTo = '../alternativeData.json';

function changeData(){
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', changeTo);
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            setDataIntoGrid(httpResult);
        }
    };
    changeTo = changeTo === '../olympicWinners.json' ? '../alternativeData.json' : '../olympicWinners.json';
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
            setDataIntoGrid(httpResult);
        }
    };
});
