var fakeServerInstance;

function FakeServer() {
  alasql.options.cache = false;

  let intervals = [];
  return {
    randomUpdates: () => {  
      intervals.push(
        setInterval(() => randomTransaction({ numUpdate: 5, numAdd: 2, numRemove: 2 }), 1000),
      );
    },
    stopUpdates: () => {
      intervals.forEach(clearInterval);
      intervals = [];
    },
    getData: function (request) {
      var results = executeQuery(request);

      return {
        success: true,
        rows: results,      
      };
    },
    getAggValues: function (groupRow) {
      const whereClause = Object.entries(groupRow).map(([field, val]) => `${field} = "${val}"`).join(' AND ');
      const SQL = `
        SELECT SUM(current) as current, SUM(previous) as previous, COUNT(tradeId) as childCount FROM ? WHERE ${whereClause}
      `;
      return alasql(SQL, [data])[0];
    }
  };

  function executeQuery(request) {
    var groupByResult = executeRowGroupQuery(request);
    var rowGroupCols = request.rowGroupCols;
    var groupKeys = request.groupKeys;

    if (!isDoingGrouping(rowGroupCols, groupKeys)) {
      return groupByResult;
    }

    var groupsToUse = request.rowGroupCols.slice(
      groupKeys.length,
      groupKeys.length + 1
    );
    var groupColId = groupsToUse[0].id;
    var childCountResult = executeGroupChildCountsQuery(request, groupColId);

    // add 'childCount' to group results
    return groupByResult.map(function (group) {
      group['childCount'] = childCountResult[group[groupColId]];
      return group;
    });
  }

  function executeRowGroupQuery(request) {
    var groupByQuery = buildGroupBySql(request);

    return alasql(groupByQuery, [data]);
  }

  function executeGroupChildCountsQuery(request, groupId) {
    var SQL = interpolate(
      'SELECT {0} FROM ? pivot (count({0}) for {0})' + whereSql(request),
      [groupId]
    );

    return alasql(SQL, [data])[0];
  }

  function buildGroupBySql(request) {
    return (
      selectSql(request) +
      ' FROM ?' +
      whereSql(request) +
      groupBySql(request) +
      orderBySql(request) +
      limitSql(request)
    );
  }

  function selectSql(request) {
    var rowGroupCols = request.rowGroupCols;
    var valueCols = request.valueCols;
    var groupKeys = request.groupKeys;

    if (isDoingGrouping(rowGroupCols, groupKeys)) {
      var rowGroupCol = rowGroupCols[groupKeys.length];
      var colsToSelect = [rowGroupCol.id];

      valueCols.forEach(function (valueCol) {
        colsToSelect.push(
          valueCol.aggFunc + '(' + valueCol.id + ') AS ' + valueCol.id
        );
      });

      return 'SELECT ' + colsToSelect.join(', ');
    }

    return 'SELECT *';
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

  function groupBySql(request) {
    var rowGroupCols = request.rowGroupCols;
    var groupKeys = request.groupKeys;

    if (isDoingGrouping(rowGroupCols, groupKeys)) {
      var rowGroupCol = rowGroupCols[groupKeys.length];

      return ' GROUP BY ' + rowGroupCol.id;
    }

    return '';
  }

  function orderBySql(request) {
    var sortModel = request.sortModel;

    if (sortModel.length === 0) return '';

    var sorts = sortModel.map(function (s) {
      return s.colId + ' ' + s.sort.toUpperCase();
    });

    return ' ORDER BY ' + sorts.join(', ');
  }

  function limitSql(request) {
    if (request.endRow == undefined || request.startRow == undefined) {
      return '';
    }
    var blockSize = request.endRow - request.startRow;

    return ' LIMIT ' + blockSize + ' OFFSET ' + request.startRow;
  }

  function isDoingGrouping(rowGroupCols, groupKeys) {
    // we are not doing grouping if at the lowest level
    return rowGroupCols.length > groupKeys.length;
  }

  function getLastRowIndex(request, results) {
    if (!results || results.length === 0) {
      return null;
    }
    if (request.endRow == undefined || request.startRow == undefined) {
      return results.length;
    }
    var currentLastRow = request.startRow + results.length;

    return currentLastRow <= request.endRow ? currentLastRow : -1;
  }
}

// IE Workaround - as templates literals are not supported
function interpolate(str, o) {
  return str.replace(/{([^{}]*)}/g, function (a, b) {
    var r = o[b];
    return typeof r === 'string' || typeof r === 'number' ? r : a;
  });
}
