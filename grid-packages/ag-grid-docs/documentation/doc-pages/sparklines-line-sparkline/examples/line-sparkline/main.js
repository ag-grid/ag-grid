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
                        formatter: formatter,
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

function formatter(params) {
    const { highlighted, yValue } = params;

    const colors = {
        highlighted: 'rgb(238, 102, 102)',
        negative: 'rgb(252, 132, 82)',
        positive: 'rgb(115, 192, 222)'
    }

    let color;

    if (highlighted) {
        color = colors.highlighted;
    } else {
        if (yValue < 0) {
            color = colors.negative;
        } else {
            color = colors.positive;
        }
    }

    return {
        fill: color,
        stroke: color
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
