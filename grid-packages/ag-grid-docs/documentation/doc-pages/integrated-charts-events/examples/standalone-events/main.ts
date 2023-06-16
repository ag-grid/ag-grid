import { Grid, ChartCreated, ChartDestroyed, ChartRangeSelectionChanged, ColDef, GridApi, GridOptions, ChartOptionsChanged, FirstDataRenderedEvent, CreateRangeChartParams } from '@ag-grid-community/core';
import { AgChartLegendClickEvent, AgSeriesNodeClickParams } from 'ag-charts-community';

const columnDefs: ColDef[] = [
  { field: 'Month', width: 150, chartDataType: 'category' },
  { field: 'Sunshine (hours)', chartDataType: 'series' },
  { field: 'Rainfall (mm)', chartDataType: 'series' },
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
  enableRangeSelection: true,
  enableCharts: true,
  chartThemeOverrides: {
    common: {
      legend: {
        listeners: {
          legendItemClick: (e: AgChartLegendClickEvent) => console.log('legendItemClick', e)
        }
      },
      listeners: {
        seriesNodeClick: (e: AgSeriesNodeClickParams<any>) => console.log('seriesNodeClick', e)
      },
    },
  },
  onFirstDataRendered: onFirstDataRendered,
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  const createRangeChartParams: CreateRangeChartParams = {
    cellRange: { columns: ['Month', 'Sunshine (hours)', 'Rainfall (mm)'] },
    chartType: 'groupedColumn',
    chartContainer: document.querySelector('#myChart') as any,
  }

  params.api.createRangeChart(createRangeChartParams);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/weather-se-england.json')
    .then(response => response.json())
    .then(function (data) {
      gridOptions.api!.setRowData(data)
    })
})
