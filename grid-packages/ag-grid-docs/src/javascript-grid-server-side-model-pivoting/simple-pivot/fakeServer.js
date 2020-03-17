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
        var SQL_TEMPLATE = 'SELECT {0}, ({1} + "_{2}") AS {1}, {2} FROM ? PIVOT (SUM([{2}]) FOR {1})';
        var args = [request.rowGroupCols[0].id, request.pivotCols[0].id, request.valueCols[0].id];
        var SQL = interpolate(SQL_TEMPLATE, args);

        console.log('[FakeServer] - about to execute query:', SQL);

        var result = alasql(SQL, [allData]);

        // workaround - 'alasql' doesn't support PIVOT + LIMIT
        return extractRowsForBlock(request, result);
    }

    function extractRowsForBlock(request, results) {
        var blockSize = request.endRow - request.startRow + 1;
        return results.slice(request.startRow, request.startRow + blockSize);
    }

    function getPivotFields(request) {
        var pivotCol = request.pivotCols[0];
        var valueCol = request.valueCols[0];

        var SQL_TEMPLATE = 'SELECT DISTINCT ({0} + "_{1}") AS {0} FROM ? ORDER BY {0}';
        var SQL = interpolate(SQL_TEMPLATE, [pivotCol.id, valueCol.id]);
        var result = alasql(SQL, [allData]);

        return flatten(result.map(Object.values));
    }

    function getLastRowIndex(request, results) {
        if (!results || results.length === 0) return -1;
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

function flatten(arrayOfArrays) {
    return [].concat.apply([], arrayOfArrays);
}
