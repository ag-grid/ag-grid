import { ClientSideRowModelModule } from 'ag-grid-community';
import type { ChartRef, GridApi, GridOptions } from 'ag-grid-community';
import { ModuleRegistry, createGrid } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { GridChartsModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { RowGroupingModule } from 'ag-grid-enterprise';

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
    cellSelection: true,
    enableCharts: true,
    popupParent: document.body,
    createChartContainer,
};

function updateChart(chartRef: ChartRef | undefined) {
    const eParent = document.querySelector('#chartParent') as HTMLElement;
    const themeName = document.documentElement?.getAttribute('data-default-theme') || 'ag-theme-quartz';
    eParent.classList.add(themeName);
    eParent.innerHTML = ''; // Clear existing content
    const placeHolder = `<div class="chart-placeholder ${themeName}">Chart will be displayed here.</div>`;

    if (chartRef) {
        const chartWrapperHTML = `
    <div class="chart-wrapper ${themeName}">
      <div class="chart-wrapper-top">
        <h2 class="chart-wrapper-title">Chart created ${new Date().toLocaleString()}</h2>
        <button class="chart-wrapper-close">Destroy Chart</button>
      </div>
      <div class="chart-wrapper-body"></div>
    </div>
  `;
        eParent.insertAdjacentHTML('beforeend', chartWrapperHTML);
        const eChartWrapper = eParent.lastElementChild as HTMLElement;

        eChartWrapper.querySelector('.chart-wrapper-body')!.appendChild(chartRef.chartElement);
        eChartWrapper.querySelector('.chart-wrapper-close')!.addEventListener('click', () => {
            chartRef.destroyChart();
            eParent.innerHTML = placeHolder;
        });
    } else {
        eParent.innerHTML = placeHolder;
    }
}

// Function for creating the chart container
function createChartContainer(chartRef: ChartRef): void {
    updateChart(chartRef);
}

// setup the grid after the page has finished loading
const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
gridApi = createGrid(gridDiv, gridOptions);
updateChart(undefined);

fetch('https://www.ag-grid.com/example-assets/wide-spread-of-sports.json')
    .then((response) => response.json())
    .then(function (data) {
        gridApi!.setGridOption('rowData', data);
    });
