let targetRow = 4500;
let targetPage = 4;
let initialRowCount = 5000;
let initialisedPosition = false;

const gridOptions = {
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

  onFirstDataRendered: (event) => {
    event.api.paginationGoToPage(targetPage);
    event.api.ensureIndexVisible(targetRow, 'top');
    initialisedPosition = true;
  },

  onBodyScrollEnd: (event) => {
    if (!initialisedPosition) {
      return;
    }

    targetRow = event.api.getFirstVisibleRowIndex();
    initialRowCount = event.api.getDisplayedRowCount();
  },

  onPaginationChanged: (event) => {
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
    api.destroy();
    createGrid();
  }
}

function getServerSideDatasource(server) {
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
  initialisedPosition = false;
  var gridDiv = document.querySelector('#myGrid')
  new agGrid.Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => data.map((item, index) => ({ ...item, index })))
    .then(function (data) {
      // setup the fake server with entire dataset
      var fakeServer = new FakeServer(data)

      // create datasource with a reference to the fake server
      var datasource = getServerSideDatasource(fakeServer)

      // register the datasource with the grid
      gridOptions.api.setServerSideDatasource(datasource);
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', createGrid);
