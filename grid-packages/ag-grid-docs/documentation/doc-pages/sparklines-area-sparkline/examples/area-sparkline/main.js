var gridOptions = {
    columnDefs: [
        { field: 'symbol' },
        {
            field: 'shortName',
            headerName: 'Name',
        },
        {
            field: 'history',
            headerName: 'Close History',
            minWidth: 100,
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
        },
        {
            field: 'regularMarketDayHigh',
        },
        {
            field: 'regularMarketDayLow',
        }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        resizable: true,
    },
    rowData: generateRowData()
};

function formatter(params) {
    return {
        size: params.highlighted ? params.yValue < 0 ? 4 : 6 : 0,
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
