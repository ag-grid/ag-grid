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
                lastRow: result.length,
            };
        },
        getCountries: function() {
            var SQL = 'SELECT DISTINCT country FROM ? ORDER BY country asc';
            var res = alasql(SQL, [allData]);
            return res.map(function(r) { return r.country });
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
        var where = whereSql(request);
        var orderBy = orderBySql(request);
        var limit = limitSql(request);

        return select + from + where + orderBy + limit;
    }

    function whereSql(request) {
        var whereParts = [];

        var filterModel = request.filterModel;
        if (filterModel) {
            var columnKeys = Object.keys(filterModel);
            whereParts = columnKeys.map(function (columnKey) {
                var filter = filterModel[columnKey];
                if (filter.filterType === 'set') {
                    return columnKey + ' IN (\'' + filter.values.join("', '") + '\')';
                }
                console.log('unsupported filter type: ' + filter.filterType);
                return '';
            });
        }

        if (whereParts.length > 0) {
            return ' WHERE ' + whereParts.join(' AND ') + ' ';
        }

        return '';
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
}
