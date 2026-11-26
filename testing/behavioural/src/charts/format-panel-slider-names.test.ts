import { getByRole, waitFor } from '@testing-library/dom';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { TestGridsManager, canvasPolyfill } from 'ag-test-utils';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { CellSelectionModule, IntegratedChartsModule } from 'ag-grid-enterprise';

/**
 * Each format panel slider shows its label above a range input and a number input. Both inputs
 * must take their accessible name from that visible label, as neither carries one of its own.
 */
describe('chart format panel slider names', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule, IntegratedChartsModule.with(AgChartsEnterpriseModule)],
    });

    beforeAll(async () => {
        await canvasPolyfill.init();
    });
    afterAll(() => canvasPolyfill.reset());
    afterEach(() => gridsManager.reset());

    async function openFormatPanel() {
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
        const chartRef = api.createRangeChart({
            cellRange: { columns: ['country', 'gold'] },
            chartType: 'groupedColumn',
        })!;
        await chartRef.chart.waitForUpdate();

        api.openChartToolPanel({ chartId: chartRef.chartId, panel: 'format' });
        await chartRef.chart.waitForUpdate();

        return waitFor(() => {
            const sliders = Array.from(document.querySelectorAll<HTMLElement>('.ag-slider'));
            expect(sliders.length).toBeGreaterThan(0);
            return sliders;
        });
    }

    test('every slider and its number input are named by the visible label', async () => {
        const sliders = await openFormatPanel();

        const labels = sliders.map((slider) => {
            const label = slider.querySelector<HTMLElement>(':scope > .ag-label')!.textContent!;
            expect(getByRole(slider, 'slider', { name: label, hidden: true })).toBeDefined();
            expect(getByRole(slider, 'spinbutton', { name: label, hidden: true })).toBeDefined();
            return label;
        });

        expect(labels).toEqual(expect.arrayContaining(['Top', 'Right', 'Bottom', 'Left']));
    });
});
