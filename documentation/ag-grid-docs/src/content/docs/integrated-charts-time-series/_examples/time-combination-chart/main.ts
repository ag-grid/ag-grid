import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    FirstDataRenderedEvent,
    GridApi,
    GridOptions,
    GridReadyEvent,
    ValueParserParams,
    createGrid,
} from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import {
    AgAxisCaptionFormatterParams,
    AgCartesianSeriesTooltipRendererParams,
    AgCrosshairLabelRendererParams,
} from 'ag-charts-community';

import { getData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule, GridChartsModule, MenuModule, RowGroupingModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        {
            field: 'date',
            chartDataType: 'time',
            valueFormatter: (params) => params.value.toISOString().substring(0, 10),
        },
        { field: 'rain', chartDataType: 'series', valueParser: numberParser },
        { field: 'pressure', chartDataType: 'series', valueParser: numberParser },
        { field: 'temp', chartDataType: 'series', valueParser: numberParser },
    ],
    defaultColDef: { flex: 1 },
    enableRangeSelection: true,
    popupParent: document.body,
    enableCharts: true,
    chartThemeOverrides: {
        common: {
            padding: {
                top: 45,
            },
            axes: {
                number: {
                    title: {
                        enabled: true,
                        formatter: (params: AgAxisCaptionFormatterParams) => {
                            return params.boundSeries.map((s) => s.name).join(' / ');
                        },
                    },
                },
                time: {
                    crosshair: {
                        label: {
                            renderer: (params: AgCrosshairLabelRendererParams) => ({
                                text: formatDate(params.value),
                            }),
                        },
                    },
                },
            },
        },
        bar: {
            series: {
                strokeWidth: 2,
                fillOpacity: 0.8,
                tooltip: {
                    renderer: chartTooltipRenderer,
                },
            },
        },
        line: {
            series: {
                strokeWidth: 5,
                strokeOpacity: 0.8,
                tooltip: {
                    renderer: chartTooltipRenderer,
                },
            },
        },
    },
    onGridReady: (params: GridReadyEvent) => {
        getData().then((rowData) => params.api.setGridOption('rowData', rowData));
    },
    onFirstDataRendered,
};

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    params.api.createRangeChart({
        chartContainer: document.querySelector('#myChart') as HTMLElement,
        cellRange: {
            columns: ['date', 'rain', 'pressure', 'temp'],
        },
        suppressChartRanges: true,
        seriesChartTypes: [
            { colId: 'rain', chartType: 'groupedColumn', secondaryAxis: false },
            { colId: 'pressure', chartType: 'line', secondaryAxis: true },
            { colId: 'temp', chartType: 'line', secondaryAxis: true },
        ],
        chartType: 'customCombo',
        aggFunc: 'sum',
    });
}

function numberParser(params: ValueParserParams) {
    const value = params.newValue;
    if (value === null || value === undefined || value === '') {
        return null;
    }
    return parseFloat(value);
}

function chartTooltipRenderer({ datum, xKey, yKey }: AgCartesianSeriesTooltipRendererParams) {
    return {
        content: `${formatDate(datum[xKey])}: ${datum[yKey]}`,
    };
}

function formatDate(date: Date | number) {
    return Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: undefined,
    }).format(new Date(date));
}

// set up the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
});
