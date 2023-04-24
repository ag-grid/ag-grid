import { Grid, ColDef, GridOptions, IServerSideDatasource } from '@ag-grid-community/core'
declare var FakeServer: any;

let versionCounter: number = 0;
const columnDefs: ColDef[] = [
  { field: 'athlete' },
  { field: 'country' },
  { field: 'date' },
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

function updateSelectedRows() {
  versionCounter += 1;
  const version = versionCounter + ' - ' + versionCounter + ' - ' + versionCounter;
  let nodesToUpdate = gridOptions.api!.getSelectedNodes();
  nodesToUpdate.forEach(node => {
    node.updateData({ ...node.data, version })
  });
}
