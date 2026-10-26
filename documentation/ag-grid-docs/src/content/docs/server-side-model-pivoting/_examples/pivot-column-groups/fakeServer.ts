// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-Side Row Model request.
// To keep things simple it does the bare minimum to support the example.
// Request values are bound as `?` parameters, and column names and sort directions are
// checked against allow-lists of known values.
export function FakeServer(allData) {
    alasql.options.cache = false;

    const knownColumns = new Set(Object.keys(allData[0] ?? {}));

    return {
        getData: function (request) {
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
        const pivotCols = request.pivotCols;
        const pivotCol = pivotCols[0]; // 'alasql' can only pivot on a single column

        // 'alasql' only supports pivoting on a single value column, to workaround this limitation we need to perform
        // separate queries for each value column and combine the results
        const results = [];

        request.valueCols.forEach(function (valueCol) {
            const pivotResults = executePivotQuery(request, pivotCol, valueCol);

            // merge each row into existing results
            for (let i = 0; i < pivotResults.length; i++) {
                var pivotResult = pivotResults[i];
                var result = results[i] || {};

                Object.keys(pivotResult).forEach(function (key) {
                    result[key] = pivotResult[key];
                });

                results[i] = result;
            }
        });

        return alasql('SELECT * FROM ?' + orderBySql(request, results), [results]);
    }

    function column(colId, columns = knownColumns) {
        if (!columns.has(colId)) {
            throw new Error('Unknown column: ' + colId);
        }
        return colId;
    }

    function orderBySql(request, results) {
        // the pivot results hold the group column and pivot result fields, sorts on anything else are ignored
        const resultColumns = new Set<string>(
            results.flatMap(function (row) {
                return Object.keys(row);
            })
        );
        const sortModel = request.sortModel.filter(function (s) {
            return resultColumns.has(s.colId);
        });

        if (sortModel.length === 0) return '';

        const sorts = sortModel.map(function (s) {
            return '`' + column(s.colId, resultColumns) + '`' + (s.sort === 'desc' ? ' DESC' : ' ASC');
        });

        return ' ORDER BY ' + sorts.join(', ');
    }

    function executePivotQuery(request, pivotCol, valueCol) {
        const groupKeys = request.groupKeys;
        const groupsToUse = request.rowGroupCols.slice(groupKeys.length, groupKeys.length + 1);
        const selectGroupCols = groupsToUse
            .map(function (groupCol) {
                return column(groupCol.id);
            })
            .join(', ');

        const SQL_TEMPLATE = "SELECT {0}, ({1} + '_{2}') AS {1}, {2} FROM ? PIVOT (SUM([{2}]) FOR {1})";
        const params = [allData];
        const SQL =
            interpolate(SQL_TEMPLATE, [selectGroupCols, column(pivotCol.id), column(valueCol.id)]) +
            whereSql(request, params);

        console.log('[FakeServer] - about to execute query:', SQL, params.slice(1));

        const result = alasql(SQL, params);

        // workaround - 'alasql' doesn't support PIVOT + LIMIT
        return extractRowsForBlock(request, result);
    }

    function whereSql(request, params) {
        const rowGroups = request.rowGroupCols;
        const groupKeys = request.groupKeys;
        const whereParts = [];

        if (groupKeys) {
            groupKeys.forEach(function (key, i) {
                whereParts.push(column(rowGroups[i].id) + ' = ?');
                params.push(key);
            });
        }

        if (whereParts.length > 0) {
            return ' WHERE ' + whereParts.join(' AND ');
        }

        return '';
    }

    function extractRowsForBlock(request, results) {
        const blockSize = request.endRow - request.startRow + 1;

        return results.slice(request.startRow, request.startRow + blockSize);
    }

    function getPivotFields(request) {
        const pivotCol = request.pivotCols[0];
        const template = "SELECT DISTINCT ({0} + '_{1}') AS {0} FROM ? ORDER BY {0}";

        const result = flatten(
            request.valueCols.map(function (valueCol) {
                const args = [column(pivotCol.id), column(valueCol.id)];
                const sql = interpolate(template, args);

                return alasql(sql, [allData]);
            })
        );

        return flatten(
            result.map(function (x) {
                return x[pivotCol.id];
            })
        );
    }

    function getLastRowIndex(request, results) {
        if (!results || results.length === 0) {
            return null;
        }

        const currentLastRow = request.startRow + results.length;

        return currentLastRow <= request.endRow ? currentLastRow : -1;
    }
}

// IE Workaround - as templates literal are not supported
function interpolate(str, o) {
    return str.replace(/{([^{}]*)}/g, function (a, b) {
        const r = o[b];
        return typeof r === 'string' || typeof r === 'number' ? r : a;
    });
}

function flatten(arrayOfArrays) {
    return [].concat.apply([], arrayOfArrays);
}
