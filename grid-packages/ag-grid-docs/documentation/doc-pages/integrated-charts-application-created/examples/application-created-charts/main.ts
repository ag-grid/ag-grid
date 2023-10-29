import {
  GridApi,
  createGrid,
  ColDef,
  CreateRangeChartParams,
  GetRowIdParams,
  GridOptions,
  ValueFormatterParams,
  ChartMenuOptions,
  ChartType
} from '@ag-grid-community/core';
import { AgAxisLabelFormatterParams } from 'ag-charts-community';

declare var __basePath: string;

const MIN_WIDTH = 110;

// Types
interface WorkerMessage {
  type: string;
  records?: any[];
}

// Global variables
let chartRef: any;
let gridApi: GridApi;
let worker: Worker;

// Column Definitions
function getColumnDefs(): ColDef[] {
  return [
    { field: 'product', chartDataType: 'category', minWidth: MIN_WIDTH },
    { field: 'book', chartDataType: 'category', minWidth: MIN_WIDTH },
    { field: 'current', type: 'measure' },
    { field: 'previous', type: 'measure' },
    { headerName: 'PL 1', field: 'pl1', type: 'measure' },
    { headerName: 'PL 2', field: 'pl2', type: 'measure' },
    { headerName: 'Gain-DX', field: 'gainDx', type: 'measure' },
    { headerName: 'SX / PX', field: 'sxPx', type: 'measure' },

    { field: 'trade', type: 'measure' },
    { field: 'submitterID', type: 'measure' },
    { field: 'submitterDealID', type: 'measure' },

    { field: 'portfolio' },
    { field: 'dealType' },
    { headerName: 'Bid', field: 'bidFlag' },
  ];
}

// Grid Options
const gridOptions: GridOptions = {
    columnDefs: getColumnDefs(),
    defaultColDef: {
      editable: true,
      sortable: true,
      flex: 1,
      minWidth: 140,
      filter: true,
      resizable: true,
    },
    columnTypes: {
      measure: {
        chartDataType: 'series',
        cellClass: 'number',
        valueFormatter: numberCellFormatter,
        cellRenderer: 'agAnimateShowChangeCellRenderer',
      },
    },
    animateRows: true,
    enableCharts: true,
    suppressAggFuncInHeader: true,
    suppressChartToolPanelsButton: true,
    chartThemeOverrides: {
      common: {
          animation: {
            enabled: false
          },
          zoom: {
            enabled: false
          }
      },
    },
    getRowId: (params: GetRowIdParams) => params.data.trade,
    getChartToolbarItems: (): ChartMenuOptions[] => [],
    onFirstDataRendered,
}

// Initial Chart Creation
function onFirstDataRendered(params: any) {
  const createRangeChartParams: CreateRangeChartParams = {
    cellRange: {
      columns: [
        'product',
        'current',
        'previous',
        'pl1',
        'pl2',
        'gainDx',
        'sxPx',
      ],
    },
    chartType: 'groupedColumn',
    chartContainer: document.querySelector('#myChart') as any,
    suppressChartRanges: true,
    aggFunc: 'sum',
  };
  chartRef = params.api.createRangeChart(createRangeChartParams);
}

function updateChart(chartType: ChartType) {
  gridApi!.updateChart({type: 'rangeChartUpdate', chartId: chartRef.chartId, chartType});
}

// Utility Functions
function numberCellFormatter(params: ValueFormatterParams) {
  return Math.floor(params.value)
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

function yAxisLabelFormatter(params: AgAxisLabelFormatterParams) {
  const n = params.value;
  return n.toLocaleString(); // replace with more complex logic if needed
}

function startWorker(): void {
  worker = new Worker(`${__basePath}dataUpdateWorker.js`);
  worker.addEventListener('message', handleWorkerMessage);
  worker.postMessage('start');
}

function handleWorkerMessage(e: any): void {
  if (e.data.type === 'setRowData') {
    gridApi!.setRowData(e.data.records);
  }
  if (e.data.type === 'updateData') {
    gridApi!.applyTransactionAsync({ update: e.data.records });
  }
}

// after page is loaded, create the grid
document.addEventListener('DOMContentLoaded', function () {
  var eGridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(eGridDiv, gridOptions);
});

// IIFE
(function () {
  startWorker();
})();

// Worker Commands
function onStartLoad(): void {
  worker.postMessage('start');
}

function onStopMessages(): void {
  worker.postMessage('stop');
}