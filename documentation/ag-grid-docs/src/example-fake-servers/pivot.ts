// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-Side Row Model request.
// To keep things simple it does the bare minimum to support the example.
// Request values are bound as `?` parameters, and column names, sort directions and
// aggregation functions are checked against allow-lists of known values.
export function FakeServer(allData) {
    alasql.options.cache = false;

    const knownColumns = new Set(Object.keys(allData[0] ?? {}));
    const aggFuncs = new Set(['sum', 'min', 'max', 'avg', 'count', 'first', 'last']);

    return {
        getData: (request) => {
            const result = executeQuery(request);
            return {
                success: true,
                rows: result,
                lastRow: getLastRowIndex(request, result),
                pivotFields: getPivotFields(request),
            };
        },
    };

    function executeQuery(request) {
        const { pivotCols, valueCols } = request;
        const [pivotCol] = pivotCols;

        if (valueCols.length === 0) {
            return [];
        }

        const results = [];
        valueCols.forEach((valueCol) => {
            const pivotResults = executePivotQuery(request, pivotCol, valueCol);

            pivotResults.forEach((pivotResult, i) => {
                results[i] = { ...results[i], ...pivotResult };
            });
        });

        return alasql(`SELECT * FROM ?${orderBySql(request, results)}`, [results]);
    }

    function column(colId, columns = knownColumns) {
        if (!columns.has(colId)) {
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

    function orderBySql({ sortModel }, results) {
        // the pivot results hold the group column and pivot result fields, sorts on anything else are ignored
        const resultColumns = new Set<string>(results.flatMap((row) => Object.keys(row)));
        const sorts = sortModel
            .filter(({ colId }) => resultColumns.has(colId))
            .map(({ colId, sort }) => `\`${column(colId, resultColumns)}\`${sort === 'desc' ? ' DESC' : ' ASC'}`);
        if (sorts.length === 0) return '';
        return ` ORDER BY ${sorts.join(', ')}`;
    }

    function executePivotQuery(request, pivotCol, valueCol) {
        const { groupKeys, rowGroupCols } = request;
        const groupsToUse = rowGroupCols.slice(groupKeys.length, groupKeys.length + 1);
        const selectGroupCols = groupsToUse.map((groupCol) => column(groupCol.id)).join(', ');
        const pivotId = column(pivotCol.id);
        const valueId = column(valueCol.id);
        const params = [allData];

        const SQL = `SELECT ${selectGroupCols}, (${pivotId} + '_${valueId}') AS ${pivotId}, ${valueId} FROM ? PIVOT (${aggFunc(
            valueCol.aggFunc
        )}([${valueId}]) FOR ${pivotId})${whereSql(request, params)}`;

        console.log('[FakeServer] - about to execute query:', SQL, params.slice(1));

        return extractRowsForBlock(request, alasql(SQL, params));
    }

    function whereSql({ rowGroupCols, groupKeys }, params) {
        const whereParts = groupKeys
            ? groupKeys.map((key, i) => {
                  params.push(key);
                  return `${column(rowGroupCols[i].id)} = ?`;
              })
            : [];
        return whereParts.length > 0 ? ` WHERE ${whereParts.join(' AND ')}` : '';
    }

    function extractRowsForBlock({ startRow, endRow }, results) {
        const blockSize = endRow - startRow + 1;
        return results.slice(startRow, startRow + blockSize);
    }

    function getPivotFields({ pivotCols, valueCols }) {
        const [pivotCol] = pivotCols;
        const result = flatten(
            valueCols.map((valueCol) => {
                const pivotId = column(pivotCol.id);
                const sql = `SELECT DISTINCT (${pivotId} + '_${column(valueCol.id)}') AS ${pivotId} FROM ? ORDER BY ${pivotId}`;
                return alasql(sql, [allData]);
            })
        );
        return flatten(result.map((x) => x[pivotCol.id]));
    }

    function getLastRowIndex({ startRow, endRow }, results) {
        if (!results || results.length === 0) {
            return null;
        }
        const currentLastRow = startRow + results.length;
        return currentLastRow <= endRow ? currentLastRow : -1;
    }
}

const flatten = (arrayOfArrays) => [].concat(...arrayOfArrays);
