function EnterpriseDatasource(fakeServer, gridOptions) {
    this.fakeServer = fakeServer;
    this.gridOptions = gridOptions;
}

EnterpriseDatasource.prototype.getRows = function(params) {
    // console.log('EnterpriseDatasource.getRows: params = ', params);
    var that = this;
    this.fakeServer.getData(params.request,
        function successCallback(resultForGrid, lastRow, secondaryCols) {
            params.successCallback(resultForGrid, lastRow);

            let secondaryColumnDefinitions = that.buildSecondaryColumnDefinitions(secondaryCols);
            that.gridOptions.columnApi.setSecondaryColumns(secondaryColumnDefinitions);
        });
};

EnterpriseDatasource.prototype.buildSecondaryColumnDefinitions = function(valueCols) {
    if (valueCols) {
        return valueCols.map( function(col) {
            return {
                headerName: col.displayName,
                field: col.field
            }
        } );
    } else {
        return null;
    }
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
    // if pivoting, contains the columns we are pivoting by
    var pivotCols = request.pivotCols;

    var pivotActive = request.pivotMode && pivotCols.length > 0 && valueCols.length > 0;

    // we are not doing sorting and filtering in this example, but if you did
    // want to sort or filter using your implementation, you would do it here.
    var filterModel = request.filterModel;
    var sortModel = request.sortModel;

    var rowData = this.allData;

    rowData = this.filterList(rowData, filterModel);

    if (pivotActive) {
        var pivotResult = this.pivot(pivotCols, rowGroupCols, valueCols, rowData);
        rowData = pivotResult.data;
        valueCols = pivotResult.aggCols;
    }

    // if not grouping, just return the full set
    if (rowGroupCols.length>0) {
        // otherwise if grouping, a few steps...

        // first, if not the top level, take out everything that is not under the group
        // we are looking at.
        rowData = this.filterOutOtherGroups(rowData, groupKeys, rowGroupCols);

        // if grouping, return the group
        var groupingActive = rowGroupCols.length > groupKeys.length;

        if (groupingActive) {
            rowData = this.buildGroupsFromData(rowData, rowGroupCols, groupKeys, valueCols);
        }
    }

    // sort data if needed
    rowData = this.sortList(rowData, sortModel);

    // we mimic finding the last row. if the request exceeds the length of the
    // list, then we assume the last row is found. this would be similar to hitting
    // a database, where we have gone past the last row.
    var lastRowFound = (rowData.length <= request.endRow);
    var lastRow = lastRowFound ? rowData.length : null;

    // only return back the rows that the user asked for
    rowData = rowData.slice(request.startRow, request.endRow);

    // so that the example behaves like a server side call, we put
    // it in a timeout to a) give a delay and b) make it asynchronous
    setTimeout( function() {
        var secondaryCols = pivotActive ? valueCols : null;
        callback(rowData, lastRow, secondaryCols);
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

FakeServer.prototype.iterateObject = function(object, callback) {
    if (!object) {
        return;
    }
    let keys = Object.keys(object);
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let value = object[key];
        callback(key, value);
    }
};

FakeServer.prototype.pivot = function(pivotCols, rowGroupCols, valueCols, data) {
    // assume 1 pivot col and 1 value col for this example
    var pivotCol = pivotCols[0];
    var valueCol = valueCols[0];

    var valField = valueCol.id;
    var pivotField = pivotCol.id;

    var pivotData = [];
    var aggColsList = [];
    var aggColsMap = {};

    data.forEach( function(item) {
        var value = item[valField];
        var pivotValue = item[pivotField].toString();

        if (!aggColsMap[pivotValue]) {
            var newCol = {
                id: pivotValue,
                displayName: valueCol.aggFunc + '(' + pivotValue + ')',
                field: pivotValue,
                aggFunc: valueCol.aggFunc
            };
            aggColsList.push(newCol);
            aggColsMap[pivotValue] = true;
        }

        var pivotItem = {};
        pivotItem[pivotValue] = value;

        rowGroupCols.forEach( function(rowGroupCol) {
            var rowGroupField = rowGroupCol.id;
            pivotItem[rowGroupField] = item[rowGroupField];
        });

        pivotData.push(pivotItem);
    });

    return {
        data: pivotData,
        aggCols: aggColsList
    };
};

FakeServer.prototype.buildGroupsFromData = function(rowData, rowGroupCols, groupKeys, valueCols) {
    var rowGroupCol = rowGroupCols[groupKeys.length];
    var field = rowGroupCol.id;
    var mappedRowData = this.groupBy(rowData, field);
    var groups = [];

    this.iterateObject(mappedRowData, function(key, rowData) {
        var groupItem = {};
        groupItem[field] = key;

        valueCols.forEach(function(valueCol) {
            var field = valueCol.id;

            var values = [];
            rowData.forEach( function(childItem) {
                var value = childItem[field];
                // if pivoting, value will be undefined if this row data has no value for the column
                if (value!==undefined) {
                    values.push(value);
                }
            });

            // the aggregation we do depends on which agg func the user picked
            switch (valueCol.aggFunc) {
                case 'sum':
                    var sum = 0;
                    values.forEach( function(value) {
                        sum += value;
                    });
                    groupItem[field] = sum;
                    break;
                case 'min':
                    var min = null;
                    values.forEach( function(value) {
                        if (min===null || min > value) {
                            min = value;
                        }
                    });
                    groupItem[field] = min;
                    break;
                case 'max':
                    var max = null;
                    values.forEach( function(value) {
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

        groups.push(groupItem);
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
