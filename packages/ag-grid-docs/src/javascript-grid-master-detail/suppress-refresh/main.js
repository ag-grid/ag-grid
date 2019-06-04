var columnDefs = [
    // group cell renderer needed for expand / collapse icons
    {field: 'name', cellRenderer: 'agGroupCellRenderer'},
    {field: 'account'},
    {field: 'calls'},
    {field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'"}
];

var gridOptions = {
    columnDefs: columnDefs,
    masterDetail: true,
    enableCellChangeFlash: true,
    detailCellRendererParams: {

        // this property stops the refresh in the detail grid
        suppressRefresh: true,

        detailGridOptions: {
            defaultColDef: {
                sortable: true
            },
            columnDefs: [
                {field: 'callId'},
                {field: 'direction'},
                {field: 'number'},
                {field: 'duration', valueFormatter: "x.toLocaleString() + 's'"},
                {field: 'switchCode'}
            ],
            onFirstDataRendered(params) {
                params.api.sizeColumnsToFit();
            }
        },
        getDetailRowData: function (params) {
            // params.successCallback([]);
            params.successCallback(params.data.callRecords);
        }
    },
    onGridReady: function (params) {
        // arbitrarily expand a row for presentational purposes
        setTimeout(function () {
            var rowCount = 0;
            params.api.forEachNode(function (node) {
                node.setExpanded(rowCount++ === 0);
            });
        }, 500);
    },
    onFirstDataRendered(params) {
        params.api.sizeColumnsToFit();
    }
};

var count = 0;
var allRowData;

setInterval(function() {
    if (!allRowData) {
        return;
    }

    var data = allRowData[(count++ % allRowData.length)];
    data.calls++;

    var tran = {
        update: [data]
    };

    gridOptions.api.updateRowData(tran);
}, 1000);

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/latest/src/javascript-grid-master-detail/simple/data/data.json'}).then(function (data) {
        allRowData = data;
        gridOptions.api.setRowData(data);
    });
});