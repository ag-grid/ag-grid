var gridOptions = {
    columnDefs: [
        // set filter
        {
            field: 'athlete',
            filter: 'agSetColumnFilter',
            filterParams: {
                textFormatter: replaceAccents,
            }
        },

        // number filters
        { field: 'gold', filter: 'agNumberColumnFilter' },
        { field: 'silver', filter: 'agNumberColumnFilter' },
        { field: 'bronze', filter: 'agNumberColumnFilter' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 200,
        resizable: true,
        floatingFilter: true,
    }
};

function replaceAccents(value) {
    return value
        .toLowerCase()
        .replace(new RegExp('[àáâãäå]', 'g'), 'a')
        .replace(new RegExp('æ', 'g'), 'ae')
        .replace(new RegExp('ç', 'g'), 'c')
        .replace(new RegExp('[èéêë]', 'g'), 'e')
        .replace(new RegExp('[ìíîï]', 'g'), 'i')
        .replace(new RegExp('ñ', 'g'), 'n')
        .replace(new RegExp('[òóôõøö]', 'g'), 'o')
        .replace(new RegExp('œ', 'g'), 'oe')
        .replace(new RegExp('[ùúûü]', 'g'), 'u')
        .replace(new RegExp('[ýÿ]', 'g'), 'y')
        .replace(new RegExp('\\W', 'g'), '');
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
