var latinText =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';


var gridOptions = {
    columnDefs: [
        {field: 'latinText', width: 350, wrapText: true},
        {field: 'athlete'},
        {field: 'country'},
        {field: 'date'},
        {field: 'sport'},
        {field: 'gold'},
        {field: 'silver'},
        {field: 'bronze'},
        {field: 'total'}
    ],
    rowHeight: 120,
    defaultColDef: {
        width: 170,
        sortable: true,
        editable: true,
        resizable: true,
        filter: true
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json'})
        .then(function (data) {
            data.forEach(function (dataItem) {
                dataItem.latinText = latinText;
            });

            // now set the data into the grid
            gridOptions.api.setRowData(data);
        });
});
