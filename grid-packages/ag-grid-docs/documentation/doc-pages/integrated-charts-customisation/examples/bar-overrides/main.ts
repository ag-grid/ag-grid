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
    bar: {
      series: {
        fillOpacity: 0.8,
        strokeOpacity: 0.8,
        strokeWidth: 2,
        shadow: {
          enabled: true,
          color: 'rgba(0, 0, 0, 0.3)',
          xOffset: 10,
          yOffset: 5,
          blur: 8,
        },
        label: {
          enabled: true,
          fontStyle: 'italic',
          fontWeight: 'bold',
          fontSize: 15,
          fontFamily: 'Arial, sans-serif',
          color: 'green',
          formatter: (params) => {
            return '<' + params.value + '>'
          },
        },
        highlightStyle: {
          item: {
            fill: 'red',
            stroke: 'yellow',
          },
        },
        tooltip: {
          renderer: (params) => {
            return {
              content:
                '<b>' +
                params.xName!.toUpperCase() +
                ':</b> ' +
                params.xValue +
                '<br/>' +
                '<b>' +
                params.yName!.toUpperCase() +
                ':</b> ' +
                params.yValue,
            }
          },
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
      columns: ['country', 'gold', 'silver', 'bronze'],
    },
    chartType: 'groupedBar',
  });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);
})
