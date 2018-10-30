var columnDefs = [
    {
        field: 'group',
        rowGroup: true,
        cellClass: 'cell-wrap-text',
        hide: true
    },
    {
        field: 'autoA',
        cellClass: 'cell-wrap-text',
        autoHeight: true,
        width: 300
    },
    {
        field: 'autoB',
        cellClass: 'cell-wrap-text',
        autoHeight: true,
        width: 300
    },
    {
        field: 'autoC',
        cellClass: 'cell-wrap-text',
        autoHeight: true,
        width: 300
    }
];

var gridOptions = {
    defaultColDef: {
        width: 100
    },
    columnDefs: columnDefs,
    enableColResize: true,
    rowModelType: 'serverSide',
    animateRows: true,
    serverSideDatasource: new SimpleDatasource()
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
