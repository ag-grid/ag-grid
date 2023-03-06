import { Grid, ColDef, GridApi, GridOptions, IServerSideDatasource, IServerSideGetRowsParams, IServerSideGetRowsRequest, IsServerSideGroupOpenByDefaultParams, IRowNode, GetRowIdParams } from '@ag-grid-community/core'

var fakeServer: {
  getData: (request: IServerSideGetRowsRequest) => void,
  addChildRow: (route: string[], newRow: any) => void,
  toggleEmployment: (route: string[]) => void,
  removeEmployee: (route: string[]) => void,
  moveEmployee: (from: string[], to: string[]) => void,
};

const columnDefs: ColDef[] = [
  { field: 'employeeId', hide: true },
  { field: 'employeeName', hide: true },
  { field: 'employmentType' },
  { field: 'startDate' },
];

const gridOptions: GridOptions = {
  defaultColDef: {
    width: 235,
    resizable: true,
    flex: 1,
  },
  autoGroupColumnDef: {
    headerCheckboxSelection: true,
    cellRendererParams: {
      checkbox: true,
    },
    field: 'employeeName',
  },
  rowModelType: 'serverSide',
  treeData: true,
  columnDefs: columnDefs,
  animateRows: true,
  cacheBlockSize: 10,
  rowSelection: 'multiple',
  groupSelectsChildren: true,

  isServerSideGroupOpenByDefault: (params: IsServerSideGroupOpenByDefaultParams) => {
    var isKathrynPowers =
      params.rowNode.level == 0 && params.data.employeeName == 'Kathryn Powers'
    var isMabelWard =
      params.rowNode.level == 1 && params.data.employeeName == 'Mabel Ward'
    return isKathrynPowers || isMabelWard
  },
  getRowId: (row: GetRowIdParams) => String(row.data.employeeId),
  isServerSideGroup: (dataItem: any) => dataItem.group,
  getServerSideGroupKey: (dataItem: any) => dataItem.employeeName,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/tree-data.json')
    .then(response => response.json())
    .then(function (data) {

      const adjustedData = [
        {
          employeeId: -1,
          employeeName: 'Robert Peterson',
          employmentType: 'Founder',
          startDate: '24/01/1990',
        },
        ...data,
      ];
      var fakeServer = createFakeServer(adjustedData, gridOptions.api!)
      var datasource = createServerSideDatasource(fakeServer)
      gridOptions.api!.setServerSideDatasource(datasource)
    })
})

function createFakeServer(fakeServerData: any[], gridApi: GridApi) {
  const getDataAtRoute = (route: string[]) => {
    let mutableRoute = [...route];
    let target: any = { underlings: fakeServerData };
    while (mutableRoute.length) {
      const nextRoute = mutableRoute[0];
      mutableRoute = mutableRoute.slice(1);
      target = target.underlings.find((e: any) => e.employeeName === nextRoute);
    }
    return target;
  }

  const sanitizeRowForGrid = (d: any) => {
    return {
      group: !!d.underlings && !!d.underlings.length,
      employeeId: d.employeeId,
      employeeName: d.employeeName,
      employmentType: d.employmentType,
      startDate: d.startDate,
    }
  }

  fakeServer = {
    getData: (request: IServerSideGetRowsRequest) => {
      function extractRowsFromData(groupKeys: string[], data: any[]): any {
        if (groupKeys.length === 0) {
          return data.map(sanitizeRowForGrid);
        }

        var key = groupKeys[0]
        for (var i = 0; i < data.length; i++) {
          if (data[i].employeeName === key) {
            return extractRowsFromData(
              groupKeys.slice(1),
              data[i].underlings.slice()
            )
          }
        }
      }

      return extractRowsFromData(request.groupKeys, fakeServerData)
    },
    addChildRow: (route: string[], newRow: any) => {
      const target = getDataAtRoute(route);
      if (!target.underlings || target.underlings.length === 0) {
        target.underlings = [newRow];

        // update the parent row via transaction
        gridApi.applyServerSideTransaction({
          route: route.slice(0, route.length - 1),
          update: [sanitizeRowForGrid(target)],
        });
      } else {
        target.underlings.push(newRow);

        // add the child row via transaction
        gridApi.applyServerSideTransaction({
          route,
          add: [sanitizeRowForGrid(newRow)],
        });
      }
    },
    toggleEmployment: (route: string[]) => {
      const target = getDataAtRoute(route);
      // update the data at the source
      target.employmentType = target.employmentType === 'Contract' ? 'Permanent' : 'Contract';

      // inform the grid of the changes
      gridApi.applyServerSideTransaction({
        route: route.slice(0, route.length - 1),
        update: [sanitizeRowForGrid(target)],
      });
    },
    removeEmployee: (route: string[]) => {
      const target = getDataAtRoute(route);

      const parent = getDataAtRoute(route.slice(0, route.length - 1));
      parent.underlings = parent.underlings.filter((child: any) => child.employeeName !== target.employeeName);
      if (parent.underlings.length === 0) {
        // update the parent row via transaction, as it's no longer a group
        gridApi.applyServerSideTransaction({
          route: route.slice(0, route.length - 2),
          update: [sanitizeRowForGrid(parent)],
        });
      } else {
        // inform the grid of the changes
        gridApi.applyServerSideTransaction({
          route: route.slice(0, route.length - 1),
          remove: [sanitizeRowForGrid(target)],
        });
      }
    },
    moveEmployee: (route: string[], to: string[]) => {
      const target = getDataAtRoute(route);

      // remove employee from old group
      fakeServer.removeEmployee(route);

      // add employee to new group
      fakeServer.addChildRow(to, target);
    }
  }
  return fakeServer
}

function createServerSideDatasource(fakeServer: any) {

  const dataSource: IServerSideDatasource = {
    getRows: (params: IServerSideGetRowsParams) => {
      console.log('ServerSideDatasource.getRows: params = ', params)
      var request = params.request
      var allRows = fakeServer.getData(request)
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
      }, 500)
    }
  }

  return dataSource;
}
