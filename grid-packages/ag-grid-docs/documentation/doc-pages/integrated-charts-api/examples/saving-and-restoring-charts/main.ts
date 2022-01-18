import { Grid, ChartModel, ChartRef, GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'country', chartDataType: 'category' },
    { field: 'sugar', chartDataType: 'series' },
    { field: 'fat', chartDataType: 'series' },
    { field: 'weight', chartDataType: 'series' },
  ],
  defaultColDef: {
    editable: true,
    sortable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
  },
  rowData: getData(),
  enableRangeSelection: true,
  popupParent: document.body,
  enableCharts: true,
  createChartContainer: createChartContainer,
}

var chartModel: ChartModel | null;
var currentChartRef: ChartRef | null;

function saveChart() {
  var chartModels = gridOptions.api!.getChartModels() || []
  if (chartModels.length > 0) {
    chartModel = chartModels[0]
  }
  alert('Chart saved!')
}

function clearChart() {
  if (currentChartRef) {
    currentChartRef.destroyChart()
    currentChartRef = null
  }
}

function restoreChart() {
  if (!chartModel) return
  currentChartRef = gridOptions.api!.restoreChart(chartModel)!
}

function createChartContainer(chartRef: ChartRef) {
  // destroy existing chart
  if (currentChartRef) {
    currentChartRef.destroyChart()
  }

  var eChart = chartRef.chartElement
  var eParent = document.querySelector('#myChart') as any;
  eParent.appendChild(eChart)
  currentChartRef = chartRef
}


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
