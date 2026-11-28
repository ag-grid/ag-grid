import { findByRole, fireEvent, getByRole } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';

import { getGridElement } from 'ag-grid-community';

import type { Zone } from './dropZoneMoveMenuHarness';
import {
    defaultMenuEntries,
    disabledEntries,
    menuEntries,
    moveLabels,
    open,
    order,
    pill,
    setupDropZoneMoveMenuSuite,
} from './dropZoneMoveMenuHarness';

const DEFAULT_TOKENS: Record<Zone, string[]> = {
    rowGroup: [
        'sortAscending',
        'sortDescending',
        'separator',
        'moveToValues',
        'separator',
        'moveUp',
        'moveDown',
        'separator',
        'removeField',
    ],
    pivot: [
        'sortAscending',
        'sortDescending',
        'sortUnSort',
        'separator',
        'moveToRowGroups',
        'moveToValues',
        'separator',
        'moveUp',
        'moveDown',
        'separator',
        'removeField',
    ],
    aggregation: [
        'sortAscending',
        'sortDescending',
        'separator',
        'moveToRowGroups',
        'separator',
        'moveUp',
        'moveDown',
        'separator',
        'removeField',
    ],
};
const toHorizontal = (token: string) => ({ moveUp: 'moveLeft', moveDown: 'moveRight' })[token] ?? token;

