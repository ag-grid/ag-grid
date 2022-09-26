import { ChartCreated, CreateRangeChartParams, FirstDataRenderedEvent, ChartToolPanelTabs, Grid, GridOptions } from '@ag-grid-community/core';
import { getData } from "./data";


const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'country', chartDataType: 'category' },
    { field: 'sugar', chartDataType: 'series' },
    { field: 'fat', chartDataType: 'series' },
    { field: 'weight', chartDataType: 'series' },
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
  popupParent: document.body,
  enableCharts: true,
  chartThemeOverrides: {
    cartesian: {
      axes: {
        category: {
          label: {
            rotation: 335,
          },
        },
      },
    },
  },
  onFirstDataRendered: onFirstDataRendered,
  onChartCreated: onChartCreated,
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  const createRangeChartParams: CreateRangeChartParams = {
    cellRange: {
      columns: ['country', 'sugar', 'fat', 'weight'],
    },
    chartType: 'groupedColumn',
    chartContainer: document.querySelector('#myChart') as any,
  }

  params.api.createRangeChart(createRangeChartParams)
}

var chartId: string | undefined;
function onChartCreated(event: ChartCreated) {
  chartId = event.chartId
}

function openChartToolPanel(tabName?: ChartToolPanelTabs) {
  if (!chartId) {
    return
  }

  gridOptions.api!.openChartToolPanel({
    chartId,
    tabName
  })
}

function closeChartToolPanel() {
  if (!chartId) {
    return
  }

  gridOptions.api!.closeChartToolPanel({ chartId })
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
