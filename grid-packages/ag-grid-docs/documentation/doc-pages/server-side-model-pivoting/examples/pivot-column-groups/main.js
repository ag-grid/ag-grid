var gridOptions = {
    columnDefs: [
        {field: "country", rowGroup: true},
        {field: "sport", rowGroup: true},
        {field: "year", pivot: true}, // pivot on 'year'
        {field: "gold", aggFunc: 'sum'},
        {field: "silver", aggFunc: 'sum'},
        {field: "bronze", aggFunc: 'sum'}
    ],
    defaultColDef: {
        width: 150,
        resizable: true,
        sortable: true
    },
    autoGroupColumnDef: {
        minWidth: 200,
    },

    // use the server-side row model
    rowModelType: 'serverSide',
    serverSideStoreType: 'partial',

    // enable pivoting
    pivotMode: true,

    animateRows: true,
    // debug: true
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json').then(response => response.json()).then(function (data) {
        // setup the fake server with entire dataset
        var fakeServer = new FakeServer(data);

        // create datasource with a reference to the fake server
        var datasource = new ServerSideDatasource(fakeServer);

        // register the datasource with the grid
        gridOptions.api.setServerSideDatasource(datasource);
    });
});


function ServerSideDatasource(server) {
    return {
        getRows: function (params) {
            var request = params.request;

            console.log('[Datasource] - rows requested by grid: ', params.request);

            var response = server.getData(request);

            // add pivot colDefs in the grid based on the resulting data
            addPivotColDefs(request, response, params.columnApi);

            // simulating real server call with a 500ms delay
            setTimeout(function () {
                if (response.success) {
                    // supply data to grid
                    params.success({rowData: response.rows, rowCount: response.lastRow});
                } else {
                    params.fail();
                }
            }, 500);
        }
    };
}

function addPivotColDefs(request, response, columnApi) {
    // check if pivot colDefs already exist
    var existingPivotColDefs = columnApi.getSecondaryColumns();
    if (existingPivotColDefs && existingPivotColDefs.length > 0) {
        return;
    }

    // create pivot colDef's based of data returned from the server
    var pivotColDefs = createPivotColDefs(request, response.pivotFields);

    // supply secondary columns to the grid
    columnApi.setSecondaryColumns(pivotColDefs);
}

function createPivotColDefs(request, pivotFields) {

    function addColDef(colId, parts, res) {
        if (parts.length === 0) return [];

        var first = parts.shift();

        var existing = res.filter(function (r) {
            return r.groupId === first;
        })[0];
        if (existing) {
            existing['children'] = addColDef(colId, parts, existing.children);
        } else {
            var colDef = {};
            var isGroup = parts.length > 0;
            if (isGroup) {
                colDef['groupId'] = first;
                colDef['headerName'] = first;
            } else {
                var valueCol = request.valueCols.filter(function (r) {
                    return r.field === first;
                })[0];
                colDef['colId'] = colId;
                colDef['headerName'] = valueCol.displayName;
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
        pivotFields.forEach(function (field) {
            addColDef(field, field.split('_'), secondaryCols);
        });
        return secondaryCols;
    }

    return [];
}
