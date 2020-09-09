var columnDefs = [
    {
        lockPosition: true,
        valueGetter: 'node.rowIndex',
        cellClass: 'locked-col',
        width: 60,
        suppressNavigable: true
    },
    {
        lockPosition: true,
        cellRenderer: controlsCellRenderer,
        cellClass: 'locked-col',
        width: 120,
        suppressNavigable: true
    },
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
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        width: 150,
        resizable: true
    },
    onColumnPinned: onColumnPinned,
    suppressDragLeaveHidesColumns: true,
};

function onColumnPinned(event) {
    var allCols = event.columnApi.getAllGridColumns();

    var allFixedCols = allCols.filter(function(col) { return col.getColDef().lockPosition; });
    var allNonFixedCols = allCols.filter(function(col) { return !col.getColDef().lockPosition; });

    var pinnedCount = allNonFixedCols.filter(function(col) { return col.getPinned() === 'left'; }).length;

    var pinFixed = pinnedCount > 0;

    var columnStates = [];
    allFixedCols.forEach(function (col) {
        if (pinFixed !== col.isPinned()) {
            columnStates.push({
                colId: col.getId(),
                pinned: pinFixed ? 'left' : null
            })
        }
    });

    if (columnStates.length>0) {
        event.columnApi.applyColumnState({state: columnStates});
    }
}

function onPinAthlete() {
    gridOptions.columnApi.applyColumnState({state: [{colId: 'athlete', pinned: 'left'}]});
}

function onUnpinAthlete() {
    gridOptions.columnApi.applyColumnState({state: [{colId: 'athlete', pinned: null}]});
}

// simple cell renderer returns dummy buttons. in a real application, a component would probably
// be used with operations tied to the buttons. in this example, the cell renderer is just for
// display purposes.
function controlsCellRenderer() {
    return '<button>A</button><button>B</button><button>C</button>';
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
