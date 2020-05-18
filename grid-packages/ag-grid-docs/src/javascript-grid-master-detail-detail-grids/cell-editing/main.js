var gridOptions = {
    columnDefs: [
        // group cell renderer needed for expand / collapse icons
        { field: 'name', cellRenderer: 'agGroupCellRenderer' },
        { field: 'account' },
        { field: 'calls' },
        { field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'" }
    ],
    masterDetail: true,
    detailCellRendererParams: {
        detailGridOptions: {
            columnDefs: [
                { field: 'callId' },
                { field: 'direction' },
                { field: 'number', minWidth: 150 },
                { field: 'duration', valueFormatter: "x.toLocaleString() + 's'" },
                { field: 'switchCode', minWidth: 150 }
            ],
            defaultColDef: {
                flex: 1,
                editable: true,
                resizable: true
            }
        },
        getDetailRowData: function(params) {
            params.successCallback(params.data.callRecords);
        }
    },
    defaultColDef: {
        flex: 1,
        editable: true,
        resizable: true
    },
    onFirstDataRendered: onFirstDataRendered
};

function onFirstDataRendered(params) {
    // arbitrarily expand a row for presentational purposes
    setTimeout(function() { params.api.getDisplayedRowAtIndex(1).setExpanded(true); }, 0);
}

function startEditingInMasterRow() {
    // stop editing in detail grid
    gridOptions.api.forEachDetailGridInfo(function(detailGridApi) {
        detailGridApi.api.stopEditing();
    });

    // start editing in master grid
    gridOptions.api.startEditingCell({ rowIndex: 0, colKey: 'calls' });
}

function stopEditingInMasterRows() {
    gridOptions.api.stopEditing();
}

function startEditingInDetailRow() {
    // stop editing in master grid
    gridOptions.api.stopEditing();

    // start editing in detail grid
    var detailGrid = gridOptions.api.getDetailGridInfo("detail_1");
    detailGrid.api.startEditingCell({ rowIndex: 0, colKey: 'number' });
}

function stopEditingInDetailRows() {
    gridOptions.api.forEachDetailGridInfo(function(detailGridApi) {
        detailGridApi.api.stopEditing();
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/latest/src/javascript-grid-master-detail/cell-editing/data/data.json' }).then(function(data) {
        gridOptions.api.setRowData(data);
    });
});
