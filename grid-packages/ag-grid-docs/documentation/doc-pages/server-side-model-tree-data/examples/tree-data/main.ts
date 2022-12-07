import {
  ColDef, Grid,
  GridOptions,
  ICellRendererParams,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  IServerSideGetRowsRequest,
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
    filter: 'agTextColumnFilter',
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
    return params.rowNode.level < 2
  },
  isServerSideGroup: (dataItem: any) => {
    // indicate if node is a group
    return dataItem.group
  },
  getServerSideGroupKey: (dataItem: any) => {
    // specify which group key to use
    return dataItem.employeeId
  },
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/small-tree-data.json')
    .then(response => response.json())
    .then(function (data) {
      var fakeServer = createFakeServer(data)
      var datasource = createServerSideDatasource(fakeServer)
      gridOptions.api!.setServerSideDatasource(datasource)
    })
})

function createFakeServer(fakeServerData: any[]) {
  const fakeServer = {
    data: fakeServerData,
    getData: function (request: IServerSideGetRowsRequest) {
      function extractRowsFromData(groupKeys: string[], data: any[]): any {
        if (groupKeys.length === 0) {
          return data.map(function (d) {
            return {
              group: !!d.children,
              employeeId: d.employeeId,
              employeeName: d.employeeName,
              employmentType: d.employmentType,
              jobTitle: d.jobTitle,
            }
          })
        }

        var key = groupKeys[0]
        for (var i = 0; i < data.length; i++) {
          if (data[i].employeeId === key) {
            return extractRowsFromData(
              groupKeys.slice(1),
              data[i].children.slice()
            )
          }
        }
      }

      return extractRowsFromData(request.groupKeys, this.data)
    },
  }

  return fakeServer
}

function createServerSideDatasource(fakeServer: any) {
  const dataSource: IServerSideDatasource = {
    getRows: (params: IServerSideGetRowsParams) => {
      console.log('ServerSideDatasource.getRows: params = ', params)

      var allRows = fakeServer.getData(params.request)

      var request = params.request
      var doingInfinite = request.startRow != null && request.endRow != null
      var result = doingInfinite
        ? {
          rowData: allRows.slice(request.startRow, request.endRow),
          rowCount: allRows.length,
        }
        : { rowData: allRows }
      console.log('getRows: result = ', result)
      setTimeout(function () {
        params.success(result)
      }, 200)
    },
  }

  return dataSource
}
