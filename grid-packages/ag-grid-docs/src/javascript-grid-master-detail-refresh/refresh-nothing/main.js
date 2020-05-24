var gridOptions = {
    columnDefs: [
        // group cell renderer needed for expand / collapse icons
        { field: 'name', cellRenderer: 'agGroupCellRenderer' },
        { field: 'account' },
        { field: 'calls' },
        { field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'" },
    ],
    defaultColDef: {
        flex: 1,
    },
    masterDetail: true,
    enableCellChangeFlash: true,
    detailCellRendererParams: {
        refreshStrategy: 'nothing',

        template: function(params) {
            return '<div class="ag-details-row ag-details-row-fixed-height">' +
                        '<div style="padding: 4px; font-weight: bold;">'+params.data.name+' '+params.data.calls+' calls</div>' +
                        '<div ref="eDetailGrid" class="ag-details-grid ag-details-grid-fixed-height"/>' +
                    '</div>';
        },

        detailGridOptions: {
            rowSelection: 'multiple',
            enableCellChangeFlash: true,
            immutableData: true,
            getRowNodeId: function(data) {return data.callId;},
            columnDefs: [
                { field: 'callId', checkboxSelection: true },
                { field: 'direction' },
                { field: 'number', minWidth: 150 },
                { field: 'duration', valueFormatter: "x.toLocaleString() + 's'" },
                { field: 'switchCode', minWidth: 150 },
            ],
            defaultColDef: {
                flex: 1,
                sortable: true,
            },
        },
        getDetailRowData: function(params) {
            // params.successCallback([]);
            params.successCallback(params.data.callRecords);
        },
    },
    onFirstDataRendered: onFirstDataRendered,
};

var allRowData;

function onFirstDataRendered(params) {
    // arbitrarily expand a row for presentational purposes
    setTimeout(function() {
        params.api.getDisplayedRowAtIndex(0).setExpanded(true);
    }, 0);

    setInterval(function() {
        if (!allRowData) {
            return;
        }

        var data = allRowData[0];

        var newCallRecords = [];
        data.callRecords.forEach( function(record, index) {
            newCallRecords.push({
                name: record.name,
                callId: record.callId,
                duration: record.duration + (index % 2),
                switchCode: record.switchCode,
                direction: record.direction,
                number: record.number
            });
        });

        data.callRecords = newCallRecords;
        data.calls++;

        var tran = {
            update: [data],
        };

        params.api.applyTransaction(tran);
    }, 2000);

}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid
        .simpleHttpRequest({
            url:
                'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/latest/src/javascript-grid-master-detail/simple/data/data.json',
        })
        .then(function(data) {
            allRowData = data;
            gridOptions.api.setRowData(data);
        });
});
