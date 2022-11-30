import { ColDef, CreateRangeChartParams, FirstDataRenderedEvent, Grid, GridOptions } from '@ag-grid-community/core';
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
  defaultColDef: {
    editable: true,
    sortable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
  },
  popupParent: document.body,
  columnDefs: columnDefs,
  rowData: getData(),
  enableRangeSelection: true,
  enableCharts: true,
  onFirstDataRendered: onFirstDataRendered,
  customChartThemes: {
    myCustomTheme: {
      palette: {
        fills: ['#e1ba00', 'silver', 'peru'],
        strokes: ['black', '#ff0000'],
      },
      overrides: {
        common: {
          padding: {
            top: 20,
            right: 30,
            bottom: 10,
            left: 2,
          },
          background: {
            fill: '#e5e5e5',
          },
          title: {
            enabled: true,
            fontStyle: 'italic',
            fontWeight: '600',
            fontSize: 18,
            fontFamily: 'Impact, sans-serif',
            color: '#414182',
          },
          legend: {
            enabled: true,
            position: 'left',
            spacing: 20,
            item: {
              label: {
                fontStyle: 'italic',
                fontWeight: 'bold',
                fontSize: 18,
                fontFamily: 'Palatino, serif',
                color: '#555',
              },
              marker: {
                shape: 'diamond',
                size: 10,
                padding: 10,
                strokeWidth: 2,
              },
              paddingX: 120,
              paddingY: 20,
            },
          },
        },
        cartesian: {
          axes: {
            number: {
              bottom: {
                line: {
                  width: 5,
                },
              },
            },
            category: {
              left: {
                line: {
                  width: 2,
                },
              },
            },
          },
        },
      },
    },
  },
  chartThemes: ['myCustomTheme', 'ag-pastel', 'ag-vivid'],
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  var cellRange = {
    rowStartIndex: 0,
    rowEndIndex: 4,
    columns: ['country', 'gold', 'silver', 'bronze'],
  }

  var createRangeChartParams: CreateRangeChartParams = {
    cellRange: cellRange,
    chartType: 'groupedBar',
  }

  params.api.createRangeChart(createRangeChartParams)
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
