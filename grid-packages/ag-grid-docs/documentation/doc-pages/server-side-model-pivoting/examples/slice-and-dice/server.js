function createServerSideDatasource(fakeServer, gridOptions) {
    class ServerSideDatasource {
        constructor(fakeServer, gridOptions) {
            this.fakeServer = fakeServer;
            this.gridOptions = gridOptions;
        }

        getRows(params) {
            // console.log('ServerSideDatasource.getRows: params = ', params);
            var that = this;
            this.fakeServer.getData(params.request,
                function successCallback(resultForGrid, lastRow, pivotResultColDefs) {
                    params.success({ rowData: resultForGrid, rowCount: lastRow });
                    that.setPivotResultColsIntoGrid(pivotResultColDefs);
                });
        };

        // we only set the pivot result cols if they have changed since the last time. otherwise
        // the cols would reset every time data comes back from the server (which means col
        // width, positioning etc would be lost every time we eg expand a group, or load another
        // block by scrolling down).
        setPivotResultColsIntoGrid(pivotResultColDefs) {
            var colDefHash = this.createColsHash(pivotResultColDefs);
            if (this.colDefHash !== colDefHash) {
                this.gridOptions.columnApi.setPivotResultColumns(pivotResultColDefs);
                this.colDefHash = colDefHash;
            }
        };

        createColsHash(colDefs) {
            if (!colDefs) {
                return null;
            }
            var parts = [];
            var that = this;
            colDefs.forEach(function (colDef) {
                if (colDef.children) {
                    parts.push(colDef.groupId);
                    parts.push('[' + that.createColsHash(colDef.children) + ']');
                } else {
                    parts.push(colDef.colId);
                    // headerName can change if the aggFunc was changed in a value col. if we didn't
                    // do this, then the grid would not pick up on new header names as we move from
                    // eg min to max.
                    if (colDef.headerName) {
                        parts.push(colDef.headerName);
                    }
                }
            });
            return parts.join(',');
        };
    }

    return new ServerSideDatasource(fakeServer, gridOptions);
}

