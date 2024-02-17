import {createGrid, FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent, ChartRef, ChartType, ColDef} from '@ag-grid-community/core';
import {getData} from "./data";

let gridApi: GridApi;
let chartRef: ChartRef;

const chartConfig: Record<'heatmap' | 'waterfall', { columnDefs: ColDef[], chartColumns: string[] }> = {
  heatmap: {
    columnDefs: [
      { field: "year", width: 150, chartDataType: "category" },
      { field: "jan", chartDataType: "series" },
      { field: "feb", chartDataType: "series" },
      { field: "mar", chartDataType: "series" },
      { field: "apr", chartDataType: "series" },
      { field: "may", chartDataType: "series" },
      { field: "jun", chartDataType: "series" },
      { field: "jul", chartDataType: "series" },
      { field: "aug", chartDataType: "series" },
      { field: "sep", chartDataType: "series" },
      { field: "oct", chartDataType: "series" },
      { field: "nov", chartDataType: "series" },
      { field: "dec", chartDataType: "series" },
    ],
    chartColumns: ['year', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
  },
  waterfall: {
    columnDefs:  [
      { field: 'financials', width: 150, chartDataType: 'category' },
      { field: 'amount', chartDataType: 'series' },
    ],
    chartColumns: ['financials', 'amount'],
  },
}

const gridOptions: GridOptions = {
  columnDefs: chartConfig.heatmap.columnDefs,
  defaultColDef: {
    flex: 1,
    minWidth: 100,
  },
  popupParent: document.body,
  enableRangeSelection: true,
  enableCharts: true,
  chartToolPanelsDef: {
    defaultToolPanel: 'settings'
  },
  onGridReady : (params: GridReadyEvent) => {
    getData('heatmap').then(rowData => params.api.setGridOption('rowData', rowData));
  },
  onFirstDataRendered,
};

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  chartRef = params.api.createRangeChart({
    chartContainer: document.querySelector('#myChart') as any,
    chartType: 'heatmap',
    cellRange: {
      columns: chartConfig.heatmap.chartColumns,
    },
  })!;
}

function updateChart(chartType: 'heatmap' | 'waterfall') {
  gridApi.setGridOption('rowData', []);
  if (chartRef) chartRef.destroyChart();
  gridApi.setGridOption('columnDefs', chartConfig[chartType].columnDefs);
  chartRef = gridApi.createRangeChart({
    chartType,
    cellRange: {
      columns: chartConfig[chartType].chartColumns,
    }
  })!;
  getData(chartType).then(rowData => gridApi.setGridOption('rowData', rowData));
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);
})
