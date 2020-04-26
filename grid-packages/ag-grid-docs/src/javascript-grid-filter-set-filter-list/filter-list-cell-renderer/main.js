var gridOptions = {
    columnDefs: [
        {
            headerName: 'Cell Renderer',
            field: 'country',
            cellRenderer: countryCellRenderer,
            filter: 'agSetColumnFilter',
            filterParams: {
                // set filter does not inherit column cell renderer
            }
        },
        {
            headerName: 'Separate Cell Renderers',
            field: 'country',
            cellRenderer: countryCellRenderer,
            filter: 'agSetColumnFilter',
            filterParams: {
                cellRenderer: countryFilterCellRenderer,
            },
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

function countryCellRenderer(params) {
    if (!params.value) return '';
    var url = 'https://flags.fmcdn.net/data/flags/mini/' + COUNTRY_CODES[params.value] + '.png';
    var flagImage = '<img class="flag" border="0" width="15" height="10" src="' + url + '">';
    return flagImage + ' ' + params.value;
}

function countryFilterCellRenderer(params) {
    if (!params.value) return '';
    var url = 'https://flags.fmcdn.net/data/flags/mini/' + COUNTRY_CODES[params.value] + '.png';
    var flagImage = '<img class="flag" border="0" width="15" height="10" src="' + url + '">';
    return params.value + ' ' + flagImage;
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
