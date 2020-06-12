var gridOptions = {
    columnDefs: [
        { field: 'athlete', filter: 'agCombinedColumnFilter' },
        {
            field: 'country',
            filter: 'agCombinedColumnFilter',
            filterParams: { combineWithFilter: 'text' }
        },
        {
            field: 'gold',
            filter: 'agCombinedColumnFilter',
            filterParams: { combineWithFilter: 'agNumberColumnFilter' }
        },
        {
            field: 'date',
            filter: 'agCombinedColumnFilter',
            filterParams: { combineWithFilter: 'agDateColumnFilter' }
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 200,
        resizable: true,
        floatingFilter: true,
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
