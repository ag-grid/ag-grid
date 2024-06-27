import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    ChartCreatedEvent,
    ChartDestroyedEvent,
    ChartOptionsChangedEvent,
    ChartRangeSelectionChangedEvent,
    GridApi,
    GridOptions,
    createGrid,
} from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

ModuleRegistry.registerModules([ClientSideRowModelModule, GridChartsModule, MenuModule, RowGroupingModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'Month', width: 150, chartDataType: 'category' },
        { field: 'Sunshine (hours)', chartDataType: 'series' },
        { field: 'Rainfall (mm)', chartDataType: 'series' },
    ],
    defaultColDef: {
        flex: 1,
    },
    enableRangeSelection: true,
    popupParent: document.body,
    enableCharts: true,
    onChartCreated: onChartCreated,
    onChartRangeSelectionChanged: onChartRangeSelectionChanged,
    onChartOptionsChanged: onChartOptionsChanged,
    onChartDestroyed: onChartDestroyed,
};

function onChartCreated(event: ChartCreatedEvent) {
    console.log('Created chart with ID ' + event.chartId, event);
}

function onChartRangeSelectionChanged(event: ChartRangeSelectionChangedEvent) {
    console.log('Changed range selection of chart with ID ' + event.chartId, event);
}

function onChartOptionsChanged(event: ChartOptionsChangedEvent) {
    console.log('Changed options of chart with ID ' + event.chartId, event);
}

function onChartDestroyed(event: ChartDestroyedEvent) {
    console.log('Destroyed chart with ID ' + event.chartId, event);
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
