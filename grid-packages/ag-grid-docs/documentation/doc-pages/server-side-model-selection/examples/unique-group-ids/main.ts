import { Grid, GridOptions, IServerSideDatasource, GetRowIdParams } from '@ag-grid-community/core'
declare var FakeServer: any;
const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'country', rowGroup: true, hide: true },
    { field: 'sport', rowGroup: true, hide: true },
    { headerName: 'Row ID', valueGetter: 'node.id', sortable: false },
    { field: 'gold', aggFunc: 'sum' }
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 120,
    resizable: true,
    sortable: true,
  },
  autoGroupColumnDef: {
    flex: 1,
    minWidth: 280,
    field: 'athlete',
  },
  getRowId: (params: GetRowIdParams) => {
    // if leaf level, we have ID
    if (params.data.id != null) {
      return params.data.id;
    }

    // this array will contain items that will compose the unique key
    var parts = [];

    // if parent groups, add the value for the parent group
    if (params.parentKeys) {
      parts.push(...params.parentKeys);
    }

    // it we are a group, add the value for this level's group
    var rowGroupCols = params.columnApi.getRowGroupColumns();
    var thisGroupCol = rowGroupCols[params.level];
    if (thisGroupCol) {
      parts.push(params.data[thisGroupCol.getColDef().field!]);
    }

    return parts.join('-');
  },

  // use the server-side row model
  rowModelType: 'serverSide',
  serverSideInfiniteScroll: true,

  // allow multiple row selections
  rowSelection: 'multiple',

  suppressAggFuncInHeader: true,

  animateRows: true
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
      }, 300)
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

      // give an ID to each piece of row data
      data.forEach((item: any, index: number) => item.id = index);

      // setup the fake server with entire dataset
      var fakeServer = new FakeServer(data)

      // create datasource with a reference to the fake server
      var datasource = getServerSideDatasource(fakeServer)

      // register the datasource with the grid
      gridOptions.api!.setServerSideDatasource(datasource)
    })
})
