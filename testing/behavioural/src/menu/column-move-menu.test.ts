import {
    findByRole,
    findByText,
    fireEvent,
    getAllByText,
    getByRole,
    getByText,
    queryByText,
    waitFor,
} from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import {
    TestGridsManager,
    dispatchGridSizeChanged,
    getRevealedElements,
    installFocusScroll,
    mockGridLayout,
    polyfillOffsetParent,
} from 'ag-test-utils';
import { onTestFinished } from 'vitest';

import type { ColDef, ColGroupDef, GridApi, GridOptions, IColumnToolPanel } from 'ag-grid-community';
import { ClientSideRowModelModule, getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule, ColumnMenuModule, ColumnsToolPanelModule } from 'ag-grid-enterprise';

import { openToolPanelContextMenu } from '../columnToolPanel/toolPanelContextMenuHarness';

type Surface = 'header' | 'panel' | 'chooser';

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
    const createDeferred = (options: GridOptions = {}) =>
        create({
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: { buttons: ['apply', 'cancel', 'reset'] },
                    },
                ],
                defaultToolPanel: 'columns',
            },
            ...options,
        });

    const order = (api: GridApi) => api.getColumnState().map(({ colId }) => colId);
    const labels = (surface: Surface) =>
        surface === 'header' ? ['Move Left', 'Move Right'] : ['Move Up', 'Move Down'];

    async function open(surface: Surface, api: GridApi, name = 'B', group = false): Promise<HTMLElement> {
        const grid = getGridElement(api) as HTMLElement;
        if (surface === 'panel') {
            await openToolPanelContextMenu(api.getToolPanelInstance('columns'), grid, name);
        } else if (surface === 'chooser') {
            api.showColumnChooser();
            const dialog = await findByRole(grid, 'dialog');
            const entry = await waitFor(() => {
                // The virtual list renders no rows until its viewport reports a height.
                const viewport = dialog.querySelector<HTMLElement>('.ag-column-select-virtual-list-viewport')!;
                Object.defineProperty(viewport, 'offsetHeight', { value: 300, configurable: true });
                viewport.dispatchEvent(new Event('scroll'));
                const item = getByText(dialog, name).closest<HTMLElement>('.ag-virtual-list-item');
                expect(item).not.toBeNull();
                return item!;
            });
            entry.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
        } else {
            const header = group
                ? getByText(grid, name, { selector: '.ag-header-group-text' }).closest<HTMLElement>(
                      '.ag-header-group-cell'
                  )!
                : grid.querySelector<HTMLElement>(
                      `.ag-header-cell[col-id="${api.getColumn(name)?.getColId() ?? name.toLowerCase()}"]`
                  )!;
            header.focus();
            header.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
        }
        await findByRole(grid, 'menu');
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
                getColumnMenuItems: () =>
                    surface === 'header'
                        ? ['moveLeft', 'moveRight', { name: 'Custom action' }]
                        : ['moveUp', 'moveDown', { name: 'Custom action' }],
            });
            const before = order(api);
            const grid = await open(surface, api);
            for (const label of labels(surface)) {
                expect(queryByText(grid, label)).toBeNull();
            }
            expect(getByText(grid, 'Custom action')).toBeTruthy();
            expect(order(api)).toEqual(before);
        });

        test('disables movement beyond the first and last positions', async () => {
            const api = await create();
            let grid = await open(surface, api, 'A');
            expect(
                getByText(grid, labels(surface)[0]).closest('[role="menuitem"]')!.getAttribute('aria-disabled')
            ).toBe('true');
            await userEvent.click(getByText(grid, labels(surface)[0]));
            expect(order(api)).toEqual(['a', 'b', 'c', 'd']);
            expect(getByText(grid, labels(surface)[1])).toBeTruthy();
            await userEvent.keyboard('{Escape}');
            grid = await open(surface, api, 'D');
            expect(
                getByText(grid, labels(surface)[1]).closest('[role="menuitem"]')!.getAttribute('aria-disabled')
            ).toBe('true');
            expect(getByText(grid, labels(surface)[0])).toBeTruthy();
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

        test.each([false, true])(
            'read-only functions allow column moves, changed after opening=%s',
            async (changeAfterOpening) => {
                const api = await create({
                    functionsReadOnly: !changeAfterOpening,
                });
                const grid = await open(surface, api);
                if (changeAfterOpening) {
                    api.setGridOption('functionsReadOnly', true);
                }
                for (const label of labels(surface)) {
                    expect(getByRole(grid, 'menuitem', { name: label }).getAttribute('aria-disabled')).not.toBe('true');
                }
                await userEvent.click(getByRole(grid, 'menuitem', { name: labels(surface)[0] }));
                expect(order(api)).toEqual(['b', 'a', 'c', 'd']);
                await open(surface, api);
                await userEvent.click(getByRole(grid, 'menuitem', { name: labels(surface)[1] }));
                expect(order(api)).toEqual(['a', 'b', 'c', 'd']);
            }
        );

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

    test.each([false, true])('a header moved past the viewport stays scrolled into view, group=%s', async (group) => {
        onTestFinished(installFocusScroll());
        const a: ColDef = { field: 'a', width: 100 };
        const married: ColGroupDef = {
            headerName: 'Married',
            marryChildren: true,
            children: Array.from({ length: 12 }, (_, i) => ({ field: `b${i}`, width: 100 })),
        };
        const api = await create({
            columnDefs: [group ? { headerName: 'Group', children: [a] } : a, married],
            suppressColumnVirtualisation: false,
            ensureDomOrder: false,
        });
        onTestFinished(mockGridLayout.resetOptions);
        // narrow enough that the move takes the header out of the rendered columns, so it is drawn anew
        dispatchGridSizeChanged(api, 400);
        const grid = await open('header', api, group ? 'Group' : 'A', group);
        await userEvent.click(getByText(grid, 'Move Right'));
        expect(order(api).at(-1)).toBe('a');
        const left = api.getColumn('a')!.getLeft()!;
        const expectInView = () => {
            const range = api.getHorizontalPixelRange();
            expect(range.left).toBeLessThanOrEqual(left);
            expect(range.right).toBeGreaterThanOrEqual(left + 100);
        };
        expectInView();
        const focused = document.activeElement!.closest(group ? '.ag-header-group-cell' : '.ag-header-cell')!;
        expect(focused.textContent!.trim()).toBe(group ? 'Group' : 'A');
        await waitFor(() => expect(getRevealedElements().at(-1)).toBe(focused));
        expectInView();
    });

    test('a header the menu returns focus to after Reset Columns is scrolled into view once it slides back', async () => {
        onTestFinished(installFocusScroll());
        const api = await create({
            columnDefs: [{ field: 'a' }, ...Array.from({ length: 12 }, (_, i) => ({ field: `b${i}` }))],
            defaultColDef: { width: 100 },
            ensureDomOrder: false,
        });
        onTestFinished(mockGridLayout.resetOptions);
        dispatchGridSizeChanged(api, 400);
        api.moveColumns(['a'], 12);
        api.ensureColumnVisible('a');
        const grid = await open('header', api, 'A');
        const header = grid.querySelector('.ag-header-cell[col-id="a"]');
        const revealedBefore = getRevealedElements().length;

        await userEvent.click(getByText(grid, 'Reset Columns'));
        expect(order(api)[0]).toBe('a');
        await waitFor(() => expect(document.activeElement).toBe(header));
        expect(grid.querySelector('.ag-column-moving')).not.toBeNull();
        expect(getRevealedElements().slice(revealedBefore)).not.toContain(header);
        await waitFor(() => expect(getRevealedElements().at(-1)).toBe(header));
        expect(api.getHorizontalPixelRange().left).toBe(0);
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

    test.each(['A', 'B'])('the column chooser disables unavailable directions for %s', async (name) => {
        const api = await create({ sideBar: undefined }, headerGrids);
        const grid = await open('chooser', api, name);
        const down = await findByText(grid, 'Move Down');
        expect(getByText(grid, 'Move Up').closest('[role="menuitem"]')!.getAttribute('aria-disabled') === 'true').toBe(
            name === 'A'
        );
        await userEvent.click(down);
        expect(order(api)).toEqual(name === 'A' ? ['b', 'a', 'c', 'd'] : ['a', 'c', 'b', 'd']);
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

    test.each([false, true])('separates the default CTP move items, standalone module=%s', async (standalone) => {
        const api = await create({}, standalone ? panelGrids : grids);
        const grid = await open('panel', api);
        const up = getByText(grid, 'Move Up').closest('[role="menuitem"]')!;
        const down = getByText(grid, 'Move Down').closest('[role="menuitem"]')!;
        expect(up.previousElementSibling?.classList.contains('ag-menu-separator')).toBe(true);
        expect(down.previousElementSibling).toBe(up);
        expect(grid.querySelectorAll('.ag-menu-separator')).toHaveLength(1);
        await userEvent.keyboard('{Escape}');
        api.setGridOption('suppressMovableColumns', true);
        await open('panel', api);
        expect(grid.querySelectorAll('.ag-menu-separator')).toHaveLength(0);
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

    describe.each<Surface>(['header', 'panel', 'chooser'])('pivot-mode %s menus', (surface) => {
        test.each([false, true])('column movement with pivot active=%s', async (pivot) => {
            const api = await create({
                pivotMode: true,
                columnDefs: [
                    { field: 'a', rowGroup: true },
                    { field: 'b', pivot },
                    { field: 'c', aggFunc: 'sum' },
                    { field: 'd', aggFunc: 'sum' },
                ],
                getColumnMenuItems: ({ defaultItems }) => [...defaultItems, { name: 'Custom action' }],
            });
            const name = surface === 'header' ? api.getAllDisplayedColumns().at(-1)!.getColId() : 'B';
            const grid = await open(surface, api, name);
            await findByText(grid, 'Custom action');
            if (surface !== 'header') {
                for (const label of labels(surface)) {
                    expect(queryByText(grid, label)).toBeNull();
                }
            } else {
                const columns = api.getAllDisplayedColumns();
                const left = getByRole(grid, 'menuitem', { name: 'Move Left' });
                expect(left.getAttribute('aria-disabled')).not.toBe('true');
                await userEvent.click(left);
                expect(api.getAllDisplayedColumns()).toEqual([
                    ...columns.slice(0, -2),
                    columns.at(-1)!,
                    columns.at(-2)!,
                ]);
            }
        });
    });

    test.each(['auto group', 'pivot group', 'nested pivot group'] as const)(
        'moves the %s header in both directions in pivot mode',
        async (kind) => {
            const api = await create({
                pivotMode: true,
                pivotDefaultExpanded: -1,
                columnDefs: [
                    { field: 'year', rowGroup: true },
                    { field: 'country', pivot: true },
                    { field: 'sport', pivot: true },
                    { field: 'gold', aggFunc: 'sum' },
                    { field: 'silver', aggFunc: 'sum' },
                ],
                rowData: [
                    { year: 2024, country: 'Ireland', sport: 'Swimming', gold: 1, silver: 2 },
                    { year: 2024, country: 'France', sport: 'Running', gold: 3, silver: 4 },
                ],
            });
            const columns = api.getAllDisplayedColumns();
            const isGroup = kind !== 'auto group';
            const groupName = kind === 'pivot group' ? 'Ireland' : 'Swimming';
            const name = isGroup ? groupName : columns[0].getColId();
            const moving =
                kind === 'auto group'
                    ? [columns[0]]
                    : columns.filter((column) => column.getColDef().pivotKeys?.[0] === 'Ireland');
            const remaining = columns.filter((column) => !moving.includes(column));
            const firstMove = kind === 'auto group' ? 'Move Right' : 'Move Left';
            let grid = await open('header', api, name, isGroup);
            const item = getByRole(grid, 'menuitem', { name: firstMove });
            expect(item.getAttribute('aria-disabled')).not.toBe('true');
            await userEvent.click(item);
            const expected =
                kind === 'auto group'
                    ? [remaining[0], ...moving, ...remaining.slice(1)]
                    : [...remaining.slice(0, -1), ...moving, remaining.at(-1)!];
            expect(api.getAllDisplayedColumns()).toEqual(expected);
            grid = await open('header', api, name, isGroup);
            await userEvent.click(
                getByRole(grid, 'menuitem', { name: firstMove === 'Move Left' ? 'Move Right' : 'Move Left' })
            );
            expect(api.getAllDisplayedColumns()).toEqual(columns);
        }
    );

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

            await userEvent.keyboard('{Escape}');
            await open('header', api);
            await userEvent.click(getByText(grid, 'Move Left'));
            expect(order(api)).toEqual(['b', 'a', 'c', 'd']);
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

    test('uses the pending column order for repeated moves and boundary availability', async () => {
        const api = await createDeferred();
        const grid = getGridElement(api) as HTMLElement;
        for (let i = 0; i < 2; ++i) {
            await open('panel', api);
            await userEvent.click(getByRole(grid, 'menuitem', { name: 'Move Down' }));
            expect(order(api)).toEqual(['a', 'b', 'c', 'd']);
        }
        await open('panel', api);
        expect(getByRole(grid, 'menuitem', { name: 'Move Down' }).getAttribute('aria-disabled')).toBe('true');
        expect(getByRole(grid, 'menuitem', { name: 'Move Up' }).getAttribute('aria-disabled')).not.toBe('true');
        await userEvent.keyboard('{Escape}');
        await userEvent.click(getByRole(grid, 'button', { name: 'Apply' }));
        expect(order(api)).toEqual(['a', 'c', 'd', 'b']);
    });

    test('Reset restores initial column order and menu availability after applied and pending moves', async () => {
        const api = await createDeferred();
        const grid = await open('panel', api);
        await userEvent.click(getByRole(grid, 'menuitem', { name: 'Move Down' }));
        await userEvent.click(getByRole(grid, 'button', { name: 'Apply' }));
        expect(order(api)).toEqual(['a', 'c', 'b', 'd']);

        await open('panel', api);
        await userEvent.click(getByRole(grid, 'menuitem', { name: 'Move Down' }));
        expect(order(api)).toEqual(['a', 'c', 'b', 'd']);
        await userEvent.click(getByRole(grid, 'button', { name: 'Reset' }));
        expect(order(api)).toEqual(['a', 'b', 'c', 'd']);
        expect((getByRole(grid, 'button', { name: 'Apply' }) as HTMLButtonElement).disabled).toBe(true);
        await open('panel', api);
        for (const name of ['Move Up', 'Move Down']) {
            expect(getByRole(grid, 'menuitem', { name }).getAttribute('aria-disabled')).not.toBe('true');
        }
    });

    test.each([false, true])(
        'move menus follow pending pivot mode and Cancel restores them, initial=%s',
        async (pivotMode) => {
            const api = await createDeferred({
                pivotMode,
                columnDefs: columnDefs.map((col) => ({ ...col, enableRowGroup: true, rowGroup: true })),
            });
            const grid = getGridElement(api) as HTMLElement;
            await userEvent.click(getByRole(grid, 'checkbox', { name: 'Pivot Mode' }));
            expect(api.isPivotMode()).toBe(pivotMode);

            await open('panel', api);
            for (const name of ['Move Up', 'Move Down']) {
                expect(queryByText(grid, name) !== null).toBe(pivotMode);
            }
            await userEvent.keyboard('{Escape}');
            const groupPanel = grid.querySelector<HTMLElement>('.ag-column-drop-vertical.ag-column-drop-rowgroup')!;
            fireEvent.contextMenu(getByText(groupPanel, 'B').closest<HTMLElement>('.ag-column-drop-cell')!);
            const menu = await findByRole(grid, 'menu');
            expect(getByRole(menu, 'menuitem', { name: 'Move Up' }).getAttribute('aria-disabled')).not.toBe('true');
            await userEvent.click(getByRole(menu, 'menuitem', { name: 'Move Up' }));
            expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual(['a', 'b', 'c', 'd']);
            expect(groupPanel.querySelector('.ag-column-drop-cell-text')?.textContent).toBe('B');

            await userEvent.click(getByRole(grid, 'button', { name: 'Cancel' }));
            expect(api.isPivotMode()).toBe(pivotMode);
            expect((getByRole(grid, 'checkbox', { name: 'Pivot Mode' }) as HTMLInputElement).checked).toBe(pivotMode);
            expect(groupPanel.querySelector('.ag-column-drop-cell-text')?.textContent).toBe('A');
            await open('panel', api);
            for (const name of ['Move Up', 'Move Down']) {
                expect(queryByText(grid, name) !== null).toBe(!pivotMode);
            }
        }
    );

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
