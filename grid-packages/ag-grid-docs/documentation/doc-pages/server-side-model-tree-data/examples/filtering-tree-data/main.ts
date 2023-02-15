import {
  ColDef, Grid,
  GridOptions,
  IServerSideDatasource,
  ISetFilterParams,
  IsServerSideGroupOpenByDefaultParams,
  KeyCreatorParams,
  SetFilterValuesFuncParams,
  ValueFormatterParams,
  ValueGetterParams,
} from '@ag-grid-community/core'
declare var FakeServer: any;
const columnDefs: ColDef[] = [
  { field: 'employeeId', hide: true },
  { field: 'employeeName', hide: true },
  { field: 'employmentType' },
  {
    field: 'startDate',
    valueGetter: valueGetter,
    valueFormatter: cellValueFormatter,
    filter: 'agSetColumnFilter',
    filterParams: {
      treeList: true,
      keyCreator: dateKeyCreator,
      valueFormatter: floatingFilterValueFormatter,
      values: getDatesAsync
    } as ISetFilterParams<any, Date>,
  },
]

const gridOptions: GridOptions = {
  defaultColDef: {
    width: 240,
    filter: 'agTextColumnFilter',
    floatingFilter: true,
    flex: 1,
  },
  autoGroupColumnDef: {
    field: 'employeeName',
    filter: 'agSetColumnFilter',
    filterParams: {
      treeList: true,
      keyCreator: treeDataKeyCreator,
      values: getEmployeesAsync
    } as ISetFilterParams<any, string[]>,
  },
  rowModelType: 'serverSide',
  treeData: true,
  columnDefs: columnDefs,
  animateRows: true,
  isServerSideGroupOpenByDefault: (
    params: IsServerSideGroupOpenByDefaultParams
  ) => {
    // open first level by default
    return params.rowNode.level === 0
  },
  isServerSideGroup: (dataItem: any) => {
    // indicate if node is a group
    return dataItem.underlings
  },
  getServerSideGroupKey: (dataItem: any) => {
    // specify which group key to use
    return dataItem.employeeName
  },
}

function valueGetter(params: ValueGetterParams) {
  // server is returning a string, so need to convert to `Date`.
  // could instead do this inside `IServerSideDatasource.getRows`
  return params.data.startDate ? new Date(params.data.startDate) : null;
}

function cellValueFormatter(params: ValueFormatterParams) {
  return params.value ? params.value.toLocaleDateString() : null;
}

function floatingFilterValueFormatter(params: ValueFormatterParams) {
  return params.value ? params.value.toLocaleDateString() : '(Blanks)';
}

function dateKeyCreator(params: KeyCreatorParams) {
  // this is what is being sent in the Filter Model to the server, so want the matching format
  return params.value ? params.value.toISOString() : null;
}

function treeDataKeyCreator(params: KeyCreatorParams) {
  // tree data group filter value is a string[], so convert to a unique string
  return params.value ? params.value.join(',') : null;
}

var fakeServer: any;

function getServerSideDatasource(server: any): IServerSideDatasource {
  return {
    getRows: (params) => {
      console.log('[Datasource] - rows requested by grid: ', params.request)

      // simulating real server call with a 500ms delay
      setTimeout(function () {
        // get data for request from our fake server
        var response = server.getData(params.request)
        if (response.success) {
          // supply rows for requested block to grid
          params.success({ rowData: response.rows, rowCount: response.lastRow })
        } else {
          params.fail()
        }
      }, 500)
    },
  }
}

function getDatesAsync(params: SetFilterValuesFuncParams<any, Date>) {
  if (!fakeServer) {
    // wait for init
    setTimeout(() => getDatesAsync(params), 500);
    return;
  }
  var dates = fakeServer.getDates()

  if (dates) {
    // values need to match the cell value (what the `valueGetter` returns)
    dates = dates.map((isoDateString: string) => isoDateString ? new Date(isoDateString) : isoDateString)
  }

  // simulating real server call with a 500ms delay
  setTimeout(function () {
    params.success(dates)
  }, 500)
} 

function getEmployeesAsync(params: SetFilterValuesFuncParams<any, string[]>) {
  if (!fakeServer) {
    // wait for init
    setTimeout(() => getEmployeesAsync(params), 500);
    return;
  }
  var employees = fakeServer.getEmployees()

  // simulating real server call with a 500ms delay
  setTimeout(function () {
    params.success(employees)
  }, 500)
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/tree-data.json')
    .then(response => response.json())
    .then(function (data) {
      // setup the fake server with entire dataset
      fakeServer = new FakeServer(data)

      // create datasource with a reference to the fake server
      var datasource = getServerSideDatasource(fakeServer)

      // register the datasource with the grid
      gridOptions.api!.setServerSideDatasource(datasource)
    })
})
