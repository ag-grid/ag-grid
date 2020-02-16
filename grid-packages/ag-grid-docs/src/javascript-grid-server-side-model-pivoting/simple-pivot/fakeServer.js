// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-side Row Model request.
// To keep things simple it does the bare minimum to support the example.
function FakeServer(allData) {
    alasql.options.cache = false;

    return {
        getData: function (request) {
            var results = executeQuery(request);
            var rowsForBlock = extractRowsForBlock(request, results);

            return {
                success: true,
                rows: rowsForBlock,
                lastRow: results.length,
                pivotFields: getPivotFields(request)
            };
        }
    };

    function executeQuery(request) {
        var numGroupKeys = request.groupKeys.length;
        var groupToUse = request.rowGroupCols[numGroupKeys];

        var SQL_TEMPLATE = 'SELECT {0}, ({1} + "_{2}") AS {1}, {2} FROM ? PIVOT (SUM([{2}]) FOR {1})' + whereSql(request);
        var SQL = interpolate(SQL_TEMPLATE, [groupToUse.id, request.pivotCols[0].id, request.valueCols[0].id]);

        console.log('[FakeServer] - about to execute query:', SQL);

        return alasql(SQL, [allData]);
    }

    function whereSql(args) {
        var rowGroups = args.rowGroupCols;

        var groupKeys = args.groupKeys;
        var whereClause = '';
        if (groupKeys) {
            for (var i = 0; i < groupKeys.length; i++) {
                whereClause += (i === 0) ? ' WHERE ' : ' AND ';
                whereClause += rowGroups[i].id + ' = ' + groupKeys[i];
            }
        }
        return whereClause;
    }

    function getPivotFields(request) {
        var pivotCol = request.pivotCols[0];
        var valueCol = request.valueCols[0];
        var SQL = interpolate('SELECT DISTINCT ({0} + "_{1}") AS {0} FROM ? ORDER BY {0}', [pivotCol.id, valueCol.id]);
        var res = alasql(SQL, [allData]);
        return res.map(function(r) { return r[pivotCol.id] });
    }

    function extractRowsForBlock(request, results) {
        var blockSize = request.endRow - request.startRow;
        return results.slice(request.startRow, request.startRow + blockSize);
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
