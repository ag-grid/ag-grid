var gridOptions = {
    columnDefs: [
        // group cell renderer needed for expand / collapse icons
        { field: 'name', cellRenderer: 'agGroupCellRenderer' },
        { field: 'account' },
        { field: 'calls' },
        { field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'" }
    ],
    defaultColDef: {
        flex: 1
    },
    masterDetail: true,
    enableCellChangeFlash: true,
    detailCellRendererParams: {

        // this property stops the refresh in the detail grid
        suppressRefresh: true,

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
                sortable: true
            }
        },
        getDetailRowData: function(params) {
            // params.successCallback([]);
            params.successCallback(params.data.callRecords);
        }
    },
    onFirstDataRendered: onFirstDataRendered
};

function onFirstDataRendered(params) {
    // arbitrarily expand a row for presentational purposes
    setTimeout(function() { params.api.getDisplayedRowAtIndex(0).setExpanded(true); }, 0);
}

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
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/latest/src/javascript-grid-master-detail/simple/data/data.json' }).then(function(data) {
        allRowData = data;
        gridOptions.api.setRowData(data);
    });
});