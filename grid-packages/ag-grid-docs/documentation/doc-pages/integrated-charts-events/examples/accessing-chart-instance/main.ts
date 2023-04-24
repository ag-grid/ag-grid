import { Grid, ChartCreated, ChartDestroyed, ChartRangeSelectionChanged, ColDef, GridApi, GridOptions, ChartOptionsChanged } from '@ag-grid-community/core';
import { AgChart } from 'ag-charts-community';

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
  updateTitle(gridOptions.api!, event);
  
  console.log('Created chart with ID ' + event.chartId)
}

function onChartRangeSelectionChanged(event: ChartRangeSelectionChanged) {
  updateTitle(gridOptions.api!, event);
  
  console.log('Changed range selection of chart with ID ' + event.chartId)
}

function onChartOptionsChanged(event: ChartOptionsChanged) {
  updateTitle(gridOptions.api!, event);
  
  console.log('Options change of chart with ID ' + event.chartId)
}

function onChartDestroyed(event: ChartDestroyed) {
  console.log('Destroyed chart with ID ' + event.chartId)
}

function updateTitle(api: GridApi, event: { chartId: string }) {
  const chartRef = api.getChartRef(event.chartId)!
  const chart = chartRef.chart

  var cellRange = api.getCellRanges()![1]
  if (!cellRange) return
  var columnCount = cellRange.columns.length
  var rowCount = cellRange.endRow!.rowIndex - cellRange.startRow!.rowIndex + 1

  var subtitle = 'Using series data from ' +
    columnCount +
    ' column(s) and ' +
    rowCount +
    ' row(s)'

  AgChart.updateDelta(chart, {
    title: { text: 'Monthly Weather' },
    subtitle: { text: subtitle },
    padding: { top: 20 }
  });
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
