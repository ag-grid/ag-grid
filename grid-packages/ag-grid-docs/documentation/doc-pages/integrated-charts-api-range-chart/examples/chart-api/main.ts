import { Grid, CreateRangeChartParams, GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'country', width: 150, chartDataType: 'category' },
    { field: 'gold', chartDataType: 'series', sort: 'desc' },
    { field: 'silver', chartDataType: 'series', sort: 'desc' },
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
  popupParent: document.body,
}

function onChart1() {
  var params: CreateRangeChartParams = {
    cellRange: {
      rowStartIndex: 0,
      rowEndIndex: 4,
      columns: ['country', 'gold', 'silver'],
    },
    chartType: 'groupedColumn',
    chartThemeName: 'ag-vivid',
    chartThemeOverrides: {
      common: {
        title: {
          enabled: true,
          text: 'Top 5 Medal Winners',
        },
      },
    },
  }

  gridOptions.api!.createRangeChart(params)
}

function onChart2() {
  var params: CreateRangeChartParams = {
    cellRange: {
      columns: ['country', 'bronze'],
    },
    chartType: 'groupedBar',
    chartThemeName: 'ag-pastel',
    chartThemeOverrides: {
      common: {
        title: {
          text: 'Bronze Medal by Country',
        },
        legend: {
          enabled: false,
        },
      },
    },
    unlinkChart: true,
  }

  gridOptions.api!.createRangeChart(params)
}


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
