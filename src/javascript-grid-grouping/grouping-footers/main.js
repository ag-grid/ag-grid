var columnDefs = [
    {headerName: 'Gold', field: 'gold', width: 100, aggFunc: 'sum'},
    {headerName: 'Silver', field: 'silver', width: 100, aggFunc: 'sum'},
    {headerName: 'Bronze', field: 'bronze', width: 100, aggFunc: 'sum'},
    {headerName: 'Total', field: 'total', width: 100, aggFunc: 'sum'},
    {headerName: 'Age', field: 'age', width: 90},
    {headerName: 'Date', field: 'date', width: 110},
    {headerName: 'Sport', field: 'sport', width: 110},

    {field: 'country', rowGroup: true, hide: true},
    {field: 'year', rowGroup: true, hide: true}
];

var gridOptions = {
    columnDefs: columnDefs,
    enableRangeSelection: true,
    enableSorting: true,
    autoGroupColumnDef: {
        headerName: 'Athlete',
        width: 200,
        field: 'athlete'
    },
    groupIncludeFooter: true,
    animateRows: true
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/olympicWinnersSmall.json'}).then(function(data) {
        gridOptions.api.setRowData(data);
    });
});