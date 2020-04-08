function irishAthletes() {
    return [
        'John Joe Nevin',
        'Katie Taylor',
        'Paddy Barnes',
        'Kenny Egan',
        'Darren Sutherland',
        'Margaret Thatcher',
        'Tony Blair',
        'Ronald Regan',
        'Barack Obama'
    ];
}

var gridOptions = {
    columnDefs: [
        {
            field: 'athlete',
            filter: 'agSetColumnFilter',
            filterParams: {
                cellHeight: 20,
                values: irishAthletes(),
                debounceMs: 1000
            }
        },
        {
            field: 'sport',
            filter: 'agSetColumnFilter',
            filterParams: {
                suppressMiniFilter: true
            }
        },
        {
            field: 'country',
            filter: 'agSetColumnFilter',
            cellRenderer: 'countryCellRenderer',
            keyCreator: countryKeyCreator,
        },
        { field: 'age', filter: 'agNumberColumnFilter' },
        { field: 'gold', filter: 'agNumberColumnFilter' },
        { field: 'silver', filter: 'agNumberColumnFilter' },
        { field: 'bronze', filter: 'agNumberColumnFilter' },
        { field: 'total', filter: 'agNumberColumnFilter' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 180,
        editable: true,
        resizable: true,
        floatingFilter: true,
    },
    components: {
        countryCellRenderer: countryCellRenderer
    },
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

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' }).then(function(data) {
        patchData(data);
        gridOptions.api.setRowData(data);
    });
});
