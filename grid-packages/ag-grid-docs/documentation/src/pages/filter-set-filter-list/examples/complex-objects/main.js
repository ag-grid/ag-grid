var gridOptions = {
    columnDefs: [
        {
            headerName: 'Country (Complex Object)',
            field: 'country',
            keyCreator: countryKeyCreator,
            valueFormatter: countryValueFormatter,
            filter: 'agSetColumnFilter',
        }
    ],
    defaultColDef: {
        flex: 1,
        floatingFilter: true,
    },
    sideBar: 'filters',
    onFirstDataRendered: onFirstDataRendered
};

function countryKeyCreator(params) {
    var countryObject = params.value;
    return countryObject.name;
}

function countryValueFormatter(params) {
    return params.value.name;
}

function printFilterModel() {
    var filterModel = gridOptions.api.getFilterModel();
    console.log(filterModel);
}

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

            // hack the data, replace each country with an object of country name and code
            data.forEach(function(row) {
                var countryName = row.country;
                var countryCode = countryName.substring(0, 2).toUpperCase();
                row.country = {
                    name: countryName,
                    code: countryCode,
                };
            });

            gridOptions.api.setRowData(data);
        });
});
