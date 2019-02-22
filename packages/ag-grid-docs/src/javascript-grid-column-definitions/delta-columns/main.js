function columnDefsNormal() {
    return [
        {
            colId: 'athlete',
            field: 'athlete'
        },
        {
            colId: 'sport',
            field: 'sport'
        },
        {
            colId: 'age',
            field: 'age'
        },
        {
            colId: 'year',
            field: 'year'
        }
    ];
}

function columnDefsReverseOrder() {
    return [
        {
            colId: 'year',
            field: 'year'
        },
        {
            colId: 'age',
            field: 'age'
        },
        {
            colId: 'sport',
            field: 'sport'
        },
        {
            colId: 'athlete',
            field: 'athlete'
        },
    ];
}

function columnDefsWidths() {
    return [
        {
            colId: 'athlete',
            field: 'athlete',
            headerName: 'The New Header',
            width: 150
        },
        {
            colId: 'sport',
            field: 'sport',
            width: 150
        },
        {
            colId: 'age',
            field: 'age',
            width: 50
        },
        {
            colId: 'year',
            field: 'year',
            width: 50
        }
    ];
}

function columnDefsVisibility() {
    return [
        {
            colId: 'athlete',
            field: 'athlete'
        },
        {
            colId: 'sport',
            field: 'sport'
        },
        {
            colId: 'age',
            field: 'age',
            hide: true
        },
        {
            colId: 'year',
            field: 'year',
            hide: true
        }
    ];
}

function columnDefsGrouping() {
    return [
        {
            colId: 'athlete',
            field: 'athlete'
        },
        {
            colId: 'sport',
            field: 'sport',
            rowGroup: true
        },
        {
            colId: 'age',
            field: 'age'
        },
        {
            colId: 'year',
            field: 'year'
        }
    ];
}

function columnDefsNoResizeOrSort() {
    return [
        {
            colId: 'athlete',
            field: 'athlete',
            resizable: false,
            sortable: false
        },
        {
            colId: 'sport',
            field: 'sport',
            resizable: false,
            sortable: false
        },
        {
            colId: 'age',
            field: 'age',
            resizable: false,
            sortable: false
        },
        {
            colId: 'year',
            field: 'year',
            resizable: false,
            sortable: false
        }
    ];
}

function columnDefsPinned() {
    return [
        {
            colId: 'athlete',
            field: 'athlete',
            pinned: 'left'
        },
        {
            colId: 'sport',
            field: 'sport',
            pinned: 'right'
        },
        {
            colId: 'age',
            field: 'age'
        },
        {
            colId: 'year',
            field: 'year'
        }
    ];
}

var gridOptions = {
    defaultColDef: {
        width: 180,
        resizable: true,
        sortable: true
    },
    deltaColumnMode: true,
    columnDefs: columnDefsNormal(),
    onColumnPinned: onColumnPinned,
    onColumnVisible: onColumnVisible,
    onColumnResized: onColumnResized,
    onColumnMoved: onColumnMoved,
    onColumnRowGroupChanged: onColumnRowGroupChanged,
    onColumnPivotChanged: onColumnPivotChanged,
    onNewColumnsLoaded: onNewColumnsLoaded,
    sideBar: {
        toolPanels: ['columns']
    }
};

function onColumnPinned(e) {
    console.log('Column Event: ' + e.type, e);
}

function onColumnVisible(e) {
    console.log('Column Event: ' + e.type, e);
}

function onColumnResized(e) {
    console.log('Column Event: ' + e.type, e);
}

function onColumnMoved(e) {
    console.log('Column Event: ' + e.type, e);
}

function onColumnRowGroupChanged(e) {
    console.log('Column Event: ' + e.type, e);
}

function onColumnPivotChanged(e) {
    console.log('Column Event: ' + e.type, e);
}

function onNewColumnsLoaded(e) {
    console.log('Column Event: ' + e.type, e);
}

function onBtNormal() {
    gridOptions.api.setColumnDefs(columnDefsNormal());
}

function onBtReverseOrder() {
    gridOptions.api.setColumnDefs(columnDefsReverseOrder());
}

function onBtWidths() {
    gridOptions.api.setColumnDefs(columnDefsWidths());
}

function onBtVisibility() {
    gridOptions.api.setColumnDefs(columnDefsVisibility());
}

function onBtGrouping() {
    gridOptions.api.setColumnDefs(columnDefsGrouping());
}

function onBtNoResizeOrSort() {
    gridOptions.api.setColumnDefs(columnDefsNoResizeOrSort());
}

function onBtPinned() {
    gridOptions.api.setColumnDefs(columnDefsPinned());
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json'}).then(function (data) {
        gridOptions.api.setRowData(data);
    });
});
