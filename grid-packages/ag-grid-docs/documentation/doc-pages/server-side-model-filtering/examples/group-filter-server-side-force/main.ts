import { Grid, GridOptions, IServerSideDatasource } from '@ag-grid-community/core'
declare var FakeServer: any;
const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'athlete', minWidth: 220, filter: 'agTextColumnFilter' },
    { field: 'country', minWidth: 200, filter: 'agTextColumnFilter' },
    { field: 'year', filter: 'agNumberColumnFilter' },
    { field: 'sport', enableRowGroup: true, rowGroup: true, filter: 'agTextColumnFilter' },
    { field: 'gold', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
    { field: 'silver', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
    { field: 'bronze', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 120,
    resizable: true
  },
  rowGroupPanelShow: 'always',
  autoGroupColumnDef: {
    flex: 1,
    minWidth: 280,
  },

  rowModelType: 'serverSide',
  suppressAggFuncInHeader: true,
  animateRows: true,
  serverSideFilterOnServer: true,
  serverSideFilterAllLevels: true
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
            rowCount: response.lastRow
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
