function FakeServer(allData) {

    return {
        getResponse: function (request) {
            var success = true;
            var rowsForBlock = [];
            var lastRowIndex = -1;

            try {
                var SQL = buildSql(request);
                console.log('executing sql:', SQL);

                rowsForBlock = alasql(SQL, [allData]);
                lastRowIndex = getLastRowIndex(request, rowsForBlock);
            } catch (err) {
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
        var groupBySql = createGroupBySql(request);

        return selectSql + fromSql + whereSql + groupBySql + limitSql;
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

    function createWhereSql(request) {
        var whereParts = [];

        var rowGroupCols = request.rowGroupCols;
        var groupKeys = request.groupKeys;
        if (groupKeys.length > 0) {
            groupKeys.forEach(function (key, index) {
                var colName = rowGroupCols[index].field;
                whereParts.push(colName + ' = \"' + key + '\"')
            });
        }

        return (whereParts.length > 0) ? ' where ' + whereParts.join(' and ') : '';
    }

    function createGroupBySql(request) {
        var rowGroupCols = request.rowGroupCols;
        var groupKeys = request.groupKeys;

        if (isDoingGrouping(rowGroupCols, groupKeys)) {
            var colsToGroupBy = [];

            var rowGroupCol = rowGroupCols[groupKeys.length];
            colsToGroupBy.push(rowGroupCol.field);

            return ' group by ' + colsToGroupBy.join(', ');
        }

        // select all columns
        return '';
    }

    function createLimitSql(request) {
        var blockSize = request.endRow - request.startRow;
        return ' limit ' + (blockSize + 1) + ' offset ' + request.startRow;
    }

    function getLastRowIndex(request, results) {
        if (!results || results.length === 0) return null;
        var currentLastRow = request.startRow + results.length;
        return currentLastRow <= request.endRow ? currentLastRow : -1;
    }

    function isDoingGrouping(rowGroupCols, groupKeys) {
        // we are not doing grouping if at the lowest level. we are at the lowest level
        // if we are grouping by more columns than we have keys for (that means the user
        // has not expanded a lowest level group, OR we are not grouping at all).
        return rowGroupCols.length > groupKeys.length;
    }
}
