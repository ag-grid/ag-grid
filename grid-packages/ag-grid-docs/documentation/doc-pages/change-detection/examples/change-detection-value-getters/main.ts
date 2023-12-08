import { GridApi, createGrid, GridOptions } from '@ag-grid-community/core';

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'a', type: 'valueColumn' },
    { field: 'b', type: 'valueColumn' },
    { field: 'c', type: 'valueColumn' },
    { field: 'd', type: 'valueColumn' },
    { field: 'e', type: 'valueColumn' },
    { field: 'f', type: 'valueColumn' },
    {
      headerName: 'Total',
      valueGetter: 'data.a + data.b + data.c + data.d + data.e + data.f',
      editable: false,
      cellClass: 'total-col',
    },
  ],
  defaultColDef: {
    flex: 1,
  },
  columnTypes: {
    valueColumn: {
      editable: true,
      valueParser: 'Number(newValue)',
      filter: 'agNumberColumnFilter',
    },
  },
  rowData: getRowData(),
  groupDefaultExpanded: 1,
  suppressAggFuncInHeader: true,
  enableCellChangeFlash: true,
}

function getRowData() {
  var rowData = []
  for (var i = 1; i <= 20; i++) {
    rowData.push({
      group: i < 5 ? 'A' : 'B',
      a: (i * 863) % 100,
      b: (i * 811) % 100,
      c: (i * 743) % 100,
      d: (i * 677) % 100,
      e: (i * 619) % 100,
      f: (i * 571) % 100,
    })
  }
  return rowData
}

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi = createGrid(gridDiv, gridOptions);
