var columnDefs = [
    {field: "athlete"},
    {field: "age", width: 100},
    {field: "country"},
    {field: "year"},
    {field: "date"},
    {field: "sport"},
    {field: "gold"},
    {field: "silver"},
    {field: "bronze"},
    {field: "total"}
];

var gridOptions = {
    defaultColDef: {
        width: 150
    },
    columnDefs: columnDefs,
    rowData: null,
    enableSorting: true,
    multiSortKey: 'ctrl',
    onGridReady: function(params) {
        var defaultSortModel = [
                {colId: "country", sort: "asc"},
                {colId: "athlete", sort: "asc"}
            ];
        params.api.setSortModel(defaultSortModel);
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json'}).then(function(data) {
        gridOptions.api.setRowData(data);
    });

});
