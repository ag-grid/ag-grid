import { Grid, ColDef, GridOptions, GetRowIdParams, GridReadyEvent, IServerSideGetRowsParams, IsServerSideGroupOpenByDefaultParams, ServerSideTransaction } from '@ag-grid-community/core'
import {  } from 'ag-grid-community';

declare var FakeServer: any;
declare var dataObservers: any;
declare var deleteWhere: any;
declare var createRecord: any;
declare var updatePortfolio: any;

const columnDefs: ColDef[] = [
    { field: 'tradeId' },
    { field: 'portfolio', hide: true, rowGroup: true },
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
  isServerSideGroupOpenByDefault: (params: IsServerSideGroupOpenByDefaultParams) => {
    return params.rowNode.key === 'Aggressive' || params.rowNode.key === 'Hybrid';
  },
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
  onGridReady: (params: GridReadyEvent) => {
    // setup the fake server
    const server = new FakeServer();

    // create datasource with a reference to the fake server
    const datasource = getServerSideDatasource(server);

    // register the datasource with the grid
    params.api.setServerSideDatasource(datasource);

    // register interest in data changes
    dataObservers.push((t: ServerSideTransaction) => {
      const response = params.api.applyServerSideTransaction(t);
      console.log('[Example] Applied transaction:', t, 'Result:', response);
    });
  },

  rowModelType: 'serverSide',
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

function deleteAllAggressive() {
  deleteWhere((record: any) => record.portfolio === 'Aggressive');
}

function deleteAllHybrid() {
  deleteWhere((record: any) => record.portfolio === 'Hybrid');
}

function createOneAggressive() {
  createRecord('Aluminium', 'Aggressive', 'GL-1');
}

function updateAggressiveToHybrid() {
  updatePortfolio('Aggressive', 'Hybrid')
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
  new Grid(gridDiv, gridOptions);
});
