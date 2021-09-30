var gridOptions = {
    columnDefs: [
        {field: 'symbol', maxWidth: 120},
        {field: 'name',  minWidth: 250 },
        {
            field: 'change',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
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
    rowHeight: 50,
};

function tooltipRenderer(params) {
    return {
        title: params.context.data.symbol,
        // sets styles for tooltip title
        color: 'white',
        backgroundColor: 'red',
        opacity: 0.3
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});

