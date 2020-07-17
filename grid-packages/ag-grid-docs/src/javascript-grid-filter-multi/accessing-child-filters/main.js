var gridOptions = {
    columnDefs: [
        {
            field: 'athlete',
            filter: 'agMultiColumnFilter',
            filterParams: {
                filters: [
                    {
                        filter: 'agTextColumnFilter',
                        filterParams: {
                            buttons: ['apply', 'clear'],
                        },
                    },
                    {
                        filter: 'agSetColumnFilter',

                    }
                ]
            }
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 200,
        resizable: true,
    },
};

function getTextUiModel() {
    var textFilter = gridOptions.api.getFilterInstance('athlete').getChildFilterInstance(0);
    console.log('Current Text Filter state: ', textFilter.getModelFromUi());
}

function getSetMiniFilter() {
    var setFilter = gridOptions.api.getFilterInstance('athlete').getChildFilterInstance(1);
    console.log('Current Mini Filter text: ', setFilter.getMiniFilter());
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
