var columnDefs = [
    {
        field: 'name',
        cellClass: 'cell-wrap-text',
        width: 100
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
        // in this example, the CSS styles are loaded AFTER the grid is created,
        // so we put this in a timeout, so height is calculated after styles are applied.
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