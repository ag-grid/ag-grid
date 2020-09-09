var columnDefs = [
    // row group columns
    { field: 'country', rowGroup: true },
    { field: 'athlete', rowGroup: true },

    // pivot column
    {
        headerName: 'Year',
        // to mix it up a bit, here we are using a valueGetter for the year column.
        valueGetter: 'data.year',
        pivot: true
    },

    // aggregation columns
    { field: 'gold', aggFunc: 'sum'},
    { field: 'silver', aggFunc: 'sum'},
    { field: 'bronze', aggFunc: 'sum'},
    { field: 'total', aggFunc: 'sum'}
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true,
        filter: true,
        resizable: true,
        sortable: true,
    },
    autoGroupColumnDef: {
        minWidth: 250,
    },
    pivotMode: true,
    groupDefaultExpanded: 9,
    groupHideOpenParents: true,
    groupMultiAutoColumn: true,
    animateRows: true,
    sideBar: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json'}).then(function(data) {
        gridOptions.api.setRowData(data);
    });
});
