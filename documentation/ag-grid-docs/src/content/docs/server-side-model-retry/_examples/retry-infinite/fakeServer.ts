// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-Side Row Model request.
// To keep things simple it does the bare minimum to support the example.
// Request values are bound as `?` parameters, and column names, sort directions and
// aggregation functions are checked against allow-lists of known values.
export function FakeServer(allData) {
    alasql.options.cache = false;

    const knownColumns = new Set(Object.keys(allData[0] ?? {}));
    const aggFuncs = new Set(['sum', 'min', 'max', 'avg', 'count']);

    return {
        getData: function (request) {
            const failLoad = document.querySelector('#failLoad').checked === true;
            if (failLoad) {
                return {
                    success: false,
                };
            }

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
        return (
            selectSql(request) +
            ' FROM ?' +
            whereSql(request, params) +
            groupBySql(request) +
            orderBySql(request) +
            limitSql(request)
        );
    }

    function column(colId) {
        if (!knownColumns.has(colId)) {
            throw new Error('Unknown column: ' + colId);
        }
        return colId;
    }

    function aggFunc(name) {
        if (!aggFuncs.has(name)) {
            throw new Error('Unsupported aggregation: ' + name);
        }
        return name;
    }

    function selectSql(request) {
        const rowGroupCols = request.rowGroupCols;
        const valueCols = request.valueCols;
        const groupKeys = request.groupKeys;

        if (isDoingGrouping(rowGroupCols, groupKeys)) {
            const rowGroupCol = rowGroupCols[groupKeys.length];
            const colsToSelect = [column(rowGroupCol.id)];

            valueCols.forEach(function (valueCol) {
                const id = column(valueCol.id);
                colsToSelect.push(aggFunc(valueCol.aggFunc) + '(' + id + ') AS ' + id);
            });

            return 'SELECT ' + colsToSelect.join(', ');
        }

        return 'SELECT *';
    }

    function whereSql(request, params) {
        const rowGroups = request.rowGroupCols;
        const groupKeys = request.groupKeys;
        const whereParts = [];

        if (groupKeys) {
            groupKeys.forEach(function (key, i) {
                whereParts.push(column(rowGroups[i].id) + ' = ?');
                params.push(key);
            });
        }

        if (whereParts.length > 0) {
            return ' WHERE ' + whereParts.join(' AND ');
        }

        return '';
    }

    function groupBySql(request) {
        const rowGroupCols = request.rowGroupCols;
        const groupKeys = request.groupKeys;

        if (isDoingGrouping(rowGroupCols, groupKeys)) {
            const rowGroupCol = rowGroupCols[groupKeys.length];

            return ' GROUP BY ' + column(rowGroupCol.id) + ' HAVING count(*) > 0';
        }

        return '';
    }

    function orderBySql(request) {
        const sortModel = request.sortModel;

        if (sortModel.length === 0) return '';

        // sorting on a column the data doesn't hold (e.g. the auto group column) has no effect
        const sorts = sortModel
            .filter(function (s) {
                return knownColumns.has(s.colId);
            })
            .map(function (s) {
                return column(s.colId) + (s.sort === 'desc' ? ' DESC' : ' ASC');
            });

        if (sorts.length === 0) return '';

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

    function isDoingGrouping(rowGroupCols, groupKeys) {
        // we are not doing grouping if at the lowest level
        return rowGroupCols.length > groupKeys.length;
    }

    function getLastRowIndex(request) {
        return executeQuery({ ...request, startRow: undefined, endRow: undefined }).length;
    }
}
