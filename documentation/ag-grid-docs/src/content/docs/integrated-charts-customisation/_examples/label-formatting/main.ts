import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import type { AgAxisCaptionFormatterParams, AgAxisLabelFormatterParams } from 'ag-charts-enterprise';

import type { FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import { ColumnMenuModule, ContextMenuModule, IntegratedChartsModule, RowGroupingModule } from 'ag-grid-enterprise';

import { getData } from './data';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    IntegratedChartsModule.with(AgChartsEnterpriseModule),
    ColumnMenuModule,
    ContextMenuModule,
    RowGroupingModule,
    ValidationModule /* Development Only */,
]);

const titleFormatter = (params: AgAxisCaptionFormatterParams) =>
    `Amount (${params.boundSeries.map((s) => s.name).join(', ')})`;

function createSIFormatter(precision = 0) {
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

        return `${scaled.toFixed(precision)}${suffix}`;
    }

    return (params: AgAxisLabelFormatterParams) => {
        tier ??= calculateSITier(params.domain);
        return formatSI(params.value as number, tier, precision);
    };
}

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'country', width: 150, chartDataType: 'category' },
        { field: 'early', chartDataType: 'series', cellDataType: 'number' },
        { field: 'mid', chartDataType: 'series', cellDataType: 'number' },
        { field: 'end', chartDataType: 'series', cellDataType: 'number' },
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
                        formatter: titleFormatter,
                    },
                    label: {
                        formatter: createSIFormatter(2),
                    },
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
        cellRange: {
            rowStartIndex: 0,
            rowEndIndex: 4,
            columns: ['country', 'early', 'mid', 'end'],
        },
        seriesChartTypes: [
            { colId: 'early', chartType: 'groupedColumn', secondaryAxis: false },
            { colId: 'mid', chartType: 'column', secondaryAxis: true },
            { colId: 'end', chartType: 'groupedColumn', secondaryAxis: false },
        ],
        chartType: 'columnLineCombo',
        aggFunc: 'sum',
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
