import { ColDef, CreateRangeChartParams, FirstDataRenderedEvent, Grid, GridOptions } from '@ag-grid-community/core';
import '@ag-grid-enterprise/charts';
import { getData } from "./data";

const columnDefs: ColDef[] = [
  { field: 'country', width: 150, chartDataType: 'category' },
  { field: 'gold', chartDataType: 'series' },
  { field: 'silver', chartDataType: 'series' },
  { field: 'bronze', chartDataType: 'series' },
  {
    headerName: 'A',
    valueGetter: 'Math.floor(Math.random()*1000)',
    chartDataType: 'series',
  },
  {
    headerName: 'B',
    valueGetter: 'Math.floor(Math.random()*1000)',
    chartDataType: 'series',
  },
  {
    headerName: 'C',
    valueGetter: 'Math.floor(Math.random()*1000)',
    chartDataType: 'series',
  },
  {
    headerName: 'D',
    valueGetter: 'Math.floor(Math.random()*1000)',
    chartDataType: 'series',
  },
]

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    editable: true,
    sortable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
  },
  popupParent: document.body,
  rowData: getData(),
  enableRangeSelection: true,
  enableCharts: true,
  onFirstDataRendered: onFirstDataRendered,
  chartThemeOverrides: {
    line: {
      series: {
        strokeOpacity: 0.7,
        strokeWidth: 5,
        highlightStyle: {
          item: {
            fill: 'red',
            stroke: 'yellow',
          },
        },
        marker: {
          enabled: true,
          shape: 'diamond',
          size: 12,
          strokeWidth: 4,
        },
        tooltip: {
          renderer: (params) => {
            return {
              content:
                '<b>' +
                params.xName!.toUpperCase() +
                ':</b> ' +
                params.xValue +
                '<br/>' +
                '<b>' +
                params.yName!.toUpperCase() +
                ':</b> ' +
                params.yValue,
            }
          },
        },
      },
    },
  },
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  var cellRange = {
    rowStartIndex: 0,
    rowEndIndex: 4,
    columns: ['country', 'gold', 'silver', 'bronze'],
  }

  var createRangeChartParams: CreateRangeChartParams = {
    cellRange: cellRange,
    chartType: 'line',
  }

  params.api.createRangeChart(createRangeChartParams)
}


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
