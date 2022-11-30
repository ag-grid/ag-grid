// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-Side Row Model request.
// To keep things simple it does the bare minimum to support the example.
function FakeServer(allData) {
    alasql.options.cache = false;

    return {
        getData: function(request) {
            var results = executeQuery(request);
            results.forEach((row) => {
                row.country = {
                    code: row.countryCode,
                    name: row.countryName
                };
                delete row.countryCode;
                delete row.countryName;
            });

            return {
                success: true,
                rows: results,
                lastRow: getLastRowIndex(request, results),
            };
        },
        getCountries: function() {
            var sql = 'SELECT DISTINCT countryCode, countryName FROM ? ORDER BY countryName ASC';

            return alasql(sql, [allData]).map((row) => ({
                code: row.countryCode,
                name: row.countryName
            }));
        },
        getSports: function(countries) {
            console.log('Returning sports for ' + (countries ? countries.join(', ') : 'all countries'));

            var where = countries ? " WHERE countryCode IN ('" + countries.join("', '") + "')" : '';
            var sql = 'SELECT DISTINCT sport FROM ? ' + where + ' ORDER BY sport ASC';

            return alasql(sql, [allData]).map(function(x) { return x.sport; });
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

    function mapColumnKey(columnKey) {
        return columnKey === 'country' ? 'countryCode' : columnKey;
    }

    function whereSql(request) {
        var whereParts = [];
        var filterModel = request.filterModel;

        if (filterModel) {
            Object.keys(filterModel).forEach(function(columnKey) {
                var filter = filterModel[columnKey];

                if (filter.filterType === 'set') {
                    whereParts.push(mapColumnKey(columnKey) + ' IN (\'' + filter.values.join("', '") + '\')');
                    return;
                }

                console.log('unsupported filter type: ' + filter.filterType);
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
            return mapColumnKey(s.colId) + ' ' + s.sort.toUpperCase();
        });

        return ' ORDER BY ' + sorts.join(', ');
    }

    function limitSql(request) {
        if (request.endRow == undefined || request.startRow == undefined) { return ''; }
        var blockSize = request.endRow - request.startRow;

        return ' LIMIT ' + (blockSize + 1) + ' OFFSET ' + request.startRow;
    }

    function getLastRowIndex(request, results) {
        if (!results || results.length === 0) {
            return request.startRow;
        }
        if (request.endRow == undefined || request.startRow == undefined) { return results.length; }

        var currentLastRow = request.startRow + results.length;

        return currentLastRow <= request.endRow ? currentLastRow : -1;
    }
}
