// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-Side Row Model request.
// To keep things simple it does the bare minimum to support the example.
// Request values are bound as `?` parameters, and column names, sort directions and
// aggregation functions are checked against allow-lists of known values.
import { checkColumn, limitSql } from '@example-fake-servers/sql';

import type { ColumnVO, IServerSideGetRowsRequest } from 'ag-grid-community';

export function FakeServer(allData: any[]) {
    alasql.options.cache = false;

    const knownColumns = new Set(Object.keys(allData[0] ?? {}));
    const aggFuncs = new Set(['sum', 'min', 'max', 'avg', 'count']);

    return {
        getData: function (request: IServerSideGetRowsRequest) {
            const results = executeQuery(request);

            return {
                success: true,
                rows: results,
                lastRow: getLastRowIndex(request),
            };
        },
    };

    function executeQuery(request: IServerSideGetRowsRequest) {
        const params: unknown[] = [allData];
        const sql = buildSql(request, params);

        console.log('[FakeServer] - about to execute query:', sql, params.slice(1));

        return alasql(sql, params);
    }

    function buildSql(request: IServerSideGetRowsRequest, params: unknown[]) {
        return (
            selectSql(request) +
            ' FROM ?' +
            whereSql(request, params) +
            groupBySql(request) +
            orderBySql(request) +
            limitSql(request)
        );
    }

    function column(colId: string) {
        return checkColumn(knownColumns, colId);
    }

    function aggFunc(name?: string) {
        if (!name || !aggFuncs.has(name)) {
            throw new Error('Unsupported aggregation: ' + name);
        }
        return name;
    }

    function selectSql(request: IServerSideGetRowsRequest) {
        const rowGroupCols = request.rowGroupCols;
        const valueCols = request.valueCols;
        const groupKeys = request.groupKeys;

        if (isDoingGrouping(rowGroupCols, groupKeys)) {
            const rowGroupCol = rowGroupCols[groupKeys.length];
            const colsToSelect = [column(rowGroupCol.id)];

            valueCols.forEach(function (valueCol) {
                colsToSelect.push(
                    aggFunc(valueCol.aggFunc) +
                        '(' +
                        column(valueCol.id) +
                        ') AS ' +
                        aggregateName(request, valueCol.id)
                );
            });

            return 'SELECT ' + colsToSelect.join(', ');
        }

        return 'SELECT *';
    }

    function whereSql(request: IServerSideGetRowsRequest, params: unknown[]) {
        const rowGroups = request.rowGroupCols;
        const groupKeys = request.groupKeys;
        const whereParts: string[] = [];

        groupKeys.forEach(function (key, i) {
            whereParts.push(column(rowGroups[i].id) + ' = ?');
            params.push(key);
        });

        if (whereParts.length > 0) {
            return ' WHERE ' + whereParts.join(' AND ');
        }

        return '';
    }

    function groupBySql(request: IServerSideGetRowsRequest) {
        const rowGroupCols = request.rowGroupCols;
        const groupKeys = request.groupKeys;

        if (isDoingGrouping(rowGroupCols, groupKeys)) {
            const rowGroupCol = rowGroupCols[groupKeys.length];

            return ' GROUP BY ' + column(rowGroupCol.id) + ' HAVING count(*) > 0';
        }

        return '';
    }

    function orderBySql(request: IServerSideGetRowsRequest) {
        const rowGroupCol = isDoingGrouping(request.rowGroupCols, request.groupKeys)
            ? request.rowGroupCols[request.groupKeys.length]
            : undefined;
        const sorts = request.sortModel
            // sorting the auto group column has no effect, as the data doesn't hold it
            .filter((s) => knownColumns.has(s.colId))
            .map(function (s) {
                // a group level sorted by its own column is ordered by key, and by aggregate otherwise
                const sortBy =
                    rowGroupCol && s.colId !== rowGroupCol.id ? aggregateName(request, s.colId) : column(s.colId);
                return sortBy + (s.sort === 'desc' ? ' DESC' : ' ASC');
            });

        if (sorts.length === 0) return '';

        return ' ORDER BY ' + sorts.join(', ');
    }

    // the aggregate of a grouped column is returned under `<aggFunc>_<field>`, as its field holds the group key
    function aggregateName(request: IServerSideGetRowsRequest, colId: string) {
        const valueCol = request.valueCols.find(function (col) {
            return col.id === colId;
        });
        const isGrouped = request.rowGroupCols.some(function (col) {
            return col.id === colId;
        });
        return valueCol && isGrouped ? aggFunc(valueCol.aggFunc) + '_' + column(valueCol.id) : column(colId);
    }

    function isDoingGrouping(rowGroupCols: ColumnVO[], groupKeys: string[]) {
        // we are not doing grouping if at the lowest level
        return rowGroupCols.length > groupKeys.length;
    }

    function getLastRowIndex(request: IServerSideGetRowsRequest) {
        return executeQuery({ ...request, startRow: undefined, endRow: undefined }).length;
    }
}
