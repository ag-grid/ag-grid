var columnDefs = [
    {field: 'country', enableRowGroup: true},
    {field: 'year', enableRowGroup: true},
    {field: "athlete", width: 180},
    {field: "gold", aggFunc: 'sum', width: 100},
    {field: "silver", aggFunc: 'sum', width: 100},
    {field: "bronze", aggFunc: 'sum', width: 100},
    {field: "total", aggFunc: 'sum', width: 100}
];

var gridOptions = {
    columnDefs: columnDefs,
    suppressDragLeaveHidesColumns: true,
    suppressMakeColumnVisibleAfterUnGroup: true,
    rowGroupPanelShow: 'always'
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/olympicWinnersSmall.json'})
        .then( function(data) {
            gridOptions.api.setRowData(data);
        });
});