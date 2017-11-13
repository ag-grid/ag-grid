var masterColumnDefs = [
    // group cell renderer needed for expand / collapse icons
    {field: 'name', cellRenderer: 'group'},
    {field: 'account'},
    {field: 'calls'},
    {field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'"}
];

var detailColumnDefs = [
    {field: 'callId'},
    {field: 'direction'},
    {field: 'number'},
    {field: 'duration', valueFormatter: "x.toLocaleString() + 's'"},
    {field: 'switchCode'}
];

var detailGridOptions = {
    columnDefs: detailColumnDefs,
    enableColResize: true,
    defaultColDef: {
        editable: true
    }
};

var masterGridOptions = {
    columnDefs: masterColumnDefs,
    rowData: rowData,
    enableColResize: true,
    defaultColDef: {
        editable: true
    },
    masterDetail: true,
    detailCellRendererParams: {
        detailGridOptions: detailGridOptions,
        getDetailRowData: function(params) {
            params.successCallback(params.data.callRecords);
        }
    },
    detailRowHeight: 200,
    onGridReady: function () {
        expandMasterRow1();
    }
};

function expandMasterRow1() {
    masterGridOptions.api.forEachNode(function (node) {
        node.setExpanded(node.id === "1" ? true : node.expanded);
    });
}

function startEditingInMasterRow() {
    stopEditingInDetailRows();
    setTimeout(function () {
        masterGridOptions.api.startEditingCell({rowIndex: 0, colKey: 'calls'});
    }, 100);
}

function stopEditingInMasterRows() {
    masterGridOptions.api.stopEditing();
}

function startEditingInDetailRow() {
    stopEditingInMasterRows();
    expandMasterRow1();
    setTimeout(function () {
        var detailGrid = masterGridOptions.api.getDetailGridInfo("detail_1");
        detailGrid.api.startEditingCell({rowIndex: 0, colKey: 'number'});
    }, 100);
}

function stopEditingInDetailRows() {
    masterGridOptions.api.forEachDetailGridInfo(function(detailGridApi) {
        detailGridApi.api.stopEditing();
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, masterGridOptions);
});