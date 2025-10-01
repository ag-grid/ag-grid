// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-Side Row Model request.
// To keep things simple it does the bare minimum to support the example.
export function FakeServer(allData) {
    alasql.options.cache = false;

    return {
        getData: function (request) {
            const results = executeQuery(request);

            return {
                success: true,
                rows: results,
                lastRow: getLastRowIndex(request),
            };
        },
    };

    function executeQuery(request) {
        const sql = buildSql(request);

        console.log('[FakeServer] - about to execute query:', sql);

        return alasql(sql, [allData]);
    }

    function buildSql(request) {
        return 'SELECT * FROM ?' + whereSql(request) + orderBySql(request) + limitSql(request);
    }

    function whereSql(request) {
        const whereParts = [];
        const filterModel = request.filterModel;

        if (filterModel) {
            Object.keys(filterModel).forEach(function (key) {
                const item = filterModel[key];

                switch (item.filterType) {
                    case 'text':
                        whereParts.push(createFilterSql(textFilterMapper, key, item));
                        break;
                    case 'number':
                        whereParts.push(createFilterSql(numberFilterMapper, key, item));
                        break;
                    default:
                        console.log('unknown filter type: ' + item.filterType);
                        break;
                }
            });
        }

        if (whereParts.length > 0) {
            return ' WHERE ' + whereParts.join(' AND ');
        }

        return '';
    }

    function createFilterSql(mapper, key, item) {
        if (item.operator) {
            const conditions = item.conditions.map((condition) => mapper(key, condition));

            return '(' + conditions.join(' ' + item.operator + ' ') + ')';
        }

        return mapper(key, item);
    }

    function textFilterMapper(key, item) {
        switch (item.type) {
            case 'equals':
                return key + " = '" + item.filter + "'";
            case 'notEqual':
                return key + " != '" + item.filter + "'";
            case 'contains':
                return key + " LIKE '%" + item.filter + "%'";
            case 'notContains':
                return key + " NOT LIKE '%" + item.filter + "%'";
            case 'startsWith':
                return key + " LIKE '" + item.filter + "%'";
            case 'endsWith':
                return key + " LIKE '%" + item.filter + "'";
            case 'blank':
                return key + ' IS NULL or ' + key + " = ''";
            case 'notBlank':
                return key + ' IS NOT NULL and ' + key + " != ''";
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
            case 'blank':
                return key + ' IS NULL';
            case 'notBlank':
                return key + ' IS NOT NULL';
            default:
                console.log('unknown number filter type: ' + item.type);
        }
    }

    function orderBySql(request) {
        const sortModel = request.sortModel;

        if (sortModel.length === 0) return '';

        const sorts = sortModel.map(function (s) {
            return s.colId + ' ' + s.sort.toUpperCase();
        });

        return ' ORDER BY ' + sorts.join(', ');
    }

    function limitSql(request) {
        if (request.endRow == undefined || request.startRow == undefined) {
            return '';
        }
        const blockSize = request.endRow - request.startRow;

        return ' LIMIT ' + blockSize + ' OFFSET ' + request.startRow;
    }

    function getLastRowIndex(request) {
        return executeQuery({ ...request, startRow: undefined, endRow: undefined }).length;
    }
}
