import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';

import type { CreateRangeChartParams, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, setupAgTestIds } from 'ag-grid-community';
import { CellSelectionModule, IntegratedChartsModule, PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { TestGridsManager, canvasPolyfill } from '../test-utils';

describe('includeHiddenColumnsInCharts', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            CellSelectionModule,
            PivotModule,
            RowGroupingModule,
            IntegratedChartsModule.with(AgChartsEnterpriseModule),
        ],
    });

    const rowData = [
        { country: 'Russia', gold: 3, silver: 1 },
        { country: 'USA', gold: 4, silver: 2 },
    ];

    beforeAll(async () => {
        setupAgTestIds();
        await canvasPolyfill.init();
    });
    afterAll(() => canvasPolyfill.reset());
    afterEach(() => gridsManager.reset());

    async function createChartedGrid(gridOptions: GridOptions, chartParams: CreateRangeChartParams) {
        const api = await gridsManager.createGridAndWait('grid1', gridOptions);
        const chartRef = api.createRangeChart(chartParams);
        return { api, chartRef };
    }

    describe('a value column already hidden when the chart is created', () => {
        test.each([
            { includeHiddenColumnsInCharts: undefined, expectSilver: true },
            { includeHiddenColumnsInCharts: true, expectSilver: true },
            { includeHiddenColumnsInCharts: false, expectSilver: false },
        ])(
            'option $includeHiddenColumnsInCharts -> silver charted: $expectSilver',
            async ({ includeHiddenColumnsInCharts, expectSilver }) => {
                const { api } = await createChartedGrid(
                    {
                        includeHiddenColumnsInCharts,
                        columnDefs: [{ field: 'country' }, { field: 'gold' }, { field: 'silver', hide: true }],
                        rowData,
                    },
                    { cellRange: { columns: ['country', 'gold', 'silver'] }, chartType: 'groupedColumn' }
                );

                // The chart's persisted cellRange is only re-derived from column selection state on the
                // next grid update after creation, so force one here to observe the settled state.
                api.setGridOption('rowData', rowData);

                const [chartModel] = api.getChartModels()!;
                expect(chartModel.cellRange.columns).toEqual(
                    expectSilver ? ['country', 'gold', 'silver'] : ['country', 'gold']
                );
            }
        );
    });

    describe('hiding a charted value column after the chart is created', () => {
        test('option true (default): column stays in the chart', async () => {
            const { api } = await createChartedGrid(
                { columnDefs: [{ field: 'country' }, { field: 'gold' }, { field: 'silver' }], rowData },
                { cellRange: { columns: ['country', 'gold', 'silver'] }, chartType: 'groupedColumn' }
            );

            api.setColumnsVisible(['silver'], false);

            const [chartModel] = api.getChartModels()!;
            expect(chartModel.cellRange.columns).toEqual(['country', 'gold', 'silver']);
        });

        test('option false: column is removed from the chart', async () => {
            const { api } = await createChartedGrid(
                {
                    includeHiddenColumnsInCharts: false,
                    columnDefs: [{ field: 'country' }, { field: 'gold' }, { field: 'silver' }],
                    rowData,
                },
                { cellRange: { columns: ['country', 'gold', 'silver'] }, chartType: 'groupedColumn' }
            );

            api.setColumnsVisible(['silver'], false);

            const [chartModel] = api.getChartModels()!;
            expect(chartModel.cellRange.columns).toEqual(['country', 'gold']);
        });

        test('option true: explicitly narrowing the chart range still removes a hidden column, and it stays removed', async () => {
            const { api, chartRef } = await createChartedGrid(
                { columnDefs: [{ field: 'country' }, { field: 'gold' }, { field: 'silver' }], rowData },
                { cellRange: { columns: ['country', 'gold', 'silver'] }, chartType: 'groupedColumn' }
            );

            api.setColumnsVisible(['silver'], false);
            api.updateChart({
                type: 'rangeChartUpdate',
                chartId: chartRef!.chartId,
                cellRange: { columns: ['country', 'gold'] },
            });

            expect(api.getChartModels()![0].cellRange.columns).toEqual(['country', 'gold']);

            // A subsequent, unrelated grid update must not resurrect the narrowed-out hidden column.
            api.setGridOption('rowData', rowData);

            expect(api.getChartModels()![0].cellRange.columns).toEqual(['country', 'gold']);
        });

        test('option true: removing the column from columnDefs entirely still drops it', async () => {
            const { api } = await createChartedGrid(
                { columnDefs: [{ field: 'country' }, { field: 'gold' }, { field: 'silver' }], rowData },
                { cellRange: { columns: ['country', 'gold', 'silver'] }, chartType: 'groupedColumn' }
            );

            api.setGridOption('columnDefs', [{ field: 'country' }, { field: 'gold' }]);

            const [chartModel] = api.getChartModels()!;
            expect(chartModel.cellRange.columns).toEqual(['country', 'gold']);
        });

        test('option true: re-showing a retained column keeps a single selection', async () => {
            const { api } = await createChartedGrid(
                { columnDefs: [{ field: 'country' }, { field: 'gold' }, { field: 'silver' }], rowData },
                { cellRange: { columns: ['country', 'gold', 'silver'] }, chartType: 'groupedColumn' }
            );

            api.setColumnsVisible(['silver'], false);
            api.setColumnsVisible(['silver'], true);

            const [chartModel] = api.getChartModels()!;
            expect(chartModel.cellRange.columns).toEqual(['country', 'gold', 'silver']);
        });
    });

    describe('hiding the dimension column after the chart is created', () => {
        test('option true (default): dimension stays selected', async () => {
            const { api } = await createChartedGrid(
                { columnDefs: [{ field: 'country' }, { field: 'gold' }], rowData },
                { cellRange: { columns: ['country', 'gold'] }, chartType: 'groupedColumn' }
            );

            api.setColumnsVisible(['country'], false);

            const [chartModel] = api.getChartModels()!;
            expect(chartModel.cellRange.columns).toEqual(['country', 'gold']);
        });

        test('option false: chart falls back to the default category', async () => {
            const { api } = await createChartedGrid(
                { includeHiddenColumnsInCharts: false, columnDefs: [{ field: 'country' }, { field: 'gold' }], rowData },
                { cellRange: { columns: ['country', 'gold'] }, chartType: 'groupedColumn' }
            );

            api.setColumnsVisible(['country'], false);

            const [chartModel] = api.getChartModels()!;
            expect(chartModel.cellRange.columns).toEqual(['gold']);
        });

        test('switching from a multi-dimension to a single-dimension chart type retains only one dimension', async () => {
            const { api, chartRef } = await createChartedGrid(
                {
                    columnDefs: [{ field: 'category1' }, { field: 'category2' }, { field: 'value' }],
                    rowData: [
                        { category1: 'a', category2: 'x', value: 3 },
                        { category1: 'b', category2: 'y', value: 4 },
                    ],
                },
                { cellRange: { columns: ['category1', 'category2', 'value'] }, chartType: 'treemap' }
            );

            // treemap supports multiple dimensions, so both are selected and both are then hidden.
            api.setColumnsVisible(['category1', 'category2'], false);

            api.updateChart({
                type: 'rangeChartUpdate',
                chartId: chartRef!.chartId,
                chartType: 'groupedColumn',
                cellRange: { columns: ['category1', 'category2', 'value'] },
            });

            // groupedColumn only supports a single dimension - retention must not double-select.
            const [chartModel] = api.getChartModels()!;
            expect(chartModel.cellRange.columns).toEqual(['category1', 'value']);
        });
    });

    describe('pivot charts', () => {
        const pivotGridOptions: GridOptions = {
            columnDefs: [
                { field: 'sport', rowGroup: true },
                { field: 'country', pivot: true },
                { field: 'gold', aggFunc: 'sum' },
            ],
            pivotMode: true,
            rowData: [
                { sport: 'Gymnastics', country: 'Russia', gold: 3 },
                { sport: 'Gymnastics', country: 'USA', gold: 4 },
            ],
        };

        // Pivot charts have no manual column selection UI - their columns always mirror the grid's
        // currently displayed columns 1:1, so includeHiddenColumnsInCharts does not apply to them.
        test.each([{ includeHiddenColumnsInCharts: undefined }, { includeHiddenColumnsInCharts: true }])(
            'option $includeHiddenColumnsInCharts is ignored: a hidden pivot result column is excluded',
            async ({ includeHiddenColumnsInCharts }) => {
                const api = await gridsManager.createGridAndWait('grid1', {
                    ...pivotGridOptions,
                    includeHiddenColumnsInCharts,
                });

                api.setColumnsVisible(['pivot_country_USA_gold'], false);
                api.createPivotChart({ chartType: 'groupedColumn' });

                const [chartModel] = api.getChartModels()!;
                expect(chartModel.cellRange.columns).toEqual(['ag-Grid-AutoColumn', 'pivot_country_Russia_gold']);
            }
        );
    });

    describe('cross-filter charts', () => {
        // Cross-filter dimension selection matches by colId (see resetColumnState's crossFiltering branch),
        // never by visibility, so it was never subject to the regression this option fixes. This test guards
        // against that pre-existing behaviour being disturbed by the changes here, not the option itself.
        test('hiding the dimension column does not affect cross-filter dimension selection', async () => {
            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [{ field: 'country' }, { field: 'gold' }],
                rowData,
            });

            api.createCrossFilterChart({
                cellRange: { columns: ['country', 'gold'] },
                chartType: 'column',
                aggFunc: 'sum',
            });

            api.setColumnsVisible(['country'], false);

            const [chartModel] = api.getChartModels()!;
            expect(chartModel.cellRange.columns).toEqual(['country', 'gold']);
        });
    });
});
