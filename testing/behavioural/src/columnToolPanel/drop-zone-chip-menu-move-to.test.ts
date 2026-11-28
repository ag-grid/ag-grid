import { findByRole, fireEvent, getByRole, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { TestGridsManager } from 'ag-test-utils';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { PivotModule, RowGroupingModule, RowGroupingPanelModule, ToolbarModule } from 'ag-grid-enterprise';

import type { Zone } from './dropZoneMoveMenuHarness';
import {
    chips,
    disabledEntries,
    menuEntries,
    open,
    order,
    panel,
    pill,
    setupDropZoneMoveMenuSuite,
} from './dropZoneMoveMenuHarness';

const aggFuncOf = (api: GridApi, colId: string) => api.getColumnState().find((state) => state.colId === colId)!.aggFunc;

async function activateByKeyboard(menu: HTMLElement, name: string) {
    await waitFor(() => expect(menu.contains(document.activeElement)).toBe(true));
    for (let i = 0; i < 10 && document.activeElement!.textContent !== name; ++i) {
        await userEvent.keyboard('{ArrowDown}');
    }
    expect(document.activeElement!.textContent).toBe(name);
    await userEvent.keyboard('{Enter}');
}

const SORT = ['Sort Ascending', 'Sort Descending', 'separator'];
const MOVE_REMOVE = ['Move Up', 'Move Down', 'separator', 'Remove Field'];

describe('drop zone chip menu move to and remove', () => {
    const { create } = setupDropZoneMoveMenuSuite();

    test.each<{
        source: Zone;
        target: Zone;
        item: string;
        options?: GridOptions;
        label: string;
        aggFunc: string | null;
    }>([
        { source: 'rowGroup', target: 'aggregation', item: 'Move to Values', label: 'sum(B)', aggFunc: 'sum' },
        { source: 'aggregation', target: 'rowGroup', item: 'Move to Row Groups', label: 'B', aggFunc: null },
        {
            source: 'rowGroup',
            target: 'pivot',
            item: 'Move to Column Labels',
            options: { pivotMode: true },
            label: 'B',
            aggFunc: null,
        },
    ])('$item appends the column to the target and removes it from $source', async (params) => {
        const { source, target, item, options, label, aggFunc } = params;
        const api = await create(source, options);
        if (target === 'rowGroup') {
            api.setRowGroupColumns(['c']);
        } else if (target === 'pivot') {
            api.setPivotColumns(['c']);
        } else {
            api.setValueColumns(['c']);
        }
        const menu = await open(api, source);
        await userEvent.click(getByRole(menu, 'menuitem', { name: item }));

        expect(order(api, target)).toEqual(['c', 'b']);
        expect(order(api, source)).toEqual(['a', 'c']);
        expect(aggFuncOf(api, 'b')).toBe(aggFunc);
        expect(chips(panel(api, target))).toEqual([target === 'aggregation' ? 'sum(C)' : 'C', label]);
        expect(chips(panel(api, source))).toEqual(source === 'aggregation' ? ['sum(A)', 'sum(C)'] : ['A', 'C']);
    });

    test.each<{ name: string; prepare: (api: GridApi) => void; expected: string[] }>([
        {
            name: 'offers only other zones, and no Column Labels outside pivot mode',
            prepare: () => {},
            expected: [...SORT, 'Move to Values', 'separator', ...MOVE_REMOVE],
        },
        {
            name: 'offers no zone the column disallows',
            prepare: (api) =>
                api.setGridOption(
                    'columnDefs',
                    api.getColumnDefs()!.map((colDef) => ({ ...colDef, enableValue: false }))
                ),
            expected: [...SORT, ...MOVE_REMOVE],
        },
        {
            name: 'offers no Values when the column is already a value',
            prepare: (api) => api.setValueColumns(['b']),
            expected: [...SORT, ...MOVE_REMOVE],
        },
    ])('Row Groups chip menu $name', async ({ prepare, expected }) => {
        const api = await create('rowGroup');
        prepare(api);
        expect(menuEntries(await open(api, 'rowGroup'))).toEqual(expected);
    });

    test.each([
        { suppressGroupChangesColumnVisibility: undefined, changesVisibility: true },
        { suppressGroupChangesColumnVisibility: true, changesVisibility: false },
    ])(
        'moving between Row Groups and Values changes visibility like a drag, suppress=$suppressGroupChangesColumnVisibility',
        async ({ suppressGroupChangesColumnVisibility, changesVisibility }) => {
            const api = await create('aggregation', { suppressGroupChangesColumnVisibility });
            let menu = await open(api, 'aggregation');
            await userEvent.click(getByRole(menu, 'menuitem', { name: 'Move to Row Groups' }));
            expect(api.getColumn('b')!.isVisible()).toBe(!changesVisibility);

            api.setColumnsVisible(['b'], false);
            menu = await open(api, 'rowGroup');
            await userEvent.click(getByRole(menu, 'menuitem', { name: 'Move to Values' }));
            expect(api.getColumn('b')!.isVisible()).toBe(changesVisibility);
        }
    );

    test.each<{ name: string; options: GridOptions; chip: string }>([
        { name: 'functionsReadOnly', options: { functionsReadOnly: true }, chip: 'B' },
        { name: 'a locked group column', options: { groupLockGroupColumns: 1 }, chip: 'A' },
    ])('disables Remove Field and moves, and offers no Move to, for $name', async ({ options, chip }) => {
        const api = await create('rowGroup', options);
        const menu = await open(api, 'rowGroup', false, chip);
        expect(menuEntries(menu)).toEqual([...SORT, ...MOVE_REMOVE]);
        expect(disabledEntries(menu)).toEqual(['Move Up', 'Move Down', 'Remove Field']);
    });

    test.each([
        { horizontal: false, key: { key: 'F10', shiftKey: true }, item: 'Remove Field', values: [] },
        { horizontal: false, key: { key: 'ContextMenu' }, item: 'Move to Values', values: ['b'] },
        { horizontal: true, key: { key: 'F10', shiftKey: true }, item: 'Move to Values', values: ['b'] },
        { horizontal: true, key: { key: 'ContextMenu' }, item: 'Remove Field', values: [] },
    ])(
        'horizontal=$horizontal: $key.key opens the menu and $item by keyboard keeps focus in the zone',
        async ({ horizontal, key, item, values }) => {
            const api = await create('rowGroup', horizontal ? { sideBar: false } : {});
            const chip = pill(api, 'rowGroup', horizontal);
            chip.focus();
            fireEvent.keyDown(chip, key);
            await activateByKeyboard(await findByRole(getGridElement(api) as HTMLElement, 'menu'), item);

            expect(order(api, 'rowGroup')).toEqual(['a', 'c']);
            expect(order(api, 'aggregation')).toEqual(values);
            expect(document.activeElement).not.toBe(document.body);
            expect(panel(api, 'rowGroup', horizontal).contains(document.activeElement)).toBe(true);
        }
    );

    test('RTL horizontal chips offer Move Left and Right, flipped', async () => {
        const api = await create('rowGroup', { enableRtl: true, sideBar: false });
        const menu = await open(api, 'rowGroup', true, 'A');
        expect(menuEntries(menu)).toEqual([
            ...SORT,
            'Move to Values',
            'separator',
            'Move Left',
            'Move Right',
            'separator',
            'Remove Field',
        ]);
        expect(disabledEntries(menu)).toEqual(['Move Right']);
        await userEvent.click(getByRole(menu, 'menuitem', { name: 'Move Left' }));
        expect(order(api, 'rowGroup')).toEqual(['b', 'a', 'c']);
    });
});

describe('toolbar Row Groups chip menu', () => {
    const grids = new TestGridsManager({
        modules: [PivotModule, RowGroupingModule, RowGroupingPanelModule, ToolbarModule],
    });
    afterEach(() => grids.reset());

    test('moves a chip to Values', async () => {
        const api = await grids.createGridAndWait('grid', {
            columnDefs: ['a', 'b'].map((field) => ({ field, enableRowGroup: true, enableValue: true, rowGroup: true })),
            rowData: [{ a: 1, b: 2 }],
            toolbar: { items: ['agRowGroupPanelToolbarItem'] },
        });
        const toolbar = getGridElement(api)!.querySelector<HTMLElement>('.ag-toolbar')!;
        const chip = await waitFor(() => {
            const cell = Array.from(toolbar.querySelectorAll<HTMLElement>('.ag-column-drop-cell')).find(
                (el) => el.querySelector('.ag-column-drop-cell-text')!.textContent!.trim() === 'B'
            );
            expect(cell).toBeDefined();
            return cell!;
        });
        fireEvent.contextMenu(chip);
        const menu = await findByRole(getGridElement(api) as HTMLElement, 'menu');
        await userEvent.click(getByRole(menu, 'menuitem', { name: 'Move to Values' }));

        expect(order(api, 'rowGroup')).toEqual(['a']);
        expect(order(api, 'aggregation')).toEqual(['b']);
        expect(chips(toolbar)).toEqual(['A']);
    });
});
