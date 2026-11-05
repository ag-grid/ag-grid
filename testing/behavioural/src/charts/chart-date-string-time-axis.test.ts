import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { TestGridsManager, canvasPolyfill } from 'ag-test-utils';

import { ClientSideRowModelModule, setupAgTestIds } from 'ag-grid-community';
import { CellSelectionModule, IntegratedChartsModule } from 'ag-grid-enterprise';

describe('charted date strings on a time axis', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule, IntegratedChartsModule.with(AgChartsEnterpriseModule)],
    });

    beforeAll(async () => {
        setupAgTestIds();
        await canvasPolyfill.init();
    });
    afterAll(() => canvasPolyfill.reset());
    afterEach(() => gridsManager.reset());

    test.each([
        [false, '2020-10-10T10:10:10.000Z'],
        [true, new Date(2020, 9, 10, 12, 10, 10).toISOString()],
    ])('a dateTimeString category with suppressTimezoneConversion %s', async (suppressTimezoneConversion, expected) => {
        const api = await gridsManager.createGridAndWait('grid1', {
            suppressTimezoneConversion,
            columnDefs: [
                { field: 'at', cellDataType: 'dateTimeString', chartDataType: 'time' },
                { field: 'gold', chartDataType: 'series' },
            ],
            rowData: [{ at: '2020-10-10T12:10:10+02:00', gold: 1 }],
        });

        const chartRef = api.createRangeChart({ cellRange: { columns: ['at', 'gold'] }, chartType: 'line' })!;
        await chartRef.chart.waitForUpdate();

        const { data } = chartRef.chart.getOptions() as unknown as { data: { at: Date }[] };
        expect(data[0].at.toISOString()).toBe(expected);
    });
});
