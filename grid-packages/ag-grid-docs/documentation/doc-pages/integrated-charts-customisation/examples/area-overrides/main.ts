import {createGrid, FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent} from '@ag-grid-community/core';

import {getData} from "./data";

let gridApi: GridApi;

const gridOptions: GridOptions = {
  columnDefs: [
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
    area: {
      series: {
        fillOpacity: 0.5,
        strokeOpacity: 0.5,
        strokeWidth: 2,
        highlightStyle: {
          item: {
            fill: 'red',
            stroke: 'yellow',
          },
        },
        marker: {
          enabled: true,
          shape: 'triangle',
          size: 12,
          strokeWidth: 4,
        },
        shadow: {
          color: 'rgba(0, 0, 0, 0.3)',
          xOffset: 5,
          yOffset: 5,
          blur: 8,
        },
      },
    },
  },
  onGridReady,
  onFirstDataRendered,
};

function onGridReady(params: GridReadyEvent) {
  getData().then(rowData => params.api.setGridOption('rowData', rowData));
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  params.api.createRangeChart({
    cellRange: {
      rowStartIndex: 0,
      rowEndIndex: 4,
      columns: ['country', 'gold', 'silver', 'bronze']
    },
    chartType: 'stackedArea'
  });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);
})
