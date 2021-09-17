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
                    type: 'area',
                    fill: 'rgba(216, 204, 235, 0.3)',
                    line: {
                        stroke: 'rgb(119,77,185)'
                    },
                    highlightStyle: {
                        fill: 'rgb(143,185,77)',
                    },
                    marker: {
                        formatter: formatter,
                    },
                    axis: {
                        stroke: 'rgb(204, 204, 235)'
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
    rowData: getStockData(),
};

function formatter(params) {
    const { highlighted, yValue } = params;

    return {
        size: highlighted ? yValue < 0 ? 4 : 6 : 0,
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
