var gridOptions = {
    masterDetail: true,
    isRowMaster: function(dataItem) {
        return dataItem ? dataItem.callRecords.length > 0 : false;
    },
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
    getRowNodeId: function(data) { return data.account; },
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
                flex: 1
            },
        },
        getDetailRowData: function(params) {
            params.successCallback(params.data.callRecords);
        }
    },
    onFirstDataRendered: onFirstDataRendered
};

function onFirstDataRendered(params) {
    // arbitrarily expand a row for presentational purposes
    setTimeout(function() { params.api.getDisplayedRowAtIndex(1).setExpanded(true); }, 0);
}

function onBtClearMilaCalls() {
    var milaSmithRowNode = gridOptions.api.getRowNode('177001');
    var milaSmithData = milaSmithRowNode.data;
    milaSmithData.callRecords = [];
    gridOptions.api.applyTransaction({update: [milaSmithData]});
}

function onBtSetMilaCalls() {
    var milaSmithRowNode = gridOptions.api.getRowNode('177001');
    var milaSmithData = milaSmithRowNode.data;
    milaSmithData.callRecords = [{
        "name": "susan",
        "callId": 579,
        "duration": 23,
        "switchCode": "SW5",
        "direction": "Out",
        "number": "(02) 47485405"
    }, {
        "name": "susan",
        "callId": 580,
        "duration": 52,
        "switchCode": "SW3",
        "direction": "In",
        "number": "(02) 32367069"
    }];
    gridOptions.api.applyTransaction({update: [milaSmithData]});
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/latest/src/javascript-grid-master-detail/dynamic-master-nodes/data/data.json' }).then(function(data) {
        gridOptions.api.setRowData(data);
    });
});
