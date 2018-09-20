var columnDefs = [
  {headerName: "Year", field: "year", width: 90},
  {headerName: "Gold", field: "gold", width: 140, aggFunc: 'sum'},
  {headerName: "Silver", field: "silver", width: 140, aggFunc: 'sum'},
  {headerName: "Bronze", field: "bronze", width: 140, aggFunc: 'sum'},
  {headerName: "Total", field: "total", width: 140, aggFunc: 'sum'},
  {headerName: "Age", field: "age", width: 120, aggFunc: 'sum'},
  {headerName: "Country", field: "country", width: 180, rowGroupIndex: 0},
  {headerName: "Date", field: "date", width: 110},
  {headerName: "Sport", field: "sport", width: 110}
];

var gridOptions = {
  columnDefs: columnDefs,
  rowData: null,
  rowSelection: 'multiple',
  rowDeselection: true,
  isRowSelectable: function(node) {
    return node.data ? (node.data.year === 2008 || node.data.year === 2004) : false;
  },
  groupSelectsChildren: true,
  groupSelectsFiltered: true,
  enableSorting: true,
  enableFilter: true,
  suppressRowClickSelection: true,
  groupDefaultExpanded: -1,
  autoGroupColumnDef: {
    headerName: "Athlete",
    field: "athlete",
    width: 250,
    cellRenderer:'agGroupCellRenderer',
    cellRendererParams: {
      checkbox: true
    }
  }
};

function filterBy2004() {
  gridOptions.api.setFilterModel({year: ['2008','2012']});
}

function clearFilter() {
  gridOptions.api.setFilterModel(null);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);

  // do http request to get our sample data - not using any framework to keep the example self contained.
  // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
  var httpRequest = new XMLHttpRequest();
  httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json');
  httpRequest.send();
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === 4 && httpRequest.status === 200) {
      var httpResult = JSON.parse(httpRequest.responseText);
      gridOptions.api.setRowData(httpResult);
    }
  };
});