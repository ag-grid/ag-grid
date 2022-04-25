import { Grid, ColDef, GridOptions, ValueFormatterParams, ValueGetterParams, GetRowIdParams } from '@ag-grid-community/core'

var callCount = 1

var totalValueGetter = function (params: ValueGetterParams) {
  var q1 = params.getValue('q1')
  var q2 = params.getValue('q2')
  var q3 = params.getValue('q3')
  var q4 = params.getValue('q4')
  var result = q1 + q2 + q3 + q4
  console.log(
    'Total Value Getter (' +
    callCount +
    ', ' +
    params.column.getId() +
    '): ' +
    [q1, q2, q3, q4].join(', ') +
    ' = ' +
    result
  )
  callCount++
  return result
}
var total10ValueGetter = function (params: ValueGetterParams) {
  var total = params.getValue('total')
  return total * 10
}
const columnDefs: ColDef[] = [
  { field: 'q1', type: 'quarterFigure' },
  { field: 'q2', type: 'quarterFigure' },
  { field: 'q3', type: 'quarterFigure' },
  { field: 'q4', type: 'quarterFigure' },
  { field: 'year', rowGroup: true, hide: true },
  {
    headerName: 'Total',
    colId: 'total',
    cellClass: ['number-cell', 'total-col'],
    aggFunc: 'sum',
    valueFormatter: formatNumber,
    valueGetter: totalValueGetter,
  },
  {
    headerName: 'Total x 10',
    cellClass: ['number-cell', 'total-col'],
    aggFunc: 'sum',
    minWidth: 120,
    valueFormatter: formatNumber,
    valueGetter: total10ValueGetter,
  },
]

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    resizable: true,
  },
  autoGroupColumnDef: {
    minWidth: 130,
  },
  columnTypes: {
    quarterFigure: {
      editable: true,
      cellClass: 'number-cell',
      aggFunc: 'sum',
      valueFormatter: formatNumber,
      valueParser: function numberParser(params) {
        return Number(params.newValue)
      },
    },
  },
  valueCache: true,
  valueCacheNeverExpires: true,
  rowData: getData(),
  suppressAggFuncInHeader: true,
  enableCellChangeFlash: true,
  enableRangeSelection: true,
  groupDefaultExpanded: 1,
  getRowId: (params: GetRowIdParams) => {
    return params.data.id
  },
  onCellValueChanged: () => {
    console.log('onCellValueChanged')
  },
}

function formatNumber(params: ValueFormatterParams) {
  var number = params.value
  // this puts commas into the number eg 1000 goes to 1,000,
  // i pulled this from stack overflow, i have no idea how it works
  return Math.floor(number)
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function onExpireValueCache() {
  console.log('onInvalidateValueCache -> start')
  gridOptions.api!.expireValueCache()
  console.log('onInvalidateValueCache -> end')
}

function onRefreshCells() {
  console.log('onRefreshCells -> start')
  gridOptions.api!.refreshClientSideRowModel('aggregate')
  gridOptions.api!.refreshCells()
  console.log('onRefreshCells -> end')
}

function onUpdateOneValue() {
  var randomId = Math.floor(Math.random() * 10) + '';
  var rowNode = gridOptions.api!.getRowNode(randomId)
  if (rowNode) {
    var randomCol = ['q1', 'q2', 'q3', 'q4'][Math.floor(Math.random() * 4)]
    var newValue = Math.floor(Math.random() * 1000)
    console.log('onUpdateOneValue -> start')
    rowNode.setDataValue(randomCol, newValue)
    console.log('onUpdateOneValue -> end')
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
