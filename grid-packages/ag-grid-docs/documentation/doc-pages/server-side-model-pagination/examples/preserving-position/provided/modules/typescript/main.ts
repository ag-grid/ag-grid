import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";
import { FirstDataRenderedEvent, Grid, GridOptions, IServerSideDatasource, BodyScrollEndEvent, PaginationChangedEvent } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ServerSideRowModelModule, RowGroupingModule, MenuModule, ColumnsToolPanelModule]);

declare var FakeServer: any;

let targetRow = 4500;
let targetPage = 4;
let initialRowCount = 5000;
let initialisedPosition = false;

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'index' },
    { field: 'country' },
    { field: 'athlete', minWidth: 190 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
  ],

  defaultColDef: {
    flex: 1,
    minWidth: 90,
    resizable: true,
    sortable: true,
  },

  autoGroupColumnDef: {
    flex: 1,
    minWidth: 180,
  },

  rowModelType: 'serverSide',

  pagination: true,
  paginationPageSize: 1000,
  serverSideInitialRowCount: initialRowCount,

  onFirstDataRendered: (event: FirstDataRenderedEvent<IOlympicData>) => {
    event.api.paginationGoToPage(targetPage);
    event.api.ensureIndexVisible(targetRow, 'top');
    initialisedPosition = true;
  },

  onBodyScrollEnd: (event: BodyScrollEndEvent) => {
    if (!initialisedPosition) {
      return;
    }
    targetRow = event.api.getFirstVisibleRowIndex();
    initialRowCount = event.api.getDisplayedRowCount();
  },

  onPaginationChanged: (event: PaginationChangedEvent) => {
    if (!initialisedPosition) {
      return;
    }
    targetPage = event.api.paginationGetCurrentPage();
  },

  suppressAggFuncInHeader: true,

  animateRows: true,
}

function resetGrid() {
  const api = gridOptions.api;
  if (api) {
    initialisedPosition = false;
    api.destroy();
    createGrid();
  }
}

createGrid();

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


function createGrid() {
  // setup the grid after the page has finished loading
  gridOptions.serverSideInitialRowCount = initialRowCount;

  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => data.map((item: IOlympicData, index: number) => ({ ...item, index })))
    .then(function (data) {
      // setup the fake server with entire dataset
      var fakeServer = new FakeServer(data)

      // create datasource with a reference to the fake server
      var datasource = getServerSideDatasource(fakeServer)

      // register the datasource with the grid
      gridOptions.api!.setServerSideDatasource(datasource);
    });
}


if (typeof window !== 'undefined') {
  // Attach external event handlers to window so they can be called from index.html
  (<any>window).resetGrid = resetGrid;
}