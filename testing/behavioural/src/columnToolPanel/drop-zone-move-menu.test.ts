import { findByRole, fireEvent, getByRole, getByText, queryByRole, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { TestGridsManager, polyfillOffsetParent } from 'ag-test-utils';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { LocaleModule, getGridElement } from 'ag-grid-community';
import { ColumnsToolPanelModule, PivotModule, RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise';

type Zone = 'rowGroup' | 'pivot' | 'aggregation';

describe('drop zone move menus', () => {
    const grids = new TestGridsManager({
        modules: [ColumnsToolPanelModule, PivotModule, RowGroupingModule, RowGroupingPanelModule],
    });
    const headerGrids = new TestGridsManager({ modules: [RowGroupingModule, RowGroupingPanelModule, LocaleModule] });
    let restoreOffsetParent: () => void;

    beforeEach(() => {
        restoreOffsetParent = polyfillOffsetParent();
    });
    afterEach(() => {
        grids.reset();
        headerGrids.reset();
        restoreOffsetParent();
    });

    const create = (zone: Zone, options: GridOptions = {}, manager = grids) =>
        manager.createGridAndWait('grid', {
            columnDefs: [
                ...['a', 'b', 'c'].map((field) => ({
                    field,
                    enableRowGroup: true,
                    enablePivot: true,
                    enableValue: true,
                    rowGroup: zone === 'rowGroup',
                    pivot: zone === 'pivot',
                    aggFunc: zone === 'aggregation' ? 'sum' : undefined,
                })),
                ...(zone === 'pivot' ? [{ field: 'value', aggFunc: 'sum' }] : []),
            ],
            rowData: [{ a: 1, b: 2, c: 3, value: 4 }],
            pivotMode: zone === 'pivot',
            rowGroupPanelShow: 'always',
            pivotPanelShow: 'always',
            sideBar: { toolPanels: ['columns'], defaultToolPanel: 'columns' },
            ...options,
        });

    const order = (api: GridApi, zone: Zone) => {
        const columns =
            zone === 'rowGroup'
                ? api.getRowGroupColumns()
                : zone === 'pivot'
                  ? api.getPivotColumns()
                  : api.getValueColumns();
        return columns.map((col) => col.getColId());
    };
    const panel = (api: GridApi, zone: Zone, horizontal = false) =>
        getGridElement(api)!.querySelector<HTMLElement>(
            `.ag-column-drop-${horizontal ? 'horizontal' : 'vertical'}.ag-column-drop-${zone.toLowerCase()}`
        )!;
    const pill = (api: GridApi, zone: Zone, horizontal = false, name = 'B') =>
        getByText(panel(api, zone, horizontal), zone === 'aggregation' ? `sum(${name})` : name).closest<HTMLElement>(
            '.ag-column-drop-cell'
        )!;
    async function open(api: GridApi, zone: Zone, horizontal = false, name = 'B') {
        const item = pill(api, zone, horizontal, name);
        item.focus();
        fireEvent.contextMenu(item);
        return findByRole(getGridElement(api) as HTMLElement, 'menu');
    }

    describe.each<{ zone: Zone; horizontal: boolean }>([
        { zone: 'rowGroup', horizontal: false },
        { zone: 'pivot', horizontal: false },
        { zone: 'aggregation', horizontal: false },
        { zone: 'rowGroup', horizontal: true },
        { zone: 'pivot', horizontal: true },
    ])('$zone horizontal=$horizontal', ({ zone, horizontal }) => {
        test.each([false, true])('moves both ways and restores focus, RTL=%s', async (enableRtl) => {
            const api = await create(zone, { enableRtl });
            const beforeLabel = horizontal ? 'Move Left' : 'Move Up';
            const afterLabel = horizontal ? 'Move Right' : 'Move Down';
            let menu = await open(api, zone, horizontal);
            expect(menu.querySelectorAll('.ag-menu-separator')).toHaveLength(0);
            await userEvent.click(getByRole(menu, 'menuitem', { name: beforeLabel }));
            expect(order(api, zone)).toEqual(horizontal && enableRtl ? ['a', 'c', 'b'] : ['b', 'a', 'c']);
            expect(document.activeElement).toBe(pill(api, zone, horizontal));
            expect(getGridElement(api)!.querySelector('[role="menu"]')).toBeNull();

            menu = await open(api, zone, horizontal);
            await userEvent.click(getByRole(menu, 'menuitem', { name: afterLabel }));
            expect(order(api, zone)).toEqual(['a', 'b', 'c']);
            expect(document.activeElement).toBe(pill(api, zone, horizontal));
        });

        test.each([false, true])('disables first/last moves and read-only functions, RTL=%s', async (enableRtl) => {
            const api = await create(zone, { enableRtl });
            const labels = horizontal ? ['Move Left', 'Move Right'] : ['Move Up', 'Move Down'];
            if (horizontal && enableRtl) {
                labels.reverse();
            }
            for (const [index, name] of ['A', 'C'].entries()) {
                const menu = await open(api, zone, horizontal, name);
                expect(getByRole(menu, 'menuitem', { name: labels[index] }).getAttribute('aria-disabled')).toBe('true');
                expect(getByRole(menu, 'menuitem', { name: labels[1 - index] })).toBeTruthy();
                await userEvent.keyboard('{Escape}');
            }
            api.setGridOption('functionsReadOnly', true);
            const menu = await open(api, zone, horizontal);
            for (const label of labels) {
                const item = getByRole(menu, 'menuitem', { name: label });
                expect(item.getAttribute('aria-disabled')).toBe('true');
                await userEvent.click(item);
            }
            expect(pill(api, zone, horizontal).getAttribute('aria-haspopup')).toBe('menu');
            expect(order(api, zone)).toEqual(['a', 'b', 'c']);
        });

        test('shows disabled moves for a single item', async () => {
            const api = await create(zone);
            if (zone === 'rowGroup') {
                api.setRowGroupColumns(['b']);
            } else if (zone === 'pivot') {
                api.setPivotColumns(['b']);
            } else {
                api.setValueColumns(['b']);
            }
            const item = pill(api, zone, horizontal);
            item.focus();
            fireEvent.keyDown(item, { key: 'F10', shiftKey: true });
            const menu = await findByRole(getGridElement(api) as HTMLElement, 'menu');
            const moves = menu.querySelectorAll('[role="menuitem"]');
            expect(moves).toHaveLength(2);
            for (const move of moves) {
                expect(move.getAttribute('aria-disabled')).toBe('true');
                await userEvent.click(move);
            }
            expect(item.getAttribute('aria-haspopup')).toBe('menu');
            await userEvent.keyboard('{Escape}');
            expect(document.activeElement).toBe(item);
        });

        test.each(['suppressMovableColumns', 'suppressMovable', 'lockPosition'] as const)(
            'hides moves when %s is set, even when explicitly requested',
            async (restriction) => {
                const api = await create(zone, {
                    suppressMovableColumns: restriction === 'suppressMovableColumns',
                    defaultColDef: {
                        suppressMovable: restriction === 'suppressMovable',
                        lockPosition: restriction === 'lockPosition',
                    },
                    getColumnDropZoneMenuItems: () => ['moveUp', 'moveDown', 'moveLeft', 'moveRight'],
                });
                const item = pill(api, zone, horizontal);
                fireEvent.contextMenu(item);
                expect(getGridElement(api)!.querySelector('[role="menu"]')).toBeNull();
                expect(item.hasAttribute('aria-haspopup')).toBe(false);
            }
        );

        test('opens with Shift+F10 and restores focus on Escape', async () => {
            const api = await create(zone);
            const item = pill(api, zone, horizontal);
            item.focus();
            fireEvent.keyDown(item, { key: 'F10', shiftKey: true });
            await findByRole(getGridElement(api) as HTMLElement, 'menu');
            await userEvent.keyboard('{Escape}');
            expect(document.activeElement).toBe(item);
            expect(order(api, zone)).toEqual(['a', 'b', 'c']);
        });

        test('keeps Shift+Arrow reordering working', async () => {
            const api = await create(zone);
            const item = pill(api, zone, horizontal);
            item.focus();
            fireEvent.keyDown(item, { key: horizontal ? 'ArrowLeft' : 'ArrowUp', shiftKey: true });
            expect(order(api, zone)).toEqual(['b', 'a', 'c']);
            expect(document.activeElement).toBe(pill(api, zone, horizontal));
        });

        test('allows suppressing menus by purpose without calling column-menu callbacks', async () => {
            const getColumnMenuItems = vi.fn(() => []);
            const columnMenuItems = vi.fn(() => []);
            const getColumnDropZoneMenuItems = vi.fn(() => []);
            const context = { test: 'drop-zone' };
            const api = await create(zone, {
                context,
                defaultColDef: { columnMenuItems },
                getColumnMenuItems,
                getColumnDropZoneMenuItems,
            });
            const item = pill(api, zone, horizontal);
            expect(item.hasAttribute('aria-haspopup')).toBe(false);
            item.focus();
            fireEvent.contextMenu(item);
            fireEvent.keyDown(item, { key: 'F10', shiftKey: true });

            expect(getGridElement(api)!.querySelector('[role="menu"]')).toBeNull();
            expect(document.activeElement).toBe(item);
            expect(getColumnDropZoneMenuItems).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    api,
                    context,
                    column: api.getColumn('b'),
                    purpose: zone,
                    defaultItems: horizontal ? ['moveLeft', 'moveRight'] : ['moveUp', 'moveDown'],
                })
            );
            expect(getColumnMenuItems).not.toHaveBeenCalled();
            expect(columnMenuItems).not.toHaveBeenCalled();
        });
    });

    test('reorders the default movement tokens', async () => {
        const api = await create('rowGroup', {
            getColumnDropZoneMenuItems: ({ defaultItems }) => defaultItems.slice().reverse(),
        });
        const menu = await open(api, 'rowGroup');
        const items = menu.querySelectorAll('[role="menuitem"]');
        expect(Array.from(items, (item) => item.textContent)).toEqual(['Move Down', 'Move Up']);
        await userEvent.click(items[0]);
        expect(order(api, 'rowGroup')).toEqual(['a', 'c', 'b']);
    });

    test('disables unavailable moves, hides wrong-orientation tokens and normalises separators', async () => {
        const api = await create('rowGroup', {
            getColumnDropZoneMenuItems: () => ['separator', 'moveUp', 'moveLeft', 'separator', 'moveDown', 'separator'],
        });
        const menu = await open(api, 'rowGroup', false, 'A');
        expect(menu.querySelectorAll('[role="menuitem"]')).toHaveLength(2);
        expect(getByRole(menu, 'menuitem', { name: 'Move Up' }).getAttribute('aria-disabled')).toBe('true');
        expect(menu.querySelectorAll('.ag-menu-separator')).toHaveLength(1);
        await userEvent.click(getByRole(menu, 'menuitem', { name: 'Move Down' }));
        expect(order(api, 'rowGroup')).toEqual(['b', 'a', 'c']);
    });

    test('supports custom items even when no movement is available', async () => {
        const action = vi.fn();
        const api = await create('aggregation', {
            functionsReadOnly: true,
            getColumnDropZoneMenuItems: ({ purpose, defaultItems }) =>
                purpose === 'aggregation' ? [{ name: 'Inspect', action }] : defaultItems,
        });
        const item = pill(api, 'aggregation');
        expect(item.getAttribute('aria-haspopup')).toBe('menu');
        const menu = await open(api, 'aggregation');
        await userEvent.click(getByRole(menu, 'menuitem', { name: 'Inspect' }));
        expect(action).toHaveBeenCalledWith(expect.objectContaining({ column: api.getColumn('b'), api }));
        expect(document.activeElement).toBe(item);
        expect(getGridElement(api)!.querySelector('[role="menu"]')).toBeNull();
        expect(order(api, 'aggregation')).toEqual(['a', 'b', 'c']);
    });

    test('refreshes menu availability when the callback changes', async () => {
        const api = await create('rowGroup');
        api.setGridOption('getColumnDropZoneMenuItems', () => []);
        expect(pill(api, 'rowGroup').hasAttribute('aria-haspopup')).toBe(false);
        fireEvent.contextMenu(pill(api, 'rowGroup'));
        expect(getGridElement(api)!.querySelector('[role="menu"]')).toBeNull();

        api.setGridOption('getColumnDropZoneMenuItems', ({ defaultItems }) =>
            defaultItems.filter((item) => item !== 'moveUp')
        );
        expect(pill(api, 'rowGroup').getAttribute('aria-haspopup')).toBe('menu');
        const menu = await open(api, 'rowGroup');
        expect(queryByRole(menu, 'menuitem', { name: 'Move Up' })).toBeNull();
        expect(getByRole(menu, 'menuitem', { name: 'Move Down' })).toBeTruthy();
    });

    test.each<Zone>(['rowGroup', 'pivot', 'aggregation'])(
        'stages %s reordering until Apply, and supports Cancel',
        async (zone) => {
            const api = await create(zone, {
                sideBar: {
                    toolPanels: [
                        {
                            id: 'columns',
                            labelDefault: 'Columns',
                            labelKey: 'columns',
                            iconKey: 'columnsToolPanel',
                            toolPanel: 'agColumnsToolPanel',
                            toolPanelParams: { buttons: ['apply', 'cancel'] },
                        },
                    ],
                    defaultToolPanel: 'columns',
                },
            });
            const grid = getGridElement(api) as HTMLElement;
            for (const button of ['Cancel', 'Apply']) {
                const menu = await open(api, zone);
                await userEvent.click(getByRole(menu, 'menuitem', { name: 'Move Up' }));
                expect(order(api, zone)).toEqual(['a', 'b', 'c']);
                expect(panel(api, zone).querySelector('.ag-column-drop-cell-text')?.textContent).toBe(
                    zone === 'aggregation' ? 'sum(B)' : 'B'
                );
                await userEvent.click(getByRole(grid, 'button', { name: button }));
                await waitFor(() =>
                    expect(order(api, zone)).toEqual(button === 'Cancel' ? ['a', 'b', 'c'] : ['b', 'a', 'c'])
                );
            }
        }
    );

    test.each<Zone>(['rowGroup', 'pivot', 'aggregation'])(
        'only applies row-group locking to row groups: %s',
        async (zone) => {
            const api = await create(zone, { groupLockGroupColumns: 1 });
            if (zone !== 'rowGroup') {
                api.setRowGroupColumns(['a']);
            }
            const menu = await open(api, zone);
            const up = queryByRole(menu, 'menuitem', { name: 'Move Up' });
            if (zone === 'rowGroup') {
                expect(up!.getAttribute('aria-disabled')).toBe('true');
            } else {
                expect(up).not.toBeNull();
                await userEvent.click(up!);
            }
            expect(order(api, zone)).toEqual(zone === 'rowGroup' ? ['a', 'b', 'c'] : ['b', 'a', 'c']);
        }
    );

    test.each([1, -1])('locked row groups cannot move in either direction, lock=%s', async (groupLockGroupColumns) => {
        const api = await create('rowGroup', { groupLockGroupColumns });
        const menu = await open(api, 'rowGroup', false, 'A');
        for (const item of menu.querySelectorAll('[role="menuitem"]')) {
            expect(item.getAttribute('aria-disabled')).toBe('true');
            await userEvent.click(item);
        }
        expect(pill(api, 'rowGroup', false, 'A').getAttribute('aria-haspopup')).toBe('menu');
        expect(order(api, 'rowGroup')).toEqual(['a', 'b', 'c']);
    });

    test('closes the menu when the panel is rebuilt', async () => {
        const api = await create('rowGroup');
        await open(api, 'rowGroup');
        api.setRowGroupColumns(['a', 'c']);
        expect(getGridElement(api)!.querySelector('[role="menu"]')).toBeNull();
        expect(order(api, 'rowGroup')).toEqual(['a', 'c']);
    });

    test('does not restore pill focus when clicking outside the menu', async () => {
        const api = await create('rowGroup');
        await open(api, 'rowGroup');
        const header = getGridElement(api)!.querySelector<HTMLElement>('.ag-header-cell')!;
        await userEvent.click(header);
        expect(getGridElement(api)!.querySelector('[role="menu"]')).toBeNull();
        expect(document.activeElement).not.toBe(pill(api, 'rowGroup'));
    });

    test('supports opening and selecting a move entirely with the keyboard', async () => {
        const api = await create('rowGroup');
        const item = pill(api, 'rowGroup');
        item.focus();
        fireEvent.keyDown(item, { key: 'ContextMenu' });
        await findByRole(getGridElement(api) as HTMLElement, 'menu');
        await userEvent.keyboard('{Enter}');
        expect(order(api, 'rowGroup')).toEqual(['b', 'a', 'c']);
        expect(document.activeElement).toBe(pill(api, 'rowGroup'));
    });

    test('header panel works without Column Menu or Columns Tool Panel and uses locale overrides', async () => {
        const api = await create(
            'rowGroup',
            {
                sideBar: undefined,
                columnDefs: ['a', 'b', 'c'].map((field) => ({ field, rowGroup: true })),
                localeText: { moveLeft: 'Earlier', moveRight: 'Later' },
            },
            headerGrids
        );
        const menu = await open(api, 'rowGroup', true);
        await userEvent.click(getByRole(menu, 'menuitem', { name: 'Earlier' }));
        expect(order(api, 'rowGroup')).toEqual(['b', 'a', 'c']);
    });
});
