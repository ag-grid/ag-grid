var columnDefs = [
    {
        field: 'athlete',
        filter: 'agTextColumnFilter',
        filterParams: {
            buttons: ['reset', 'apply'],
        }
    },
    {
        field: 'age',
        maxWidth: 100,
        filter: 'agNumberColumnFilter',
        filterParams: {
            buttons: ['apply', 'reset'],
            closeOnApply: true,
        }
    },
    {
        field: 'country',
        filter: 'agSetColumnFilter',
        filterParams: {
            buttons: ['clear', 'apply'],
        }
    },
    {
        field: 'year',
        filter: 'agSetColumnFilter',
        maxWidth: 100,
    },
    { field: 'sport' },
    { field: 'gold', filter: 'agNumberColumnFilter' },
    { field: 'silver', filter: 'agNumberColumnFilter' },
    { field: 'bronze', filter: 'agNumberColumnFilter' },
    { field: 'total', filter: 'agNumberColumnFilter' },
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        filter: true,
    },
    onFilterChanged: function(e) {
        console.log('onFilterChanged', e);
        console.log('gridApi.getFilterModel() =>', e.api.getFilterModel());
    },
    onFilterModified: function(e) {
        console.log('onFilterModified', e);
        console.log('filterInstance.getModel() =>', e.filterInstance.getModel());
        console.log('filterInstance.getModelFromUi() =>', e.filterInstance.getModelFromUi());
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
