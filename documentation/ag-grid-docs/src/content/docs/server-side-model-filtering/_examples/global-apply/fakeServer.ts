// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-Side Row Model request.
// To keep things simple it does the bare minimum to support the example.
// Request values are bound as `?` parameters, and column names and sort directions are
// checked against allow-lists of known values.
export function FakeServer(allData) {
    alasql.options.cache = false;

    const knownColumns = new Set(Object.keys(allData[0] ?? {}));

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
        const params = [allData];
        const sql = buildSql(request, params);

        console.log('[FakeServer] - about to execute query:', sql, params.slice(1));

        return alasql(sql, params);
    }

    function buildSql(request, params) {
        return 'SELECT * FROM ?' + whereSql(request, params) + orderBySql(request) + limitSql(request);
    }

    function column(colId) {
        if (!knownColumns.has(colId)) {
            throw new Error('Unknown column: ' + colId);
        }
        return colId;
    }

    function whereSql(request, params) {
        const whereParts = [];
        const filterModel = request.filterModel;

        if (filterModel) {
            Object.keys(filterModel).forEach(function (key) {
                const item = filterModel[key];

                switch (item.filterType) {
                    case 'text':
                        whereParts.push(createFilterSql(textFilterMapper, column(key), item, params));
                        break;
                    case 'number':
                        whereParts.push(createFilterSql(numberFilterMapper, column(key), item, params));
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

    function createFilterSql(mapper, key, item, params) {
        if (item.operator) {
            const conditions = item.conditions.map((condition) => mapper(key, condition, params));

            return '(' + conditions.join(item.operator === 'OR' ? ' OR ' : ' AND ') + ')';
        }

        return mapper(key, item, params);
    }

    function textFilterMapper(key, item, params) {
        switch (item.type) {
            case 'equals':
                params.push(String(item.filter));
                return key + ' = ?';
            case 'notEqual':
                params.push(String(item.filter));
                return key + ' != ?';
            case 'contains':
                params.push('%' + item.filter + '%');
                return key + ' LIKE ?';
            case 'notContains':
                params.push('%' + item.filter + '%');
                return key + ' NOT LIKE ?';
            case 'startsWith':
                params.push(item.filter + '%');
                return key + ' LIKE ?';
            case 'endsWith':
                params.push('%' + item.filter);
                return key + ' LIKE ?';
            case 'blank':
                return key + ' IS NULL or ' + key + " = ''";
            case 'notBlank':
                return key + ' IS NOT NULL and ' + key + " != ''";
            default:
                console.log('unknown text filter type: ' + item.type);
        }
    }

    function numberFilterMapper(key, item, params) {
        switch (item.type) {
            case 'equals':
                params.push(item.filter);
                return key + ' = ?';
            case 'notEqual':
                params.push(item.filter);
                return key + ' != ?';
            case 'greaterThan':
                params.push(item.filter);
                return key + ' > ?';
            case 'greaterThanOrEqual':
                params.push(item.filter);
                return key + ' >= ?';
            case 'lessThan':
                params.push(item.filter);
                return key + ' < ?';
            case 'lessThanOrEqual':
                params.push(item.filter);
                return key + ' <= ?';
            case 'inRange':
                params.push(item.filter, item.filterTo);
                return '(' + key + ' >= ? and ' + key + ' <= ?)';
            case 'blank':
                return key + ' IS NULL';
            case 'notBlank':
                return key + ' IS NOT NULL';
            default:
                console.log('unknown number filter type: ' + item.type);
        }
    }

    function orderBySql(request) {
        // sorts on columns that aren't in the data (e.g. the auto group column) are ignored
        const sortModel = request.sortModel.filter(function (s) {
            return knownColumns.has(s.colId);
        });

        if (sortModel.length === 0) return '';

        const sorts = sortModel.map(function (s) {
            return column(s.colId) + (s.sort === 'desc' ? ' DESC' : ' ASC');
        });

        return ' ORDER BY ' + sorts.join(', ');
    }

    function limitSql(request) {
        if (request.endRow == undefined || request.startRow == undefined) {
            return '';
        }
        // AlaSQL doesn't accept bound parameters here, so only ever write whole numbers
        const startRow = Math.max(0, Math.floor(Number(request.startRow)) || 0);
        const blockSize = Math.max(0, Math.floor(Number(request.endRow)) - startRow || 0);

        return ' LIMIT ' + blockSize + ' OFFSET ' + startRow;
    }

    function getLastRowIndex(request) {
        return executeQuery({ ...request, startRow: undefined, endRow: undefined }).length;
    }
}
