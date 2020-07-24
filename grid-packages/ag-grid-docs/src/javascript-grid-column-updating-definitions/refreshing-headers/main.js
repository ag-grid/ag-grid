var colDefs = [
    {field: 'athlete'},
    {field: 'total'}
];

var gridOptions = {
    defaultColDef: {
        initialWidth: 100,
        sortable: true,
        resizable: true
    },
    columnDefs: colDefs,
    components: {
        MyHeaderRenderer: MyHeaderRenderer
    },
    rowSelection: 'multiple'
};

function onShowTotal() {
    console.log('>> onShowTotal');
    colDefs[1].hide = false;
    gridOptions.api.setColumnDefs(colDefs);
}

function onHideTotal() {
    console.log('>> onHideTotal');
    colDefs[1].hide = true;
    gridOptions.api.setColumnDefs(colDefs);
}

function onAHeaderNames() {
    changeCols('onAHeaderNames', function(c) {c.headerName = 'A ' + c.field})
}

function onBHeaderNames() {
    changeCols('onBHeaderNames', function(c) {c.headerName = 'B ' + c.field})
}

function onNoHeaderNames() {
    changeCols('onNoHeaderNames', function(c) {c.headerName = null})
}

function onSortOn() {
    changeCols('onSortOn', function(h) {h.sortable = true})
}

function onSortOff() {
    changeCols('onSortOff', function(h) {h.sortable = false})
}

function onMoveOn() {
    changeCols('moveOn', function(c) {c.suppressMovable = false})
}

function onMoveOff() {
    changeCols('moveOff', function(c) {c.suppressMovable = true})
}

function onTooltipA() {
    changeCols('onTooltipA', function(c) {c.headerTooltip = 'A ' + c.field; });
}

function onTooltipB() {
    changeCols('onTooltipB', function(c) {c.headerTooltip = 'B ' + c.field; });
}

function onTooltipOff() {
    changeCols('onTooltipOff', function(c) {c.headerTooltip = undefined; });
}

function onResizeOn() {
    changeCols('onResizeOn', function(c) {c.resizable = true; });
}

function onResizeOff() {
    changeCols('onResizeOff', function(c) {c.resizable = false; });
}

function onHeaderCompOn() {
    changeCols('onHeaderCompOn', function(c) {c.headerComponent = 'MyHeaderRenderer'; });
}

function onHeaderCompOff() {
    changeCols('onHeaderCompOff', function(c) {c.headerComponent = null; });
}

function changeCols(name, callback) {
    console.log('>> ' + name);
    colDefs.forEach(callback);
    gridOptions.api.setColumnDefs(colDefs);
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
