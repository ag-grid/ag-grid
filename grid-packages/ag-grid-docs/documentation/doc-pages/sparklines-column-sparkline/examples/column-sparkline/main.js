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
                    strokeWidth: 1,
                    formatter: formatter,
                    highlightStyle: {
                        strokeWidth: 1,
                    }
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
    let fill = !params.highlighted ?
        params.yValue < 0 ? 'rgb(210,5,5)' : 'rgb(5,200,5)' :
        params.yValue < 0 ? 'rgb(255,201,14)' : 'rgb(71,133,235)';

    let stroke = params.highlighted ? params.yValue < 0 ? 'rgb(156,166,195)' : 'rgb(156,195,185)' : params.stroke;

    return { fill, stroke };
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
