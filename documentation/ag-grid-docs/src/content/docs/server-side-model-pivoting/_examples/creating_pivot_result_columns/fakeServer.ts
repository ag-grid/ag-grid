// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-Side Row Model request.
// To keep things simple it does the bare minimum to support the example.
export function FakeServer(allData) {
    alasql.options.cache = false;

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

        return alasql(`SELECT * FROM ?${orderBySql(request)}`, [results]);
    }

    function orderBySql({ sortModel }) {
        if (sortModel.length === 0) return '';
        const sorts = sortModel.map(({ colId, sort }) => `\`${colId}\` ${sort.toUpperCase()}`);
        return ` ORDER BY ${sorts.join(', ')}`;
    }

    function executePivotQuery(request, pivotCol, valueCol) {
        const { groupKeys, rowGroupCols } = request;
        const groupsToUse = rowGroupCols.slice(groupKeys.length, groupKeys.length + 1);
        const selectGroupCols = groupsToUse.map((groupCol) => groupCol.id).join(', ');

        const SQL = `SELECT ${selectGroupCols}, (${pivotCol.id} + '_${
            valueCol.id
        }') AS ${pivotCol.id}, ${valueCol.id} FROM ? PIVOT (${valueCol.aggFunc}([${
            valueCol.id
        }]) FOR ${pivotCol.id})${whereSql(request)}`;

        console.log('[FakeServer] - about to execute query:', SQL);

        return extractRowsForBlock(request, alasql(SQL, [allData]));
    }

    function whereSql({ rowGroupCols, groupKeys }) {
        const whereParts = groupKeys
            ? groupKeys.map((key, i) => `${rowGroupCols[i].id} = ${typeof key === 'string' ? `'${key}'` : key}`)
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
                const sql = `SELECT DISTINCT (${pivotCol.id} + '_${valueCol.id}') AS ${pivotCol.id} FROM ? ORDER BY ${pivotCol.id}`;
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
