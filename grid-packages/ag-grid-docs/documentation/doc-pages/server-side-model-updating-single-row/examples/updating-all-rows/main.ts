import { Grid, ColDef, GridOptions, IServerSideDatasource } from '@ag-grid-community/core'
declare var FakeServer: any;

let versionCounter: number = 0;
const columnDefs: ColDef[] = [
  { field: 'id', hide: true },
  { field: 'athlete' },
  { field: 'country' },
  { field: 'version' },
  { field: 'gold' },
  { field: 'silver' },
  { field: 'bronze' },
]

const gridOptions: GridOptions = {
  defaultColDef: {
    width: 250,
    resizable: true,
  },
  columnDefs: columnDefs,
  rowSelection: 'multiple',
  // use the enterprise row model
  rowModelType: 'serverSide',
  cacheBlockSize: 75,
  animateRows: true,
  enableCellChangeFlash: true,
}

function setRows() {
  versionCounter += 1;
  const version = versionCounter + ' - ' + versionCounter + ' - ' + versionCounter;
  gridOptions.api!.forEachNode(node => {
    node.setData({ ...node.data, version })
  });
}

function updateRows() {
  versionCounter += 1;
  const version = versionCounter + ' - ' + versionCounter + ' - ' + versionCounter;
  gridOptions.api!.forEachNode(node => {
    node.updateData({ ...node.data, version })
  });
}


const getServerSideDatasource = (server: any): IServerSideDatasource => {
  return {
    getRows: (params) => {
      console.log('[Datasource] - rows requested by grid: ', params.request);

      const response = server.getData(params.request);

      const dataWithVersionAndGroupProperties = response.rows.map((rowData: any) => {
        const rowProperties: any = {
          ...rowData,
          version: versionCounter + ' - ' + versionCounter + ' - ' + versionCounter,
        };

        // for unique-id purposes in the client, we also want to attach
        // the parent group keys
        const groupProperties = Object.fromEntries(
          params.request.groupKeys.map((groupKey, index) => {
            const col = params.request.rowGroupCols[index];
            const field = col.id;
            return [field, groupKey];
          })
        );

        return {
          ...rowProperties,
          ...groupProperties,
        };
      });

      // adding delay to simulate real server call
      setTimeout(() => {
        if (response.success) {
          // call the success callback
          params.success({ rowData: dataWithVersionAndGroupProperties, rowCount: response.lastRow });
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
