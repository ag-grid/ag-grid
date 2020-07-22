var colDefs = [
    {field: 'athlete'},
    // {field: 'age'},
    // {field: 'country'},
    // {field: 'sport'},
    // {field: 'year'},
    // {field: 'date'},
    // {field: 'gold'},
    // {field: 'silver'},
    // {field: 'bronze'},
    {field: 'total'}
];

var gridOptions = {
    defaultColDef: {
        defaultWidth: 100,
        sortable: true,
        resizable: true,
        // headerComponent: 'MyHeaderRenderer'
    },
    columnDefs: colDefs,
    components: {
        MyHeaderRenderer: MyHeaderRenderer
    }
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
    changeCols('moveOn', function(c) {c.suppressMove = false})
}

function onMoveOff() {
    changeCols('moveOff', function(c) {c.suppressMove = true})
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
