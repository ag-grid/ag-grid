var gridOptions = {
    columnDefs: [
        { field: 'symbol', maxWidth: 110 },
        { field: 'name', minWidth: 250 },
        { field: 'lastPrice', type: 'numericColumn' },
        { field: 'volume', type: 'numericColumn' },
        {
            field: 'history',
            headerName: 'Close History',
            minWidth: 100,
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: { type: 'area' },
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

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
