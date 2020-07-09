var latinText =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum';


var gridOptions = {
    columnDefs: [
        {field: 'latinText', width: 350, cellStyle: {'white-space': 'normal'}},
        {field: 'athlete'},
        {field: 'country'},
        {field: 'date'},
        {field: 'sport'},
        {field: 'gold'},
        {field: 'silver'},
        {field: 'bronze'},
        {field: 'total'}
    ],
    defaultColDef: {
        width: 170,
        sortable: true,
        editable: true,
        resizable: true,
        filter: true
    },
    // call back function, to tell the grid what height
    // each row should be
    getRowHeight: getRowHeight
};

function getRowHeight(params) {
    return params.api.getSizesForCurrentTheme().rowHeight * (Math.floor(params.data.latinText.length / 50));
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json'})
        .then(function (data) {
            data.forEach(function (dataItem) {
                var start = Math.floor(Math.random() * (latinText.length / 2));
                var end = Math.floor(Math.random() * (latinText.length / 2) + latinText.length / 2);
                dataItem.latinText = latinText.substring(start, end);
            });

            // now set the data into the grid
            gridOptions.api.setRowData(data);
        });
});
