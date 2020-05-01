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

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
