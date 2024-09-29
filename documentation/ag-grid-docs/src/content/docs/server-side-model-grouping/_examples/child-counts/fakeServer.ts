// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-Side Row Model request.
// To keep things simple it does the bare minimum to support the example.
export function FakeServer(allData) {
    alasql.options.cache = false;

    return {
        getData: function (request) {
            const results = executeQuery(request);

            return {
                success: true,
                rows: results,
                lastRow: getLastRowIndex(request),
            };
        },
    };

    function executeQuery(request) {
        const groupByResult = executeRowGroupQuery(request);
        const rowGroupCols = request.rowGroupCols;
        const groupKeys = request.groupKeys;

        if (!isDoingGrouping(rowGroupCols, groupKeys)) {
            return groupByResult;
        }

        const groupsToUse = request.rowGroupCols.slice(groupKeys.length, groupKeys.length + 1);
        const groupColId = groupsToUse[0].id;
        const childCountResult = executeGroupChildCountsQuery(request, groupColId);

        // add 'childCount' to group results
        return groupByResult.map(function (group) {
            group['childCount'] = childCountResult[group[groupColId]];
            return group;
        });
    }

    function executeRowGroupQuery(request) {
        const groupByQuery = buildGroupBySql(request);

        console.log('[FakeServer] - about to execute row group query:', groupByQuery);

        return alasql(groupByQuery, [allData]);
    }

    function executeGroupChildCountsQuery(request, groupId) {
        const SQL = interpolate('SELECT {0} FROM ? pivot (count({0}) for {0})' + whereSql(request), [groupId]);

        console.log('[FakeServer] - about to execute group child count query:', SQL);

        return alasql(SQL, [allData])[0];
    }

    function buildGroupBySql(request) {
        return (
            selectSql(request) +
            ' FROM ?' +
            whereSql(request) +
            groupBySql(request) +
            orderBySql(request) +
            limitSql(request)
        );
    }

    function selectSql(request) {
        const rowGroupCols = request.rowGroupCols;
        const valueCols = request.valueCols;
        const groupKeys = request.groupKeys;

        if (isDoingGrouping(rowGroupCols, groupKeys)) {
            const rowGroupCol = rowGroupCols[groupKeys.length];
            const colsToSelect = [rowGroupCol.id];

            valueCols.forEach(function (valueCol) {
                colsToSelect.push(valueCol.aggFunc + '(' + valueCol.id + ') AS ' + valueCol.id);
            });

            return 'SELECT ' + colsToSelect.join(', ');
        }

        return 'SELECT *';
    }

    function whereSql(request) {
        const rowGroups = request.rowGroupCols;
        const groupKeys = request.groupKeys;
        const whereParts = [];

        if (groupKeys) {
            groupKeys.forEach(function (key, i) {
                const value = typeof key === 'string' ? "'" + key + "'" : key;

                whereParts.push(rowGroups[i].id + ' = ' + value);
            });
        }

        if (whereParts.length > 0) {
            return ' WHERE ' + whereParts.join(' AND ');
        }

        return '';
    }

    function groupBySql(request) {
        const rowGroupCols = request.rowGroupCols;
        const groupKeys = request.groupKeys;

        if (isDoingGrouping(rowGroupCols, groupKeys)) {
            const rowGroupCol = rowGroupCols[groupKeys.length];

            return ' GROUP BY ' + rowGroupCol.id + ' HAVING count(*) > 0';
        }

        return '';
    }

    function orderBySql(request) {
        const sortModel = request.sortModel;

        if (sortModel.length === 0) return '';

        const sorts = sortModel.map(function (s) {
            return s.colId + ' ' + s.sort.toUpperCase();
        });

        return ' ORDER BY ' + sorts.join(', ');
    }

    function limitSql(request) {
        if (request.endRow == undefined || request.startRow == undefined) {
            return '';
        }
        const blockSize = request.endRow - request.startRow;

        return ' LIMIT ' + blockSize + ' OFFSET ' + request.startRow;
    }

    function isDoingGrouping(rowGroupCols, groupKeys) {
        // we are not doing grouping if at the lowest level
        return rowGroupCols.length > groupKeys.length;
    }

    function getLastRowIndex(request) {
        return executeQuery({ ...request, startRow: undefined, endRow: undefined }).length;
    }
}

// IE Workaround - as templates literals are not supported
function interpolate(str, o) {
    return str.replace(/{([^{}]*)}/g, function (a, b) {
        const r = o[b];
        return typeof r === 'string' || typeof r === 'number' ? r : a;
    });
}
