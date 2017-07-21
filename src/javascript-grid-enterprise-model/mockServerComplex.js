function EnterpriseDatasource(fakeServer) {
    this.fakeServer = fakeServer;
}

EnterpriseDatasource.prototype.getRows = function(params) {
    // console.log('EnterpriseDatasource.getRows: params = ', params);
    this.fakeServer.getData(params.request,
        function successCallback(resultForGrid, lastRow) {
            params.successCallback(resultForGrid, lastRow);
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

    var filteredData = this.filterList(this.allData, filterModel);

    // if not grouping, just return the full set
    if (rowGroupCols.length===0) {
        result = filteredData;
    } else {
        // otherwise if grouping, a few steps...

        // first, if not the top level, take out everything that is not under the group
        // we are looking at.
        var filteredData = this.filterOutOtherGroups(filteredData, groupKeys, rowGroupCols);

        // if grouping, return the group
        var showingGroups = rowGroupCols.length > groupKeys.length;

        if (showingGroups) {
            result = this.buildGroupsFromData(filteredData, rowGroupCols, groupKeys, valueCols);
        } else {
            // show all remaining leaf level rows
            result = filteredData;
        }
    }

    // sort data if needed
    result = this.sortList(result, sortModel);

    // we mimic finding the last row. if the request exceeds the length of the
    // list, then we assume the last row is found. this would be similar to hitting
    // a database, where we have gone past the last row.
    var lastRowFound = (result.length <= request.endRow);
    var lastRow = lastRowFound ? result.length : null;

    // only return back the rows that the user asked for
    var result = result.slice(request.startRow, request.endRow);

    // so that the example behaves like a server side call, we put
    // it in a timeout to a) give a delay and b) make it asynchronous
    setTimeout( function() {
        callback(result, lastRow);
    }, 1000);
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

FakeServer.prototype.filterList = function(data, filterModel) {
    var filterPresent = filterModel && Object.keys(filterModel).length > 0;
    if (!filterPresent) {
        return data;
    }

    var resultOfFilter = [];
    for (var i = 0; i<data.length; i++) {
        var item = data[i];

        if (filterModel.age) {
            var age = item.age;
            var allowedAge = parseInt(filterModel.age.filter);
            if (filterModel.age.type == 'equals') {
                if (age !== allowedAge) {
                    continue;
                }
            } else if (filterModel.age.type == 'lessThan') {
                if (age >= allowedAge) {
                    continue;
                }
            } else {
                if (age <= allowedAge) {
                    continue;
                }
            }
        }

        if (filterModel.year) {
            if (filterModel.year.indexOf(item.year.toString()) < 0) {
                // year didn't match, so skip this record
                continue;
            }
        }

        if (filterModel.country) {
            if (filterModel.country.indexOf(item.country)<0) {
                continue;
            }
        }

        resultOfFilter.push(item);
    }

    return resultOfFilter;
};

FakeServer.prototype.buildGroupsFromData = function(filteredData, rowGroupCols, groupKeys, valueCols) {
    var rowGroupCol = rowGroupCols[groupKeys.length];
    var field = rowGroupCol.id;
    var mappedValues = this.groupBy(filteredData, field);
    var listOfKeys = Object.keys(mappedValues);
    var groups = [];
    listOfKeys.forEach(function(key) {
        var groupItem = {};
        groupItem[field] = key;

        valueCols.forEach(function(valueCol) {
            var field = valueCol.id;

            // the aggregation we do depends on which agg func the user picked
            switch (valueCol.aggFunc) {
                case 'sum':
                    var sum = 0;
                    mappedValues[key].forEach( function(childItem) {
                        var value = childItem[field];
                        sum += value;
                    });
                    groupItem[field] = sum;
                    break;
                case 'min':
                    var min = null;
                    mappedValues[key].forEach( function(childItem) {
                        var value = childItem[field];
                        if (min===null || min > value) {
                            min = value;
                        }
                    });
                    groupItem[field] = min;
                    break;
                case 'max':
                    var max = null;
                    mappedValues[key].forEach( function(childItem) {
                        var value = childItem[field];
                        if (max===null || max < value) {
                            max = value;
                        }
                    });
                    groupItem[field] = max;
                    break;
                case 'random':
                    groupItem[field] = Math.random(); // just make up a number
                    break;
                default:
                    console.warn('unrecognised aggregation function: ' + valueCol.aggFunc);
                    break;
            }

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
        var field = rowGroupCol.id;

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
