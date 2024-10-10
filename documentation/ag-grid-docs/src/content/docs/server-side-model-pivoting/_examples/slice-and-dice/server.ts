export function createServerSideDatasource(fakeServer) {
    class ServerSideDatasource {
        constructor(fakeServer) {
            this.fakeServer = fakeServer;
        }

        getRows(params) {
            this.fakeServer.getData(params.request, (resultForGrid, lastRow, pivotFields) => {
                params.success({
                    rowData: resultForGrid,
                    rowCount: lastRow,
                    pivotResultFields: pivotFields,
                });
            });
        }
    }

    return new ServerSideDatasource(fakeServer);
}

export function createFakeServer(data) {
    // THIS IS NOT PRODUCTION CODE
    // in your application, you should be implementing the server logic in your server, maybe in JavaScript, but
    // also maybe in Java, C# or another server side language. The server side would then typically query a database
    // or another data store to get the data, and the grouping, aggregation and pivoting would be done by the data store.
    // This fake server is only intended to demonstrate the interface between AG Grid and the server side. The
    // implementation details are not intended to be an example of how your server side should create results.

    return new FakeServer(data);
}

class FakeServer {
    constructor(allData) {
        this.allData = allData;
    }

    getData(request, callback) {
        let {
            // Filtering
            filterModel,

            // Pivoting
            pivotCols,
            pivotMode,

            // Grouping
            groupKeys,
            rowGroupCols,

            // Aggregation
            valueCols,

            // Sorting
            sortModel,
        } = request;

        // Pivot is only active if we have pivot columns and aggregate columns
        const pivotActive = pivotMode && pivotCols.length > 0 && valueCols.length > 0;

        /** Filter data */
        let rowData = this.filterList(this.allData, filterModel);

        /** Pivot data */
        let pivotFields = null;
        if (pivotActive) {
            const pivotResult = this.pivot(pivotCols, rowGroupCols, valueCols, rowData);
            // Pivoted row data
            rowData = pivotResult.data;
            // Aggregate instead by the pivot columns
            valueCols = pivotResult.aggCols;
            // Pivoted columns fields to allow grid to generate pivot result columns
            pivotFields = pivotResult.pivotFields;
        }

        /** Group & Aggregate data */
        if (rowGroupCols.length > 0) {
            // When grouping we only return data for one group per request, so filter the other data out
            rowData = this.filterOutOtherGroups(rowData, groupKeys, rowGroupCols);

            // If this group isn't the bottom level, then group the rows rather than returning them
            const showingGroupLevel = rowGroupCols.length > groupKeys.length;
            if (showingGroupLevel) {
                rowData = this.buildGroupsFromData(rowData, rowGroupCols, groupKeys, valueCols);
            }
        } else if (pivotMode) {
            // When pivoting without groups, aggregate all data into one row
            const rootGroup = this.aggregateList(rowData, valueCols);
            rowData = [rootGroup];
        }

        /** Sort data */
        rowData = this.sortList(rowData, sortModel);

        const lastRow = rowData.length;

        /** Paginate data */
        if (request.startRow != null && request.endRow != null) {
            rowData = rowData.slice(request.startRow, request.endRow);
        }

        // so that the example behaves like a server side call, we put
        // it in a timeout to a) give a delay and b) make it asynchronous
        setTimeout(function () {
            callback(rowData, lastRow, pivotFields);
        }, 1000);
    }

