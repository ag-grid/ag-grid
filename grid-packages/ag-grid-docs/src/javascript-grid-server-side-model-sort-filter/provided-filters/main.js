var columnDefs = [
    { field: 'athlete', type: 'text' },
    { field: 'country',
      filter: 'agSetColumnFilter',
      filterParams: {
        values: getCountryValuesAsync
      }
    },
    { field: 'year',
      filter: 'agNumberColumnFilter',
      filterParams: {
        resetButton: true,
        debounceMs: 1000,
        suppressAndOrCondition: true,
      }
    },
    { field: 'sport', type: 'text' },
    { field: 'gold', type: 'number' },
    { field: 'silver', type: 'number' },
    { field: 'bronze', type: 'number' }
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        sortable: true,
        resizable: true
    },
    columnTypes: {
        'text': {filter: 'agTextColumnFilter'},
        'number': {filter: 'agNumberColumnFilter'},
        'numberWithFilterReset': {
            filter: 'agNumberColumnFilter',
            filterParams: {
                resetButton: true,
                debounceMs: 1500
            }
        }
    },
    // use the server-side row model
    rowModelType: 'serverSide',

    // fetch 100 rows at a time
    cacheBlockSize: 100,

    // only keep 10 blocks of rows
    maxBlocksInCache: 10,

    animateRows: true,
    // debug: true
};

function getCountryValuesAsync(params) {
    var countryCodeMap = {US: "United States", RU: "Russia", AU: "Australia", CA: "Canada", NO: "Norway", CN: "China", ZW: "Zimbabwe", NL: "Netherlands", KR: "South Korea", HR: "Croatia", FR: "France", JP: "Japan", HU: "Hungary", DE: "Germany", PL: "Poland", ZA: "South Africa", SE: "Sweden", UA: "Ukraine", IT: "Italy", CZ: "Czech Republic", AT: "Austria", FI: "Finland", RO: "Romania", GB: "Great Britain", JM: "Jamaica", SG: "Singapore", BY: "Belarus", CL: "Chile", ES: "Spain", TN: "Tunisia", BR: "Brazil", SK: "Slovakia", CR: "Costa Rica", BG: "Bulgaria", CH: "Switzerland", NZ: "New Zealand", EE: "Estonia", KE: "Kenya", ET: "Ethiopia", TT: "Trinidad and Tobago", TR: "Turkey", MA: "Morocco", BS: "Bahamas", SI: "Slovenia", AM: "Armenia", AZ: "Azerbaijan", IN: "India", PR: "Puerto Rico", EG: "Egypt", KZ: "Kazakhstan", ROC: "Chinese Taipei", GE: "Georgia", LT: "Lithuania", CU: "Cuba", CO: "Colombia", MN: "Mongolia", UZ: "Uzbekistan", KP: "North Korea", TJ: "Tajikistan", KG: "Kyrgyzstan", GR: "Greece", ID: "Indonesia", TH: "Thailand", LV: "Latvia", MX: "Mexico", NG: "Nigeria", QA: "Qatar", RS: "Serbia", HK: "Hong Kong", DK: "Denmark", PT: "Portugal", AR: "Argentina", AF: "Afghanistan", GA: "Gabon", DO: "Dominican Republic", BE: "Belgium", KW: "Kuwait", AE: "United Arab Emirates", CY: "Cyprus", IL: "Israel", DZ: "Algeria", ME: "Montenegro", IS: "Iceland", PY: "Paraguay", CM: "Cameroon", SA: "Saudi Arabia", IE: "Ireland", MY: "Malaysia", UY: "Uruguay", TG: "Togo", MU: "Mauritius", BW: "Botswana", GT: "Guatemala", BH: "Bahrain", GD: "Grenada", UG: "Uganda", SD: "Sudan", EC: "Ecuador", PA: "Panama", ER: "Eritrea", LK: "Sri Lanka", MZ: "Mozambique", BB: "Barbados"};

    setTimeout(function() {
        params.success(Object.values(countryCodeMap))
    }, 50);
}

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

function ServerSideDatasource(server) {
    return {
        getRows: function(params) {
            console.log('[Datasource] - rows requested: ', params.request);

            // get data for request from our fake server
            var response = server.getData(params.request);

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
