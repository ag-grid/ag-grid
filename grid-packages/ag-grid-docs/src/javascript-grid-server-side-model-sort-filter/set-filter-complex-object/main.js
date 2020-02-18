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
    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinners.json' })
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
