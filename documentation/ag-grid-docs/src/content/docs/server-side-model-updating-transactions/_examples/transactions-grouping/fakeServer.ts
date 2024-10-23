import { data } from './data.js';

export function FakeServer() {
    alasql.options.cache = false;

    return {
        getData: function (request) {
            var results = executeQuery(request);

            return {
                success: true,
                rows: results,
            };
        },
    };

    function executeQuery(request) {
        var groupByResult = executeRowGroupQuery(request);

        return groupByResult;
    }

    function executeRowGroupQuery(request) {
        var groupByQuery = buildGroupBySql(request);

        console.log('[FakeServer] - about to execute row group query:', groupByQuery);

        return alasql(groupByQuery, [data]);
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
        var rowGroupCols = request.rowGroupCols;
        var valueCols = request.valueCols;
        var groupKeys = request.groupKeys;

        if (isDoingGrouping(rowGroupCols, groupKeys)) {
            var rowGroupCol = rowGroupCols[groupKeys.length];
            var colsToSelect = [rowGroupCol.id];

            valueCols.forEach(function (valueCol) {
                colsToSelect.push(valueCol.aggFunc + '(' + valueCol.id + ') AS ' + valueCol.id);
            });

            return 'SELECT ' + colsToSelect.join(', ');
        }

        return 'SELECT *';
    }

    function whereSql(request) {
        var rowGroups = request.rowGroupCols;
        var groupKeys = request.groupKeys;
        var whereParts = [];

        if (groupKeys) {
            groupKeys.forEach(function (key, i) {
                var value = typeof key === 'string' ? "'" + key + "'" : key;

                whereParts.push(rowGroups[i].id + ' = ' + value);
            });
        }

        if (whereParts.length > 0) {
            return ' WHERE ' + whereParts.join(' AND ');
        }

        return '';
    }

    function groupBySql(request) {
        var rowGroupCols = request.rowGroupCols;
        var groupKeys = request.groupKeys;

        if (isDoingGrouping(rowGroupCols, groupKeys)) {
            var rowGroupCol = rowGroupCols[groupKeys.length];

            return ' GROUP BY ' + rowGroupCol.id + ' HAVING count(*) > 0';
        }

        return '';
    }

    function orderBySql(request) {
        var sortModel = request.sortModel;

        if (sortModel.length === 0) return '';

        var sorts = sortModel.map(function (s) {
            return s.colId + ' ' + s.sort.toUpperCase();
        });

        return ' ORDER BY ' + sorts.join(', ');
    }

    function limitSql(request) {
        if (request.endRow == undefined || request.startRow == undefined) {
            return '';
        }
        var blockSize = request.endRow - request.startRow;

        return ' LIMIT ' + blockSize + ' OFFSET ' + request.startRow;
    }

    function isDoingGrouping(rowGroupCols, groupKeys) {
        // we are not doing grouping if at the lowest level
        return rowGroupCols.length > groupKeys.length;
    }

    function getLastRowIndex(request, results) {
        if (!results || results.length === 0) {
            return null;
        }
        if (request.endRow == undefined || request.startRow == undefined) {
            return results.length;
        }
        var currentLastRow = request.startRow + results.length;

        return currentLastRow <= request.endRow ? currentLastRow : -1;
    }
}

// IE Workaround - as templates literals are not supported
function interpolate(str, o) {
    return str.replace(/{([^{}]*)}/g, function (a, b) {
        var r = o[b];
        return typeof r === 'string' || typeof r === 'number' ? r : a;
    });
}
