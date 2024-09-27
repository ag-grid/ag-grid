import { ClientSideRowModelModule } from 'ag-grid-community';
import type {
    ChartCreatedEvent,
    ChartToolPanelName,
    FirstDataRenderedEvent,
    GridApi,
    GridOptions,
    GridReadyEvent,
} from 'ag-grid-community';
import { createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { GridChartsModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { getData } from './data';

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
        flex: 1,
        minWidth: 100,
    },
    enableCharts: true,
    selection: { mode: 'cell' },
    popupParent: document.body,
    onGridReady: (params: GridReadyEvent) => {
        getData().then((rowData) => params.api.setGridOption('rowData', rowData));
    },
    onFirstDataRendered,
    onChartCreated,
};

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    params.api.createRangeChart({
        chartContainer: document.querySelector('#myChart') as HTMLElement,
        cellRange: {
            columns: ['country', 'sugar', 'fat', 'weight'],
        },
        chartType: 'groupedColumn',
    });
}

function onChartCreated(event: ChartCreatedEvent) {
    chartId = event.chartId;
}

function openChartToolPanel(panel?: ChartToolPanelName) {
    if (!chartId || !gridApi) return;
    gridApi.openChartToolPanel({
        chartId,
        panel,
    });
}

function closeChartToolPanel() {
    if (!chartId || !gridApi) return;
    gridApi.closeChartToolPanel({ chartId });
}

// Initialise the grid after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
