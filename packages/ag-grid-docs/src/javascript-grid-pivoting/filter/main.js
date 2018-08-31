var columnDefs = [
    {headerName: "Country", field: "country", width: 120, pivot: true,  enablePivot:true},
    {headerName: "Year", field: "year", width: 90},
    {headerName: "Date", field: "date", width: 110},
    {headerName: "Sport", field: "sport", width: 110},
    {headerName: "Gold", field: "gold", width: 100, aggFunc: 'sum'},
    {headerName: "Silver", field: "silver", width: 100, aggFunc: 'sum'},
    {headerName: "Bronze", field: "bronze", width: 100, aggFunc: 'sum'}
];

function setTitle(title) {
    document.querySelector('#title').innerText = title;
}

function clearFilter() {
    gridOptions.api.setFilterModel(null);
    setTitle('All Medals by Country')
}

function filterUKAndIrelandBoxing() {
    gridOptions.api.setFilterModel({
        country: ['Ireland','Great Britain'],
        sport: ['Boxing']
    });
    setTitle('UK and Ireland - Boxing')
}

function filterUKAndIrelandEquestrian() {
    gridOptions.api.setFilterModel({
        country: ['Ireland','Great Britain'],
        sport: ['Equestrian']
    });
    setTitle('UK and Ireland - Equestrian')
}

function filterUsaAndCanadaBoxing() {
    gridOptions.api.setFilterModel({
        country: ['United States','Canada'],
        sport: ['Boxing']
    });
    setTitle('USA and Canada - Boxing')
}

function filterUsaAndCanadaEquestrian() {
    gridOptions.api.setFilterModel({
        country: ['United States','Canada'],
        sport: ['Equestrian']
    });
    setTitle('USA and Canada - Equestrian')
}

var gridOptions = {
    columnDefs: columnDefs,
    enableColResize: true,
    pivotMode: true,
    sideBar: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});