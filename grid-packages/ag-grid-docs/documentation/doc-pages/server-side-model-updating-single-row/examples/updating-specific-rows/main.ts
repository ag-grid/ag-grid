import { Grid, ColDef, GridOptions, IServerSideDatasource } from '@ag-grid-community/core'
declare var FakeServer: any;

let versionCounter: number = 0;
const columnDefs: ColDef[] = [
  { field: 'athlete' },
  { field: 'date' },
  { field: 'country' },
  { field: 'version' },
]

const gridOptions: GridOptions = {
  defaultColDef: {
    flex: 1,
    resizable: true,
  },
  columnDefs: columnDefs,
  rowSelection: 'multiple',
  // use the enterprise row model
  rowModelType: 'serverSide',
  cacheBlockSize: 75,
  animateRows: true,
  enableCellChangeFlash: true,
  getRowId: (params) => `${params.data.athlete}-${params.data.date}`,
}

function updateRows (athlete?: string, date?: string) {
  versionCounter += 1;
  gridOptions.api!.forEachNode(rowNode => {
    if (athlete != null && rowNode.data.athlete !== athlete) {
      return;
    }

    if (date != null && rowNode.data.date !== date) {
      return;
    }

    // arbitrarily update some data
    const updated = rowNode.data;
    updated.version = versionCounter + ' - ' + versionCounter + ' - ' + versionCounter;

    // directly update data in rowNode
    rowNode.updateData(updated);
});
}

const getServerSideDatasource = (server: any): IServerSideDatasource => {
  return {
    getRows: (params) => {
      console.log('[Datasource] - rows requested by grid: ', params.request);

      const response = server.getData(params.request);

      const dataWithVersion = response.rows.map((rowData: any) => {
        return {
          ...rowData,
          version: versionCounter + ' - ' + versionCounter + ' - ' + versionCounter,
        };
      });

      // adding delay to simulate real server call
      setTimeout(() => {
        if (response.success) {
          // call the success callback
          params.success({ rowData: dataWithVersion, rowCount: response.lastRow });
        } else {
          // inform the grid request failed
          params.fail();
        }
      }, 1000);
    },
  }
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
