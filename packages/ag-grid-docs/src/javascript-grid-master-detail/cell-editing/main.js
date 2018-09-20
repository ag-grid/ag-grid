var columnDefs = [
    // group cell renderer needed for expand / collapse icons
    {field: 'name', cellRenderer:'agGroupCellRenderer'},
    {field: 'account'},
    {field: 'calls'},
    {field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'"}
];

var gridOptions = {
    columnDefs: columnDefs,
    enableColResize: true,
    masterDetail: true,
    detailCellRendererParams: {
        detailGridOptions: {
            columnDefs: [
                {field: 'callId'},
                {field: 'direction'},
                {field: 'number'},
                {field: 'duration', valueFormatter: "x.toLocaleString() + 's'"},
                {field: 'switchCode'}
            ],
            enableColResize: true,
            defaultColDef: {
                editable: true
            },
            onFirstDataRendered(params) {
                params.api.sizeColumnsToFit();
            }
        },
        getDetailRowData: function(params) {
            params.successCallback(params.data.callRecords);
        }
    },
    detailRowHeight: 340,
    defaultColDef: {
        editable: true
    },
    onGridReady: function (params) {
        // arbitrarily expand a row for presentational purposes
        setTimeout(function() {
            var rowCount = 0;
            params.api.forEachNode(function (node) {
                node.setExpanded(rowCount++ === 1);
            });
        }, 500);
    },
    onFirstDataRendered(params) {
        params.api.sizeColumnsToFit();
    }
};

function startEditingInMasterRow() {
    // stop editing in detail grid
    gridOptions.api.forEachDetailGridInfo(function(detailGridApi) {
        detailGridApi.api.stopEditing();
    });

    // start editing in master grid
    gridOptions.api.startEditingCell({rowIndex: 0, colKey: 'calls'});
}

function stopEditingInMasterRows() {
    gridOptions.api.stopEditing();
}

function startEditingInDetailRow() {
    // stop editing in master grid
    gridOptions.api.stopEditing();

    // start editing in detail grid
    var detailGrid = gridOptions.api.getDetailGridInfo("detail_1");
    detailGrid.api.startEditingCell({rowIndex: 0, colKey: 'number'});
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

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/latest/src/javascript-grid-master-detail/cell-editing/data/data.json'}).then(function(data) {
        gridOptions.api.setRowData(data);
    });
});