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
    detailCellRendererParams: {
        detailGridOptions: {
            columnDefs: [
                { field: 'callId' },
                { field: 'direction' },
                { field: 'number' },
                { field: 'duration', valueFormatter: "x.toLocaleString() + 's'" },
                { field: 'switchCode' }
            ],
            defaultColDef: {
                flex: 1
            }
        },
        getDetailRowData: function(params) {
            params.successCallback(params.data.callRecords);
        },
        template: function(params) {
            var personName = params.data.name;
            return '<div style="height: 100%; background-color: #EDF6FF; padding: 20px; box-sizing: border-box;">'
                + '  <div style="height: 10%;">Name: ' + personName + '</div>'
                + '  <div ref="eDetailGrid" style="height: 90%;"></div>'
                + '</div>';
        }
    },
    onFirstDataRendered: onFirstDataRendered
};

function onFirstDataRendered(params) {
    // arbitrarily expand a row for presentational purposes
    setTimeout(function() { params.api.getDisplayedRowAtIndex(1).setExpanded(true); }, 0);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/latest/src/javascript-grid-master-detail/template-callback-customisation/data/data.json' }).then(function(data) {
        gridOptions.api.setRowData(data);
    });
});