describe('drop zone move menus', () => {
    const create = setupDropZoneMoveMenuSuite().create;
    // Escape keeps userEvent's default delay: without it, the key lands before a keyboard-opened menu takes focus.
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup({ delay: null });
    });

    describe.each<{ zone: Zone; horizontal: boolean }>([
        { zone: 'rowGroup', horizontal: false },
        { zone: 'pivot', horizontal: false },
        { zone: 'aggregation', horizontal: false },
        { zone: 'rowGroup', horizontal: true },
        { zone: 'pivot', horizontal: true },
    ])('$zone horizontal=$horizontal', ({ zone, horizontal }) => {
        // Horizontal tests without focus asserts drop the tool panel; focus tests keep it, to fail on its twin pill.
        const onlyPanelUnderTest = horizontal ? { sideBar: false } : {};
        test.each([false, true])('moves both ways and restores focus, RTL=%s', async (enableRtl) => {
            const api = await create(zone, { enableRtl });
            const beforeLabel = horizontal ? 'Move Left' : 'Move Up';
            const afterLabel = horizontal ? 'Move Right' : 'Move Down';
            let menu = await open(api, zone, horizontal);
            expect(menuEntries(menu)).toEqual(defaultMenuEntries(zone, horizontal));
            expect(disabledEntries(menu)).toEqual([]);
            await user.click(getByRole(menu, 'menuitem', { name: beforeLabel }));
            expect(order(api, zone)).toEqual(horizontal && enableRtl ? ['a', 'c', 'b'] : ['b', 'a', 'c']);
            expect(document.activeElement).toBe(pill(api, zone, horizontal));
            expect(getGridElement(api)!.querySelector('[role="menu"]')).toBeNull();

            menu = await open(api, zone, horizontal);
            await user.click(getByRole(menu, 'menuitem', { name: afterLabel }));
            expect(order(api, zone)).toEqual(['a', 'b', 'c']);
            expect(document.activeElement).toBe(pill(api, zone, horizontal));
        });

        test.each([false, true])('disables first/last moves, RTL=%s', async (enableRtl) => {
            const api = await create(zone, { ...onlyPanelUnderTest, enableRtl });
            const labels = moveLabels(horizontal);
            if (horizontal && enableRtl) {
                labels.reverse();
            }
            for (const [index, name] of ['A', 'C'].entries()) {
                const menu = await open(api, zone, horizontal, name);
                expect(getByRole(menu, 'menuitem', { name: labels[index] }).getAttribute('aria-disabled')).toBe('true');
                expect(getByRole(menu, 'menuitem', { name: labels[1 - index] }).getAttribute('aria-disabled')).not.toBe(
                    'true'
                );
                await userEvent.keyboard('{Escape}');
            }
        });

        test('opens read-only chips with sort items and disabled moves and Remove Field, without Move to', async () => {
            const api = await create(zone, onlyPanelUnderTest);
            api.setGridOption('functionsReadOnly', true);
            const item = pill(api, zone, horizontal);
            expect(item.getAttribute('aria-haspopup')).toBe('menu');
            const menu = await open(api, zone, horizontal);
            expect(menuEntries(menu)).toEqual(defaultMenuEntries(zone, horizontal, false));
            expect(disabledEntries(menu)).toEqual([...moveLabels(horizontal), 'Remove Field']);
            await user.click(getByRole(menu, 'menuitem', { name: moveLabels(horizontal)[0] }));
            await user.click(getByRole(menu, 'menuitem', { name: 'Remove Field' }));
            expect(order(api, zone)).toEqual(['a', 'b', 'c']);
            await userEvent.keyboard('{Escape}');

            api.setGridOption('functionsReadOnly', false);
            expect(disabledEntries(await open(api, zone, horizontal))).toEqual([]);
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
            expect(menuEntries(menu)).toEqual(defaultMenuEntries(zone, horizontal));
            expect(disabledEntries(menu)).toEqual(moveLabels(horizontal));
            for (const name of moveLabels(horizontal)) {
                await user.click(getByRole(menu, 'menuitem', { name }));
            }
            expect(order(api, zone)).toEqual(['b']);
            expect(item.getAttribute('aria-haspopup')).toBe('menu');
            await userEvent.keyboard('{Escape}');
            expect(document.activeElement).toBe(item);
        });

        test('keeps only the applicable explicitly requested items under read-only', async () => {
            const api = await create(zone, {
                ...onlyPanelUnderTest,
                functionsReadOnly: true,
                getColumnDropZoneMenuItems: () => [
                    'moveToRowGroups',
                    'moveToValues',
                    'moveToColumnLabels',
                    'moveUp',
                    'moveDown',
                    'moveLeft',
                    'moveRight',
                    'removeField',
                    'sortAscending',
                ],
            });
            const item = pill(api, zone, horizontal);
            expect(item.getAttribute('aria-haspopup')).toBe('menu');
            const menu = await open(api, zone, horizontal);
            expect(menuEntries(menu)).toEqual([...moveLabels(horizontal), 'Remove Field', 'Sort Ascending']);
            expect(disabledEntries(menu)).toEqual([...moveLabels(horizontal), 'Remove Field']);
        });

        test.each([false, undefined])(
            'omits Move to and disables moves when the function permissions are %s',
            async (enabled) => {
                const api = await create(zone, onlyPanelUnderTest);
                api.setGridOption(
                    'columnDefs',
                    api.getColumnDefs()!.map((colDef) => ({
                        ...colDef,
                        enableRowGroup: enabled,
                        enablePivot: enabled,
                        enableValue: enabled,
                    }))
                );
                const item = pill(api, zone, horizontal);
                expect(item.getAttribute('aria-haspopup')).toBe('menu');
                const menu = await open(api, zone, horizontal);
                expect(menuEntries(menu)).toEqual(defaultMenuEntries(zone, horizontal, false));
                expect(disabledEntries(menu)).toEqual(moveLabels(horizontal));
            }
        );

        test.each(['suppressMovableColumns', 'suppressMovable', 'lockPosition'] as const)(
            'allows panel reordering when %s prevents grid column reordering',
            async (restriction) => {
                const api = await create(zone, {
                    ...onlyPanelUnderTest,
                    suppressMovableColumns: restriction === 'suppressMovableColumns',
                    defaultColDef: {
                        suppressMovable: restriction === 'suppressMovable',
                        lockPosition: restriction === 'lockPosition',
                    },
                });
                expect(pill(api, zone, horizontal).getAttribute('aria-haspopup')).toBe('menu');
                let menu = await open(api, zone, horizontal);
                await user.click(getByRole(menu, 'menuitem', { name: horizontal ? 'Move Left' : 'Move Up' }));
                expect(order(api, zone)).toEqual(['b', 'a', 'c']);
                menu = await open(api, zone, horizontal);
                await user.click(getByRole(menu, 'menuitem', { name: horizontal ? 'Move Right' : 'Move Down' }));
                expect(order(api, zone)).toEqual(['a', 'b', 'c']);
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

        test('allows suppressing menus by source without calling column-menu callbacks', async () => {
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
                    source: zone,
                    defaultItems: DEFAULT_TOKENS[zone].map((token) => (horizontal ? toHorizontal(token) : token)),
                })
            );
            expect(getColumnMenuItems).not.toHaveBeenCalled();
            expect(columnMenuItems).not.toHaveBeenCalled();
        });
    });
});
