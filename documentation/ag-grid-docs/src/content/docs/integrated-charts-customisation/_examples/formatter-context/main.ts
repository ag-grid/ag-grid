import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import type { FormatterParams } from 'ag-charts-enterprise';

import type {
    ChartRef,
    ChartType,
    FirstDataRenderedEvent,
    GridApi,
    GridChartContext,
    GridOptions,
    GridReadyEvent,
    IRowNode,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ModuleRegistry,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { ColumnMenuModule, ContextMenuModule, IntegratedChartsModule, RowGroupingModule } from 'ag-grid-enterprise';

import { getData } from './data';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    IntegratedChartsModule.with(AgChartsEnterpriseModule),
    ColumnMenuModule,
    ContextMenuModule,
    RowGroupingModule,
    ColumnApiModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi;
let chartRef: ChartRef;

const gridOptions: GridOptions = {
    columnDefs: [
        {
            field: 'period',
            chartDataType: 'category',
            headerName: 'Financial Period',
            width: 150,
            valueFormatter: (params) => {
                const parts = params.value?.split(' ');
                return parts ? `${parts[1]} - ${parts[0]}` : '';
            },
        },
        {
            field: 'recurring',
            chartDataType: 'series',
            headerName: 'Recurring Revenue',
            valueFormatter: (params) => {
                return `£${params.value}`;
            },
        },
        {
            field: 'individual',
            chartDataType: 'series',
            headerName: 'Individual Sales',
            valueFormatter: (params) => {
                return `$${params.value}`;
            },
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    popupParent: document.body,
    cellSelection: true,
    enableCharts: true,
    chartToolPanelsDef: {
        defaultToolPanel: 'settings',
    },
    onGridReady: (params: GridReadyEvent) => {
        getData().then((rowData) => params.api.setGridOption('rowData', rowData));
    },
    onFirstDataRendered,
    chartThemeOverrides: {
        common: {
            formatter: (params: FormatterParams) => {
                const { type, key, datum, value, context, boundSeries } = params;
                if (type === 'number') {
                    return formatValue(key, datum?.node, context as GridChartContext, value);
                }
                if (type === 'category') {
                    return formatValue(
                        boundSeries?.[0]?.key,
                        datum?.node,
                        context as GridChartContext,
                        value?.toString()
                    );
                }
                // fallback to default
                return undefined;
            },
        },
    },
};

function formatValue(
    colId: string | undefined,
    node: IRowNode | undefined,
    chartContext: GridChartContext,
    value: any
) {
    const column = colId ? chartContext.api.getColumn(colId) : null;
    if (column) {
        const colDef = column.getColDef();
        const valueFormatter = colDef.valueFormatter;
        if (typeof valueFormatter === 'function') {
            const formattedValue = valueFormatter({
                ...chartContext,
                column,
                colDef,
                node: node ?? null,
                data: node?.data,
                value,
            });
            return formattedValue;
        }
    }
    return undefined;
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    chartRef = params.api.createRangeChart({
        chartContainer: document.querySelector('#myChart') as HTMLElement,
        cellRange: {
            columns: ['period', 'recurring', 'individual'],
        },
        chartType: 'groupedColumn',
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
