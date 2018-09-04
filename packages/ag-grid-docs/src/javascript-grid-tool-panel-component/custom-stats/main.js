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
        component: 'agColumnsToolPanel',
      },
      {
        id: 'filters',
        labelDefault: 'Filters',
        labelKey: 'filters',
        iconKey: 'filter',
        component: 'agFiltersToolPanel',
      },
      {
        id: 'customStats',
        labelDefault: 'Custom Stats',
        labelKey: 'customStats',
        iconKey: 'custom-stats',
        component: 'customStatsToolPanel',
      }
    ],
    defaultToolPanel: 'customStats'
  },
  components: {
    customStatsToolPanel: getCustomStatsToolPanel()
  },
  enableFilter: true
};

function getCustomStatsToolPanel() {

  function CustomStatsToolPanel() {}

  CustomStatsToolPanel.prototype.init = function (params) {
    this.eGui = document.createElement('div');
    this.eGui.style.textAlign = "center";

    // calculate stats when new rows loaded, i.e. onModelUpdated
    var renderStats = () => this.eGui.innerHTML = calculateStats(params);
    params.api.addEventListener('modelUpdated', renderStats);
  };

  CustomStatsToolPanel.prototype.getGui = function () {
    return this.eGui;
  };

  function calculateStats(params) {
    var numGold = 0, numSilver = 0, numBronze = 0;
    params.api.forEachNode(function (rowNode) {
      var data = rowNode.data;
      if (data.gold) numGold += data.gold;
      if (data.silver) numSilver += data.silver;
      if (data.bronze) numBronze += data.bronze;
    });

    return `<span>
               <h2><i class="fa fa-calculator"></i> Custom Stats</h2>
               <dl style="font-size: large; padding: 30px 40px 10px 30px">
                 <dt style="padding-bottom: 15px">Total Medals: <b>${numGold + numSilver + numBronze}</b></dt>
                 <dt style="padding-bottom: 15px">Total Gold: <b>${numGold}</b></dt>
                 <dt style="padding-bottom: 15px">Total Silver: <b>${numSilver}</b></dt>
                 <dt style="padding-bottom: 15px">Total Bronze: <b>${numBronze}</b></dt>          
               </dl>
            </span>`;
  };

  return CustomStatsToolPanel;
}

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