import { CreateRangeChartParams, FirstDataRenderedEvent, Grid, GridOptions } from '@ag-grid-community/core';
import '@ag-grid-enterprise/charts';
import { getData } from "./data";

const gridOptions: GridOptions = {
  columnDefs: [
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
  ],
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
    pie: {
      series: {
        fillOpacity: 0.8,
        strokeOpacity: 0.8,
        strokeWidth: 2,
        title: {
          enabled: true,
          fontStyle: 'italic',
          fontWeight: 'bold',
          fontSize: 14,
          fontFamily: 'Arial, sans-serif',
          color: 'maroon',
        },
        highlightStyle: {
          item: {
            fill: 'red',
            stroke: 'yellow',
          },
        },
        shadow: {
          color: 'rgba(96, 96, 175, 0.5)',
          xOffset: 0,
          yOffset: 0,
          blur: 1,
        },
        calloutLabel: {
          enabled: true,
          fontStyle: 'italic',
          fontWeight: 'bold',
          fontSize: 14,
          fontFamily: 'Arial, sans-serif',
          color: '#2222aa',
          minAngle: 30,
        },
        calloutLine: {
          strokeWidth: 3,
          colors: ['black', '#00ff00'],
          length: 15,
        },
        tooltip: {
          renderer: (params) => {
            return {
              content:
                '<b>' +
                params.angleName!.toUpperCase() +
                ':</b> ' +
                params.angleValue +
                '<br>' +
                '<b>' +
                params.calloutLabelName!.toUpperCase() +
                ':</b> ' +
                params.datum[params.calloutLabelKey!],
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
    columns: ['country', 'gold', 'silver'],
  }

  var createRangeChartParams: CreateRangeChartParams = {
    cellRange: cellRange,
    chartType: 'doughnut',
  }

  params.api.createRangeChart(createRangeChartParams)
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
