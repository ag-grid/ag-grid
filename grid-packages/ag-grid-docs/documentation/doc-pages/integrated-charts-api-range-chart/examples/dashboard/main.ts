import { ChartMenuOptions, CreateRangeChartParams, FirstDataRenderedEvent, GetChartToolbarItemsParams, Grid, GridOptions, ValueParserParams } from '@ag-grid-community/core';
import { getData } from "./data";


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
  rowData: getData(),
  enableRangeSelection: true,
  enableCharts: true,
  onFirstDataRendered: onFirstDataRendered,
  getChartToolbarItems: getChartToolbarItems,
  chartToolPanelsDef: {
    panels: []
  },
  popupParent: document.body,
}

function onFirstDataRendered(event: FirstDataRenderedEvent) {
  var eContainer1 = document.querySelector('#chart1') as any;
  var params1: CreateRangeChartParams = {
    cellRange: {
      rowStartIndex: 0,
      rowEndIndex: 4,
      columns: ['country', 'gold', 'silver'],
    },
    chartType: 'groupedBar',
    chartContainer: eContainer1,
  }

  event.api.createRangeChart(params1)

  var eContainer2 = document.querySelector('#chart2') as any;
  var params2: CreateRangeChartParams = {
    cellRange: {
      columns: ['group', 'gold'],
    },
    chartType: 'pie',
    chartContainer: eContainer2,
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
          enabled: true,
          position: 'bottom',
        },
      },
    },
  }

  event.api.createRangeChart(params2)

  var eContainer3 = document.querySelector('#chart3') as any
  var params3: CreateRangeChartParams = {
    cellRange: {
      columns: ['group', 'silver'],
    },
    chartType: 'pie',
    chartContainer: eContainer3,
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
          enabled: true,
          position: 'bottom',
        },
      },
    },
  }

  event.api.createRangeChart(params3)
}

function numberValueParser(params: ValueParserParams) {
  var res = Number.parseInt(params.newValue)

  if (isNaN(res)) {
    return undefined
  }

  return res
}

function getChartToolbarItems(params: GetChartToolbarItemsParams): ChartMenuOptions[] {
  return []
}


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
