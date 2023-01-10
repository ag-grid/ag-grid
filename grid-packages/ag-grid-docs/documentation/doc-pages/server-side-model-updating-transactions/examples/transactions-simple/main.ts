import { Grid, ColDef, GridOptions, GetRowIdParams, IServerSideGetRowsParams, ServerSideTransaction, ServerSideTransactionResult } from '@ag-grid-community/core'
declare var FakeServer: any;
declare var createTradeId: any;

const columnDefs: ColDef[] = [
    { field: 'tradeId' },
    { field: 'portfolio' },
    { field: 'book' },    
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
  getRowId: (params: GetRowIdParams) => `${params.data.tradeId}`,
  enableCellChangeFlash: true,
  rowSelection: 'single',
  rowModelType: 'serverSide',
};

function addRow() {
  const selectedRows = gridOptions.api!.getSelectedNodes();
  if (selectedRows.length === 0) {
    console.warn('[Example] No row selected.');
    return;
  }

  const rowIndex = selectedRows[0].rowIndex;
  const transaction: ServerSideTransaction = {
    addIndex: rowIndex != null ? rowIndex : undefined,
    add: [createRow()],
  };

  const result = gridOptions.api!.applyServerSideTransaction(transaction);
  logResults(transaction, result);
}

function updateRow() {
  const selectedRows = gridOptions.api!.getSelectedNodes();
  if (selectedRows.length === 0) {
    console.warn('[Example] No row selected.');
    return;
  }

  const transaction: ServerSideTransaction = {
    update: [{ ...selectedRows[0].data, current: getNewValue() }],
  };

  const result = gridOptions.api!.applyServerSideTransaction(transaction);
  logResults(transaction, result);
}

function removeRow() {
  const selectedRows = gridOptions.api!.getSelectedNodes();
  if (selectedRows.length === 0) {
    console.warn('[Example] No row selected.');
    return;
  }

  const transaction: ServerSideTransaction = { remove: [selectedRows[0].data] };
  const result = gridOptions.api!.applyServerSideTransaction(transaction);
  logResults(transaction, result);
}

function logResults(transaction: ServerSideTransaction, result?: ServerSideTransactionResult) {
  console.log('[Example] - Applied transaction:', transaction, 'Result:', result);
}

function getNewValue() {
  return  Math.floor(Math.random() * 100000) + 100;
}

function createRow() {
  return {
    portfolio: 'Aggressive',
    product: 'Aluminium',
    book: 'GL-62472',
    tradeId: createTradeId(),
    current: getNewValue(),
  };
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

  // setup the fake server
  const server = new FakeServer();

  // create datasource with a reference to the fake server
  const datasource = getServerSideDatasource(server);

  // register the datasource with the grid
  gridOptions.api!.setServerSideDatasource(datasource);
});