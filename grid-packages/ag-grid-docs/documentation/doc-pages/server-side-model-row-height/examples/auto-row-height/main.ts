import { ColDef, GridOptions, IServerSideDatasource } from '@ag-grid-community/core'
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
  serverSideStoreType: 'partial',

  animateRows: true,
  suppressAggFuncInHeader: true,

  onGridReady: function () {
    // generate data for example
    var data = createRowData()

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
  var gridDiv = document.querySelector('#myGrid')
  new agGrid.Grid(gridDiv, gridOptions)
})

function getServerSideDatasource(server: any): IServerSideDatasource {
  return {
    getRows: function (params) {
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

function createRowData() {
  var latinSentence =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit'

  function generateRandomSentence() {
    return latinSentence.slice(0, Math.floor(Math.random() * 100)) + '.'
  }

  var rowData = []
  for (var i = 0; i < 10; i++) {
    for (var j = 0; j < 50; j++) {
      rowData.push({
        name: 'Group ' + j,
        autoA: generateRandomSentence(),
        autoB: generateRandomSentence(),
      })
    }
  }
  return rowData
}
