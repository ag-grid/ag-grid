import {
  ChartCreated,
  ChartDestroyed,
  ChartOptionsChanged,
  ChartRangeSelectionChanged,
  createGrid,
  GridApi,
  GridOptions,
} from '@ag-grid-community/core';

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'Month', width: 150, chartDataType: 'category' },
    { field: 'Sunshine (hours)', chartDataType: 'series' },
    { field: 'Rainfall (mm)', chartDataType: 'series' },
  ],
  defaultColDef: {
    flex: 1
  },
  enableRangeSelection: true,
  popupParent: document.body,
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

// setup the grid
const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/weather-se-england.json')
  .then(response => response.json())
  .then(function (data) {
    gridApi.setGridOption('rowData', data)
  })
