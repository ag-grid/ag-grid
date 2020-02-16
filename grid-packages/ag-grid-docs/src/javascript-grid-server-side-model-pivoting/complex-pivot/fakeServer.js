// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-side Row Model request.
// To keep things simple it does the bare minimum to support the example.
function FakeServer(allData) {
    alasql.options.cache = false;

    return {
        getResponse: function (request) {
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
        var pivotCols = request.pivotCols;
        var pivotCol = pivotCols[0];

        // 'alasql' only supports pivoting on a single value column, to workaround this limitation we need to perform
        // separate queries for each value column and combine the results
        var results = [];
        request.valueCols.forEach(function (valueCol) {
            var pivotRes = doPivot(request, pivotCol, valueCol);

            // merge each row into existing results
            for (var i = 0; i < pivotRes.length; i++) {
                var existing = results[i] ? results[i] : {};
                results[i] = Object.assign(existing, pivotRes[i]);
            }
        });

        return results;
    }

    function getPivotFields(request) {
        // we only support
        var pivotCol = request.pivotCols[0];

        var resultMap = {};

        // 'alasql' only supports pivoting on a single value column, to workaround this limitation we need to perform
        // separate queries for each value column and combine the results
        request.valueCols.forEach(function (valueCol) {
            var SQL_TEMPLATE = 'SELECT ({0} + "_{1}") AS {0}, {1} FROM ? PIVOT (SUM([{1}]) FOR {0})';
            var SQL = interpolate(SQL_TEMPLATE, [pivotCol.id, valueCol.id]);
            var pivotRes = alasql(SQL, [allData]);

            pivotRes.forEach(function(res) {
                resultMap = Object.assign(resultMap, res);
            });
        });

        // just return pivot fields, i.e. object keys
        return Object.keys(resultMap);
    }

    function doPivot(request, pivotCol, valueCol) {
        var groupKeys = request.groupKeys;
        var groupsToUse = request.rowGroupCols.slice(groupKeys.length, groupKeys.length + 1);
        var selectGroupCols = groupsToUse.map(function(groupCol){ return groupCol.id }).join(", ");

        var SQL_TEMPLATE = 'SELECT {0}, ({1} + "_{2}") AS {1}, {2} FROM ? PIVOT (SUM([{2}]) FOR {1})' + whereSql(request);
        var SQL = interpolate(SQL_TEMPLATE, [selectGroupCols, pivotCol.id, valueCol.id]);

        console.log('FakeServer - SQL:', SQL);

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

    function orderBySql(args) {
        var sorting = args.sortModel.length > 0;
        if (sorting) {
            var sorts = args.sortModel.map(function(s){
                return '[' + s.colId + '] ' + s.sort;
            });

            return ' ORDER BY ' + sorts.join(', ');
        }
        return '';
    }

    function extractRowsForBlock(request, results) {
        var blockSize = request.endRow - request.startRow;
        return results.slice(request.startRow, request.startRow + blockSize);
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
