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
            var keySet = Object.keys(filterModel);
            keySet.forEach(function (key) {
                var item = filterModel[key];
                whereParts.push(filterSql(key, item));
            });
        }

        if (whereParts.length > 0) {
            return ' WHERE ' + whereParts.join(' AND ') + ' ';
        }

        return '';
    }

    function filterSql(key, item) {
        switch (item.filterType) {
            case 'text':
                return createFilterSql(textFilterMapper, key, item);
            case 'number':
                return createFilterSql(numberFilterMapper, key, item);
            case 'set':
                return key + ' IN (\'' + item.values.join("', '") + '\')';
            default:
                console.log('unknown filter type: ' + item.filterType);
        }
    }

    function createFilterSql(mapper, key, item) {
        if (item.operator) {
            var condition1 = mapper(key, item.condition1);
            var condition2 = mapper(key, item.condition2);
            return '(' + condition1 + ' ' + item.operator + ' ' + condition2 + ')';
        }
        return mapper(key, item);
    }

    function textFilterMapper(key, item) {
        switch (item.type) {
            case 'equals':
                return key + ' = "' + item.filter + '"';
            case 'notEqual':
                return key + ' != "' + item.filter + '"';
            case 'contains':
                return key + ' like "%' + item.filter + '%"';
            case 'notContains':
                return key + ' not like "%' + item.filter + '%"';
            case 'startsWith':
                return key + ' like "' + item.filter + '%"';
            case 'endsWith':
                return key + ' like "%' + item.filter + '"';
            default:
                console.log('unknown text filter type: ' + item.type);
        }
    }

    function numberFilterMapper(key, item) {
        switch (item.type) {
            case 'equals':
                return key + ' = ' + item.filter;
            case 'notEqual':
                return key + ' != ' + item.filter;
            case 'greaterThan':
                return key + ' > ' + item.filter;
            case 'greaterThanOrEqual':
                return key + ' >= ' + item.filter;
            case 'lessThan':
                return key + ' < ' + item.filter;
            case 'lessThanOrEqual':
                return key + ' <= ' + item.filter;
            case 'inRange':
                return '(' + key + ' >= ' + item.filter + ' and ' + key + ' <= ' + item.filterTo + ')';
            default:
                console.log('unknown number filter type: ' + item.type);
        }
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
