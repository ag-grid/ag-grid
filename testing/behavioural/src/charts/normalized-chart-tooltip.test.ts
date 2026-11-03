import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import type {
    AgAxisLabelFormatterParams,
    AgCartesianChartOptions,
    AgChartThemeOverrides,
    AgNumberAxisOptions,
} from 'ag-charts-types';
import { TestGridsManager, canvasPolyfill } from 'ag-test-utils';

import type { ChartRef, ChartType, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, setupAgTestIds } from 'ag-grid-community';
import { CellSelectionModule, IntegratedChartsModule } from 'ag-grid-enterprise';

import { deproxy } from '../../../../packages/ag-grid-enterprise/src/charts/chartComp/utils/integration';

// AG Charts formats tooltips and series labels with the value axis label formatter when they have none of their own,
// and tells it which element it is formatting through `source`. Those show raw values, so the '%' must not apply.
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

    async function createChart(chartType: ChartType, gridOptions: GridOptions = {}): Promise<ChartRef> {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'period', chartDataType: 'category' },
                { field: 'recurring' },
                { field: 'individual' },
            ],
            rowData: [
                { period: 'Q1 2021', recurring: 485829, individual: 237438 },
                { period: 'Q2 2021', recurring: 512743, individual: 245672 },
            ],
            ...gridOptions,
        });
        const chartRef = api.createRangeChart({
            cellRange: { columns: ['period', 'recurring', 'individual'] },
            chartType,
        })!;
        await chartRef.chart.waitForUpdate();
        return chartRef;
    }

    // Processed options re-key a horizontal chart's axes by direction, so find the value axis by type.
    function formatValueAxisLabel(chartRef: ChartRef, value: number, source: AgAxisLabelFormatterParams['source']) {
        const { axes } = deproxy(chartRef.chart).chartOptions.processedOptions as AgCartesianChartOptions;
        const valueAxis = Object.values(axes!).find((axis) => axis?.type === 'number') as AgNumberAxisOptions;
        const formatter = valueAxis.label!.formatter!;
        return formatter({ type: 'number', value, index: 0, domain: [0, 100], boundSeries: [], source });
    }

    const ptsFormatter = { formatter: ({ value }: AgAxisLabelFormatterParams) => `${value} pts` };

    test.each<ChartType>(['normalizedColumn', 'normalizedBar', 'normalizedLine', 'normalizedArea'])(
        '%s - value axis labels and the crosshair show percentages, tooltips and series labels keep raw values',
        async (chartType) => {
            const chartRef = await createChart(chartType);

            expect(formatValueAxisLabel(chartRef, 40, 'axis-label')).toBe('40%');
            expect(formatValueAxisLabel(chartRef, 40, 'crosshair')).toBe('40%');
            expect(formatValueAxisLabel(chartRef, 237438, 'tooltip')).toBeUndefined();
            expect(formatValueAxisLabel(chartRef, 237438, 'series-label')).toBeUndefined();
        }
    );

    test.each<ChartType>(['normalizedColumn', 'normalizedBar', 'normalizedLine', 'normalizedArea'])(
        '%s - a common theme value axis label formatter replaces the percentage',
        async (chartType) => {
            const chartThemeOverrides: AgChartThemeOverrides = {
                common: { axes: { number: { label: ptsFormatter } } },
            };
            const chartRef = await createChart(chartType, { chartThemeOverrides });

            expect(formatValueAxisLabel(chartRef, 40, 'axis-label')).toBe('40 pts');
        }
    );

    test.each<{ name: string; chartType: ChartType; gridOptions: GridOptions }>([
        {
            name: 'series-type override',
            chartType: 'normalizedColumn',
            gridOptions: { chartThemeOverrides: { bar: { axes: { number: { label: ptsFormatter } } } } },
        },
        {
            name: 'axis position override',
            chartType: 'normalizedBar',
            gridOptions: { chartThemeOverrides: { common: { axes: { number: { bottom: { label: ptsFormatter } } } } } },
        },
        {
            name: 'custom chart theme',
            chartType: 'normalizedColumn',
            gridOptions: {
                customChartThemes: {
                    pointsTheme: {
                        baseTheme: 'ag-default',
                        overrides: { common: { axes: { number: { label: ptsFormatter } } } },
                    },
                },
                chartThemes: ['pointsTheme'],
            },
        },
    ])('a value axis label formatter from a $name replaces the percentage', async ({ chartType, gridOptions }) => {
        const chartRef = await createChart(chartType, gridOptions);

        expect(formatValueAxisLabel(chartRef, 40, 'axis-label')).toBe('40 pts');
    });
});
