var columnDefs = [
  { field: "athlete", width: 150, filter: 'agTextColumnFilter'},
  { field: "age", width: 90},
  { field: "country", width: 120},
  { field: "year", width: 90 },
  { field: "date", width: 110 },
  { field: "gold", width: 100, suppressFilter: true },
  { field: "silver", width: 100, suppressFilter: true },
  { field: "bronze", width: 100, suppressFilter: true },
  { field: "total", width: 100, suppressFilter: true }
];

var gridOptions = {
  columnDefs: columnDefs,
  sideBar: {
    toolPanels: [
      {
        id: 'columns',
        labelDefault: 'Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
      },
      {
        id: 'filters',
        labelDefault: 'Filters',
        labelKey: 'filters',
        iconKey: 'filter',
        toolPanel: 'agFiltersToolPanel',
      },
      {
        id: 'customStats',
        labelDefault: 'Custom Stats',
        labelKey: 'customStats',
        iconKey: 'custom-stats',
        toolPanel: 'customStatsToolPanel',
      }
    ],
    defaultToolPanel: 'customStats'
  },
  components: {
    customStatsToolPanel: CustomStatsToolPanel
  },
  enableFilter: true
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);

  // do http request to get our sample data - not using any framework to keep the example self contained.
  // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
  var httpRequest = new XMLHttpRequest();
  httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinners.json');
  httpRequest.send();
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
      var httpResult = JSON.parse(httpRequest.responseText);
      gridOptions.api.setRowData(httpResult);
    }
  };
});