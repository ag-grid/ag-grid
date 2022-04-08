import { Grid, ColDef, ColGroupDef, ColumnApi, GridOptions, IServerSideDatasource, IServerSideGetRowsRequest } from '@ag-grid-community/core'
declare const FakeServer: any;

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'country', rowGroup: true, filter: 'agTextColumnFilter' },
    { field: 'sport', rowGroup: true },
    { field: 'year', pivot: true, filter: 'agTextColumnFilter' }, // pivot on 'year'
    { field: 'gold', aggFunc: 'sum' },
    { field: 'silver', aggFunc: 'sum' },
    { field: 'bronze', aggFunc: 'sum' },
  ],
  defaultColDef: {
    width: 150,
    resizable: true,
    sortable: true,
  },
  autoGroupColumnDef: {
    minWidth: 200,
  },

  // use the server-side row model
  rowModelType: 'serverSide',
  serverSideStoreType: 'partial',

  // enable pivoting
  pivotMode: true,

  animateRows: true,
  sideBar: 'filters',
  // debug: true
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
  new Grid(gridDiv, gridOptions);

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data) => {
      // setup the fake server with entire dataset
      const fakeServer = new FakeServer(data);

      // create datasource with a reference to the fake server
      var datasource = getServerSideDatasource(fakeServer);

      // register the datasource with the grid
      gridOptions.api!.setServerSideDatasource(datasource);
    });
});

const getServerSideDatasource = (server: any): IServerSideDatasource => ({
  getRows: (params) => {
    var request = params.request;

    console.log('[Datasource] - rows requested by grid: ', params.request);

    var response = server.getData(request);

    // add pivot colDefs in the grid based on the resulting data
    addPivotColDefs(request, response, params.columnApi);

    // simulating real server call with a 500ms delay
    setTimeout(() => {
      if (response.success) {
        // supply data to grid
        params.success({ rowData: response.rows, rowCount: response.lastRow });
      } else {
        params.fail();
      }
    }, 500);
  },
});

const addPivotColDefs = (request: IServerSideGetRowsRequest, response: any, columnApi: ColumnApi) => {
  // check if pivot colDefs already exist
  const existingPivotColDefs = columnApi.getSecondaryColumns();
  if (existingPivotColDefs && existingPivotColDefs.length > 0 && existingPivotColDefs.length === response.pivotFields.length) {
    return;
  }

  // create pivot colDef's based of data returned from the server
  const pivotColDefs = createPivotColDefs(request, response.pivotFields);

  // supply secondary columns to the grid
  columnApi.setSecondaryColumns(pivotColDefs);
}

const createPivotColDefs = (request: IServerSideGetRowsRequest, pivotFields: string[]) => {
  const addColDef = (colId: string, parts: string[], res: (ColDef | ColGroupDef)[]) => {
    if (parts.length === 0) return [];

    const first = parts.shift();

    const existing: ColGroupDef | undefined = res.find((r): r is ColGroupDef => {
      return 'groupId' in r && r.groupId === first;
    });
    if (existing) {
      existing.children = addColDef(colId, parts, existing.children);
    } else {
      let colDef: ColDef | ColGroupDef = {};
      var isGroup = parts.length > 0
      if (isGroup) {
        const children = addColDef(colId, parts, []);

        const group: ColGroupDef = {
          groupId: first,
          headerName: first,
          children: children,
        };
        res.push(group);
      } else {
        const valueCol = request.valueCols.find((r) => r.field === first);
        if (!valueCol) {
          return res;
        }

        const col: ColDef = {
          colId: colId,
          headerName: valueCol.displayName,
          field: colId,
        };
        res.push(col);
      }
    }

    return res;
  }

  if (request.pivotMode && request.pivotCols.length > 0) {
    const secondaryCols: ColGroupDef[] = [];
    pivotFields.map((field) => (
      addColDef(field, field.split('_'), secondaryCols)
    ));
    return secondaryCols
  }

  return []
}
