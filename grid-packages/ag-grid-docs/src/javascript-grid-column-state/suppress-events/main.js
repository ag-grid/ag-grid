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
    suppressSetColumnStateEvents: true,
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

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
