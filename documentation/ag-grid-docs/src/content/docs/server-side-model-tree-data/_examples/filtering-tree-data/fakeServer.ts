// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-Side Row Model request.
// To keep things simple it does the bare minimum to support the example.
// Request values are bound as `?` parameters, and column names and sort directions are
// checked against allow-lists of known values.
import type { FilterModel, IServerSideGetRowsRequest } from 'ag-grid-community';

export function FakeServer(allData: any[]) {
    const processedData = processData(allData);
    const knownColumns = new Set(Object.keys(processedData[0] ?? {}));
    alasql.options.cache = false;

    return {
        getData: function (request: IServerSideGetRowsRequest) {
            const hasFilter = !!request.filterModel && Object.keys(request.filterModel).length > 0;
            let results = executeQuery(request, hasFilter);

            if (hasFilter) {
                results = recursiveFilter(request, results);
            }

            return {
                success: true,
                rows: results,
                lastRow: getLastRowIndex(request),
            };
        },
        getDates: function () {
            const sql = 'SELECT DISTINCT startDate FROM ? ORDER BY startDate ASC';

            return alasql(sql, [processedData]).map((row: any) => row.startDate);
        },
        getEmployees: function () {
            // get children only
            const sql = 'SELECT DISTINCT dataPath FROM ? WHERE underlings = FALSE ORDER BY dataPath ASC';

            return alasql(sql, [processedData]).map((row: any) => (row.dataPath ? row.dataPath.split(',') : null));
        },
    };

    function executeQuery(request: IServerSideGetRowsRequest, ignoreLimit: boolean) {
        const params: unknown[] = [processedData];
        const sql = buildSql(request, ignoreLimit, params);

        console.log('[FakeServer] - about to execute query:', sql, params.slice(1));

        return alasql(sql, params);
    }

    function buildSql(request: IServerSideGetRowsRequest, ignoreLimit: boolean, params: unknown[]) {
        return 'SELECT * FROM ?' + whereSql(request, params) + orderBySql(request) + limitSql(request, ignoreLimit);
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

        if (filterModel && Object.keys(filterModel).length) {
            Object.keys(filterModel).forEach(function (key) {
                const item = filterModel[key];
                if (key === 'ag-Grid-AutoColumn') {
                    key = 'dataPath';
                }

                switch (item.filterType) {
                    case 'text':
                        whereParts.push(createFilterSql(textFilterMapper, column(key), item, params));
                        break;
                    case 'number':
                        whereParts.push(createFilterSql(numberFilterMapper, column(key), item, params));
                        break;
                    case 'set':
                        whereParts.push(createSetFilterSql(column(key), item.values, params));
                        break;
                    default:
                        console.log('unknown filter type: ' + item.filterType);
                        break;
                }
            });
        } else {
            whereParts.push('(parentPath = ?)');
            params.push(request.groupKeys.join(','));
        }

        if (whereParts.length > 0) {
            return ' WHERE ' + whereParts.join(' AND ');
        }

        return '';
    }

    function createSetFilterSql(key: string, values: (string | null)[], params: unknown[]) {
        // blanks arrive as `null`; bind '' instead, as AlaSQL never matches null in an IN list
        params.push(...values.map((value) => value ?? ''));
        return key + ' IN (' + values.map(() => '?').join(', ') + ')';
    }

    function createFilterSql<TModel>(
        mapper: (key: string, item: TModel, params: unknown[]) => string,
        key: string,
        item: TModel & { operator?: string; conditions?: TModel[] },
        params: unknown[]
    ) {
        if (item.operator && item.conditions) {
            const conditions = item.conditions.map((condition) => mapper(key, condition, params));

            return '(' + conditions.join(item.operator === 'OR' ? ' OR ' : ' AND ') + ')';
        }

        return mapper(key, item, params);
    }

    function textFilterMapper(key: string, item: { type?: string | null; filter?: string | null }, params: unknown[]) {
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
                return '(' + key + ' IS NULL OR ' + key + " = '')";
            case 'notBlank':
                return key + ' IS NOT NULL and ' + key + " != ''";
            default:
                console.log('unknown text filter type: ' + item.type);
                return '';
        }
    }

    function numberFilterMapper(
        key: string,
        item: { type?: string | null; filter?: number | null; filterTo?: number | null },
        params: unknown[]
    ) {
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
                return '';
        }
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

    function limitSql(request: IServerSideGetRowsRequest, ignoreLimit?: boolean) {
        if (ignoreLimit || request.endRow == undefined || request.startRow == undefined) {
            return '';
        }
        // AlaSQL doesn't accept bound parameters here, so only ever write whole numbers
        const startRow = Math.max(0, Math.floor(Number(request.startRow)) || 0);
        const blockSize = Math.max(0, Math.floor(Number(request.endRow)) - startRow || 0);

        return ' LIMIT ' + blockSize + ' OFFSET ' + startRow;
    }

    function getLastRowIndex(request: IServerSideGetRowsRequest) {
        const hasFilter = !!request.filterModel && Object.keys(request.filterModel).length > 0;
        let results = executeQuery(request, hasFilter);

        if (hasFilter) {
            results = recursiveFilter(request, results);
        }
        return results.length;
    }

    function processData(data: any[]) {
        const flattenedData: any[] = [];
        const flattenRowRecursive = (row: any, parentPath: string[]) => {
            let startDate: string | null = null;
            if (row.startDate) {
                const dateParts = row.startDate.split('/');
                startDate = new Date(parseInt(dateParts[2]), dateParts[1] - 1, dateParts[0]).toISOString();
            }
            const dataPath = [...parentPath, row.employeeName];
            flattenedData.push({
                ...row,
                dataPath: dataPath.join(','),
                parentPath: parentPath.join(','),
                startDate,
                underlings: !!row.underlings,
            });
            if (row.underlings) {
                row.underlings.forEach((underling: any) => flattenRowRecursive(underling, dataPath));
            }
        };
        data.forEach((row) => flattenRowRecursive(row, []));
        return flattenedData;
    }

    function recursiveFilter(request: IServerSideGetRowsRequest, results: any[]) {
        // tree data filter returns rows where the row itself matches, parent matches, or a child matches.
        // matches for row itself
        const allResults = [...results];
        // parents of matching rows
        recursiveFilterParentMatches(allResults, results);
        // children of matching rows
        recursiveFilterChildMatches(allResults, results);

        const requestPath = request.groupKeys.join(',');
        const sql =
            'SELECT DISTINCT processedData.* FROM ? processedData INNER JOIN ? allResults ON processedData.dataPath = allResults.dataPath WHERE parentPath = ?' +
            orderBySql(request) +
            limitSql(request);
        return alasql(sql, [processedData, allResults, requestPath]);
    }

    function recursiveFilterParentMatches(allResults: any[], childResults: any[]) {
        if (!childResults.length) {
            return;
        }
        const sql =
            'SELECT DISTINCT processedData.* FROM ? processedData INNER JOIN ? parentResults ON processedData.dataPath = parentResults.parentPath';
        const newMatches = alasql(sql, [processedData, childResults]).filter(
            (newResult: any) => !allResults.some((existingResult) => newResult.dataPath === existingResult.dataPath)
        );
        allResults.push(...newMatches);
        recursiveFilterParentMatches(allResults, newMatches);
    }

    function recursiveFilterChildMatches(allResults: any[], parentResults: any[]) {
        if (!parentResults.length) {
            return;
        }
        const sql =
            'SELECT DISTINCT processedData.* FROM ? processedData INNER JOIN ? parentResults ON processedData.parentPath = parentResults.dataPath';
        const newMatches = alasql(sql, [processedData, parentResults]).filter(
            (newResult: any) => !allResults.some((existingResult) => newResult.dataPath === existingResult.dataPath)
        );
        allResults.push(...newMatches);
        recursiveFilterChildMatches(allResults, newMatches);
    }
}
