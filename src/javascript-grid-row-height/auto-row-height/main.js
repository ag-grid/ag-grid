var latinText =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum';

var columnDefs = [
    {
        field: 'name',
        cellClass: 'cell-wrap-text'
    },
    {
        field: 'autoA',
        cellClass: 'cell-wrap-text',
        autoHeight: true
    },
    {
        field: 'autoB',
        cellClass: 'cell-wrap-text',
        autoHeight: true
    },
    {
        field: 'autoC',
        cellClass: 'cell-wrap-text',
        autoHeight: true
    }
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    enableSorting: true,
    enableFilter: true,
    enableColResize: true,
    onGridReady: function(event) {
        setTimeout( function() {
            gridOptions.api.resetRowHeights();
        }, 500);
    },
    onColumnResized: function(event) {
        if (event.finished) {
            gridOptions.api.resetRowHeights();
        }
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});