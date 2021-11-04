var countries = ['United States', 'Russia', 'Australia', 'Canada', 'Norway', 'China', 'Zimbabwe',
    'Netherlands', 'South Korea', 'Croatia', 'France', 'Japan', 'Hungary', 'Germany', 'Poland', 'South Africa',
    'Sweden', 'Ukraine', 'Italy', 'Czech Republic', 'Austria', 'Finland', 'Romania', 'Great Britain', 'Jamaica',
    'Singapore', 'Belarus', 'Chile', 'Spain', 'Tunisia', 'Brazil', 'Slovakia', 'Costa Rica', 'Bulgaria', 'Switzerland',
    'New Zealand', 'Estonia', 'Kenya', 'Ethiopia', 'Trinidad and Tobago', 'Turkey', 'Morocco', 'Bahamas', 'Slovenia',
    'Armenia', 'Azerbaijan', 'India', 'Puerto Rico', 'Egypt', 'Kazakhstan', 'Iran', 'Georgia', 'Lithuania', 'Cuba',
    'Colombia', 'Mongolia', 'Uzbekistan', 'North Korea', 'Tajikistan', 'Kyrgyzstan', 'Greece', 'Macedonia', 'Moldova',
    'Chinese Taipei', 'Indonesia', 'Thailand', 'Vietnam', 'Latvia', 'Venezuela', 'Mexico', 'Nigeria', 'Qatar', 'Serbia',
    'Serbia and Montenegro', 'Hong Kong', 'Denmark', 'Portugal', 'Argentina', 'Afghanistan', 'Gabon', 'Dominican Republic',
    'Belgium', 'Kuwait', 'United Arab Emirates', 'Cyprus', 'Israel', 'Algeria', 'Montenegro', 'Iceland', 'Paraguay',
    'Cameroon', 'Saudi Arabia', 'Ireland', 'Malaysia', 'Uruguay', 'Togo', 'Mauritius', 'Syria', 'Botswana', 'Guatemala',
    'Bahrain', 'Grenada', 'Uganda', 'Sudan', 'Ecuador', 'Panama', 'Eritrea', 'Sri Lanka', 'Mozambique', 'Barbados'];

var columnDefs = [
    {field: "athlete", enableRowGroup: true, enablePivot: true, filter: false},
    {
        field: "age", enableRowGroup: true,
        filter: 'customAgeFilter'
    },
    {
        field: "country",
        enableRowGroup: true,
        enablePivot: true,
        rowGroup: true,
        hide: true,
        filter: 'agSetColumnFilter',
        filterParams: {values: countries}
    },
    {
        field: "year", enableRowGroup: true, enablePivot: true, rowGroup: true, hide: true, filter: 'agSetColumnFilter',
        filterParams: {values: ['2000', '2002', '2004', '2006', '2008', '2010', '2012']}
    },
    {field: "sport", enableRowGroup: true, enablePivot: true, filter: false},
    {field: "gold", aggFunc: 'sum', filter: false, enableValue: true},
    {field: "silver", aggFunc: 'sum', filter: false, enableValue: true},
    {field: "bronze", aggFunc: 'sum', filter: false, enableValue: true}
];

var gridOptions = {
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        // restrict what aggregation functions the columns can have,
        // include a custom function 'random' that just returns a
        // random number
        allowedAggFuncs: ['sum', 'min', 'max', 'random'],
        sortable: true,
        resizable: true,
        filter: true
    },
    autoGroupColumnDef: {
        width: 180
    },
    components: {
        customAgeFilter: createCustomAgeFilter()
    },
    columnDefs: columnDefs,
    rowModelType: 'serverSide',
    serverSideStoreType: 'partial',
    rowGroupPanelShow: 'always',
    pivotPanelShow: 'always',
    animateRows: true,
    debug: true,
    enableRangeSelection: true,
    sideBar: true,
    suppressAggFuncInHeader: true,
    // restrict to 2 server side calls concurrently
    maxConcurrentDatasourceRequests: 1,
    cacheBlockSize: 100,
    maxBlocksInCache: 2,
    purgeClosedRowNodes: true,
    onFirstDataRendered: onFirstDataRendered
};

function onFirstDataRendered(params) {
    params.api.sizeColumnsToFit();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(function (data) {
                var fakeServer = createFakeServer(data);
                var datasource = createServerSideDatasource(fakeServer, gridOptions);
                gridOptions.api.setServerSideDatasource(datasource);
            }
        );
});


function createCustomAgeFilter() {

    function CustomAgeFilter() {
    }

    var CUSTOM_AGE_FILTER_TEMPLATE =
        '<div>' +
        '  <label>' +
        '    <input type="radio" name="ageFilterValue" ref="btAll" checked/> All' +
        '  </label>' +
        '  <label>' +
        '    <input type="radio" name="ageFilterValue" ref="bt20"/> 20' +
        '  </label>' +
        '  <label>' +
        '    <input type="radio" name="ageFilterValue" ref="bt22"/> 22' +
        '  </label>' +
        '</div>' +
        '' +
        '';

    CustomAgeFilter.prototype.init = function (params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = CUSTOM_AGE_FILTER_TEMPLATE;
        this.filterValue = null;
        this.params = params;

        // var that = this;

        this.eGui.querySelector('[ref="btAll"]').addEventListener('change', this.onSelection.bind(this, null));
        this.eGui.querySelector('[ref="bt20"]').addEventListener('change', this.onSelection.bind(this, 20));
        this.eGui.querySelector('[ref="bt22"]').addEventListener('change', this.onSelection.bind(this, 22));
    };

    CustomAgeFilter.prototype.onSelection = function (value) {
        this.filterValue = value;
        this.params.filterChangedCallback();
    };

    CustomAgeFilter.prototype.getGui = function () {
        return this.eGui;
    };

    CustomAgeFilter.prototype.isFilterActive = function () {
        return this.filterValue !== null;
    };

    CustomAgeFilter.prototype.doesFilterPass = function (params) {
        // not needed for server side filtering
        var value = this.params.valueGetter(params);
        return value == this.filterValue;
    };

    CustomAgeFilter.prototype.getModel = function () {
        if (this.filterValue === null) {
            return null;
        } else {
            // the format of what you return depends on your server side, just
            // return something that your server side can work with.
            return {
                filter: this.filterValue,
                type: "equals"
            };
        }
    };

    // not needed for this example
    CustomAgeFilter.prototype.setModel = function (model) {
        if (model && model.filter === 20) {
            this.eGui.querySelector('[ref="bt20"]').checked = true;
            this.filterValue = 20;
        } else if (model && model.filter === 22) {
            this.eGui.querySelector('[ref="bt22"]').checked = true;
            this.filterValue = 22;
        } else {
            this.eGui.querySelector('[ref="btAll"]').checked = true;
            this.filterValue = null;
        }
    };

    return CustomAgeFilter;
}
