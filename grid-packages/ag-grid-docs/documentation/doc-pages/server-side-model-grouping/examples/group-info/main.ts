import { Grid, GridOptions, IServerSideDatasource, ServerSideGroupLevelParams, GetServerSideGroupLevelParamsParams } from '@ag-grid-community/core'
declare var FakeServer: any;
const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'country', enableRowGroup: true, rowGroup: true },
    { field: 'sport', enableRowGroup: true, rowGroup: true },
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
  rowGroupPanelShow: 'always',
  autoGroupColumnDef: {
    flex: 1,
    minWidth: 280,
  },

  rowModelType: 'serverSide',

  getServerSideGroupLevelParams: (params: GetServerSideGroupLevelParamsParams): ServerSideGroupLevelParams => {
    var noGroupingActive = params.rowGroupColumns.length == 0
    var res: ServerSideGroupLevelParams;
    if (noGroupingActive) {
      res = {
        // infinite scrolling
        infiniteScroll: true,
        // 100 rows per block
        cacheBlockSize: 100,
        // purge blocks that are not needed
        maxBlocksInCache: 2,
      }
    } else {
      var topLevelRows = params.level == 0
      res = {
        infiniteScroll: topLevelRows ? false : true,
        cacheBlockSize: params.level == 1 ? 5 : 2,
        maxBlocksInCache: -1, // never purge blocks
      }
    }

    console.log('############## NEW STORE ##############')
    console.log(
      'getServerSideGroupLevelParams, level = ' +
      params.level +
      ', result = ' +
      JSON.stringify(res)
    )

    return res
  },

  suppressAggFuncInHeader: true,

  animateRows: true,
}

function onBtGroupState() {
  var storeState = gridOptions.api!.getServerSideGroupLevelState()
  console.log('Store States:')
  storeState.forEach(function (state, index) {
    console.log(
      index +
      ' - ' +
      JSON.stringify(state).replace(/"/g, '').replace(/,/g, ', ')
    )
  })
}

function getServerSideDatasource(server: any): IServerSideDatasource {
  return {
    getRows: (params) => {
      console.log('[Datasource] - rows requested by grid: ', params.request)

      var response = server.getData(params.request)

      // adding delay to simulate real server call
      setTimeout(function () {
        if (response.success) {
          // call the success callback
          params.success({
            rowData: response.rows,
            rowCount: response.lastRow,
            groupLevelInfo: {
              lastLoadedTime: new Date().toLocaleString(),
              randomValue: Math.random(),
            },
          })
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
