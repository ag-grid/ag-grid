import {createGrid, FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent} from '@ag-grid-community/core';
import {getData} from "./data";
import type { AgTreemapSeriesThemeableOptions } from 'ag-charts-community';

let gridApi: GridApi;

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'department', width: 150, chartDataType: 'category' },
    { field: 'resource', width: 150, chartDataType: 'category' },
    { field: 'total', chartDataType: 'series' },
    { field: 'change', chartDataType: 'series' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
  },
  popupParent: document.body,
  enableRangeSelection: true,
  enableCharts: true,
  chartThemeOverrides: {
    'treemap': {
      series: {
        colorKey: 'change',
        colorName: 'Change',
        colorRange: ['#43A047', '#FF5722'],
        sizeKey: 'total',
        sizeName: 'Total',
        labelKey: 'title',
        group: {
          label: {
            fontSize: 18,
            spacing: 2,
          },
        },
        tile: {
          label: {
            fontSize: 32,
            minimumFontSize: 18,
            spacing: 12,
          },
          secondaryLabel: {
            formatter: (params) => `£${params.value.toFixed(1)}bn`,
          },
        },
      } as AgTreemapSeriesThemeableOptions,
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
      columns: ['department', 'resource', 'total', 'change'],
    },
    chartType: 'treemap',
  });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);
})
