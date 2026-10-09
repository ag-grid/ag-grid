import { findByText, getAllByText, getByText, queryByText, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { TestGridsManager, polyfillOffsetParent } from 'ag-test-utils';

import type { ColDef, ColGroupDef, GridApi, GridOptions, IColumnToolPanel } from 'ag-grid-community';
import { ClientSideRowModelModule, getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule, ColumnMenuModule, ColumnsToolPanelModule } from 'ag-grid-enterprise';

import { openToolPanelContextMenu } from '../columnToolPanel/toolPanelContextMenuHarness';

type Surface = 'header' | 'panel';

describe('column movement menu actions', () => {
    const grids = new TestGridsManager({ modules: [AllEnterpriseModule] });
    const headerGrids = new TestGridsManager({ modules: [ClientSideRowModelModule, ColumnMenuModule] });
    const panelGrids = new TestGridsManager({ modules: [ClientSideRowModelModule, ColumnsToolPanelModule] });
    let restoreOffsetParent: () => void;

    beforeEach(() => {
        restoreOffsetParent = polyfillOffsetParent();
    });
    afterEach(() => {
        grids.reset();
        headerGrids.reset();
        panelGrids.reset();
        restoreOffsetParent();
    });

    const columnDefs: ColDef[] = ['a', 'b', 'c', 'd'].map((field) => ({ field }));
    const groupDef: ColGroupDef = { groupId: 'group', headerName: 'Group', children: [{ field: 'b' }, { field: 'c' }] };
    const groupedColumns = [{ field: 'a' }, groupDef, { field: 'd' }];

    const create = (options: GridOptions = {}, manager = grids) =>
        manager.createGridAndWait('column-move-menu', {
            columnDefs,
            rowData: [{ a: 1, b: 2, c: 3, d: 4 }],
            suppressColumnVirtualisation: true,
            ensureDomOrder: true,
            sideBar: { toolPanels: ['columns'], defaultToolPanel: 'columns' },
            ...options,
        });
    const order = (api: GridApi) => api.getColumnState().map(({ colId }) => colId);
    const labels = (surface: Surface) =>
        surface === 'header' ? ['Move Left', 'Move Right'] : ['Move Up', 'Move Down'];

    async function open(surface: Surface, api: GridApi, name = 'B', group = false): Promise<HTMLElement> {
        const grid = getGridElement(api) as HTMLElement;
        if (surface === 'panel') {
            await openToolPanelContextMenu(api.getToolPanelInstance('columns'), grid, name);
        } else {
            const header = group
                ? getByText(grid, name, { selector: '.ag-header-group-text' }).closest<HTMLElement>(
                      '.ag-header-group-cell'
                  )!
                : grid.querySelector<HTMLElement>(`.ag-header-cell[col-id="${name.toLowerCase()}"]`)!;
            header.focus();
            header.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
        }
        await findByText(grid, labels(surface)[0]);
        return grid;
    }

    describe.each<Surface>(['header', 'panel'])('%s', (surface) => {
        test.each([true, false])('moves a column backwards=%s', async (backwards) => {
            const api = await create();
            const grid = await open(surface, api);
            await userEvent.click(getByText(grid, labels(surface)[backwards ? 0 : 1]));
            expect(order(api)).toEqual(backwards ? ['b', 'a', 'c', 'd'] : ['a', 'c', 'b', 'd']);
        });

        test.each([true, false])('moves a group backwards=%s as a block', async (backwards) => {
            const api = await create({ columnDefs: groupedColumns });
            const grid = await open(surface, api, 'Group', true);
            await userEvent.click(getByText(grid, labels(surface)[backwards ? 0 : 1]));
            expect(order(api)).toEqual(backwards ? ['b', 'c', 'a', 'd'] : ['a', 'd', 'b', 'c']);
        });

        test.each(['suppressMovable', 'lockPosition'] as const)('explicit items respect %s', async (restriction) => {
            const api = await create({
                columnDefs: columnDefs.map((col) => (col.field === 'b' ? { ...col, [restriction]: true } : col)),
                getColumnMenuItems: () => (surface === 'header' ? ['moveLeft', 'moveRight'] : ['moveUp', 'moveDown']),
            });
            const before = order(api);
            const grid = await open(surface, api);
            for (const label of labels(surface)) {
                const item = getByText(grid, label).closest('[role="menuitem"]')!;
                expect(item.getAttribute('aria-disabled')).toBe('true');
                await userEvent.click(item);
                expect(order(api)).toEqual(before);
            }
        });

        test('disables movement beyond the first and last positions', async () => {
            const api = await create();
            let grid = await open(surface, api, 'A');
            expect(
                getByText(grid, labels(surface)[0]).closest('[role="menuitem"]')!.getAttribute('aria-disabled')
            ).toBe('true');
            await userEvent.keyboard('{Escape}');
            grid = await open(surface, api, 'D');
            expect(
                getByText(grid, labels(surface)[1]).closest('[role="menuitem"]')!.getAttribute('aria-disabled')
            ).toBe('true');
        });

        test('does not split married children', async () => {
            const api = await create({
                columnDefs: [{ ...groupDef, marryChildren: true }, { field: 'a' }, { field: 'd' }],
            });
            const grid = await open(surface, api, 'A');
            await userEvent.click(getByText(grid, labels(surface)[0]));
            expect(order(api)).toEqual(['a', 'b', 'c', 'd']);
        });

        test('rechecks restrictions when the action is selected', async () => {
            const api = await create();
            const grid = await open(surface, api);
            api.setGridOption('suppressMovableColumns', true);
            await userEvent.click(getByText(grid, labels(surface)[0]));
            expect(order(api)).toEqual(['a', 'b', 'c', 'd']);
        });

        test('offers no default movement when globally suppressed', async () => {
            const api = await create({ suppressMovableColumns: true });
            const grid = getGridElement(api) as HTMLElement;
            if (surface === 'header') {
                grid.querySelector('.ag-header-cell[col-id="b"]')!.dispatchEvent(
                    new MouseEvent('contextmenu', { bubbles: true })
                );
                await findByText(grid, 'Reset Columns');
            } else {
                await openToolPanelContextMenu(api.getToolPanelInstance('columns'), grid, 'B');
                await findByText(grid, 'Scroll B into View');
            }
            for (const label of labels(surface)) {
                expect(queryByText(grid, label)).toBeNull();
            }
        });

        test('respects a replacement menu', async () => {
            const api = await create({ getColumnMenuItems: () => [{ name: 'Custom action' }] });
            const grid = getGridElement(api) as HTMLElement;
            if (surface === 'header') {
                grid.querySelector('.ag-header-cell[col-id="b"]')!.dispatchEvent(
                    new MouseEvent('contextmenu', { bubbles: true })
                );
            } else {
                await openToolPanelContextMenu(api.getToolPanelInstance('columns'), grid, 'B');
            }
            await findByText(grid, 'Custom action');
            expect(queryByText(grid, labels(surface)[0])).toBeNull();
            expect(queryByText(grid, labels(surface)[1])).toBeNull();
        });
    });

    test.each([false, true])('header directions are visual in RTL=%s', async (enableRtl) => {
        const api = await create({ enableRtl });
        const grid = await open('header', api);
        expect(
            getByText(grid, 'Move Left').closest('[role="menuitem"]')!.querySelector('.ag-icon-left')
        ).not.toBeNull();
        expect(
            getByText(grid, 'Move Right').closest('[role="menuitem"]')!.querySelector('.ag-icon-right')
        ).not.toBeNull();
        await userEvent.click(getByText(grid, 'Move Left'));
        expect(order(api)).toEqual(enableRtl ? ['a', 'c', 'b', 'd'] : ['b', 'a', 'c', 'd']);
    });

    test('keeps header movement within its pinned section', async () => {
        const api = await create({ columnDefs: [{ field: 'a', pinned: 'left' }, { field: 'b' }, { field: 'c' }] });
        const grid = await open('header', api);
        expect(getByText(grid, 'Move Left').closest('[role="menuitem"]')!.getAttribute('aria-disabled')).toBe('true');
        await userEvent.click(getByText(grid, 'Move Right'));
        expect(order(api)).toEqual(['a', 'c', 'b']);
        expect(api.getColumn('a')!.getPinned()).toBe('left');
        expect(api.getColumn('b')!.getPinned()).toBeNull();
    });

    test('preserves hidden columns when moving a group', async () => {
        const api = await create({
            columnDefs: [
                { field: 'a' },
                { groupId: 'group', headerName: 'Group', children: [{ field: 'b' }, { field: 'c', hide: true }] },
                { field: 'd' },
            ],
        });
        const grid = await open('header', api, 'Group', true);
        await userEvent.click(getByText(grid, 'Move Right'));
        expect(order(api)).toEqual(['a', 'd', 'b', 'c']);
        expect(api.getColumn('c')!.isVisible()).toBe(false);
    });

    test.each([false, true])(
        'leaves unrelated hidden columns outside a group move (suppressMovable=%s)',
        async (suppressMovable) => {
            const api = await create({ columnDefs: [...groupedColumns, { field: 'x', hide: true, suppressMovable }] });
            api.moveColumns(['x'], 2);
            const grid = await open('header', api, 'Group', true);
            await userEvent.click(getByText(grid, 'Move Right'));
            expect(order(api)).toEqual(['a', 'x', 'd', 'b', 'c']);
            expect(api.getColumn('x')!.isVisible()).toBe(false);
        }
    );

    test('a restricted pinned split does not hide movement for the centre split', async () => {
        const api = await create({
            columnDefs: [
                { field: 'a' },
                { ...groupDef, children: [{ field: 'b', pinned: 'left', suppressMovable: true }, { field: 'c' }] },
                { field: 'd' },
            ],
        });
        const grid = getGridElement(api) as HTMLElement;
        const groupId = api.getColumn('c')!.getParent()!.getUniqueId();
        grid.querySelector(`.ag-header-group-cell[col-id="${groupId}"]`)!.dispatchEvent(
            new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
        );
        await userEvent.click(await findByText(grid, 'Move Right'));
        expect(order(api)).toEqual(['a', 'b', 'd', 'c']);
        expect(api.getColumn('b')!.getPinned()).toBe('left');
    });

    test.each<Surface>(['header', 'panel'])('supports locale and icon overrides in %s', async (surface) => {
        const key = surface === 'header' ? 'moveRight' : 'moveDown';
        const icon = surface === 'header' ? 'menuMoveRight' : 'menuMoveDown';
        const api = await create({
            localeText: { [key]: 'Custom move' },
            icons: { [icon]: '<span class="custom-move-arrow"></span>' },
        });
        const grid = await open(surface, api);
        const item = getByText(grid, 'Custom move').closest('[role="menuitem"]')!;
        expect(item.querySelector('.custom-move-arrow')).not.toBeNull();
        await userEvent.click(item);
        expect(order(api)).toEqual(['a', 'c', 'b', 'd']);
    });

    test('header actions do not require the Columns Tool Panel module', async () => {
        const api = await create({ sideBar: undefined }, headerGrids);
        const grid = await open('header', api);
        await userEvent.click(getByText(grid, 'Move Right'));
        expect(order(api)).toEqual(['a', 'c', 'b', 'd']);
    });

    test('the column chooser offers the same move items', async () => {
        const api = await create({ sideBar: undefined }, headerGrids);
        api.showColumnChooser();
        const dialog = await waitFor(() => {
            const element = document.querySelector<HTMLElement>('[role="dialog"]');
            expect(element).not.toBeNull();
            return element!;
        });
        const entry = await waitFor(() => {
            // The virtual list renders no rows until its viewport reports a height.
            const viewport = dialog.querySelector<HTMLElement>('.ag-column-select-virtual-list-viewport')!;
            Object.defineProperty(viewport, 'offsetHeight', { value: 300, configurable: true });
            viewport.dispatchEvent(new Event('scroll'));
            const item = getByText(dialog, 'B').closest<HTMLElement>('.ag-virtual-list-item');
            expect(item).not.toBeNull();
            return item!;
        });
        entry.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
        const grid = getGridElement(api) as HTMLElement;
        await userEvent.click(await findByText(grid, 'Move Down'));
        expect(order(api)).toEqual(['a', 'c', 'b', 'd']);
    });

    test('tool panel actions do not require the Column Menu module', async () => {
        const api = await create({}, panelGrids);
        const grid = await open('panel', api);
        expect(getByText(grid, 'Move Up').closest('[role="menuitem"]')!.querySelector('.ag-icon-up')).not.toBeNull();
        expect(
            getByText(grid, 'Move Down').closest('[role="menuitem"]')!.querySelector('.ag-icon-down')
        ).not.toBeNull();
        await userEvent.click(getByText(grid, 'Move Down'));
        expect(order(api)).toEqual(['a', 'c', 'b', 'd']);
    });

    test('tool-panel move indices account for generated columns', async () => {
        const api = await create({ rowNumbers: true });
        const grid = await open('panel', api);
        await userEvent.click(getByText(grid, 'Move Down'));
        expect(order(api).filter((id) => ['a', 'b', 'c', 'd'].includes(id))).toEqual(['a', 'c', 'b', 'd']);
    });

    test('supports the legacy header menu', async () => {
        const api = await create({ columnMenu: 'legacy' });
        api.showColumnMenu('b');
        const grid = getGridElement(api) as HTMLElement;
        await userEvent.click(await findByText(grid, 'Move Right'));
        expect(order(api)).toEqual(['a', 'c', 'b', 'd']);
    });

    test('does not offer tool-panel moves in pivot mode', async () => {
        const api = await create({
            pivotMode: true,
            // a grouped row must render, or `firstDataRendered` never fires and grid creation never settles
            columnDefs: columnDefs.map((col) => (col.field === 'a' ? { ...col, rowGroup: true } : col)),
            getColumnMenuItems: ({ defaultItems }) => [...defaultItems, { name: 'Custom action' }],
        });
        const grid = getGridElement(api) as HTMLElement;
        await openToolPanelContextMenu(api.getToolPanelInstance('columns'), grid, 'B');
        await findByText(grid, 'Custom action');
        expect(queryByText(grid, 'Move Up')).toBeNull();
        expect(queryByText(grid, 'Move Down')).toBeNull();
    });

    test('moves a collapsed tool-panel group as a block', async () => {
        const api = await create({ columnDefs: groupedColumns });
        api.getToolPanelInstance<IColumnToolPanel>('columns')!.collapseColumnGroups();
        const grid = await open('panel', api, 'Group', true);
        await userEvent.click(getByText(grid, 'Move Down'));
        expect(order(api)).toEqual(['a', 'd', 'b', 'c']);
    });

    test('moves only the selected split header group', async () => {
        const api = await create({ columnDefs: groupedColumns });
        api.moveColumns(['d'], 2);
        const grid = getGridElement(api) as HTMLElement;
        const header = getAllByText(grid, 'Group', { selector: '.ag-header-group-text' })[0].closest(
            '.ag-header-group-cell'
        )!;
        header.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
        await userEvent.click(await findByText(grid, 'Move Left'));
        expect(order(api)).toEqual(['b', 'a', 'd', 'c']);
    });

    test.each(['suppressColumnMove', 'suppressSyncLayoutWithGrid'] as const)(
        'respects tool-panel %s',
        async (restriction) => {
            const api = await create({
                sideBar: {
                    toolPanels: [
                        {
                            id: 'columns',
                            labelDefault: 'Columns',
                            labelKey: 'columns',
                            iconKey: 'columns',
                            toolPanel: 'agColumnsToolPanel',
                            toolPanelParams: { [restriction]: true },
                        },
                    ],
                    defaultToolPanel: 'columns',
                },
            });
            const grid = getGridElement(api) as HTMLElement;
            await openToolPanelContextMenu(api.getToolPanelInstance('columns'), grid, 'B');
            await findByText(grid, 'Scroll B into View');
            expect(queryByText(grid, 'Move Up')).toBeNull();
            expect(queryByText(grid, 'Move Down')).toBeNull();
        }
    );

    test.each(['apply', 'cancel'] as const)('stages tool-panel moves until %s', async (button) => {
        const api = await create({
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: { buttons: ['apply', 'cancel'] },
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });
        const grid = await open('panel', api);
        await userEvent.click(getByText(grid, 'Move Down'));
        expect(order(api)).toEqual(['a', 'b', 'c', 'd']);
        await userEvent.click(getByText(grid, button === 'apply' ? 'Apply' : 'Cancel', { selector: 'button' }));
        expect(order(api)).toEqual(button === 'apply' ? ['a', 'c', 'b', 'd'] : ['a', 'b', 'c', 'd']);
    });

    test('applies a deferred married-group move without splitting its children', async () => {
        const api = await create({
            columnDefs: [{ field: 'a' }, { ...groupDef, marryChildren: true }, { field: 'd' }],
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: { buttons: ['apply', 'cancel'] },
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });
        const grid = await open('panel', api, 'Group', true);
        await userEvent.click(getByText(grid, 'Move Up'));
        expect(order(api)).toEqual(['a', 'b', 'c', 'd']);
        await userEvent.click(getByText(grid, 'Apply', { selector: 'button' }));
        expect(order(api)).toEqual(['b', 'c', 'a', 'd']);
    });
});
