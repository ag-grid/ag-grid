var gridOptions = {
    columnDefs: [
        { field: "athlete" },
        { field: "country", rowGroup: true },
        { field: "city", rowGroup: true },
        { field: "year" },
        { field: "gold", aggFunc: 'sum' },
        { field: "silver", aggFunc: 'sum' },
        { field: "bronze", aggFunc: 'sum' }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        resizable: true,
    },
    autoGroupColumnDef: {
        headerName: 'Group',
        field: 'athlete',
        minWidth: 220,
        cellRenderer:'agGroupCellRenderer',
    },
    rowData: rowData,

    // set this to true to remove single children
    groupRemoveSingleChildren: false,

    // set this to true to remove leaf level single children
    groupRemoveLowestSingleChildren: false,

    // expand everything by default
    groupDefaultExpanded: -1,

    suppressAggFuncInHeader: true,
    animateRows: true,
};

function changeSelection(type) {
    // normal, single or lowest
    if (type === 'normal') {
        gridOptions.api.setGroupRemoveSingleChildren(false);
        gridOptions.api.setGroupRemoveLowestSingleChildren(false);
    } else if (type === 'single') {
        gridOptions.api.setGroupRemoveSingleChildren(true);
        gridOptions.api.setGroupRemoveLowestSingleChildren(false);
    } else if (type === 'lowest') {
        gridOptions.api.setGroupRemoveLowestSingleChildren(true);
        gridOptions.api.setGroupRemoveSingleChildren(false);
    } else {
        console.log('unknown type: ' + type);
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
