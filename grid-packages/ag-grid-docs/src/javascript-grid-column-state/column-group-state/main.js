var columnDefs = [
    {
        headerName: "Athlete",
        children: [
            { field: "athlete" },
            { field: "country", columnGroupShow: 'open' },
            { field: 'sport', columnGroupShow: 'open'},
            { field: 'year', columnGroupShow: 'open'},
            { field: 'date', columnGroupShow: 'open'}
        ]
    },
    {
        headerName: "Medals",
        children: [
            { field: "total", columnGroupShow: 'closed' },
            { field: "gold", columnGroupShow: 'open' },
            { field: "silver", columnGroupShow: 'open' },
            { field: "bronze", columnGroupShow: 'open' }
        ]
    }
];

var gridOptions = {
    defaultColDef: {
        width: 150,
        resizable: true
    },
    columnDefs: columnDefs,
    rowData: null
};

function saveState() {
    window.groupState = gridOptions.columnApi.getColumnGroupState();
    console.log('group state saved', window.groupState);
    console.log('column state saved');
}

function restoreState() {
    if (!window.groupState) {
        console.log('no columns state to restore by, you must save state first');
        return;
    }
    gridOptions.columnApi.setColumnGroupState(window.groupState);
    console.log('column state restored');
}

function resetState() {
    gridOptions.columnApi.resetColumnGroupState();
    console.log('column state reset');
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
