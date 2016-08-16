var columnDefs = [
    {headerName: "Item ID", field: "id",
        cellRenderer: function(params) {
            if (params.value !== undefined) {
                return params.value;
            } else {
                return '<img src="../images/loading.gif">'
            }
        }
    },
    {headerName: "Make", field: "make"},
    {headerName: "Model", field: "model"},
    {headerName: "Price", field: "price", cellFormatter: function(params) {
        if (typeof params.value === 'number') {
            return '£' + params.value.toLocaleString();
        } else {
            return params.value;
        }
    } }
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

function refreshCache() {
    gridOptions.api.refreshVirtualPageCache();
}

function purgeCache() {
    gridOptions.api.purgeVirtualPageCache();
}

function setRowCountTo200() {
    gridOptions.api.setVirtualRowCount(200, false);
}

function rowsAndMaxFound() {
    console.log('getVirtualRowCount() => ' + gridOptions.api.getVirtualRowCount());
    console.log('isMaxRowFound() => ' + gridOptions.api.isMaxRowFound());
}

// function just gives new prices to the row data, it does not update the grid
function setPricesHigh() {
    allOfTheData.forEach( function(dataItem) {
        dataItem.price = Math.round(55500 + (400 * (.5 + Math.random())));
    });
}

function setPricesLow() {
    allOfTheData.forEach( function(dataItem) {
        dataItem.price = Math.round(1000 + (100 * (.5 + Math.random())));
    });
}

function printCacheState() {
    console.log('*** Cache State ***');
    console.log(gridOptions.api.getVirtualPageState());
}

function jumpTo500() {
    // first up, need to make sure the grid is actually showing 500 or more rows
    if (gridOptions.api.getVirtualRowCount() < 501) {
        gridOptions.api.setVirtualRowCount(501, false);
    }
    // next, we can jump to the row
    gridOptions.api.ensureIndexVisible(500);
}

var dataSource = {
    rowCount: null, // behave as infinite scroll
    getRows: function (params) {
        console.log('asking for ' + params.startRow + ' to ' + params.endRow);
        // At this point in your code, you would call the server.
        // To make the demo look real, wait for 500ms before returning
        setTimeout( function() {
            // take a slice of the total rows
            var rowsThisPage = allOfTheData.slice(params.startRow, params.endRow);
            // make a copy of each row - this is what would happen if taking data from server
            for (var i = 0; i<rowsThisPage.length; i++) {
                var item = rowsThisPage[i];
                // this is a trick to copy an object
                var itemCopy = JSON.parse(JSON.stringify(item));
                rowsThisPage[i] = itemCopy;
            }
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
    },

    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    },

    getRowStyle: function(params) {
        if (params.data && params.data.make==='Honda') {
            return {
                fontWeight: 'bold'
            }
        } else {
            return null;
        }
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