function createFakeServer(data) {
    // THIS IS NOT PRODUCTION CODE
    // in your application, you should be implementing the server logic in your server, maybe in JavaScript, but
    // also maybe in Java, C# or another server side language. The server side would then typically query a database
    // or another data store to get the data, and the grouping, aggregation and pivoting would be done by the data store.
    // This fake server is only intended to demonstrate the interface between AG Grid and the server side. The
    // implementation details are not intended to be an example of how your server side should create results.
    class FakeServer {
        constructor(allData) {
            this.allData = allData;
        }

        getData(request, callback) {

            // the row group cols, ie the cols that the user has dragged into the
            // 'group by' zone, eg 'Country' and 'Year'
            var rowGroupCols = request.rowGroupCols;
            // the keys we are looking at. will be empty if looking at top level (either
            // no groups, or looking at top level groups). eg ['United States','2002']
            var groupKeys = request.groupKeys;
            // if going aggregation, contains the value columns, eg ['gold','silver','bronze']
            var valueCols = request.valueCols;
            // if pivoting, contains the columns we are pivoting by
            var pivotCols = request.pivotCols;

            var pivotMode = request.pivotMode;
            var pivotActive = pivotMode && pivotCols.length > 0 && valueCols.length > 0;

            // we are not doing sorting and filtering in this example, but if you did
            // want to sort or filter using your implementation, you would do it here.
            var filterModel = request.filterModel;
            var sortModel = request.sortModel;

            var rowData = this.allData;

            // if pivoting, this gets set
            var pivotResultColDefs = null;

            rowData = this.filterList(rowData, filterModel);

            if (pivotActive) {
                var pivotResult = this.pivot(pivotCols, rowGroupCols, valueCols, rowData);
                rowData = pivotResult.data;
                valueCols = pivotResult.aggCols;
                pivotResultColDefs = pivotResult.pivotResultColDefs;
            }

            // if not grouping, just return the full set
            if (rowGroupCols.length > 0) {
                // otherwise if grouping, a few steps...

                // first, if not the top level, take out everything that is not under the group
                // we are looking at.
                rowData = this.filterOutOtherGroups(rowData, groupKeys, rowGroupCols);

                // if we are showing a group level, we need to group, otherwise we are showing
                // a leaf level.
                var showingGroupLevel = rowGroupCols.length > groupKeys.length;

                if (showingGroupLevel) {
                    rowData = this.buildGroupsFromData(rowData, rowGroupCols, groupKeys, valueCols);
                }
            } else if (pivotMode) {
                // if pivot mode active, but no grouping, then we aggregate everything in to one group
                var rootGroup = this.aggregateList(rowData, valueCols);
                rowData = [rootGroup];
            }

            // sort data if needed
            rowData = this.sortList(rowData, sortModel);

            // we mimic finding the last row. if the request exceeds the length of the
            // list, then we assume the last row is found. this would be similar to hitting
            // a database, where we have gone past the last row.
            var lastRow;
            if (request.startRow != null && request.endRow != null) {
                var lastRowFound = (rowData.length <= request.endRow);
                lastRow = lastRowFound ? rowData.length : null;

                // only return back the rows that the user asked for
                rowData = rowData.slice(request.startRow, request.endRow);
            }

            // so that the example behaves like a server side call, we put
            // it in a timeout to a) give a delay and b) make it asynchronous
            setTimeout(function () {
                callback(rowData, lastRow, pivotResultColDefs);
            }, 1000);
        };

        sortList(data, sortModel) {
            var sortPresent = sortModel && sortModel.length > 0;
            if (!sortPresent) {
                return data;
            }
            // do an in memory sort of the data, across all the fields
            var resultOfSort = data.slice();
            resultOfSort.sort(function (a, b) {
                for (var k = 0; k < sortModel.length; k++) {
                    var sortColModel = sortModel[k];
                    var valueA = a[sortColModel.colId];
                    var valueB = b[sortColModel.colId];
                    // this filter didn't find a difference, move onto the next one
                    if (valueA == valueB) {
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

        filterList(data, filterModel) {
            var filterPresent = filterModel && Object.keys(filterModel).length > 0;
            if (!filterPresent) {
                return data;
            }

            var resultOfFilter = [];
            for (var i = 0; i < data.length; i++) {
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
                    if (filterModel.year.values.indexOf(item.year.toString()) < 0) {
                        // year didn't match, so skip this record
                        continue;
                    }
                }

                if (filterModel.country) {
                    if (filterModel.country.values.indexOf(item.country) < 0) {
                        continue;
                    }
                }

                resultOfFilter.push(item);
            }

            return resultOfFilter;
        };

        iterateObject(object, callback) {
            if (!object) {
                return;
            }

            var keys = Object.keys(object);

            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var value = object[key];
                callback(key, value);
            }
        };

        // function does pivoting. this is very funky logic, doing pivoting and creating pivot result columns on the fly.
        // if you are using the AG Grid Enterprise Row Model, remember this would all be done on your server side with a
        // database or something that does pivoting for you - this messy code is just for demo purposes on how to use
        // ag-Gird, it's not supposed to be beautiful production quality code.
        pivot(pivotCols, rowGroupCols, valueCols, data) {
            // assume 1 pivot col and 1 value col for this example

            var pivotData = [];
            var aggColsList = [];

            var colKeyExistsMap = {};

            var pivotResultColDefs = [];
            var pivotResultColDefsMap = {};

            data.forEach(function (item) {

                var pivotValues = [];
                pivotCols.forEach(function (pivotCol) {
                    var pivotField = pivotCol.id;
                    var pivotValue = item[pivotField];
                    if (pivotValue !== null && pivotValue !== undefined && pivotValue.toString) {
                        pivotValues.push(pivotValue.toString());
                    } else {
                        pivotValues.push('-');
                    }
                });

                // var pivotValue = item[pivotField].toString();
                var pivotItem = {};

                valueCols.forEach(function (valueCol) {
                    var valField = valueCol.id;
                    var colKey = createColKey(pivotValues, valField);

                    var value = item[valField];
                    pivotItem[colKey] = value;

                    if (!colKeyExistsMap[colKey]) {
                        addNewAggCol(colKey, valueCol);
                        addNewPivotResultColDef(colKey, pivotValues, valueCol);
                        colKeyExistsMap[colKey] = true;
                    }
                });

                rowGroupCols.forEach(function (rowGroupCol) {
                    var rowGroupField = rowGroupCol.id;
                    pivotItem[rowGroupField] = item[rowGroupField];
                });

                pivotData.push(pivotItem);
            });

            function addNewAggCol(colKey, valueCol) {
                var newCol = {
                    id: colKey,
                    field: colKey,
                    aggFunc: valueCol.aggFunc
                };
                aggColsList.push(newCol);
            }

            function addNewPivotResultColDef(colKey, pivotValues, valueCol) {

                var parentGroup = null;

                var keyParts = [];

                pivotValues.forEach(function (pivotValue) {
                    keyParts.push(pivotValue);
                    var colKey = createColKey(keyParts);
                    var groupColDef = pivotResultColDefsMap[colKey];
                    if (!groupColDef) {
                        groupColDef = {
                            groupId: colKey,
                            headerName: pivotValue,
                            children: []
                        };
                        pivotResultColDefsMap[colKey] = groupColDef;
                        if (parentGroup) {
                            parentGroup.children.push(groupColDef);
                        } else {
                            pivotResultColDefs.push(groupColDef);
                        }
                    }
                    parentGroup = groupColDef;
                });

                parentGroup.children.push({
                    colId: colKey,
                    headerName: valueCol.aggFunc + '(' + valueCol.displayName + ')',
                    field: colKey
                });
            }

            function createColKey(pivotValues, valueField) {
                var result = pivotValues.join('|');
                if (valueField !== undefined) {
                    result += '|' + valueField;
                }
                return result;
            }

            return {
                data: pivotData,
                aggCols: aggColsList,
                pivotResultColDefs: pivotResultColDefs
            };
        };

        buildGroupsFromData(rowData, rowGroupCols, groupKeys, valueCols) {
            var rowGroupCol = rowGroupCols[groupKeys.length];
            var field = rowGroupCol.id;
            var mappedRowData = this.groupBy(rowData, field);
            var groups = [];
            var that = this;

            this.iterateObject(mappedRowData, function (key, rowData) {
                var groupItem = that.aggregateList(rowData, valueCols);
                groupItem[field] = key;
                groups.push(groupItem);
            });
            return groups;
        };

        aggregateList(rowData, valueCols) {

            var result = {};

            valueCols.forEach(function (valueCol) {
                var field = valueCol.id;

                var values = [];
                rowData.forEach(function (childItem) {
                    var value = childItem[field];
                    // if pivoting, value will be undefined if this row data has no value for the column
                    if (value !== undefined) {
                        values.push(value);
                    }
                });

                // the aggregation we do depends on which agg func the user picked
                switch (valueCol.aggFunc) {
                    case 'sum':
                        var sum = 0;
                        values.forEach(function (value) {
                            sum += value;
                        });
                        result[field] = sum;
                        break;
                    case 'min':
                        var min = null;
                        values.forEach(function (value) {
                            if (min === null || min > value) {
                                min = value;
                            }
                        });
                        result[field] = min;
                        break;
                    case 'max':
                        var max = null;
                        values.forEach(function (value) {
                            if (max === null || max < value) {
                                max = value;
                            }
                        });
                        result[field] = max;
                        break;
                    case 'random':
                        result[field] = Math.random(); // just make up a number
                        break;
                    default:
                        console.warn('unrecognised aggregation function: ' + valueCol.aggFunc);
                        break;
                }

            });

            return result;
        };

        // if user is down some group levels, we take everything else out. eg
        // if user has opened the two groups United States and 2002, we filter
        // out everything that is not equal to United States and 2002.
        filterOutOtherGroups(originalData, groupKeys, rowGroupCols) {
            var filteredData = originalData;
            var that = this;

            // if we are inside a group, then filter out everything that is not
            // part of this group
            groupKeys.forEach(function (groupKey, index) {
                var rowGroupCol = rowGroupCols[index];
                var field = rowGroupCol.id;

                filteredData = that.filter(filteredData, function (item) {
                    return item[field] == groupKey;
                });
            });

            return filteredData;
        };

        groupBy(data, field) {
            var result = {};
            data.forEach(function (item) {
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

        filter(data, callback) {
            var result = [];
            data.forEach(function (item) {
                if (callback(item)) {
                    result.push(item);
                }
            });
            return result;
        };
    }
    return new FakeServer(data);
}
