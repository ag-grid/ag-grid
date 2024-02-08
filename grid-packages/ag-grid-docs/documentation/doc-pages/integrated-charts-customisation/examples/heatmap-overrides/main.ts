import {createGrid, FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent} from '@ag-grid-community/core';
import {getData} from './data';

let gridApi: GridApi;

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'year', width: 150, chartDataType: 'category' },
    { field: 'jan', chartDataType: 'series' },
    { field: 'feb', chartDataType: 'series' },
    { field: 'mar', chartDataType: 'series' },
    { field: 'apr', chartDataType: 'series' },
    { field: 'may', chartDataType: 'series' },
    { field: 'jun', chartDataType: 'series' },
    { field: 'jul', chartDataType: 'series' },
    { field: 'aug', chartDataType: 'series' },
    { field: 'sep', chartDataType: 'series' },
    { field: 'oct', chartDataType: 'series' },
    { field: 'nov', chartDataType: 'series' },
    { field: 'dec', chartDataType: 'series' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
  },
  popupParent: document.body,
  enableRangeSelection: true,
  enableCharts: true,
  chartThemeOverrides: {
    'heatmap': {
      series: {
        colorRange: ['#fef0d9', '#d7301f'],
        label: {
          enabled: true,
          formatter: ({ datum, colorKey }) => {
            const value = datum[colorKey];
            return `${value.toFixed(0)}°C`;
          },
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
      columns: ['year', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
    },
    chartType: 'heatmap',
  });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);
})
