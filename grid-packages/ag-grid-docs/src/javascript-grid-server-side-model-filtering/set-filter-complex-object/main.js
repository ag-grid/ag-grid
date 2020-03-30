var countryMap = {"United States": "US", "Russia": "RU", "Australia": "AU", "Canada": "CA", "Norway": "NO", "China": "CN", "Zimbabwe": "ZW", "Venezuela": "VE", "Netherlands": "NL", "South Korea": "KR", "Croatia": "HR", "France": "FR", "Japan": "JP", "Hungary": "HU", "Germany": "DE", "Poland": "PL", "South Africa": "ZA", "Sweden": "SE", "Ukraine": "UA", "Italy": "IT", "Czech Republic": "CZ", "Austria": "AT", "Finland": "FI", "Romania": "RO", "Vietnam": "VN", "Great Britain": "GB", "Jamaica": "JM", "Singapore": "SG", "Belarus": "BY", "Chile": "CL", "Spain": "ES", "Tunisia": "TN", "Brazil": "BR", "Slovakia": "SK", "Costa Rica": "CR", "Bulgaria": "BG", "Switzerland": "CH", "New Zealand": "NZ", "Estonia": "EE", "Kenya": "KE", "Ethiopia": "ET", "Trinidad and Tobago": "TT", "Turkey": "TR", "Morocco": "MA", "Bahamas": "BS", "Slovenia": "SI", "Armenia": "AM", "Azerbaijan": "AZ", "India": "IN", "Puerto Rico": "PR", "Egypt": "EG", "Kazakhstan": "KZ", "Chinese Taipei": "ROC", "Georgia": "GE", "Lithuania": "LT", "Cuba": "CU", "Colombia": "CO", "Mongolia": "MN", "Uzbekistan": "UZ", "North Korea": "KP", "Tajikistan": "TJ", "Kyrgyzstan": "KG", "Greece": "GR", "Indonesia": "ID", "Thailand": "TH", "Latvia": "LV", "Mexico": "MX", "Nigeria": "NG", "Qatar": "QA", "Serbia": "RS", "Hong Kong": "HK", "Denmark": "DK", "Portugal": "PT", "Argentina": "AR", "Afghanistan": "AF", "Gabon": "GA", "Dominican Republic": "DO", "Belgium": "BE", "Kuwait": "KW", "United Arab Emirates": "AE", "Cyprus": "CY", "Israel": "IL", "Algeria": "DZ", "Montenegro": "ME", "Iceland": "IS", "Paraguay": "PY", "Cameroon": "CM", "Saudi Arabia": "SA", "Ireland": "IE", "Malaysia": "MY", "Uruguay": "UY", "Togo": "TG", "Mauritius": "MU", "Botswana": "BW", "Guatemala": "GT", "Bahrain": "BH", "Grenada": "GD", "Uganda": "UG", "Sudan": "SD", "Ecuador": "EC", "Panama": "PA", "Eritrea": "ER", "Sri Lanka": "LK", "Mozambique": "MZ", "Barbados": "BB"};

