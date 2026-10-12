import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { TestGridsManager, canvasPolyfill } from 'ag-test-utils';

import type { ChartRef, ChartType, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, setupAgTestIds } from 'ag-grid-community';
import { CellSelectionModule, IntegratedChartsModule } from 'ag-grid-enterprise';

// AG Charts formats tooltip values with the axis label formatter, so the axis '%' suffix must not leak into tooltips.
describe('normalized (100% stacked) integrated charts', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule, IntegratedChartsModule.with(AgChartsEnterpriseModule)],
    });

    beforeAll(async () => {
        setupAgTestIds();
        await canvasPolyfill.init();
    });
    afterAll(() => canvasPolyfill.reset());
    afterEach(() => gridsManager.reset());

    async function createChart(
        chartType: ChartType,
        gridOptions: GridOptions = {}
    ): Promise<{ api: GridApi; chartRef: ChartRef }> {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...gridOptions,
            columnDefs: [
                { field: 'period', chartDataType: 'category' },
                { field: 'recurring' },
                { field: 'individual' },
            ],
            rowData: [
                { period: 'Q1 2021', recurring: 485829, individual: 237438 },
                { period: 'Q2 2021', recurring: 512743, individual: 245672 },
            ],
        });
        const chartRef = api.createRangeChart({
            cellRange: { columns: ['period', 'recurring', 'individual'] },
            chartType,
        })!;
        await chartRef.chart.waitForUpdate();
        return { api, chartRef };
    }

    // The public AgChartInstance does not expose rendered tooltip or tick text, so read it from the chart it wraps.
    function getRenderedText(chartRef: ChartRef) {
        const chart = (chartRef.chart as any).chart;

        const individualSeries = chart.series.find((s: any) => s.options.yKey === 'individual');
        const tooltip = individualSeries.getTooltipContent(0, undefined);
        const tooltipValues: string[] = tooltip.data.map((d: any) => d.value);

        const valueAxis = chart.axes.find((a: any) => a.type === 'number');
        const tickLabels: string[] = [];
        valueAxis.tickLabelGroupSelection.each((node: any) => tickLabels.push(node.text));

        return { tooltipValues, tickLabels };
    }

    async function switchChartType(api: GridApi, chartRef: ChartRef, chartType: ChartType): Promise<ChartRef> {
        api.updateChart({ type: 'rangeChartUpdate', chartId: chartRef.chartId, chartType });
        const updatedRef = api.getChartRef(chartRef.chartId)!;
        await updatedRef.chart.waitForUpdate();
        return updatedRef;
    }

    const PERCENT_TICKS = ['0%', '20%', '40%', '60%', '80%', '100%'];

    test.each<ChartType>(['normalizedColumn', 'normalizedBar', 'normalizedLine', 'normalizedArea'])(
        '%s - tooltip shows the raw value, the value axis shows percentages',
        async (chartType) => {
            const { chartRef } = await createChart(chartType);

            const { tooltipValues, tickLabels } = getRenderedText(chartRef);
            expect(tooltipValues).toEqual(['237438']);
            expect(tickLabels).toEqual(PERCENT_TICKS);
        }
    );

    test.each<ChartType>(['normalizedColumn', 'normalizedBar', 'normalizedLine', 'normalizedArea'])(
        '%s - a global theme formatter still formats tooltips, the value axis keeps percentages',
        async (chartType) => {
            const { chartRef } = await createChart(chartType, {
                chartThemeOverrides: {
                    common: { formatter: (params) => (params.type === 'number' ? `£${params.value}` : undefined) },
                },
            });

            const { tooltipValues, tickLabels } = getRenderedText(chartRef);
            expect(tooltipValues).toEqual(['£237438']);
            expect(tickLabels).toEqual(PERCENT_TICKS);
        }
    );

    test('a theme y format string still formats tooltips, the value axis keeps percentages', async () => {
        const { chartRef } = await createChart('normalizedColumn', {
            chartThemeOverrides: { common: { formatter: { y: ',.0f' } } },
        });

        const { tooltipValues, tickLabels } = getRenderedText(chartRef);
        expect(tooltipValues).toEqual(['237,438']);
        expect(tickLabels).toEqual(PERCENT_TICKS);
    });

    const pounds = (params: { value: unknown }) => `£${params.value}`;
    const quarter = (params: { value: unknown }) => `Q ${params.value}`;
    test.each<[string, GridOptions]>([
        [
            'a custom theme y and an override x',
            {
                customChartThemes: {
                    pounds: { baseTheme: 'ag-default', overrides: { common: { formatter: { y: pounds } } } },
                },
                chartThemes: ['pounds'],
                chartThemeOverrides: { common: { formatter: { x: quarter } } },
            },
        ],
        [
            'a common y and a series-type x',
            { chartThemeOverrides: { common: { formatter: { y: pounds } }, bar: { formatter: { x: quarter } } } },
        ],
    ])('theme formatters keyed by property merge across %s', async (_, gridOptions) => {
        const { chartRef } = await createChart('normalizedColumn', gridOptions);

        const { tooltipValues, tickLabels } = getRenderedText(chartRef);
        expect(tooltipValues).toEqual(['£237438']);
        expect(tickLabels).toEqual(PERCENT_TICKS);
    });

    test('switching from normalizedColumn to stackedColumn removes the percentage ticks', async () => {
        const { api, chartRef } = await createChart('normalizedColumn');

        const { tooltipValues, tickLabels } = getRenderedText(await switchChartType(api, chartRef, 'stackedColumn'));
        expect(tooltipValues).toEqual(['237438']);
        expect(tickLabels.length).toBeGreaterThan(0);
        expect(tickLabels.some((label) => label.includes('%'))).toBe(false);
    });

    test('switching from groupedColumn to normalizedColumn applies the percentage ticks only', async () => {
        const { api, chartRef } = await createChart('groupedColumn');

        const { tooltipValues, tickLabels } = getRenderedText(await switchChartType(api, chartRef, 'normalizedColumn'));
        expect(tooltipValues).toEqual(['237438']);
        expect(tickLabels).toEqual(PERCENT_TICKS);
    });
});
