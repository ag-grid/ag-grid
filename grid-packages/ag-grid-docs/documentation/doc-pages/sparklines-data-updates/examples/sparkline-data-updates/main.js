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
        },
        { field: 'athlete' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        resizable: true,
    },
};

const NUM_VALUES = 10;
const NUM_ROWS = 1000;

function updateData() {
    const itemsToUpdate = [];
    gridOptions.api.forEachNodeAfterFilterAndSort(function (rowNode, index) {
        let data = rowNode.data;
        data.results = [...data.results.slice(1, NUM_VALUES), randomNumber(0, 10)];
        itemsToUpdate.push(data);
    });
    gridOptions.api.applyTransaction({ update: itemsToUpdate });
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function addSparklineData(data) {
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
            const dataMod = data.slice(0, NUM_ROWS);
            gridOptions.api.setRowData(addSparklineData(dataMod));
        });
});
