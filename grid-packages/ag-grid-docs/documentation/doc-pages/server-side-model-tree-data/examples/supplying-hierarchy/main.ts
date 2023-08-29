import {
  ColDef, Grid,
  GridOptions,
  ICellRendererParams,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  IsServerSideGroupOpenByDefaultParams,
} from '@ag-grid-community/core'
const columnDefs: ColDef[] = [
  { field: 'employeeId', hide: true },
  { field: 'employeeName', hide: true },
  { field: 'jobTitle' },
  { field: 'employmentType' },
]

const gridOptions: GridOptions = {
  defaultColDef: {
    width: 240,
    flex: 1,
  },
  autoGroupColumnDef: {
    field: 'employeeName',
    cellRendererParams: {
      innerRenderer: (params: ICellRendererParams) => {
        // display employeeName rather than group key (employeeId)
        return params.data.employeeName
      },
    },
  },
  rowModelType: 'serverSide',
  treeData: true,
  columnDefs: columnDefs,
  animateRows: true,
  isServerSideGroupOpenByDefault: (
    params: IsServerSideGroupOpenByDefaultParams
  ) => {
    // open first two levels by default
    return params.rowNode.level < 2;
  },
  isServerSideGroup: (dataItem: any) => {
    // indicate if node is a group
    return !!dataItem.underlings;
  },
  getServerSideGroupKey: (dataItem: any) => {
    // specify which group key to use
    return dataItem.employeeId;
  },
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/tree-data.json')
    .then(response => response.json())
    .then(function (data) {
      var datasource = createServerSideDatasource(data)
      gridOptions.api!.setServerSideDatasource(datasource)

      function createServerSideDatasource(data: any) {
        const dataSource: IServerSideDatasource = {
          getRows: (params: IServerSideGetRowsParams) => {
            console.log('ServerSideDatasource.getRows: params = ', params)

            const request = params.request;
            if (request.groupKeys.length) {
              // this example doesn't need to support lower levels.
              params.fail();
              return;
            }

            const result = {
              rowData: data.slice(request.startRow, request.endRow),
            };
            console.log('getRows: result = ', result)
            setTimeout(function () {
              params.success(result);

              const recursivelyPopulateHierarchy = (route: string[], node: any) => {
                if (node.underlings) {
                  gridOptions.api!.applyServerSideRowData({
                    route,
                    successParams: {
                      rowData: node.underlings,
                      rowCount: node.underlings.length,
                    }
                  });
                  node.underlings.forEach((child: any) => {
                    recursivelyPopulateHierarchy([...route, child.employeeId], child);
                  });
                }
              };
              result.rowData.forEach((topLevelNode: any) => {
                recursivelyPopulateHierarchy([topLevelNode.employeeId], topLevelNode);
              });
            }, 200)
          },
        }

        return dataSource
      }

    })
})
