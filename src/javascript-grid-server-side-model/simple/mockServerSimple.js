function ServerSideDatasource(fakeServer) {
    this.fakeServer = fakeServer;
}

ServerSideDatasource.prototype.getRows = function(params) {
    console.log('ServerSideDatasource.getRows: params = ', params);

    var request = params.request;

    // if we are on the top level, then group keys will be [],
    // if we are on the second level, then group keys will be like ['United States']
    var groupKeys = request.groupKeys;
    var doingTopLevel = groupKeys.length === 0;

    if (doingTopLevel) {
        this.fakeServer.getTopLevelCountryList(successCallback, request);
    } else {
        var country = request.groupKeys[0];
        this.fakeServer.getCountryDetails(successCallback, country, request);
    }

    function successCallback(resultForGrid, lastRow) {
        params.successCallback(resultForGrid, lastRow);
    }
};

function FakeServer(allData) {
    this.initData(allData);
}

FakeServer.prototype.initData = function(allData) {
    var topLevelCountryGroups = [];
    var bottomLevelCountryDetails = {}; // will be a map of [country name => records]

    allData.forEach( function(dataItem) {
        // get country this item is for
        var country = dataItem.country;

        // get the top level group for this country
        var childrenThisCountry = bottomLevelCountryDetails[country];
        var groupThisCountry = _.find(topLevelCountryGroups, {country: country});
        if (!childrenThisCountry) {
            // no group exists yet, so create it
            childrenThisCountry = [];
            bottomLevelCountryDetails[country] = childrenThisCountry;

            // add a group to the top level
            groupThisCountry = {country: country, gold: 0, silver: 0, bronze: 0};
            topLevelCountryGroups.push(groupThisCountry);
        }

        // add this record to the county group
        childrenThisCountry.push(dataItem);

        // increment the group sums
        groupThisCountry.gold += dataItem.gold;
        groupThisCountry.silver += dataItem.silver;
        groupThisCountry.bronze += dataItem.bronze;
    });

    this.topLevelCountryGroups = topLevelCountryGroups;
    this.bottomLevelCountryDetails = bottomLevelCountryDetails;

    this.topLevelCountryGroups.sort(function(a,b) { return a.country < b.country ? -1 : 1; });
};

FakeServer.prototype.sortList = function(data, sortModel) {
    var sortPresent = sortModel && sortModel.length > 0;
    if (!sortPresent) {
        return data;
    }
    // do an in memory sort of the data, across all the fields
    var resultOfSort = data.slice();
    resultOfSort.sort(function(a,b) {
        for (var k = 0; k<sortModel.length; k++) {
            var sortColModel = sortModel[k];
            var valueA = a[sortColModel.colId];
            var valueB = b[sortColModel.colId];
            // this filter didn't find a difference, move onto the next one
            if (valueA==valueB) {
                continue;
            }
            var sortDirection = sortColModel.sort === 'asc' ? 1 : -1;
            if (valueA > valueB) {
                return sortDirection;
            } else {
                return sortDirection * -1;
            }
        }
        // no filters found a difference
        return 0;
    });
    return resultOfSort;
};

// when looking for the top list, always return back the full list of countries
FakeServer.prototype.getTopLevelCountryList = function(callback, request) {

    var lastRow = this.getLastRowResult(this.topLevelCountryGroups, request);
    var rowData = this.getBlockFromResult(this.topLevelCountryGroups, request);

    // put the response into a timeout, so it looks like an async call from a server
    setTimeout( function() {
        callback(rowData, lastRow);
    }, 1000);
};

FakeServer.prototype.getCountryDetails = function(callback, country, request) {

    var countryDetails = this.bottomLevelCountryDetails[country];

    var countryDetailsSorted = this.sortList(countryDetails, request.sortModel);

    var lastRow = this.getLastRowResult(countryDetailsSorted, request);
    var rowData = this.getBlockFromResult(countryDetailsSorted, request);

    // put the response into a timeout, so it looks like an async call from a server
    setTimeout( function() {
        callback(rowData, lastRow);
    }, 1000);
};

FakeServer.prototype.getBlockFromResult = function(data, request) {
    return data.slice(request.startRow, request.endRow);
};

FakeServer.prototype.getLastRowResult = function(result, request) {
    // we mimic finding the last row. if the request exceeds the length of the
    // list, then we assume the last row is found. this would be similar to hitting
    // a database, where we have gone past the last row.
    var lastRowFound = (result.length <= request.endRow);
    var lastRow = lastRowFound ? result.length : null;
    return lastRow;
};