// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-Side Row Model request.
// To keep things simple it does the bare minimum to support the example.
import type { ColumnVO, IServerSideGetRowsRequest } from 'ag-grid-community';

export function FakeServer(allData: any[]) {
    alasql.options.cache = false;

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
        const sql = buildSql(request);

        console.log('[FakeServer] - about to execute query:', sql);

        return alasql(sql, [allData]);
    }

    function buildSql(request: IServerSideGetRowsRequest) {
        return (
            selectSql(request) +
            ' FROM ?' +
            whereSql(request) +
            groupBySql(request) +
            orderBySql(request) +
            limitSql(request)
        );
    }

    function selectSql(request: IServerSideGetRowsRequest) {
        const rowGroupCols = request.rowGroupCols;
        const valueCols = request.valueCols;
        const groupKeys = request.groupKeys;

        if (isDoingGrouping(rowGroupCols, groupKeys)) {
            const rowGroupCol = rowGroupCols[groupKeys.length];
            const colsToSelect = [rowGroupCol.id];

            valueCols.forEach(function (valueCol) {
                colsToSelect.push(valueCol.aggFunc + '(' + valueCol.id + ') AS ' + aggregateName(request, valueCol.id));
            });

            return 'SELECT ' + colsToSelect.join(', ');
        }

        return 'SELECT *';
    }

    function whereSql(request: IServerSideGetRowsRequest) {
        const rowGroups = request.rowGroupCols;
        const groupKeys = request.groupKeys;
        const whereParts: string[] = [];

        if (groupKeys) {
            groupKeys.forEach(function (key, i) {
                const value = typeof key === 'string' ? "'" + key + "'" : key;

                whereParts.push(rowGroups[i].id + ' = ' + value);
            });
        }

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

            return ' GROUP BY ' + rowGroupCol.id + ' HAVING count(*) > 0';
        }

        return '';
    }

    function orderBySql(request: IServerSideGetRowsRequest) {
        const sortModel = request.sortModel;

        if (sortModel.length === 0) return '';

        const rowGroupCol = isDoingGrouping(request.rowGroupCols, request.groupKeys)
            ? request.rowGroupCols[request.groupKeys.length]
            : undefined;
        const sorts = sortModel.map(function (s) {
            // a group level sorted by its own column is ordered by key, and by aggregate otherwise
            const sortBy = rowGroupCol && s.colId !== rowGroupCol.id ? aggregateName(request, s.colId) : s.colId;
            return sortBy + ' ' + s.sort.toUpperCase();
        });

        return ' ORDER BY ' + sorts.join(', ');
    }

    function limitSql(request: IServerSideGetRowsRequest) {
        if (request.endRow == undefined || request.startRow == undefined) {
            return '';
        }

        const blockSize = request.endRow - request.startRow;
        return ' LIMIT ' + blockSize + ' OFFSET ' + request.startRow;
    }

    // the aggregate of a grouped column is returned under `<aggFunc>_<field>`, as its field holds the group key
    function aggregateName(request: IServerSideGetRowsRequest, colId: string) {
        const valueCol = request.valueCols.find(function (col) {
            return col.id === colId;
        });
        const isGrouped = request.rowGroupCols.some(function (col) {
            return col.id === colId;
        });
        return valueCol && isGrouped ? valueCol.aggFunc + '_' + valueCol.field : colId;
    }

    function isDoingGrouping(rowGroupCols: ColumnVO[], groupKeys: string[]) {
        // we are not doing grouping if at the lowest level
        return rowGroupCols.length > groupKeys.length;
    }

    function getLastRowIndex(request: IServerSideGetRowsRequest) {
        return executeQuery({ ...request, startRow: undefined, endRow: undefined }).length;
    }
}
