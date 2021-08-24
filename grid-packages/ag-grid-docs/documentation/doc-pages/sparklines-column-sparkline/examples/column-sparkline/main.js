var gridOptions = {
    columnDefs: [
        {field: 'country'},
        {field: 'sport'},
        {
            field: 'results',
            minWidth: 100,
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'column',
                    strokeWidth: 1,
                    paddingInner: 0.7,
                    paddingOuter: 0.2,
                    formatter: formatter,
                    highlightStyle: {
                        strokeWidth: 1,
                    }
                }
            },
        },
        {field: 'athlete'},
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        resizable: true,
    },
};

function formatter(params) {
    let fill = params.highlighted ?
        params.yValue < 0 ? 'rgb(224,158,245)' : 'rgb(183,237,166)' :
        params.yValue < 0 ? 'rgb(207,191,212)' : 'rgb(196,212,191)';

    let stroke = params.highlighted ? params.yValue < 0 ? 'rgb(136,99,147)' : 'rgb(110,147,99)' : params.stroke;

    return { fill, stroke };
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
