import { Grid, GridOptions, IServerSideDatasource, IServerSideGetRowsRequest } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    { valueGetter: 'node.rowIndex', minWidth: 60},
    { field: 'athlete', minWidth: 150 },
    { field: 'country', minWidth: 150 },
    { field: 'year' },
    { field: 'sport', minWidth: 120 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
  ],

  defaultColDef: {
    flex: 1,
    minWidth: 80,
  },

  rowModelType: 'serverSide',
  serverSideInfiniteScroll: true
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(function (data) {
      // setup the fake server with entire dataset
      var fakeServer = createFakeServer(data)

      // create datasource with a reference to the fake server
      var datasource = createServerSideDatasource(fakeServer)

      // register the datasource with the grid
      gridOptions.api!.setServerSideDatasource(datasource)
    })
})

function createServerSideDatasource(server: any): IServerSideDatasource {
  return {
    getRows: (params) => {
      console.log(
        '[Datasource] - rows requested by grid: startRow = ' +
        params.request.startRow +
        ', endRow = ' +
        params.request.endRow
      )

      // get data for request from our fake server
      var response = server.getData(params.request)

      // simulating real server call with a 500ms delay
      setTimeout(function () {
        if (response.success) {
          // supply rows for requested block to grid
          params.success({ rowData: response.rows, rowCount: response.lastRow })
        } else {
          params.fail()
        }
      }, 1000)
    },
  }
}

function createFakeServer(allData: any[]) {
  return {
    getData: (request: IServerSideGetRowsRequest) => {
      // in this simplified fake server all rows are contained in an array
      var requestedRows = allData.slice(request.startRow, request.endRow)

      // here we are pretending we don't know the last row until we reach it!
      var lastRow = getLastRowIndex(request, requestedRows)

      return {
        success: true,
        rows: requestedRows,
        lastRow: lastRow,
      }
    },
  }
}

function getLastRowIndex(request: IServerSideGetRowsRequest, results: any[]) {
  if (!results) return undefined
  var currentLastRow = (request.startRow || 0) + results.length

  // if on or after the last block, work out the last row, otherwise return 'undefined'
  return currentLastRow < (request.endRow || 0) ? currentLastRow : undefined
}
