var columnDefs = [
    {field: 'athlete'},
    {field: 'age'},
    {field: 'country'},
    {field: 'sport'},
    {field: 'year'},
    {field: 'date'},
    {field: 'gold'},
    {field: 'silver'},
    {field: 'bronze'},
    {field: 'total'}
];

var gridOptions = {
    defaultColDef: {
        sortable: true,
        resizable: true,
        width: 100,
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true
    },
    sideBar: {
        toolPanels: ['columns']
    },
    rowGroupPanelShow: 'always',
    pivotPanelShow: 'always',
    debug: true,
    columnDefs: columnDefs,
    rowData: null
};

function saveState() {
    window.colState = gridOptions.columnApi.getColumnState();
    console.log('column state saved');
}

function restoreState() {
    if (!window.colState) {
        console.log('no columns state to restore by, you must save state first');
        return;
    }
    gridOptions.columnApi.applyColumnState({
        state: window.colState,
        applyOrder: true
    });
    console.log('column state restored');
}

function resetState() {
    gridOptions.columnApi.resetColumnState();
    console.log('column state reset');
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
