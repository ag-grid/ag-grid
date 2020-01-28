var gridOptions = {
    columnDefs: [
        {headerName: 'Country', field: 'country', rowGroup: true, checkboxSelection: true},
        {headerName: 'Athlete', field: 'athlete'},
        {headerName: 'Age', field: 'age'},
        {headerName: 'Year', field: 'year'},
        {headerName: 'Date', field: 'date'}
    ],
    defaultColDef: {
        resizable: true,
        editable: true,
        filter: true
    },
    rowSelection: 'multiple',
    enableRangeSelection: true
};

document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json'}).then(function(data) {
        gridOptions.api.setRowData(data.slice(0, 600));
        gridOptions.api.expandAll()
    });
});
