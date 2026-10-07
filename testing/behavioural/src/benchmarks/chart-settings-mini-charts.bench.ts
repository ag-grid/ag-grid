// Rebuilds the chart settings panel's mini chart thumbnails (all default palettes, ~170 thumbnails) by
// a no-op rangeChartUpdate (the panel resets its palettes on chartApiUpdate), SVG against forced canvas.
//
// Gate: SVG median <= 1.05 x canvas median.
// Median ms per rebuild, canvas / svg (all default types; converted types only):
//   run 1: 130.8 / 116.1 (0.89x); 58.8 / 43.2 (0.74x)
//   run 2: 131.8 / 151.8 (1.15x, gate missed); 64.7 / 43.4 (0.67x)
//   run 3: 130.7 / 118.4 (0.91x); 48.6 / 30.8 (0.63x)
//   run 4: 129.4 / 114.5 (0.88x); 48.0 / 40.4 (0.84x)
//   run 5: 129.3 / 116.4 (0.90x); 48.4 / 30.8 (0.64x)
//   run 6: 128.0 / 115.2 (0.90x); 48.8 / 30.7 (0.63x)
//   run 7: 129.3 / 119.9 (0.93x); 48.8 / 29.8 (0.61x)
//   run 8: 128.7 / 116.9 (0.91x); 48.2 / 30.4 (0.63x)
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { bench, suite } from 'vitest';

import type { ChartGroupsDef, ChartRef, ColDef, GridApi, GridOptions, Module } from 'ag-grid-community';
import { ClientSideRowModelModule, _createInternalFeatureFlagsModule } from 'ag-grid-community';
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

const convertedChartGroupsDef: ChartGroupsDef = {
    columnGroup: ['column', 'stackedColumn', 'normalizedColumn'],
    barGroup: ['bar', 'stackedBar', 'normalizedBar'],
    lineGroup: ['line', 'stackedLine', 'normalizedLine'],
    areaGroup: ['area', 'stackedArea', 'normalizedArea'],
    statisticalGroup: ['histogram'],
};

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

const canvasModules = [...baseModules, _createInternalFeatureFlagsModule({ forceCanvasMiniCharts: true })];

suite('chart settings mini charts — all default chart types', () => {
    const gridsManager = new BenchGridsManager();
    benchSettingsRebuild(gridsManager, 'canvas', 'MC1', {}, canvasModules);
    benchSettingsRebuild(gridsManager, 'svg', 'MC2', {}, baseModules);
});

suite('chart settings mini charts — converted chart types only', () => {
    const gridsManager = new BenchGridsManager();
    const gridOptions: GridOptions = {
        chartToolPanelsDef: { settingsPanel: { chartGroupsDef: convertedChartGroupsDef } },
    };
    benchSettingsRebuild(gridsManager, 'canvas', 'MC3', gridOptions, canvasModules);
    benchSettingsRebuild(gridsManager, 'svg', 'MC4', gridOptions, baseModules);
});
