import { FirstDataRenderedEvent, Grid, GridOptions, ValueParserParams } from '@ag-grid-community/core';
import { AgAxisCaptionFormatterParams } from 'ag-charts-community';
import { getData } from "./data";

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'day', maxWidth: 90 },
    { field: 'month', chartDataType: 'category' },
    { field: 'rain', chartDataType: 'series', valueParser: numberParser },
    { field: 'pressure', chartDataType: 'series', valueParser: numberParser },
    { field: 'temp', chartDataType: 'series', valueParser: numberParser },
    { field: 'wind', chartDataType: 'series', valueParser: numberParser },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    editable: true,
    sortable: true,
    filter: true,
    resizable: true,
  },
  rowData: getData(),
  onFirstDataRendered: onFirstDataRendered,
  enableRangeSelection: true,
  chartThemes: ['ag-pastel', 'ag-vivid'],
  enableCharts: true,
  popupParent: document.body,
  chartThemeOverrides: {
    common: {
      axes: {
        number: {
          title: {
            enabled: true,
            formatter: (params: AgAxisCaptionFormatterParams)  => {
              return params.boundSeries.map(s => s.name).join(' / ');
            }
          }
        }
      }
    },
    column: {
      series: {
        strokeWidth: 2,
        fillOpacity: 0.8,
      },
    },
    line: {
      series: {
        strokeWidth: 5,
        strokeOpacity: 0.8,
      },
    },
  },
};

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  params.api!.createRangeChart({
    chartType: 'customCombo',
    cellRange: {
      columns: ['month', 'rain', 'pressure', 'temp'],
    },
    seriesChartTypes: [
      { colId: 'rain', chartType: 'groupedColumn', secondaryAxis: false },
      { colId: 'pressure', chartType: 'line', secondaryAxis: true },
      { colId: 'temp', chartType: 'line', secondaryAxis: true },
    ],
    aggFunc: 'sum',
    suppressChartRanges: true,
    chartContainer: document.querySelector('#myChart') as any,
  });
}

function numberParser(params: ValueParserParams) {
  const value = params.newValue;
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return parseFloat(value);
}

// set up the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
  new Grid(gridDiv, gridOptions);
});