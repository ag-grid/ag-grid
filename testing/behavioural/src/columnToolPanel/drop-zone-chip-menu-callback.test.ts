import { fireEvent, getByRole, queryByRole } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { TestGridsManager } from 'ag-test-utils';

import type { DefaultColumnDropZoneMenuItem } from 'ag-grid-community';
import { ClientSideRowModelModule, getGridElement } from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    PivotModule,
    RowGroupingModule,
    RowGroupingPanelModule,
} from 'ag-grid-enterprise';

import type { Zone } from './dropZoneMoveMenuHarness';
import { menuEntries, open, pill, setupDropZoneMoveMenuSuite, toolPanelDropZone } from './dropZoneMoveMenuHarness';

const queryMenu = (api: Parameters<typeof getGridElement>[0]) =>
    queryByRole(getGridElement(api) as HTMLElement, 'menu');

describe('drop zone chip menu callback, modules and refresh', () => {
    const { create } = setupDropZoneMoveMenuSuite();
    const menuGrids = new TestGridsManager({
        modules: [
            ColumnsToolPanelModule,
            PivotModule,
            RowGroupingModule,
            RowGroupingPanelModule,
            ColumnMenuModule,
            ContextMenuModule,
        ],
    });
    const minimalGrids = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            ColumnsToolPanelModule,
            RowGroupingPanelModule,
            RowGroupingModule,
            PivotModule,
        ],
    });
    afterEach(() => {
        menuGrids.reset();
        minimalGrids.reset();
    });

    test.each<{ zone: Zone; horizontal: boolean; defaultItems: DefaultColumnDropZoneMenuItem[] }>([
        {
            zone: 'rowGroup',
            horizontal: false,
            defaultItems: [
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
        },
        {
            zone: 'aggregation',
            horizontal: false,
            defaultItems: [
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
        },
        {
            zone: 'pivot',
            horizontal: true,
            defaultItems: [
                'sortAscending',
                'sortDescending',
                'sortUnSort',
                'separator',
                'moveToRowGroups',
                'moveToValues',
                'separator',
                'moveLeft',
                'moveRight',
                'separator',
                'removeField',
            ],
        },
    ])(
        '$zone horizontal=$horizontal passes the applicable defaults and ignores column menu options',
        async ({ zone, horizontal, defaultItems }) => {
            const getColumnDropZoneMenuItems = vi.fn(({ defaultItems }) => defaultItems);
            const leaked = () => [{ name: 'Leaked' }];
            const columnMenuOptions = {
                getColumnMenuItems: vi.fn(leaked),
                getMainMenuItems: vi.fn(leaked),
                columnMenuItems: vi.fn(leaked),
                mainMenuItems: vi.fn(leaked),
            };
            const api = await create(
                zone,
                {
                    getColumnDropZoneMenuItems,
                    getColumnMenuItems: columnMenuOptions.getColumnMenuItems,
                    getMainMenuItems: columnMenuOptions.getMainMenuItems,
                    defaultColDef: {
                        columnMenuItems: columnMenuOptions.columnMenuItems,
                        mainMenuItems: columnMenuOptions.mainMenuItems,
                    },
                },
                menuGrids
            );
            getColumnDropZoneMenuItems.mockClear();

            const menu = await open(api, zone, horizontal);
            expect(getColumnDropZoneMenuItems).toHaveBeenCalledTimes(1);
            expect(getColumnDropZoneMenuItems).toHaveBeenCalledWith(
                expect.objectContaining({ column: api.getColumn('b'), source: zone, defaultItems })
            );
            expect(queryByRole(menu, 'menuitem', { name: 'Leaked' })).toBeNull();
            for (const option of Object.values(columnMenuOptions)) {
                expect(option).not.toHaveBeenCalled();
            }
        }
    );

    test.each([false, true])(
        'keeps custom items in place and drops inapplicable tokens, horizontal=%s',
        async (horizontal) => {
            const action = vi.fn();
            const api = await create('rowGroup', {
                getColumnDropZoneMenuItems: () => [
                    'valueAggSubMenu',
                    'separator',
                    { name: 'Custom', action },
                    'showValuesAsSubMenu',
                    'separator',
                    'moveToRowGroups',
                    'separator',
                    'sortAscending',
                    'moveUp',
                    'moveToValues',
                    'separator',
                    'separator',
                    'removeField',
                    'separator',
                ],
            });
            const menu = await open(api, 'rowGroup', horizontal);
            expect(menuEntries(menu)).toEqual(
                horizontal
                    ? ['Custom', 'separator', 'Sort Ascending', 'Move to Values', 'separator', 'Remove Field']
                    : [
                          'Custom',
                          'separator',
                          'Sort Ascending',
                          'Move Up',
                          'Move to Values',
                          'separator',
                          'Remove Field',
                      ]
            );
            await userEvent.click(getByRole(menu, 'menuitem', { name: 'Custom' }));
            expect(action).toHaveBeenCalledWith(expect.objectContaining({ column: api.getColumn('b') }));
        }
    );

    test('aria-haspopup follows functionsReadOnly, and read-only chips keep their default menu', async () => {
        const api = await create('rowGroup', { getColumnDropZoneMenuItems: () => ['moveToValues'] });
        expect(pill(api, 'rowGroup').getAttribute('aria-haspopup')).toBe('menu');

        api.setGridOption('functionsReadOnly', true);
        const chip = pill(api, 'rowGroup');
        expect(chip.hasAttribute('aria-haspopup')).toBe(false);
        fireEvent.contextMenu(chip);
        expect(queryMenu(api)).toBeNull();

        api.setGridOption('getColumnDropZoneMenuItems', undefined);
        expect(pill(api, 'rowGroup').getAttribute('aria-haspopup')).toBe('menu');
        expect(menuEntries(await open(api, 'rowGroup'))).toEqual([
            'Sort Ascending',
            'Sort Descending',
            'separator',
            'Move Up',
            'Move Down',
            'separator',
            'Remove Field',
        ]);
    });

    test('works without the column and context menu modules', async () => {
        const api = await create('rowGroup', {}, minimalGrids);
        const menu = await open(api, 'rowGroup');
        expect(menuEntries(menu)).toEqual([
            'Sort Ascending',
            'Sort Descending',
            'separator',
            'Move to Values',
            'separator',
            'Move Up',
            'Move Down',
            'separator',
            'Remove Field',
        ]);
        await userEvent.click(getByRole(menu, 'menuitem', { name: 'Sort Ascending' }));
        expect(api.getColumnState().find(({ colId }) => colId === 'b')!.sort).toBe('asc');
    });

    test('Values chip items follow pivot mode', async () => {
        const api = await create('aggregation');
        const nonPivotItems = [
            'Sort Ascending',
            'Sort Descending',
            'separator',
            'Move to Row Groups',
            'separator',
            'Move Up',
            'Move Down',
            'separator',
            'Remove Field',
        ];
        expect(menuEntries(await open(api, 'aggregation'))).toEqual(nonPivotItems);
        await userEvent.keyboard('{Escape}');

        api.setGridOption('pivotMode', true);
        expect(menuEntries(await open(api, 'aggregation'))).toEqual([
            'Move to Row Groups',
            'Move to Column Labels',
            'separator',
            'Move Up',
            'Move Down',
            'separator',
            'Remove Field',
        ]);
        await userEvent.keyboard('{Escape}');

        api.setGridOption('pivotMode', false);
        expect(menuEntries(await open(api, 'aggregation'))).toEqual(nonPivotItems);
    });

    test('openChipMenu opens the menu of a chip in the panel', async () => {
        const api = await create('rowGroup');
        expect(toolPanelDropZone(api, 'aggregation').openChipMenu(api.getColumn('b'))).toBe(false);
        expect(queryMenu(api)).toBeNull();

        expect(toolPanelDropZone(api, 'rowGroup').openChipMenu(api.getColumn('b'))).toBe(true);
        await userEvent.click(getByRole(queryMenu(api)!, 'menuitem', { name: 'Sort Descending' }));
        expect(api.getColumnState().find(({ colId }) => colId === 'b')!.sort).toBe('desc');
    });
});
