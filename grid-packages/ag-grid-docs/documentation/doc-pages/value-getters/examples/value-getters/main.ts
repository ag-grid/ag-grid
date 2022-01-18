import { Grid, GridOptions, ValueGetterParams } from '@ag-grid-community/core'

var hashValueGetter = function (params: ValueGetterParams) {
  return params.node ? params.node.rowIndex : null;
}

function abValueGetter(params: ValueGetterParams) {
  return params.data.a + params.data.b
}

var a1000ValueGetter = function (params: ValueGetterParams) {
  return params.data.a * 1000
}
var b137ValueGetter = function (params: ValueGetterParams) {
  return params.data.b * 137
}
var randomValueGetter = function () {
  return Math.floor(Math.random() * 1000)
}
var chainValueGetter = function (params: ValueGetterParams) {
  return params.getValue('a&b') * 1000
}
var constValueGetter = function () {
  return 99999
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

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
