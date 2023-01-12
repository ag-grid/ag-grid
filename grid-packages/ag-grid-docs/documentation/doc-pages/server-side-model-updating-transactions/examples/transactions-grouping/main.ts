import { Grid, ColDef, GridOptions, GetRowIdParams, GridReadyEvent, IServerSideGetRowsParams, IsServerSideGroupOpenByDefaultParams, ServerSideTransaction } from '@ag-grid-community/core'
import {  } from 'ag-grid-community';

declare var FakeServer: any;
declare var deletePortfolioOnServer: any;
declare var changePortfolioOnServer: any;
declare var createRowOnServer: any;

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
    if (params.level === 0) {
      return params.data.portfolio;
    }
    return params.data.tradeId;
  },
  onGridReady: (params: GridReadyEvent) => {
    // setup the fake server
    const server = new FakeServer();

    // create datasource with a reference to the fake server
    const datasource = getServerSideDatasource(server);

    // register the datasource with the grid
    params.api.setServerSideDatasource(datasource);
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

function deleteAllHybrid() {
  // NOTE: real applications would be better served listening to a stream of changes from the server instead
  const serverResponse: any = deletePortfolioOnServer('Hybrid');
  if (!serverResponse.success) {
    console.warn('Nothing has changed on the server');
    return;
  }

  if (serverResponse) {
    // apply tranaction to keep grid in sync
    gridOptions.api!.applyServerSideTransaction({
      remove: [{ portfolio: 'Hybrid' }],
    });
  }
}

function createOneAggressive() {
  // NOTE: real applications would be better served listening to a stream of changes from the server instead
  const serverResponse: any = createRowOnServer('Aggressive', 'Aluminium', 'GL-1');
  if (!serverResponse.success) {
    console.warn('Nothing has changed on the server');
    return;
  }

  if (serverResponse.newGroupCreated) {
    // if a new group had to be created, reflect in the grid
    gridOptions.api!.applyServerSideTransaction({
      route: [],
      add: [{ portfolio: 'Aggressive' }],
    });
  } else {
    // if the group already existed, add rows to it
    gridOptions.api!.applyServerSideTransaction({
      route: ['Aggressive'],
      add: [serverResponse.newRecord],
    });
  }
}

function updateAggressiveToHybrid() {
  // NOTE: real applications would be better served listening to a stream of changes from the server instead
  const serverResponse: any = changePortfolioOnServer('Aggressive', 'Hybrid');
  if (!serverResponse.success) {
    console.warn('Nothing has changed on the server');
    return;
  }

  // aggressive group no longer exists, so delete the group
  gridOptions.api!.applyServerSideTransaction({
    remove: [{ portfolio: 'Aggressive' }],
  });

  if (serverResponse.newGroupCreated) {
    // hybrid group didn't exist, so just create the new group
    gridOptions.api!.applyServerSideTransaction({
      route: [],
      add: [{ portfolio: 'Hybrid' }],
    });
  } else {
    // hybrid group already existed, add rows to it
    gridOptions.api!.applyServerSideTransaction({
      route: ['Hybrid'],
      add: serverResponse.updatedRecords,
    });
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
  new Grid(gridDiv, gridOptions);
});
