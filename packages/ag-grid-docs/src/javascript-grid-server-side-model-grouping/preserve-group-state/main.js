var columnDefs = [
  {field: 'id', hide: true},
  {field: 'athlete'},
  {field: 'age'},
  {field: 'country', rowGroup: true, hide: true},
  {field: 'year', rowGroup: true, hide: true},
  {field: 'sport'},
  {field: "gold"},
  {field: "silver"},
  {field: "bronze"}
];

var gridOptions = {
  defaultColDef: {
    width: 250,
    suppressFilter: true
  },
  columnDefs: columnDefs,
  enableColResize: true,
  // use the enterprise row model
  rowModelType: 'serverSide',
  sideBar: {
    toolPanels: [{
      id: 'columns',
      labelDefault: 'Columns',
      labelKey: 'columns',
      iconKey: 'columns',
      toolPanel: 'agColumnsToolPanel',
      toolPanelParams: {
        suppressPivots: true,
        suppressPivotMode: true,
        suppressValues: true
      }
    }]
  },
  cacheBlockSize: 75,
  animateRows: true,
  getRowNodeId: function(item) {
    return item.id;
  },
  onRowGroupOpened: function(params) {
    var id = params.data.id;
    if (params.node.expanded) {
      expandedGroupIds.push(id);
    } else {
      expandedGroupIds = expandedGroupIds.filter(grpId => !grpId.startsWith(id));
    }
  }
};

// This example is initialised with expanded groups
var expandedGroupIds = ["Russia", "Russia-2002", "Ireland", "Ireland-2008"];

function purgeCache() {
  gridOptions.api.purgeServerSideCache([]);
}

var allData;
function addLeafNodeIds(data) {
  allData = data;

  // add id to data
  var idSequence = 0;
  allData.forEach( function(item) {
    item.id = idSequence++;
  });
}


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);

  agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinners.json'}).then(function(data) {

    addLeafNodeIds(data);

    var dataSource = {
      getRows: function (params) {

        // To make the demo look real, wait for 200ms before returning
        setTimeout( function() {

          var response = getMockServerResponse(params.request);

          // call the success callback
          params.successCallback(response.rowsThisBlock, response.lastRow);

          // to preserve group state we expand any previously expanded groups for this block
          response.rowsThisBlock.forEach(row => {
            if (expandedGroupIds.indexOf(row.id) > -1) {
              gridOptions.api.getRowNode(row.id).setExpanded(true);
            }
          });

        }, 200);
      }
    };

    gridOptions.api.setServerSideDatasource(dataSource);
  });
});

// Note this a stripped down mock server implementation which only supports grouping
function getMockServerResponse(request) {
  var groupKeys = request.groupKeys;
  var rowGroupColIds = request.rowGroupCols.map(x => x.id);
  var parentId = groupKeys.length > 0 ? groupKeys.join("") : "";

  var rows = group(allData, rowGroupColIds, groupKeys, parentId);

  var rowsThisBlock = rows.slice(request.startRow, request.endRow);
  var lastRow = rows.length <= request.endRow ? rows.length : -1;

  return {rowsThisBlock, lastRow};
}

function group(data, rowGroupColIds, groupKeys, parentId) {
  var groupColId = rowGroupColIds.shift();
  if (!groupColId) return data;

  var groupedData = _(data).groupBy(x => x[groupColId]).value();

  if (groupKeys.length === 0) {
    return Object.keys(groupedData).map(key => {
      var res = {};

      // Note: the server provides group id's using a simple heuristic based on group keys:
      // i.e. group node ids will be in the following format: 'Russia', 'Russia-2002'
      res['id'] = getGroupId(parentId, key);

      res[groupColId] = key;
      return res;
    });
  }

  return group(groupedData[groupKeys.shift()], rowGroupColIds, groupKeys, parentId);
}

function getGroupId(parentId, key) {
  return parentId ? parentId + "-" + key : key;
}