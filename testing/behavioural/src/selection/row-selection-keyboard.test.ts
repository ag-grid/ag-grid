import { waitFor } from '@testing-library/dom';
import { GridColumns, GridRows, TestGridsManager, assertSelectedRowsByIndex, asyncSetTimeout } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import type { GridApi, GridOptions, Module } from 'ag-grid-community';
import { ClientSideRowModelModule, RowSelectionModule, _createInternalFeatureFlagsModule } from 'ag-grid-community';
import { CellSelectionModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridActions, pressAKey, pressSpaceKey } from './utils';

describe('Row Selection with Keyboard', () => {
    const columnDefs = [{ field: 'sport' }];
    const rowData = [
        { sport: 'football' },
        { sport: 'rugby' },
        { sport: 'tennis' },
        { sport: 'cricket' },
        { sport: 'golf' },
        { sport: 'swimming' },
        { sport: 'rowing' },
    ];
    let consoleErrorSpy: MockInstance;
    let consoleWarnSpy: MockInstance;

    function createGrid(gridOptions: GridOptions, modules?: Module[]): [GridApi, GridActions] {
        const api = gridMgr.createGrid('myGrid', gridOptions, { modules });
        const actions = new GridActions(api, '#myGrid');
        return [api, actions];
    }

    const gridMgr = new TestGridsManager({
        modules: [RowSelectionModule, ClientSideRowModelModule, RowGroupingModule, CellSelectionModule],
    });

    beforeEach(() => {
        gridMgr.reset();

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        gridMgr.reset();

        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    test('select row with keyboard only', async () => {
        const [api, actions] = createGrid({
            columnDefs,
            rowData,
            rowSelection: { mode: 'singleRow' },
        });
        await new GridColumns(api, `select row with keyboard only setup`).checkColumns(`
            CENTER
            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
            └── sport "Sport" width:200
        `);
        await new GridRows(api, `select row with keyboard only setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 sport:"football"
            ├── LEAF id:1 sport:"rugby"
            ├── LEAF id:2 sport:"tennis"
            ├── LEAF id:3 sport:"cricket"
            ├── LEAF id:4 sport:"golf"
            ├── LEAF id:5 sport:"swimming"
            └── LEAF id:6 sport:"rowing"
        `);

        pressSpaceKey(actions.getCellByPosition(2, 'sport')!);
        assertSelectedRowsByIndex([2], api);

        pressSpaceKey(actions.getCellByPosition(3, 'sport')!);
        assertSelectedRowsByIndex([3], api);

        pressSpaceKey(actions.getCellByPosition(3, 'sport')!);
        assertSelectedRowsByIndex([], api);
        await new GridRows(api, `select row with keyboard only final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 sport:"football"
            ├── LEAF id:1 sport:"rugby"
            ├── LEAF id:2 sport:"tennis"
            ├── LEAF id:3 sport:"cricket"
            ├── LEAF id:4 sport:"golf"
            ├── LEAF id:5 sport:"swimming"
            └── LEAF id:6 sport:"rowing"
        `);
    });

    test('select multiple rows with keyboard only', async () => {
        const [api, actions] = createGrid({
            columnDefs,
            rowData,
            rowSelection: { mode: 'multiRow' },
        });

        pressSpaceKey(actions.getCellByPosition(2, 'sport')!);
        pressSpaceKey(actions.getCellByPosition(3, 'sport')!);
        pressSpaceKey(actions.getCellByPosition(5, 'sport')!);
        assertSelectedRowsByIndex([2, 3, 5], api);

        pressSpaceKey(actions.getCellByPosition(3, 'sport')!);
        assertSelectedRowsByIndex([2, 5], api);
        await new GridRows(api, `select multiple rows with keyboard only final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 sport:"football"
            ├── LEAF id:1 sport:"rugby"
            ├── LEAF selected id:2 sport:"tennis"
            ├── LEAF id:3 sport:"cricket"
            ├── LEAF id:4 sport:"golf"
            ├── LEAF selected id:5 sport:"swimming"
            └── LEAF id:6 sport:"rowing"
        `);
    });

    test('ctrl+A', async () => {
        const [api, actions] = createGrid({
            columnDefs,
            rowData,
            rowSelection: { mode: 'multiRow' },
            cellSelection: true,
        });

        assertSelectedRowsByIndex([], api);
        expect(api.getCellRanges()).toEqual([]);

        // CTRL+A on a random cell
        pressAKey(actions.getCellByPosition(2, 'sport')!, { ctrlKey: true });

        assertSelectedRowsByIndex([], api);
        const ranges = api.getCellRanges()?.slice();
        expect(ranges).toHaveLength(1);
        expect(ranges![0].startRow?.rowIndex).toBe(0);
        expect(ranges![0].endRow?.rowIndex).toBe(6);
        expect(ranges![0].columns).toHaveLength(2);

        api.clearCellSelection();
        expect(api.getCellRanges()).toEqual([]);

        api.setGridOption('rowSelection', { mode: 'multiRow', ctrlASelectsRows: true });
        await new GridColumns(api, `ctrl+A after setGridOption rowSelection`).checkColumns(`
            CENTER
            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
            └── sport "Sport" width:200
        `);
        await new GridRows(api, `ctrl+A after setGridOption rowSelection`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 sport:"football"
            ├── LEAF id:1 sport:"rugby"
            ├── LEAF id:2 sport:"tennis"
            ├── LEAF id:3 sport:"cricket"
            ├── LEAF id:4 sport:"golf"
            ├── LEAF id:5 sport:"swimming"
            └── LEAF id:6 sport:"rowing"
        `);

        // CTRL+A on a random cell
        pressAKey(actions.getCellByPosition(2, 'sport')!, { ctrlKey: true });

        assertSelectedRowsByIndex([0, 1, 2, 3, 4, 5, 6], api);
        expect(api.getCellRanges()).toEqual([]);
    });

    describe('Range selection behaviour', () => {
        test('Holding SHIFT while selecting row with SPACE selects range of rows', async () => {
            const [api, actions] = createGrid({
                columnDefs,
                rowData,
                rowSelection: { mode: 'multiRow' },
            });

            pressSpaceKey(actions.getCellByPosition(2, 'sport')!);
            pressSpaceKey(actions.getCellByPosition(5, 'sport')!, { shiftKey: true });

            assertSelectedRowsByIndex([2, 3, 4, 5], api);
            await new GridRows(api, `Holding SHIFT while selecting row with SPACE selects range of rows final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF selected id:2 sport:"tennis"
                    ├── LEAF selected id:3 sport:"cricket"
                    ├── LEAF selected id:4 sport:"golf"
                    ├── LEAF selected id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
        });

        test('Can extend range downwards from last selected row when holding SHIFT', async () => {
            const [api, actions] = createGrid({
                columnDefs,
                rowData,
                rowSelection: { mode: 'multiRow' },
            });

            pressSpaceKey(actions.getCellByPosition(1, 'sport')!);
            pressSpaceKey(actions.getCellByPosition(3, 'sport')!);
            pressSpaceKey(actions.getCellByPosition(5, 'sport')!, { shiftKey: true });
            assertSelectedRowsByIndex([1, 3, 4, 5], api);
            await new GridRows(api, `Can extend range downwards from last selected row when holding SHIFT final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF selected id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF selected id:3 sport:"cricket"
                    ├── LEAF selected id:4 sport:"golf"
                    ├── LEAF selected id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
        });

        test('Can extend range upwards from last selected row when holding SHIFT', async () => {
            const [api, actions] = createGrid({
                columnDefs,
                rowData,
                rowSelection: { mode: 'multiRow' },
            });

            actions.selectRowsByIndex([2, 4], false);

            pressSpaceKey(actions.getCellByPosition(1, 'sport')!, { shiftKey: true });

            assertSelectedRowsByIndex([2, 4, 1, 3], api);
            await new GridRows(api, `Can extend range upwards from last selected row when holding SHIFT final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF selected id:1 sport:"rugby"
                    ├── LEAF selected id:2 sport:"tennis"
                    ├── LEAF selected id:3 sport:"cricket"
                    ├── LEAF selected id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
        });

        test('Using SHIFT+SPACE to select on un-selected table selects clicked row', async () => {
            const [api, actions] = createGrid({
                columnDefs,
                rowData,
                rowSelection: { mode: 'multiRow' },
            });

            pressSpaceKey(actions.getCellByPosition(4, 'sport')!, { shiftKey: true });
            assertSelectedRowsByIndex([4], api);

            pressSpaceKey(actions.getCellByPosition(6, 'sport')!, { shiftKey: true });
            assertSelectedRowsByIndex([4, 5, 6], api);
            await new GridRows(api, `Using SHIFT+SPACE to select on un-selected table selects clicked row final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF selected id:4 sport:"golf"
                    ├── LEAF selected id:5 sport:"swimming"
                    └── LEAF selected id:6 sport:"rowing"
                `);
        });

        test('Range selection is preserved on new keyboard selection', async () => {
            const [api, actions] = createGrid({
                columnDefs,
                rowData,
                rowSelection: { mode: 'multiRow' },
            });

            pressSpaceKey(actions.getCellByPosition(1, 'sport')!);
            pressSpaceKey(actions.getCellByPosition(3, 'sport')!, { shiftKey: true });
            assertSelectedRowsByIndex([1, 2, 3], api);

            pressSpaceKey(actions.getCellByPosition(5, 'sport')!);
            assertSelectedRowsByIndex([1, 2, 3, 5], api);
            await new GridRows(api, `Range selection is preserved on new keyboard selection final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football"
                ├── LEAF selected id:1 sport:"rugby"
                ├── LEAF selected id:2 sport:"tennis"
                ├── LEAF selected id:3 sport:"cricket"
                ├── LEAF id:4 sport:"golf"
                ├── LEAF selected id:5 sport:"swimming"
                └── LEAF id:6 sport:"rowing"
            `);
        });

        test('Range is extended downwards from selection root', async () => {
            const [api, actions] = createGrid({
                columnDefs,
                rowData,
                rowSelection: { mode: 'multiRow' },
            });

            pressSpaceKey(actions.getCellByPosition(2, 'sport')!);
            pressSpaceKey(actions.getCellByPosition(4, 'sport')!, { shiftKey: true });
            assertSelectedRowsByIndex([2, 3, 4], api);

            pressSpaceKey(actions.getCellByPosition(6, 'sport')!, { shiftKey: true });
            assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);
            await new GridRows(api, `Range is extended downwards from selection root final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football"
                ├── LEAF id:1 sport:"rugby"
                ├── LEAF selected id:2 sport:"tennis"
                ├── LEAF selected id:3 sport:"cricket"
                ├── LEAF selected id:4 sport:"golf"
                ├── LEAF selected id:5 sport:"swimming"
                └── LEAF selected id:6 sport:"rowing"
            `);
        });

        test('Range is extended upwards from selection root', async () => {
            const [api, actions] = createGrid({
                columnDefs,
                rowData,
                rowSelection: { mode: 'multiRow' },
            });

            pressSpaceKey(actions.getCellByPosition(6, 'sport')!);
            pressSpaceKey(actions.getCellByPosition(4, 'sport')!, { shiftKey: true });
            assertSelectedRowsByIndex([6, 4, 5], api);

            pressSpaceKey(actions.getCellByPosition(2, 'sport')!, { shiftKey: true });
            assertSelectedRowsByIndex([6, 4, 5, 2, 3], api);
            await new GridRows(api, `Range is extended upwards from selection root final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football"
                ├── LEAF id:1 sport:"rugby"
                ├── LEAF selected id:2 sport:"tennis"
                ├── LEAF selected id:3 sport:"cricket"
                ├── LEAF selected id:4 sport:"golf"
                ├── LEAF selected id:5 sport:"swimming"
                └── LEAF selected id:6 sport:"rowing"
            `);
        });

        test('Range can be inverted', async () => {
            const [api, actions] = createGrid({
                columnDefs,
                rowData,
                rowSelection: { mode: 'multiRow' },
            });

            pressSpaceKey(actions.getCellByPosition(4, 'sport')!);
            pressSpaceKey(actions.getCellByPosition(6, 'sport')!, { shiftKey: true });
            assertSelectedRowsByIndex([4, 5, 6], api);

            pressSpaceKey(actions.getCellByPosition(2, 'sport')!, { shiftKey: true });
            assertSelectedRowsByIndex([2, 3, 4], api);
            await new GridRows(api, `Range can be inverted final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football"
                ├── LEAF id:1 sport:"rugby"
                ├── LEAF selected id:2 sport:"tennis"
                ├── LEAF selected id:3 sport:"cricket"
                ├── LEAF selected id:4 sport:"golf"
                ├── LEAF id:5 sport:"swimming"
                └── LEAF id:6 sport:"rowing"
            `);
        });

        test('SHIFT-SPACE within range after de-selection resets root and clears previous selection', async () => {
            const [api, actions] = createGrid({
                columnDefs,
                rowData,
                rowSelection: { mode: 'multiRow' },
            });

            pressSpaceKey(actions.getCellByPosition(2, 'sport')!);
            pressSpaceKey(actions.getCellByPosition(6, 'sport')!, { shiftKey: true });
            assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

            pressSpaceKey(actions.getCellByPosition(3, 'sport')!);
            assertSelectedRowsByIndex([2, 4, 5, 6], api);

            pressSpaceKey(actions.getCellByPosition(5, 'sport')!, { shiftKey: true });
            assertSelectedRowsByIndex([3, 4, 5], api);
            await new GridRows(
                api,
                `SHIFT-SPACE within range after de-selection resets root and clears previous sele final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football"
                ├── LEAF id:1 sport:"rugby"
                ├── LEAF id:2 sport:"tennis"
                ├── LEAF selected id:3 sport:"cricket"
                ├── LEAF selected id:4 sport:"golf"
                ├── LEAF selected id:5 sport:"swimming"
                └── LEAF id:6 sport:"rowing"
            `);
        });

        test('SHIFT-SPACE below range after de-selection resets root and clears previous selection', async () => {
            const [api, actions] = createGrid({
                columnDefs,
                rowData,
                rowSelection: { mode: 'multiRow' },
            });

            pressSpaceKey(actions.getCellByPosition(2, 'sport')!);
            pressSpaceKey(actions.getCellByPosition(5, 'sport')!, { shiftKey: true });
            assertSelectedRowsByIndex([2, 3, 4, 5], api);

            pressSpaceKey(actions.getCellByPosition(3, 'sport')!);
            assertSelectedRowsByIndex([2, 4, 5], api);

            pressSpaceKey(actions.getCellByPosition(6, 'sport')!, { shiftKey: true });
            assertSelectedRowsByIndex([3, 4, 5, 6], api);
            await new GridRows(
                api,
                `SHIFT-SPACE below range after de-selection resets root and clears previous selec final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football"
                ├── LEAF id:1 sport:"rugby"
                ├── LEAF id:2 sport:"tennis"
                ├── LEAF selected id:3 sport:"cricket"
                ├── LEAF selected id:4 sport:"golf"
                ├── LEAF selected id:5 sport:"swimming"
                └── LEAF selected id:6 sport:"rowing"
            `);
        });

        test('SHIFT-SPACE above range after de-selection resets root and clears previous selection', async () => {
            const [api, actions] = createGrid({
                columnDefs,
                rowData,
                rowSelection: { mode: 'multiRow' },
            });

            pressSpaceKey(actions.getCellByPosition(2, 'sport')!);
            pressSpaceKey(actions.getCellByPosition(5, 'sport')!, { shiftKey: true });
            assertSelectedRowsByIndex([2, 3, 4, 5], api);

            pressSpaceKey(actions.getCellByPosition(3, 'sport')!);
            assertSelectedRowsByIndex([2, 4, 5], api);

            pressSpaceKey(actions.getCellByPosition(1, 'sport')!, { shiftKey: true });
            assertSelectedRowsByIndex([1, 2, 3], api);
            await new GridRows(
                api,
                `SHIFT-SPACE above range after de-selection resets root and clears previous selec final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football"
                ├── LEAF selected id:1 sport:"rugby"
                ├── LEAF selected id:2 sport:"tennis"
                ├── LEAF selected id:3 sport:"cricket"
                ├── LEAF id:4 sport:"golf"
                ├── LEAF id:5 sport:"swimming"
                └── LEAF id:6 sport:"rowing"
            `);
        });
    });

    test('pressing SPACE on a focused full-width group row toggles its selection', async () => {
        const [api, actions] = createGrid({
            columnDefs: [{ field: 'sport', rowGroup: true, hide: true }, { field: 'athlete' }],
            rowData: [
                { sport: 'football', athlete: 'Alice' },
                { sport: 'football', athlete: 'Bob' },
                { sport: 'rugby', athlete: 'Carol' },
            ],
            groupDisplayType: 'groupRows',
            rowSelection: { mode: 'multiRow' },
        });
        await new GridRows(api, `SPACE on full-width group row setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP collapsed id:row-group-sport-football
            │ ├── LEAF hidden id:0 sport:"football" athlete:"Alice"
            │ └── LEAF hidden id:1 sport:"football" athlete:"Bob"
            └─┬ LEAF_GROUP collapsed id:row-group-sport-rugby
            · └── LEAF hidden id:2 sport:"rugby" athlete:"Carol"
        `);

        pressSpaceKey(actions.getRowByIndex(0)!);
        await new GridRows(api, `SPACE on full-width group row final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP selected collapsed id:row-group-sport-football
            │ ├── LEAF hidden id:0 sport:"football" athlete:"Alice"
            │ └── LEAF hidden id:1 sport:"football" athlete:"Bob"
            └─┬ LEAF_GROUP collapsed id:row-group-sport-rugby
            · └── LEAF hidden id:2 sport:"rugby" athlete:"Carol"
        `);
    });

    test('SPACE on an interactive control inside a full-width row is left to the control, not row selection', async () => {
        const [api, actions] = createGrid({
            columnDefs: [{ field: 'sport' }, { field: 'athlete' }],
            rowData: [
                { sport: 'football', athlete: 'Alice' },
                { sport: 'rugby', athlete: 'Bob' },
            ],
            isFullWidthRow: (p) => (p.rowNode.rowIndex ?? -1) === 0,
            fullWidthCellRenderer: () => '<button class="fw-btn">x</button>',
            rowSelection: { mode: 'multiRow' },
        });
        await new GridRows(api, `SPACE in full-width control setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 sport:"football" athlete:"Alice"
            └── LEAF id:1 sport:"rugby" athlete:"Bob"
        `);

        // SPACE on a focusable control inside the full-width renderer must not toggle the row.
        pressSpaceKey(actions.getRowByIndex(0)!.querySelector<HTMLElement>('.fw-btn')!);
        await new GridRows(api, `SPACE on full-width child control`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 sport:"football" athlete:"Alice"
            └── LEAF id:1 sport:"rugby" athlete:"Bob"
        `);

        // SPACE on the full-width row itself still toggles its selection.
        pressSpaceKey(actions.getRowByIndex(0)!);
        await new GridRows(api, `SPACE on full-width row`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF selected id:0 sport:"football" athlete:"Alice"
            └── LEAF id:1 sport:"rugby" athlete:"Bob"
        `);
    });

    describe('Space following enableClickSelection', () => {
        const spaceKeyFollowsClickSelection = [
            _createInternalFeatureFlagsModule({ spaceKeyFollowsClickSelection: true }),
        ];

        test('Space on a row neither selects nor deselects when click selection is disabled', async () => {
            const [api, actions] = createGrid(
                {
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', enableClickSelection: false },
                },
                spaceKeyFollowsClickSelection
            );

            pressSpaceKey(actions.getCellByPosition(2, 'sport')!);
            assertSelectedRowsByIndex([], api);

            api.getDisplayedRowAtIndex(3)!.setSelected(true);
            pressSpaceKey(actions.getCellByPosition(3, 'sport')!);
            assertSelectedRowsByIndex([3], api);
        });

        test('Space on the selection checkbox cell still toggles the row', async () => {
            const [api, actions] = createGrid(
                {
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', enableClickSelection: false },
                },
                spaceKeyFollowsClickSelection
            );

            pressSpaceKey(actions.getCellByPosition(2, 'ag-Grid-SelectionColumn')!);
            assertSelectedRowsByIndex([2], api);

            pressSpaceKey(actions.getCellByPosition(2, 'ag-Grid-SelectionColumn')!);
            assertSelectedRowsByIndex([], api);
        });

        test('Space on a row whose checkbox is disabled obeys click selection', async () => {
            const [api, actions] = createGrid(
                {
                    columnDefs,
                    rowData,
                    rowSelection: {
                        mode: 'multiRow',
                        enableClickSelection: false,
                        checkboxes: (params) => params.node?.rowIndex !== 2,
                    },
                },
                spaceKeyFollowsClickSelection
            );

            pressSpaceKey(actions.getCellByPosition(2, 'ag-Grid-SelectionColumn')!);
            assertSelectedRowsByIndex([], api);
        });

        describe('the Space announcement', () => {
            // the announcement is debounced and then written on a second timer
            async function settleAnnouncement(): Promise<void> {
                await asyncSetTimeout(0);
                await asyncSetTimeout(0);
            }

            function getAnnouncement(): string {
                return document.querySelector('#myGrid .ag-aria-description-container')?.textContent ?? '';
            }

            test('is not made on a row where Space does nothing', async () => {
                const [api] = createGrid(
                    {
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', enableClickSelection: false },
                    },
                    spaceKeyFollowsClickSelection
                );

                api.setFocusedCell(1, 'sport');
                await settleAnnouncement();
                expect(getAnnouncement()).toBe('');

                // the checkbox cell still accepts Space, which also shows the announcement is wired up here
                api.setFocusedCell(1, 'ag-Grid-SelectionColumn');
                await waitFor(() => expect(getAnnouncement()).toContain('Press SPACE to select this row'));
            });

            test('only offers the direction click selection allows', async () => {
                const [api] = createGrid(
                    {
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', enableClickSelection: 'enableSelection' },
                    },
                    spaceKeyFollowsClickSelection
                );

                api.getDisplayedRowAtIndex(1)!.setSelected(true);
                api.setFocusedCell(1, 'sport');
                await settleAnnouncement();
                expect(getAnnouncement()).toBe('');

                api.setFocusedCell(2, 'sport');
                await waitFor(() => expect(getAnnouncement()).toContain('Press SPACE to select this row'));
            });

            test('is made on every row without the flag', async () => {
                const [api] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', enableClickSelection: false },
                });

                api.setFocusedCell(1, 'sport');
                await waitFor(() => expect(getAnnouncement()).toContain('Press SPACE to select this row'));
            });
        });

        describe('with grouped rows', () => {
            const groupedColumnDefs = [{ field: 'country', rowGroup: true, hide: true }, { field: 'sport' }];
            const groupedRowData = [
                { country: 'Ireland', sport: 'football' },
                { country: 'Ireland', sport: 'rugby' },
                { country: 'Italy', sport: 'tennis' },
            ];

            test('Space on the group column checkbox cell still toggles the row', async () => {
                const [api, actions] = createGrid(
                    {
                        columnDefs: groupedColumnDefs,
                        rowData: groupedRowData,
                        groupDefaultExpanded: -1,
                        rowSelection: {
                            mode: 'multiRow',
                            enableClickSelection: false,
                            checkboxLocation: 'autoGroupColumn',
                        },
                    },
                    spaceKeyFollowsClickSelection
                );

                const groupCell = actions.getCellByPosition(1, 'ag-Grid-AutoColumn')!;
                await waitFor(() => expect(groupCell.querySelector('.ag-selection-checkbox')).not.toBeNull());

                pressSpaceKey(actions.getCellByPosition(1, 'sport')!);
                assertSelectedRowsByIndex([], api);

                pressSpaceKey(groupCell);
                assertSelectedRowsByIndex([1], api);
            });

            test('Space on a full-width group row with a checkbox still toggles the group', async () => {
                const [api, actions] = createGrid(
                    {
                        columnDefs: groupedColumnDefs,
                        rowData: groupedRowData,
                        groupDisplayType: 'groupRows',
                        rowSelection: {
                            mode: 'multiRow',
                            enableClickSelection: false,
                            checkboxLocation: 'autoGroupColumn',
                        },
                    },
                    spaceKeyFollowsClickSelection
                );

                const groupRow = actions.getRowByIndex(0)!;
                await waitFor(() => expect(groupRow.querySelector('.ag-selection-checkbox')).not.toBeNull());

                pressSpaceKey(groupRow);
                assertSelectedRowsByIndex([0], api);
            });
        });

        test('Space on a row can select but not deselect with enableSelection', async () => {
            const [api, actions] = createGrid(
                {
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', enableClickSelection: 'enableSelection' },
                },
                spaceKeyFollowsClickSelection
            );

            pressSpaceKey(actions.getCellByPosition(2, 'sport')!);
            assertSelectedRowsByIndex([2], api);

            pressSpaceKey(actions.getCellByPosition(2, 'sport')!);
            assertSelectedRowsByIndex([2], api);
        });

        test('Space on a row can deselect but not select with enableDeselection', async () => {
            const [api, actions] = createGrid(
                {
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', enableClickSelection: 'enableDeselection' },
                },
                spaceKeyFollowsClickSelection
            );

            pressSpaceKey(actions.getCellByPosition(2, 'sport')!);
            assertSelectedRowsByIndex([], api);

            api.getDisplayedRowAtIndex(3)!.setSelected(true);
            pressSpaceKey(actions.getCellByPosition(3, 'sport')!);
            assertSelectedRowsByIndex([], api);
        });

        test('SHIFT+Space and CTRL+Space on a row do nothing when click selection is disabled', async () => {
            const [api, actions] = createGrid(
                {
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', enableClickSelection: false },
                },
                spaceKeyFollowsClickSelection
            );

            api.getDisplayedRowAtIndex(1)!.setSelected(true);
            pressSpaceKey(actions.getCellByPosition(4, 'sport')!, { shiftKey: true });
            pressSpaceKey(actions.getCellByPosition(5, 'sport')!, { ctrlKey: true });
            pressSpaceKey(actions.getCellByPosition(1, 'sport')!, { ctrlKey: true });
            assertSelectedRowsByIndex([1], api);
        });

        test('Space on a full-width row does nothing when click selection is disabled', async () => {
            const [api, actions] = createGrid(
                {
                    columnDefs,
                    rowData,
                    isFullWidthRow: (p) => (p.rowNode.rowIndex ?? -1) === 0,
                    fullWidthCellRenderer: () => 'full width',
                    rowSelection: { mode: 'multiRow', enableClickSelection: false },
                },
                spaceKeyFollowsClickSelection
            );

            pressSpaceKey(actions.getRowByIndex(0)!);
            assertSelectedRowsByIndex([], api);
        });
    });
});
