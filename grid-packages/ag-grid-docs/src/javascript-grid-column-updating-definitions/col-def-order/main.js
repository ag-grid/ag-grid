var medalsLast = [
    {field: 'athlete'},
    {field: 'age'},
    {field: 'country'},
    {field: 'sport'},
    {field: 'year'},
    {field: 'date'},
    {field: 'gold'},
    {field: 'silver'},
    {field: 'bronze'},
    {field: 'total'}
];

var medalsFirst = [
    {field: 'gold'},
    {field: 'silver'},
    {field: 'bronze'},
    {field: 'total'},
    {field: 'athlete'},
    {field: 'age'},
    {field: 'sport'},
    {field: 'country'},
    {field: 'year'},
    {field: 'date'}
];

var gridOptions = {
    defaultColDef: {
        defaultWidth: 100,
        sortable: true,
        resizable: true
    },
    applyColumnDefOrder: true,
    columnDefs: medalsLast
};

function onBtMedalsFirst() {
    gridOptions.api.setColumnDefs(medalsFirst);
}

function onBtMedalsLast() {
    gridOptions.api.setColumnDefs(medalsLast);
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
