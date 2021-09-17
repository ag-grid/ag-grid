var gridOptions = {
    rowHeight: 70,
    columnDefs: [
        {
            field: 'sparkline',
            headerName: 'Line Sparkline',
            minWidth: 100,
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'line',
                    line: {
                        stroke: 'rgb(124, 255, 178)',
                        strokeWidth: 2
                    },
                    padding: {
                        top: 10,
                        bottom: 10
                    },
                    marker: {
                        shape: 'diamond',
                        formatter: lineMarkerFormatter,
                    },
                },
            },
        },
        {
            field: 'sparkline',
            headerName: 'Column Sparkline',
            minWidth: 100,
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'column',
                    padding: {
                        top: 10,
                        bottom: 10
                    },
                    highlightStyle: {
                        fill: 'rgb(88, 217, 249)'
                    },
                    formatter: columnFormatter
                },
            },
        },
        {
            field: 'sparkline',
            headerName: 'Area Sparkline',
            minWidth: 100,
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'area',
                    fill: 'rgba(84, 112, 198, 0.3)',
                    line: {
                        stroke: 'rgb(84, 112, 198)'
                    },
                    padding: {
                        top: 10,
                        bottom: 10
                    },
                    marker: {
                        formatter: areaMarkerFormatter,
                    },
                },
            },
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        resizable: true,
    },
    rowData: getQuotes(),
};

const colors = {
    firstLast: 'rgb(253, 221, 96)',
    min: 'rgb(239, 108, 0)',
    max: 'rgb(239, 108, 0)',
    negative: 'rgb(255, 110, 118)',
    positive: 'rgba(0,128,0, 0.3)'
}

function lineMarkerFormatter(params){
    const { min, max, first, last } = params;
    return {
        size: min || max || first || last ? 5 : 0,
        fill: min ? colors.minimum : max ? colors.maximum : colors.firstLast,
        stroke: min ? colors.minimum : max ? colors.maximum : colors.firstLast
    }
}

function columnFormatter(params) {
    const { first, last, yValue, highlighted } = params;

    let fill = undefined;
    if (!highlighted) {
        if (first || last) {
            fill = colors.firstLast
        } else if (yValue < 0) {
            fill = colors.negative
        } else {
            fill = colors.positive
        }
    }
    return {
        fill
    }
}

function areaMarkerFormatter(params){
    const { min, max, first, last } = params;
    return {
        size: min || max || first || last ? 5 : 0,
        fill: min ? 'rgb(239, 108, 0)' : max ? 'green' : 'rgb(253, 221, 96)',
        stroke: min ? 'rgb(239, 108, 0)' : max ? 'green' : 'rgb(253, 221, 96)'
    }
}

function updateData() {
    const itemsToUpdate = [];
    gridOptions.api.forEachNodeAfterFilterAndSort(function (rowNode, index) {
        let data = rowNode.data;
        const n = data.history.length;
        data.history = [...data.history.slice(1, n), randomNumber(0, 10)];
        itemsToUpdate.push(data);
    });
    gridOptions.api.applyTransaction({ update: itemsToUpdate });
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

window.setInterval(() => {
    updateData();
}, 2000)

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
