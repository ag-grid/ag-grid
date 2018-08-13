var columnDefs = [
  {field: "employeeId", hide: true},
  {field: "employeeName", hide: true},
  {field: "employmentType"},
  {field: "startDate"},
];

var gridOptions = {
  defaultColDef: {
    width: 250,
    suppressFilter: true
  },
  autoGroupColumnDef: {
    cellRendererParams: {
      // checkbox: true,
      // innerRenderer: function(params) {
      //   // display employeeName rather than group key (employeeId)
      //   return params.data.employeeName;
      // }
    }
  },
  rowModelType: 'serverSide',
  treeData: true,
  columnDefs: columnDefs,
  enableColResize: true,
  rowSelection: 'multiple',
  animateRows: true,
  cacheBlockSize: 100,
  maxBlocksInCache: 2,
  icons: {
    groupLoading: '<img src="https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/javascript-grid-server-side-model/spinner.gif" style="width:22px;height:22px;">'
  },
  isServerSideGroup: function (dataItem) {
     // indicate if node is a group
     return dataItem.group;
  },
  getServerSideGroupKey: function (dataItem) {
    // specify which group key to use
    return dataItem.employeeName;
  },
  isRowSelectable: function(rowNode) {
    return rowNode.data && rowNode.data.group;
  },
  onRowSelected: function (params) {
    console.log("onRowSelected: ", params);
  },
  onGridReady: function (params) {
    // initialise with the first group arbitrarily expanded
    setTimeout(function() {
      // expands first node
      params.api.getDisplayedRowAtIndex(0).setExpanded(true);
      // size columns to fit
      params.api.sizeColumnsToFit();
    }, 1500);
  }
};

function purgeCache(route) {
  gridOptions.api.purgeServerSideCache(route);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);

  agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/latest/packages/ag-grid-docs/src/javascript-grid-server-side-model/purging-tree-data/data/data.json'}).then(function(data) {
    var fakeServer = new FakeServer(data);
    var datasource = new ServerSideDatasource(fakeServer);
    gridOptions.api.setServerSideDatasource(datasource);
  });
});