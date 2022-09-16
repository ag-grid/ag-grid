import { ChartCreated, CreateRangeChartParams, FirstDataRenderedEvent, GetChartImageDataUrlParams, Grid, GridOptions } from '@ag-grid-community/core';
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

function downloadChart(dimensions: { width: number, height: number }) {
  if (!chartId) {
    return
  }

  gridOptions.api!.downloadChart({
    fileName: 'resizedImage',
    fileFormat: 'image/jpeg',
    chartId,
    dimensions
  });
}

function downloadChartImage(fileFormat: string) {
  if (!chartId) {
    return
  }

  const params: GetChartImageDataUrlParams = { fileFormat, chartId }
  const imageDataURL = gridOptions.api!.getChartImageDataURL(params)

  if (imageDataURL) {
    const a = document.createElement('a')
    a.href = imageDataURL
    a.download = 'image'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}

function openChartImage(fileFormat: string) {
  if (!chartId) {
    return
  }

  const params: GetChartImageDataUrlParams = { fileFormat, chartId }
  const imageDataURL = gridOptions.api!.getChartImageDataURL(params)

  if (imageDataURL) {
    const image = new Image()
    image.src = imageDataURL

    const w = window.open('')!
    w.document.write(image.outerHTML)
    w.document.close()
  }
}



// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
