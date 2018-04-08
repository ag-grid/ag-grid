var columnDefs = [
  // group cell renderer needed for expand / collapse icons
  {field: 'name', cellRenderer:'agGroupCellRenderer'},
  {field: 'account'},
  {field: 'calls'},
  {field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'"}
];

var gridOptions = {
  columnDefs: columnDefs,
  masterDetail: true,
  detailRowHeight: 260,
  detailCellRenderer: "myDetailCellRenderer",
  components: {
    myDetailCellRenderer: DetailCellRenderer
  },
  onGridReady: function(params) {
    params.api.sizeColumnsToFit();

    // arbitrarily expand a row for presentational purposes
    setTimeout(function() {
      var rowCount = 0;
      params.api.forEachNode(function (node) {
        node.setExpanded(rowCount++ === 1);
      });
    }, 500);
  }
};

function printDetailGridInfo() {
  console.log("Currently registered detail grid's: ");
  gridOptions.api.forEachDetailGridInfo(function(detailGridInfo) {
    console.log(detailGridInfo);
  });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);

  agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/latest/src/javascript-grid-master-detail/custom-detail-with-grid/data/data.json'}).then(function(data) {
    gridOptions.api.setRowData(data);
  });
});