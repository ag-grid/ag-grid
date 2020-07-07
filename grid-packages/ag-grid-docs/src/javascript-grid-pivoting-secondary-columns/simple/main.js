var gridOptions = {
    columnDefs: [
        { field: "country", rowGroup: true, enableRowGroup: true },
        { field: "sport", pivot: true },
        { field: "year", pivot: true, enablePivot: true },
        // { field: "age", pivot: true, enablePivot: true },
        { field: "date" },
        { field: "gold", aggFunc: 'sum' },
        { field: "silver", aggFunc: 'sum' },
        { field: "bronze", aggFunc: 'sum' }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        sortable: true,
        resizable: true
    },
    autoGroupColumnDef: {
        minWidth: 250,
    },
    // set rowData to null or undefined to show loading panel by default
    pivotMode: true,

    pivotExpandableGroups: true,
    // pivotColumnGroupTotals:'before',
    // pivotRowTotals: 'before'
    // debug: true
};


function expandAll(expand) {
    var columnApi = gridOptions.columnApi;

    var expandedState = columnApi.getColumnGroupState()
        .map(function (state) {
            state.open = expand;
            return state;
        });

    columnApi.setColumnGroupState(expandedState);
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
