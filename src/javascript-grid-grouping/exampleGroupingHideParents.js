var columnDefs = [

    // to mix it up a bit, here we are using a valueGetter for the year column.
    // this demonstrates that groupHideOpenParents and restrictToOneGroup works
    // with value getters also.
    {headerName: "Country", showRowGroup: 'country', cellRenderer: 'group'},
    {headerName: "Year", valueGetter: 'data.year', showRowGroup: 'year', cellRenderer: 'group'},

    {headerName: "Athlete", field: "athlete", width: 180},
    {headerName: "Gold", field: "gold", aggFunc: 'sum', width: 100},
    {headerName: "Silver", field: "silver", aggFunc: 'sum', width: 100},
    {headerName: "Bronze", field: "bronze", aggFunc: 'sum', width: 100},
    {headerName: "Total", field: "total", aggFunc: 'sum', width: 100},


    {field: 'country', rowGroup: true, hide: true},
    {field: 'year', rowGroup: true, hide: true}
];

var gridOptions = {
    groupSuppressAutoColumn : true,
    enableRangeSelection: true,
    columnDefs: columnDefs,
    rowData: null,
    groupHideOpenParents: true,
    animateRows: true,
    enableColResize: true,
    enableSorting: true,
    onGridReady: function(params) {
        // params.api.sizeColumnsToFit();
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
