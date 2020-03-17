var columnDefs = [
    { field: "athlete", sortingOrder: ['asc','desc'] },
    { field: "age", width: 90, sortingOrder: ['desc','asc'] },
    { field: "country", sortingOrder: ['desc',null] },
    { field: "year", width: 90, sortingOrder: ['asc'] },
    { field: "date" },
    { field: "sport" },
    { field: "gold" },
    { field: "silver" },
    { field: "bronze"},
    { field: "total" }
];

var gridOptions = {
    defaultColDef: {
        width: 170,
        sortable: true
    },
    columnDefs: columnDefs,
    rowData: null,
    animateRows: true,
    sortingOrder: ['desc','asc',null]
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
