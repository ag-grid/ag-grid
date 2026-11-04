import { getByRole, waitFor } from '@testing-library/dom';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { TestGridsManager, canvasPolyfill } from 'ag-test-utils';

import type { ChartType } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { CellSelectionModule, IntegratedChartsModule } from 'ag-grid-enterprise';

/**
 * Each pill list on the chart Set Up tab is a listbox, and must take its accessible name from the
 * title of the section it sits in.
 */
describe('chart data panel list names', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule, IntegratedChartsModule.with(AgChartsEnterpriseModule)],
    });

    beforeAll(async () => {
        await canvasPolyfill.init();
    });
    afterAll(() => canvasPolyfill.reset());
    afterEach(() => gridsManager.reset());

    async function openDataPanel(chartType: ChartType, switchCategorySeries?: boolean) {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'athlete', chartDataType: 'category' },
                { field: 'gold', chartDataType: 'series' },
                { field: 'silver', chartDataType: 'series' },
                { field: 'bronze', chartDataType: 'series' },
            ],
            rowData: [
                { athlete: 'Michael Phelps', gold: 8, silver: 0, bronze: 0 },
                { athlete: 'Natalie Coughlin', gold: 1, silver: 2, bronze: 3 },
            ],
            cellSelection: true,
            popupParent: document.body,
        });
        const chartRef = api.createRangeChart({
            cellRange: { columns: ['athlete', 'gold', 'silver', 'bronze'] },
            chartType,
            switchCategorySeries,
        })!;
        await chartRef.chart.waitForUpdate();

        api.openChartToolPanel({ chartId: chartRef.chartId, panel: 'data' });
        await chartRef.chart.waitForUpdate();
    }

    function getListbox(name: string) {
        return waitFor(() => getByRole(document.body, 'listbox', { name, hidden: true }));
    }

    test('the Series list is named "Series"', async () => {
        await openDataPanel('groupedColumn');

        const listbox = await getListbox('Series');

        for (const series of ['Gold', 'Silver', 'Bronze']) {
            expect(listbox.textContent).toContain(series);
        }
    });

    test('the scatter series list is named "X Y Values"', async () => {
        await openDataPanel('scatter');

        expect(await getListbox('X Y Values')).toBeDefined();
    });

    test('the switched category/series list is named "Category Values"', async () => {
        await openDataPanel('groupedColumn', true);

        expect(await getListbox('Category Values')).toBeDefined();
    });
});
