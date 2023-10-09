import {
  ChartModel,
  ChartRef,
  GridApi,
  createGrid,
  GridOptions,
  FirstDataRenderedEvent,
} from '@ag-grid-community/core';
import { getData } from "./data";


let api: GridApi;


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
let chartModel: ChartModel | undefined;
let currentChartRef: ChartRef | undefined;

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


function saveChart() {
  const chartModels = api!.getChartModels() || []
  if (chartModels.length > 0) {
    chartModel = chartModels[0]
  }
}

function clearChart() {
  if (currentChartRef) {
    currentChartRef.destroyChart()
    currentChartRef = undefined
  }
}

function restoreChart() {
  if (!chartModel) return
  currentChartRef = api!.restoreChart(chartModel)!
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
  api = createGrid(gridDiv, gridOptions);;
})
