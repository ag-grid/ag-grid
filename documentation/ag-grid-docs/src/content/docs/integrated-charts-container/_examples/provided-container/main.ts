import { ChartRef, createGrid, GridApi, GridOptions } from '@ag-grid-community/core';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ModuleRegistry } from "@ag-grid-community/core";

ModuleRegistry.registerModules([ClientSideRowModelModule, GridChartsModule, MenuModule, RowGroupingModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'athlete', width: 150, chartDataType: 'category' },
    { field: 'gold', chartDataType: 'series' },
    { field: 'silver', chartDataType: 'series' },
    { field: 'bronze', chartDataType: 'series' },
    { field: 'total', chartDataType: 'series' },
  ],
  defaultColDef: { flex: 1 },
  enableRangeSelection: true,
  enableCharts: true,
  popupParent: document.body,
  createChartContainer,
};

// Function for creating the chart container
function createChartContainer(chartRef: ChartRef): void {
  const eChart = chartRef.chartElement;
  const themeName = document.documentElement?.getAttribute('data-default-theme') || 'ag-theme-quartz';
  const eParent = document.querySelector('#container') as HTMLElement;

  const chartWrapperHTML = `
    <div class="chart-wrapper ${themeName}">
      <div class="chart-wrapper-top">
        <h2 class="chart-wrapper-title">Chart created ${getFormattedDate()}</h2>
        <button class="chart-wrapper-close">Destroy Chart</button>
      </div>
      <div class="chart-wrapper-body"></div>
    </div>
  `;

  eParent.insertAdjacentHTML('beforeend', chartWrapperHTML);
  const eChartWrapper = eParent.lastElementChild as HTMLElement;

  eChartWrapper.querySelector('.chart-wrapper-body')!.appendChild(eChart);
  eChartWrapper.querySelector('.chart-wrapper-close')!.addEventListener('click', () => {
    chartRef.destroyChart();
    eParent.removeChild(eChartWrapper);
  });
}

function getFormattedDate(): string {
  return new Intl.DateTimeFormat('en', {
    weekday: 'long', year: 'numeric', month: 'long',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: true, timeZone: 'UTC'
  }).format(new Date());
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);

  fetch('https://www.ag-grid.com/example-assets/wide-spread-of-sports.json')
    .then(response => response.json())
    .then(function (data) {
      gridApi!.setGridOption('rowData', data)
    })
})