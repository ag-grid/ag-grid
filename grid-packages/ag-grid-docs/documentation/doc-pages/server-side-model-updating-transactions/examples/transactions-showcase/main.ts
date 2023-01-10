import { Grid, ColDef, GridOptions, GetRowIdParams, IServerSideGetRowsParams, ServerSideTransaction, IsServerSideGroupOpenByDefaultParams, ColumnRowGroupChangedEvent } from '@ag-grid-community/core'

declare var registerObserver: any;
declare var FakeServer: any;
declare var fakeServerInstance: any;

const columnDefs: ColDef[] = [
  { field: 'tradeId' },
  {
    field: 'product',
    rowGroup: true,
    enableRowGroup: true,
    hide: true,
  },
  {
    field: 'portfolio',
    rowGroup: true,
    enableRowGroup: true,
    hide: true,
  },
  {
    field: 'book',
    rowGroup: true,
    enableRowGroup: true,
    hide: true,
  },
  { field: 'previous', aggFunc: 'sum' },
  { field: 'current', aggFunc: 'sum' },
];

const gridOptions: GridOptions = {
  columnDefs,
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    resizable: true,
  },
  autoGroupColumnDef: {
    minWidth: 220,
  },
  rowGroupPanelShow: 'always',
  enableCellChangeFlash: true,
  purgeClosedRowNodes: true,

  rowModelType: 'serverSide',
  cacheBlockSize: 100,
  maxBlocksInCache: 2,
  maxConcurrentDatasourceRequests: 3,
  getRowId: getRowId,
  isServerSideGroupOpenByDefault: isServerSideGroupOpenByDefault,
  onColumnRowGroupChanged: onColumnRowGroupChanged,

  // fetch group child count from 'childCount' returned by the server
  getChildCount: (data) => {
    return data ? data.childCount : undefined;
  },
  onGridReady: (params) => {
    disable('#stopUpdates', true);
  
    // setup the fake server
    fakeServerInstance = new FakeServer();
  
    // create datasource with a reference to the fake server
    const datasource = getServerSideDatasource(fakeServerInstance);
  
    // register the datasource with the grid
    params.api.setServerSideDatasource(datasource);
  
    // register interest in data changes
    registerObserver({
      transactionFunc: (t: ServerSideTransaction) => gridOptions.api!.applyServerSideTransactionAsync(t),
      groupedFields: ['product', 'portfolio', 'book'],
    });
  }
};


function startUpdates() {
  fakeServerInstance.randomUpdates();
  disable('#startUpdates', true);
  disable('#stopUpdates', false);
}
function stopUpdates() {
  fakeServerInstance.stopUpdates();
  disable('#stopUpdates', true);
  disable('#startUpdates', false);
}

function disable(id: string, disabled: boolean) {
  document.querySelector<HTMLInputElement>(id)!.disabled = disabled;
}

function getServerSideDatasource(server: any) {
  return {
    getRows: (params: IServerSideGetRowsParams) => {
      console.log('[Datasource] - rows requested by grid: ', params.request);

      const response = server.getData(params.request);

      // adding delay to simulate real server call
      setTimeout(function () {
        if (response.success) {
          // call the success callback
          params.success({
            rowData: response.rows,
            rowCount: response.lastRow,
          });
        } else {
          // inform the grid request failed
          params.fail();
        }
      }, 300);
    },
  };
}

function getRowId(params: GetRowIdParams) {
  var rowId = '';
  if (params.parentKeys && params.parentKeys.length) {
    rowId += params.parentKeys.join('-') + '-';
  }
  const groupCols = params.columnApi.getRowGroupColumns();
  if (groupCols.length > params.level) {
    const thisGroupCol = groupCols[params.level];
    rowId += params.data[thisGroupCol.getColDef().field!] + '-';
  }
  if (params.data.tradeId != null) {
    rowId += params.data.tradeId;
  }
  return rowId;
};

function onColumnRowGroupChanged(event: ColumnRowGroupChangedEvent) {
  const colState = event.columnApi.getColumnState();

  const groupedColumns = colState.filter((state) => state.rowGroup);
  groupedColumns.sort((a, b) => a.rowGroupIndex! - b.rowGroupIndex!);
  const groupedFields = groupedColumns.map((col) => col.colId);

  registerObserver({
    transactionFunc: (t: ServerSideTransaction) => gridOptions.api!.applyServerSideTransactionAsync(t),
    groupedFields: groupedFields.length === 0 ? undefined : groupedFields,
  });
};

function isServerSideGroupOpenByDefault(params: IsServerSideGroupOpenByDefaultParams) {
  let route = params.rowNode.getRoute()
  if (!route) {
    return false
  }
  const routeAsString = route.join(',')
  return [
    'Wool',
    'Wool,Aggressive',
    'Wool,Aggressive,GL-62502',
  ].indexOf(routeAsString) >= 0
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid');
  new Grid(gridDiv!, gridOptions);
});
