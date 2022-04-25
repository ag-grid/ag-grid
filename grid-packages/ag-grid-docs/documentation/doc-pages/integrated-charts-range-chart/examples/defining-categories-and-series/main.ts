import { Grid, CreateRangeChartParams, FirstDataRenderedEvent, GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    // different ways to define 'categories'
    { field: 'athlete', width: 150, chartDataType: 'category' },
    { field: 'age', chartDataType: 'category', sort: 'asc' },
    { field: 'sport' }, // inferred as category by grid

    // excludes year from charts
    { field: 'year', chartDataType: 'excluded' },

    // different ways to define 'series'
    { field: 'gold', chartDataType: 'series' },
    { field: 'silver', chartDataType: 'series' },
    { field: 'bronze' }, // inferred as series by grid
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
  enableRangeSelection: true,
  enableCharts: true,
  chartThemeOverrides: {
    common: {
      title: {
        text: 'Medals by Age',
      },
      legend: {
        position: 'bottom',
      },
    },
    column: {
      axes: {
        category: {
          label: {
            rotation: 0,
          },
        },
      },
    },
  },
  onFirstDataRendered: onFirstDataRendered,
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  var createRangeChartParams: CreateRangeChartParams = {
    cellRange: {
      rowStartIndex: 0,
      rowEndIndex: 79,
      columns: ['age', 'gold', 'silver', 'bronze'],
    },
    chartType: 'groupedColumn',
    chartContainer: document.querySelector('#myChart') as any,
    aggFunc: 'sum',
  }

  params.api.createRangeChart(createRangeChartParams)
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/wide-spread-of-sports.json')
    .then(response => response.json())
    .then(function (data) {
      gridOptions.api!.setRowData(data)
    })
})
