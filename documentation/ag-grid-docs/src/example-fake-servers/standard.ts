// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-Side Row Model request.
// To keep things simple it does the bare minimum to support the example.
// Request values are bound as `?` parameters, and column names, sort directions and
// aggregation functions are checked against allow-lists of known values.
import {
    checkColumn,
    combineConditionsSql,
    limitSql,
    numberFilterSql,
    orderBySql,
    textFilterSql,
} from '@example-fake-servers/sql';

// The ID AG Grid uses for the grand total row. Exported as GRAND_TOTAL_ROW_ID from 'ag-grid-community'
const GRAND_TOTAL_ROW_ID = 'rowGroupFooter_ROOT_NODE_ID';

export function FakeServer(allData) {
    alasql.options.cache = false;

    const knownColumns = new Set(Object.keys(allData[0] ?? {}));
    const aggFuncs = new Set(['sum', 'min', 'max', 'avg', 'count', 'first', 'last']);

    return {
        getData: function (request, needsGrandTotal) {
            const rows = executeQuery(request);
            const grandTotalData = needsGrandTotal ? computeGrandTotal(request) : undefined;

            return {
                success: true,
                rows,
                lastRow: getLastRowIndex(request),
                grandTotalData,
            };
        },
        getDistinctValues: function (field) {
            const id = column(field);

            return alasql('SELECT DISTINCT ' + id + ' FROM ? ORDER BY ' + id + ' ASC', [allData]).map(function (row) {
                return row[id];
            });
        },
    };

    function executeQuery(request) {
        const params = [allData];
        const sql = buildSql(request, params);
        console.log('[FakeServer] - about to execute query:', sql, params.slice(1));
        return alasql(sql, params);
    }

    function computeGrandTotal(request) {
        const valueCols = request.valueCols ?? [];
        // If no value columns are configured there is nothing meaningful to aggregate.
        if (valueCols.length === 0) {
            return { id: GRAND_TOTAL_ROW_ID };
        }

        // Aggregate across the entire filtered dataset, ignoring group keys — the grand total
        // represents the totals the user would see if all groups were expanded.
        const selects = valueCols.map((col) => {
            const id = column(col.id);
            return `${aggFunc(col.aggFunc)}(${id}) AS ${id}`;
        });
        const params = [allData];
        const sql = `SELECT ${selects.join(', ')} FROM ?` + whereSql({ ...request, groupKeys: [] }, params);
        console.log('[FakeServer] - about to execute grand total query:', sql, params.slice(1));
        const result = alasql(sql, params)[0] ?? {};
        for (const col of valueCols) {
            // the sum of no rows is 0, where SQL gives null
            if (col.aggFunc === 'sum') {
                result[col.id] ??= 0;
            }
        }
        return { id: GRAND_TOTAL_ROW_ID, ...result };
    }

    function buildSql(request, params) {
        return (
            selectSql(request) +
            ' FROM ?' +
            whereSql(request, params) +
            groupBySql(request) +
            orderBySql(request.sortModel, knownColumns) +
            limitSql(request)
        );
    }

    function column(colId) {
        return checkColumn(knownColumns, colId);
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
            const colsToSelect = [column(rowGroupCol.id), 'count(*) AS childCount'];

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
        const filterModel = request.filterModel;
        const whereParts = [];

        if (groupKeys) {
            groupKeys.forEach(function (key, i) {
                whereParts.push(column(rowGroups[i].id) + ' = ?');
                params.push(key);
            });
        }

        if (filterModel) {
            Object.keys(filterModel).forEach(function (key) {
                const item = filterModel[key];
                switch (item.filterType) {
                    case 'text':
                        whereParts.push(combineConditionsSql(textFilterSql, column(key), item, params));
                        break;
                    case 'number':
                        whereParts.push(combineConditionsSql(numberFilterSql, column(key), item, params));
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

    function groupBySql(request) {
        const rowGroupCols = request.rowGroupCols;
        const groupKeys = request.groupKeys;

        if (isDoingGrouping(rowGroupCols, groupKeys)) {
            const rowGroupCol = rowGroupCols[groupKeys.length];
            return ' GROUP BY ' + column(rowGroupCol.id) + ' HAVING count(*) > 0';
        }
        return '';
    }

    function isDoingGrouping(rowGroupCols, groupKeys) {
        // we are not doing grouping if at the lowest level
        return rowGroupCols.length > groupKeys.length;
    }

    function getLastRowIndex(request) {
        return executeQuery({ ...request, startRow: undefined, endRow: undefined }).length;
    }
}
