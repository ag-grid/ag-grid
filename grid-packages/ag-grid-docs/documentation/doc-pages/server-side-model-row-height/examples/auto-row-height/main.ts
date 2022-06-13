import { Grid, ColDef, GridOptions, IServerSideDatasource } from '@ag-grid-community/core'
import { getData } from "./data";

declare var FakeServer: any;
const columnDefs: ColDef[] = [
  {
    headerName: 'Group',
    field: 'name',
    rowGroup: true,
    hide: true,
  },
  {
    field: 'autoA',
    wrapText: true,
    autoHeight: true,
    aggFunc: 'last',
  },
  {
    field: 'autoB',
    wrapText: true,
    autoHeight: true,
    aggFunc: 'last',
  },
]

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    resizable: true,
    sortable: true,
  },
  autoGroupColumnDef: {
    flex: 1,
    maxWidth: 200,
  },
  // use the server-side row model
  rowModelType: 'serverSide',
  serverSideInfiniteScroll: true,

  animateRows: true,
  suppressAggFuncInHeader: true,

  onGridReady: (params) => {
    // generate data for example
    var data = getData()

    // setup the fake server with entire dataset
    var fakeServer = new FakeServer(data)

    // create datasource with a reference to the fake server
    var datasource = getServerSideDatasource(fakeServer)

    // register the datasource with the grid
    gridOptions.api!.setServerSideDatasource(datasource)
  },

  // debug: true,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})

function getServerSideDatasource(server: any): IServerSideDatasource {
  return {
    getRows: (params) => {
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
      }, 200)
    },
  }
}


