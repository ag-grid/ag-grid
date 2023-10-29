import {
  createGrid,
  CreateRangeChartParams,
  FirstDataRenderedEvent,
  GridApi,
  GridOptions,
  GridReadyEvent,
  ValueParserParams,
} from '@ag-grid-community/core';
import {getData} from "./data";

let gridApi: GridApi;

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'country', width: 150, chartDataType: 'category' },
    { field: 'group', chartDataType: 'category' },
    {
      field: 'gold',
      chartDataType: 'series',
      editable: true,
      valueParser: numberValueParser,
    },
    {
      field: 'silver',
      chartDataType: 'series',
      editable: true,
      valueParser: numberValueParser,
    },
    {
      field: 'bronze',
      chartDataType: 'series',
      editable: true,
      valueParser: numberValueParser,
    },
    {
      field: 'a',
      chartDataType: 'series',
      editable: true,
      valueParser: numberValueParser,
    },
    {
      field: 'b',
      chartDataType: 'series',
      editable: true,
      valueParser: numberValueParser,
    },
    {
      field: 'c',
      chartDataType: 'series',
      editable: true,
      valueParser: numberValueParser,
    },
    {
      field: 'd',
      chartDataType: 'series',
      editable: true,
      valueParser: numberValueParser,
    },
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
  enableCharts: true,
  chartToolPanelsDef: {
    panels: []
  },
  popupParent: document.body,
  onGridReady,
  onFirstDataRendered,
  getChartToolbarItems:  () => [],
}

function onGridReady(params: GridReadyEvent) {
  getData().then(rowData => params.api.setRowData(rowData));
}

function onFirstDataRendered(event: FirstDataRenderedEvent) {
  createGroupedBarChart(event, '#chart1', ['country', 'gold', 'silver']);
  createPieChart(event, '#chart2', ['group', 'gold']);
  createPieChart(event, '#chart3', ['group', 'silver']);
}

function createGroupedBarChart(event: FirstDataRenderedEvent, selector: string, columns: string[]) {
  const container = document.querySelector(selector) as any;
  const params: CreateRangeChartParams = {
    cellRange: {
      rowStartIndex: 0,
      rowEndIndex: 4,
      columns,
    },
    chartType: 'groupedBar',
    chartContainer: container,
  };
  event.api.createRangeChart(params);
}

function createPieChart(event: FirstDataRenderedEvent, selector: string, columns: string[]) {
  const container = document.querySelector(selector) as any;
  const params: CreateRangeChartParams = {
    cellRange: { columns },
    chartType: 'pie',
    chartContainer: container,
    aggFunc: 'sum',
    chartThemeOverrides: {
      common: {
        padding: {
          top: 20,
          left: 10,
          bottom: 30,
          right: 10,
        },
        legend: {
          position: 'right',
        },
      },
    },
  };
  event.api.createRangeChart(params);
}

function numberValueParser(params: ValueParserParams) {
  return isNaN(Number(params.newValue)) ? undefined : Number(params.newValue);
}

document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
  gridApi = createGrid(gridDiv, gridOptions);
});