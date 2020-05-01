var gridOptions = {
    columnDefs: [
        { field: 'athlete', minWidth: 200 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
        { field: 'age' },
        {
            field: "country",
            rowGroup: true,
            hide: true,
            valueGetter: countryValueGetter,
            keyCreator: countryKeyCreator
        },
        { field: 'year' },
        { field: 'date' },
        { field: 'sport', minWidth: 200 },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        resizable: true,
    },
    autoGroupColumnDef: {
        minWidth: 200,
    }
};

function countryKeyCreator(params) {
    var countryObject = params.value;
    return countryObject.name;
}

function countryValueGetter(params) {
    // hack the data  - replace the country with an object of country name and code
    var countryName = params.data.country;
    var countryCode = countryName.substring(0, 2).toUpperCase();
    return {
        name: countryName,
        code: countryCode
    };
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
