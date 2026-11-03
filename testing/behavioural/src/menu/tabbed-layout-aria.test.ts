import { waitFor } from '@testing-library/dom';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { TestGridsManager, canvasPolyfill, polyfillOffsetParent } from 'ag-test-utils';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { CellSelectionModule, ColumnMenuModule, IntegratedChartsModule } from 'ag-grid-enterprise';

/**
 * Shared tabbed layout, rendered by both the chart tool panel and the legacy column menu. Only the
 * active tab's body is attached, so there is one tabpanel, relabelled by whichever tab is selected.
 */
describe('tabbed layout aria', () => {
    const chartGrids = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule, IntegratedChartsModule.with(AgChartsEnterpriseModule)],
    });
    const menuGrids = new TestGridsManager({ modules: [ClientSideRowModelModule, ColumnMenuModule] });
    let restoreOffsetParent: () => void;

    beforeAll(async () => {
        await canvasPolyfill.init();
    });
    afterAll(() => canvasPolyfill.reset());
    beforeEach(() => {
        restoreOffsetParent = polyfillOffsetParent();
    });
    afterEach(() => {
        chartGrids.reset();
        menuGrids.reset();
        restoreOffsetParent();
    });

    const openChartToolPanel = async () => {
        const api = await chartGrids.createGridAndWait('tabbed-layout-chart', {
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
        api.openChartToolPanel({ chartId: chartRef.chartId });
    };

    const openLegacyColumnMenu = async () => {
        const api: GridApi = await menuGrids.createGridAndWait('tabbed-layout-menu', {
            columnDefs: [{ field: 'value' }],
            rowData: [{ value: 1 }],
            columnMenu: 'legacy',
        });
        api.showColumnMenu('value');
    };

    const getTabs = (tablist: Element) => Array.from(tablist.querySelectorAll<HTMLElement>('[role="tab"]'));

    const expectSelected = (tablist: Element, selected: HTMLElement) => {
        const tabs = getTabs(tablist);
        expect(tabs.map((tab) => tab.getAttribute('aria-selected'))).toEqual(
            tabs.map((tab) => String(tab === selected))
        );

        const panels = tablist.closest('.ag-tabs')!.querySelectorAll<HTMLElement>('[role="tabpanel"]');
        expect(panels).toHaveLength(1);
        const [panel] = panels;
        expect(selected.id).not.toBe('');
        expect(panel.getAttribute('aria-labelledby')).toBe(selected.id);
        expect(selected.getAttribute('aria-controls')).toBe(panel.id);
        expect(document.getElementById(panel.id)).toBe(panel);
    };

    test.each([
        ['chart tool panel', openChartToolPanel],
        ['legacy column menu', openLegacyColumnMenu],
    ])('%s exposes the selected tab and its tabpanel', async (_surface, open) => {
        await open();

        const tablist = await waitFor(() => {
            const el = document.querySelector('.ag-tabs [role="tablist"]');
            expect(el).not.toBeNull();
            expect(getTabs(el!).length).toBeGreaterThan(1);
            return el!;
        });
        const tabs = getTabs(tablist);

        expectSelected(tablist, tabs[0]);

        tabs[1].click();
        expectSelected(tablist, tabs[1]);
        expect(tabs[0].hasAttribute('aria-controls')).toBe(false);

        tabs[0].click();
        expectSelected(tablist, tabs[0]);
    });
});
