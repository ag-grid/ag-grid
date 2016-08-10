var columnDefs = [
    {headerName: "Row",
        // little trick for cellRenderer, we return the grid index
        // of the row
        cellRenderer: function(params) {
            return params.rowIndex;
        }
    },
    {headerName: "Item ID", field: "id"},
    {headerName: "Node ID", valueGetter: "node.id"},
    {headerName: "Make", field: "make"},
    {headerName: "Model", field: "model"},
    {headerName: "Price", field: "price"}
];

var makes = ['Toyota', 'Ford', 'Porsche', 'Chevy', 'Honda', 'Nissan'];
var models = ['Cruze', 'Celica', 'Mondeo', 'Boxter', 'Genesis', 'Accord', 'Taurus'];

var sequenceId = 1;

function createRowData(id) {
    return {
        id: id,
        make: makes[id % makes.length],
        model: models[id % models.length],
        price: 72000
    };
}

var allOfTheData = [];
for (var i = 0; i<1000; i++) {
    allOfTheData.push(createRowData(sequenceId++));
}

var dataSource = {
    rowCount: null, // behave as infinite scroll
    getRows: function (params) {
        console.log('asking for ' + params.startRow + ' to ' + params.endRow);
        // At this point in your code, you would call the server, using $http if in AngularJS.
        // To make the demo look real, wait for 500ms before returning
        setTimeout( function() {
            // take a slice of the total rows
            var rowsThisPage = allOfTheData.slice(params.startRow, params.endRow);
            // if on or after the last page, work out the last row.
            var lastRow = -1;
            if (allOfTheData.length <= params.endRow) {
                lastRow = allOfTheData.length;
            }
            // call the success callback
            params.successCallback(rowsThisPage, lastRow);
        }, 500);
    }
};

var gridOptions = {
    enableColResize: true,
    debug: true,
    rowSelection: 'multiple',
    rowDeselection: true,
    columnDefs: columnDefs,
    rowModelType: 'virtual',
    datasource: dataSource,

    maxPagesInPaginationCache: 2,
    paginationInitialRowCount: 500,
    maxConcurrentDatasourceRequests: 2,

    getRowNodeId: function(item) {
        return 'T' + item.id;
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
