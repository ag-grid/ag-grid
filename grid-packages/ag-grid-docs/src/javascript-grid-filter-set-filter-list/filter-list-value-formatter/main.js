var countryFilterParams = {
    valueFormatter: countryValueFormatter,
};

var gridOptions = {
    columnDefs: [
        {
            headerName: 'No Value Formatter',
            field: 'country',
            valueFormatter: countryValueFormatter,
            filter: 'agSetColumnFilter',
            filterParams: {
                // no value formatter!
            }
        },
        {
            headerName: 'With Value Formatter',
            field: 'country',
            valueFormatter: countryValueFormatter,
            filter: 'agSetColumnFilter',
            filterParams: countryFilterParams,
        }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 225,
        resizable: true,
        floatingFilter: true,
    },
    sideBar: 'filters',
    onFirstDataRendered: onFirstDataRendered
};

function countryValueFormatter(params) {
    var value = params.value;
    return value + ' (' + COUNTRY_CODES[value].toUpperCase() + ')';
}

function printFilterModel() {
    var filterModel = gridOptions.api.getFilterModel();
    console.log(filterModel);
}

var COUNTRY_CODES = {
    Ireland: 'ie',
    Luxembourg: 'lu',
    Belgium: 'be',
    Spain: 'es',
    France: 'fr',
    Germany: 'de',
    Sweden: 'se',
    Italy: 'it',
    Greece: 'gr',
    Iceland: 'is',
    Portugal: 'pt',
    Malta: 'mt',
    Norway: 'no',
    Brazil: 'br',
    Argentina: 'ar',
    Colombia: 'co',
    Peru: 'pe',
    Venezuela: 've',
    Uruguay: 'uy',
};

function onFirstDataRendered(params) {
    params.api.getToolPanelInstance('filters').expandFilters();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid
        .simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json'})
        .then(function(data) {
            // only return data that has corresponding country codes
            var dataWithFlags = data.filter(function(d) {
                return COUNTRY_CODES[d.country]
            });

            gridOptions.api.setRowData(dataWithFlags);
        });
});
