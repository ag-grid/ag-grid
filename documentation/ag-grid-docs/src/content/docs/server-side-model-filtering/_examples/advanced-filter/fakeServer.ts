// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-Side Row Model request.
// To keep things simple it does the bare minimum to support the example.
// Request values are bound as `?` parameters, and column names and sort directions are
// checked against allow-lists of known values.
import { checkColumn, limitSql, numberFilterSql, orderBySql, textFilterSql } from '@example-fake-servers/sql';

import type { AdvancedFilterModel, IServerSideGetRowsRequest, SetAdvancedFilterModel } from 'ag-grid-community';

export function FakeServer(allData: any[]) {
    alasql.options.cache = false;

    const knownColumns = new Set(Object.keys(allData[0] ?? {}));

    return {
        getValues: function (field: string) {
            const rows = alasql('SELECT DISTINCT ' + column(field) + ' FROM ? ORDER BY ' + column(field), [allData]);

            return rows.map((row: any) => String(row[field]));
        },

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
            'SELECT * FROM ?' +
            whereSql(request, params) +
            orderBySql(request.sortModel, knownColumns) +
            limitSql(request)
        );
    }

    function column(colId: string) {
        return checkColumn(knownColumns, colId);
    }

    function whereSql(request: IServerSideGetRowsRequest, params: unknown[]) {
        const filterModel = request.filterModel as AdvancedFilterModel | null;

        if (filterModel) {
            return ' WHERE ' + createFilterSql(filterModel, params);
        }

        return '';
    }

    function createFilterSql(model: AdvancedFilterModel, params: unknown[]): string {
        if (model.filterType === 'join') {
            const join = model.type === 'OR' ? ' OR ' : ' AND ';
            return '(' + model.conditions.map((condition) => createFilterSql(condition, params)).join(join) + ')';
        } else {
            if (model.filterType === 'text') {
                return textFilterSql(column(model.colId), model, params);
            } else if (model.filterType === 'number') {
                return numberFilterSql(column(model.colId), model, params);
            } else if (model.filterType === 'set') {
                return setFilterMapper(column(model.colId), model, params);
            } else {
                console.log('filter type not implemented: ' + model.filterType);
                return ' 1 = 1 ';
            }
        }
    }

    // `is any of` / `is none of` send the Set Filter keys the written values resolved to, which are strings.
    // A blank is sent as a `null` key, so blank cells and the key are both folded to '' before comparing.
    function setFilterMapper(key: string, item: SetAdvancedFilterModel, params: unknown[]) {
        const values = item.values.map((value) => {
            params.push(value ?? '');
            return '?';
        });
        const operator = item.type === 'isNoneOf' ? ' NOT IN (' : ' IN (';

        return 'COALESCE(CAST(' + key + " AS STRING), '')" + operator + values.join(', ') + ')';
    }

    function getLastRowIndex(request: IServerSideGetRowsRequest) {
        return executeQuery({ ...request, startRow: undefined, endRow: undefined }).length;
    }
}
