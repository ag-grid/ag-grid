var columnDefs = [
    // group cell renderer needed for expand / collapse icons
    {field: 'name', cellRenderer:'agGroupCellRenderer'},
    {field: 'account'},
    {field: 'calls'},
    {field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'"}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
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
            onGridReady: function(params) {
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
        expandMasterRow1(params.api);
        params.api.sizeColumnsToFit();
    }
};

function expandMasterRow1() {
    gridOptions.api.forEachNode(function (node) {
        node.setExpanded(node.id === "1" ? true : node.expanded);
    });
}

function startEditingInMasterRow() {
    stopEditingInDetailRows();
    setTimeout(function () {
        gridOptions.api.startEditingCell({rowIndex: 0, colKey: 'calls'});
    }, 100);
}

function stopEditingInMasterRows() {
    gridOptions.api.stopEditing();
}

function startEditingInDetailRow(api) {
    stopEditingInMasterRows();
    expandMasterRow1();
    setTimeout(function () {
        var detailGrid = api.getDetailGridInfo("detail_1");
        detailGrid.api.startEditingCell({rowIndex: 0, colKey: 'number'});
    }, 500);
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