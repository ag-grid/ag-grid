var columnDefs = [
    // row group columns
    {headerName: 'Country', field: 'country', rowGroup: true},
    {headerName: 'Athlete', field: 'athlete', rowGroup: true},

    // pivot column
    {
        headerName: 'Year',
        // cellRenderer:'agGroupCellRenderer',
        // to mix it up a bit, here we are using a valueGetter for the year column.
        // this demonstrates that groupHideOpenParents and restrictToOneGroup works
        // with value getters also.
        valueGetter: 'data.year',
        pivot: true
    },

    // aggregation columns
    {headerName: 'Gold', field: 'gold', aggFunc: 'sum'},
    {headerName: 'Silver', field: 'silver', aggFunc: 'sum'},
    {headerName: 'Bronze', field: 'bronze', aggFunc: 'sum'},
    {headerName: 'Total', field: 'total', aggFunc: 'sum'}
];

var gridOptions = {
    defaultColDef: {
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true
    },
    pivotMode: true,
    groupDefaultExpanded: 9,
    columnDefs: columnDefs,
    groupHideOpenParents: true,
    groupMultiAutoColumn: true,
    animateRows: true,
    enableSorting: true
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/olympicWinners.json'}).then(function(data) {
        gridOptions.api.setRowData(data);
    });
});
