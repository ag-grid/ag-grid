import { Grid, ColDef, ColGroupDef, ColumnApi, GridOptions, IServerSideDatasource, IServerSideGetRowsRequest, ColumnGroup } from '@ag-grid-community/core'
declare var FakeServer: any;
const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'country', rowGroup: true },
    { field: 'sport', rowGroup: true },
    { field: 'year', pivot: true }, // pivot on 'year'
    { field: 'total', aggFunc: 'sum' },
    { field: 'gold', aggFunc: 'sum' },
    { field: 'silver', aggFunc: 'sum' },
    { field: 'bronze', aggFunc: 'sum' },
  ],
  defaultColDef: {
    width: 150,
    resizable: true,
    sortable: true,
  },
  autoGroupColumnDef: {
    minWidth: 200,
  },

  // use the server-side row model
  rowModelType: 'serverSide',

  // enable pivoting
  pivotMode: true,

  animateRows: true,

  processPivotResultColDef: (colDef: ColDef) => {
    const pivotValueColumn = colDef.pivotValueColumn;

    if (!pivotValueColumn) return;

    // if column is not the total column, it should only be shown when expanded.
    // this will enable expandable column groups.
    if (pivotValueColumn.getColId() !== 'total') {
      colDef.columnGroupShow = 'open';
    }
  }
}

function expand(key?: string, open = false) {
  if (key) {
    gridOptions.columnApi!.setColumnGroupState([{ groupId: key, open: open }]);
    return;
  }

  const existingState = gridOptions.columnApi!.getColumnGroupState();
  const expandedState = existingState.map((s: { groupId: string, open: boolean }) => ({ groupId: s.groupId, open: open }));
  gridOptions.columnApi!.setColumnGroupState(expandedState);
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

function getServerSideDatasource(server: any): IServerSideDatasource {
  return {
    getRows: (params) => {
      var request = params.request

      console.log('[Datasource] - rows requested by grid: ', params.request)

      var response = server.getData(request)

      // simulating real server call with a 500ms delay
      setTimeout(function () {
        if (response.success) {
          // supply data to grid
          params.success({
            rowData: response.rows,
            rowCount: response.lastRow,
            pivotResultFields: response.pivotFields,
          });
        } else {
          params.fail()
        }
      }, 500)
    },
  }
}
