// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-Side Row Model request.
// To keep things simple it does the bare minimum to support the example.
// Request values are bound as `?` parameters, and column names and sort directions are
// checked against allow-lists of known values.
import { checkColumn, limitSql, numberFilterSql, orderBySql, textFilterSql } from '@example-fake-servers/sql';

export function FakeServer(allData) {
    alasql.options.cache = false;

    const knownColumns = new Set(Object.keys(allData[0] ?? {}));

    return {
        getValues: function (field) {
            const rows = alasql('SELECT DISTINCT ' + column(field) + ' FROM ? ORDER BY ' + column(field), [allData]);

            return rows.map((row) => String(row[field]));
        },

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
        return (
            'SELECT * FROM ?' +
            whereSql(request, params) +
            orderBySql(request.sortModel, knownColumns) +
            limitSql(request)
        );
    }

    function column(colId) {
        return checkColumn(knownColumns, colId);
    }

    function whereSql(request, params) {
        const filterModel = request.filterModel;

        if (filterModel) {
            return ' WHERE ' + createFilterSql(filterModel, params);
        }

        return '';
    }

    function createFilterSql(model, params) {
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
    function setFilterMapper(key, item, params) {
        const values = item.values.map((value) => {
            params.push(value ?? '');
            return '?';
        });
        const operator = item.type === 'isNoneOf' ? ' NOT IN (' : ' IN (';

        return 'COALESCE(CAST(' + key + " AS STRING), '')" + operator + values.join(', ') + ')';
    }

    function getLastRowIndex(request) {
        return executeQuery({ ...request, startRow: undefined, endRow: undefined }).length;
    }
}
