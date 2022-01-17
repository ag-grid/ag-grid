import { Grid, ChartRef, ColDef, GridOptions } from '@ag-grid-community/core'

const columnDefs: ColDef[] = [
  { field: 'athlete', width: 150, chartDataType: 'category' },
  { field: 'gold', chartDataType: 'series' },
  { field: 'silver', chartDataType: 'series' },
  { field: 'bronze', chartDataType: 'series' },
  { field: 'total', chartDataType: 'series' },
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
  columnDefs: columnDefs,
  enableRangeSelection: true,
  enableCharts: true,
  createChartContainer: createChartContainer,
  popupParent: document.body,
}

var chartPanelTemplate =
  '<div class="chart-wrapper ag-theme-alpine">' +
  '<div class="chart-wrapper-top">' +
  '<span class="chart-wrapper-title"></span>' +
  '<button class="chart-wrapper-close">Destroy Chart</button>' +
  '</div>' +
  '<div class="chart-wrapper-body"></div>' +
  '</div>'

function createChartContainer(chartRef: ChartRef) {
  var eChart = chartRef.chartElement

  var eTemp = document.createElement('div')
  eTemp.innerHTML = chartPanelTemplate
  var eChartWrapper = eTemp.firstChild as any;

  var eParent = document.querySelector('#container') as HTMLElement;

  eParent.appendChild(eChartWrapper)

  eChartWrapper.querySelector('.chart-wrapper-body').appendChild(eChart)
  eChartWrapper.querySelector('.chart-wrapper-title').innerText =
    'Chart Created At ' + new Date()

  eChartWrapper
    .querySelector('.chart-wrapper-close')
    .addEventListener('click', function () {
      chartRef.destroyChart()
      eParent.removeChild(eChartWrapper)
    })
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/wide-spread-of-sports.json')
    .then(response => response.json())
    .then(function (data) {
      gridOptions.api!.setRowData(data)
    })
})
