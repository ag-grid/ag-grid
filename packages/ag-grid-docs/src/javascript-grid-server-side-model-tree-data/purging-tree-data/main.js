var columnDefs = [
    {field: "employeeId", hide: true},
    {field: "employeeName", hide: true},
    {field: "employmentType"},
    {field: "startDate"},
];

var gridOptions = {
    defaultColDef: {
        width: 235,
        resizable: true
    },
    rowModelType: 'serverSide',
    treeData: true,
    columnDefs: columnDefs,
    rowSelection: 'multiple',
    animateRows: true,
    cacheBlockSize: 100,
    maxBlocksInCache: 2,
    isServerSideGroup: function (dataItem) {
        // indicate if node is a group
        return dataItem.group;
    },
    getServerSideGroupKey: function (dataItem) {
        // specify which group key to use
        return dataItem.employeeName;
    },
    isRowSelectable: function (rowNode) {
        return rowNode.data && rowNode.data.group;
    },
    onRowSelected: function (params) {
        console.log("onRowSelected: ", params);
    },
    onGridReady: function (params) {
        // initialise with the first 2 groups arbitrarily expanded
        setTimeout(function () {
            // expands first node
            params.api.getDisplayedRowAtIndex(0).setExpanded(true);
        }, 1500);
        setTimeout(function () {
            // expands second node
            params.api.getDisplayedRowAtIndex(1).setExpanded(true);
        }, 2000);
    }
};

function purgeCache(route) {
    gridOptions.api.purgeServerSideCache(route);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/latest/packages/ag-grid-docs/src/javascript-grid-server-side-model-tree-data/purging-tree-data/data/data.json'}).then(function (data) {
        var fakeServer = createFakeServer(data);
        var datasource = createServerSideDatasource(fakeServer);
        gridOptions.api.setServerSideDatasource(datasource);
    });
});

function createFakeServer(data) {
    function FakeServer(allData) {
        this.data = allData;
    }

    FakeServer.prototype.getData = function (request) {
        function extractRowsFromData(groupKeys, data) {
            if (groupKeys.length === 0) {
                return data.map(d => {
                    return {
                        group: !!d.underlings,
                        employeeId: d.employeeId + "",
                        employeeName: d.employeeName,
                        employmentType: d.employmentType,
                        startDate: d.startDate
                    }
                });
            }

            var key = groupKeys[0];
            for (var i = 0; i < data.length; i++) {
                if (data[i].employeeName === key) {
                    return extractRowsFromData(groupKeys.slice(1), data[i].underlings.slice());
                }
            }
        }

        return extractRowsFromData(request.groupKeys, this.data);
    };

    return new FakeServer(data)
}

function createServerSideDatasource(fakeServer) {
    function ServerSideDatasource(fakeServer) {
        this.fakeServer = fakeServer;
    }

    ServerSideDatasource.prototype.getRows = function (params) {
        console.log('ServerSideDatasource.getRows: params = ', params);

        var rows = this.fakeServer.getData(params.request);

        setTimeout(function () {
            params.successCallback(rows, rows.length);
        }, 200);
    };

    return new ServerSideDatasource(fakeServer);
}