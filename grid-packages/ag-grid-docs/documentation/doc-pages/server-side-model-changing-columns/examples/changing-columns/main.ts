import { Grid, ColDef, GridOptions, IServerSideDatasource, IServerSideGetRowsParams, SetFilterValuesFuncParams } from '@ag-grid-community/core'

declare var FakeServer: any;

var colDefCountry: ColDef = { field: 'country', rowGroup: true }
var colDefYear: ColDef = { field: 'year', rowGroup: true }
var colDefAthlete: ColDef = {
  field: 'athlete',
  filter: 'agSetColumnFilter',
  filterParams: {
    values: getAthletesAsync,
  },
  menuTabs: ['filterMenuTab'],
}
var colDefAge: ColDef = { field: 'age' }
var colDefSport: ColDef = { field: 'sport' }
var colDefGold: ColDef = { field: 'gold', aggFunc: 'sum' }
var colDefSilver: ColDef = { field: 'silver', aggFunc: 'sum' }
var colDefBronze: ColDef = { field: 'bronze', aggFunc: 'sum' }

const columnDefs: ColDef[] = [
  colDefAthlete,
  colDefAge,
  colDefCountry,
  colDefYear,
  colDefSport,
  colDefGold,
  colDefSilver,
  colDefBronze,
]

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    minWidth: 120,
    resizable: true,
    sortable: true,
  },
  autoGroupColumnDef: {
    minWidth: 200,
  },
  // use the server-side row model
  rowModelType: 'serverSide',

  onGridReady: (params) => {
    (document.getElementById('athlete') as HTMLInputElement).checked = true;
    (document.getElementById('age') as HTMLInputElement).checked = true;
    (document.getElementById('country') as HTMLInputElement).checked = true;
    (document.getElementById('year') as HTMLInputElement).checked = true;
    (document.getElementById('sport') as HTMLInputElement).checked = true;
    (document.getElementById('gold') as HTMLInputElement).checked = true;
    (document.getElementById('silver') as HTMLInputElement).checked = true;
    (document.getElementById('bronze') as HTMLInputElement).checked = true;
  },

  animateRows: true,
  suppressAggFuncInHeader: true,
  // debug: true,
}

function getAthletesAsync(params: SetFilterValuesFuncParams) {
  var countries = fakeServer.getAthletes()

  // simulating real server call with a 500ms delay
  setTimeout(function () {
    params.success(countries)
  }, 500)
}

function onBtApply() {
  var cols = []
  if (getBooleanValue('#athlete')) {
    cols.push(colDefAthlete)
  }
  if (getBooleanValue('#age')) {
    cols.push(colDefAge)
  }
  if (getBooleanValue('#country')) {
    cols.push(colDefCountry)
  }
  if (getBooleanValue('#year')) {
    cols.push(colDefYear)
  }
  if (getBooleanValue('#sport')) {
    cols.push(colDefSport)
  }

  if (getBooleanValue('#gold')) {
    cols.push(colDefGold)
  }
  if (getBooleanValue('#silver')) {
    cols.push(colDefSilver)
  }
  if (getBooleanValue('#bronze')) {
    cols.push(colDefBronze)
  }

  gridOptions.api!.setColumnDefs(cols)
}

function getBooleanValue(cssSelector: string) {
  return (document.querySelector(cssSelector) as HTMLInputElement).checked === true
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
      }, 200)
    },
  }
}

var fakeServer: any = undefined;

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(function (data) {
      // setup the fake server with entire dataset
      fakeServer = new FakeServer(data)

      // create datasource with a reference to the fake server
      var datasource: IServerSideDatasource = getServerSideDatasource(fakeServer)

      // register the datasource with the grid
      gridOptions.api!.setServerSideDatasource(datasource)
    })
})
