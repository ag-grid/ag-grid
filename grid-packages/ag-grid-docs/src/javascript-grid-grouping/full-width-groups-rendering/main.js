var gridOptions = {
    columnDefs: [
        { field: 'athlete', minWidth: 200 },
        { field: 'country', rowGroup: true, hide: true },
        { field: 'age' },
        { field: 'gold', type: 'number' },
        { field: 'silver', type: 'number' },
        { field: 'bronze', type: 'number' },
        { field: 'year', filter: true },
        { field: 'date' },
        { field: 'sport', minWidth: 200 },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        sortable: true,
        resizable: true,
    },
    columnTypes: {
        'number': {
            editable: true,
            // editing works with strings, need to change string to number
            valueParser: function(params) {
                return parseInt(params.newValue);
            },
            aggFunc: 'sum'
        }
    },
    groupUseEntireRow: true,
    components: {
        groupRowInnerRenderer: GroupRowInnerRenderer
    },
    groupRowInnerRenderer: 'groupRowInnerRenderer',
    groupRowRendererParams: {
        flagCodes: {
            Ireland: 'ie',
            'United States': 'us',
            Russia: 'ru',
            Australia: 'au',
            Canada: 'ca',
            Norway: 'no',
            China: 'cn',
            Zimbabwe: 'zw',
            Netherlands: 'nl',
            'South Korea': 'kr',
            Croatia: 'hr',
            France: 'fr'
        }
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
