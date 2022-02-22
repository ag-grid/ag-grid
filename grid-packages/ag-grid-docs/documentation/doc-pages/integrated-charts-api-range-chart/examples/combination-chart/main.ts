import { Grid, CreateRangeChartParams, GridOptions, ValueParserParams, FirstDataRenderedEvent } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'months' },
    {
      field: 'rain',
      valueParser: numberParser,
    },
    {
      field: 'pressure',
      valueParser: numberParser,
    },
    {
      field: 'temp',
      valueParser: numberParser,
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
  popupParent: document.body,
  rowData: getData(),
  onFirstDataRendered: onFirstDataRendered,
  chartThemes: ['ag-pastel-dark', 'ag-vivid-dark'],
  enableCharts: true,
  chartThemeOverrides: {
    column: {
      series: {
        strokeWidth: 5,
        fillOpacity: 0.1,
      },
    },
    line: {
      //Note this doesn't work when there is a column series
      series: {
        strokeWidth: 10,
        strokeOpacity: 0.7,
      },
    },
  },
}


function numberParser(params: ValueParserParams) {
  const value = params.newValue;
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return parseFloat(value);
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  var createRangeChartParams: CreateRangeChartParams = {
    cellRange: {
      rowStartIndex: 0,
      rowEndIndex: 11,
      columns: ['months', 'rain', 'pressure', 'temp'],
    },
    chartType: 'line',
    suppressChartRanges: true,
    seriesChartTypes: [
      { colId: 'rain', chartType: 'groupedColumn', secondaryAxis: false },
      { colId: 'pressure', chartType: 'line', secondaryAxis: true },
      { colId: 'temp', chartType: 'line', secondaryAxis: true }
    ],
    chartContainer: document.querySelector('#myChart') as any,
  };

    params.api!.createRangeChart(createRangeChartParams);
}


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions);
})
