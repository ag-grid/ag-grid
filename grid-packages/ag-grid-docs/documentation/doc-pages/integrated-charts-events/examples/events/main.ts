import { Grid, ChartCreated, ChartDestroyed, ChartOptionsChanged, ChartRangeSelectionChanged, ColDef, GridOptions } from '@ag-grid-community/core'

const columnDefs: ColDef[] = [
  { field: 'Month', width: 150, chartDataType: 'category' },
  { field: 'Sunshine (hours)', chartDataType: 'series' },
  { field: 'Rainfall (mm)', chartDataType: 'series' },
]

const gridOptions: GridOptions = {
  defaultColDef: {
    editable: true,
    sortable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
  },
  popupParent: document.body,
  columnDefs: columnDefs,
  enableRangeSelection: true,
  enableCharts: true,
  onChartCreated: onChartCreated,
  onChartRangeSelectionChanged: onChartRangeSelectionChanged,
  onChartOptionsChanged: onChartOptionsChanged,
  onChartDestroyed: onChartDestroyed,
}

function onChartCreated(event: ChartCreated) {
  console.log('Created chart with ID ' + event.chartId, event)
}

function onChartRangeSelectionChanged(event: ChartRangeSelectionChanged) {
  console.log(
    'Changed range selection of chart with ID ' + event.chartId,
    event
  )
}

function onChartOptionsChanged(event: ChartOptionsChanged) {
  console.log('Changed options of chart with ID ' + event.chartId, event)
}

function onChartDestroyed(event: ChartDestroyed) {
  console.log('Destroyed chart with ID ' + event.chartId, event)
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/weather-se-england.json')
    .then(response => response.json())
    .then(function (data) {
      gridOptions.api!.setRowData(data)
    })
})
