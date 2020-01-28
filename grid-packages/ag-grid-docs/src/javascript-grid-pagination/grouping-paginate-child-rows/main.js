var columnDefs = [
    {field: "athlete"},
    {field: "age"},
    {field: "country", rowGroup: true},
    {field: "year", rowGroup: true},
    {field: "date"},
    {field: "sport", rowGroup: true},
    {field: "gold"},
    {field: "silver"},
    {field: "bronze"},
    {field: "total"}
];

var gridOptions = {
    columnDefs: columnDefs,
    pagination: true,
    paginationPageSize: 10,
    paginateChildRows: true
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
