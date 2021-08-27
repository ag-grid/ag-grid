var gridOptions = {
    columnDefs: [
        { field: 'country' },
        { field: 'sport' },
        {
            field: 'results',
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
        { field: 'athlete' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        resizable: true,
    },
};

function formatter(params) {
    return {
        size: params.highlighted ? params.yValue < 0 ? 4 : 6 : 0,
    }
}

function addSparklineData(data) {
    function randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min) + min) - (max / 2);
    }

    const NUM_VALUES = 7;
    data.forEach(function (d) {
        d.results = [];
        for (let i = 0; i < NUM_VALUES; i++) {
            d.results.push(randomNumber(1, 10));
        }
    });
    return data;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid
        .simpleHttpRequest({
            url: 'https://www.ag-grid.com/example-assets/olympic-winners.json',
        })
        .then(function (data) {
            const NUM_ROWS = 1000;
            const dataMod = data.slice(0, NUM_ROWS);
            gridOptions.api.setRowData(addSparklineData(dataMod));
        });
});
