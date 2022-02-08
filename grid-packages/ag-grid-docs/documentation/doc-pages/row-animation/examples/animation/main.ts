import { Grid, ColDef, ColumnApi, GridApi, GridOptions } from '@ag-grid-community/core'

var countDownDirection = true

const columnDefs: ColDef[] = [
  { field: 'athlete', minWidth: 150 },
  { field: 'country', minWidth: 150 },
  { field: 'year', minWidth: 120 },
  { field: 'gold', aggFunc: 'sum' },
  { field: 'silver', aggFunc: 'sum' },
  { field: 'bronze', aggFunc: 'sum' },
]

const gridOptions: GridOptions = {
  defaultColDef: {
    flex: 1,
    sortable: true,
    filter: true,
  },
  columnDefs: columnDefs,
  enableRangeSelection: true,
  animateRows: true,
  suppressAggFuncInHeader: true, // so we don't see sum() in gold, silver and bronze headers
  autoGroupColumnDef: {
    // to get 'athlete' showing in the leaf level in this column
    cellRenderer: 'agGroupCellRenderer',
    headerName: 'Athlete',
    minWidth: 200,
    field: 'athlete',
  },
}

// the code below executes an action every 2,000 milliseconds.
// it's an interval, and each time it runs, it takes the next action
// from the 'actions' list below
function startInterval(api: GridApi, columnApi: ColumnApi) {
  var actionIndex = 0

  resetCountdown()
  executeAfterXSeconds()

  function executeAfterXSeconds() {
    setTimeout(function () {
      var action = getActions()[actionIndex]
      action(api, columnApi)
      actionIndex++
      if (actionIndex >= getActions().length) {
        actionIndex = 0
      }
      resetCountdown()
      executeAfterXSeconds()
    }, 3000)
  }

  setTitleFormatted(null)
}

function resetCountdown() {
  (document.querySelector('#animationCountdown') as any).style.width = countDownDirection
    ? '100%'
    : '0%'
  countDownDirection = !countDownDirection
}

function setTitleFormatted(apiName: null | string, methodName?: string, paramsName?: string) {
  var html
  if (apiName === null) {
    html = '<span class="code-highlight-yellow">command:> </span>'
  } else {
    html =
      '<span class="code-highlight-yellow">command:> </span> ' +
      '<span class="code-highlight-blue">' +
      apiName +
      '</span>' +
      '<span class="code-highlight-blue">.</span>' +
      '<span class="code-highlight-yellow">' +
      methodName +
      '</span>' +
      '<span class="code-highlight-blue"></span>' +
      '<span class="code-highlight-blue">(</span>' +
      '<span class="code-highlight-green">' +
      paramsName +
      '</span>' +
      '<span class="code-highlight-blue">)</span>'
  }
  document.querySelector('#animationAction')!.innerHTML = html
}

function getActions() {
  return [
    function (api: GridApi, columnApi: ColumnApi) {
      columnApi.applyColumnState({
        state: [{ colId: 'country', sort: 'asc' }],
        defaultState: { sort: null },
      })
      setTitleFormatted('api', 'applyColumnState', "country: 'asc'")
    },
    function (api: GridApi, columnApi: ColumnApi) {
      columnApi.applyColumnState({
        state: [
          { colId: 'year', sort: 'asc' },
          { colId: 'country', sort: 'asc' },
        ],
        defaultState: { sort: null },
      })
      setTitleFormatted('api', 'applyColumnState', "year: 'asc', country 'asc'")
    },
    function (api: GridApi, columnApi: ColumnApi) {
      columnApi.applyColumnState({
        state: [
          { colId: 'year', sort: 'asc' },
          { colId: 'country', sort: 'desc' },
        ],
        defaultState: { sort: null },
      })
      setTitleFormatted(
        'api',
        'applyColumnState',
        "year: 'asc', country: 'desc'"
      )
    },
    function (api: GridApi, columnApi: ColumnApi) {
      columnApi.applyColumnState({
        defaultState: { sort: null },
      })
      setTitleFormatted('api', 'applyColumnState', 'clear sort')
    },
  ]
}

// from actual demo page (/animation/)
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv =
    document.querySelector<HTMLElement>('#myGrid')! ||
    document.querySelector('#animationGrid')

  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(function (data) {
      gridOptions.api!.setRowData(data.slice(0, 50))
      startInterval(gridOptions.api!, gridOptions.columnApi!)
    })
})
