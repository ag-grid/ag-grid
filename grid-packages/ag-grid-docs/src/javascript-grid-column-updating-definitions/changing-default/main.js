function getColumnDefs() {
    return [
        {field: 'athlete', initialWidth: 100, initialSort: 'asc'},
        {field: 'age'},
        {field: 'country', initialPinned: 'left'},
        {field: 'sport'},
        {field: 'year'},
        {field: 'date'},
        {field: 'gold'},
        {field: 'silver'},
        {field: 'bronze'},
        {field: 'total'}
    ];
}

var gridOptions = {
    defaultColDef: {
        initialWidth: 100,
        sortable: true,
        resizable: true
    },
    columnDefs: getColumnDefs()
};

function onBtWithDefault() {
    gridOptions.api.setColumnDefs(getColumnDefs());
}

function onBtRemove() {
    gridOptions.api.setColumnDefs([]);
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
