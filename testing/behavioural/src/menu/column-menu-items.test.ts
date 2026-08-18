import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { TestGridsManager, menuOption, openMenuOption, polyfillOffsetParent } from 'ag-test-utils';

import type { ColumnEventType, ColumnMenuItemsSource, GetColumnMenuItemsParams } from 'ag-grid-community';
import { ClientSideRowModelModule, ValidationModule } from 'ag-grid-community';
import { AllEnterpriseModule, ColumnMenuModule, ColumnsToolPanelModule } from 'ag-grid-enterprise';

let restoreOffsetParent: (() => void) | undefined;

/**
 * Fire a real `contextmenu` MouseEvent on the column entry's focus wrapper — the same path
 * AG Grid uses in production to open the context menu.
 */
function openContextMenu(entry: HTMLElement): void {
    const row = (entry.closest('.ag-virtual-list-item') as HTMLElement | null) ?? entry;
    row.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }));
}

describe('getColumnMenuItems / columnMenuItems on the column menu', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    const rowData = [
        { athlete: 'Michael Phelps', age: 23, country: 'United States' },
        { athlete: 'Missy Franklin', age: 17, country: 'United States' },
    ];

    afterEach(() => {
        gridMgr.reset();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
        vi.resetAllMocks();
    });

    test('getColumnMenuItems fires for the column menu with source "columnMenu" and string-token defaults', async () => {
        let captured: GetColumnMenuItemsParams | undefined;
        const api = await gridMgr.createGridAndWait('menu-source', {
            columnDefs: [{ field: 'athlete' }, { field: 'age' }],
            rowData,
            getColumnMenuItems: (params) => {
                captured = params;
                return [...params.defaultItems, { name: 'Custom' }];
            },
        });

        restoreOffsetParent = polyfillOffsetParent();
        api.showColumnMenu('athlete');
        await openMenuOption('Custom');

        expect(captured!.source).toBe<ColumnMenuItemsSource>('columnMenu');
        expect(captured!.column?.getColId()).toBe('athlete');
        expect(captured!.defaultItems.every((item) => typeof item === 'string')).toBe(true);
    });

    test('getColumnMenuItems takes precedence over the legacy getMainMenuItems', async () => {
        const getMainMenuItems = vi.fn(() => [{ name: 'FromLegacyGrid' }]);
        const api = await gridMgr.createGridAndWait('menu-grid-precedence', {
            columnDefs: [{ field: 'athlete' }, { field: 'age' }],
            rowData,
            getColumnMenuItems: () => [{ name: 'FromNewGrid' }],
            getMainMenuItems,
        });

        restoreOffsetParent = polyfillOffsetParent();
        api.showColumnMenu('athlete');
        await openMenuOption('FromNewGrid');

        expect(menuOption('FromLegacyGrid')).toBeNull();
        expect(getMainMenuItems).not.toHaveBeenCalled();
    });

    test('col-level columnMenuItems takes precedence over the legacy mainMenuItems', async () => {
        const api = await gridMgr.createGridAndWait('menu-col-precedence', {
            columnDefs: [
                {
                    field: 'athlete',
                    columnMenuItems: [{ name: 'FromNewCol' }],
                    mainMenuItems: [{ name: 'FromLegacyCol' }],
                },
                { field: 'age' },
            ],
            rowData,
        });

        restoreOffsetParent = polyfillOffsetParent();
        api.showColumnMenu('athlete');
        await openMenuOption('FromNewCol');

        expect(menuOption('FromLegacyCol')).toBeNull();
    });

    test('legacy getMainMenuItems still drives the column menu when no new props are set', async () => {
        const api = await gridMgr.createGridAndWait('menu-legacy-only', {
            columnDefs: [{ field: 'athlete' }, { field: 'age' }],
            rowData,
            getMainMenuItems: (params) => [...params.defaultItems, { name: 'LegacyStillWorks' }],
        });

        restoreOffsetParent = polyfillOffsetParent();
        api.showColumnMenu('athlete');
        await openMenuOption('LegacyStillWorks');
    });

    test('tool-panel tokens (value, scrollIntoView) resolve on the column menu, and value toggles the column', async () => {
        const api = await gridMgr.createGridAndWait('menu-tool-panel-tokens', {
            columnDefs: [{ field: 'athlete' }, { field: 'age', enableValue: true }],
            rowData,
            getColumnMenuItems: () => ['scrollIntoView', 'value'],
        });

        restoreOffsetParent = polyfillOffsetParent();
        api.showColumnMenu('age');
        await openMenuOption('Scroll Age into View');
        await userEvent.click(await openMenuOption('Add Age to values'));

        expect(api.getValueColumns().map((c) => c.getColId())).toStrictEqual(['age']);
    });

    test('a token that does not apply to the column menu (pivot outside pivot mode) is quietly omitted, not warned', async () => {
        const api = await gridMgr.createGridAndWait('menu-inapplicable-token', {
            columnDefs: [{ field: 'athlete' }, { field: 'age', enableValue: true }],
            rowData,
            getColumnMenuItems: () => ['value', 'pivot'],
        });

        restoreOffsetParent = polyfillOffsetParent();
        api.showColumnMenu('age');
        await openMenuOption('Add Age to values');

        expect(menuOption('Add Age to labels')).toBeNull();
    });
});

