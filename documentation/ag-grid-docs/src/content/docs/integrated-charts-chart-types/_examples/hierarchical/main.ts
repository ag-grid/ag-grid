import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    ChartRef,
    ChartType,
    FirstDataRenderedEvent,
    GridApi,
    GridOptions,
    GridReadyEvent,
    createGrid,
} from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { getData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule, GridChartsModule, MenuModule, RowGroupingModule]);

let gridApi: GridApi;
let chartRef: ChartRef;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'division', width: 150, chartDataType: 'category' },
        { field: 'resource', width: 150, chartDataType: 'category' },
        { field: 'revenue', chartDataType: 'series' },
        { field: 'expenses', chartDataType: 'series' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    popupParent: document.body,
    selection: { mode: 'cell' },
    enableCharts: true,
    chartToolPanelsDef: {
        defaultToolPanel: 'settings',
    },
    onGridReady: (params: GridReadyEvent) => {
        getData().then((rowData) => params.api.setGridOption('rowData', rowData));
    },
    onFirstDataRendered,
};

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    chartRef = params.api.createRangeChart({
        chartContainer: document.querySelector('#myChart') as any,
        cellRange: {
            columns: ['division', 'resource', 'revenue', 'expenses'],
        },
        chartType: 'treemap',
    })!;
}

function updateChart(chartType: ChartType) {
    gridApi.updateChart({
        type: 'rangeChartUpdate',
        chartId: `${chartRef.chartId}`,
        chartType: chartType,
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
