var columnDefs = [
    {
        headerName: 'ID',
        field: 'id'
    },
    {
        headerName: 'Expected Position',
        valueGetter: '"translateY(" + node.rowIndex * 100 + "px)"'
    },


    {
        field: 'a'
    },
    {
        field: 'b'
    },
    {
        field: 'c'
    }
];

var gridOptions = {
    debug: true,
    rowHeight: 100,
    columnDefs: columnDefs,
    rowModelType: 'viewport',
    viewportDatasource: createViewportDatasource()
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});


function createViewportDatasource() {

    function MyViewportDataSource() {}

    MyViewportDataSource.prototype.init = function(params) {
        this.initParams = params;
        var oneMillion = 1000 * 1000;
        params.setRowCount(oneMillion);
    };

    MyViewportDataSource.prototype.setViewportRange = function(firstRow, lastRow) {

        var rowData = {};

        for (var rowIndex = firstRow; rowIndex <= lastRow; rowIndex++) {
            var item = {};
            item.id = rowIndex;
            item.a = 'A-' + rowIndex;
            item.b = 'B-' + rowIndex;
            item.c = 'C-' + rowIndex;
            rowData[rowIndex] = (item);
        }

        this.initParams.setRowData(rowData);
    };

    MyViewportDataSource.prototype.destroy = function() {

    };


    return new MyViewportDataSource();
}