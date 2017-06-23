var columnDefs = [

    // group by these cols, and hide them, and let grid sort out the grouping columns
    {headerName: "Country", field: "country", rowGroup: true, hide: true},
    {headerName: "Year", field: "year", rowGroup: true, hide: true},

    {headerName: "Athlete", field: "athlete"},
    {headerName: "Gold", field: "gold"},
    {headerName: "Silver", field: "silver"},
    {headerName: "Bronze", field: "bronze"}
];

var gridOptions = {
    columnDefs: columnDefs,
    animateRows: true,
    enableRangeSelection: true,
    // by default the grid will create auto columns, however the default
    // behaviour is one column, set this property to true to get column
    // per group
    groupMultiAutoColumn: true,
    enableSorting: true,
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    agGrid.simpleHttpRequest({url: '../olympicWinners.json'})
        .then( function(rows) {
            gridOptions.api.setRowData(rows);
        });
});