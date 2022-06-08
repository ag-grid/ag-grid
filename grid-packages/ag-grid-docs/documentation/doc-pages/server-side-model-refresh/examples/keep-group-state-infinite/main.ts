import { Grid, GridOptions, IServerSideDatasource, GetRowIdParams } from '@ag-grid-community/core'
declare var FakeServer: any;
const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'country', rowGroup: true, hide: true },
    { field: 'year', rowGroup: true, hide: true },
    { field: 'version' },
    { field: 'gold', aggFunc: 'sum' },
    { field: 'silver', aggFunc: 'sum' },
    { field: 'bronze', aggFunc: 'sum' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    resizable: true,
    sortable: true,
  },
  autoGroupColumnDef: {
    flex: 1,
    minWidth: 280,
    field: 'athlete',
  },
  getRowId: (params: GetRowIdParams) => {
    var data = params.data;
    var parts = []
    if (data.country != null) {
      parts.push(data.country)
    }
    if (data.year != null) {
      parts.push(data.year)
    }
    if (data.id != null) {
      parts.push(data.id)
    }
    return parts.join('-')
  },
  // use the server-side row model
  rowModelType: 'serverSide',
  serverSideInfiniteScroll: true,
  cacheBlockSize: 5,
  maxConcurrentDatasourceRequests: 99,

  enableCellChangeFlash: true,
  suppressAggFuncInHeader: true,

  animateRows: true,
  debug: true,
}

var versionCounter = 1

function refreshCache(route?: string[]) {
  versionCounter++
  var purge = (document.querySelector('#purge') as HTMLInputElement).checked === true
  gridOptions.api!.refreshServerSideStore({ route: route, purge: purge })
}

function getServerSideDatasource(server: any): IServerSideDatasource {
  return {
    getRows: (params) => {
      console.log('[Datasource] - rows requested by grid: ', params.request)

      var response = server.getData(params.request)

      response.rows = response.rows.map(function (item: any) {
        var res: any = {}
        Object.assign(res, item)
        res.version =
          versionCounter + ' - ' + versionCounter + ' - ' + versionCounter

        // for unique-id purposes in the client, we also want to attached
        // the parent group keys
        params.request.groupKeys.forEach(function (groupKey, index) {
          var col = params.request.rowGroupCols[index]
          var field = col.id
          res[field] = groupKey
        })

        return res
      })

      // adding delay to simulate real server call
      setTimeout(function () {
        if (response.success) {
          // call the success callback
          params.success({ rowData: response.rows, rowCount: response.lastRow })
        } else {
          // inform the grid request failed
          params.fail()
        }
      }, 1000)
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
      // give each data item an ID
      data.forEach(function (dataItem: any, index: number) {
        dataItem.id = index
      })

      // setup the fake server with entire dataset
      var fakeServer = new FakeServer(data)

      // create datasource with a reference to the fake server
      var datasource = getServerSideDatasource(fakeServer)

      // register the datasource with the grid
      gridOptions.api!.setServerSideDatasource(datasource)
    })
})
