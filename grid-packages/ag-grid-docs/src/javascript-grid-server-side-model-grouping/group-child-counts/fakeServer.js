// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-side Row Model request.
// To keep things simple it does the bare minimum to support the example.
function FakeServer(allData) {
    alasql.options.cache = false;

    return {
        getData: function (request) {
            var results = executeQuery(request);
            return {
                success: true,
                rows: results,
                lastRow: getLastRowIndex(request, results)
            };
        }
    };

    function executeQuery(request) {
        var groupByQuery = buildGroupBySql(request);
        console.log('[FakeServer] - about to execute row group query:', groupByQuery);
        var groupByResults = alasql(groupByQuery, [allData]);

        var rowGroupCols = request.rowGroupCols;
        var groupKeys = request.groupKeys;

        if (!isDoingGrouping(rowGroupCols, groupKeys)) return groupByResults;

        var groupsToUse = request.rowGroupCols.slice(groupKeys.length, groupKeys.length + 1);
        var groupColId = groupsToUse[0].id;

        var SQL = interpolate('SELECT {0} FROM ? pivot (count({0}) for {0})' + whereSql(request), [groupColId]);
        console.log('[FakeServer] - about to execute group child count query:', SQL);

        // add 'childCount' to group results
        var childCountResults = alasql(SQL, [allData])[0];
        return groupByResults.map(function(groupByRes) {
            groupByRes['childCount'] = childCountResults[groupByRes[groupColId]];
            return groupByRes;
        });
    }

    function buildGroupBySql(request) {
        var select= selectSql(request);
        var from = ' FROM ?';
        var where = whereSql(request);
        var groupBy = createGroupBySql(request);
        var orderBy = orderBySql(request);
        var limit = limitSql(request);

        return select + from + where + groupBy + orderBy + limit;
    }

    function selectSql(request) {
        var rowGroupCols = request.rowGroupCols;
        var valueCols = request.valueCols;
        var groupKeys = request.groupKeys;

        if (isDoingGrouping(rowGroupCols, groupKeys)) {
            var colsToSelect = [];
            var rowGroupCol = rowGroupCols[groupKeys.length];
            colsToSelect.push(rowGroupCol.field);

            valueCols.forEach(function (valueCol) {
                colsToSelect.push(valueCol.aggFunc + '(' + valueCol.field + ') AS ' + valueCol.field);
            });

            return ' SELECT ' + colsToSelect.join(', ');
        }

        return ' SELECT *';
    }

    function whereSql(request) {
        var rowGroups = request.rowGroupCols;
        var groupKeys = request.groupKeys;

        var whereClause = '';
        if (groupKeys) {
            for (var i = 0; i < groupKeys.length; i++) {
                whereClause += (i === 0) ? ' WHERE ' : ' AND ';
                whereClause += rowGroups[i].id + ' = "' + groupKeys[i] + '"';
            }
        }
        return whereClause;
    }

    function createGroupBySql(request) {
        var rowGroupCols = request.rowGroupCols;
        var groupKeys = request.groupKeys;

        if (isDoingGrouping(rowGroupCols, groupKeys)) {
            var colsToGroupBy = [];

            var rowGroupCol = rowGroupCols[groupKeys.length];
            colsToGroupBy.push(rowGroupCol.field);

            return ' GROUP BY ' + colsToGroupBy.join(', ');
        }

        return '';
    }

    function orderBySql(request) {
        var sortModel = request.sortModel;
        if (sortModel.length === 0) return '';

        var sorts = sortModel.map(function(s) {
            return s.colId + ' ' + s.sort;
        });

        return ' ORDER BY ' + sorts.join(', ') + ' ';
    }

    function limitSql(request) {
        var blockSize = request.endRow - request.startRow;
        return ' LIMIT ' + (blockSize + 1) + ' OFFSET ' + request.startRow;
    }

    function isDoingGrouping(rowGroupCols, groupKeys) {
        // we are not doing grouping if at the lowest level
        return rowGroupCols.length > groupKeys.length;
    }

    function getLastRowIndex(request, results) {
        if (!results || results.length === 0) return null;
        var currentLastRow = request.startRow + results.length;
        return currentLastRow <= request.endRow ? currentLastRow : -1;
    }
}


// IE Workaround - as templates literals are not supported
function interpolate(str, o) {
    return str.replace(/{([^{}]*)}/g,
        function (a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        }
    );
}