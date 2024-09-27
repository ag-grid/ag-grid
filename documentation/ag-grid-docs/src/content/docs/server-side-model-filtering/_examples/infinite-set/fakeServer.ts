// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-Side Row Model request.
// To keep things simple it does the bare minimum to support the example.
export function FakeServer(allData) {
    alasql.options.cache = false;

    return {
        getData: function (request) {
            const results = executeQuery(request);
            results.forEach((row) => {
                row.country = {
                    code: row.countryCode,
                    name: row.countryName,
                };
                delete row.countryCode;
                delete row.countryName;
            });

            return {
                success: true,
                rows: results,
                lastRow: getLastRowIndex(request),
            };
        },
        getCountries: function (sportFilter) {
            const textFilter = sportFilter ? ' WHERE ' + textFilterMapper('sport', sportFilter.filterModels[0]) : '';
            const sql = 'SELECT DISTINCT countryCode, countryName FROM ? ' + textFilter + ' ORDER BY countryName ASC';

            return alasql(sql, [allData]).map((row) => ({
                code: row.countryCode,
                name: row.countryName,
            }));
        },
        getSports: function (countries, sportFilter) {
            console.log('Returning sports for ' + (countries ? countries.join(', ') : 'all countries'));

            const where = countries ? " WHERE countryCode IN ('" + countries.join("', '") + "')" : '';
            const operator = countries ? ' AND ' : ' WHERE ';
            const textFilter = sportFilter ? operator + textFilterMapper('sport', sportFilter.filterModels[0]) : '';
            const sql = 'SELECT DISTINCT sport FROM ? ' + where + textFilter + ' ORDER BY sport ASC';

            return alasql(sql, [allData]).map(function (x) {
                return x.sport;
            });
        },
    };

    function executeQuery(request) {
        const sql = buildSql(request);

        console.log('[FakeServer] - about to execute query:', sql);

        return alasql(sql, [allData]);
    }

    function buildSql(request) {
        return 'SELECT * FROM ?' + whereSql(request) + orderBySql(request) + limitSql(request);
    }

    function mapColumnKey(columnKey) {
        return columnKey === 'country' ? 'countryCode' : columnKey;
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
            default:
                console.log('unknown text filter type: ' + item.type);
        }
    }

    function createFilterSql(mapper, key, item) {
        if (item.operator) {
            const condition1 = mapper(key, item.condition1);
            const condition2 = mapper(key, item.condition2);

            return '(' + condition1 + ' ' + item.operator + ' ' + condition2 + ')';
        }

        return mapper(key, item);
    }

    function whereSql(request) {
        const whereParts = [];
        const filterModel = request.filterModel;

        if (filterModel) {
            Object.keys(filterModel).forEach(function (columnKey) {
                const filter = filterModel[columnKey];

                if (filter.filterType === 'set') {
                    whereParts.push(mapColumnKey(columnKey) + " IN ('" + filter.values.join("', '") + "')");
                    return;
                }

                if (filter.filterType === 'text') {
                    whereParts.push(createFilterSql(textFilterMapper, columnKey, filter));
                    return;
                }

                if (filter.filterType === 'multi') {
                    Object.keys(filter.filterModels).forEach(function (fm) {
                        if (filter.filterModels[fm]) {
                            const model = filter.filterModels[fm];
                            switch (model.filterType) {
                                case 'text':
                                    whereParts.push(createFilterSql(textFilterMapper, columnKey, model));
                                    break;
                                case 'set':
                                    whereParts.push(columnKey + " IN ('" + model.values.join("', '") + "')");
                                    break;
                                default:
                                    console.log('unknown filter type: ' + model.filterType, model);
                                    break;
                            }
                        }
                    });
                    return;
                }

                console.log('unsupported filter type: ' + filter.filterType);
            });
        }

        if (whereParts.length > 0) {
            return ' WHERE ' + whereParts.join(' AND ');
        }

        return '';
    }

    function orderBySql(request) {
        const sortModel = request.sortModel;

        if (sortModel.length === 0) return '';

        const sorts = sortModel.map(function (s) {
            return mapColumnKey(s.colId) + ' ' + s.sort.toUpperCase();
        });

        return ' ORDER BY ' + sorts.join(', ');
    }

    function limitSql(request) {
        if (request.endRow == undefined || request.startRow == undefined) {
            return '';
        }
        const blockSize = request.endRow - request.startRow;

        return ' LIMIT ' + blockSize + ' OFFSET ' + request.startRow;
    }

    function getLastRowIndex(request) {
        return executeQuery({ ...request, startRow: undefined, endRow: undefined }).length;
    }
}
