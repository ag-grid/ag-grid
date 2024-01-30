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
    'range-bar': {
      series: {
        fillOpacity: 0.7,
        strokeWidth: 2,
        strokeOpacity: 0.7,
        label: {
          enabled: true,
          placement: 'outside',
          fontStyle: 'italic',
          fontWeight: 'bold',
          fontSize: 12,
          fontFamily: 'Arial, sans-serif',
          color: 'gray',
        },
        tooltip: {
          renderer: ({ yName, yLowKey, yHighKey, datum, color }) => ({
            title: yName,
            content: `${datum[yLowKey]} - ${datum[yHighKey]}`,
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
    chartType: 'rangeBar',
  });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);
})
