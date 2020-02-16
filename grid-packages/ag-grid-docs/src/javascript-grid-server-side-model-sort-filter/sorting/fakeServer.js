// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-side Row Model request.
// To keep things simple it does the bare minimum to support the example.
function FakeServer(allData) {
    alasql.options.cache = false;

    return {
        getData: function (request) {
            var results = executeQuery(request);
            var lastRowIndex = getLastRowIndex(request, results);
            return {
                success: true,
                rows: results,
                lastRow: lastRowIndex,
            };
        }
    };

    function executeQuery(request) {
        var SQL = buildSql(request);

        console.log('[FakeServer] - about to execute query:', SQL);

        return alasql(SQL, [allData]);
    }

    function buildSql(request) {
        var select = 'SELECT * ';
        var from = 'FROM ? ';
        var orderBy = orderBySql(request);
        var limit = limitSql(request);

        return select + from + orderBy + limit;
    }

    function orderBySql(request) {
        var sortModel = request.sortModel;
        if (sortModel.length === 0) {
            return '';
        }

        var sorts = sortModel.map(function(s) {
            return s.colId + ' ' + s.sort;
        });

        return 'ORDER BY ' + sorts.join(', ') + ' ';
    }

    function limitSql(request) {
        var startRow = request.startRow;
        var endRow = request.endRow;
        var blockSize = endRow - startRow;
        return 'LIMIT ' + (blockSize + 1) + ' OFFSET ' + startRow;
    }

    function getLastRowIndex(request, results) {
        if (results === null || results === undefined || results.length === 0) {
            return null;
        }
        const currentLastRow = request.startRow + results.length;
        return currentLastRow <= request.endRow ? currentLastRow : -1;
    }
}
