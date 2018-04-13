var columnDefs = [

    // the first two columns are for displaying groups
    {headerName: "Country",
        // this tells the grid what values to put into the cell
        showRowGroup: 'country',
        // this tells the grid what to use to render the cell
        cellRenderer:'agGroupCellRenderer'
    },
    {headerName: "Year", showRowGroup: 'year', cellRenderer:'agGroupCellRenderer'},

    // these are the two columns we use to group by. we also hide them, so there
    // is no duplication with the values above
    {field: 'country', rowGroup: true, hide: true},
    {field: 'year', rowGroup: true, hide: true},

    {headerName: "Athlete", field: "athlete"},
    {headerName: "Gold", field: "gold"},
    {headerName: "Silver", field: "silver"},
    {headerName: "Bronze", field: "bronze"}
];

var gridOptions = {
    columnDefs: columnDefs,
    animateRows: true,
    enableRangeSelection: true,
    enableColResize: true,
    // we are defining the group columns, so tell the grid we don't
    // want it to auto-generate group columns for us
    groupSuppressAutoColumn: true,
    enableSorting:true,
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
    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/olympicWinnersSmall.json'})
        .then( function(data) {
            gridOptions.api.setRowData(data);
        });
});