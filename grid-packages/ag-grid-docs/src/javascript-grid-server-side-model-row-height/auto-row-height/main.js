var columnDefs = [
    {
        headerName: 'Group',
        field: 'name',
        rowGroup: true,
        cellClass: 'cell-wrap-text',
        hide: true
    },
    {
        field: 'autoA',
        cellClass: 'cell-wrap-text',
        autoHeight: true,
        aggFunc: 'last'
    },
    {
        field: 'autoB',
        cellClass: 'cell-wrap-text',
        autoHeight: true,
        aggFunc: 'last'
    }
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        resizable: true,
        sortable: true
    },
    autoGroupColumnDef: {
        flex: 1,
        maxWidth: 200,
    },
    // use the server-side row model
    rowModelType: 'serverSide',

    animateRows: true,
    suppressAggFuncInHeader: true,

    onGridReady: function() {
        // generate data for example
        var data = createRowData();

        // setup the fake server with entire dataset
        var fakeServer = new FakeServer(data);

        // create datasource with a reference to the fake server
        var datasource = new ServerSideDatasource(fakeServer);

        // register the datasource with the grid
        gridOptions.api.setServerSideDatasource(datasource);
    }

    // debug: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});

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

function createRowData() {
    var latinSentence = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit';

    function generateRandomSentence() {
        return latinSentence.slice(0, Math.floor(Math.random() * 100)) + '.';
    }

    var rowData = [];
    for (var i = 0; i<10; i++) {
        for (var j = 0; j<50  ; j++) {
            rowData.push({
                name: 'Group ' + j,
                autoA: generateRandomSentence(),
                autoB: generateRandomSentence()
            });
        }
    }
    return rowData;
}
