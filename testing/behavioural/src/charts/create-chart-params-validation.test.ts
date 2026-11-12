import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { TestGridsManager, canvasPolyfill } from 'ag-test-utils';

import type { ChartType } from 'ag-grid-community';
import { ClientSideRowModelModule, enableDevValidations } from 'ag-grid-community';
import { CellSelectionModule, IntegratedChartsModule } from 'ag-grid-enterprise';

describe('create chart params validation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule, IntegratedChartsModule.with(AgChartsEnterpriseModule)],
    });

    beforeAll(async () => {
        await canvasPolyfill.init();
    });
    afterAll(() => canvasPolyfill.reset());
    afterEach(() => {
        enableDevValidations({ suppress: [] });
        vi.restoreAllMocks();
        gridsManager.reset();
    });

    test('an unknown chart type warns and creates no chart', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'country', chartDataType: 'category' },
                { field: 'gold', chartDataType: 'series' },
            ],
            rowData: [
                { country: 'Russia', gold: 3 },
                { country: 'USA', gold: 4 },
            ],
            cellSelection: true,
            popupParent: document.body,
        });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        enableDevValidations({ suppress: [316] });

        const chartRef = api.createRangeChart({
            cellRange: { columns: ['country', 'gold'] },
            chartType: 'doughnut' as ChartType,
        });

        expect(chartRef).toBeUndefined();
        expect(warn.mock.calls.flat().join(' ')).toContain('`chartType: doughnut`, expected `ChartType`');
        expect(api.getChartModels()).toEqual([]);
    });
});
