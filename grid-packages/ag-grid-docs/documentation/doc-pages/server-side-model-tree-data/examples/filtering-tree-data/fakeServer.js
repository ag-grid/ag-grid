// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-Side Row Model request.
// To keep things simple it does the bare minimum to support the example.
function FakeServer(allData) {
    var processedData = processData(allData);
    alasql.options.cache = false;

    return {
        getData: function(request) {
            var results = executeQuery(request);

            if (request.filterModel && Object.keys(request.filterModel).length) {
                results = recursiveFilter(request, results);
            }

            return {
                success: true,
                rows: results,
                lastRow: getLastRowIndex(request, results)
            };
        },
        getDates() {
            var sql = 'SELECT DISTINCT startDate FROM ? ORDER BY startDate ASC';

            return alasql(sql, [processedData]).map(row => row.startDate);
        },
        getEmployees() {
            // get children only
            var sql = 'SELECT DISTINCT dataPath FROM ? WHERE underlings = FALSE ORDER BY dataPath ASC';

            return alasql(sql, [processedData]).map(row => row.dataPath ? row.dataPath.split(',') : null);
        }
    };

    function executeQuery(request) {
        var sql = buildSql(request);

        console.log('[FakeServer] - about to execute query:', sql);

        return alasql(sql, [processedData]);
    }

    function buildSql(request) {
        return 'SELECT * FROM ?' + whereSql(request) + orderBySql(request) + limitSql(request);
    }

    function whereSql(request) {
        var whereParts = [];

        var filterModel = request.filterModel;

        if (filterModel && Object.keys(request.filterModel).length) {
            Object.keys(filterModel).forEach(function(key) {
                var item = filterModel[key];
                if (key === 'ag-Grid-AutoColumn') {
                    key = 'dataPath'
                }

                switch (item.filterType) {
                    case 'text':
                        whereParts.push(createFilterSql(textFilterMapper, key, item));
                        break;
                    case 'number':
                        whereParts.push(createFilterSql(numberFilterMapper, key, item));
                        break;
                    case 'set':
                        whereParts.push(createSetFilterSql(key, item.values));
                        break;
                    default:
                        console.log('unknown filter type: ' + item.filterType);
                        break;
                }
            });
        } else {
            whereParts.push("(parentPath = '" + request.groupKeys.join(',') + "')");
        }

        if (whereParts.length > 0) {
            return ' WHERE ' + whereParts.join(' AND ');
        }

        return '';
    }

    function createSetFilterSql(key, values) {
        return key + ' IN (\'' + values.join("', '") + '\')'
    }

    function createFilterSql(mapper, key, item) {
        if (item.operator) {
            var condition1 = mapper(key, item.condition1);
            var condition2 = mapper(key, item.condition2);

            return '(' + condition1 + ' ' + item.operator + ' ' + condition2 + ')';
        }

        return mapper(key, item);
    }

    function textFilterMapper(key, item) {
        switch (item.type) {
            case 'equals':
                return key + " = '" + item.filter + "'";
            case 'notEqual':
                return key + "' != '" + item.filter + "'";
            case 'contains':
                return key + " LIKE '%" + item.filter + "%'";
            case 'notContains':
                return key + " NOT LIKE '%" + item.filter + "%'";
            case 'startsWith':
                return key + " LIKE '" + item.filter + "%'";
            case 'endsWith':
                return key + " LIKE '%" + item.filter + "'";
            case 'blank':
                return key + " IS NULL or " + key + " = ''";
            case 'notBlank':
                return key + " IS NOT NULL and " + key + " != ''";
            default:
                console.log('unknown text filter type: ' + item.type);
        }
    }

    function numberFilterMapper(key, item) {
        switch (item.type) {
            case 'equals':
                return key + ' = ' + item.filter;
            case 'notEqual':
                return key + ' != ' + item.filter;
            case 'greaterThan':
                return key + ' > ' + item.filter;
            case 'greaterThanOrEqual':
                return key + ' >= ' + item.filter;
            case 'lessThan':
                return key + ' < ' + item.filter;
            case 'lessThanOrEqual':
                return key + ' <= ' + item.filter;
            case 'inRange':
                return '(' + key + ' >= ' + item.filter + ' and ' + key + ' <= ' + item.filterTo + ')';
            case 'blank':
                return key + " IS NULL";
            case 'notBlank':
                return key + " IS NOT NULL";
            default:
                console.log('unknown number filter type: ' + item.type);
        }
    }

    function orderBySql(request) {
        var sortModel = request.sortModel;

        if (sortModel.length === 0) return '';

        var sorts = sortModel.map(function(s) {
            return s.colId + ' ' + s.sort.toUpperCase();
        });

        return ' ORDER BY ' + sorts.join(', ');
    }

    function limitSql(request) {
        if (request.endRow == undefined || request.startRow == undefined) { return ''; }
        var blockSize = request.endRow - request.startRow;

        return ' LIMIT ' + (blockSize + 1) + ' OFFSET ' + request.startRow;
    }

    function getLastRowIndex(request, results) {
        if (!results || results.length === 0) {
            return request.startRow;
        }
        if (request.endRow == undefined || request.startRow == undefined) { return results.length; }

        var currentLastRow = request.startRow + results.length;

        return currentLastRow <= request.endRow ? currentLastRow : -1;
    }

    function processData(data) {
        const flattenedData = [];
        const flattenRowRecursive = (row, parentPath) => {
            let startDate = null;
            if (row.startDate) {
                const dateParts = row.startDate.split('/');
                startDate = new Date(parseInt(dateParts[2]), dateParts[1] - 1, dateParts[0]).toISOString();
            }
            const dataPath = [...parentPath, row.employeeName];
            flattenedData.push({...row, dataPath: dataPath.join(','), parentPath: parentPath.join(','), startDate, underlings: !!row.underlings});
            if (row.underlings) {
                row.underlings.forEach((underling) => flattenRowRecursive(underling, dataPath));
            }
        };
        data.forEach(row => flattenRowRecursive(row, []));
        return flattenedData;
    }

    function recursiveFilter(request, results) {
        // tree data filter returns rows where the row itself matches, parent matches, or a child matches.
        // paths for parents and self
        let exactPaths = [];
        // paths for children
        let startsWithPaths = [];
        results.forEach(result => {
            exactPaths.push(...getParentPaths(result.parentPath));
            exactPaths.push(result.dataPath)
            startsWithPaths.push(result.dataPath + ',');
        });
        const requestPath = request.groupKeys.join(',');
        exactPaths = Array.from(new Set(exactPaths.filter(path => path.startsWith(requestPath))));
        startsWithPaths = Array.from(new Set(startsWithPaths.filter(path => path.startsWith(requestPath) || requestPath.startsWith(path))));
        if (exactPaths.length || startsWithPaths.length) {
            const sql = buildTreeFilterSql(request, requestPath, exactPaths, startsWithPaths);
            return alasql(sql, [processedData]);
        }
        return [];
    }

    function buildTreeFilterSql(request, requestPath, exactPaths, startsWithPaths) {
        const pathsSql = [];
        if (exactPaths.length) {
            pathsSql.push('dataPath IN (' + exactPaths.map(path => "'" + path + "'").join(',') + ')');
        }
        if (startsWithPaths.length) {
            pathsSql.push('(' + startsWithPaths.map(path => "dataPath LIKE '" + path + "%'").join(' OR ') + ')');
        }

        return 'SELECT * FROM ? WHERE (' + pathsSql.join(' OR ') + ") AND parentPath = '" + requestPath + "'" + orderBySql(request) + limitSql(request);
    }

    function getParentPaths(parentPath) {
        const paths = [];
        let path = parentPath;
        let index = parentPath.length;
        while (index >= 0) {
            path = path.slice(0, index);
            paths.push(path);
            index = path.lastIndexOf(',');
        };
        return paths;
    }
}
