var gridOptions = {
    columnDefs: [
        // one column for showing the groups
        {
            headerName: 'Group',
            cellRenderer: 'agGroupCellRenderer',
            showRowGroup: true,
            minWidth: 210,
        },

        // the first group column
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true },

        { field: 'athlete', minWidth: 200},
        { field: 'gold'},
        { field: 'silver'},
        { field: 'bronze'}
    ],
    defaultColDef: {
        flex: 1,
        sortable: true,
        resizable: true
    },

    // we are defining the group columns, so tell the grid we don't
    // want it to auto-generate group columns for us
    groupSuppressAutoColumn: true,

    enableRangeSelection: true,
    animateRows: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json'}).then(function(data) {
        gridOptions.api.setRowData(data);
    });
});
