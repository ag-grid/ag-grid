import { getAllByRole, getByRole, waitFor } from '@testing-library/dom';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { TestGridsManager, canvasPolyfill } from 'ag-test-utils';

import type { ChartType } from 'ag-grid-community';
import { ClientSideRowModelModule, LocaleModule } from 'ag-grid-community';
import { CellSelectionModule, IntegratedChartsModule, RowGroupingModule } from 'ag-grid-enterprise';

/**
 * Each pill list on the chart Set Up tab is a listbox, and must take its accessible name from the
 * title of the section it sits in. Every combobox on the tab must also have a name.
 */
describe('chart data panel list and combobox names', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            CellSelectionModule,
            RowGroupingModule,
            LocaleModule,
            IntegratedChartsModule.with(AgChartsEnterpriseModule),
        ],
    });

    beforeAll(async () => {
        await canvasPolyfill.init();
    });
    afterAll(() => canvasPolyfill.reset());
    afterEach(() => gridsManager.reset());

    async function openDataPanel(
        chartType: ChartType,
        switchCategorySeries?: boolean,
        {
            columns = ['athlete', 'gold', 'silver', 'bronze'],
            aggFunc,
            localeText,
        }: { columns?: string[]; aggFunc?: string; localeText?: Record<string, string> } = {}
    ) {
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
            localeText,
        });
        const chartRef = api.createRangeChart({
            cellRange: { columns },
            chartType,
            switchCategorySeries,
            aggFunc,
        })!;
        await chartRef.chart.waitForUpdate();

        api.openChartToolPanel({ chartId: chartRef.chartId, panel: 'data' });
        await chartRef.chart.waitForUpdate();
    }

    function getListbox(name: string) {
        return waitFor(() => getByRole(document.body, 'listbox', { name, hidden: true }));
    }

    function getComboboxName(combobox: HTMLElement): string {
        const labelledBy = combobox.getAttribute('aria-labelledby');
        const label = labelledBy
            ? document.getElementById(labelledBy)?.textContent
            : combobox.getAttribute('aria-label');
        return label?.trim() ?? '';
    }

    function expectComboboxNames(expectedNames: string[]) {
        return waitFor(() => {
            const panel = document.querySelector<HTMLElement>('.ag-chart-data-wrapper')!;
            const names = getAllByRole(panel, 'combobox', { hidden: true }).map(getComboboxName);
            expect(names).not.toContain('');
            expect(names).toEqual(expect.arrayContaining(expectedNames));
        });
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

    test('the Categories, aggregation, add-series and Direction comboboxes are named', async () => {
        await openDataPanel('groupedColumn', false, { columns: ['athlete', 'gold', 'silver'], aggFunc: 'sum' });

        await expectComboboxNames(['Categories', 'Aggregation Function', 'Add a series', 'Direction']);
    });

    test('the single-series picker is named "Series"', async () => {
        await openDataPanel('pie');

        await expectComboboxNames(['Categories', 'Series']);
    });

    test('each combination chart series chart-type combobox is named for its series', async () => {
        await openDataPanel('columnLineCombo');

        await expectComboboxNames(['Categories', 'Gold Chart Type', 'Silver Chart Type', 'Bronze Chart Type']);
    });

    test('the series chart-type combobox name is localised', async () => {
        await openDataPanel('columnLineCombo', false, {
            localeText: { ariaChartSeriesChartType: 'Type for ${variable}' },
        });

        await expectComboboxNames(['Categories', 'Type for Gold', 'Type for Silver', 'Type for Bronze']);
    });
});
