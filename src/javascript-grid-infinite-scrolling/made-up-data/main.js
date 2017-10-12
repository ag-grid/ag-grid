function alphabet() {
    return 'abcdefghijklmnopqrstuvwxyz'.split('');
}

function getColumnDefs() {
    var columnDefs = [];

    var checkboxSelectionColumn = {checkboxSelection: true, headerName: '', width: 24};
    columnDefs.push(checkboxSelectionColumn);

    alphabet().forEach(function(letter) {
        columnDefs.push({headerName: letter.toUpperCase(), field: letter, width: 80});
    });
    return columnDefs;
}

var gridOptions = {
    enableColResize: true,
    columnDefs: getColumnDefs(),
    rowModelType: 'infinite',
    rowSelection: 'multiple',
    maxBlocksInCache: 2,
    suppressRowClickSelection: true,
    getRowNodeId: function(item) {
        return item.a;
    },
    datasource: getDataSource(100)
};

function getDataSource(count) {
    function MyDatasource(rowCount) {
        this.rowCount = rowCount;
    }

    MyDatasource.prototype.getRows = function(params) {
        var rowsThisPage = [];

        for (var rowIndex = params.startRow; rowIndex < params.endRow; rowIndex++) {
            var record = {};
            alphabet().forEach(function(letter, colIndex) {
                var randomNumber = 17 + rowIndex + colIndex;
                var cellKey = letter.toUpperCase() + (rowIndex + 1);
                record[letter] = cellKey + ' = ' + randomNumber;
            });
            rowsThisPage.push(record);
        }

        // to mimic server call, we reply after a short delay
        setTimeout(function() {
            // no need to pass the second 'rowCount' parameter as we have already provided it
            params.successCallback(rowsThisPage);
        }, 500);
    };

    return new MyDatasource(count);
}

document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
