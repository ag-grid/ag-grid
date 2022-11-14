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
    histogram: {
      series: {
        bins: [
          [0, 10],
          [10, 40],
          [40, 80],
          [80, 100],
        ],
        fillOpacity: 0.8,
        strokeOpacity: 0.8,
        strokeWidth: 4,
        shadow: {
          enabled: true,
          color: 'rgba(0, 0, 0, 0.3)',
          xOffset: 10,
          yOffset: 10,
          blur: 8,
        },
        label: {
          enabled: true,
          fontStyle: 'italic',
          fontWeight: 'bold',
          fontSize: 15,
          fontFamily: 'Arial, sans-serif',
          color: 'green',
          formatter: (params) => {
            return '<' + params.value + '>'
          },
        },
        highlightStyle: {
          item: {
            fill: 'black',
            stroke: 'yellow',
          },
        },
        tooltip: {
          renderer: (params) => {
            var bin = params.datum
            var binSize = bin.frequency
            var medalColour = params.xKey

            return {
              content:
                binSize +
                (binSize >= 2 ? ' countries' : ' country') +
                ' got between ' +
                params.xValue[0] +
                ' and ' +
                params.xValue[1] +
                ' ' +
                medalColour +
                ' medals',
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
    rowEndIndex: 20,
    columns: ['bronze'],
  }

  var createRangeChartParams: CreateRangeChartParams = {
    cellRange: cellRange,
    chartType: 'histogram',
  }

  params.api.createRangeChart(createRangeChartParams)
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
