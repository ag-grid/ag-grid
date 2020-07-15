var columnDefs = [
    {field: 'athlete'},
    {field: 'age'},
    {field: 'country'},
    {field: 'sport'},
    {field: 'gold'},
    {field: 'silver'},
    {field: 'bronze'}
];

var gridOptions = {
    defaultColDef: {
        sortable: true,
        resizable: true,
        width: 150,
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true
    },
    debug: true,
    columnDefs: columnDefs,
    rowData: null,
    onSortChanged: function(e) {
        console.log('Event Sort Changed', e);
    },
    onColumnResized: function (e) {
        console.log('Event Column Resized', e);
    },
    onColumnVisible: function (e) {
        console.log('Event Column Visible', e);
    },
    onColumnPivotChanged: function (e) {
        console.log('Event Pivot Changed', e);
    },
    onColumnRowGroupChanged: function (e) {
        console.log('Event Row Group Changed', e);
    },
    onColumnValueChanged: function (e) {
        console.log('Event Value Changed', e);
    },
    onColumnMoved: function (e) {
        console.log('Event Column Moved', e);
    },
    onColumnPinned: function (e) {
        console.log('Event Column Pinned', e);
    }
};

function onBtSortOn() {
    gridOptions.columnApi.applyColumnState({
        state: [
            {colId: 'age', sort: 'desc'},
            {colId: 'athlete', sort: 'asc'}
        ]
    });
}

function onBtSortOff() {
    gridOptions.columnApi.applyColumnState({
        defaultState: {sort: null}
    });
}

function onBtWidthNarrow() {
    gridOptions.columnApi.applyColumnState({
        state: [
            {colId: 'age', width: 100},
            {colId: 'athlete', width: 100}
        ]
    });
}

function onBtWidthNormal() {
    gridOptions.columnApi.applyColumnState({
        state: [
            {colId: 'age', width: 200},
            {colId: 'athlete', width: 200}
        ]
    });
}

function onBtHide() {
    gridOptions.columnApi.applyColumnState({
        state: [
            {colId: 'age', hide: true},
            {colId: 'athlete', hide: true}
        ]
    });
}

function onBtShow() {
    gridOptions.columnApi.applyColumnState({
        defaultState: {hide: false}
    });
}

function onBtPivotOn() {
    gridOptions.columnApi.setPivotMode(true);
    gridOptions.columnApi.applyColumnState({
        state: [
            {colId: 'country', pivot: true}
        ]
    });
}

function onBtPivotOff() {
    gridOptions.columnApi.setPivotMode(false);
    gridOptions.columnApi.applyColumnState({
        defaultState: {pivot: false}
    });
}

function onBtRowGroupOn() {
    gridOptions.columnApi.applyColumnState({
        state: [
            {colId: 'sport', rowGroup: true}
        ]
    });
}

function onBtRowGroupOff() {
    gridOptions.columnApi.applyColumnState({
        defaultState: {rowGroup: false}
    });
}

function onBtAggFuncOn() {
    gridOptions.columnApi.applyColumnState({
        state: [
            {colId: 'gold', aggFunc: 'sum'},
            {colId: 'silver', aggFunc: 'sum'},
            {colId: 'bronze', aggFunc: 'sum'},
        ]
    });
}

function onBtAggFuncOff() {
    gridOptions.columnApi.applyColumnState({
        defaultState: {aggFunc: null}
    });
}

function onBtNormalOrder() {
    gridOptions.columnApi.applyColumnState({
        state: [
            {colId: 'athlete'},
            {colId: 'age'},
            {colId: 'country'},
            {colId: 'sport'},
            {colId: 'gold'},
            {colId: 'silver'},
            {colId: 'bronze'}
        ],
        applyOrder: true
    });
}

function onBtReverseOrder() {
    gridOptions.columnApi.applyColumnState({
        state: [
            {colId: 'athlete'},
            {colId: 'age'},
            {colId: 'country'},
            {colId: 'sport'},
            {colId: 'bronze'},
            {colId: 'silver'},
            {colId: 'gold'}
        ],
        applyOrder: true
    });
}

function onBtPinnedOn() {
    gridOptions.columnApi.applyColumnState({
        state: [
            {colId: 'athlete', pinned: 'left'},
            {colId: 'age', pinned: 'right'}
        ]
    });
}

function onBtPinnedOff() {
    gridOptions.columnApi.applyColumnState({
        defaultState: {pinned: null}
    });
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
