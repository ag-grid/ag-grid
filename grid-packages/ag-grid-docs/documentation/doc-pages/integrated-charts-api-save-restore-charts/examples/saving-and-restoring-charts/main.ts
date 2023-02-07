import { ChartModel, ChartRef, Grid, GridOptions } from '@ag-grid-community/core';
import { getData } from "./data";


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
  createChartContainer,
  onFirstDataRendered: onFirstDataRendered,
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  currentChartRef = params.api!.createRangeChart({
    chartType: 'groupedColumn',
    cellRange: {
      columns: ['country', 'sugar', 'fat', 'weight'],
      rowStartIndex: 0,
      rowEndIndex: 2
    },
       
    chartContainer: document.querySelector('#myChart') as any,
  });
}

let chartModel: ChartModel | null;
let currentChartRef: ChartRef | null;

function saveChart() {
  const chartModels = gridOptions.api!.getChartModels() || []
  if (chartModels.length > 0) {
    chartModel = chartModels[0]
  }
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

  const eChart = chartRef.chartElement
  const eParent = document.querySelector('#myChart') as any;
  eParent.appendChild(eChart)
  currentChartRef = chartRef
}


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
