var columnDefs = [
    {headerName: 'Gold', field: 'gold', aggFunc: 'sum'},
    {headerName: 'Silver', field: 'silver', aggFunc: 'sum'},
    {headerName: 'Bronze', field: 'bronze', aggFunc: 'sum'},
    {headerName: 'Total', field: 'total', aggFunc: 'sum'},
    {headerName: 'Age', field: 'age'},
    {headerName: 'Date', field: 'date'},
    {headerName: 'Sport', field: 'sport'},

    {field: 'country', rowGroup: true, hide: true},
    {field: 'year', rowGroup: true, hide: true}
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
      width: 150
    },
    enableRangeSelection: true,
    enableSorting: true,
    enableColResize: true,
    autoGroupColumnDef: {
        headerName: 'Athlete',
        width: 300,
        field: 'athlete'
    },
    groupIncludeFooter: true,
    groupIncludeTotalFooter: true,
    animateRows: true
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