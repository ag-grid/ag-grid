var gridOptions = {
    columnDefs: [
        // group cell renderer needed for expand / collapse icons
        { field: 'accountId', cellRenderer: 'agGroupCellRenderer' },
        { field: 'name' },
        { field: 'country' },
        { field: 'calls' },
        { field: 'totalDuration' }
    ],
    defaultColDef: {
        flex: 1
    },

    animateRows: true,

    // use the server-side row model
    rowModelType: 'serverSide',

    // enable master detail
    masterDetail: true,

    detailCellRendererParams: {
        detailGridOptions: {
            columnDefs: [
                { field: 'callId' },
                { field: 'direction' },
                { field: 'duration', valueFormatter: "x.toLocaleString() + 's'" },
                { field: 'switchCode', minWidth: 150 },
                { field: 'number', minWidth: 180 },
            ],
            defaultColDef: {
                flex: 1
            }
        },
        getDetailRowData: function(params) {
            // supply details records to detail cell renderer (i.e. detail grid)
            params.successCallback(params.data.callRecords);
        }
    },
    onGridReady: function(params) {
        setTimeout(function() {
            // expand some master row
            var someRow = params.api.getRowNode("1");
            if (someRow) {
                someRow.setExpanded(true);
            }
        }, 1000);
    }
};

function ServerSideDatasource(server) {
    return {
        getRows: function(params) {
            // adding delay to simulate real server call
            setTimeout(function() {
                var response = server.getResponse(params.request);

                if (response.success) {
                    // call the success callback
                    params.successCallback(response.rows, response.lastRow);
                } else {
                    // inform the grid request failed
                    params.failCallback();
                }
            }, 500);
        }
    };
}

function FakeServer(allData) {
    return {
        getResponse: function(request) {
            console.log('asking for rows: ' + request.startRow + ' to ' + request.endRow);

            // take a slice of the total rows
            var rowsThisPage = allData.slice(request.startRow, request.endRow);

            // if row count is known, it's possible to skip over blocks
            var lastRow = allData.length;

            return {
                success: true,
                rows: rowsThisPage,
                lastRow: lastRow
            };
        }
    };
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/callData.json' }).then(function(data) {
        var server = new FakeServer(data);
        var datasource = new ServerSideDatasource(server);
        gridOptions.api.setServerSideDatasource(datasource);
    });
});
