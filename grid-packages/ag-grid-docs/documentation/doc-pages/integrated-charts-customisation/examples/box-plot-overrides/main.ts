import {createGrid, FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent} from '@ag-grid-community/core';
import {getData} from "./data";

let gridApi: GridApi;

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'year', width: 150, chartDataType: 'category' },
    { field: 'country', width: 150, chartDataType: 'category' },
    { field: 'gold', chartDataType: 'series' },
    { field: 'silver', chartDataType: 'series' },
    { field: 'bronze', chartDataType: 'series' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
  },
  popupParent: document.body,
  enableRangeSelection: true,
  enableCharts: true,
  chartThemeOverrides: {
    'box-plot': {
      series: {
        whisker: {
          stroke: '#098a89',
          strokeWidth: 3,
          lineDash: [2, 1]
        },
        cap: {
            lengthRatio: 0.8  // 80% of bar's width (default is 0.5)
        },
        tooltip: {
          renderer: ({ yName, minKey, q1Key, medianKey, q3Key, maxKey, datum, color }) => ({
            title: yName,
            content: [
              `Minimum: ${datum[minKey]}`,
              `First Quartile: ${datum[q1Key]}`,
              `Median: ${datum[medianKey]}`,
              `Third Quartile: ${datum[q3Key]}`,
              `Maximum: ${datum[maxKey]}`,
            ].join('<br>'),
            backgroundColor: color,
          }),
        },
      },
    },
  },
  onGridReady : (params: GridReadyEvent) => {
    getData().then(rowData => params.api.setGridOption('rowData', rowData));
  },
  onFirstDataRendered,
};

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  params.api.createRangeChart({
    cellRange: {
      columns: ['year', 'gold', 'silver', 'bronze'],
    },
    chartType: 'boxPlot',
  });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);
})
