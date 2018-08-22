var columnDefs = [
    {
        headerName: 'Everything Resizes',
        children: [
            {headerName: 'Athlete', field: 'athlete', headerClass: 'resizable-header'},
            {headerName: 'Age', field: 'age', headerClass: 'resizable-header'},
            {headerName: 'Country', field: 'country', headerClass: 'resizable-header'}
        ]
    },
    {
        headerName: 'Only Year Resizes',
        children: [
            {headerName: 'Year', field: 'year', headerClass: 'resizable-header'},
            {headerName: 'Date', field: 'date', suppressResize: true, headerClass: 'fixed-size-header'},
            {headerName: 'Sport', field: 'sport', suppressResize: true, headerClass: 'fixed-size-header'}
        ]
    },
    {
        headerName: 'Nothing Resizes',
        children: [
            {headerName: 'Gold', field: 'gold', suppressResize: true, headerClass: 'fixed-size-header'},
            {headerName: 'Silver', field: 'silver', suppressResize: true, headerClass: 'fixed-size-header'},
            {headerName: 'Bronze', field: 'bronze', suppressResize: true, headerClass: 'fixed-size-header'},
            {headerName: 'Total', field: 'total', suppressResize: true, headerClass: 'fixed-size-header'}
        ]
    }
];

var gridOptions = {
    defaultColDef: {
        width: 90
    },
    columnDefs: columnDefs,
    enableColResize: true
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
