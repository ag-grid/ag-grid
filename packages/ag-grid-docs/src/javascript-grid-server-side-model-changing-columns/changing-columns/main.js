function countries() {
var listOfCountries = ['United States','Russia','Australia','Canada','Norway','China','Zimbabwe',
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

    return listOfCountries;
}

var colDefAthlete = {field: "athlete", enableRowGroup: true, enablePivot: true, suppressFilter: true};
var colDefAge = {field: "age", enableRowGroup: true};
var colDefCountry = {
    field: "country", enableRowGroup: true, enablePivot: true, rowGroup: true,
    filter: 'agSetColumnFilter',
    filterParams: {values: countries(), newRowsAction: 'keep'}
};
var colDefYear = {
    field: "year", enableRowGroup: true, enablePivot: true, rowGroup: true, filter: 'agSetColumnFilter',
    filterParams: {values: ['2000','2004','2008','2012'], newRowsAction: 'keep'}
};
var colDefSport = {field: "sport", enableRowGroup: true, enablePivot: true, suppressFilter: true};
var colDefGold = {field: "gold", aggFunc: 'sum', suppressFilter: true, enableValue: true};
var colDefSilver = {field: "silver", aggFunc: 'sum', suppressFilter: true, enableValue: true};
var colDefBronze = {field: "bronze", aggFunc: 'sum', suppressFilter: true, enableValue: true};

var columnDefs = [
    colDefAthlete, colDefAge, colDefCountry, colDefYear,
    colDefSport, colDefGold, colDefSilver, colDefBronze
];

var gridOptions = {
    defaultColDef: {
        width: 100,
        // restrict what aggregation functions the columns can have,
        // include a custom function 'random' that just returns a
        // random number
        allowedAggFuncs: ['sum','min','max','random']
    },
    autoGroupColumnDef: {
        width: 150
    },
    columnDefs: columnDefs,
    enableColResize: true,
    rowModelType: 'serverSide',
    rowGroupPanelShow: 'always',
    pivotPanelShow: 'always',
    enableFilter: true,
    animateRows: true,
    enableSorting: true,
    sideBar: {
        toolPanels: ['columns','filters']
    },
    suppressAggFuncInHeader: true,
};

function onBtApply() {
    var cols = [];
    if (getBooleanValue('#athlete')) {
        cols.push(colDefAthlete);
    }
    if (getBooleanValue('#age')) {
        cols.push(colDefAge);
    }
    if (getBooleanValue('#country')) {
        cols.push(colDefCountry);
    }
    if (getBooleanValue('#year')) {
        cols.push(colDefYear);
    }
    if (getBooleanValue('#sport')) {
        cols.push(colDefSport);
    }

    if (getBooleanValue('#gold')) {
        cols.push(colDefGold);
    }
    if (getBooleanValue('#silver')) {
        cols.push(colDefSilver);
    }
    if (getBooleanValue('#bronze')) {
        cols.push(colDefBronze);
    }

    gridOptions.api.setColumnDefs(cols);
}

function getBooleanValue(cssSelector) {
    return document.querySelector(cssSelector).checked === true;
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
                var datasource = new ServerSideDatasource(fakeServer, gridOptions);
                gridOptions.api.setServerSideDatasource(datasource);
            }
        );
});
