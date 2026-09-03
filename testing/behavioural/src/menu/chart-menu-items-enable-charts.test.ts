/**
 * `enableCharts` gating of the built-in chart context-menu tokens (`chartRange`, `pivotChart`).
 *
 * `enableCharts: false` means "users cannot create charts from the grid UI". Today the option is
 * only consulted while the DEFAULT context-menu item list is assembled, so an application that asks
 * for the token by name — via `getContextMenuItems` or `colDef.contextMenuItems` — gets a fully
 * active item and can create a chart with the option off (AG-18246).
 *
 * The application-created path (`api.createRangeChart` / `api.createPivotChart`) is deliberately NOT
 * gated by `enableCharts` and must stay ungated — see `charts/chart-range-handle.test.ts`.
 */
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { TestGridsManager, menuOption, openMenuOption, polyfillOffsetParent } from 'ag-test-utils';

import type { GridApi } from 'ag-grid-community';
import { AllEnterpriseModule, IntegratedChartsModule } from 'ag-grid-enterprise';

describe('enableCharts gates the built-in chart context-menu tokens', () => {
    const gridMgr = new TestGridsManager({
        modules: [AllEnterpriseModule, IntegratedChartsModule.with(AgChartsEnterpriseModule)],
    });

    const rowData = [
        { athlete: 'Michael Phelps', age: 23, country: 'United States' },
        { athlete: 'Missy Franklin', age: 17, country: 'United States' },
    ];

    let restoreOffsetParent: (() => void) | undefined;

    afterEach(() => {
        gridMgr.reset();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
    });

    function showContextMenu(api: GridApi): void {
        restoreOffsetParent ??= polyfillOffsetParent();
        api.showContextMenu({
            rowNode: api.getDisplayedRowAtIndex(0),
            column: api.getColumn('athlete'),
            value: 'Michael Phelps',
            source: 'ui',
        });
    }

    // `enableCharts` defaults to false, so both the unset and the explicitly-false grids must gate
    // the tokens — the explicit case is the one an application actually writes.
    describe.each([
        ['unset', undefined],
        ['explicitly false', false],
    ])('with enableCharts %s', (_label, enableCharts) => {
        test('chartRange from getContextMenuItems is omitted', async () => {
            const api = await gridMgr.createGridAndWait('charts-off-get-context-menu-items', {
                columnDefs: [{ field: 'athlete' }, { field: 'age' }],
                rowData,
                cellSelection: true,
                enableCharts,
                getContextMenuItems: () => ['chartRange', 'copy'],
            });

            showContextMenu(api);
            await openMenuOption('Copy');

            expect(menuOption('Chart Range')).toBeNull();
        });

        test('chartRange from colDef.contextMenuItems is omitted', async () => {
            const api = await gridMgr.createGridAndWait('charts-off-col-def-context-menu-items', {
                columnDefs: [{ field: 'athlete', contextMenuItems: ['chartRange', 'copy'] }, { field: 'age' }],
                rowData,
                cellSelection: true,
                enableCharts,
            });

            showContextMenu(api);
            await openMenuOption('Copy');

            expect(menuOption('Chart Range')).toBeNull();
        });

        test('pivotChart from getContextMenuItems is omitted', async () => {
            const api = await gridMgr.createGridAndWait('charts-off-pivot-chart', {
                columnDefs: [{ field: 'athlete', rowGroup: true }, { field: 'country', pivot: true }, { field: 'age' }],
                rowData,
                pivotMode: true,
                cellSelection: true,
                enableCharts,
                getContextMenuItems: () => ['pivotChart', 'copy'],
            });

            showContextMenu(api);
            await openMenuOption('Copy');

            expect(menuOption('Pivot Chart')).toBeNull();
        });
    });

    test('chartRange from getContextMenuItems still renders when enableCharts is true', async () => {
        const api = await gridMgr.createGridAndWait('charts-on-get-context-menu-items', {
            columnDefs: [{ field: 'athlete' }, { field: 'age' }],
            rowData,
            cellSelection: true,
            enableCharts: true,
            getContextMenuItems: () => ['chartRange', 'copy'],
        });

        showContextMenu(api);

        expect(await openMenuOption('Chart Range')).toBeTruthy();
    });

    test('pivotChart from getContextMenuItems still renders when enableCharts is true', async () => {
        const api = await gridMgr.createGridAndWait('charts-on-pivot-chart', {
            columnDefs: [{ field: 'athlete', rowGroup: true }, { field: 'country', pivot: true }, { field: 'age' }],
            rowData,
            pivotMode: true,
            cellSelection: true,
            enableCharts: true,
            getContextMenuItems: () => ['pivotChart', 'copy'],
        });

        showContextMenu(api);

        expect(await openMenuOption('Pivot Chart')).toBeTruthy();
    });

    test('the default context menu offers Chart Range out of pivot mode and Pivot Chart in it', async () => {
        const api = await gridMgr.createGridAndWait('charts-on-pivot-mode-toggle', {
            columnDefs: [{ field: 'athlete', rowGroup: true }, { field: 'country', pivot: true }, { field: 'age' }],
            rowData,
            cellSelection: true,
            enableCharts: true,
        });

        // `chartRange` is only offered by the default menu while a cell range exists.
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columns: ['age'] });

        showContextMenu(api);
        await openMenuOption('Chart Range');
        expect(menuOption('Pivot Chart')).toBeNull();

        api.hidePopupMenu();
        api.setGridOption('pivotMode', true);

        showContextMenu(api);
        expect(await openMenuOption('Pivot Chart')).toBeTruthy();
        expect(menuOption('Chart Range')).toBeNull();
    });
});
