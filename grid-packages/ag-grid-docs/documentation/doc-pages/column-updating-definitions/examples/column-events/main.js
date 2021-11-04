function getColumnDefs() {
    return [
        {field: 'athlete'},
        {field: 'age'},
        {field: 'country'},
        {field: 'sport'},
        {field: 'gold'},
        {field: 'silver'},
        {field: 'bronze'}
    ];
}

function onSortChanged(e) {
    console.log('Event Sort Changed', e);
}

function onColumnResized(e) {
    console.log('Event Column Resized', e);
}

function onColumnVisible(e) {
    console.log('Event Column Visible', e);
}

function onColumnPivotChanged(e) {
    console.log('Event Pivot Changed', e);
}

function onColumnRowGroupChanged(e) {
    console.log('Event Row Group Changed', e);
}

function onColumnValueChanged(e) {
    console.log('Event Value Changed', e);
}

function onColumnMoved(e) {
    console.log('Event Column Moved', e);
}

function onColumnPinned(e) {
    console.log('Event Column Pinned', e);
}

var gridOptions = {
    defaultColDef: {
        sortable: true,
        resizable: true,
        width: 150,
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true
    },
    columnDefs: getColumnDefs(),
    rowData: null,
    onSortChanged: onSortChanged,
    onColumnResized: onColumnResized,
    onColumnVisible: onColumnVisible,
    onColumnPivotChanged: onColumnPivotChanged,
    onColumnRowGroupChanged: onColumnRowGroupChanged,
    onColumnValueChanged: onColumnValueChanged,
    onColumnMoved: onColumnMoved,
    onColumnPinned: onColumnPinned
};

function onBtSortOn() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
        if (colDef.field === 'age') {
            colDef.sort = 'desc';
        }
        if (colDef.field === 'athlete') {
            colDef.sort = 'asc';
        }
    });
    gridOptions.api.setColumnDefs(columnDefs);
}

function onBtSortOff() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
        colDef.sort = null;
    });
    gridOptions.api.setColumnDefs(columnDefs);
}

function onBtWidthNarrow() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
        if (colDef.field === 'age' || colDef.field === 'athlete') {
            colDef.width = 100;
        }
    });
    gridOptions.api.setColumnDefs(columnDefs);
}

function onBtWidthNormal() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
        colDef.width = 200;
    });
    gridOptions.api.setColumnDefs(columnDefs);
}

function onBtHide() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
        if (colDef.field === 'age' || colDef.field === 'athlete') {
            colDef.hide = true;
        }
    });
    gridOptions.api.setColumnDefs(columnDefs);
}

function onBtShow() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
        colDef.hide = false;
    });
    gridOptions.api.setColumnDefs(columnDefs);
}

function onBtPivotOn() {
    gridOptions.columnApi.setPivotMode(true);

    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
        if (colDef.field === 'country') {
            colDef.pivot = true;
        }
    });
    gridOptions.api.setColumnDefs(columnDefs);
}

function onBtPivotOff() {
    gridOptions.columnApi.setPivotMode(false);

    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
        colDef.pivot = false;
    });
    gridOptions.api.setColumnDefs(columnDefs);
}

function onBtRowGroupOn() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
        if (colDef.field === 'sport') {
            colDef.rowGroup = true;
        }
    });
    gridOptions.api.setColumnDefs(columnDefs);
}

function onBtRowGroupOff() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
        colDef.rowGroup = false;
    });
    gridOptions.api.setColumnDefs(columnDefs);
}

function onBtAggFuncOn() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
        if (colDef.field === 'gold' || colDef.field === 'silver' || colDef.field === 'bronze') {
            colDef.aggFunc = 'sum';
        }
    });
    gridOptions.api.setColumnDefs(columnDefs);
}

function onBtAggFuncOff() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
        colDef.aggFunc = null;
    });
    gridOptions.api.setColumnDefs(columnDefs);
}

function onBtPinnedOn() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
        if (colDef.field === 'athlete') {
            colDef.pinned = 'left';
        }
        if (colDef.field === 'age') {
            colDef.pinned = 'right';
        }
    });
    gridOptions.api.setColumnDefs(columnDefs);
}

function onBtPinnedOff() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
        colDef.pinned = null;
    });
    gridOptions.api.setColumnDefs(columnDefs);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(data => gridOptions.api.setRowData(data));
});
