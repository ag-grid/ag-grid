var alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

var columnDefs = [];

var checkboxSelectionColumn = {checkboxSelection: true, headerName: '', width: 24};
columnDefs.push(checkboxSelectionColumn);

alphabet.forEach( function(letter) {
    columnDefs.push({headerName: letter.toUpperCase(), field: letter, width: 80});
});

var gridOptions = {
    enableColResize: true,
    debug: true,
    columnDefs: columnDefs,
    rowModelType: 'infinite',
    rowSelection: 'multiple',
    maxPagesInCache: 2,
    suppressRowClickSelection: true,
    getRowNodeId: function(item) {
        return item.a;
    },
    datasource: new MyDatasource(100)
};

function MyDatasource(rowCount) {
    this.rowCount = rowCount;
}

MyDatasource.prototype.getRows = function(params) {

    var rowsThisPage = [];

    for (var rowIndex = params.startRow; rowIndex < params.endRow; rowIndex++) {
        var record = {};
        alphabet.forEach( function(letter, colIndex) {
            var randomNumber = 17+rowIndex+colIndex;
            var cellKey = letter.toUpperCase() + (rowIndex+1);
            record[letter] = cellKey + ' = ' + randomNumber;
        });
        rowsThisPage.push(record);
    }

    // to mimic server call, we reply after a short delay
    setTimeout( function() {
        // no need to pass the second 'rowCount' parameter as we have already provided it
        params.successCallback(rowsThisPage);
    }, 500);

};

document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
