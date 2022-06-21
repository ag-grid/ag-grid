import { Grid, GetServerSideGroupLevelParamsParams, GetRowIdParams, GridOptions, IServerSideDatasource, IServerSideGetRowsParams, IsServerSideGroupOpenByDefaultParams, ServerSideGroupLevelParams } from '@ag-grid-community/core'
declare var FakeServer: any;
const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'country', enableRowGroup: true, rowGroup: true, hide: true },
    { field: 'sport', enableRowGroup: true, rowGroup: true, hide: true },
    { field: 'year', minWidth: 100 },
    { field: 'gold', aggFunc: 'sum' },
    { field: 'silver', aggFunc: 'sum' },
    { field: 'bronze', aggFunc: 'sum' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 120,
    resizable: true,
    sortable: true,
  },
  autoGroupColumnDef: {
    flex: 1,
    minWidth: 280,
  },
  getServerSideGroupLevelParams: (params: GetServerSideGroupLevelParamsParams): ServerSideGroupLevelParams => {
    var res: ServerSideGroupLevelParams = {
      storeType: params.level == 0 ? 'partial' : 'full',
    }
    return res
  },
  rowModelType: 'serverSide',
  rowSelection: 'multiple',

  isServerSideGroupOpenByDefault: isServerSideGroupOpenByDefault,
  suppressAggFuncInHeader: true,
  animateRows: true,
  getRowId: getRowId
}

function getRowId(params: GetRowIdParams) {
  return Math.random().toString();
}

function isServerSideGroupOpenByDefault(params: IsServerSideGroupOpenByDefaultParams) {
  var route = params.rowNode.getRoute()
  if (!route) {
    return false
  }

  var routeAsString = route.join(',')

  var routesToOpenByDefault = [
    'Zimbabwe',
    'Zimbabwe,Swimming',
    'United States,Swimming',
  ]

  return routesToOpenByDefault.indexOf(routeAsString) >= 0
}

function onBtRouteOfSelected() {
  var selectedNodes = gridOptions.api!.getSelectedNodes()
  selectedNodes.forEach(function (rowNode, index) {
    var route = rowNode.getRoute()
    var routeString = route ? route.join(',') : undefined
    console.log('#' + index + ', route = [' + routeString + ']')
  })
}

function getServerSideDatasource(server: any): IServerSideDatasource {
  return {
    getRows: (params: IServerSideGetRowsParams) => {
      console.log('[Datasource] - rows requested by grid: ', params.request)

      var response = server.getData(params.request)

      // adding delay to simulate real server call
      setTimeout(function () {
        if (response.success) {
          // call the success callback
          params.success({ rowData: response.rows, rowCount: response.lastRow })
        } else {
          // inform the grid request failed
          params.fail()
        }
      }, 400)
    },
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(function (data) {

      // setup the fake server with entire dataset
      var fakeServer = new FakeServer(data)

      // create datasource with a reference to the fake server
      var datasource = getServerSideDatasource(fakeServer)

      // register the datasource with the grid
      gridOptions.api!.setServerSideDatasource(datasource)
    })
})
