var gridOptions = {
    columnDefs: [
        { field: 'symbol' },
        {
            field: 'shortName',
            headerName: 'Name',
        },
        {
            field: 'history',
            headerName: 'Close History',
            minWidth: 100,
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: { type: 'line' },
            },
            // cellStyle: { padding: 0 },
            // valueGetter: function(params) { return [5, 3, 6, 2, 1]}
        },
        {
            field: 'regularMarketDayHigh',
        },
        {
            field: 'regularMarketDayLow',
        }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        resizable: true,
    },
    // rowHeight: 75,
    // rowBuffer: 20,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    gridOptions.api.setRowData(quotes);
});