var countryCodeMap = {US: "United States", RU: "Russia", AU: "Australia", CA: "Canada", NO: "Norway", CN: "China", ZW: "Zimbabwe", NL: "Netherlands", KR: "South Korea", HR: "Croatia", FR: "France", JP: "Japan", HU: "Hungary", DE: "Germany", PL: "Poland", ZA: "South Africa", SE: "Sweden", UA: "Ukraine", IT: "Italy", CZ: "Czech Republic", AT: "Austria", FI: "Finland", RO: "Romania", GB: "Great Britain", JM: "Jamaica", SG: "Singapore", BY: "Belarus", CL: "Chile", ES: "Spain", TN: "Tunisia", BR: "Brazil", SK: "Slovakia", CR: "Costa Rica", BG: "Bulgaria", CH: "Switzerland", NZ: "New Zealand", EE: "Estonia", KE: "Kenya", ET: "Ethiopia", TT: "Trinidad and Tobago", TR: "Turkey", MA: "Morocco", BS: "Bahamas", SI: "Slovenia", AM: "Armenia", AZ: "Azerbaijan", IN: "India", PR: "Puerto Rico", EG: "Egypt", KZ: "Kazakhstan", ROC: "Chinese Taipei", GE: "Georgia", LT: "Lithuania", CU: "Cuba", CO: "Colombia", MN: "Mongolia", UZ: "Uzbekistan", KP: "North Korea", TJ: "Tajikistan", KG: "Kyrgyzstan", GR: "Greece", ID: "Indonesia", TH: "Thailand", LV: "Latvia", MX: "Mexico", NG: "Nigeria", QA: "Qatar", RS: "Serbia", HK: "Hong Kong", DK: "Denmark", PT: "Portugal", AR: "Argentina", AF: "Afghanistan", GA: "Gabon", DO: "Dominican Republic", BE: "Belgium", KW: "Kuwait", AE: "United Arab Emirates", CY: "Cyprus", IL: "Israel", DZ: "Algeria", ME: "Montenegro", IS: "Iceland", PY: "Paraguay", CM: "Cameroon", SA: "Saudi Arabia", IE: "Ireland", MY: "Malaysia", UY: "Uruguay", TG: "Togo", MU: "Mauritius", BW: "Botswana", GT: "Guatemala", BH: "Bahrain", GD: "Grenada", UG: "Uganda", SD: "Sudan", EC: "Ecuador", PA: "Panama", ER: "Eritrea", LK: "Sri Lanka", MZ: "Mozambique", BB: "Barbados"};

var columnDefs = [
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
    },
    { field: 'athlete', menuTabs: false }
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
    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json' })
        .then(function (data) {
            var fakeServer = new FakeServer(data);
            var datasource = new ServerSideDatasource(fakeServer);
            gridOptions.api.setServerSideDatasource(datasource);
        }
    );
});

function ServerSideDatasource(server) {
    return {
        getRows: function(params) {
            console.log('[Datasource] - rows requested: ', params.request);

            var response = server.getData(params.request);

            // adding delay to simulate real sever call
            setTimeout(function () {
                if (response.success) {
                    // call the success callback
                    params.successCallback(response.rows, response.lastRow);
                } else {
                    // inform the grid request failed
                    params.failCallback();
                }
            }, 500);
        }
    };
}

function FakeServer(allData) {

    // patch country data to use complex object
    allData.forEach(function (d) {
        d.country = {
            code: countryMap[d.country],
            name: d.country
        };
    });

    function doFilter(data, filterModel) {
        var filterPresent = filterModel && Object.keys(filterModel).length > 0;
        if (!filterPresent) return data;
        return data.filter(function(d) {
            return filterModel.country.values.indexOf(d.country.code) > -1;
        });
    }

    function doSort(data, sortModel) {
        var sortPresent = sortModel && sortModel.length > 0;
        if (!sortPresent) return data;

        var sortedData = data.slice();
        sortedData.sort(function (a, b) {
            for (var k = 0; k < sortModel.length; k++) {
                var sortColModel = sortModel[k];

                var valueA = a[sortColModel.colId];
                if (valueA instanceof Object) {
                    valueA = valueA.name;
                }

                var valueB = b[sortColModel.colId];
                if (valueB instanceof Object) {
                    valueB = valueB.name;
                }

                if (valueA === valueB) {
                    continue;
                }
                var sortDirection = sortColModel.sort === 'asc' ? 1 : -1;
                return valueA > valueB ? sortDirection : sortDirection * -1;
            }
            return 0;
        });
        return sortedData;
    }

    return {
        getData: function(request) {
            var filteredData = doFilter(allData, request.filterModel);
            var filteredAndSortedData = doSort(filteredData, request.sortModel);

            // take a slice of the rows for requested block
            var rowsForBlock = filteredAndSortedData.slice(request.startRow, request.endRow);

            // if on or after the last page, work out the last row.
            var lastRow = allData.length <= request.endRow ? allData.length : -1;

            return {
                success: true,
                rows: rowsForBlock,
                lastRow: lastRow
            };
        }
    };
}
