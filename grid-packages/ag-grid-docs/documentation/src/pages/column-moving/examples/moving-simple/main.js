var gridOptions = {
    columnDefs: [
        { field: 'athlete' },
        { field: 'age' },
        { field: 'country' },
        { field: 'year' },
        { field: 'date' },
        { field: 'sport' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' }
    ],
    defaultColDef: {
        width: 150
    },
    suppressDragLeaveHidesColumns: true,
};

function onMedalsFirst() {
    gridOptions.columnApi.moveColumns(['gold', 'silver', 'bronze', 'total'], 0);
}

function onMedalsLast() {
    gridOptions.columnApi.moveColumns(['gold', 'silver', 'bronze', 'total'], 6);
}

function onCountryFirst() {
    gridOptions.columnApi.moveColumn('country', 0);
}

function onSwapFirstTwo() {
    gridOptions.columnApi.moveColumnByIndex(0, 1);
}

function onPrintColumns() {
    var cols = gridOptions.columnApi.getAllGridColumns();
    var colToNameFunc = function(col, index) {
        return index + ' = ' + col.getId();
    };
    var colNames = cols.map(colToNameFunc).join(', ');
    console.log('columns are: ' + colNames);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
