import {
  ColDef,
  CreateRangeChartParams,
  FirstDataRenderedEvent,
  GridApi,
  createGrid,
  GridOptions,
  GridReadyEvent
} from '@ag-grid-community/core';
import { getData } from "./data";

const columnDefs: ColDef[] = [
  { field: 'country', width: 150, chartDataType: 'category' },
  { field: 'gold', chartDataType: 'series' },
  { field: 'silver', chartDataType: 'series' },
  { field: 'bronze', chartDataType: 'series' },
]

let gridApi: GridApi;

const gridOptions: GridOptions = {
  defaultColDef: {
    flex: 1,
  },
  columnDefs: columnDefs,
  popupParent: document.body,
  enableRangeSelection: true,
  enableCharts: true,
  chartToolPanelsDef: {
    defaultToolPanel: 'data',
    panels: ['data', 'settings'],
  },
  onGridReady,
  onFirstDataRendered,
};

function onGridReady(params: GridReadyEvent) {
  getData().then(rowData => params.api.setRowData(rowData));
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  const createRangeChartParams: CreateRangeChartParams = {
    cellRange: {
      rowStartIndex: 0,
      rowEndIndex: 4,
      columns: ['country', 'gold', 'silver', 'bronze'],
    },
    chartType: 'groupedColumn',
  }

  params.api.createRangeChart(createRangeChartParams)
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
})
