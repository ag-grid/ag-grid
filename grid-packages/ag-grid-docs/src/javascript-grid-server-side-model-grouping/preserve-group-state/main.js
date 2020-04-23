var gridOptions = {
    columnDefs: [
        { field: "country", rowGroup: true, hide: true },
        { field: "year", rowGroup: true, hide: true },
        { field: "gold", aggFunc: 'sum' },
        { field: "silver", aggFunc: 'sum' },
        { field: "bronze", aggFunc: 'sum' }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        resizable: true,
        sortable: true
    },
    autoGroupColumnDef: {
        flex: 1,
        minWidth: 280,
    },

    // use the server-side row model
    rowModelType: 'serverSide',

    // supply id from data to the grid
    getRowNodeId: function(data) {
        return data.id;
    },

    // cache expanded group ids when groups opened
    onRowGroupOpened: function(params) {
        var id = params.data.id;
        if (params.node.expanded) {
            expandedGroupIds.push(id);
        } else {
            expandedGroupIds = expandedGroupIds.filter(function(grpId) {
                return !grpId.startsWith(id);
            });
        }
    },

    animateRows: true,
    suppressAggFuncInHeader: true,
    // debug: true,
};

function purgeCache() {
    gridOptions.api.purgeServerSideCache([]);
}

// This example is initialised with these expanded groups
var expandedGroupIds = ["Russia", "Russia-2002", "Ireland", "Ireland-2008"];

function ServerSideDatasource(server) {
    return {
        getRows: function(params) {
            console.log('[Datasource] - rows requested by grid: ', params.request);

            var response = server.getData(params.request);

            // adding delay to simulate real server call
            setTimeout(function() {
                if (response.success) {

                    // add group ids to data from server so we can set rows expanded
                    var rowsWithIds = addGroupIdsToRows(params.request, response.rows);

                    // call the success callback
                    params.successCallback(rowsWithIds, response.lastRow);

                    // to preserve group state we expand any previously expanded groups for this block
                    rowsWithIds.forEach(function(row) {
                        if (expandedGroupIds.indexOf(row.id) > -1) {
                            params.api.getRowNode(row.id).setExpanded(true);
                        }
                    });
                } else {
                    // inform the grid request failed
                    params.failCallback();
                }
            }, 200);
        }
    };
}

function addGroupIdsToRows(request, rows) {
    var rowGroupIds = request.rowGroupCols.map(function(group) { return group.id; });
    var groupKeys = request.groupKeys;

    if (groupKeys.length === rowGroupIds.length) return rows;

    var groupIds = rowGroupIds.slice(0, groupKeys.length + 1);
    return rows.map(function(row) { return addGroupIdToRow(row, groupIds, groupKeys); });
}

function addGroupIdToRow(row, groupIds, groupKeys) {
    // id's are created using a simple heuristic based on group keys: i.e. group node ids will
    // be in the following format: 'Russia', 'Russia-2002'
    var groupPart = groupIds.map(function(id) { return row[id]; }).join('-');
    row.id = groupKeys.length > 0 ? groupKeys.join('-') + groupPart : groupPart;
    return row;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json' }).then(function(data) {

        // add ids to data
        var idSequence = 0;
        data.forEach(function(item) {
            item.id = idSequence++;
        });

        // setup the fake server with entire dataset
        var fakeServer = new FakeServer(data);

        // create datasource with a reference to the fake server
        var datasource = new ServerSideDatasource(fakeServer);

        // register the datasource with the grid
        gridOptions.api.setServerSideDatasource(datasource);
    });
});
