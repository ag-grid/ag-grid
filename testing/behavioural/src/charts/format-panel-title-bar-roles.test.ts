import { waitFor } from '@testing-library/dom';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { TestGridsManager, canvasPolyfill } from 'ag-test-utils';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { CellSelectionModule, IntegratedChartsModule } from 'ag-grid-enterprise';

/**
 * Aria contract of the format panel's group title bars, in its own suite because the sibling
 * `format-panel-options-*` suites own the option *bindings*, not the panel DOM. The format panel is
 * the one surface reachable through the public API that renders both title-bar states of the shared
 * group component: expandable groups (disclosure buttons) and non-collapsible groups, which have
 * their open/close icons suppressed and must not present as disclosure buttons.
 */
describe('chart format panel title bar roles', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule, IntegratedChartsModule.with(AgChartsEnterpriseModule)],
    });

    beforeAll(async () => {
        await canvasPolyfill.init();
    });
    afterAll(() => canvasPolyfill.reset());
    afterEach(() => gridsManager.reset());

    test('expandable groups are disclosure buttons; non-collapsible groups are plain groups', async () => {
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

        // The format panel builds its groups on the controller's next chartUpdated event, so poll
        // for the panel DOM rather than assuming it is present once the chart has settled.
        const topLevel = await waitFor(() => {
            const titleBar = document.querySelector('.ag-charts-format-top-level-group-title-bar');
            expect(titleBar).not.toBeNull();
            return titleBar!;
        });

        // Top-level accordion groups (Chart, Legend, ...) expand and collapse: disclosure buttons,
        // announcing their state and wired via aria-controls to the container they show/hide.
        expect(topLevel?.getAttribute('role')).toBe('button');
        expect(topLevel?.getAttribute('tabindex')).toBe('0');
        expect(topLevel?.hasAttribute('aria-expanded')).toBe(true);
        const controlled = document.getElementById(topLevel?.getAttribute('aria-controls') ?? '');
        expect(controlled?.classList.contains('ag-group-container')).toBe(true);

        // The Padding sub-group cannot collapse (open/close icons suppressed), so it is a labelled
        // group with no disclosure state — but still focusable for keyboard navigation.
        const subLevelBars = Array.from(document.querySelectorAll('.ag-charts-format-sub-level-group-title-bar'));
        const padding = subLevelBars.find(
            (bar) => bar.querySelector('.ag-group-title')?.textContent?.trim() === 'Padding'
        );
        expect(padding).toBeDefined();
        expect(padding?.getAttribute('role')).toBe('group');
        expect(padding?.getAttribute('tabindex')).toBe('0');
        expect(padding?.hasAttribute('aria-expanded')).toBe(false);
        expect(padding?.hasAttribute('aria-controls')).toBe(false);
    });
});
