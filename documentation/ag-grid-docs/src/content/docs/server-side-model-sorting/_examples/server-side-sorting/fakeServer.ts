// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-Side Row Model request.
// To keep things simple it does the bare minimum to support the example.
// Column names and sort directions are checked against allow-lists of known values.
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
        const sql = buildSql(request);

        console.log('[FakeServer] - about to execute query:', sql);

        return alasql(sql, [allData]);
    }

    function buildSql(request) {
        return 'SELECT * FROM ?' + orderBySql(request) + limitSql(request);
    }

    function column(colId) {
        if (!knownColumns.has(colId)) {
            throw new Error('Unknown column: ' + colId);
        }
        return colId;
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
