var gridOptions = {
    defaultColDef: {
        width: 100,
        // restrict what aggregation functions the columns can have,
        // include a custom function 'random' that just returns a
        // random number
        allowedAggFuncs: ['sum','min','max','random']
    },
    rowBuffer: 0,
    columnDefs: columnDefs,
    enableColResize: true,
    rowModelType: 'enterprise',
    enableFilter: true,
    animateRows: true,
    debug: true,
    enableSorting: true,
    suppressAggFuncInHeader: true,
    toolPanelSuppressPivotMode: true,
    toolPanelSuppressValues: true,
    // restrict to 2 server side calls concurrently
    maxConcurrentDatasourceRequests: 2,
    cacheBlockSize: 100,
    // maxBlocksInCache: 2,
    groupUseEntireRow: true,
    purgeClosedRowNodes: true,
    groupRowInnerRenderer: GroupInnerRenderer,
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    },
    getRowHeight: function (params) {
        // top level group gets height of 50
        if (params.node.level === 0) {
            return 40;
        } else {
            return 25;
        }
    },
    icons: {
        groupLoading: '<img src="https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/javascript-grid-enterprise-model/spinner.gif" style="width:22px;height:22px;">'
    }
};

function GroupInnerRenderer() {}

GroupInnerRenderer.prototype.init = function(params) {
    var cssClass = params.node.level === 0 ? 'group-inner-renderer-country' : 'group-inner-renderer-year';
    var template = '<span class="'+cssClass+'">'+params.value+'</span>';
    this.eGui  = loadTemplate(template);
};

GroupInnerRenderer.prototype.getGui = function() {
    return this.eGui;
};

function loadTemplate(template) {
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = template;
    return tempDiv.firstChild;
}


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/olympicWinners.json'})
        .then( function(rows) {
                var fakeServer = new FakeServer(rows);
                var datasource = new EnterpriseDatasource(fakeServer);
                gridOptions.api.setEnterpriseDatasource(datasource);
            }
        );
});
