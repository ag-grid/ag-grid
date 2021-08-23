var gridOptions = {
    columnDefs: [
        { field: 'country' },
        { field: 'sport' },
        {
            field: 'results',
            minWidth: 100,
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineType: 'column',
            },
            // cellStyle: { padding: 0 },
            // valueGetter: function(params) { return [5, 3, 6, 2, 1]}
        },
        { field: 'athlete' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        resizable: true,
    },
    // rowHeight: 75,
    // rowBuffer: 20,
};

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function addSparlineData(data) {
    const dataMod = data.slice(0, 1000);
    dataMod.forEach(function (d) {
        d.results = [];
        for (let i = 0; i < 20; i++) {
            d.results.push(randomNumber(1, 10));
        }
    });
    return dataMod;
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
            gridOptions.api.setRowData(addSparlineData(data));
        });
});
