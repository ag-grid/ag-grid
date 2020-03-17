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
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
