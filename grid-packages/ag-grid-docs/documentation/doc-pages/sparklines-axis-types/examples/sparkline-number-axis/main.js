var gridOptions = {
    columnDefs: [
        { field: 'symbol', maxWidth: 110 },
        { field: 'name', minWidth: 250 },
        { field: 'lastPrice', type: 'numericColumn' },
        { field: 'volume', type: 'numericColumn' },
        {
            field: 'rateOfChange',
            headerName: 'Rate of Change',
            minWidth: 250,
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'area',
                    xKey: 'xVal',
                    yKey: 'yVal',
                    axis: {
                        // x-axis type configured to 'number'
                        type: 'number'
                    }
                },
            },
        }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        resizable: true,
    },
    rowData: getData(),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
