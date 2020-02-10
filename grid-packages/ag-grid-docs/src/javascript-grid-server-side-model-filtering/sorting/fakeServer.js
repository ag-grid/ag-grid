function FakeServer(allData) {

    return {
        getResponse: function(request) {
            var success = true;
            var rowsForBlock = [];
            var lastRowIndex = -1;

            try {
                var SQL = buildSql(request);

                console.log('executing sql:', SQL);

                rowsForBlock = alasql(SQL, [allData]);
                lastRowIndex = getLastRowIndex(request, rowsForBlock);
            }
            catch(err) {
                console.error(err);
                success = false;
            }

            return {
                success: success,
                rows: rowsForBlock,
                lastRow: lastRowIndex
            };
        }
    };

    function buildSql(request) {
        var selectSql = createSelectSql(request);
        var fromSql = ' FROM ?';
        var whereSql = createWhereSql(request);
        var limitSql = createLimitSql(request);

        var orderBySql = createOrderBySql(request);
        var groupBySql = createGroupBySql(request);

        var SQL = selectSql + fromSql + whereSql + groupBySql + orderBySql + limitSql;

        console.log(SQL);

        return SQL;
    }

    function createSelectSql(request) {
        var rowGroupCols = request.rowGroupCols;
        var valueCols = request.valueCols;
        var groupKeys = request.groupKeys;

        if (isDoingGrouping(rowGroupCols, groupKeys)) {
            var colsToSelect = [];

            var rowGroupCol = rowGroupCols[groupKeys.length];
            colsToSelect.push(rowGroupCol.field);

            valueCols.forEach(function (valueCol) {
                colsToSelect.push(valueCol.aggFunc + '(' + valueCol.field + ') as ' + valueCol.field);
            });

            return ' select ' + colsToSelect.join(', ');
        }

        return ' select *';
    }

    function createFilterSql(key, item) {
        switch (item.filterType) {
            case 'text':
                return createTextFilterSql(key, item);
            case 'number':
                return createNumberFilterSql(key, item);
            default:
                console.log('unkonwn filter type: ' + item.filterType);
        }
    }

    function createNumberFilterSql(key, item) {
        switch (item.type) {
            case 'equals':
                return key + ' = ' + item.filter;
            case 'notEqual':
                return key + ' != ' + item.filter;
            case 'greaterThan':
                return key + ' > ' + item.filter;
            case 'greaterThanOrEqual':
                return key + ' >= ' + item.filter;
            case 'lessThan':
                return key + ' < ' + item.filter;
            case 'lessThanOrEqual':
                return key + ' <= ' + item.filter;
            case 'inRange':
                return '(' + key + ' >= ' + item.filter + ' and ' + key + ' <= ' + item.filterTo + ')';
            default:
                console.log('unknown number filter type: ' + item.type);
                return 'true';
        }
    }

    function createTextFilterSql(key, item) {
        switch (item.type) {
            case 'equals':
                return key + ' = "' + item.filter + '"';
            case 'notEqual':
                return key + ' != "' + item.filter + '"';
            case 'contains':
                return key + ' like "%' + item.filter + '%"';
            case 'notContains':
                return key + ' not like "%' + item.filter + '%"';
            case 'startsWith':
                return key + ' like "' + item.filter + '%"';
            case 'endsWith':
                return key + ' like "%' + item.filter + '"';
            default:
                console.log('unknown text filter type: ' + item.type);
                return 'true';
        }
    }

    function createWhereSql(request) {
        var rowGroupCols = request.rowGroupCols;
        var groupKeys = request.groupKeys;
        var filterModel = request.filterModel;
        
        var whereParts = [];

        if (groupKeys.length > 0) {
            groupKeys.forEach(function (key, index) {
                var colName = rowGroupCols[index].field;
                whereParts.push(colName + ' = ' + key)
            });
        }

        if (filterModel) {
            var keySet = Object.keys(filterModel);
            keySet.forEach(function (key) {
                var item = filterModel[key];
                whereParts.push(createFilterSql(key, item));
            });
        }

        if (whereParts.length > 0) {
            return ' where ' + whereParts.join(' and ');
        } else {
            return '';
        }
    }

    function createGroupBySql(request) {
        var rowGroupCols = request.rowGroupCols;
        var groupKeys = request.groupKeys;

        if (isDoingGrouping(rowGroupCols, groupKeys)) {
            var colsToGroupBy = [];

            var rowGroupCol = rowGroupCols[groupKeys.length];
            colsToGroupBy.push(rowGroupCol.field);

            return ' group by ' + colsToGroupBy.join(', ');
        } else {
            // select all columns
            return '';
        }
    }

    function createOrderBySql(request) {
        var rowGroupCols = request.rowGroupCols;
        var groupKeys = request.groupKeys;
        var sortModel = request.sortModel;

        var grouping = isDoingGrouping(rowGroupCols, groupKeys);

        var sortParts = [];
        if (sortModel) {
            var groupColIds = rowGroupCols
                .map(function(groupCol) { groupCol.id })
                .slice(0, groupKeys.length + 1);

            sortModel.forEach(function (item) {
                if (grouping && groupColIds.indexOf(item.colId) < 0) {
                    // ignore
                } else {
                    sortParts.push(item.colId + ' ' + item.sort);
                }
            });
        }

        if (sortParts.length > 0) {
            return ' order by ' + sortParts.join(', ');
        } else {
            return '';
        }
    }

    function isDoingGrouping(rowGroupCols, groupKeys) {
        // we are not doing grouping if at the lowest level. we are at the lowest level
        // if we are grouping by more columns than we have keys for (that means the user
        // has not expanded a lowest level group, OR we are not grouping at all).
        return rowGroupCols.length > groupKeys.length;
    }

    function createLimitSql(request) {
        var startRow = request.startRow;
        var endRow = request.endRow;
        var pageSize = endRow - startRow;
        return ' limit ' + (pageSize + 1) + ' offset ' + startRow;
    }

    function getLastRowIndex(request, results) {
        if (!results || results.length === 0) return null;
        var currentLastRow = request.startRow + results.length;
        return currentLastRow <= request.endRow ? currentLastRow : -1;
    }
}
