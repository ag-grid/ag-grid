var gridOptions = {
    columnDefs: [
        {headerName: 'Athlete', field: 'athlete', minWidth: 150},
        {headerName: 'Age', field: 'age', minWidth: 50, filter: 'agNumberColumnFilter'},
        {headerName: 'Country', field: 'country', width: 120},
        {headerName: 'Year', field: 'year', width: 90},
        {headerName: 'Date', field: 'date', width: 110},
        {headerName: 'Sport', field: 'sport', width: 110},
        {headerName: 'Gold', field: 'gold', width: 110, aggFunc: 'sum'},
        {headerName: 'Silver', field: 'silver', width: 110, aggFunc: 'sum'},
        {headerName: 'Bronze', field: 'bronze', width: 110, aggFunc: 'sum'}
    ],

    enableColResize: true,
    ensureDomOrder: true,
    suppressColumnVirtualisation: true,
    rowBuffer: 999
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json'}).then(function(data) {
        gridOptions.api.setRowData(data.slice(0, 500));
    });
});