// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-Side Row Model request.
// To keep things simple it does the bare minimum to support the example.
// Request values are bound as `?` parameters, and column names and sort directions are
// checked against allow-lists of known values.
import {
    checkColumn,
    combineConditionsSql,
    limitSql,
    orderBySql,
    setFilterSql,
    textFilterSql,
} from '@example-fake-servers/sql';

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
                ? ' WHERE ' + textFilterSql('sport', sportFilter.filterModels[0], params)
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
                ? operator + textFilterSql('sport', sportFilter.filterModels[0], params)
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
        return (
            'SELECT * FROM ?' +
            whereSql(request, params) +
            orderBySql(
                request.sortModel.map((s) => ({ ...s, colId: mapColumnKey(s.colId) })),
                knownColumns
            ) +
            limitSql(request)
        );
    }

    function column(colId) {
        return checkColumn(knownColumns, colId);
    }

    function mapColumnKey(columnKey) {
        return columnKey === 'country' ? 'countryCode' : columnKey;
    }

    function placeholders(values, params) {
        // blanks arrive as `null`; bind '' instead, as AlaSQL never matches null in an IN list
        params.push(...values.map((value) => value ?? ''));
        return values.map(() => '?').join(', ');
    }

    function whereSql(request, params) {
        const whereParts = [];
        const filterModel = request.filterModel;

        if (filterModel) {
            Object.keys(filterModel).forEach(function (columnKey) {
                const filter = filterModel[columnKey];

                if (filter.filterType === 'set') {
                    whereParts.push(setFilterSql(column(mapColumnKey(columnKey)), filter, params));
                    return;
                }

                if (filter.filterType === 'text') {
                    whereParts.push(combineConditionsSql(textFilterSql, column(columnKey), filter, params));
                    return;
                }

                if (filter.filterType === 'multi') {
                    Object.keys(filter.filterModels).forEach(function (fm) {
                        if (filter.filterModels[fm]) {
                            const model = filter.filterModels[fm];
                            switch (model.filterType) {
                                case 'text':
                                    whereParts.push(
                                        combineConditionsSql(textFilterSql, column(columnKey), model, params)
                                    );
                                    break;
                                case 'set':
                                    whereParts.push(setFilterSql(column(columnKey), model, params));
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

    function getLastRowIndex(request) {
        return executeQuery({ ...request, startRow: undefined, endRow: undefined }).length;
    }
}
