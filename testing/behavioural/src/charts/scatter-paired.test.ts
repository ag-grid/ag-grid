import { waitFor } from '@testing-library/dom';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import type { AgBubbleSeriesOptions, AgCartesianChartOptions, AgScatterSeriesOptions } from 'ag-charts-types';
import { TestGridsManager, canvasPolyfill } from 'ag-test-utils';

import type { ChartModel, ChartRef, ChartType, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, enableDevValidations, setupAgTestIds } from 'ag-grid-community';
import { CellSelectionModule, IntegratedChartsModule } from 'ag-grid-enterprise';

describe('scatter and bubble paired mode', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule, IntegratedChartsModule.with(AgChartsEnterpriseModule)],
    });

    beforeAll(async () => {
        setupAgTestIds();
        await canvasPolyfill.init();
    });
    afterAll(() => canvasPolyfill.reset());
    afterEach(() => {
        enableDevValidations({ suppress: [] });
        vi.restoreAllMocks();
        gridsManager.reset();
    });

    const FIELDS = ['gold', 'silver', 'bronze', 'total', 'extra'];

    async function createChart(
        chartType: ChartType,
        params: Record<string, unknown> = {},
        valueColumns = FIELDS.slice(0, 3)
    ) {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'country', chartDataType: 'category' },
                ...valueColumns.map((field) => ({ field, chartDataType: 'series' as const })),
            ],
            rowData: [
                { country: 'Russia', gold: 3, silver: 1, bronze: 5, total: 9, extra: 2 },
                { country: 'USA', gold: 4, silver: 2, bronze: 6, total: 12, extra: 3 },
                { country: 'UK', gold: 5, silver: 3, bronze: 7, total: 15, extra: 4 },
            ],
            cellSelection: true,
            popupParent: document.body,
        });
        const chartRef = api.createRangeChart({
            cellRange: { columns: ['country', ...valueColumns] },
            chartType,
            ...params,
        })!;
        await chartRef.chart.waitForUpdate();
        return { api, chartRef };
    }

    function getSeries(chartRef: ChartRef): (AgScatterSeriesOptions | AgBubbleSeriesOptions)[] {
        const { series = [] } = chartRef.chart.getOptions() as AgCartesianChartOptions;
        return series.filter(
            (s): s is AgScatterSeriesOptions | AgBubbleSeriesOptions => s.type === 'scatter' || s.type === 'bubble'
        );
    }

    function pairs(chartRef: ChartRef) {
        return getSeries(chartRef).map((s) => [s.xKey, s.yKey]);
    }

    function bubbleTriples(chartRef: ChartRef) {
        return getSeries(chartRef).map((s) => [s.xKey, s.yKey, 'sizeKey' in s ? s.sizeKey : undefined]);
    }

    function getModel(api: GridApi): ChartModel {
        return api.getChartModels()![0];
    }

    async function openDataTab(api: GridApi, chartRef: ChartRef) {
        api.openChartToolPanel({ chartId: chartRef.chartId, panel: 'data' });
        await chartRef.chart.waitForUpdate();
        return waitFor(() => getPairedToggle());
    }

    function getPairedToggle() {
        const toggle = Array.from(document.body.querySelectorAll('.ag-toggle-button')).find((el) =>
            el.textContent?.includes('Paired Mode')
        );
        const input = toggle?.querySelector<HTMLInputElement>('input');
        expect(input).toBeTruthy();
        return input!;
    }

    function update(api: GridApi, chartRef: ChartRef, params: Record<string, unknown>) {
        api.updateChart({ type: 'rangeChartUpdate', chartId: chartRef.chartId, ...params } as any);
        return chartRef.chart.waitForUpdate();
    }

    test('scatter defaults to paired', async () => {
        const { api, chartRef } = await createChart('scatter');

        expect(pairs(chartRef)).toEqual([['gold', 'silver']]);
        expect(getModel(api).paired).toBe(true);
    });

    test('scatter with paired false plots every column against the first, and the Data tab reflects it', async () => {
        const { api, chartRef } = await createChart('scatter', { paired: false });

        expect(pairs(chartRef)).toEqual([
            ['gold', 'silver'],
            ['gold', 'bronze'],
        ]);
        expect(getModel(api).paired).toBe(false);

        const toggle = await openDataTab(api, chartRef);
        expect(toggle.checked).toBe(false);
        await waitFor(() => expect(document.body.textContent).toContain('Bronze (Y)'));
    });

    test('bubble with paired false alternates Y and size after the X column', async () => {
        const columns = FIELDS;
        const paired = await createChart('bubble', {}, columns);
        expect(bubbleTriples(paired.chartRef)).toEqual([['gold', 'silver', 'bronze']]);
        gridsManager.reset();

        const unpaired = await createChart('bubble', { paired: false }, columns);
        expect(bubbleTriples(unpaired.chartRef)).toEqual([
            ['gold', 'silver', 'bronze'],
            ['gold', 'total', 'extra'],
        ]);
        expect(getModel(unpaired.api).paired).toBe(false);
    });

    test('updateChart paired regroups the series, syncs the toggle, and later updates keep it', async () => {
        const { api, chartRef } = await createChart('scatter');
        const toggle = await openDataTab(api, chartRef);
        expect(toggle.checked).toBe(true);

        await update(api, chartRef, { paired: false });

        expect(pairs(chartRef)).toEqual([
            ['gold', 'silver'],
            ['gold', 'bronze'],
        ]);
        expect(getModel(api).paired).toBe(false);
        await waitFor(() => expect(getPairedToggle().checked).toBe(false));

        await update(api, chartRef, { chartThemeOverrides: { common: { padding: { top: 11 } } } });
        expect(getModel(api).paired).toBe(false);
        expect(pairs(chartRef)).toHaveLength(2);
    });

    test('updateChart with a non-boolean paired warns and is rejected', async () => {
        const { api, chartRef } = await createChart('scatter');
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        enableDevValidations({ suppress: [316] });

        api.updateChart({ type: 'rangeChartUpdate', chartId: chartRef.chartId, paired: 'no' as any });

        expect(warn).toHaveBeenCalled();
        expect(getModel(api).paired).toBe(true);
        expect(pairs(chartRef)).toEqual([['gold', 'silver']]);
    });

    test('create with a non-boolean paired warns and falls back to paired', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        enableDevValidations({ suppress: [316] });
        const { api, chartRef } = await createChart('scatter', { paired: 'x' });

        expect(warn).toHaveBeenCalled();
        expect(getModel(api).paired).toBe(true);
        expect(pairs(chartRef)).toEqual([['gold', 'silver']]);
    });

    test('clicking the Paired Mode toggle flips the model without a scatter.paired option', async () => {
        const { api, chartRef } = await createChart('scatter');
        const toggle = await openDataTab(api, chartRef);

        toggle.click();

        await waitFor(() => expect(getModel(api).paired).toBe(false));
        expect((getModel(api).chartOptions as any).scatter?.paired).toBeUndefined();
        await waitFor(() => expect(pairs(chartRef)).toHaveLength(2));
    });

    describe('restoring a chart', () => {
        test('restores the saved paired value', async () => {
            const { api, chartRef } = await createChart('scatter', { paired: false });
            const model = getModel(api);
            expect(model.paired).toBe(false);

            chartRef.destroyChart();
            const restored = api.restoreChart(model)!;
            await restored.chart.waitForUpdate();

            expect(pairs(restored)).toHaveLength(2);
            expect(getModel(api).paired).toBe(false);
        });

        async function restoreLegacy(extra: Partial<ChartModel>) {
            const { api, chartRef } = await createChart('scatter', { paired: false });
            const saved = getModel(api);
            const { paired: _, ...rest } = saved;
            const legacy: ChartModel = {
                ...rest,
                // A model saved before paired moved to ChartModel; an older version routes it through upgradeChartModel.
                version: '36.2.0',
                chartOptions: {
                    ...saved.chartOptions,
                    scatter: { ...saved.chartOptions.scatter, paired: false } as any,
                },
                ...extra,
            };
            const snapshot = structuredClone(legacy);

            chartRef.destroyChart();
            const restored = api.restoreChart(legacy)!;
            await restored.chart.waitForUpdate();

            expect(legacy).toEqual(snapshot);
            return { api, restored };
        }

        test('a legacy scatter.paired false is read as a fallback, stripped, and the input is not mutated', async () => {
            const { api, restored } = await restoreLegacy({});

            expect(pairs(restored)).toHaveLength(2);
            expect(getModel(api).paired).toBe(false);
            expect((getModel(api).chartOptions as any).scatter?.paired).toBeUndefined();
        });

        test('an explicit paired true beats the legacy key', async () => {
            const { api, restored } = await restoreLegacy({ paired: true });

            expect(pairs(restored)).toEqual([['gold', 'silver']]);
            expect(getModel(api).paired).toBe(true);
        });
    });

    test('paired persists across chart type changes', async () => {
        const { api, chartRef } = await createChart('scatter', { paired: false });

        await update(api, chartRef, { chartType: 'bubble' });
        expect(getModel(api).paired).toBe(false);

        await update(api, chartRef, { chartType: 'line' });
        await update(api, chartRef, { chartType: 'scatter' });
        expect(getModel(api).paired).toBe(false);
        expect(pairs(chartRef)).toHaveLength(2);
    });
});
