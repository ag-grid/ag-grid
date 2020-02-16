var columnDefs = [
    {headerName: "Country", field: "country", rowGroup: true, hide: true},
    {headerName: "Sport", field: "sport", rowGroup: true, hide: true},
    {headerName: "Year", field: "year", pivot: true},
    {headerName: "Gold", field: "gold", aggFunc: 'sum'},
    {headerName: "Silver", field: "silver", aggFunc: 'sum'},
    {headerName: "Bronze", field: "bronze", aggFunc: 'sum'}
];

var gridOptions = {
    columnDefs: columnDefs,
    pivotMode: true,
    defaultColDef: {
        width: 150,
        resizable: true,
        sortable: true
    },
    autoGroupColumnDef: {
        minWidth: 200,
    },
    rowModelType: 'serverSide',
    animateRows: true,
    cacheBlockSize: 20,
    // debug: true
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinners.json'}).then(function (data) {
        // setup the fake server with entire dataset
        var fakeServer = new FakeServer(data);

        // create datasource with a reference to the fake server
        var datasource = new ServerSideDatasource(fakeServer);

        // register the datasource with the grid
        gridOptions.api.setServerSideDatasource(datasource);
    });
});

var updateColDefs = true;

function ServerSideDatasource(server) {
    return {
        getRows: function(params) {
            console.log('ServerSideDatasource - getRows()', params.request);

            var response = server.getResponse(params.request);

            if (updateColDefs) {
                // supply secondary columns to the grid
                var pivotColDefs = createPivotColDefs(params.request, response.pivotFields);
                params.columnApi.setSecondaryColumns(pivotColDefs);

                updateColDefs = false;
            }

            // simulating real server call with a 500ms delay
            setTimeout(function () {
                if (response.success) {
                    // supply data to grid
                    params.successCallback(response.rows, response.lastRow);
                } else {
                    params.failCallback();
                }
            }, 500);
        }
    };
}

function createPivotColDefs(request, pivotFields) {

    function addColDef(colId, parts, res) {
        if (parts.length === 0) return [];

        var first = parts.shift();
        var existing = res.find(function(r) { return r.groupId === first });

        if (existing) {
            existing['children'] = addColDef(colId, parts, existing.children);
        } else {
            var colDef = {};
            var isGroup = parts.length > 0;
            if(isGroup) {
                colDef['groupId'] = first;
                colDef['headerName'] = first;
            } else {
                var valueCol = request.valueCols.find(function(r) { return r.field === first });

                colDef['colId'] = colId;
                colDef['headerName'] =  valueCol.displayName;
                colDef['field'] = colId;
            }

            var children = addColDef(colId, parts, []);
            children.length > 0 ? colDef['children'] = children : null;

            res.push(colDef);
        }

        return res;
    }

    if (request.pivotMode && request.pivotCols.length > 0) {
        var secondaryCols = [];
        pivotFields.forEach(function(field) {
            addColDef(field, field.split('_'), secondaryCols);
        });
        return secondaryCols;
    }

    return [];
}
