import { FillOperationParams, Grid, GridOptions } from '@ag-grid-community/core'

var daysList = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]


const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'athlete', minWidth: 150 },
    { headerName: 'Day of the Week', field: 'dayOfTheWeek', minWidth: 180 },
    { field: 'age', maxWidth: 90 },
    { field: 'country', minWidth: 150 },
    { field: 'year', maxWidth: 90 },
    { field: 'date', minWidth: 150 },
    { field: 'sport', minWidth: 150 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    editable: true,
  },
  enableRangeSelection: true,
  enableFillHandle: true,
  fillOperation: function (params: FillOperationParams) {
    var hasNonDayValues = params.initialValues.some(function (val) {
      return daysList.indexOf(val) === -1
    })

    if (hasNonDayValues) {
      return false
    }

    var lastValue = params.values[params.values.length - 1]
    var idxOfLast = daysList.indexOf(lastValue)

    return daysList[(idxOfLast + 1) % daysList.length]
  },
}

function createRowData(data: any[]) {
  var rowData = data.slice(0, 100)
  var currentDate = new Date()
  var currentYear = currentDate.getFullYear()

  for (var i = 0; i < 100; i++) {
    var dt = new Date(
      getRandom(currentYear - 10, currentYear + 10),
      getRandom(0, 12),
      getRandom(1, 25)
    )
    rowData[i].dayOfTheWeek = daysList[dt.getDay()]
  }
  return rowData
}
var getRandom = function (start: number, finish: number) {
  return Math.floor(Math.random() * (finish - start) + start)
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(function (data) {
      gridOptions.api!.setRowData(createRowData(data))
    })
})
