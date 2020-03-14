var gridOptions = {
  columnDefs: [
    { field: "country", rowGroup: true, hide: true },
    { field: "year", maxWidth: 100 },
    { field: "gold", aggFunc: 'sum' },
    { field: "silver", aggFunc: 'sum' },
    { field: "bronze", aggFunc: 'sum' },
    { field: "date" },
    { field: "sport" },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    sortable: true,
    filter: true,
  },
  autoGroupColumnDef: {
    headerName: "Athlete",
    field: "athlete",
    minWidth: 250,
    cellRenderer:'agGroupCellRenderer',
    cellRendererParams: {
      checkbox: true
    },
  },
  rowSelection: 'multiple',
  rowDeselection: true,
  groupSelectsChildren: true,
  groupSelectsFiltered: true,
  suppressRowClickSelection: true,
  groupDefaultExpanded: -1,
  isRowSelectable: function(node) {
    return node.data ? (node.data.year === 2008 || node.data.year === 2004) : false;
  },
};

function filterBy2004() {
    gridOptions.api.setFilterModel({
        year: {
            type: 'set',
            values: ['2008','2012']
        }
    });
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
  httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json');
  httpRequest.send();
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === 4 && httpRequest.status === 200) {
      var httpResult = JSON.parse(httpRequest.responseText);
      gridOptions.api.setRowData(httpResult);
    }
  };
});
