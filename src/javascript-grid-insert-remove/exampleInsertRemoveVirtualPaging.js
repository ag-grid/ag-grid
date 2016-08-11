var columnDefs = [
    {headerName: "Index",
        // little trick for cellRenderer, we return the grid index
        // of the row
        cellRenderer: function(params) {
            return params.rowIndex;
        }
    },
    {headerName: "Item ID", field: "id"},
    {headerName: "Make", field: "make"},
    {headerName: "Model", field: "model"},
    {headerName: "Price", field: "price"}
];

var makes = ['Toyota', 'Ford', 'Porsche', 'Chevy', 'Honda', 'Nissan'];
var models = ['Cruze', 'Celica', 'Mondeo', 'Boxter', 'Genesis', 'Accord', 'Taurus'];

// this counter is used to give id's to the rows
var sequenceId = 1;

// create a bunch of dummy data
var allOfTheData = [];
for (var i = 0; i<1000; i++) {
    allOfTheData.push(createRowData(sequenceId++));
}

function createRowData(id) {
    return {
        id: id,
        make: makes[id % makes.length],
        model: models[id % models.length],
        price: 72000
    };
}

function insertItemsAt2(count) {
    var newDataItems = [];
    for (var i = 0; i<count; i++) {
        var newItem = createRowData(sequenceId++);
        allOfTheData.splice(2, 0, newItem);
        newDataItems.push(newItem);
    }

    gridOptions.api.insertItemsAtIndex(2, newDataItems);
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

    maxPagesInCache: 2,
    paginationInitialRowCount: 500,
    maxConcurrentDatasourceRequests: 2,

    getRowNodeId: function(item) {
        return item.id.toString();
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
