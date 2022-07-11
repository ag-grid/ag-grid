// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-Side Row Model request.
// To keep things simple it does the bare minimum to support the example.
function FakeServer(allData) {
    alasql.options.cache = false;

    return {
        getData: function(request) {
            var results = executeQuery(request);

            return {
                success: true,
                rows: results,
                lastRow: getLastRowIndex(request, results)
            };
        }
    };

    function executeQuery(request) {
        var sql = buildSql(request);

        console.log('[FakeServer] - about to execute query:', sql);

        return alasql(sql, [allData]);
    }

    function buildSql(request) {
        return 'SELECT * FROM ?' + whereSql(request) + orderBySql(request) + limitSql(request);
    }

    function whereSql(request) {
        var rowGroups = request.rowGroupCols;
        var groupKeys = request.groupKeys;
        var whereParts = [];

        if (groupKeys) {
            groupKeys.forEach(function(key, i) {
                var value = typeof key === 'string' ? "'" + key + "'" : key;

                whereParts.push(rowGroups[i].id + ' = ' + value);
            });
        }

        if (whereParts.length > 0) {
            return ' WHERE ' + whereParts.join(' AND ');
        }

        return '';
    }

    function orderBySql(request) {
        var sortModel = request.sortModel;

        if (sortModel.length === 0) return '';

        var sorts = sortModel.map(function(s) {
            return s.colId + ' ' + s.sort.toUpperCase();
        });

        return ' ORDER BY ' + sorts.join(', ');
    }

    function limitSql(request) {

        if (request.endRow==null || request.startRow==null) { return ''; }

        var blockSize = request.endRow - request.startRow;

        return ' LIMIT ' + (blockSize + 1) + ' OFFSET ' + request.startRow;
    }

    function getLastRowIndex(request, results) {
        if (!results || results.length === 0) { return null; }

        var currentLastRow = request.startRow + results.length;

        return currentLastRow <= request.endRow ? currentLastRow : -1;
    }
}
