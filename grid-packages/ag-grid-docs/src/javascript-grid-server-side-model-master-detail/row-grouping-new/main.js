var columnDefs = [
    {field: 'country', rowGroup: true, hide: true},
    {field: 'accountId', hide: true},
    {field: 'name'},
    {field: 'calls'},
    {field: 'totalDuration'}
];

var gridOptions = {
    autoGroupColumnDef: {
        field: 'accountId'
    },
    columnDefs: columnDefs,
    animateRows: true,

    // use the server-side row model
    rowModelType: 'serverSide',

    // enable master detail
    masterDetail: true,

    detailCellRendererParams: {
        detailGridOptions: {
            columnDefs: [
                {field: 'callId'},
                {field: 'direction'},
                {field: 'duration', valueFormatter: "x.toLocaleString() + 's'"},
                {field: 'switchCode'},
                {field: 'number'},
            ],
            onFirstDataRendered: function(params) {
                // fit the detail grid columns
                params.api.sizeColumnsToFit();
            }
        },
        getDetailRowData: function (params) {
            // supply details records to detail cell renderer (i.e. detail grid)
            params.successCallback(params.data.callRecords);
        }
    },
    onGridReady: function(params) {
        setTimeout(function() {
            // fit the master grid columns
            params.api.sizeColumnsToFit();

            // arbitrarily expand some master row
            var someRow = params.api.getRowNode("3");
            if (someRow) {
                someRow.setExpanded(true);

                var children = someRow.getChildren();

                console.log(someRow);

                // someRow.getChildren()[1].setExpanded(true);
            }

        }, 1500);
    }
};

function ServerSideDatasource(server) {
    return {
        getRows: function(params) {
            console.log('[Datasource] - rows requested by grid: ', params.request);

            var response = server.getData(params.request);

            // adding delay to simulate real sever call
            setTimeout(function () {
                if (response.success) {
                    // call the success callback
                    params.successCallback(response.rows, response.lastRow);
                } else {
                    // inform the grid request failed
                    params.failCallback();
                }
            }, 200);
        }
    };
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/callData.json'}).then(function (data) {
        // setup the fake server with entire dataset
        var fakeServer = new FakeServer(data);

        // create datasource with a reference to the fake server
        var datasource = new ServerSideDatasource(fakeServer);

        // register the datasource with the grid
        gridOptions.api.setServerSideDatasource(datasource);
    });
});

