var columnDefs = [
    {
        headerName: 'Athlete Details',
        children: [
            {headerName: 'Athlete', field: 'athlete', width: 150, filter: 'agTextColumnFilter'},
            {headerName: 'Age', field: 'age', width: 90, filter: 'agNumberColumnFilter'},
            {headerName: 'Country', field: 'country', width: 120}
        ]
    },
    {
        headerName: 'Sports Results',
        children: [
            {headerName: 'Sport', field: 'sport', width: 110},
            {headerName: 'Total', columnGroupShow: 'closed', field: 'total', width: 100, filter: 'agNumberColumnFilter'},
            {headerName: 'Gold', columnGroupShow: 'open', field: 'gold', width: 100, filter: 'agNumberColumnFilter'},
            {headerName: 'Silver', columnGroupShow: 'open', field: 'silver', width: 100, filter: 'agNumberColumnFilter'},
            {headerName: 'Bronze', columnGroupShow: 'open', field: 'bronze', width: 100, filter: 'agNumberColumnFilter'}
        ]
    }
];

var gridOptions = {
    debug: true,
    columnDefs: columnDefs,
    rowData: null,
    enableSorting: true,
    enableFilter: true,
    enableColResize: true
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json'}).then(function(data) {
        gridOptions.api.setRowData(data);
    });
});