var columnDefs = [
  {field: "employeeId", hide: true},
  {field: "employeeName", hide: true},
  {field: "jobTitle"},
  {field: "employmentType"}
];

var gridOptions = {
  defaultColDef: {
    width: 240,
    suppressFilter: true
  },
  autoGroupColumnDef: {
    cellRendererParams: {
      innerRenderer: function(params) {
        // display employeeName rather than group key (employeeId)
        return params.data.employeeName;
      }
    }
  },
  rowModelType: 'serverSide',
  treeData: true,
  columnDefs: columnDefs,
  enableColResize: true,
  animateRows: true,
  isServerSideGroup: function (dataItem) {
     // indicate if node is a group
     return dataItem.group;
  },
  getServerSideGroupKey: function (dataItem) {
    // specify which group key to use
    return dataItem.employeeId;
  },
  onGridReady: function (params) {
    // initialise with the first group arbitrarily expanded
    setTimeout(function() {
      params.api.getDisplayedRowAtIndex(0).setExpanded(true);
    }, 1500);
    setTimeout(function() {
      // expands second node
      params.api.getDisplayedRowAtIndex(1).setExpanded(true);
    }, 2000);
  }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);

  agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/latest/packages/ag-grid-docs/src/javascript-grid-server-side-model-tree-data/tree-data/data/data.json'}).then(function(data) {
    var fakeServer = new FakeServer(data);
    var datasource = new ServerSideDatasource(fakeServer);
    gridOptions.api.setServerSideDatasource(datasource);
  });
});