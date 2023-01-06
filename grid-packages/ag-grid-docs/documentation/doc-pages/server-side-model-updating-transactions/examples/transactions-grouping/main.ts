import { Grid, ColDef, GridOptions, IServerSideDatasource, IServerSideGetRowsParams, ServerSideTransaction } from '@ag-grid-community/core'

declare var FakeServer: any;
declare var dataObservers: any;

const columnDefs: ColDef[] = [
    { field: 'tradeId' },
    { field: 'portfolio', hide: true, rowGroup: true, enableRowGroup: true },
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
  rowGroupPanelShow: 'always',
  enableCellChangeFlash: true,
  getRowId: (params) => {
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
  isServerSideGroupOpenByDefault: (params) => {
    return params.rowNode.level === 0 && params.rowNode.data.portfolio === 'Income';
  },
  onGridReady: (params) => {
    // setup the fake server
    const server = new FakeServer();

    // create datasource with a reference to the fake server
    const datasource = getServerSideDatasource(server);

    // register the datasource with the grid
    params.api.setServerSideDatasource(datasource);

    const getGroupRouteForData = (data: any) => {
      const rowGroupColumns = gridOptions.columnApi!.getRowGroupColumns();
      return rowGroupColumns.map(col => data[col.getColDef().field!]);
    }

    // register interest in data changes
    dataObservers.push((t: { add?: any[], remove?: any[], update?: any[] }) => {
      if (t.add) {
        t.add.forEach(item => {
          const route = getGroupRouteForData(item);
          params.api.applyServerSideTransactionAsync({
            route,
            add: [item],
          });
        });
      }
      if (t.update) {
        t.update.forEach(item => {
          const route = getGroupRouteForData(item);
          params.api.applyServerSideTransactionAsync({
            route,
            update: [item],
          });
        });
      }
      if (t.remove) {
        t.remove.forEach(item => {
          const route = getGroupRouteForData(item);
          params.api.applyServerSideTransactionAsync({
            route,
            remove: [item],
          });
        });
      }
    });
  },

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

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
  new Grid(gridDiv, gridOptions);
});