describe('getColumnMenuItems on the Column Chooser', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    const rowData = [{ athlete: 'Michael Phelps', age: 23, country: 'United States' }];

    afterEach(() => {
        gridMgr.reset();
    });

    test('right-clicking a column in the Column Chooser fires getColumnMenuItems with source "columnChooser"', async () => {
        let captured: GetColumnMenuItemsParams | undefined;
        const api = await gridMgr.createGridAndWait('chooser-source', {
            columnDefs: [{ field: 'athlete' }, { field: 'age' }, { field: 'country' }],
            rowData,
            getColumnMenuItems: (params) => {
                captured = params;
                return params.defaultItems;
            },
        });

        api.showColumnChooser();

        const viewport = await waitFor(() => {
            const el = document.querySelector('.ag-column-select-virtual-list-viewport') as HTMLElement | null;
            expect(el).toBeTruthy();
            return el!;
        });

        // happy-dom has no layout engine, so force the virtual list to render its items.
        Object.defineProperty(viewport, 'offsetHeight', { value: 200, configurable: true });
        viewport.dispatchEvent(new Event('scroll'));

        const entry = await waitFor(() => {
            const el = Array.from(document.querySelectorAll<HTMLElement>('.ag-column-select-column')).find((e) =>
                e.textContent?.includes('Athlete')
            );
            expect(el).toBeTruthy();
            return el!;
        });

        openContextMenu(entry);

        await waitFor(() => expect(captured).toBeTruthy());
        expect(captured?.source).toBe<ColumnMenuItemsSource>('columnChooser');
        expect(captured?.column?.getColId()).toBe('athlete');

        api.hideColumnChooser();
    });

    test('stock actions invoked from the Column Chooser emit column events with source "columnMenu"', async () => {
        const rowGroupSources: ColumnEventType[] = [];
        const api = await gridMgr.createGridAndWait('chooser-event-source', {
            columnDefs: [{ field: 'athlete', enableRowGroup: true }, { field: 'age' }, { field: 'country' }],
            rowData,
        });
        api.addEventListener('columnRowGroupChanged', (e) => rowGroupSources.push(e.source));

        api.showColumnChooser();

        const viewport = await waitFor(() => {
            const el = document.querySelector('.ag-column-select-virtual-list-viewport') as HTMLElement | null;
            expect(el).toBeTruthy();
            return el!;
        });

        // happy-dom has no layout engine, so force the virtual list to render its items.
        Object.defineProperty(viewport, 'offsetHeight', { value: 200, configurable: true });
        viewport.dispatchEvent(new Event('scroll'));

        const entry = await waitFor(() => {
            const el = Array.from(document.querySelectorAll<HTMLElement>('.ag-column-select-column')).find((e) =>
                e.textContent?.includes('Athlete')
            );
            expect(el).toBeTruthy();
            return el!;
        });

        openContextMenu(entry);
        await userEvent.click(await openMenuOption('Group by Athlete'));

        expect(api.getRowGroupColumns().map((c) => c.getColId())).toStrictEqual(['athlete']);
        // The chooser is launched from the column menu, so its stock actions report the column-menu
        // source, not the tool panel's 'toolPanelUi'.
        expect(rowGroupSources).toContain<ColumnEventType>('columnMenu');
        expect(rowGroupSources).not.toContain<ColumnEventType>('toolPanelUi');

        api.hideColumnChooser();
    });
});

describe('getColumnMenuItems module requirement', () => {
    const rowData = [{ athlete: 'Michael Phelps' }];
    const columnDefs = [{ field: 'athlete' }];

    // getColumnMenuItems drives the column menu (ColumnMenuModule) and the Columns Tool Panel /
    // Column Chooser (ColumnsToolPanelModule), so either surface module satisfies it. With
    // throwOn: ['error'] a missing-module error (#200) is thrown, so grid creation throwing is a
    // direct proxy for the validation firing.
    test('is satisfied by ColumnMenuModule alone, without ColumnsToolPanelModule', () => {
        const gridMgr = new TestGridsManager({
            modules: [ClientSideRowModelModule, ColumnMenuModule, ValidationModule.with({ throwOn: ['error'] })],
        });
        expect(() =>
            gridMgr.createGrid('column-menu-only', {
                columnDefs,
                rowData,
                getColumnMenuItems: (params) => params.defaultItems,
            })
        ).not.toThrow();
        gridMgr.reset();
    });

    test('is satisfied by ColumnsToolPanelModule alone, without ColumnMenuModule', () => {
        const gridMgr = new TestGridsManager({
            modules: [ClientSideRowModelModule, ColumnsToolPanelModule, ValidationModule.with({ throwOn: ['error'] })],
        });
        expect(() =>
            gridMgr.createGrid('tool-panel-only', {
                columnDefs,
                rowData,
                getColumnMenuItems: (params) => params.defaultItems,
            })
        ).not.toThrow();
        gridMgr.reset();
    });

    test('still warns when neither the column menu nor the tool panel module is registered', () => {
        const gridMgr = new TestGridsManager({
            modules: [ClientSideRowModelModule, ValidationModule.with({ throwOn: ['error'] })],
        });
        expect(() =>
            gridMgr.createGrid('no-surface', {
                columnDefs,
                rowData,
                getColumnMenuItems: (params) => params.defaultItems,
            })
        ).toThrow(/getColumnMenuItems/);
        gridMgr.reset();
    });
});
