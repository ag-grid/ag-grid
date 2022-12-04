import { Grid, GridOptions, IServerSideDatasource, IServerSideGetRowsRequest } from '@ag-grid-community/core'

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { headerName: 'Index', valueGetter: 'node.rowIndex', minWidth: 100},
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
  serverSideInitialRowCount: 5500,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(function (data) {
      // setup the fake server with entire dataset
      var fakeServer = createFakeServer(data);

      // create datasource with a reference to the fake server
      var datasource = createServerSideDatasource(fakeServer);

      // register the datasource with the grid
      gridOptions.api!.setServerSideDatasource(datasource);

      // scroll the grid down until row 5000 is at the top of the viewport
      gridOptions.api!.ensureIndexVisible(5000, 'top');
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

      return {
        success: true,
        rows: requestedRows,
        lastRow: allData.length,
      }
    },
  }
}