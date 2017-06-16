var columnDefs = [

    // the first group column
    {headerName: "Country", cellRenderer: 'group',
        field: 'country',
        // valueGetter: 'data.country',
        rowGroupIndex: 0,
        cellRendererParams: {
            restrictToOneGroup: true
        },
        rowGroupsDisplayed: ['country']
    },

    // and second group column
    {headerName: "Year", cellRenderer: 'group',
        // to mix it up a bit, here we are using a valueGetter for the year column.
        // this demonstrates that groupHideOpenParents and restrictToOneGroup works
        // with value getters also.
        valueGetter: 'data.year',
        rowGroupIndex: 1, width: 130,
        cellRendererParams: {
            restrictToOneGroup: true
        },
        field:'year',
        rowGroupsDisplayed: ['year']
    },

    {headerName: "Athlete", field: "athlete", width: 150},
    {headerName: "Gold", field: "gold", aggFunc: 'sum', width: 100},
    {headerName: "Silver", field: "silver", aggFunc: 'sum', width: 100},
    {headerName: "Bronze", field: "bronze", aggFunc: 'sum', width: 100},
    {headerName: "Total", field: "total", aggFunc: 'sum', width: 100}
];

var gridOptions = {
    enableRangeSelection: true,
    columnDefs: columnDefs,
    rowData: null,
    groupSuppressAutoColumn: true,
    groupHideOpenParents: true,
    animateRows: true,
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
