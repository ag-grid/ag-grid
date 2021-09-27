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
                    tooltip: {
                        renderer: tooltipRenderer,
                    }
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

function tooltipRenderer(params) {
    return '<div class="ag-chart-tooltip-content">' + params.yValue.toFixed(1) + '</div>';
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
