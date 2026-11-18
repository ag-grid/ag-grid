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

    const groupName = (container: Element | null | undefined): string | undefined => {
        const labelId = container?.getAttribute('aria-labelledby');
        return labelId ? document.getElementById(labelId)?.textContent?.trim() : undefined;
    };

    const findGroup = (name: string): HTMLElement | undefined =>
        Array.from(document.querySelectorAll<HTMLElement>('.ag-group-container[role="group"]')).find(
            (container) => groupName(container) === name
        );

    const expectNoFocusableTitleOnlyGroups = () => {
        expect(document.querySelectorAll('.ag-group-title-bar[role="group"]')).toHaveLength(0);
        expect(document.querySelectorAll('[role="group"][tabindex]')).toHaveLength(0);
        expect(document.querySelectorAll('.ag-group-title-bar:not([aria-expanded])[tabindex]')).toHaveLength(0);
    };

    test('section contents are groups named by their titles; collapsible title bars are disclosure buttons', async () => {
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
        const chartStyleBar = await waitFor(() => {
            const bar = Array.from(document.querySelectorAll('.ag-charts-format-top-level-group-title-bar')).find(
                (el) => el.querySelector('.ag-group-title')?.textContent?.trim() === 'Chart Style'
            );
            expect(bar).toBeDefined();
            return bar!;
        });

        expect(chartStyleBar.getAttribute('role')).toBe('button');
        expect(chartStyleBar.getAttribute('tabindex')).toBe('0');
        expect(chartStyleBar.hasAttribute('aria-expanded')).toBe(true);
        const chartStyle = document.getElementById(chartStyleBar.getAttribute('aria-controls') ?? '');
        expect(chartStyle?.classList.contains('ag-group-container')).toBe(true);
        expect(chartStyle?.getAttribute('role')).toBe('group');
        expect(groupName(chartStyle)).toBe('Chart Style');
        expect(chartStyleBar.contains(chartStyle!)).toBe(false);

        expect(chartStyle!.querySelectorAll('input').length).toBeGreaterThan(0);

        // Padding cannot collapse: its title bar is static text, and its content is the named group.
        const paddingBar = Array.from(document.querySelectorAll('.ag-charts-format-sub-level-group-title-bar')).find(
            (bar) => bar.querySelector('.ag-group-title')?.textContent?.trim() === 'Padding'
        );
        expect(paddingBar).toBeDefined();
        expect(paddingBar?.getAttribute('role')).toBe('presentation');
        expect(paddingBar?.hasAttribute('tabindex')).toBe(false);
        expect(paddingBar?.hasAttribute('aria-expanded')).toBe(false);
        expect(paddingBar?.hasAttribute('aria-controls')).toBe(false);

        const padding = findGroup('Padding');
        expect(padding).toBeDefined();
        expect(chartStyle!.contains(padding!)).toBe(true);
        expect(padding!.parentElement?.closest('[role="group"]')).toBe(chartStyle);
        expect(padding!.querySelectorAll('input').length).toBeGreaterThan(0);

        const isNamedByToggle = (group: HTMLElement | undefined) =>
            document.getElementById(group?.getAttribute('aria-labelledby') ?? '')?.closest('.ag-toggle-button') != null;
        const background = findGroup('Background');
        expect(chartStyle!.contains(background!)).toBe(true);
        expect([background, findGroup('Shadow'), findGroup('Chart Title')].map(isNamedByToggle)).toEqual([
            true,
            true,
            true,
        ]);

        expectNoFocusableTitleOnlyGroups();

        api.openChartToolPanel({ chartId: chartRef.chartId, panel: 'data' });
        await waitFor(() => expect(findGroup('Categories')).toBeDefined());
        expectNoFocusableTitleOnlyGroups();
    });
});
