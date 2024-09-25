import { ClientSideRowModelModule } from 'ag-grid-community';
import { ChartRef, FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { GridChartsModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { getData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule, GridChartsModule, MenuModule, RowGroupingModule]);

let gridApi: GridApi;
let chartRef: ChartRef;

const chartConfig: Record<'pie' | 'donut', { chartColumns: string[] }> = {
    pie: {
        chartColumns: ['period', 'individual'],
    },
    donut: {
        chartColumns: ['period', 'recurring', 'individual'],
    },
};

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'period', chartDataType: 'category', headerName: 'Financial Period', width: 150 },
        { field: 'recurring', chartDataType: 'series', headerName: 'Recurring revenue' },
        { field: 'individual', chartDataType: 'series', headerName: 'Individual sales' },
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
    const chartType = 'pie';
    chartRef = params.api.createRangeChart({
        chartContainer: document.querySelector('#myChart') as any,
        chartType,
        cellRange: {
            rowStartIndex: 0,
            rowEndIndex: 3,
            columns: chartConfig[chartType].chartColumns,
        },
    })!;
}

function updateChart(chartType: 'pie' | 'donut') {
    gridApi.updateChart({
        type: 'rangeChartUpdate',
        chartId: `${chartRef.chartId}`,
        chartType,
        cellRange: {
            rowStartIndex: 0,
            rowEndIndex: 3,
            columns: chartConfig[chartType].chartColumns,
        },
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
