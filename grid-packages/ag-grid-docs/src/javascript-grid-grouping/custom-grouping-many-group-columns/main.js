var columnDefs = [
    {
        headerName: 'Country',
        minWidth: 200,
        // this tells the grid what values to put into the cell
        showRowGroup: 'country',
        // this tells the grid what to use to render the cell
        cellRenderer: 'agGroupCellRenderer',
    },
    {
        headerName: 'Year',
        minWidth: 200,
        showRowGroup: 'year',
        cellRenderer: 'agGroupCellRenderer'
    },
    // these are the two columns we use to group by. we also hide them, so there
    // is no duplication with the values above
    { field: 'country', rowGroup: true, hide: true },
    { field: 'year', rowGroup: true, hide: true },

    { field: 'athlete', minWidth: 220 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' }
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        sortable: true,
        resizable: true,
    },
    // we are defining the group columns, so tell the grid we don't
    // want it to auto-generate group columns for us
    groupSuppressAutoColumn: true,
    enableRangeSelection: true,
    animateRows: true
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json'})
        .then( function(data) {
            gridOptions.api.setRowData(data);
        });
});
