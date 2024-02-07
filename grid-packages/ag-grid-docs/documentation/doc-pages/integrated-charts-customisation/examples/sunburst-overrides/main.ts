import {createGrid, FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent} from '@ag-grid-community/core';
import {getData} from "./data";

let gridApi: GridApi;

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'continent', width: 150, chartDataType: 'category' },
    { field: 'country', width: 150, chartDataType: 'category' },
    { field: 'gdp', chartDataType: 'series' },
    { field: 'gdpChange', chartDataType: 'series' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
  },
  popupParent: document.body,
  enableRangeSelection: true,
  enableCharts: true,
  chartThemeOverrides: {
    'sunburst': {
      series: {
        colorRange: ['#43A047', '#FF5722'],
        fills: ['#D32F2F', '#FF5722', '#283593'],
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
      columns: ['continent', 'country', 'gdp', 'gdpChange'],
    },
    chartType: 'sunburst',
  });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);
})
