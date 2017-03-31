var columnDefs = [
    {headerName: "Athlete", field: "athlete", enableRowGroup: true},
    {headerName: "Age", field: "age", enableRowGroup: true},
    {headerName: "Country", field: "country", rowGroupIndex: 0, enableRowGroup: true},
    {headerName: "Year", field: "year", enableRowGroup: true},
    {headerName: "Sport", field: "sport", enableRowGroup: true},
    {headerName: "Gold", field: "gold", aggFunc: 'sum'},
    {headerName: "Silver", field: "silver", aggFunc: 'sum'},
    {headerName: "Bronze", field: "bronze", aggFunc: 'sum'}
];

var gridOptions = {
    defaultColDef: {
        suppressFilter: true,
        width: 100
    },
    columnDefs: columnDefs,
    enableColResize: true,
    rowModelType: 'enterprise',
    rowGroupPanelShow: 'always',
    animateRows: true,
    debug: true,
    showToolPanel: true
};

function EnterpriseDatasource(fakeServer) {
    this.fakeServer = fakeServer;
}

EnterpriseDatasource.prototype.getRows = function(params) {
    console.log('EnterpriseDatasource.getRows: params = ', params);
    this.fakeServer.getData(params.request,
        function successCallback(resultForGrid) {
            params.successCallback(resultForGrid);
        });
};

function FakeServer(allData) {
    this.allData = allData;
}

FakeServer.prototype.getData = function(request, callback) {

    // the row group cols, ie teh cols that the user has dragged into the
    // 'group by' zone, eg 'Country' and 'Year'
    var rowGroupCols = request.rowGroupCols;
    // the keys we are looking at. will be empty if looking at top level (either
    // no groups, or looking at top level groups). eg ['United States','2002']
    var groupKeys = request.groupKeys;
    // if going aggregation, contains the value columns, eg ['gold','silver','bronze']
    var valueCols = request.valueCols;

    // we are not doing sorting and filtering in this example, but if you did
    // want to sort or filter using your implementation, you would do it here.
    var filterModel = request.filterModel;
    var sortModel = request.sortModel;

    var result;

    // if not grouping, just return the full set
    if (rowGroupCols.length===0) {
        result = this.allData;
    } else {
        // otherwise if grouping, a few steps...

        // first, if not the top level, take out everything that is not under the group
        // we are looking at.
        var filteredData = this.filterOutOtherGroups(this.allData, groupKeys, rowGroupCols);

        // if grouping, return the group
        var showingGroups = rowGroupCols.length > groupKeys.length;

        if (showingGroups) {
            result = this.buildGroupsFromData(filteredData, rowGroupCols, groupKeys, valueCols);
        } else {
            // show all remaining leaf level rows
            result = filteredData;
        }
    }

    // so that the example behaves like a server side call, we put
    // it in a timeout to a) give a delay and b) make it asynchronous
    setTimeout( function() {
        callback(result);
    }, 1000);
};

FakeServer.prototype.buildGroupsFromData = function(filteredData, rowGroupCols, groupKeys, valueCols) {
    var rowGroupCol = rowGroupCols[groupKeys.length];
    var field = rowGroupCol.field;
    var mappedValues = this.groupBy(filteredData, field);
    var listOfKeys = Object.keys(mappedValues);
    var groups = [];
    listOfKeys.forEach(function(key) {
        var groupItem = {};
        groupItem[field] = key;

        valueCols.forEach(function(valueCol) {
            var field = valueCol.field;
            var sum = 0;
            mappedValues[key].forEach( function(childItem) {
                sum += childItem[field];
            });
            groupItem[field] = sum;
        });

        groups.push(groupItem)
    });
    return groups;
};

// if user is down some group levels, we take everything else out. eg
// if user has opened the two groups United States and 2002, we filter
// out everything that is not equal to United States and 2002.
FakeServer.prototype.filterOutOtherGroups = function(originalData, groupKeys, rowGroupCols) {
    var filteredData = originalData;
    var that = this;

    // if we are inside a group, then filter out everything that is not
    // part of this group
    groupKeys.forEach(function(groupKey, index) {
        var rowGroupCol = rowGroupCols[index];
        var field = rowGroupCol.field;

        filteredData = that.filter(filteredData, function(item) {
            return item[field] == groupKey;
        });
    });

    return filteredData;
};

// simple implementation of lodash groupBy
FakeServer.prototype.groupBy = function(data, field) {
    var result = {};
    data.forEach( function(item) {
        var key = item[field];
        var listForThisKey = result[key];
        if (!listForThisKey) {
            listForThisKey = [];
            result[key] = listForThisKey;
        }
        listForThisKey.push(item);
    });
    return result;
};

// simple implementation of lodash filter
FakeServer.prototype.filter = function(data, callback) {
    var result = [];
    data.forEach( function(item) {
        if (callback(item)) {
            result.push(item);
        }
    });
    return result;
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    agGrid.simpleHttpRequest({url: '../olympicWinners.json'})
        .then( function(rows) {
            var fakeServer = new FakeServer(rows);
            var datasource = new EnterpriseDatasource(fakeServer);
            gridOptions.api.setEnterpriseDatasource(datasource);
        }
    );
});
