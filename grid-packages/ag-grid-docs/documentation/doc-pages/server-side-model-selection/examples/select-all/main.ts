import { Grid, GridOptions, GetRowIdParams, IServerSideDatasource, IRowNode } from '@ag-grid-community/core'
declare var FakeServer: any;
const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'year', rowGroup: true, hide: true },
    { field: 'athlete', hide: true },
    { field: 'sport', checkboxSelection: true },
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
  getRowId: (params: GetRowIdParams) => {
    if (params.data.id != null) {
      return (params.parentKeys || []).join('-') + params.data.id;
    }
    const rowGroupCols = params.columnApi.getRowGroupColumns();
    const thisGroupCol = rowGroupCols[params.level];
    return (params.parentKeys || []).join('-') + params.data[thisGroupCol.getColDef().field!];
  },
  autoGroupColumnDef: {
    headerCheckboxSelection: true,
    field: 'athlete',
    flex: 1,
    minWidth: 240,
    cellRendererParams: {
      checkbox: true,
    },
  },

  // use the server-side row model
  rowModelType: 'serverSide',

  // allow multiple row selections
  rowSelection: 'multiple',

  // restrict row selections via checkbox selection
  suppressRowClickSelection: true,

  animateRows: true,
  suppressAggFuncInHeader: true,
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
          params.success({ rowData: response.rows, rowCount: response.lastRow })
        } else {
          // inform the grid request failed
          params.fail()
        }
      }, 200)
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
      // assign a unique ID to each data item
      data.forEach(function (item: any, index: number) {
        item.id = index;
      });

      // setup the fake server with entire dataset
      var fakeServer = new FakeServer(data)

      // create datasource with a reference to the fake server
      var datasource = getServerSideDatasource(fakeServer)

      // register the datasource with the grid
      gridOptions.api!.setServerSideDatasource(datasource)
    })
})
