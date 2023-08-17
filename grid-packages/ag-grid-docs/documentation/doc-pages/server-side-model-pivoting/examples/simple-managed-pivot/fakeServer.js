// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-Side Row Model request.
// To keep things simple it does the bare minimum to support the example.
function FakeServer(allData) {
    alasql.options.cache = false;
  
    return {
      getData: function (request) {
        var result = executeQuery(request);
  
        return {
          success: true,
          rows: result,
          lastRow: getLastRowIndex(request, result),
          pivotFields: getPivotFields(request),
        };
      },
    };
  
    function executeQuery(request) {
      var pivotCols = request.pivotCols;
      var pivotCol = pivotCols[0]; // 'alasql' can only pivot on a single column
  
      // 'alasql' only supports pivoting on a single value column, to workaround this limitation we need to perform
      // separate queries for each value column and combine the results
      var results = [];
  
      request.valueCols.forEach(function (valueCol) {
        var pivotResults = executePivotQuery(request, pivotCol, valueCol);
  
        // merge each row into existing results
        for (var i = 0; i < pivotResults.length; i++) {
          var pivotResult = pivotResults[i];
          var result = results[i] || {};
  
          Object.keys(pivotResult).forEach(function (key) {
            result[key] = pivotResult[key];
          });
  
          results[i] = result;
        }
      });
  
      return alasql('SELECT * FROM ?' + orderBySql(request), [results]);
    }
  
    function orderBySql(request) {
      var sortModel = request.sortModel;
  
      if (sortModel.length === 0) return '';
  
      var sorts = sortModel.map(function (s) {
        return '`' + s.colId + '` ' + s.sort.toUpperCase();
      });
  
      return ' ORDER BY ' + sorts.join(', ');
    }
  
  
    function executePivotQuery(request, pivotCol, valueCol) {
      var groupKeys = request.groupKeys;
      var groupsToUse = request.rowGroupCols.slice(
        groupKeys.length,
        groupKeys.length + 1
      );
      var selectGroupCols = groupsToUse
        .map(function (groupCol) {
          return groupCol.id;
        })
        .join(', ');
  
      var SQL_TEMPLATE =
        "SELECT {0}, ({1} + '_{2}') AS {1}, {2} FROM ? PIVOT (SUM([{2}]) FOR {1})";
      var SQL =
        interpolate(SQL_TEMPLATE, [selectGroupCols, pivotCol.id, valueCol.id]) +
        whereSql(request);
  
      console.log('[FakeServer] - about to execute query:', SQL);
  
      var result = alasql(SQL, [allData]);
  
      // workaround - 'alasql' doesn't support PIVOT + LIMIT
      return extractRowsForBlock(request, result);
    }
  
    function whereSql(request) {
      var rowGroups = request.rowGroupCols;
      var groupKeys = request.groupKeys;
      var whereParts = [];
  
      if (groupKeys) {
        groupKeys.forEach(function (key, i) {
          var value = typeof key === 'string' ? "'" + key + "'" : key;
  
          whereParts.push(rowGroups[i].id + ' = ' + value);
        });
      }
  
      if (whereParts.length > 0) {
        return ' WHERE ' + whereParts.join(' AND ');
      }
  
      return '';
    }
  
    function extractRowsForBlock(request, results) {
      var blockSize = request.endRow - request.startRow + 1;
  
      return results.slice(request.startRow, request.startRow + blockSize);
    }
  
    function getPivotFields(request) {
      var pivotCol = request.pivotCols[0];
      var template = "SELECT DISTINCT ({0} + '_{1}') AS {0} FROM ? ORDER BY {0}";
  
      var result = flatten(
        request.valueCols.map(function (valueCol) {
          var args = [pivotCol.id, valueCol.id];
          var sql = interpolate(template, args);
  
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
  
      var currentLastRow = request.startRow + results.length;
  
      return currentLastRow <= request.endRow ? currentLastRow : -1;
    }
  }
  
  // IE Workaround - as templates literal are not supported
  function interpolate(str, o) {
    return str.replace(/{([^{}]*)}/g, function (a, b) {
      var r = o[b];
      return typeof r === 'string' || typeof r === 'number' ? r : a;
    });
  }
  
  function flatten(arrayOfArrays) {
    return [].concat.apply([], arrayOfArrays);
  }
  