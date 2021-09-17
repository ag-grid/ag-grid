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
                    type: 'column',
                    formatter: formatter,
                }
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

    const colors = {
        highlighted: 'rgb(250, 200, 88)',
        negative: 'rgb(139, 0, 0)',
        positive: 'rgba(0, 128, 0, 0.3)'
    }

    let color = !highlighted ?
        yValue < 0 ? colors.negative : colors.positive : colors.highlighted;

    return { fill: color, stroke: color };
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
