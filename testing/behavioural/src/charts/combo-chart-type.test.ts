import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';

import type { ChartType, GridApi, SeriesChartType } from 'ag-grid-community';
import { ClientSideRowModelModule, setupAgTestIds } from 'ag-grid-community';
import { CellSelectionModule, IntegratedChartsModule, RowGroupingModule } from 'ag-grid-enterprise';

import { TestGridsManager, canvasPolyfill } from '../test-utils';

describe('combo chart type', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            CellSelectionModule,
            RowGroupingModule,
            IntegratedChartsModule.with(AgChartsEnterpriseModule),
        ],
    });

    const rowData = [
        { period: 'Q1', recurring: 10, individual: 4 },
        { period: 'Q2', recurring: 12, individual: 6 },
    ];

    beforeAll(async () => {
        setupAgTestIds();
        await canvasPolyfill.init();
    });
    afterAll(() => canvasPolyfill.reset());
    afterEach(() => gridsManager.reset());

    async function createComboChartedGrid(chartType: ChartType, seriesChartTypes?: SeriesChartType[]) {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'period', chartDataType: 'category' },
                { field: 'recurring', chartDataType: 'series' },
                { field: 'individual', chartDataType: 'series' },
            ],
            rowData,
            cellSelection: true,
        });
        const chartContainer = document.body.appendChild(document.createElement('div'));
        const chartRef = api.createRangeChart({
            chartContainer,
            cellRange: { columns: ['period', 'recurring', 'individual'] },
            chartType,
            seriesChartTypes,
        })!;
        return { api, chartId: chartRef.chartId };
    }

    function chartState(api: GridApi) {
        const [chartModel] = api.getChartModels()!;
        return { chartType: chartModel.chartType, seriesChartTypes: chartModel.seriesChartTypes };
    }

    describe('a built-in combo stays built-in across reactive chart updates', () => {
        const COLUMN_LINE_SERIES: SeriesChartType[] = [
            { colId: 'recurring', chartType: 'groupedColumn', secondaryAxis: false },
            { colId: 'individual', chartType: 'line', secondaryAxis: false },
        ];
        const AREA_COLUMN_SERIES: SeriesChartType[] = [
            { colId: 'recurring', chartType: 'stackedArea', secondaryAxis: false },
            { colId: 'individual', chartType: 'groupedColumn', secondaryAxis: false },
        ];

        test.each([
            { chartType: 'columnLineCombo' as ChartType, expectedSeries: COLUMN_LINE_SERIES },
            { chartType: 'areaColumnCombo' as ChartType, expectedSeries: AREA_COLUMN_SERIES },
        ])('$chartType survives a chartThemes change', async ({ chartType, expectedSeries }) => {
            const { api } = await createComboChartedGrid(chartType);
            expect(chartState(api)).toEqual({ chartType, seriesChartTypes: expectedSeries });

            api.setGridOption('chartThemes', ['ag-material', 'ag-default']);

            expect(chartState(api)).toEqual({ chartType, seriesChartTypes: expectedSeries });
        });

        test('columnLineCombo survives a rangeChartUpdate that omits seriesChartTypes', async () => {
            const { api, chartId } = await createComboChartedGrid('columnLineCombo');

            api.updateChart({ type: 'rangeChartUpdate', chartId });

            expect(chartState(api)).toEqual({
                chartType: 'columnLineCombo',
                seriesChartTypes: COLUMN_LINE_SERIES,
            });
        });

        test('switching between the built-in combos recomposes the series', async () => {
            const { api, chartId } = await createComboChartedGrid('columnLineCombo');

            api.updateChart({ type: 'rangeChartUpdate', chartId, chartType: 'areaColumnCombo' });
            expect(chartState(api)).toEqual({
                chartType: 'areaColumnCombo',
                seriesChartTypes: AREA_COLUMN_SERIES,
            });

            api.updateChart({ type: 'rangeChartUpdate', chartId, chartType: 'columnLineCombo' });
            expect(chartState(api)).toEqual({
                chartType: 'columnLineCombo',
                seriesChartTypes: COLUMN_LINE_SERIES,
            });
        });
    });

    describe('a custom combo remains custom', () => {
        const CUSTOM_SERIES: SeriesChartType[] = [
            { colId: 'recurring', chartType: 'stackedColumn', secondaryAxis: false },
            { colId: 'individual', chartType: 'line', secondaryAxis: true },
        ];

        test('supplied seriesChartTypes make the chart a customCombo', async () => {
            const { api } = await createComboChartedGrid('customCombo', CUSTOM_SERIES);

            expect(chartState(api)).toEqual({ chartType: 'customCombo', seriesChartTypes: CUSTOM_SERIES });
        });

        test('supplied seriesChartTypes without a combo chart type still make the chart a customCombo', async () => {
            const { api } = await createComboChartedGrid('groupedColumn', CUSTOM_SERIES);

            expect(chartState(api)).toEqual({ chartType: 'customCombo', seriesChartTypes: CUSTOM_SERIES });
        });

        test('customCombo survives a chartThemes change', async () => {
            const { api } = await createComboChartedGrid('customCombo', CUSTOM_SERIES);

            api.setGridOption('chartThemes', ['ag-material', 'ag-default']);

            expect(chartState(api)).toEqual({ chartType: 'customCombo', seriesChartTypes: CUSTOM_SERIES });
        });

        test('supplying seriesChartTypes to a built-in combo converts it to a customCombo', async () => {
            const { api, chartId } = await createComboChartedGrid('columnLineCombo');

            api.updateChart({ type: 'rangeChartUpdate', chartId, seriesChartTypes: CUSTOM_SERIES });
            expect(chartState(api)).toEqual({ chartType: 'customCombo', seriesChartTypes: CUSTOM_SERIES });

            // the conversion is sticky: a later reactive update must not revert to the built-in type
            api.setGridOption('chartThemes', ['ag-material', 'ag-default']);
            expect(chartState(api)).toEqual({ chartType: 'customCombo', seriesChartTypes: CUSTOM_SERIES });
        });
    });
});
