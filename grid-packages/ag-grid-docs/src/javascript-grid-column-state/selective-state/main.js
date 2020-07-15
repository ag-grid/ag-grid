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

function onBtSaveSortState() {
    var allState = gridOptions.columnApi.getColumnState();
    var sortState = allState.map(function(state) { return {colId: state.colId, sort: state.sort} });
    window.sortState = sortState;
    console.log('sort state saved', sortState);
}

function onBtRestoreSortState() {
    if (!window.sortState) {
        console.log('no sort state to restore, you must save sort state first');
        return;
    }
    gridOptions.columnApi.applyColumnState({
        state: window.sortState
    });
    console.log('sort state restored');
}

function onBtSaveOrderAndVisibilityState() {
    var allState = gridOptions.columnApi.getColumnState();
    var orderAndVisibilityState = allState.map(function(state) { return {colId: state.colId, hide: state.hide} });
    window.orderAndVisibilityState = orderAndVisibilityState;
    console.log('order and visibility state saved', orderAndVisibilityState);
}

function onBtRestoreOrderAndVisibilityState() {
    if (!window.orderAndVisibilityState) {
        console.log('no order and visibility state to restore by, you must save order and visibility state first');
        return;
    }
    gridOptions.columnApi.applyColumnState({
        state: window.orderAndVisibilityState,
        applyOrder: true
    });
    console.log('column state restored');
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
