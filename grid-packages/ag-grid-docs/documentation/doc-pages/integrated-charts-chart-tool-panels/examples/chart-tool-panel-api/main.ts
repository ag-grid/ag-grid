import {
  ChartCreated,
  ChartToolPanelName,
  createGrid,
  CreateRangeChartParams,
  FirstDataRenderedEvent,
  GridApi,
  GridOptions,
  GridReadyEvent
} from '@ag-grid-community/core';
import {getData} from './data';

// Store a reference to the Grid API
let gridApi: GridApi;

// Grid options configuration
const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'country', chartDataType: 'category' },
    { field: 'sugar', chartDataType: 'series' },
    { field: 'fat', chartDataType: 'series' },
    { field: 'weight', chartDataType: 'series' },
  ],
  defaultColDef: {
    editable: true,
    sortable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
  },
  enableRangeSelection: true,
  popupParent: document.body,
  enableCharts: true,
  onGridReady,
  onFirstDataRendered,
  onChartCreated,
};

function onGridReady(params: GridReadyEvent) {
  getData().then(rowData => params.api.setRowData(rowData));
}


function onFirstDataRendered(params: FirstDataRenderedEvent) {
  const createRangeChartParams: CreateRangeChartParams = {
    cellRange: {
      columns: ['country', 'sugar', 'fat', 'weight'],
    },
    chartType: 'groupedColumn',
    chartContainer: document.querySelector('#myChart') as any,
  };

  params.api.createRangeChart(createRangeChartParams);
}

let chartId: string | undefined;

function onChartCreated(event: ChartCreated) {
  chartId = event.chartId;
}

function openChartToolPanel(panel?: ChartToolPanelName) {
  if (!chartId || !gridApi) return;
  gridApi.openChartToolPanel({
    chartId,
    panel,
  });
}

function closeChartToolPanel() {
  if (!chartId || !gridApi) return;
  gridApi.closeChartToolPanel({ chartId });
}

// Initialise the grid after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
  gridApi = createGrid(gridDiv, gridOptions);
});
