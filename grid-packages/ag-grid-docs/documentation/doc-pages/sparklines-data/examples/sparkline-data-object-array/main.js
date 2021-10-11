var gridOptions = {
    columnDefs: [
        { field: 'symbol', maxWidth: 110 },
        { field: 'name', minWidth: 250 },
        {
            field: 'rateOfChange',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'column',
                    xKey: 'xVal',
                    yKey: 'yVal',
                    axis: {
                        type: 'number'
                    }
                },
            },
        },
        { field: 'volume', type: 'numericColumn', maxWidth: 140 }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        resizable: true,
    },
    rowData: getStockData(),
    rowHeight: 50,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
