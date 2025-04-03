import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import type { AgAxisCaptionFormatterParams, AgAxisLabelFormatterParams } from 'ag-charts-enterprise';

import type { FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import { ColumnMenuModule, ContextMenuModule, IntegratedChartsModule, RowGroupingModule } from 'ag-grid-enterprise';

import { data } from './data';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    IntegratedChartsModule.with(AgChartsEnterpriseModule),
    ColumnMenuModule,
    ContextMenuModule,
    RowGroupingModule,
    ValidationModule /* Development Only */,
]);

const titleFormatter = (params: AgAxisCaptionFormatterParams) =>
    `Power (${params.boundSeries.map((s) => s.name).join(', ')})`;

function createSIFormatter(units = '', precision = 0) {
    const SI_UNITS = ['', 'K', 'M', 'G'];
    let tier: number | undefined;

    function calculateSITier(domain: number[]): number {
        const [min, max] = domain;
        const value = Math.max(Math.abs(min), Math.abs(max));
        return Math.floor(Math.log10(Math.abs(value)) / 3);
    }

    function formatSI(value: number, tier: number, precision: number) {
        if (value === 0) {
            return '0';
        }

        const suffix = SI_UNITS[tier] || '';
        const scaled = value / 10 ** (tier * 3);

        return `${scaled.toFixed(precision)}${suffix}${units}`;
    }

    return (params: AgAxisLabelFormatterParams) => {
        tier ??= calculateSITier(params.domain);
        return formatSI(params.value as number, tier, precision);
    };
}

const siFormatter = createSIFormatter('W', 2);

const isEfficiencySeries = (params: any) => params.boundSeries.find((s: any) => s.key === 'efficiency');

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'year', width: 150, chartDataType: 'category' },
        { field: 'generated', chartDataType: 'series', cellDataType: 'number' },
        { field: 'consumed', chartDataType: 'series', cellDataType: 'number' },
        { field: 'surplus', chartDataType: 'series', cellDataType: 'number' },
        { field: 'efficiency', chartDataType: 'series', cellDataType: 'number' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    popupParent: document.body,
    cellSelection: true,
    enableCharts: true,
    chartThemeOverrides: {
        common: {
            axes: {
                number: {
                    title: {
                        enabled: true,
                        formatter: (params) => {
                            return isEfficiencySeries(params) ? 'Efficiency (%)' : titleFormatter(params);
                        },
                    },
                    label: {
                        formatter: (params) => {
                            return isEfficiencySeries(params) ? `${params.value}%` : siFormatter(params);
                        },
                    },
                },
            },
        },
    },
    onGridReady: (params: GridReadyEvent) => {
        params.api.setGridOption('rowData', data);
    },
    onFirstDataRendered,
};

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    params.api.createRangeChart({
        cellRange: {
            rowStartIndex: 0,
            rowEndIndex: 4,
            columns: ['year', 'generated', 'consumed', 'surplus', 'efficiency'],
        },
        seriesChartTypes: [
            { colId: 'generated', chartType: 'groupedColumn', secondaryAxis: false },
            { colId: 'consumed', chartType: 'groupedColumn', secondaryAxis: false },
            { colId: 'surplus', chartType: 'groupedColumn', secondaryAxis: false },
            { colId: 'efficiency', chartType: 'line', secondaryAxis: true },
        ],
        chartType: 'columnLineCombo',
        chartContainer: document.querySelector('#myChart') as any,
        aggFunc: 'sum',
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
