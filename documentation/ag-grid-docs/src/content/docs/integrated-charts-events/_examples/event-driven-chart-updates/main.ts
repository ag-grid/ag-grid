import { ClientSideRowModelModule } from 'ag-grid-community';
import {
    ChartCreatedEvent,
    ChartRangeSelectionChangedEvent,
    CreateRangeChartParams,
    FirstDataRenderedEvent,
    GridApi,
    GridOptions,
    createGrid,
} from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { GridChartsModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { RowGroupingModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ClientSideRowModelModule, GridChartsModule, MenuModule, RowGroupingModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'Month', width: 150, chartDataType: 'category' },
        { field: 'Sunshine (hours)', chartDataType: 'series' },
        { field: 'Rainfall (mm)', chartDataType: 'series' },
    ],
    defaultColDef: { flex: 1 },
    selection: { mode: 'cell' },
    popupParent: document.body,
    enableCharts: true,
    chartThemeOverrides: {
        common: {
            title: { enabled: true, text: 'Monthly Weather' },
            subtitle: { enabled: true },
            legend: { enabled: true },
        },
    },
    onFirstDataRendered: onFirstDataRendered,
    onChartCreated: onChartCreated,
    onChartRangeSelectionChanged: onChartRangeSelectionChanged,
};

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    const createRangeChartParams: CreateRangeChartParams = {
        cellRange: {
            rowStartIndex: 0,
            rowEndIndex: 3,
            columns: ['Month', 'Sunshine (hours)'],
        },
        chartType: 'stackedColumn',
        chartContainer: document.querySelector('#myChart') as any,
    };

    params.api.createRangeChart(createRangeChartParams);
}

function onChartCreated(event: ChartCreatedEvent) {
    console.log('Created chart with ID ' + event.chartId);
    updateTitle(gridApi!, event.chartId);
}

function onChartRangeSelectionChanged(event: ChartRangeSelectionChangedEvent) {
    console.log('Changed range selection of chart with ID ' + event.chartId);
    updateTitle(gridApi!, event.chartId);
}

function updateTitle(api: GridApi, chartId: string) {
    const cellRange = api.getCellRanges()![1];
    if (!cellRange) return;
    const columnCount = cellRange.columns.length;
    const rowCount = cellRange.endRow!.rowIndex - cellRange.startRow!.rowIndex + 1;
    const subtitle = `Using series data from ${columnCount} column(s) and ${rowCount} row(s)`;

    api!.updateChart({
        type: 'rangeChartUpdate',
        chartId: chartId,
        chartThemeOverrides: {
            common: {
                subtitle: { text: subtitle },
            },
        },
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/weather-se-england.json')
        .then((response) => response.json())
        .then(function (data) {
            gridApi!.setGridOption('rowData', data);
        });
});
