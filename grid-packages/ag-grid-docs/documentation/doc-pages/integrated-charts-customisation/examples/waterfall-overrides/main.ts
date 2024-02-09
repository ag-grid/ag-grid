import {createGrid, FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent} from '@ag-grid-community/core';
import {getData} from './data';

let gridApi: GridApi;

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'financials', width: 150, chartDataType: 'category' },
    { field: 'amount', chartDataType: 'series' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
  },
  popupParent: document.body,
  enableRangeSelection: true,
  enableCharts: true,
  chartThemeOverrides: {
    waterfall: {
      series: {
        item: {
          positive: {
            fill: '#4A90E2',
            stroke: '#4A90E2',
          },
          negative: {
            fill: '#FF6B6B',
            stroke: '#FF6B6B',
          },
          total: {
            name: 'Total / Subtotal',
            fill: '#404066',
            stroke: '#404066',
          },
        },
      },
    },
  },
  onGridReady: (params: GridReadyEvent) => {
    getData().then(rowData => params.api.setGridOption('rowData', rowData))
  },
  onFirstDataRendered,
}



function onFirstDataRendered(params: FirstDataRenderedEvent) {
  params.api.createRangeChart({
    cellRange: {
      columns: ['financials', 'amount'],
    },
    chartType: 'waterfall',
  });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);
})
