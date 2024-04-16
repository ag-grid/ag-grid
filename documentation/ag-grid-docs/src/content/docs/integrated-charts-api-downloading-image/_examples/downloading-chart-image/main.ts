import {
  ChartCreated,
  createGrid,
  CreateRangeChartParams,
  FirstDataRenderedEvent,
  GetChartImageDataUrlParams,
  GridApi,
  GridOptions,
  GridReadyEvent,
} from '@ag-grid-community/core';
import { getData } from './data';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ModuleRegistry } from "@ag-grid-community/core";

ModuleRegistry.registerModules([ClientSideRowModelModule, GridChartsModule, MenuModule, RowGroupingModule]);


let gridApi: GridApi;
let chartId: string | undefined;

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'country', chartDataType: 'category' },
    { field: 'sugar', chartDataType: 'series' },
    { field: 'fat', chartDataType: 'series' },
    { field: 'weight', chartDataType: 'series' },
  ],
  defaultColDef: {
    editable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
  },
  enableRangeSelection: true,
  popupParent: document.body,
  enableCharts: true,
  chartThemeOverrides: {
    bar: {
      axes: {
        category: {
          label: {
            rotation: 335,
          },
        },
      },
    },
  },
  onGridReady : (params: GridReadyEvent) => {
    getData().then(rowData => params.api.setGridOption('rowData', rowData));
  },
  onFirstDataRendered,
  onChartCreated,
};



function onFirstDataRendered(params: FirstDataRenderedEvent) {
  const createRangeChartParams: CreateRangeChartParams = {
    cellRange: {
      columns: ['country', 'sugar', 'fat', 'weight'],
    },
    chartType: 'groupedColumn',
    chartContainer: document.querySelector('#myChart') as any,
  };

  params.api.createRangeChart(createRangeChartParams);
}

function onChartCreated(event: ChartCreated) {
  chartId = event.chartId;
}

function downloadChart(dimensions: { width: number, height: number }) {
  if (!chartId) return;
  gridApi!.downloadChart({
    fileName: 'resizedImage',
    fileFormat: 'image/jpeg',
    chartId,
    dimensions
  });
}

function downloadChartImage(fileFormat: string) {
  if (!chartId) return;
  const params: GetChartImageDataUrlParams = { fileFormat, chartId }
  const imageDataURL = gridApi!.getChartImageDataURL(params)

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
  if (!chartId) return;
  const params: GetChartImageDataUrlParams = { fileFormat, chartId }
  const imageDataURL = gridApi!.getChartImageDataURL(params)

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
  gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
})