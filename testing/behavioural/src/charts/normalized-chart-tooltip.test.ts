import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import type { AgAxisLabelFormatterParams, AgCartesianChartOptions } from 'ag-charts-types';
import { TestGridsManager, canvasPolyfill } from 'ag-test-utils';

import type { ChartRef, ChartType } from 'ag-grid-community';
import { ClientSideRowModelModule, setupAgTestIds } from 'ag-grid-community';
import { CellSelectionModule, IntegratedChartsModule } from 'ag-grid-enterprise';

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

    async function createChart(chartType: ChartType): Promise<ChartRef> {
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
        });
        const chartRef = api.createRangeChart({
            cellRange: { columns: ['period', 'recurring', 'individual'] },
            chartType,
        })!;
        await chartRef.chart.waitForUpdate();
        return chartRef;
    }

    function formatValueAxisLabel(chartRef: ChartRef, value: number, source: AgAxisLabelFormatterParams['source']) {
        const { axes } = chartRef.chart.getOptions() as AgCartesianChartOptions;
        const formatter = axes!.y.label!.formatter!;
        return formatter({ type: 'number', value, index: 0, domain: [0, 100], boundSeries: [], source });
    }

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
});
