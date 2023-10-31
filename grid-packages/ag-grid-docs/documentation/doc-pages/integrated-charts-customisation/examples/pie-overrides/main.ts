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
    pie: {
      series: {
        fillOpacity: 0.8,
        strokeOpacity: 0.8,
        strokeWidth: 2,
        title: {
          enabled: true,
          fontStyle: 'italic',
          fontWeight: 'bold',
          fontSize: 14,
          fontFamily: 'Arial, sans-serif',
          color: 'maroon',
        },
        highlightStyle: {
          item: {
            fill: 'red',
            stroke: 'yellow',
          },
        },
        shadow: {
          color: 'rgba(96, 96, 175, 0.5)',
          xOffset: 0,
          yOffset: 0,
          blur: 1,
        },
        calloutLabel: {
          enabled: true,
          fontStyle: 'italic',
          fontWeight: 'bold',
          fontSize: 14,
          fontFamily: 'Arial, sans-serif',
          color: '#2222aa',
          minAngle: 30,
        },
        calloutLine: {
          strokeWidth: 3,
          colors: ['black', '#00ff00'],
          length: 15,
        },
        tooltip: {
          renderer: (params) => {
            return {
              content:
                '<b>' +
                params.angleName!.toUpperCase() +
                ':</b> ' +
                params.angleValue +
                '<br>' +
                '<b>' +
                params.calloutLabelName!.toUpperCase() +
                ':</b> ' +
                params.datum[params.calloutLabelKey!],
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
  getData().then(rowData => params.api.updateGridOption('rowData', rowData));
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  params.api.createRangeChart({
    cellRange: {
      rowStartIndex: 0,
      rowEndIndex: 4,
      columns: ['country', 'gold', 'silver', 'bronze'],
    },
    chartType: 'doughnut',
  });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);
})
