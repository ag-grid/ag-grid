var countryCodeMap = {US: "United States", RU: "Russia", AU: "Australia", CA: "Canada", NO: "Norway", CN: "China", ZW: "Zimbabwe", NL: "Netherlands", KR: "South Korea", HR: "Croatia", FR: "France", JP: "Japan", HU: "Hungary", DE: "Germany", PL: "Poland", ZA: "South Africa", SE: "Sweden", UA: "Ukraine", IT: "Italy", CZ: "Czech Republic", AT: "Austria", FI: "Finland", RO: "Romania", GB: "Great Britain", JM: "Jamaica", SG: "Singapore", BY: "Belarus", CL: "Chile", ES: "Spain", TN: "Tunisia", BR: "Brazil", SK: "Slovakia", CR: "Costa Rica", BG: "Bulgaria", CH: "Switzerland", NZ: "New Zealand", EE: "Estonia", KE: "Kenya", ET: "Ethiopia", TT: "Trinidad and Tobago", TR: "Turkey", MA: "Morocco", BS: "Bahamas", SI: "Slovenia", AM: "Armenia", AZ: "Azerbaijan", IN: "India", PR: "Puerto Rico", EG: "Egypt", KZ: "Kazakhstan", ROC: "Chinese Taipei", GE: "Georgia", LT: "Lithuania", CU: "Cuba", CO: "Colombia", MN: "Mongolia", UZ: "Uzbekistan", KP: "North Korea", TJ: "Tajikistan", KG: "Kyrgyzstan", GR: "Greece", ID: "Indonesia", TH: "Thailand", LV: "Latvia", MX: "Mexico", NG: "Nigeria", QA: "Qatar", RS: "Serbia", HK: "Hong Kong", DK: "Denmark", PT: "Portugal", AR: "Argentina", AF: "Afghanistan", GA: "Gabon", DO: "Dominican Republic", BE: "Belgium", KW: "Kuwait", AE: "United Arab Emirates", CY: "Cyprus", IL: "Israel", DZ: "Algeria", ME: "Montenegro", IS: "Iceland", PY: "Paraguay", CM: "Cameroon", SA: "Saudi Arabia", IE: "Ireland", MY: "Malaysia", UY: "Uruguay", TG: "Togo", MU: "Mauritius", BW: "Botswana", GT: "Guatemala", BH: "Bahrain", GD: "Grenada", UG: "Uganda", SD: "Sudan", EC: "Ecuador", PA: "Panama", ER: "Eritrea", LK: "Sri Lanka", MZ: "Mozambique", BB: "Barbados"};

var columnDefs = [
    { field: 'athlete',  menuTabs: false },
    {
      field: 'country',
      valueFormatter: countryValueFormatter,
      filter: 'agSetColumnFilter',
      filterParams: {
        newRowsAction: 'keep',
        values: getCountryValuesAsync,
        valueFormatter: countryFilterValueFormatter
      },
      menuTabs: ['filterMenuTab']
    }
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        sortable: true
    },
    rowModelType: 'serverSide',
    animateRows: true
};

function countryValueFormatter(params) {
    if (params.value && params.value.code) {
        return params.value.name + '(' + params.value.code + ')';
    }
}

function getCountryValuesAsync(params) {
    setTimeout(function() {
        params.success(Object.keys(countryCodeMap))
    }, 500);
}

function countryFilterValueFormatter(params) {
    var code = params.value;
    var name = countryCodeMap[code];
    return name + '(' + code + ')';
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinners.json' })
        .then(function (data) {
            var fakeServer = new FakeServer(data);
            var datasource = new ServerSideDatasource(fakeServer);
            gridOptions.api.setServerSideDatasource(datasource);
        }
    );
});

function ServerSideDatasource(fakeServer) {
    this.fakeServer = fakeServer;
}

ServerSideDatasource.prototype.getRows = function (params) {
    //console.log(params.request);

    var response = this.fakeServer.getData(params.request);

    setTimeout(function() {
        params.successCallback(response.data, response.lastRow);
    }, 500);
};

