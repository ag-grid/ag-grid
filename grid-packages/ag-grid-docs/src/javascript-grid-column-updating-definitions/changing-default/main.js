var columnDefs = [
    {field: 'athlete', defaultWidth: 100, defaultSort: 'asc'},
    {field: 'age'},
    {field: 'country', defaultPinned: 'left'},
    {field: 'sport'},
    {field: 'year'},
    {field: 'date'},
    {field: 'gold'},
    {field: 'silver'},
    {field: 'bronze'},
    {field: 'total'}
];

var gridOptions = {
    defaultColDef: {
        defaultWidth: 100,
        sortable: true,
        resizable: true
    },
    columnDefs: columnDefs
};

function onBtWithDefault() {
    gridOptions.api.setColumnDefs(columnDefs);
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
