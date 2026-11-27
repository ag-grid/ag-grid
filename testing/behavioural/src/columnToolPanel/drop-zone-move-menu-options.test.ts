import { findByRole, fireEvent, getByRole, queryByRole, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { getGridElement } from 'ag-grid-community';

import type { Zone } from './dropZoneMoveMenuHarness';
import {
    defaultMenuEntries,
    disabledEntries,
    menuEntries,
    moveLabels,
    open,
    order,
    panel,
    pill,
    setupDropZoneMoveMenuSuite,
} from './dropZoneMoveMenuHarness';
import { openToolPanelContextMenu } from './toolPanelContextMenuHarness';

describe('drop zone move menu options, deferred panels and layout', () => {
    const { headerGrids, create, createDeferred } = setupDropZoneMoveMenuSuite();

    test('reorders the default items', async () => {
        const api = await create('rowGroup', {
            getColumnDropZoneMenuItems: ({ defaultItems }) => defaultItems.slice().reverse(),
        });
        const menu = await open(api, 'rowGroup');
        expect(menuEntries(menu)).toEqual([
            'Remove Field',
            'separator',
            'Move Down',
            'Move Up',
            'separator',
            'Move to Values',
            'separator',
            'Sort Descending',
            'Sort Ascending',
        ]);
        await userEvent.click(getByRole(menu, 'menuitem', { name: 'Move Down' }));
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
            getColumnDropZoneMenuItems: ({ source, defaultItems }) =>
                source === 'aggregation' ? [{ name: 'Inspect', action }] : defaultItems,
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

    describe.each<Zone>(['rowGroup', 'pivot', 'aggregation'])('deferred %s move menus', (zone) => {
        test('uses the pending order for repeated moves and boundary availability', async () => {
            const api = await createDeferred(zone);
            const grid = getGridElement(api) as HTMLElement;
            for (const [direction, expected] of [
                ['Move Up', ['B', 'A', 'C']],
                ['Move Down', ['A', 'B', 'C']],
                ['Move Down', ['A', 'C', 'B']],
            ] as const) {
                const menu = await open(api, zone);
                await userEvent.click(getByRole(menu, 'menuitem', { name: direction }));
                expect(order(api, zone)).toEqual(['a', 'b', 'c']);
                expect(
                    Array.from(panel(api, zone).querySelectorAll('.ag-column-drop-cell-text'), (el) => el.textContent)
                ).toEqual(expected.map((name) => (zone === 'aggregation' ? `sum(${name})` : name)));
            }
            const menu = await open(api, zone);
            expect(getByRole(menu, 'menuitem', { name: 'Move Down' }).getAttribute('aria-disabled')).toBe('true');
            expect(getByRole(menu, 'menuitem', { name: 'Move Up' }).getAttribute('aria-disabled')).not.toBe('true');
            await userEvent.keyboard('{Escape}');
            await userEvent.click(getByRole(grid, 'button', { name: 'Apply' }));
            expect(order(api, zone)).toEqual(['a', 'c', 'b']);
        });

        test('Reset clears pending moves and restores the initial order, not the last applied order', async () => {
            const api = await createDeferred(zone);
            const grid = getGridElement(api) as HTMLElement;
            let menu = await open(api, zone);
            await userEvent.click(getByRole(menu, 'menuitem', { name: 'Move Up' }));
            await userEvent.click(getByRole(grid, 'button', { name: 'Apply' }));
            expect(order(api, zone)).toEqual(['b', 'a', 'c']);

            menu = await open(api, zone, false, 'A');
            await userEvent.click(getByRole(menu, 'menuitem', { name: 'Move Down' }));
            expect(order(api, zone)).toEqual(['b', 'a', 'c']);
            await userEvent.click(getByRole(grid, 'button', { name: 'Reset' }));
            expect(order(api, zone)).toEqual(['a', 'b', 'c']);
            expect((getByRole(grid, 'button', { name: 'Apply' }) as HTMLButtonElement).disabled).toBe(true);

            menu = await open(api, zone);
            for (const name of ['Move Up', 'Move Down']) {
                expect(getByRole(menu, 'menuitem', { name }).getAttribute('aria-disabled')).not.toBe('true');
            }
        });
    });

    test.each([1, -1])(
        'disables moves and Remove Field for newly staged locked row groups before Apply, lock=%s',
        async (groupLockGroupColumns) => {
            const api = await createDeferred('rowGroup', {
                groupLockGroupColumns,
                columnDefs: ['a', 'b', 'c'].map((field) => ({ field, enableRowGroup: true })),
            });
            const grid = getGridElement(api) as HTMLElement;
            for (const name of ['A', 'B']) {
                await openToolPanelContextMenu(api.getToolPanelInstance('columns'), grid, name);
                await userEvent.click(getByRole(grid, 'menuitem', { name: `Group by ${name}` }));
            }
            expect(order(api, 'rowGroup')).toEqual([]);
            const locked = ['Move Up', 'Move Down', 'Remove Field'];
            for (const name of groupLockGroupColumns === -1 ? ['A', 'B'] : ['A']) {
                expect(pill(api, 'rowGroup', false, name).getAttribute('aria-haspopup')).toBe('menu');
                const menu = await open(api, 'rowGroup', false, name);
                expect(menuEntries(menu)).toEqual(defaultMenuEntries('rowGroup', false, false));
                expect(disabledEntries(menu)).toEqual(locked);
                await userEvent.keyboard('{Escape}');
            }
            if (groupLockGroupColumns === 1) {
                const menu = await open(api, 'rowGroup');
                expect(disabledEntries(menu)).toEqual(['Move Up', 'Move Down']);
                await userEvent.keyboard('{Escape}');
            }
            await userEvent.click(getByRole(grid, 'button', { name: 'Cancel' }));
            expect(panel(api, 'rowGroup').querySelector('.ag-column-drop-cell')).toBeNull();
            expect(order(api, 'rowGroup')).toEqual([]);
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

    describe.each([false, true])('row-group locking, horizontal=%s', (horizontal) => {
        test.each([1, -1])('disables moves and Remove Field only for locked row groups, lock=%s', async (lock) => {
            const api = await create('rowGroup', { groupLockGroupColumns: lock });
            const [previousLabel, nextLabel] = moveLabels(horizontal);
            for (const name of lock === -1 ? ['A', 'B', 'C'] : ['A']) {
                expect(pill(api, 'rowGroup', horizontal, name).getAttribute('aria-haspopup')).toBe('menu');
                const menu = await open(api, 'rowGroup', horizontal, name);
                expect(menuEntries(menu)).toEqual(defaultMenuEntries('rowGroup', horizontal, false));
                expect(disabledEntries(menu)).toEqual([previousLabel, nextLabel, 'Remove Field']);
                await userEvent.keyboard('{Escape}');
            }
            if (lock === 1) {
                const menu = await open(api, 'rowGroup', horizontal);
                expect(menuEntries(menu)).toEqual(defaultMenuEntries('rowGroup', horizontal));
                expect(disabledEntries(menu)).toEqual([previousLabel]);
                await userEvent.click(getByRole(menu, 'menuitem', { name: nextLabel }));
                expect(order(api, 'rowGroup')).toEqual(['a', 'c', 'b']);

                api.setRowGroupColumns(['b', 'a', 'c']);
                const lockedMenu = await open(api, 'rowGroup', horizontal, 'B');
                expect(disabledEntries(lockedMenu)).toEqual([previousLabel, nextLabel, 'Remove Field']);
                await userEvent.keyboard('{Escape}');
                const updatedMenu = await open(api, 'rowGroup', horizontal, 'A');
                expect(menuEntries(updatedMenu)).toEqual(defaultMenuEntries('rowGroup', horizontal));
                expect(disabledEntries(updatedMenu)).toEqual([previousLabel]);
            }
        });
    });

    describe.each<Zone>(['rowGroup', 'pivot', 'aggregation'])('%s layout synchronisation', (zone) => {
        test.each([false, true])(
            'allows CTP and horizontal moves with column layout locked, deferred=%s',
            async (deferred) => {
                const api = await create(zone, {
                    sideBar: {
                        toolPanels: [
                            {
                                id: 'columns',
                                labelDefault: 'Columns',
                                labelKey: 'columns',
                                iconKey: 'columnsToolPanel',
                                toolPanel: 'agColumnsToolPanel',
                                toolPanelParams: {
                                    suppressSyncLayoutWithGrid: true,
                                    suppressColumnMove: true,
                                    buttons: deferred ? ['apply', 'cancel'] : undefined,
                                },
                            },
                        ],
                        defaultToolPanel: 'columns',
                    },
                });
                const item = pill(api, zone);
                expect(item.getAttribute('aria-haspopup')).toBe('menu');
                const columnOrder = api.getColumnState().map(({ colId }) => colId);
                const menu = await open(api, zone);
                await userEvent.click(getByRole(menu, 'menuitem', { name: 'Move Up' }));
                if (deferred) {
                    expect(order(api, zone)).toEqual(['a', 'b', 'c']);
                    expect(panel(api, zone).querySelector('.ag-column-drop-cell-text')?.textContent).toBe(
                        zone === 'aggregation' ? 'sum(B)' : 'B'
                    );
                    await userEvent.click(getByRole(getGridElement(api) as HTMLElement, 'button', { name: 'Apply' }));
                }
                expect(order(api, zone)).toEqual(['b', 'a', 'c']);
                if (zone !== 'aggregation') {
                    const menu = await open(api, zone, true);
                    await userEvent.click(getByRole(menu, 'menuitem', { name: 'Move Right' }));
                    expect(order(api, zone)).toEqual(['a', 'b', 'c']);
                }
                expect(api.getColumnState().map(({ colId }) => colId)).toEqual(columnOrder);
            }
        );
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
        expect(document.activeElement!.textContent).toBe('Sort Ascending');
        await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
        expect(document.activeElement!.textContent).toBe('Move Up');
        await userEvent.keyboard('{Enter}');
        expect(order(api, 'rowGroup')).toEqual(['b', 'a', 'c']);
        expect(document.activeElement).toBe(pill(api, 'rowGroup'));
    });

    test('header panel works without Column Menu or Columns Tool Panel and uses locale overrides', async () => {
        const api = await create(
            'rowGroup',
            {
                sideBar: undefined,
                columnDefs: ['a', 'b', 'c'].map((field) => ({ field, rowGroup: true, enableRowGroup: true })),
                localeText: { moveLeft: 'Earlier', moveRight: 'Later' },
            },
            headerGrids
        );
        const menu = await open(api, 'rowGroup', true);
        await userEvent.click(getByRole(menu, 'menuitem', { name: 'Earlier' }));
        expect(order(api, 'rowGroup')).toEqual(['b', 'a', 'c']);
    });
});
