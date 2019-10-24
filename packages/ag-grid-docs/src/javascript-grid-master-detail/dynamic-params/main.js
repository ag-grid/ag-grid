var columnDefs = [
    // group cell renderer needed for expand / collapse icons
    { field: 'name', cellRenderer: 'agGroupCellRenderer' },
    { field: 'account' },
    { field: 'calls' },
    { field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'" }
];

var gridOptions = {
    columnDefs: columnDefs,
    masterDetail: true,
    detailRowHeight: 150,
    detailCellRendererParams: function(params) {
        var res = {};

        // we use the same getDetailRowData for both options
        res.getDetailRowData = function(params) {
            params.successCallback(params.data.callRecords);
        };

        var nameMatch = params.data.name === 'Mila Smith' || params.data.name === 'Harper Johnson';

        if (nameMatch) {
            // grid options for columns {callId, number}
            res.detailGridOptions = {
                columnDefs: [
                    { field: 'callId' },
                    { field: 'number' }
                ],
                onGridReady: function(params) {
                    console.log('Using option 1 with columns {callId, number}');
                },
                onFirstDataRendered: function(params) {
                    params.api.sizeColumnsToFit();
                }
            };
        } else {
            // grid options for columns {callId, direction, duration, switchCode}
            res.detailGridOptions = {
                columnDefs: [
                    { field: 'callId' },
                    { field: 'direction' },
                    { field: 'duration', valueFormatter: "x.toLocaleString() + 's'" },
                    { field: 'switchCode' }
                ],
                onGridReady: function(params) {
                    console.log('Using option 2 with columns {callId, direction, duration, switchCode}');
                },
                onFirstDataRendered: function(params) {
                    params.api.sizeColumnsToFit();
                }
            };
        }

        return res;
    },
    onFirstDataRendered: onFirstDataRendered
};

function onFirstDataRendered(params) {
    params.api.sizeColumnsToFit();

    // arbitrarily expand a row for presentational purposes
    setTimeout(function() {
        var node1 = params.api.getDisplayedRowAtIndex(1);
        var node2 = params.api.getDisplayedRowAtIndex(2);
        node1.setExpanded(true);
        node2.setExpanded(true);
    }, 0);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/latest/src/javascript-grid-master-detail/simple/data/data.json' }).then(function(data) {
        gridOptions.api.setRowData(data);
    });
});