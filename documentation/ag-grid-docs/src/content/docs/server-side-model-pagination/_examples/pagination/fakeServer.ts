// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-Side Row Model request.
// To keep things simple it does the bare minimum to support the example.
// Request values are bound as `?` parameters, and column names and sort directions are
// checked against allow-lists of known values.
import type { FilterModel, IServerSideGetRowsRequest } from 'ag-grid-community';

export function FakeServer(allData: any[]) {
    alasql.options.cache = false;

    const knownColumns = new Set(Object.keys(allData[0] ?? {}));

    return {
        getData: function (request: IServerSideGetRowsRequest) {
            const results = executeQuery(request);

            return {
                success: true,
                rows: results,
                lastRow: getLastRowIndex(request),
            };
        },
        getCountries: function () {
            const SQL = 'SELECT DISTINCT country FROM ? ORDER BY country ASC';

            return alasql(SQL, [allData]).map(function (x: any) {
                return x.country;
            });
        },
    };

    function executeQuery(request: IServerSideGetRowsRequest) {
        const params: unknown[] = [allData];
        const sql = buildSql(request, params);

        console.log('[FakeServer] - about to execute query:', sql, params.slice(1));

        return alasql(sql, params);
    }

    function buildSql(request: IServerSideGetRowsRequest, params: unknown[]) {
        return 'SELECT * FROM ?' + whereSql(request, params) + orderBySql(request) + limitSql(request);
    }

    function column(colId: string) {
        if (!knownColumns.has(colId)) {
            throw new Error('Unknown column: ' + colId);
        }
        return colId;
    }

    function whereSql(request: IServerSideGetRowsRequest, params: unknown[]) {
        const whereParts: string[] = [];
        const filterModel = request.filterModel as FilterModel | null;

        if (filterModel) {
            Object.keys(filterModel).forEach(function (columnKey) {
                const filter = filterModel[columnKey];

                if (filter.filterType === 'set') {
                    whereParts.push(column(columnKey) + ' IN (' + filter.values.map(() => '?').join(', ') + ')');
                    // blanks arrive as `null`; bind '' instead, as AlaSQL never matches null in an IN list
                    params.push(...filter.values.map((value: string | null) => value ?? ''));
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

    function orderBySql(request: IServerSideGetRowsRequest) {
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

    function limitSql(request: IServerSideGetRowsRequest) {
        if (request.endRow == undefined || request.startRow == undefined) {
            return '';
        }
        // AlaSQL doesn't accept bound parameters here, so only ever write whole numbers
        const startRow = Math.max(0, Math.floor(Number(request.startRow)) || 0);
        const blockSize = Math.max(0, Math.floor(Number(request.endRow)) - startRow || 0);

        return ' LIMIT ' + blockSize + ' OFFSET ' + startRow;
    }

    function getLastRowIndex(request: IServerSideGetRowsRequest) {
        return executeQuery({ ...request, startRow: undefined, endRow: undefined }).length;
    }
}
