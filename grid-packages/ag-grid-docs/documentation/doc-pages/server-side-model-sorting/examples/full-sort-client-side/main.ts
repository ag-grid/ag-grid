import { Grid, GridOptions, IServerSideDatasource, IServerSideGetRowsParams } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'athlete', minWidth: 220 },
    { field: 'country', minWidth: 200 },
    { field: 'year' },
    { field: 'sport', minWidth: 200 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
  ],

  defaultColDef: {
    flex: 1,
    minWidth: 100,
    sortable: true,
  },

  rowModelType: 'serverSide',
  animateRows: true,
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
    getRows: (params: IServerSideGetRowsParams) => {
      console.log(
        '[Datasource] - rows requested by grid: startRow = ' +
        params.request.startRow +
        ', endRow = ' +
        params.request.endRow
      )

      // get data for request from our fake server
      var response = server.getData()

      // simulating real server call with a 500ms delay
      setTimeout(function () {
        if (response.success) {
          // supply rows for requested block to grid
          params.success({ rowData: response.rows })
        } else {
          params.fail()
        }
      }, 1000)
    },
  }
}

function createFakeServer(allData: any[]) {
  return {
    getData: () => {
      return {
        success: true,
        rows: allData,
      }
    },
  }
}
