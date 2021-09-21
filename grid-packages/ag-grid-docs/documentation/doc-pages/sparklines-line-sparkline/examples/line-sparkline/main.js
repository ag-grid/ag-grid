var gridOptions = {
    columnDefs: [
        { field: 'symbol', maxWidth: 110 },
        { field: 'name', minWidth: 250 },
        { field: 'lastPrice', type: 'numericColumn' },
        { field: 'volume', type: 'numericColumn' },
        {
            field: 'history',
            headerName: 'Close History',
            minWidth: 250,
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'line',
                    line: {
                        stroke: 'rgb(124, 255, 178)',
                        strokeWidth: 2
                    },
                    padding: {
                        top: 5,
                        bottom: 5
                    },
                    marker: {
                        size: 3,
                        shape: 'diamond',
                    },
                    highlightStyle: {
                        size: 10,
                    },
                }
            },
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        resizable: true,
    },
    rowData: getStockData(),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
