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
            const params = [allData];
            const textFilter = sportFilter?.filterModels[0]
                ? ' WHERE ' + textFilterMapper('sport', sportFilter.filterModels[0], params)
                : '';
            const sql = 'SELECT DISTINCT countryCode, countryName FROM ? ' + textFilter + ' ORDER BY countryName ASC';

            return alasql(sql, params).map((row) => ({
                code: row.countryCode,
                name: row.countryName,
            }));
        },
        getSports: function (countries, sportFilter) {
            console.log('Returning sports for ' + (countries ? countries.join(', ') : 'all countries'));

            const params = [allData];
            const where = countries ? ' WHERE countryCode IN (' + placeholders(countries, params) + ')' : '';
            const operator = countries ? ' AND ' : ' WHERE ';
            const textFilter = sportFilter?.filterModels[0]
                ? operator + textFilterMapper('sport', sportFilter.filterModels[0], params)
                : '';
            const sql = 'SELECT DISTINCT sport FROM ? ' + where + textFilter + ' ORDER BY sport ASC';

            return alasql(sql, params).map(function (x) {
                return x.sport;
            });
        },
    };

    function executeQuery(request) {
        const params = [allData];
        const sql = buildSql(request, params);

        console.log('[FakeServer] - about to execute query:', sql, params.slice(1));

        return alasql(sql, params);
    }

    function buildSql(request, params) {
        return 'SELECT * FROM ?' + whereSql(request, params) + orderBySql(request) + limitSql(request);
    }

    function column(colId) {
        if (!knownColumns.has(colId)) {
            throw new Error('Unknown column: ' + colId);
        }
        return colId;
    }

    function mapColumnKey(columnKey) {
        return columnKey === 'country' ? 'countryCode' : columnKey;
    }

    function placeholders(values, params) {
        // blanks arrive as `null`; bind '' instead, as AlaSQL never matches null in an IN list
        params.push(...values.map((value) => value ?? ''));
        return values.map(() => '?').join(', ');
    }

    function textFilterMapper(key, item, params) {
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
            default:
                console.log('unknown text filter type: ' + item.type);
        }
    }

    function createFilterSql(mapper, key, item, params) {
        if (item.operator) {
            const conditions = item.conditions.map((condition) => mapper(key, condition, params));

            return '(' + conditions.join(item.operator === 'OR' ? ' OR ' : ' AND ') + ')';
        }

        return mapper(key, item, params);
    }

    function whereSql(request, params) {
        const whereParts = [];
        const filterModel = request.filterModel;

        if (filterModel) {
            Object.keys(filterModel).forEach(function (columnKey) {
                const filter = filterModel[columnKey];

                if (filter.filterType === 'set') {
                    whereParts.push(
                        column(mapColumnKey(columnKey)) + ' IN (' + placeholders(filter.values, params) + ')'
                    );
                    return;
                }

                if (filter.filterType === 'text') {
                    whereParts.push(createFilterSql(textFilterMapper, column(columnKey), filter, params));
                    return;
                }

                if (filter.filterType === 'multi') {
                    Object.keys(filter.filterModels).forEach(function (fm) {
                        if (filter.filterModels[fm]) {
                            const model = filter.filterModels[fm];
                            switch (model.filterType) {
                                case 'text':
                                    whereParts.push(
                                        createFilterSql(textFilterMapper, column(columnKey), model, params)
                                    );
                                    break;
                                case 'set':
                                    whereParts.push(
                                        column(columnKey) + ' IN (' + placeholders(model.values, params) + ')'
                                    );
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
        // sorts on columns that aren't in the data (e.g. the auto group column) are ignored
        const sortModel = request.sortModel.filter(function (s) {
            return knownColumns.has(mapColumnKey(s.colId));
        });

        if (sortModel.length === 0) return '';

        const sorts = sortModel.map(function (s) {
            return column(mapColumnKey(s.colId)) + (s.sort === 'desc' ? ' DESC' : ' ASC');
        });

        return ' ORDER BY ' + sorts.join(', ');
    }

    function limitSql(request) {
        if (request.endRow == undefined || request.startRow == undefined) {
            return '';
        }
        // AlaSQL doesn't accept bound parameters here, so only ever write whole numbers
        const startRow = Math.max(0, Math.floor(Number(request.startRow)) || 0);
        const blockSize = Math.max(0, Math.floor(Number(request.endRow)) - startRow || 0);

        return ' LIMIT ' + blockSize + ' OFFSET ' + startRow;
    }

    function getLastRowIndex(request) {
        return executeQuery({ ...request, startRow: undefined, endRow: undefined }).length;
    }
}
