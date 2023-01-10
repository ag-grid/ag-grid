import { Grid, ColDef, GridOptions, GetRowIdParams, GridReadyEvent, IServerSideGetRowsParams, ServerSideTransaction } from '@ag-grid-community/core'

declare var FakeServer: any;
declare var dataObservers: any;
declare var randomUpdates: any;

const columnDefs: ColDef[] = [
    { field: 'tradeId' },
    { field: 'portfolio' },
    { field: 'book' },    
    { field: 'previous' },
    { field: 'current' },
    {
      field: 'lastUpdated',
      wrapHeaderText: true,
      autoHeaderHeight: true,
      valueFormatter: (params) => {
        const ts = params.data!.lastUpdated;
        if (ts) {
          const hh_mm_ss = ts.toLocaleString().split(' ')[1];   
          const SSS = ts.getMilliseconds();       
          return `${hh_mm_ss}:${SSS}`;
        }
        return '';
      },
    },
    { field: 'updateCount' },
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
  enableCellChangeFlash: true,
  getRowId: (params: GetRowIdParams) => {  
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
  },
  onGridReady: onGridReady,
  asyncTransactionWaitMillis: 1000,
  rowModelType: 'serverSide',
  cacheBlockSize: 100,
  maxBlocksInCache: 2,
  blockLoadDebounceMillis: 1500,
  maxConcurrentDatasourceRequests: 3,
};

function getServerSideDatasource(server: any) {
  return {
    getRows: (params: IServerSideGetRowsParams) => {
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

let interval: number;

function startUpdates() {
  interval = setInterval(() => randomUpdates({ numUpdate: 10, numAdd: 1, numRemove: 1 }), 10);
  disable('#stopUpdates', false);
  disable('#startUpdates', true);
}

function stopUpdates() {
  if (interval !== undefined) {
    clearInterval(interval);
  }
  disable('#stopUpdates', true);
  disable('#startUpdates', false);
}

function disable(id: string, disabled: boolean) {
  document.querySelector<HTMLInputElement>(id)!.disabled = disabled;
}

function onGridReady(event: GridReadyEvent) {
  disable('#stopUpdates', true);

  // setup the fake server
  const server = new FakeServer();

  // create datasource with a reference to the fake server
  const datasource = getServerSideDatasource(server);

  // register the datasource with the grid
  event.api.setServerSideDatasource(datasource);

  // register interest in data changes
  dataObservers.push((t: ServerSideTransaction) => {
    event.api.applyServerSideTransactionAsync(t);
  });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
  new Grid(gridDiv, gridOptions);
});
