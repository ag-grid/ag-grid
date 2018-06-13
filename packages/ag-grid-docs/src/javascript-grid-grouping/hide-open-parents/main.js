var columnDefs = [

    // to mix it up a bit, here we are using a valueGetter for the year column.
    // this demonstrates that groupHideOpenParents and restrictToOneGroup works
    // with value getters also.
    {headerName: "Country", colId: 'country', field: 'country', rowGroup: true, hide: true},
    {headerName: "Year", colId: 'year', field: 'year', valueGetter: 'data.year', rowGroup: true, hide: true},

    {headerName: "Athlete", field: "athlete", width: 180},
    {headerName: "Gold", field: "gold", aggFunc: 'sum', width: 100},
    {headerName: "Silver", field: "silver", aggFunc: 'sum', width: 100},
    {headerName: "Bronze", field: "bronze", aggFunc: 'sum', width: 100},
    {headerName: "Total", field: "total", aggFunc: 'sum', width: 100}
];

var gridOptions = {
    enableFilter: true,
    enableRangeSelection: true,
    columnDefs: columnDefs,
    rowData: null,
    groupHideOpenParents: true,
    animateRows: true,
    enableColResize: true,
    enableSorting: true,
    autoGroupColumnDef: {
        filterValueGetter: function(params) {
            var colGettingGrouped = params.colDef.showRowGroup;
            var valueForOtherCol = params.api.getValue(colGettingGrouped, params.node);
            return valueForOtherCol;
        }
    }
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