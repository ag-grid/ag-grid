// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-side Row Model request.
// To keep things simple it does the bare minimum to support the example.
function FakeServer(allData) {
    alasql.options.cache = false;

    return {
        getData: function (request) {
            var result = executeQuery(request);
            return {
                success: true,
                rows: result,
                lastRow: getLastRowIndex(request, result),
                pivotFields: getPivotFields(request)
            };
        }
    };

    function executeQuery(request) {
        var pivotCols = request.pivotCols;
        var pivotCol = pivotCols[0]; // 'alasql' can only pivot on a single column

        // 'alasql' only supports pivoting on a single value column, to workaround this limitation we need to perform
        // separate queries for each value column and combine the results
        var results = [];
        request.valueCols.forEach(function (valueCol) {
            var pivotResult = executePivotQuery(request, pivotCol, valueCol);

            // merge each row into existing results
            for (var i = 0; i < pivotResult.length; i++) {
                var existing = results[i] ? results[i] : {};
                results[i] = Object.assign(existing, pivotResult[i]);
            }
        });

        return results;
    }

    function executePivotQuery(request, pivotCol, valueCol) {
        var groupKeys = request.groupKeys;
        var groupsToUse = request.rowGroupCols.slice(groupKeys.length, groupKeys.length + 1);
        var selectGroupCols = groupsToUse.map(function(groupCol){ return groupCol.id }).join(", ");

        var SQL_TEMPLATE = 'SELECT {0}, ({1} + "_{2}") AS {1}, {2} FROM ? PIVOT (SUM([{2}]) FOR {1})';
        var SQL = interpolate(SQL_TEMPLATE, [selectGroupCols, pivotCol.id, valueCol.id]) + whereSql(request);

        console.log('[FakeServer] - about to execute query:', SQL);

        var result = alasql(SQL, [allData]);

        // workaround - 'alasql' doesn't support PIVOT + LIMIT
        return extractRowsForBlock(request, result);
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

    function extractRowsForBlock(request, results) {
        var blockSize = request.endRow - request.startRow + 1;
        return results.slice(request.startRow, request.startRow + blockSize);
    }

    function getPivotFields(request) {
        var pivotCol = request.pivotCols[0];

        var result = flatten(request.valueCols.map(function (valueCol) {
            var SQL_TEMPLATE = 'SELECT DISTINCT ({0} + "_{1}") AS {0} FROM ? ORDER BY {0}';
            var args = [pivotCol.id, valueCol.id];
            var SQL = interpolate(SQL_TEMPLATE, args);
            return alasql(SQL, [allData]);
        }));

        return flatten(result.map(Object.values));
    }

    function getLastRowIndex(request, results) {
        if (!results || results.length === 0) {
            return -1;
        }
        var currentLastRow = request.startRow + results.length;
        return currentLastRow <= request.endRow ? currentLastRow : -1;
    }
}

// IE Workaround - as templates literal are not supported
function interpolate(str, o) {
    return str.replace(/{([^{}]*)}/g,
        function (a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        }
    );
}

function flatten(arrayOfArrays) {
    return [].concat.apply([], arrayOfArrays);
}
