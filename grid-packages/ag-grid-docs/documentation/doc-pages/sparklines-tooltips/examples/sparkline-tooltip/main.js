var gridOptions = {
    columnDefs: [
        {field: 'symbol', maxWidth: 120},
        {field: 'name',  minWidth: 250 },
        {
            field: 'change',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'line',
                    line: {
                        stroke: 'skyblue',
                    },
                    marker: {
                        shape: 'diamond',
                        formatter: formatter,
                    },
                    highlightStyle: {
                        size: 5,
                    },
                    tooltip: {
                        enabled: true,
                        renderer: tooltipRenderer,
                    }
                }
            }
        },
        {
            field: 'volume',
            type: 'numericColumn',
            maxWidth: 140,
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        resizable: true,
    },
    rowData: getData(),
};

function tooltipRenderer(params) {
    return {
        content: params.yValue,
        title: params.context.data.symbol,
        opacity: 0.5
    }
}

function formatter(params) {
    return {
        fill: !params.highlighted ? params.yValue < 0 ? 'green' : 'skyblue' : undefined,
        stroke: !params.highlighted ? params.yValue < 0 ? 'green' : 'skyblue' : undefined
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});