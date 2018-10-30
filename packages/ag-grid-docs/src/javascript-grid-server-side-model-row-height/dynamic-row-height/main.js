function countries () {
    return ['United States','Russia','Australia','Canada','Norway','China','Zimbabwe',
        'Netherlands','South Korea','Croatia','France','Japan','Hungary','Germany','Poland','South Africa',
        'Sweden','Ukraine','Italy','Czech Republic','Austria','Finland','Romania', 'Great Britain','Jamaica',
        'Singapore','Belarus','Chile','Spain','Tunisia','Brazil','Slovakia','Costa Rica','Bulgaria','Switzerland',
        'New Zealand','Estonia','Kenya','Ethiopia','Trinidad and Tobago','Turkey','Morocco','Bahamas','Slovenia',
        'Armenia','Azerbaijan','India', 'Puerto Rico','Egypt','Kazakhstan','Iran','Georgia','Lithuania','Cuba',
        'Colombia','Mongolia','Uzbekistan','North Korea','Tajikistan', 'Kyrgyzstan','Greece','Macedonia','Moldova',
        'Chinese Taipei','Indonesia','Thailand','Vietnam','Latvia','Venezuela','Mexico','Nigeria', 'Qatar','Serbia',
        'Serbia and Montenegro','Hong Kong','Denmark','Portugal','Argentina','Afghanistan','Gabon','Dominican Republic',
        'Belgium', 'Kuwait','United Arab Emirates','Cyprus','Israel','Algeria','Montenegro','Iceland','Paraguay',
        'Cameroon','Saudi Arabia','Ireland','Malaysia', 'Uruguay','Togo','Mauritius','Syria','Botswana','Guatemala',
        'Bahrain','Grenada','Uganda','Sudan','Ecuador','Panama','Eritrea','Sri Lanka', 'Mozambique','Barbados'];
}

var columnDefs = [
    {headerName: "Athlete", field: "athlete", enableRowGroup: true, suppressFilter: true},
    {headerName: "Age", field: "age", enablePivot: true, enableRowGroup: true, filter: 'agNumberColumnFilter',
        filterParams: {
            filterOptions: ['equals','lessThan','greaterThan'],
            newRowsAction: 'keep'}
    },
    {headerName: "Country", field: "country", enableRowGroup: true, enablePivot: true, rowGroup: true, hide: true, filter: 'agSetColumnFilter',
        filterParams: {values: countries(), newRowsAction: 'keep'}
    },
    {headerName: "Year", field: "year", enableRowGroup: true, enablePivot: true, rowGroup: true, hide: true, filter: 'agSetColumnFilter',
        filterParams: {values: ['2000','2004','2008','2012'], newRowsAction: 'keep'}
    },
    {headerName: "Sport", field: "sport", enableRowGroup: true, enablePivot: true, suppressFilter: true},
    {headerName: "Gold", field: "gold", aggFunc: 'sum', suppressFilter: true, enableValue: true},
    {headerName: "Silver", field: "silver", aggFunc: 'sum', suppressFilter: true, enableValue: true},
    {headerName: "Bronze", field: "bronze", aggFunc: 'sum', suppressFilter: true, enableValue: true}
];

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
    rowModelType: 'serverSide',
    enableFilter: true,
    animateRows: true,
    debug: true,
    enableSorting: true,
    suppressAggFuncInHeader: true,
    sideBar: {
        toolPanels: [
          {
            id: 'columns',
            labelDefault: 'Columns',
            labelKey: 'columns',
            iconKey: 'columns',
            toolPanel: 'agColumnsToolPanel',
            toolPanelParams: {
              suppressPivots: true,
              suppressPivotMode: true,
              suppressValues: true
            }
          }
        ]
    },
    // restrict to 2 server side calls concurrently
    maxConcurrentDatasourceRequests: 2,
    cacheBlockSize: 100,
    // maxBlocksInCache: 2,
    groupUseEntireRow: true,
    purgeClosedRowNodes: true,
    groupRowInnerRenderer: GroupInnerRenderer,
    onFirstDataRendered(params) {
        params.api.sizeColumnsToFit();
    },
    getRowHeight: function (params) {
        // top level group gets height of 50
        if (params.node.level === 0) {
            return 40;
        } else {
            return 25;
        }
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
    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinners.json'})
        .then( function(data) {
                var fakeServer = new FakeServer(data);
                var datasource = new ServerSideDatasource(fakeServer);
                gridOptions.api.setServerSideDatasource(datasource);
            }
        );
});
