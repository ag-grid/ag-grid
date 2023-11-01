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
    common: {
      title: {
        enabled: true,
        text: 'Precious Metals Production',
        fontStyle: 'italic',
        fontWeight: 'bold',
        fontSize: 18,
        fontFamily: 'Impact, sans-serif',
      },
      subtitle: {
        enabled: true,
        text: 'by country',
        fontSize: 14,
        fontFamily: 'Monaco, monospace',
        color: 'rgb(100, 100, 100)',
      },
      legend: {
        position: 'left',
        spacing: 2,
        item: {
          label: {
            fontStyle: 'italic',
            fontWeight: 'bold',
            fontSize: 18,
            fontFamily: 'Palatino, serif',
            color: '#555',
          },
          marker: {
            shape: 'diamond',
            size: 10,
            padding: 10,
            strokeWidth: 2,
          },
          paddingX: 120,
          paddingY: 20,
        },
      },
      tooltip: {
        class: 'my-tooltip-class',
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
