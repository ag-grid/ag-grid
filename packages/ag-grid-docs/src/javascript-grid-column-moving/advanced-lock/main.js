var columnDefs = [
    {lockPosition: true, valueGetter: 'node.rowIndex', cellClass: 'locked-col', width: 40, suppressNavigable: true},
    {lockPosition: true, cellRenderer: controlsCellRenderer, cellClass: 'locked-col', suppressNavigable: true},
    {field: 'athlete', width: 150},
    {field: 'age'},
    {field: 'country', width: 150},
    {field: 'year'},
    {field: 'date'},
    {field: 'sport'},
    {field: 'gold'},
    {field: 'silver'},
    {field: 'bronze'},
    {field: 'total'}
];

var gridOptions = {
    suppressDragLeaveHidesColumns: true,
    enableColResize: true,
    columnDefs: columnDefs,
    onColumnPinned: onColumnPinned,
    defaultColDef: {
        width: 100
    }
};

function onColumnPinned(event) {
    var allCols = event.columnApi.getAllGridColumns();

    var allFixedCols = allCols.filter( function(col) { return col.isLockPosition();} );
    var allNonFixedCols = allCols.filter( function(col) { return !col.isLockPosition();} );

    var pinnedCount = allNonFixedCols.filter( function(col) { return col.getPinned()==='left';} ).length;

    var pinFixed = pinnedCount > 0;

    event.columnApi.setColumnsPinned(allFixedCols, pinFixed);
}

function onPinAthlete() {
    gridOptions.columnApi.setColumnPinned('athlete', 'left');
}

function onUnpinAthlete() {
    gridOptions.columnApi.setColumnPinned('athlete', null);
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

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json'}).then(function(data) {
        gridOptions.api.setRowData(data);
    });
});
