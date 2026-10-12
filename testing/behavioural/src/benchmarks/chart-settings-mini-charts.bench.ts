// Rebuilds the chart settings panel's mini chart thumbnails (all default palettes, ~170 thumbnails) by a no-op
// rangeChartUpdate: the panel resets all its palettes on chartApiUpdate, as it does when it is opened.
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { bench, suite } from 'vitest';

import type { ChartRef, ColDef, GridApi, GridOptions, Module } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { CellSelectionModule, IntegratedChartsModule } from 'ag-grid-enterprise';

import { BenchGridsManager, benchDefaults } from './bench-utils';

const baseModules: Module[] = [
    ClientSideRowModelModule,
    CellSelectionModule,
    IntegratedChartsModule.with(AgChartsEnterpriseModule),
];

const ROW_COUNT = 20;

const rowData = Array.from({ length: ROW_COUNT }, (_, r) => ({
    country: `country-${r}`,
    gold: r + 1,
    silver: (r * 3) % 7,
    bronze: (r * 5) % 11,
}));

const columnDefs: ColDef[] = [
    { field: 'country', chartDataType: 'category' },
    { field: 'gold', chartDataType: 'series' },
    { field: 'silver', chartDataType: 'series' },
    { field: 'bronze', chartDataType: 'series' },
];

const MEASURE_MS = 3000;

const MINI_CHART_SELECTOR = '.ag-chart-mini-thumbnail';

const benchSettingsRebuild = (
    gridsManager: BenchGridsManager,
    name: string,
    gridId: string,
    gridOptions: GridOptions,
    modules: Module[]
) => {
    let api!: GridApi;
    let chartRef!: ChartRef;

    bench(
        name,
        async () => {
            api.updateChart({ type: 'rangeChartUpdate', chartId: chartRef.chartId });
            await chartRef.chart.waitForUpdate();
            await Promise.resolve();
        },
        benchDefaults({
            setup: async () => {
                await gridsManager.reset();
                api = gridsManager.createGrid(
                    gridId,
                    { ...gridOptions, columnDefs, rowData, cellSelection: true, popupParent: document.body },
                    { modules }
                );
                api.flushAllAnimationFrames();
                chartRef = api.createRangeChart({
                    cellRange: { columns: ['country', 'gold', 'silver', 'bronze'] },
                    chartType: 'groupedColumn',
                })!;
                await chartRef.chart.waitForUpdate();
                api.openChartToolPanel({ chartId: chartRef.chartId, panel: 'settings' });
                await new Promise((resolve) => setTimeout(resolve, 300));

                const before = document.querySelector(MINI_CHART_SELECTOR);
                if (!before) {
                    throw new Error('settings panel rendered no mini charts');
                }
                await chartRef.chart.waitForUpdate();
                api.updateChart({ type: 'rangeChartUpdate', chartId: chartRef.chartId });
                await chartRef.chart.waitForUpdate();
                await Promise.resolve();
                if (before.isConnected) {
                    throw new Error('updateChart did not rebuild the mini charts');
                }
            },
            time: MEASURE_MS,
        })
    );
};

suite('chart settings mini charts', () => {
    const gridsManager = new BenchGridsManager();
    benchSettingsRebuild(gridsManager, 'all default chart types', 'MC1', {}, baseModules);
});