    sortList(data, sortModel) {
        const sortPresent = sortModel && sortModel.length > 0;
        if (!sortPresent) {
            return data;
        }
        // do an in memory sort of the data, across all the fields
        const resultOfSort = data.slice();
        resultOfSort.sort(function (a, b) {
            for (let k = 0; k < sortModel.length; k++) {
                const sortColModel = sortModel[k];
                const valueA = a[sortColModel.colId];
                const valueB = b[sortColModel.colId];
                // this filter didn't find a difference, move onto the next one
                if (valueA == valueB) {
                    continue;
                }
                const sortDirection = sortColModel.sort === 'asc' ? 1 : -1;
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
    }

    filterList(data, filterModel) {
        const filterPresent = filterModel && Object.keys(filterModel).length > 0;
        if (!filterPresent) {
            return data;
        }

        const resultOfFilter = [];
        for (let i = 0; i < data.length; i++) {
            const item = data[i];

            if (filterModel.age) {
                const age = item.age;
                const allowedAge = parseInt(filterModel.age.filter);
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
    }

    // function does pivoting. this is very funky logic, doing pivoting and creating pivot result columns on the fly.
    // if you are using the AG Grid Enterprise Row Model, remember this would all be done on your server side with a
    // database or something that does pivoting for you - this messy code is just for demo purposes on how to use
    // ag-Gird, it's not supposed to be beautiful production quality code.
    pivot(pivotCols, rowGroupCols, valueCols, data) {
        const pivotData = [];
        const aggColsList = [];
        const pivotFields = new Set();
        data.forEach(function (item) {
            const pivotValues = [];
            pivotCols.forEach(function (pivotCol) {
                const pivotField = pivotCol.id;
                const pivotValue = item[pivotField];
                if (pivotValue !== null && pivotValue !== undefined && pivotValue.toString) {
                    pivotValues.push(pivotValue.toString());
                } else {
                    pivotValues.push('-');
                }
            });
            const pivotItem = {};

            valueCols.forEach(function (valueCol) {
                const valField = valueCol.id;

                const pivotKey = pivotValues.join('_');
                const colKey = `${pivotKey}_${valField}`;
                if (!pivotFields.has(colKey)) {
                    pivotFields.add(colKey);
                    // add value col so server can aggregate later
                    aggColsList.push({
                        id: colKey,
                        field: colKey,
                        aggFunc: valueCol.aggFunc,
                    });
                }

                const value = item[valField];
                pivotItem[colKey] = value;
            });

            rowGroupCols.forEach(function (rowGroupCol) {
                const rowGroupField = rowGroupCol.id;
                pivotItem[rowGroupField] = item[rowGroupField];
            });

            pivotData.push(pivotItem);
        });

        return {
            data: pivotData,
            aggCols: aggColsList,
            pivotFields: [...pivotFields],
        };
    }

    buildGroupsFromData(rowData, rowGroupCols, groupKeys, valueCols) {
        const rowGroupCol = rowGroupCols[groupKeys.length];
        const field = rowGroupCol.id;
        const mappedRowData = this.groupBy(rowData, field);

        if (!mappedRowData) {
            return [];
        }

        const groups = [];
        const that = this;
        for (const key in mappedRowData) {
            const thisRowData = mappedRowData[key];
            const groupItem = that.aggregateList(thisRowData, valueCols);
            groupItem[field] = key;
            groups.push(groupItem);
        }
        return groups;
    }

    aggregateList(rowData, valueCols) {
        const result = {};

        for (let i = 0; i < valueCols.length; i++) {
            const col = valueCols[i];
            const field = col.id;

            // the aggregation we do depends on which agg func the user picked
            switch (col.aggFunc) {
                case 'sum':
                    let sum = 0;
                    for (let i = 0; i < rowData.length; i++) {
                        const row = rowData[i];
                        const value = row[field];
                        if (value === undefined) continue;

                        sum += value;
                    }
                    result[field] = sum;
                    break;
                case 'min':
                    let min = null;
                    for (let i = 0; i < rowData.length; i++) {
                        const row = rowData[i];
                        const value = row[field];
                        if (value === undefined) continue;

                        if (min === null || min > value) {
                            min = value;
                        }
                    }
                    result[field] = min;
                    break;
                case 'max':
                    let max = null;
                    for (let i = 0; i < rowData.length; i++) {
                        const row = rowData[i];
                        const value = row[field];
                        if (value === undefined) continue;

                        if (max === null || max < value) {
                            max = value;
                        }
                    }
                    result[field] = max;
                    break;
                case 'random':
                    result[field] = pRandom(); // just make up a number
                    break;
                default:
                    console.warn('unrecognised aggregation function: ' + valueCol.aggFunc);
                    break;
            }
        }

        return result;
    }

    // if user is down some group levels, we take everything else out. eg
    // if user has opened the two groups United States and 2002, we filter
    // out everything that is not equal to United States and 2002.
    filterOutOtherGroups(originalData, groupKeys, rowGroupCols) {
        let filteredData = originalData;
        const that = this;

        // if we are inside a group, then filter out everything that is not
        // part of this group
        groupKeys.forEach(function (groupKey, index) {
            const rowGroupCol = rowGroupCols[index];
            const field = rowGroupCol.id;

            filteredData = that.filter(filteredData, function (item) {
                return item[field] == groupKey;
            });
        });

        return filteredData;
    }

    groupBy(data, field) {
        const result = {};
        data.forEach(function (item) {
            const key = item[field];
            let listForThisKey = result[key];
            if (!listForThisKey) {
                listForThisKey = [];
                result[key] = listForThisKey;
            }
            listForThisKey.push(item);
        });
        return result;
    }

    filter(data, callback) {
        const result = [];
        data.forEach(function (item) {
            if (callback(item)) {
                result.push(item);
            }
        });
        return result;
    }
}

const pRandom = (() => {
    // From https://stackoverflow.com/a/3062783
    let seed = 123_456_789;
    const m = 2 ** 32;
    const a = 1_103_515_245;
    const c = 12_345;

    return () => {
        seed = (a * seed + c) % m;
        return seed / m;
    };
})();
