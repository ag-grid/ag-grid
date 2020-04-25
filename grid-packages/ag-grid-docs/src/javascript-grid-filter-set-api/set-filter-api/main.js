var gridOptions = {
    columnDefs: [
        {
            field: 'athlete',
            filter: 'agSetColumnFilter',
            filterParams: {
                cellHeight: 20
            }
        },
        { field: 'age', maxWidth: 120, filter: 'agNumberColumnFilter' },
        {
            field: 'country',
            cellRenderer: 'countryCellRenderer',
            keyCreator: countryKeyCreator,
            filterParams: {
                // values: ['England', 'France', 'Australia'],
                newRowsAction: 'keep'
            }
        },
        { field: 'year', maxWidth: 120 },
        { field: 'date' },
        { field: 'sport' },
        { field: 'gold', filter: 'agNumberColumnFilter' },
        { field: 'silver', filter: 'agNumberColumnFilter' },
        { field: 'bronze', filter: 'agNumberColumnFilter' },
        { field: 'total', filter: 'agNumberColumnFilter' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 160,
        filter: true,
        resizable: true,
    },
    components: {
        countryCellRenderer: countryCellRenderer
    }
};

function countryCellRenderer(params) {
    return params.value.name + ' (' + params.value.code + ')';
}

function countryKeyCreator(params) {
    var countryObject = params.value;
    return countryObject.name;
}

function patchData(data) {
    // hack the data, replace each country with an object of country name and code
    data.forEach(function(row) {
        var countryName = row.country;
        var countryCode = countryName.substring(0, 2).toUpperCase();
        row.country = {
            name: countryName,
            code: countryCode
        };
    });
}

function selectJohnAndKenny() {
    var instance = gridOptions.api.getFilterInstance('athlete');
    instance.selectNothing();
    instance.selectValue('John Joe Nevin');
    instance.selectValue('Kenny Egan');
    instance.applyModel();
    gridOptions.api.onFilterChanged();
}

function selectEverything() {
    var instance = gridOptions.api.getFilterInstance('athlete');
    instance.selectEverything();
    instance.applyModel();
    gridOptions.api.onFilterChanged();
}

function selectNothing() {
    var instance = gridOptions.api.getFilterInstance('athlete');
    instance.selectNothing();
    instance.applyModel();
    gridOptions.api.onFilterChanged();
}

function setCountriesToFranceAustralia() {
    var instance = gridOptions.api.getFilterInstance('country');
    instance.setFilterValues(['France', 'Australia']);
    instance.applyModel();
    gridOptions.api.onFilterChanged();
}

function setCountriesToAll() {
    var instance = gridOptions.api.getFilterInstance('country');
    instance.resetFilterValues();
    instance.applyModel();
    gridOptions.api.onFilterChanged();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            patchData(data);
            gridOptions.api.setRowData(data);
        });
});
