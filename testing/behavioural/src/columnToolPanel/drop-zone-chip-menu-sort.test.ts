import { getByRole, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';

import type { Zone } from './dropZoneMoveMenuHarness';
import { open, pill, setupDropZoneMoveMenuSuite } from './dropZoneMoveMenuHarness';

const SORT_ITEMS = ['Sort Ascending', 'Sort Descending', 'Clear Sort'];

const sortEntries = (menu: HTMLElement) =>
    Array.from(menu.querySelectorAll('[role="menuitem"]'), (el) => el.textContent!).filter((name) =>
        SORT_ITEMS.includes(name)
    );

const columnSorts = (api: GridApi, key: 'sort' | 'pivotSort') =>
    Object.fromEntries(
        api
            .getColumnState()
            .filter(({ colId }) => ['a', 'b', 'c'].includes(colId))
            .map((state) => [state.colId, state[key] ?? null])
    );

const visibleSortIcon = (chip: HTMLElement) =>
    (['ascending', 'descending'] as const).find((direction) =>
        chip.querySelector(`.ag-sort-${direction}-icon:not(.ag-hidden)`)
    ) ?? null;

const pivotKeyOrder = (api: GridApi) => [
    ...new Set(api.getPivotResultColumns()!.flatMap((col) => col.getColDef().pivotKeys?.[1] ?? [])),
];

const deferredSideBar: GridOptions['sideBar'] = {
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
};

const pivotRowData = [5, 2, 9].map((b) => ({ a: 1, b, c: 3, value: 4 }));

describe('drop zone chip menu sort items', () => {
    const { create } = setupDropZoneMoveMenuSuite();

    async function clickItem(api: GridApi, zone: Zone, horizontal: boolean, name: string) {
        const menu = await open(api, zone, horizontal);
        await userEvent.click(getByRole(menu, 'menuitem', { name }));
    }

    test.each<{ zone: Zone; horizontal: boolean }>([
        { zone: 'rowGroup', horizontal: false },
        { zone: 'aggregation', horizontal: false },
        { zone: 'rowGroup', horizontal: true },
    ])('$zone horizontal=$horizontal sorts the column alone and clears it', async ({ zone, horizontal }) => {
        const api = await create(zone, horizontal ? { sideBar: false } : {});
        api.applyColumnState({ state: [{ colId: 'a', sort: 'asc' }] });

        expect(sortEntries(await open(api, zone, horizontal))).toEqual(['Sort Ascending', 'Sort Descending']);
        await userEvent.click(getByRole(getGridElement(api) as HTMLElement, 'menuitem', { name: 'Sort Descending' }));
        expect(columnSorts(api, 'sort')).toEqual({ a: null, b: 'desc', c: null });

        await clickItem(api, zone, horizontal, 'Sort Ascending');
        expect(columnSorts(api, 'sort')).toEqual({ a: null, b: 'asc', c: null });

        expect(sortEntries(await open(api, zone, horizontal))).toEqual(SORT_ITEMS);
        await userEvent.click(getByRole(getGridElement(api) as HTMLElement, 'menuitem', { name: 'Clear Sort' }));
        expect(columnSorts(api, 'sort')).toEqual({ a: null, b: null, c: null });
    });

    test.each([false, true])('Column Labels horizontal=%s sets the pivot sort', async (horizontal) => {
        const api = await create('pivot', { rowData: pivotRowData, ...(horizontal ? { sideBar: false } : {}) });
        expect(pivotKeyOrder(api)).toEqual(['2', '5', '9']);

        expect(sortEntries(await open(api, 'pivot', horizontal))).toEqual(SORT_ITEMS);
        await userEvent.click(getByRole(getGridElement(api) as HTMLElement, 'menuitem', { name: 'Sort Descending' }));
        expect(columnSorts(api, 'pivotSort')).toEqual({ a: 'asc', b: 'desc', c: 'asc' });
        expect(pivotKeyOrder(api)).toEqual(['9', '5', '2']);

        await clickItem(api, 'pivot', horizontal, 'Clear Sort');
        expect(columnSorts(api, 'pivotSort').b).toBeNull();
        expect(pivotKeyOrder(api)).toEqual(['5', '2', '9']);
        expect(columnSorts(api, 'sort')).toEqual({ a: null, b: null, c: null });

        await clickItem(api, 'pivot', horizontal, 'Sort Ascending');
        expect(columnSorts(api, 'pivotSort').b).toBe('asc');
        expect(pivotKeyOrder(api)).toEqual(['2', '5', '9']);
    });

    test.each<{ zone: Zone; option: 'rowGroupPanelSuppressSort' | 'pivotPanelSuppressSort' }>([
        { zone: 'rowGroup', option: 'rowGroupPanelSuppressSort' },
        { zone: 'pivot', option: 'pivotPanelSuppressSort' },
    ])('$option removes the sort items and sort instruction of $zone chips', async ({ zone, option }) => {
        const api = await create(zone);
        expect(sortEntries(await open(api, zone))).not.toEqual([]);
        await userEvent.keyboard('{Escape}');

        api.setGridOption(option, true);
        for (const horizontal of [false, true]) {
            expect(pill(api, zone, horizontal).getAttribute('aria-label')).not.toContain('Press ENTER to sort');
            const menu = await open(api, zone, horizontal);
            expect(sortEntries(menu)).toEqual([]);
            expect(getByRole(menu, 'menuitem', { name: 'Remove Field' })).toBeTruthy();
            await userEvent.keyboard('{Escape}');
        }
    });

    test.each<{ label: string; zone: Zone; chipZone: Zone; name: string; options: GridOptions }>([
        { label: 'Values chip in pivot mode', zone: 'pivot', chipZone: 'aggregation', name: 'Value', options: {} },
        {
            label: 'non-sortable column',
            zone: 'rowGroup',
            chipZone: 'rowGroup',
            name: 'B',
            options: { defaultColDef: { sortable: false } },
        },
    ])('$label has no sort items', async ({ zone, chipZone, name, options }) => {
        const api = await create(zone, options);
        const menu = await open(api, chipZone, false, name);
        expect(sortEntries(menu)).toEqual([]);
        expect(getByRole(menu, 'menuitem', { name: 'Remove Field' })).toBeTruthy();
    });

    test('deferred Sort Descending updates the chip and applies on Apply', async () => {
        const api = await create('rowGroup', { sideBar: deferredSideBar });

        await clickItem(api, 'rowGroup', false, 'Sort Descending');
        expect(visibleSortIcon(pill(api, 'rowGroup'))).toBe('descending');
        expect(columnSorts(api, 'sort')).toEqual({ a: null, b: null, c: null });

        await userEvent.click(getByRole(getGridElement(api) as HTMLElement, 'button', { name: 'Apply' }));
        await waitFor(() => expect(columnSorts(api, 'sort')).toEqual({ a: null, b: 'desc', c: null }));
    });

    test('deferred Column Labels Sort Descending updates the chip and applies on Apply', async () => {
        const api = await create('pivot', { sideBar: deferredSideBar });

        await clickItem(api, 'pivot', false, 'Sort Descending');
        expect(visibleSortIcon(pill(api, 'pivot'))).toBe('descending');
        expect(columnSorts(api, 'pivotSort')).toEqual({ a: 'asc', b: 'asc', c: 'asc' });

        await userEvent.click(getByRole(getGridElement(api) as HTMLElement, 'button', { name: 'Apply' }));
        await waitFor(() => expect(columnSorts(api, 'pivotSort')).toEqual({ a: 'asc', b: 'desc', c: 'asc' }));
    });

    test('Values chips show and announce the sort outside pivot mode, and clicking opens the aggregation popup', async () => {
        const api = await create('aggregation');
        api.applyColumnState({ state: [{ colId: 'b', sort: 'desc' }] });
        let chip = pill(api, 'aggregation');
        expect(visibleSortIcon(chip)).toBe('descending');
        expect(chip.getAttribute('aria-label')).toContain('B, descending');

        await userEvent.click(chip);
        expect(document.querySelector('.ag-select-agg-func-popup')).not.toBeNull();
        expect(columnSorts(api, 'sort')).toEqual({ a: null, b: 'desc', c: null });
        await userEvent.keyboard('{Escape}');

        api.setGridOption('pivotMode', true);
        chip = pill(api, 'aggregation');
        expect(visibleSortIcon(chip)).toBeNull();
        expect(chip.getAttribute('aria-label')).not.toContain('descending');
    });
});
