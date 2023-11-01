import {createGrid, FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent} from '@ag-grid-community/core';
import {getData} from "./data";

let gridApi: GridApi;

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'country', width: 150 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
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
      axes: {
        category: {
          label: {
            rotation: 335,
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
      rowEndIndex: 79,
      columns: ['country', 'gold', 'silver', 'bronze'],
    },
    chartType: 'groupedColumn',
    chartContainer: document.querySelector('#myChart') as any,
    aggFunc: 'sum',
  });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);
})
