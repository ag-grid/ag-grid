var columnDefs = [
    {
        headerName: 'Athlete',
        field: 'athlete',
        width: 150,
        filter: 'agSetColumnFilter',
        filterParams: {cellHeight: 20}
    },
    {headerName: 'Age', field: 'age', width: 90, filter: 'agNumberColumnFilter'},
    {
        headerName: 'Country',
        field: 'country',
        width: 140,
        cellRenderer: 'countryCellRenderer',
        keyCreator: countryKeyCreator,
        filterParams: {
            // values: ['England', 'France', 'Australia'],
            newRowsAction: 'keep'
        }
    },
    {headerName: 'Year', field: 'year', width: 90},
    {headerName: 'Date', field: 'date', width: 110},
    {headerName: 'Sport', field: 'sport', width: 110},
    {headerName: 'Gold', field: 'gold', width: 100, filter: 'agNumberColumnFilter'},
    {headerName: 'Silver', field: 'silver', width: 100, filter: 'agNumberColumnFilter'},
    {headerName: 'Bronze', field: 'bronze', width: 100, filter: 'agNumberColumnFilter'},
    {headerName: 'Total', field: 'total', width: 100, filter: 'agNumberColumnFilter'}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    enableFilter: true,
    enableColResize: true,
    components: {
        countryCellRenderer: countryCellRenderer
    }
};

function countryCellRenderer(params) {
    return params.value.name + ' (' + params.value.code + ')';
}

function countryKeyCreator(params) {
    var countryObject = params.value;
    var key = countryObject.name;
    return key;
}

function onFilterChanged(value) {
    gridOptions.api.setQuickFilter(value);
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
    var athleteFilterComponent = gridOptions.api.getFilterInstance('athlete');
    athleteFilterComponent.selectNothing();
    athleteFilterComponent.selectValue('John Joe Nevin');
    athleteFilterComponent.selectValue('Kenny Egan');
    gridOptions.api.onFilterChanged();
}

function selectEverything() {
    var athleteFilterComponent = gridOptions.api.getFilterInstance('athlete');
    athleteFilterComponent.selectEverything();
    gridOptions.api.onFilterChanged();
}

function selectNothing() {
    var athleteFilterComponent = gridOptions.api.getFilterInstance('athlete');
    athleteFilterComponent.selectNothing();
    gridOptions.api.onFilterChanged();
}

function setCountriesToFranceAustralia() {
    var countryFilterComponent = gridOptions.api.getFilterInstance('country');
    countryFilterComponent.setFilterValues(['France', 'Australia']);
}

function setCountriesToAll() {
    var countryFilterComponent = gridOptions.api.getFilterInstance('country');
    countryFilterComponent.resetFilterValues();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json'}).then(function(data) {
        patchData(data);
        gridOptions.api.setRowData(data);
    });
});
