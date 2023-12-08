import { GridApi, createGrid, GridOptions, ValueGetterParams } from '@ag-grid-community/core';

function hashValueGetter(params: ValueGetterParams) {
  return params.node ? params.node.rowIndex : null;
}

function abValueGetter(params: ValueGetterParams) {
  return params.data.a + params.data.b
}

const gridOptions: GridOptions = {
  columnDefs: [
    {
      headerName: '#',
      maxWidth: 100,
      valueGetter: hashValueGetter,
    },
    { field: 'a' },
    { field: 'b' },
    {
      headerName: 'A + B',
      colId: 'a&b',
      valueGetter: abValueGetter,
    },
    {
      headerName: 'A * 1000',
      minWidth: 95,
      valueGetter: a1000ValueGetter,
    },
    {
      headerName: 'B * 137',
      minWidth: 90,
      valueGetter: b137ValueGetter,
    },
    {
      headerName: 'Random',
      minWidth: 90,
      valueGetter: randomValueGetter,
    },
    {
      headerName: 'Chain',
      valueGetter: chainValueGetter,
    },
    {
      headerName: 'Const',
      minWidth: 85,
      valueGetter: constValueGetter,
    },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 75,
    // cellClass: 'number-cell'
  },
  rowData: createRowData(),
}

function createRowData() {
  var rowData = []
  for (var i = 0; i < 100; i++) {
    rowData.push({
      a: Math.floor(i % 4),
      b: Math.floor(i % 7),
    })
  }
  return rowData
}

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi = createGrid(gridDiv, gridOptions);
