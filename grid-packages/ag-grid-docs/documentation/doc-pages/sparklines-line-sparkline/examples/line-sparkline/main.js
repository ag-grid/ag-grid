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
                }
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
};

function formatter(params) {
    return {
        fill: !params.highlighted ? params.yValue < 0 ? 'green' : 'skyblue' : undefined,
        stroke: !params.highlighted ? params.yValue < 0 ? 'green' : 'skyblue' : undefined
    }
}

function updateLineStrokeWidth(strokeWidth) {
    gridOptions.columnDefs[2].cellRendererParams.sparklineOptions.line.strokeWidth = strokeWidth;
    gridOptions.api.setColumnDefs(gridOptions.columnDefs);
}

function updateMarkerSize(size) {
    gridOptions.columnDefs[2].cellRendererParams.sparklineOptions.marker.size = size;
    gridOptions.api.setColumnDefs(gridOptions.columnDefs);
}

function updateLineStroke(stroke, el) {
    const toggleButtons = document.getElementsByClassName('toggle-button');

    for (const b of toggleButtons) {
        b.setAttribute('class', 'toggle-button');
    }
    el.setAttribute('class', 'toggle-button active');

    gridOptions.columnDefs[2].cellRendererParams.sparklineOptions.line.stroke = stroke;
    gridOptions.api.setColumnDefs(gridOptions.columnDefs);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    gridOptions.api.setRowData(quotes);
});
