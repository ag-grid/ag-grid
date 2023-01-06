import { Grid, ColDef, GridOptions, IServerSideGetRowsParams, ServerSideTransaction } from '@ag-grid-community/core'

declare var FakeServer: any;
declare var dataObservers: any;
declare var removeRow: any;
declare var addRow: any;
declare var updateRow: any;

const columnDefs: ColDef[] = [
    { field: 'tradeId' },
    { field: 'portfolio' },
    { field: 'book' },    
    { field: 'previous' },
    { field: 'current' },
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
  getRowId: (params) => String(params.data.tradeId),
  onGridReady: (params) => {
    // setup the fake server
    const server = new FakeServer();

    // create datasource with a reference to the fake server
    const datasource = getServerSideDatasource(server);

    // register the datasource with the grid
    params.api.setServerSideDatasource(datasource);

    // register interest in data changes
    dataObservers.push((t: ServerSideTransaction) => {
      const result = params.api.applyServerSideTransaction(t);
      console.log('[Example] - Applied transaction:', t, 'Result:', result);
    });
  },

  rowSelection: 'single',
  rowModelType: 'serverSide',
  cacheBlockSize: 100,
  maxBlocksInCache: 2,
  blockLoadDebounceMillis: 1500,
  maxConcurrentDatasourceRequests: 3,
};

function addAboveSelectedRow() {
  const selectedRows = gridOptions.api!.getSelectedNodes();
  if (selectedRows.length === 0) {
    console.warn('[Example] No row selected.');
    return;
  }

  const rowIndex = selectedRows[0].rowIndex;
  addRow(rowIndex);
}

function updateSelectedRow() {
  const selectedRows = gridOptions.api!.getSelectedNodes();
  if (selectedRows.length === 0) {
    console.warn('[Example] No row selected.');
    return;
  }

  const rowId = selectedRows[0].id;
  updateRow(rowId);
}

function removeSelectedRow() {
  const selectedRows = gridOptions.api!.getSelectedNodes();
  if (selectedRows.length === 0) {
    console.warn('[Example] No row selected.');
    return;
  }

  const rowId = selectedRows[0].id;
  removeRow(rowId);
}

const getServerSideDatasource = (server: any) => {
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

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
  new Grid(gridDiv, gridOptions);
});