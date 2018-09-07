var columnDefs = [
    {
        headerName: 'Item ID',
        field: 'id',
        valueGetter: 'node.id',
        cellRenderer: 'loadingRenderer'
    },
    {headerName: 'Make', field: 'make'},
    {headerName: 'Model', field: 'model'},
    {
        headerName: 'Price',
        field: 'price',
        valueFormatter: function(params) {
            if (typeof params.value === 'number') {
                return '£' + params.value.toLocaleString();
            } else {
                return params.value;
            }
        }
    }
];

// this counter is used to give id's to the rows
var sequenceId;

var allOfTheData;

function createRowData(id) {
    var makes = ['Toyota', 'Ford', 'Porsche', 'Chevy', 'Honda', 'Nissan'];
    var models = ['Cruze', 'Celica', 'Mondeo', 'Boxter', 'Genesis', 'Accord', 'Taurus'];
    return {
        id: id,
        make: makes[id % makes.length],
        model: models[id % models.length],
        price: 72000
    };
}

function liveInsertItemsAt2(count) {
    var newDataItems = insertItemsAt2(count);
    gridOptions.api.updateRowData({addIndex: 2, add: newDataItems});
}

function insertItemsAt2AndRefresh(count) {
    insertItemsAt2(count);

    // if the data has stopped looking for the last row, then we need to adjust the
    // row count to allow for the extra data, otherwise the grid will not allow scrolling
    // to the last row. eg if we have 1000 rows, scroll all the way to the bottom (so
    // maxRowFound=true), and then add 5 rows, the rowCount needs to be adjusted
    // to 1005, so grid can scroll to the end. the grid does NOT do this for you in the
    // refreshVirtualPageCache() method, as this would be assuming you want to do it which
    // is not true, maybe the row count is constant and you just want to refresh the details.
    var maxRowFound = gridOptions.api.isMaxRowFound();
    if (maxRowFound) {
        var rowCount = gridOptions.api.getInfiniteRowCount();
        gridOptions.api.setInfiniteRowCount(rowCount + count);
    }

    // get grid to refresh the data
    gridOptions.api.refreshInfiniteCache();
}

function insertItemsAt2(count) {
    var newDataItems = [];
    for (var i = 0; i < count; i++) {
        var newItem = createRowData(sequenceId++);
        allOfTheData.splice(2, 0, newItem);
        newDataItems.push(newItem);
    }
    return newDataItems;
}

function removeItem(start, limit) {
    allOfTheData.splice(start, limit);
    gridOptions.api.refreshInfiniteCache();
}

function refreshCache() {
    gridOptions.api.refreshInfiniteCache();
}

function purgeCache() {
    gridOptions.api.purgeInfiniteCache();
}

function setRowCountTo200() {
    gridOptions.api.setInfiniteRowCount(200, false);
}

function rowsAndMaxFound() {
    console.log('getInfiniteRowCount() => ' + gridOptions.api.getInfiniteRowCount());
    console.log('isMaxRowFound() => ' + gridOptions.api.isMaxRowFound());
}

// function just gives new prices to the row data, it does not update the grid
function setPricesHigh() {
    allOfTheData.forEach(function(dataItem) {
        dataItem.price = Math.round(55500 + 400 * (0.5 + Math.random()));
    });
}

function setPricesLow() {
    allOfTheData.forEach(function(dataItem) {
        dataItem.price = Math.round(1000 + 100 * (0.5 + Math.random()));
    });
}

function printCacheState() {
    console.log('*** Cache State ***');
    console.log(gridOptions.api.getCacheBlockState());
}

function jumpTo500() {
    // first up, need to make sure the grid is actually showing 500 or more rows
    if (gridOptions.api.getInfiniteRowCount() < 501) {
        gridOptions.api.setInfiniteRowCount(501, false);
    }
    // next, we can jump to the row
    gridOptions.api.ensureIndexVisible(500);
}

var datasource = {
    rowCount: null, // behave as infinite scroll
    getRows: function(params) {
        console.log('asking for ' + params.startRow + ' to ' + params.endRow);
        // At this point in your code, you would call the server.
        // To make the demo look real, wait for 500ms before returning
        setTimeout(function() {
            // take a slice of the total rows
            var rowsThisPage = allOfTheData.slice(params.startRow, params.endRow);
            // make a copy of each row - this is what would happen if taking data from server
            for (var i = 0; i < rowsThisPage.length; i++) {
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
    components:{
        loadingRenderer: function(params) {
            if (params.value !== undefined) {
                return params.value;
            } else {
                return '<img src="../images/loading.gif">';
            }
        }
    },
    enableColResize: true,
    rowSelection: 'multiple',
    rowDeselection: true,
    columnDefs: columnDefs,
    rowModelType: 'infinite',
    datasource: datasource,

    maxBlocksInCache: 2,
    infiniteInitialRowCount: 500,
    maxConcurrentDatasourceRequests: 2,

    getRowNodeId: function(item) {
        return item.id.toString();
    },

    onGridReady: function(params) {
        sequenceId = 1;
        allOfTheData = [];
        for (var i = 0; i < 1000; i++) {
            allOfTheData.push(createRowData(sequenceId++));
        }
    },

    onFirstDataRendered(params) {
        params.api.sizeColumnsToFit();
    },

    getRowStyle: function(params) {
        if (params.data && params.data.make === 'Honda') {
            return {
                fontWeight: 'bold'
            };
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
