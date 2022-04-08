// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-Side Row Model request.
// To keep things simple it does the bare minimum to support the example.
function FakeServer(allData) {
    alasql.options.cache = false;

    return {
        getData: function(request) {
            var result = executeQuery(request);

            return {
                success: true,
                rows: result,
                lastRow: getLastRowIndex(request, result),
                pivotFields: getPivotFields(request, result)
            };
        }
    };

    function executeQuery(request) {
        var pivotCols = request.pivotCols;
        var groupKeys = request.groupKeys;
        var groupsToUse = request.rowGroupCols.slice(groupKeys.length, groupKeys.length + 1);
        var pivotCol = pivotCols[0]; // 'alasql' can only pivot on a single column

        const splitResults = request.valueCols.map(valueCol => executePivotQuery(request, pivotCol, valueCol));
        const generateJoinCondition = (col1, col2) => groupsToUse.map(col => `${col1}.${col.id} = ${col2}.${col.id}`).join(' AND ');

        const blockSize = request.endRow - request.startRow + 1;
        const SQL_TEMPLATE = `
          SELECT * FROM (
            SELECT X.*, Y.*, Z.*
            FROM ? AS X
            INNER JOIN ? AS Y ON ${generateJoinCondition('X', 'Y')}
            INNER JOIN ? AS Z ON ${generateJoinCondition('X', 'Z')}
          )
          ${groupKeys.length === 0 ? whereSql(request, false) : ''}
          LIMIT ${blockSize}
          OFFSET ${request.startRow}
        `;
        const result = alasql(SQL_TEMPLATE, splitResults);
        return result;
    }

    function executePivotQuery(request, pivotCol, valueCol) {
        var groupKeys = request.groupKeys;
        var groupsToUse = request.rowGroupCols.slice(groupKeys.length, groupKeys.length + 1);
        var selectGroupCols = groupsToUse.map(function(groupCol) { return groupCol.id; }).join(', ');

        var SQL_TEMPLATE = `
            SELECT
                {0},
                ({1} + '_{2}') AS {1}, {2}
            FROM
                ?
            PIVOT (
                SUM([{2}])
                FOR {1}
            )
            ${whereSql(request, true)}
        `;

        var queryResult = alasql(
          interpolate(SQL_TEMPLATE, [selectGroupCols, pivotCol.id, valueCol.id]),
          [allData]
        );

        return queryResult;
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
      case 'notBlank':
        return key + ' IS NOT NULL';
      case 'blank':
        return key + ' IS NULL';
      case 'inRange':
        return (
          '(' +
          key +
          ' >= ' +
          item.filter +
          ' and ' +
          key +
          ' <= ' +
          item.filterTo +
          ')'
        );
      default:
        console.log('unknown number filter type: ' + item.type);
    }
  }

    function whereSql(request, primary) {
        var rowGroups = request.rowGroupCols;
        var groupKeys = request.groupKeys;
        var whereParts = [];
        var filterModel = request.filterModel;

        if (filterModel) {
          Object.keys(filterModel).forEach(function (key) {
            if (primary === key.includes('_')) {
              return;
            }

            var item = filterModel[key];
    
            switch (item.filterType) {
              case 'text':
                whereParts.push(createFilterSql(textFilterMapper, `[${key}]`, item));
                break;
              case 'number':
                whereParts.push(createFilterSql(numberFilterMapper, `[${key}]`, item));
                break;
              default:
                console.log('unknown filter type: ' + item.filterType);
                break;
            }
          });
        }

        if (groupKeys) {
            groupKeys.forEach(function(key, i) {
                if (primary === key.includes('_')) {
                  return;
                }
                var value = typeof key === 'string' ? "'" + key + "'" : key;

                whereParts.push(rowGroups[i].id + ' = ' + value);
            });
        }

        if (whereParts.length > 0) {
            return ' WHERE ' + whereParts.join(' AND ');
        }

        return '';
    }

    function getPivotFields(request) {
        var pivotCol = request.pivotCols[0];
        var template = `
          SELECT DISTINCT ({0} + '_{1}') AS {0} FROM ? ${whereSql(request, true)} ORDER BY {0}
        `;
        var result = flatten(request.valueCols.map(function(valueCol) {
            var args = [pivotCol.id, valueCol.id];
            var sql = interpolate(template, args);

            return alasql(sql, [allData]);
        }));

        return flatten(result.map(function(x) { return x[pivotCol.id]; }));
    }

    function getLastRowIndex(request, results) {
        if (!results) { return null; }

        var currentLastRow = request.startRow + results.length;

        return currentLastRow <= request.endRow ? currentLastRow : -1;
    }
}

// IE Workaround - as templates literal are not supported
function interpolate(str, o) {
    return str.replace(/{([^{}]*)}/g,
        function(a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        }
    );
}

function flatten(arrayOfArrays) {
    return [].concat.apply([], arrayOfArrays);
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
        return (
          '(' +
          key +
          ' >= ' +
          item.filter +
          ' and ' +
          key +
          ' <= ' +
          item.filterTo +
          ')'
        );
      default:
        console.log('unknown number filter type: ' + item.type);
    }
  }

  function createFilterSql(mapper, key, item) {
    if (item.operator) {
      var condition1 = mapper(key, item.condition1);
      var condition2 = mapper(key, item.condition2);

      return '(' + condition1 + ' ' + item.operator + ' ' + condition2 + ')';
    }

    return mapper(key, item);
  }