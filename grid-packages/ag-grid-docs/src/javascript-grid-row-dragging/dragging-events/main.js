var gridOptions = {
    columnDefs: [
        { field: "athlete", rowDrag: true },
        { field: "country" },
        { field: "year", width: 100 },
        { field: "date" },
        { field: "sport" },
        { field: "gold" },
        { field: "silver" },
        { field: "bronze" }
    ],
    defaultColDef: {
        width: 170,
        sortable: true,
        filter: true
    },
    animateRows: true,
    onRowDragEnter: onRowDragEnter,
    onRowDragEnd: onRowDragEnd,
    onRowDragMove: onRowDragMove,
    onRowDragLeave: onRowDragLeave
};

function onRowDragEnter(e) {
    console.log('onRowDragEnter', e);
}

function onRowDragEnd(e) {
    console.log('onRowDragEnd', e);
}

function onRowDragMove(e) {
    console.log('onRowDragMove', e);
}

function onRowDragLeave(e) {
    console.log('onRowDragLeave', e);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
