import type { MockInstance } from 'vitest';

import type { GridApi, GridOptions, Params } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    PaginationModule,
    PinnedRowModule,
    QuickFilterModule,
    RowSelectionModule,
} from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import {
    GridColumns,
    GridRows,
    TestGridsManager,
    assertElementDisplayed,
    assertSelectableByIndex,
    assertSelectedRowElementsById,
    assertSelectedRowsByIndex,
    asyncSetTimeout,
    nextAnimationFrame,
    waitForEvent,
} from '../test-utils';
import { GROUP_ROW_DATA } from './group-data';
import { GridActions } from './utils';

describe('Row Selection Grid Options', () => {
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

    const groupGridOptions: Partial<GridOptions> = {
        columnDefs: [
            { field: 'country', rowGroup: true, hide: true },
            { field: 'sport', rowGroup: true, hide: true },
            { field: 'age' },
            { field: 'year' },
            { field: 'date' },
        ],
        autoGroupColumnDef: {
            headerName: 'Athlete',
            field: 'athlete',
            cellRenderer: 'agGroupCellRenderer',
        },
        rowData: GROUP_ROW_DATA,
        groupDefaultExpanded: -1,
    };

    let consoleErrorSpy: MockInstance;
    let consoleWarnSpy: MockInstance;

    function createGrid(gridOptions: GridOptions, params?: Params): [GridApi, GridActions] {
        const api = gridMgr.createGrid('myGrid', gridOptions, params);
        const actions = new GridActions(api, '#myGrid');
        return [api, actions];
    }

    async function createGridAndWait(gridOptions: GridOptions, params?: Params): Promise<[GridApi, GridActions]> {
        const [api, actions] = createGrid(gridOptions, params);

        await waitForEvent('firstDataRendered', api);

        return [api, actions];
    }

    const gridMgr = new TestGridsManager({
        modules: [RowSelectionModule, ClientSideRowModelModule, RowGroupingModule, PaginationModule, QuickFilterModule],
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

    describe('deselection when rows leave the model', () => {
        // Immutable rowData removal destroys the dropped node (deleteUnusedNodes); it must leave the
        // selection, while the surviving selected row stays selected.
        test('selected row dropped from selection on immutable rowData removal', async () => {
            const [api] = createGrid({
                columnDefs,
                rowSelection: { mode: 'multiRow' },
                getRowId: (p) => p.data.id,
                rowData: [
                    { id: '1', sport: 'football' },
                    { id: '2', sport: 'rugby' },
                    { id: '3', sport: 'tennis' },
                ],
            });

            const removed = api.getRowNode('2')!;
            api.setNodesSelected({ nodes: [removed, api.getRowNode('3')!], newValue: true });
            expect(
                api
                    .getSelectedNodes()
                    .map((n) => n.id)
                    .sort()
            ).toEqual(['2', '3']);

            api.setGridOption('rowData', [
                { id: '1', sport: 'football' },
                { id: '3', sport: 'tennis' },
            ]);

            expect(removed.destroyed).toBe(true);
            expect(api.getSelectedNodes().map((n) => n.id)).toEqual(['3']);
            await new GridRows(api, 'after immutable removal of selected row 2').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 sport:"football"
                └── LEAF selected id:3 sport:"tennis"
            `);
        });

        // A data update normally reapplies isRowSelectable in refreshModel's grouping pass. When that
        // refresh is suppressed, selectable must still be reapplied so a now-unselectable row is dropped.
        test('suppressModelUpdateAfterUpdateTransaction still recomputes selectable on an update transaction', () => {
            const [api] = createGrid({
                columnDefs,
                getRowId: (p) => p.data.id,
                suppressModelUpdateAfterUpdateTransaction: true,
                rowSelection: { mode: 'multiRow', isRowSelectable: (node) => node.data?.sport === 'football' },
                rowData: [
                    { id: '1', sport: 'football' },
                    { id: '2', sport: 'rugby' },
                ],
            });

            api.setNodesSelected({ nodes: [api.getRowNode('1')!], newValue: true });
            expect(api.getRowNode('1')!.isSelected()).toBe(true);
            expect(api.getRowNode('1')!.selectable).toBe(true);

            api.applyTransaction({ update: [{ id: '1', sport: 'rugby' }] });

            expect(api.getRowNode('1')!.selectable).toBe(false);
            expect(api.getRowNode('1')!.isSelected()).toBe(false);
            expect(api.getSelectedNodes()).toEqual([]);
        });

        // A removal recorded while a refresh is deferred (here, column change events dispatching) must flush
        // its selectionChanged this turn, so an unrelated later change can't emit it with a stale source.
        test('removal during a deferred refresh flushes selectionChanged with its own source', async () => {
            const sources: string[] = [];
            const [api] = createGrid({
                columnDefs,
                getRowId: (p) => p.data.id,
                rowSelection: { mode: 'multiRow' },
                rowData: [
                    { id: '1', sport: 'football' },
                    { id: '2', sport: 'rugby' },
                    { id: '3', sport: 'tennis' },
                ],
            });
            api.addEventListener('selectionChanged', (e) => sources.push(e.source));

            api.setNodesSelected({ nodes: [api.getRowNode('1')!, api.getRowNode('3')!], newValue: true });
            await asyncSetTimeout(0);
            sources.length = 0;

            const colModel = (api.getRowNode('1') as any).beans.colModel;
            colModel.changeEventsDispatching = true;
            try {
                api.applyTransaction({ remove: [{ id: '1' }] });
            } finally {
                colModel.changeEventsDispatching = false;
            }
            expect(api.getSelectedNodes().map((n) => n.id)).toEqual(['3']);

            api.setGridOption('rowSelection', {
                mode: 'multiRow',
                isRowSelectable: (node) => node.data?.sport !== 'tennis',
            });
            expect(api.getRowNode('3')!.isSelected()).toBe(false);
            await asyncSetTimeout(0);

            expect(sources).toEqual(['rowDataChanged', 'selectableChanged']);
        });
    });

    describe('isRowSelectable invocation count', () => {
        test('flat grid invokes isRowSelectable once per node on load and on update', () => {
            const counts: Record<string, number> = {};
            const [api] = createGrid({
                columnDefs,
                rowData,
                getRowId: (p) => p.data.sport,
                rowSelection: {
                    mode: 'multiRow',
                    isRowSelectable: (node) => {
                        const id = node.id!;
                        counts[id] = (counts[id] ?? 0) + 1;
                        return true;
                    },
                },
            });
            // flat: every leaf computed once at data-set (there is no grouping pass)
            for (const id of Object.keys(counts)) {
                expect(counts[id]).toBe(1);
            }
            expect(counts['football']).toBe(1);

            for (const id of Object.keys(counts)) {
                delete counts[id];
            }
            api.applyTransaction({ update: [{ sport: 'football' }] });
            expect(counts['football']).toBe(1); // updated once, never double
        });

        test('row grouping invokes isRowSelectable once per node, on fully-formed nodes (groupSelects: "self")', () => {
            const counts: Record<string, number> = {};
            const groupAtCall: Record<string, boolean> = {};
            createGrid({
                ...groupGridOptions,
                rowSelection: {
                    mode: 'multiRow',
                    groupSelects: 'self',
                    isRowSelectable: (node) => {
                        const id = node.id!;
                        counts[id] = (counts[id] ?? 0) + 1;
                        groupAtCall[id] = !!node.group;
                        return true;
                    },
                },
            });
            // no node computed more than once
            for (const id of Object.keys(counts)) {
                expect(counts[id]).toBe(1);
            }
            // filler group nodes were fully formed (group===true) when the callback ran
            const groupIds = Object.keys(groupAtCall).filter((id) => id.startsWith('row-group-'));
            expect(groupIds.length).toBeGreaterThan(0);
            for (const id of groupIds) {
                expect(groupAtCall[id]).toBe(true);
            }
        });
    });

    describe('Basic Interactions', () => {
        describe('Single Row Selection', () => {
            test('Select single row', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'singleRow' },
                });
                await new GridColumns(api, `Select single row setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `Select single row setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.toggleCheckboxByIndex(2);

                assertSelectedRowsByIndex([2], api);
                await new GridRows(api, `Select single row final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF selected id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('Clicking two rows selects only the last clicked row', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'singleRow' },
                });
                await new GridColumns(api, `Clicking two rows selects only the last clicked row setup`).checkColumns(
                    `
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `
                );
                await new GridRows(api, `Clicking two rows selects only the last clicked row setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.toggleCheckboxByIndex(2);
                actions.toggleCheckboxByIndex(5);

                assertSelectedRowsByIndex([5], api);
                await new GridRows(api, `Clicking two rows selects only the last clicked row final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF selected id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test("SHIFT-click doesn't select multiple rows in single row selection mode", async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'singleRow' },
                });
                await new GridColumns(
                    api,
                    `SHIFT-click doesn't select multiple rows in single row selection mode setup`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `SHIFT-click doesn't select multiple rows in single row selection mode setup`)
                    .check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                actions.toggleCheckboxByIndex(2);
                actions.toggleCheckboxByIndex(5, { shiftKey: true });

                assertSelectedRowsByIndex([5], api);
                await new GridRows(
                    api,
                    `SHIFT-click doesn't select multiple rows in single row selection mode final state`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF selected id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test("CTRL-click doesn't select multiple rows in single row selection mode", async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'singleRow' },
                });
                await new GridColumns(api, `CTRL-click doesn't select multiple rows in single row selection mode setup`)
                    .checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                await new GridRows(api, `CTRL-click doesn't select multiple rows in single row selection mode setup`)
                    .check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                actions.toggleCheckboxByIndex(2);
                actions.toggleCheckboxByIndex(5, { metaKey: true });

                assertSelectedRowsByIndex([5], api);
                await new GridRows(
                    api,
                    `CTRL-click doesn't select multiple rows in single row selection mode final state`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF selected id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('By default, prevents row from being selected when clicked', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: {
                        mode: 'singleRow',
                    },
                });
                await new GridColumns(api, `By default, prevents row from being selected when clicked setup`)
                    .checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                await new GridRows(api, `By default, prevents row from being selected when clicked setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.clickRowByIndex(2);

                assertSelectedRowsByIndex([], api);
                await new GridRows(api, `By default, prevents row from being selected when clicked final state`).check(
                    `
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `
                );
            });

            test('enableClickSelection allows row to be selected when clicked', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: {
                        mode: 'singleRow',
                        enableClickSelection: true,
                    },
                });
                await new GridColumns(api, `enableClickSelection allows row to be selected when clicked setup`)
                    .checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                await new GridRows(api, `enableClickSelection allows row to be selected when clicked setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.clickRowByIndex(2);

                assertSelectedRowsByIndex([2], api);
                await new GridRows(api, `enableClickSelection allows row to be selected when clicked final state`)
                    .check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
            });

            test('enableClickSelection="enableDeselection" allows deselection via clicking', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', enableClickSelection: 'enableDeselection' },
                });
                await new GridColumns(
                    api,
                    `enableClickSelection="enableDeselection" allows deselection via clicking setup`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(
                    api,
                    `enableClickSelection="enableDeselection" allows deselection via clicking setup`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.toggleCheckboxByIndex(2);
                assertSelectedRowsByIndex([2], api);

                actions.clickRowByIndex(2, { ctrlKey: true });
                assertSelectedRowsByIndex([], api);
                await new GridRows(
                    api,
                    `enableClickSelection="enableDeselection" allows deselection via clicking final state`
                ).check(`
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

            test('enableClickSelection="enableDeselection" does not allow selection via CTRL-clicking', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', enableClickSelection: 'enableDeselection' },
                });
                await new GridColumns(
                    api,
                    `enableClickSelection="enableDeselection" does not allow selection via CTRL-click setup`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(
                    api,
                    `enableClickSelection="enableDeselection" does not allow selection via CTRL-click setup`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.clickRowByIndex(2, { ctrlKey: true });
                assertSelectedRowsByIndex([], api);
                await new GridRows(
                    api,
                    `enableClickSelection="enableDeselection" does not allow selection via CTRL-click final state`
                ).check(`
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

            test('Clicking an already-selected row is a no-op', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'singleRow', enableClickSelection: true, checkboxes: false },
                });
                await new GridColumns(api, `Clicking an already-selected row is a no-op setup`).checkColumns(`
                    CENTER
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `Clicking an already-selected row is a no-op setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.clickRowByIndex(2);
                assertSelectedRowsByIndex([2], api);

                actions.clickRowByIndex(2);
                assertSelectedRowsByIndex([2], api);
                await new GridRows(api, `Clicking an already-selected row is a no-op final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF selected id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('un-selectable row cannot be selected', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: {
                        mode: 'singleRow',
                        isRowSelectable: (node) => node.data?.sport !== 'football',
                    },
                });
                await new GridColumns(api, `un-selectable row cannot be selected setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `un-selectable row cannot be selected setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF 🚫 id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([], api);
                await new GridRows(api, `un-selectable row cannot be selected final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF 🚫 id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('can update `isRowSelectable` to `undefined` to make all rows selectable', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: {
                        mode: 'singleRow',
                        isRowSelectable: () => false,
                    },
                });
                await new GridColumns(
                    api,
                    `can update _isRowSelectable_ to _undefined_ to make all rows selectable setup`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `can update _isRowSelectable_ to _undefined_ to make all rows selectable setup`)
                    .check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF 🚫 id:0 sport:"football"
                        ├── LEAF 🚫 id:1 sport:"rugby"
                        ├── LEAF 🚫 id:2 sport:"tennis"
                        ├── LEAF 🚫 id:3 sport:"cricket"
                        ├── LEAF 🚫 id:4 sport:"golf"
                        ├── LEAF 🚫 id:5 sport:"swimming"
                        └── LEAF 🚫 id:6 sport:"rowing"
                    `);

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([], api);

                api.setGridOption('rowSelection', {
                    mode: 'singleRow',
                    isRowSelectable: undefined,
                });
                await new GridColumns(
                    api,
                    `can update _isRowSelectable_ to _undefined_ to make all rows selectable after setGridOption rowSelection`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(
                    api,
                    `can update _isRowSelectable_ to _undefined_ to make all rows selectable after setGridOption rowSelection`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([0], api);
            });
        });

        describe('Multiple Row Selection', () => {
            test('un-selectable row cannot be selected', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', isRowSelectable: (node) => node.data?.sport !== 'football' },
                });
                await new GridColumns(api, `un-selectable row cannot be selected setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `un-selectable row cannot be selected setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF 🚫 id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([], api);

                actions.toggleCheckboxByIndex(0, { metaKey: true });
                assertSelectedRowsByIndex([], api);

                actions.toggleCheckboxByIndex(0, { ctrlKey: true });
                assertSelectedRowsByIndex([], api);

                actions.toggleCheckboxByIndex(0, { shiftKey: true });
                assertSelectedRowsByIndex([], api);
                await new GridRows(api, `un-selectable row cannot be selected final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF 🚫 id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('Clicking an already-selected row is a no-op', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', enableClickSelection: true, checkboxes: false },
                });
                await new GridColumns(api, `Clicking an already-selected row is a no-op setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `Clicking an already-selected row is a no-op setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.clickRowByIndex(2);
                assertSelectedRowsByIndex([2], api);

                actions.clickRowByIndex(2);
                assertSelectedRowsByIndex([2], api);
                await new GridRows(api, `Clicking an already-selected row is a no-op final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF selected id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('row-click interaction with multiple selected rows', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: {
                        mode: 'multiRow',
                    },
                });
                await new GridColumns(api, `row-click interaction with multiple selected rows setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `row-click interaction with multiple selected rows setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                // Select two rows by toggling checkboxes
                actions.selectRowsByIndex([2, 3], false);

                actions.clickRowByIndex(3);

                // Both rows should still be selected
                assertSelectedRowsByIndex([2, 3], api);
                await new GridRows(api, `row-click interaction with multiple selected rows final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF selected id:2 sport:"tennis"
                    ├── LEAF selected id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('must de-select with CTRL when `enableClickSelection: true`', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: {
                        mode: 'multiRow',
                        enableClickSelection: true,
                    },
                });
                await new GridColumns(api, `must de-select with CTRL when _enableClickSelection: true_ setup`)
                    .checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                await new GridRows(api, `must de-select with CTRL when _enableClickSelection: true_ setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.clickRowByIndex(3);
                assertSelectedRowsByIndex([3], api);

                actions.clickRowByIndex(3);
                assertSelectedRowsByIndex([3], api);

                actions.clickRowByIndex(3, { ctrlKey: true });
                assertSelectedRowsByIndex([], api);
                await new GridRows(api, `must de-select with CTRL when _enableClickSelection: true_ final state`).check(
                    `
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `
                );
            });

            test('Single click after multiple selection clears previous selection', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                });
                await new GridColumns(api, `Single click after multiple selection clears previous selection setup`)
                    .checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                await new GridRows(api, `Single click after multiple selection clears previous selection setup`).check(
                    `
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `
                );

                actions.selectRowsByIndex([1, 3, 5], true);

                actions.clickRowByIndex(2);

                assertSelectedRowsByIndex([2], api);
                await new GridRows(api, `Single click after multiple selection clears previous selection final state`)
                    .check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
            });

            test('Single click on selected row clears previous selection', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                });
                await new GridColumns(api, `Single click on selected row clears previous selection setup`).checkColumns(
                    `
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `
                );
                await new GridRows(api, `Single click on selected row clears previous selection setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.selectRowsByIndex([1, 3, 5], true);

                actions.clickRowByIndex(3);

                assertSelectedRowsByIndex([3], api);
                await new GridRows(api, `Single click on selected row clears previous selection final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF selected id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('Disabled checkbox shown when `isRowSelectable` returns `true` and `checkboxes` returns `false`', () => {
                const [_, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: {
                        mode: 'multiRow',
                        checkboxes: (params) => params.data.sport.endsWith('ing'),
                        isRowSelectable: () => true,
                    },
                });

                [
                    { index: 0, disabled: '' },
                    { index: 1, disabled: '' },
                    { index: 2, disabled: '' },
                    { index: 3, disabled: '' },
                    { index: 4, disabled: '' },
                    { index: 5, disabled: null },
                    { index: 6, disabled: null },
                ].forEach(({ index, disabled }) => {
                    expect(actions.getCheckboxByIndex(index)?.getAttribute('disabled')).toBe(disabled);
                });
            });

            test('Disabled checkbox shown when `isRowSelectable` returns `false` and `checkboxes` returns `true`', () => {
                const [_, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: {
                        mode: 'multiRow',
                        checkboxes: () => true,
                        isRowSelectable: () => false,
                    },
                });

                rowData.map((_, i) => expect(actions.getCheckboxByIndex(i)?.getAttribute('disabled')).toBe(''));
            });

            test('No checkbox shown when `isRowSelectable` returns `false` and `checkboxes` returns `false`', () => {
                const [_, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: {
                        mode: 'multiRow',
                        checkboxes: () => false,
                        isRowSelectable: () => false,
                    },
                });

                rowData.map((_, i) => expect(assertElementDisplayed(actions.getCheckboxByIndex(i)!)).toBe(false));
            });

            describe('Range selection behaviour', () => {
                test('CTRL-click and CMD-click selects multiple rows', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });
                    await new GridColumns(api, `CTRL-click and CMD-click selects multiple rows setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `CTRL-click and CMD-click selects multiple rows setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(5, { metaKey: true });
                    actions.clickRowByIndex(3, { ctrlKey: true });

                    assertSelectedRowsByIndex([2, 5, 3], api);
                    await new GridRows(api, `CTRL-click and CMD-click selects multiple rows final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF selected id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
                });

                test('SHIFT-click selects range of rows', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });
                    await new GridColumns(api, `SHIFT-click selects range of rows setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `SHIFT-click selects range of rows setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 3, 4, 5], api);
                    await new GridRows(api, `SHIFT-click selects range of rows final state`).check(`
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

                test('SHIFT-click extends range downwards from from last selected row', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });
                    await new GridColumns(api, `SHIFT-click extends range downwards from from last selected row setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `SHIFT-click extends range downwards from from last selected row setup`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `);

                    actions.selectRowsByIndex([1, 3], true);

                    actions.clickRowByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([1, 3, 4, 5], api);
                    await new GridRows(
                        api,
                        `SHIFT-click extends range downwards from from last selected row final state`
                    ).check(`
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

                test('SHIFT-click extends range upwards from from last selected row', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });
                    await new GridColumns(api, `SHIFT-click extends range upwards from from last selected row setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `SHIFT-click extends range upwards from from last selected row setup`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `);

                    actions.selectRowsByIndex([2, 4], true);

                    actions.clickRowByIndex(1, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 4, 1, 3], api);
                    await new GridRows(api, `SHIFT-click extends range upwards from from last selected row final state`)
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

                test('SHIFT-click on un-selected table selects only clicked row', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });
                    await new GridColumns(api, `SHIFT-click on un-selected table selects only clicked row setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `SHIFT-click on un-selected table selects only clicked row setup`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `
                    );

                    actions.clickRowByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([4], api);

                    actions.clickRowByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([4, 5, 6], api);
                    await new GridRows(api, `SHIFT-click on un-selected table selects only clicked row final state`)
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

                test('Range selection is preserved on CTRL-click and CMD-click', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });
                    await new GridColumns(api, `Range selection is preserved on CTRL-click and CMD-click setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `Range selection is preserved on CTRL-click and CMD-click setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.clickRowByIndex(1);
                    actions.clickRowByIndex(3, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3], api);

                    actions.clickRowByIndex(5, { metaKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 5], api);
                    await new GridRows(api, `Range selection is preserved on CTRL-click and CMD-click final state`)
                        .check(`
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

                test('Range members can be un-selected with CTRL-click or CMD-click', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });
                    await new GridColumns(api, `Range members can be un-selected with CTRL-click or CMD-click setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `Range members can be un-selected with CTRL-click or CMD-click setup`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `);

                    actions.clickRowByIndex(1);
                    actions.clickRowByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 4], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([1, 2, 4], api);

                    actions.clickRowByIndex(2, { ctrlKey: true });
                    assertSelectedRowsByIndex([1, 4], api);
                    await new GridRows(api, `Range members can be un-selected with CTRL-click or CMD-click final state`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF selected id:1 sport:"rugby"
                            ├── LEAF id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF selected id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `);
                });

                test('Range is extended downwards from selection root', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });
                    await new GridColumns(api, `Range is extended downwards from selection root setup`).checkColumns(
                        `
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `
                    );
                    await new GridRows(api, `Range is extended downwards from selection root setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4], api);

                    actions.clickRowByIndex(6, { shiftKey: true });
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
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });
                    await new GridColumns(api, `Range is extended upwards from selection root setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `Range is extended upwards from selection root setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.clickRowByIndex(6);
                    actions.clickRowByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([6, 4, 5], api);

                    actions.clickRowByIndex(2, { shiftKey: true });
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
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });
                    await new GridColumns(api, `Range can be inverted setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `Range can be inverted setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.clickRowByIndex(4);
                    actions.clickRowByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([4, 5, 6], api);

                    actions.clickRowByIndex(2, { shiftKey: true });
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

                test('SHIFT-click within range after de-selection resets root and clears previous selection', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });
                    await new GridColumns(
                        api,
                        `SHIFT-click within range after de-selection resets root and clears previous sele setup`
                    ).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(
                        api,
                        `SHIFT-click within range after de-selection resets root and clears previous sele setup`
                    ).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    actions.clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([3, 4, 5], api);
                    await new GridRows(
                        api,
                        `SHIFT-click within range after de-selection resets root and clears previous sele final state`
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

                test('SHIFT-click below range after de-selection resets root and clears previous selection', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });
                    await new GridColumns(
                        api,
                        `SHIFT-click below range after de-selection resets root and clears previous selec setup`
                    ).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(
                        api,
                        `SHIFT-click below range after de-selection resets root and clears previous selec setup`
                    ).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.clickRowByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([3, 4, 5, 6], api);
                    await new GridRows(
                        api,
                        `SHIFT-click below range after de-selection resets root and clears previous selec final state`
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

                test('SHIFT-click above range after de-selection resets root and clears previous selection', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });
                    await new GridColumns(
                        api,
                        `SHIFT-click above range after de-selection resets root and clears previous selec setup`
                    ).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(
                        api,
                        `SHIFT-click above range after de-selection resets root and clears previous selec setup`
                    ).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.clickRowByIndex(1, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3], api);
                    await new GridRows(
                        api,
                        `SHIFT-click above range after de-selection resets root and clears previous selec final state`
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

                test('META+SHIFT-click within range allows batch deselection', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });
                    await new GridColumns(api, `META+SHIFT-click within range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `META+SHIFT-click within range allows batch deselection setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    actions.clickRowByIndex(5, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([2, 6], api);
                    await new GridRows(api, `META+SHIFT-click within range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF selected id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF selected id:6 sport:"rowing"
                        `
                    );
                });

                test('META+SHIFT-click below range allows batch deselection', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });
                    await new GridColumns(api, `META+SHIFT-click below range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `META+SHIFT-click below range allows batch deselection setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.clickRowByIndex(6, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([2], api);
                    await new GridRows(api, `META+SHIFT-click below range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF selected id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `
                    );
                });

                test('META+SHIFT-click above range allows batch deselection', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });
                    await new GridColumns(api, `META+SHIFT-click above range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `META+SHIFT-click above range allows batch deselection setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.clickRowByIndex(1, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([4, 5], api);
                    await new GridRows(api, `META+SHIFT-click above range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF selected id:4 sport:"golf"
                            ├── LEAF selected id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `
                    );
                });

                test('CTRL+SHIFT-click within range allows batch deselection', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });
                    await new GridColumns(api, `CTRL+SHIFT-click within range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `CTRL+SHIFT-click within range allows batch deselection setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    actions.clickRowByIndex(5, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2, 6], api);
                    await new GridRows(api, `CTRL+SHIFT-click within range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF selected id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF selected id:6 sport:"rowing"
                        `
                    );
                });

                test('CTRL+SHIFT-click below range allows batch deselection', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });
                    await new GridColumns(api, `CTRL+SHIFT-click below range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `CTRL+SHIFT-click below range allows batch deselection setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.clickRowByIndex(6, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2], api);
                    await new GridRows(api, `CTRL+SHIFT-click below range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF selected id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `
                    );
                });

                test('CTRL+SHIFT-click above range allows batch deselection', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });
                    await new GridColumns(api, `CTRL+SHIFT-click above range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `CTRL+SHIFT-click above range allows batch deselection setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.clickRowByIndex(1, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([4, 5], api);
                    await new GridRows(api, `CTRL+SHIFT-click above range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF selected id:4 sport:"golf"
                            ├── LEAF selected id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `
                    );
                });

                test('CTRL/META+SHIFT-click with null selection root is no-op', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });
                    await new GridColumns(api, `CTRL/META+SHIFT-click with null selection root is no-op setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `CTRL/META+SHIFT-click with null selection root is no-op setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.clickRowByIndex(2, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([], api);

                    actions.clickRowByIndex(2, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([], api);
                    await new GridRows(api, `CTRL/META+SHIFT-click with null selection root is no-op final state`)
                        .check(`
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

                test('SHIFT-click after select all selects range between clicked row and last clicked row', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });
                    await new GridColumns(
                        api,
                        `SHIFT-click after select all selects range between clicked row and last clicked  setup`
                    ).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(
                        api,
                        `SHIFT-click after select all selects range between clicked row and last clicked  setup`
                    ).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.clickRowByIndex(2);
                    actions.toggleHeaderCheckboxByIndex(0);

                    assertSelectedRowsByIndex([0, 1, 2, 3, 4, 5, 6], api);

                    actions.clickRowByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 3, 4, 5], api);
                    await new GridRows(
                        api,
                        `SHIFT-click after select all selects range between clicked row and last clicked  final state`
                    ).check(`
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

                test('SHIFT-click after select all on pristine grid selects range between first row and clicked row', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });
                    await new GridColumns(
                        api,
                        `SHIFT-click after select all on pristine grid selects range between first row an setup`
                    ).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(
                        api,
                        `SHIFT-click after select all on pristine grid selects range between first row an setup`
                    ).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.toggleHeaderCheckboxByIndex(0);

                    assertSelectedRowsByIndex([0, 1, 2, 3, 4, 5, 6], api);

                    actions.clickRowByIndex(3, { shiftKey: true });

                    assertSelectedRowsByIndex([0, 1, 2, 3], api);
                    await new GridRows(
                        api,
                        `SHIFT-click after select all on pristine grid selects range between first row an final state`
                    ).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF selected id:0 sport:"football"
                        ├── LEAF selected id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
                });

                test('SHIFT-click after select all behaves consistently', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });
                    await new GridColumns(api, `SHIFT-click after select all behaves consistently setup`).checkColumns(
                        `
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `
                    );
                    await new GridRows(api, `SHIFT-click after select all behaves consistently setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(4, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 3, 4], api);

                    actions.toggleHeaderCheckboxByIndex(0);

                    actions.clickRowByIndex(6, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);
                    await new GridRows(api, `SHIFT-click after select all behaves consistently final state`).check(`
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

                test('Select all, then de-select, then SHIFT-click goes back to normal behaviour', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });
                    await new GridColumns(
                        api,
                        `Select all, then de-select, then SHIFT-click goes back to normal behaviour setup`
                    ).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(
                        api,
                        `Select all, then de-select, then SHIFT-click goes back to normal behaviour setup`
                    ).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.toggleHeaderCheckboxByIndex(0);

                    // De-select a single row
                    actions.clickRowByIndex(3, { ctrlKey: true });

                    actions.clickRowByIndex(6, { shiftKey: true });

                    assertSelectedRowsByIndex([3, 4, 5, 6], api);
                    await new GridRows(
                        api,
                        `Select all, then de-select, then SHIFT-click goes back to normal behaviour final state`
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
            });
        });

        describe('Multiple Row Selection with Click', () => {
            test('Select multiple rows without modifier keys', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', enableSelectionWithoutKeys: true, enableClickSelection: true },
                });
                await new GridColumns(api, `Select multiple rows without modifier keys setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `Select multiple rows without modifier keys setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.clickRowByIndex(2);
                actions.clickRowByIndex(5);
                actions.clickRowByIndex(3);

                assertSelectedRowsByIndex([2, 5, 3], api);
                await new GridRows(api, `Select multiple rows without modifier keys final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF selected id:2 sport:"tennis"
                    ├── LEAF selected id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF selected id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('De-select row with click', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', enableSelectionWithoutKeys: true, enableClickSelection: true },
                });
                await new GridColumns(api, `De-select row with click setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `De-select row with click setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.selectRowsByIndex([1, 2, 3], true);

                actions.clickRowByIndex(2);

                assertSelectedRowsByIndex([1, 3], api);
                await new GridRows(api, `De-select row with click final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF selected id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF selected id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('SHIFT-click on row that is already selected is a no-op', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', enableClickSelection: true },
                });
                await new GridColumns(api, `SHIFT-click on row that is already selected is a no-op setup`).checkColumns(
                    `
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `
                );
                await new GridRows(api, `SHIFT-click on row that is already selected is a no-op setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.clickRowByIndex(1);

                assertSelectedRowsByIndex([1], api);

                actions.clickRowByIndex(1, { shiftKey: true });

                assertSelectedRowsByIndex([1], api);
                await new GridRows(api, `SHIFT-click on row that is already selected is a no-op final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF selected id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });
        });

        describe('Checkbox selection', () => {
            test('Checkbox can be toggled on and off', async () => {
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', checkboxes: true },
                });
                await new GridColumns(api, `Checkbox can be toggled on and off setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `Checkbox can be toggled on and off setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.toggleCheckboxByIndex(1);
                assertSelectedRowsByIndex([1], api);

                actions.toggleCheckboxByIndex(1);
                assertSelectedRowsByIndex([], api);
                await new GridRows(api, `Checkbox can be toggled on and off final state`).check(`
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

            test('Multiple rows can be selected without modifier keys nor rowMultiSelectWithClick', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', checkboxes: true },
                });
                await new GridColumns(
                    api,
                    `Multiple rows can be selected without modifier keys nor rowMultiSelectWithClick setup`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(
                    api,
                    `Multiple rows can be selected without modifier keys nor rowMultiSelectWithClick setup`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.toggleCheckboxByIndex(1);
                assertSelectedRowsByIndex([1], api);

                actions.toggleCheckboxByIndex(2);
                assertSelectedRowsByIndex([1, 2], api);
                await new GridRows(
                    api,
                    `Multiple rows can be selected without modifier keys nor rowMultiSelectWithClick final state`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF selected id:1 sport:"rugby"
                    ├── LEAF selected id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('Clicking selected checkbox toggles it off but keeps other selection', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: {
                        mode: 'multiRow',
                        checkboxes: true,
                    },
                });
                await new GridColumns(api, `Clicking selected checkbox toggles it off but keeps other selection setup`)
                    .checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                await new GridRows(api, `Clicking selected checkbox toggles it off but keeps other selection setup`)
                    .check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                actions.toggleCheckboxByIndex(1);
                actions.toggleCheckboxByIndex(3, { shiftKey: true });

                assertSelectedRowsByIndex([1, 2, 3], api);

                actions.toggleCheckboxByIndex(2);

                assertSelectedRowsByIndex([1, 3], api);
                await new GridRows(
                    api,
                    `Clicking selected checkbox toggles it off but keeps other selection final state`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF selected id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF selected id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('Clicking a row selects it when `enableClickSelection` is false', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: {
                        mode: 'multiRow',
                        checkboxes: true,
                        hideDisabledCheckboxes: false,
                        enableClickSelection: true,
                    },
                });
                await new GridColumns(api, `Clicking a row selects it when _enableClickSelection_ is false setup`)
                    .checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                await new GridRows(api, `Clicking a row selects it when _enableClickSelection_ is false setup`).check(
                    `
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `
                );

                // click, not toggle
                actions.clickRowByIndex(1);
                assertSelectedRowsByIndex([1], api);

                // toggle, not click, to assert inter-op
                actions.toggleCheckboxByIndex(1);
                assertSelectedRowsByIndex([], api);
                await new GridRows(api, `Clicking a row selects it when _enableClickSelection_ is false final state`)
                    .check(`
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

            test('Clicking a row does nothing when `enableClickSelection` is false', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: {
                        mode: 'multiRow',
                        checkboxes: true,
                        enableClickSelection: false,
                    },
                });
                await new GridColumns(api, `Clicking a row does nothing when _enableClickSelection_ is false setup`)
                    .checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                await new GridRows(api, `Clicking a row does nothing when _enableClickSelection_ is false setup`).check(
                    `
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `
                );

                // click, not toggle
                actions.clickRowByIndex(1);
                assertSelectedRowsByIndex([], api);
                await new GridRows(api, `Clicking a row does nothing when _enableClickSelection_ is false final state`)
                    .check(`
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

            test('Un-selectable checkboxes cannot be toggled', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: {
                        mode: 'multiRow',
                        checkboxes: true,
                        isRowSelectable: (node) => node.data?.sport !== 'golf',
                    },
                });
                await new GridColumns(api, `Un-selectable checkboxes cannot be toggled setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `Un-selectable checkboxes cannot be toggled setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF 🚫 id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.toggleCheckboxByIndex(4);

                assertSelectedRowsByIndex([], api);

                actions.toggleCheckboxByIndex(5);
                assertSelectedRowsByIndex([5], api);
                await new GridRows(api, `Un-selectable checkboxes cannot be toggled final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF 🚫 id:4 sport:"golf"
                    ├── LEAF selected id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            describe('Range selection behaviour', () => {
                test('CTRL-click and CMD-click does not affect ability to select multiple rows', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(
                        api,
                        `CTRL-click and CMD-click does not affect ability to select multiple rows setup`
                    ).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(
                        api,
                        `CTRL-click and CMD-click does not affect ability to select multiple rows setup`
                    ).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { metaKey: true });
                    actions.toggleCheckboxByIndex(3, { ctrlKey: true });

                    assertSelectedRowsByIndex([2, 5, 3], api);
                    await new GridRows(
                        api,
                        `CTRL-click and CMD-click does not affect ability to select multiple rows final state`
                    ).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF selected id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
                });

                test('SHIFT-click selects range of rows', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `SHIFT-click selects range of rows setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `SHIFT-click selects range of rows setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 3, 4, 5], api);
                    await new GridRows(api, `SHIFT-click selects range of rows final state`).check(`
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

                test('SHIFT-click extends range downwards from from last selected row', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `SHIFT-click extends range downwards from from last selected row setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `SHIFT-click extends range downwards from from last selected row setup`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `);

                    actions.selectRowsByIndex([1, 3], false);

                    actions.toggleCheckboxByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([1, 3, 4, 5], api);
                    await new GridRows(
                        api,
                        `SHIFT-click extends range downwards from from last selected row final state`
                    ).check(`
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

                test('SHIFT-click extends range upwards from from last selected row', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `SHIFT-click extends range upwards from from last selected row setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `SHIFT-click extends range upwards from from last selected row setup`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `);

                    actions.selectRowsByIndex([2, 4], false);

                    actions.toggleCheckboxByIndex(1, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 4, 1, 3], api);
                    await new GridRows(api, `SHIFT-click extends range upwards from from last selected row final state`)
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

                test('SHIFT-click on un-selected table selects only clicked row', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `SHIFT-click on un-selected table selects only clicked row setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `SHIFT-click on un-selected table selects only clicked row setup`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `
                    );

                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([4], api);

                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([4, 5, 6], api);
                    await new GridRows(api, `SHIFT-click on un-selected table selects only clicked row final state`)
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

                test('Range selection is preserved on CTRL-click and CMD-click', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `Range selection is preserved on CTRL-click and CMD-click setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `Range selection is preserved on CTRL-click and CMD-click setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(3, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3], api);

                    actions.toggleCheckboxByIndex(5, { metaKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 5], api);
                    await new GridRows(api, `Range selection is preserved on CTRL-click and CMD-click final state`)
                        .check(`
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

                test('Range selection is preserved on checkbox toggle', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `Range selection is preserved on checkbox toggle setup`).checkColumns(
                        `
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `
                    );
                    await new GridRows(api, `Range selection is preserved on checkbox toggle setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(3, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3], api);

                    actions.toggleCheckboxByIndex(5);
                    assertSelectedRowsByIndex([1, 2, 3, 5], api);
                    await new GridRows(api, `Range selection is preserved on checkbox toggle final state`).check(`
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

                test('Range members can be un-selected with CTRL-click or CMD-click', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `Range members can be un-selected with CTRL-click or CMD-click setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `Range members can be un-selected with CTRL-click or CMD-click setup`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `);

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 4], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([1, 2, 4], api);

                    actions.toggleCheckboxByIndex(2, { ctrlKey: true });
                    assertSelectedRowsByIndex([1, 4], api);
                    await new GridRows(api, `Range members can be un-selected with CTRL-click or CMD-click final state`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF selected id:1 sport:"rugby"
                            ├── LEAF id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF selected id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `);
                });

                test('Range members can be un-selected with toggle', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `Range members can be un-selected with toggle setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `Range members can be un-selected with toggle setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 4], api);

                    actions.toggleCheckboxByIndex(3);
                    assertSelectedRowsByIndex([1, 2, 4], api);
                    await new GridRows(api, `Range members can be un-selected with toggle final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF selected id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF selected id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
                });

                test('Range is extended downwards from selection root', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `Range is extended downwards from selection root setup`).checkColumns(
                        `
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `
                    );
                    await new GridRows(api, `Range is extended downwards from selection root setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4], api);

                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
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
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `Range is extended upwards from selection root setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `Range is extended upwards from selection root setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.toggleCheckboxByIndex(6);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([6, 4, 5], api);

                    actions.toggleCheckboxByIndex(2, { shiftKey: true });
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
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `Range can be inverted setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `Range can be inverted setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.toggleCheckboxByIndex(4);
                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([4, 5, 6], api);

                    actions.toggleCheckboxByIndex(2, { shiftKey: true });
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

                test('META+SHIFT-click within range allows batch deselection', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `META+SHIFT-click within range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `META+SHIFT-click within range allows batch deselection setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    actions.toggleCheckboxByIndex(5, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([2, 6], api);
                    await new GridRows(api, `META+SHIFT-click within range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF selected id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF selected id:6 sport:"rowing"
                        `
                    );
                });

                test('META+SHIFT-click below range allows batch deselection', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `META+SHIFT-click below range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `META+SHIFT-click below range allows batch deselection setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.toggleCheckboxByIndex(6, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([2], api);
                    await new GridRows(api, `META+SHIFT-click below range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF selected id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `
                    );
                });

                test('META+SHIFT-click above range allows batch deselection', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `META+SHIFT-click above range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `META+SHIFT-click above range allows batch deselection setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.toggleCheckboxByIndex(1, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([4, 5], api);
                    await new GridRows(api, `META+SHIFT-click above range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF selected id:4 sport:"golf"
                            ├── LEAF selected id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `
                    );
                });

                test('CTRL+SHIFT-click within range allows batch deselection', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `CTRL+SHIFT-click within range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `CTRL+SHIFT-click within range allows batch deselection setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    actions.toggleCheckboxByIndex(5, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2, 6], api);
                    await new GridRows(api, `CTRL+SHIFT-click within range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF selected id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF selected id:6 sport:"rowing"
                        `
                    );
                });

                test('CTRL+SHIFT-click below range allows batch deselection', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `CTRL+SHIFT-click below range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `CTRL+SHIFT-click below range allows batch deselection setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.toggleCheckboxByIndex(6, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2], api);
                    await new GridRows(api, `CTRL+SHIFT-click below range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF selected id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `
                    );
                });

                test('CTRL+SHIFT-click above range allows batch deselection', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `CTRL+SHIFT-click above range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `CTRL+SHIFT-click above range allows batch deselection setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.toggleCheckboxByIndex(1, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([4, 5], api);
                    await new GridRows(api, `CTRL+SHIFT-click above range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF selected id:4 sport:"golf"
                            ├── LEAF selected id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `
                    );
                });

                test('CTRL/META+SHIFT-click with null selection root is no-op', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `CTRL/META+SHIFT-click with null selection root is no-op setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `CTRL/META+SHIFT-click with null selection root is no-op setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.toggleCheckboxByIndex(2, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([], api);

                    actions.toggleCheckboxByIndex(2, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([], api);
                    await new GridRows(api, `CTRL/META+SHIFT-click with null selection root is no-op final state`)
                        .check(`
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

                test('Range selection context is unaffected after CTRL-click with enableClickSelection="enableDeselection"', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', enableClickSelection: 'enableDeselection' },
                    });
                    await new GridColumns(
                        api,
                        `Range selection context is unaffected after CTRL-click with enableClickSelection setup`
                    ).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(
                        api,
                        `Range selection context is unaffected after CTRL-click with enableClickSelection setup`
                    ).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.toggleCheckboxByIndex(4);
                    actions.clickRowByIndex(6, { ctrlKey: true });
                    assertSelectedRowsByIndex([4], api);

                    actions.toggleCheckboxByIndex(2, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 3, 4], api);
                    await new GridRows(
                        api,
                        `Range selection context is unaffected after CTRL-click with enableClickSelection final state`
                    ).check(`
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
            });
        });

        describe('Header checkbox selection', () => {
            test('can be used to select and deselect all rows', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', headerCheckbox: true },
                });
                await new GridColumns(api, `can be used to select and deselect all rows setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `can be used to select and deselect all rows setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.toggleHeaderCheckboxByIndex(0);
                assertSelectedRowsByIndex([0, 1, 2, 3, 4, 5, 6], api);

                actions.toggleHeaderCheckboxByIndex(0);
                assertSelectedRowsByIndex([], api);
                await new GridRows(api, `can be used to select and deselect all rows final state`).check(`
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

            test('can select multiple pages of data', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', headerCheckbox: true },
                    pagination: true,
                    paginationPageSize: 5,
                });
                await new GridColumns(api, `can select multiple pages of data setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `can select multiple pages of data setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.toggleHeaderCheckboxByIndex(0);
                assertSelectedRowsByIndex([0, 1, 2, 3, 4, 5, 6], api);

                actions.toggleHeaderCheckboxByIndex(0);
                assertSelectedRowsByIndex([], api);
                await new GridRows(api, `can select multiple pages of data final state`).check(`
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

            test('can select only current page of data', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: {
                        mode: 'multiRow',
                        headerCheckbox: true,
                        selectAll: 'currentPage',
                    },
                    pagination: true,
                    paginationPageSize: 5,
                });
                await new GridColumns(api, `can select only current page of data setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `can select only current page of data setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.toggleHeaderCheckboxByIndex(0);
                assertSelectedRowsByIndex([0, 1, 2, 3, 4], api);

                actions.toggleHeaderCheckboxByIndex(0);
                assertSelectedRowsByIndex([], api);
                await new GridRows(api, `can select only current page of data final state`).check(`
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

            test('can select only filtered data', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: {
                        mode: 'multiRow',
                        headerCheckbox: true,
                        selectAll: 'filtered',
                    },
                    pagination: true,
                    paginationPageSize: 5,
                });
                await new GridColumns(api, `can select only filtered data setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `can select only filtered data setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                api.setGridOption('quickFilterText', 'ing');
                await new GridColumns(api, `can select only filtered data after setGridOption quickFilterText`)
                    .checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                await new GridRows(api, `can select only filtered data after setGridOption quickFilterText`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.toggleHeaderCheckboxByIndex(0);
                assertSelectedRowsByIndex([0, 1], api);

                api.setGridOption('quickFilterText', '');
                await new GridColumns(api, `can select only filtered data after setGridOption quickFilterText #2`)
                    .checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                await new GridRows(api, `can select only filtered data after setGridOption quickFilterText #2`).check(
                    `
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF selected id:5 sport:"swimming"
                        └── LEAF selected id:6 sport:"rowing"
                    `
                );

                assertSelectedRowsByIndex([5, 6], api);
            });

            test('indeterminate selection state transitions to select all', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', headerCheckbox: true },
                });
                await new GridColumns(api, `indeterminate selection state transitions to select all setup`)
                    .checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                await new GridRows(api, `indeterminate selection state transitions to select all setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.selectRowsByIndex([3], false);

                actions.toggleHeaderCheckboxByIndex(0);
                assertSelectedRowsByIndex([3, 0, 1, 2, 4, 5, 6], api);
                await new GridRows(api, `indeterminate selection state transitions to select all final state`).check(
                    `
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF selected id:0 sport:"football"
                        ├── LEAF selected id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF selected id:4 sport:"golf"
                        ├── LEAF selected id:5 sport:"swimming"
                        └── LEAF selected id:6 sport:"rowing"
                    `
                );
            });

            test('un-selectable rows are not part of the selection', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: {
                        mode: 'multiRow',
                        headerCheckbox: true,
                        isRowSelectable: (node) => node.data?.sport !== 'football',
                    },
                });
                await new GridColumns(api, `un-selectable rows are not part of the selection setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `un-selectable rows are not part of the selection setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF 🚫 id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.toggleHeaderCheckboxByIndex(0);
                assertSelectedRowsByIndex([1, 2, 3, 4, 5, 6], api);
                await new GridRows(api, `un-selectable rows are not part of the selection final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF 🚫 id:0 sport:"football"
                    ├── LEAF selected id:1 sport:"rugby"
                    ├── LEAF selected id:2 sport:"tennis"
                    ├── LEAF selected id:3 sport:"cricket"
                    ├── LEAF selected id:4 sport:"golf"
                    ├── LEAF selected id:5 sport:"swimming"
                    └── LEAF selected id:6 sport:"rowing"
                `);
            });

            test('grand total row does not affect selected state when selectAll = "currentPage"', async () => {
                const [, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    grandTotalRow: 'bottom',
                    rowSelection: { mode: 'multiRow', selectAll: 'currentPage' },
                });

                const checkbox = actions.getHeaderCheckboxByIndex(0);

                actions.toggleHeaderCheckboxByIndex(0);
                expect((checkbox as any).checked).toBe(true);

                actions.toggleHeaderCheckboxByIndex(0);
                expect((checkbox as any).checked).toBe(false);
            });
        });

        describe('Group selection', () => {
            test('Checkbox location can be altered with `checkboxLocation` setting', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow', checkboxes: true },
                });
                await new GridColumns(api, `Checkbox location can be altered with _checkboxLocation_ setting setup`)
                    .checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        ├── ag-Grid-AutoColumn "Athlete" width:200
                        ├── age "Age" width:200
                        ├── year "Year" width:200
                        └── date "Date" width:200
                    `);
                await new GridRows(api, `Checkbox location can be altered with _checkboxLocation_ setting setup`).check(
                    `
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `
                );

                expect(actions.getRowByIndex(0)?.querySelector('[role="gridcell"]')?.getAttribute('col-id')).toEqual(
                    'ag-Grid-SelectionColumn'
                );
                const colState1 = api.getColumnState();
                expect(colState1[0].colId.startsWith('ag-Grid-SelectionColumn')).toBeTruthy();

                api.setGridOption('rowSelection', {
                    mode: 'multiRow',
                    checkboxes: true,
                    checkboxLocation: 'autoGroupColumn',
                });
                await new GridColumns(
                    api,
                    `Checkbox location can be altered with _checkboxLocation_ setting after setGridOption rowSelection`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Athlete" width:200
                    ├── age "Age" width:200
                    ├── year "Year" width:200
                    └── date "Date" width:200
                `);
                await new GridRows(
                    api,
                    `Checkbox location can be altered with _checkboxLocation_ setting after setGridOption rowSelection`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                expect(actions.getRowByIndex(0)?.querySelector('[role="gridcell"]')?.getAttribute('col-id')).toEqual(
                    'ag-Grid-AutoColumn'
                );
                const colState2 = api.getColumnState();
                expect(colState2[0].colId.startsWith('ag-Grid-SelectionColumn')).toBeFalsy();

                api.setGridOption('rowSelection', {
                    mode: 'multiRow',
                    checkboxes: true,
                    checkboxLocation: 'selectionColumn',
                });
                await new GridColumns(
                    api,
                    `Checkbox location can be altered with _checkboxLocation_ setting after setGridOption rowSelection #2`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── ag-Grid-AutoColumn "Athlete" width:200
                    ├── age "Age" width:200
                    ├── year "Year" width:200
                    └── date "Date" width:200
                `);
                await new GridRows(
                    api,
                    `Checkbox location can be altered with _checkboxLocation_ setting after setGridOption rowSelection #2`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                expect(actions.getRowByIndex(0)?.querySelector('[role="gridcell"]')?.getAttribute('col-id')).toEqual(
                    'ag-Grid-SelectionColumn'
                );
                const colState3 = api.getColumnState();
                expect(colState3[0].colId.startsWith('ag-Grid-SelectionColumn')).toBeTruthy();
            });

            test('clicking checkbox does nothing if row selection not enabled', async () => {
                const [api, actions] = await createGridAndWait(groupGridOptions);
                await new GridColumns(api, `clicking checkbox does nothing if row selection not enabled setup`)
                    .checkColumns(`
                        CENTER
                        ├── ag-Grid-AutoColumn "Athlete" width:200
                        ├── age "Age" width:200
                        ├── year "Year" width:200
                        └── date "Date" width:200
                    `);
                await new GridRows(api, `clicking checkbox does nothing if row selection not enabled setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([], api);
                await new GridRows(api, `clicking checkbox does nothing if row selection not enabled final state`)
                    .check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);
            });

            test('toggling group row selects only that row', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow' },
                });
                await new GridColumns(api, `toggling group row selects only that row setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── ag-Grid-AutoColumn "Athlete" width:200
                    ├── age "Age" width:200
                    ├── year "Year" width:200
                    └── date "Date" width:200
                `);
                await new GridRows(api, `toggling group row selects only that row setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([0], api);
                await new GridRows(api, `toggling group row selects only that row final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler selected id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);
            });

            test('clicking group row with `groupSelects = "descendants"` selects group and descendants', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow', groupSelects: 'descendants', enableClickSelection: true },
                });
                await new GridColumns(
                    api,
                    `clicking group row with _groupSelects = "descendants"_ selects group and descend setup`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── ag-Grid-AutoColumn "Athlete" width:200
                    ├── age "Age" width:200
                    ├── year "Year" width:200
                    └── date "Date" width:200
                `);
                await new GridRows(
                    api,
                    `clicking group row with _groupSelects = "descendants"_ selects group and descend setup`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                actions.clickRowByIndex(0);
                assertSelectedRowsByIndex([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14], api);
                await new GridRows(
                    api,
                    `clicking group row with _groupSelects = "descendants"_ selects group and descend final state`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler selected id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF selected id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF selected id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF selected id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF selected id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF selected id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);
            });

            test('toggling group row with `groupSelects = "descendants"` enabled selects that row and all its children', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
                });
                await new GridColumns(
                    api,
                    `toggling group row with _groupSelects = "descendants"_ enabled selects that row  setup`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── ag-Grid-AutoColumn "Athlete" width:200
                    ├── age "Age" width:200
                    ├── year "Year" width:200
                    └── date "Date" width:200
                `);
                await new GridRows(
                    api,
                    `toggling group row with _groupSelects = "descendants"_ enabled selects that row  setup`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                // Group selects children
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14], api);

                // Can un-select child row
                actions.toggleCheckboxByIndex(4);
                assertSelectedRowsByIndex([2, 3, 5, 6, 7, 8, 9, 10, 11, 13, 14], api);

                // Toggling group row from indeterminate state selects all children
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([2, 3, 5, 6, 7, 8, 9, 10, 11, 13, 14, 4], api);

                // Toggle group row again de-selects all children
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([], api);
                await new GridRows(
                    api,
                    `toggling group row with _groupSelects = "descendants"_ enabled selects that row  final state`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);
            });

            test('clicking group row with `groupSelects = "filteredDescendants"` enabled selects that row and all its filtered children', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow', groupSelects: 'filteredDescendants' },
                    quickFilterText: 'ing',
                });
                await new GridColumns(
                    api,
                    `clicking group row with _groupSelects = "filteredDescendants"_ enabled selects t setup`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── ag-Grid-AutoColumn "Athlete" width:200
                    ├── age "Age" width:200
                    ├── year "Year" width:200
                    └── date "Date" width:200
                `);
                await new GridRows(
                    api,
                    `clicking group row with _groupSelects = "filteredDescendants"_ enabled selects t setup`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                // Group selects children
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowElementsById(
                    [
                        '0',
                        '1',
                        '2',
                        '3',
                        '6',
                        '7',
                        '8',
                        '9',
                        '11',
                        '18',
                        '20',
                        'row-group-country-United States-sport-Swimming',
                    ],
                    api
                );

                // Group checkbox is indeterminate because rows are filtered out
                expect(api.getDisplayedRowAtIndex(0)!.isSelected()).toBeUndefined();

                // Can un-select child row
                actions.toggleCheckboxByIndex(4);
                expect(api.getDisplayedRowAtIndex(0)?.isSelected()).toEqual(undefined);
                assertSelectedRowElementsById(['0', '1', '3', '6', '7', '8', '9', '11', '18', '20'], api);

                // Toggling group row from indeterminate state re-selects all visible children
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowElementsById(
                    [
                        '0',
                        '1',
                        '2',
                        '3',
                        '6',
                        '7',
                        '8',
                        '9',
                        '11',
                        '18',
                        '20',
                        'row-group-country-United States-sport-Swimming',
                    ],
                    api
                );

                // Group checkbox is still indeterminate because rows are still filtered out
                expect(api.getDisplayedRowAtIndex(0)!.isSelected()).toBeUndefined();

                // Remove filter
                api.setGridOption('quickFilterText', undefined);
                await new GridColumns(
                    api,
                    `clicking group row with _groupSelects = "filteredDescendants"_ enabled selects t after setGridOption quickFilterText`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── ag-Grid-AutoColumn "Athlete" width:200
                    ├── age "Age" width:200
                    ├── year "Year" width:200
                    └── date "Date" width:200
                `);
                await new GridRows(
                    api,
                    `clicking group row with _groupSelects = "filteredDescendants"_ enabled selects t after setGridOption quickFilterText`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler indeterminate id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF selected id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF selected id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF selected id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP indeterminate id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF selected id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                // Toggling indeterminate group row checkbox now transitions to checked state
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowElementsById(
                    [
                        '0',
                        '1',
                        '2',
                        '3',
                        '6',
                        '7',
                        '8',
                        '9',
                        '11',
                        '13',
                        '18',
                        '20',
                        'row-group-country-United States',
                        'row-group-country-United States-sport-Swimming',
                        'row-group-country-United States-sport-Gymnastics',
                    ],
                    api
                );
                expect(api.getDisplayedRowAtIndex(0)!.isSelected()).toBe(true);
            });

            test('clicking indeterminate group row checkbox when filtered out children are selected and `groupSelects: "filteredDescendants"` selects all children', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow', groupSelects: 'filteredDescendants' },
                });
                await new GridColumns(
                    api,
                    `clicking indeterminate group row checkbox when filtered out children are selecte setup`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── ag-Grid-AutoColumn "Athlete" width:200
                    ├── age "Age" width:200
                    ├── year "Year" width:200
                    └── date "Date" width:200
                `);
                await new GridRows(
                    api,
                    `clicking indeterminate group row checkbox when filtered out children are selecte setup`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                // Group selects all children
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowElementsById(
                    [
                        '0',
                        '1',
                        '2',
                        '3',
                        '6',
                        '7',
                        '8',
                        '9',
                        '11',
                        '18',
                        '13',
                        '20',
                        'row-group-country-United States',
                        'row-group-country-United States-sport-Gymnastics',
                        'row-group-country-United States-sport-Swimming',
                    ],
                    api
                );

                // Filter rows
                api.setGridOption('quickFilterText', 'ing');
                await new GridColumns(
                    api,
                    `clicking indeterminate group row checkbox when filtered out children are selecte after setGridOption quickFilterText`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── ag-Grid-AutoColumn "Athlete" width:200
                    ├── age "Age" width:200
                    ├── year "Year" width:200
                    └── date "Date" width:200
                `);
                await new GridRows(
                    api,
                    `clicking indeterminate group row checkbox when filtered out children are selecte after setGridOption quickFilterText`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler selected id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF selected id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF selected id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF selected id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF selected id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                // De-select group row
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowElementsById(['13'], api);
                expect(api.getDisplayedRowAtIndex(0)!.isSelected()).toBeUndefined();

                // Toggle indeterminate re-selects all nodes
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowElementsById(
                    [
                        '0',
                        '1',
                        '2',
                        '3',
                        '6',
                        '7',
                        '8',
                        '9',
                        '11',
                        '18',
                        '13',
                        '20',
                        'row-group-country-United States',
                        'row-group-country-United States-sport-Gymnastics',
                        'row-group-country-United States-sport-Swimming',
                    ],
                    api
                );
                expect(api.getDisplayedRowAtIndex(0)!.isSelected()).toBe(true);
            });

            test('clicking indeterminate group row checkbox when only visible children are selected and `groupSelects: "filteredDescendants" de-selects all children', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow', groupSelects: 'filteredDescendants' },
                    quickFilterText: 'ing',
                });
                await new GridColumns(
                    api,
                    `clicking indeterminate group row checkbox when only visible children are selecte setup`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── ag-Grid-AutoColumn "Athlete" width:200
                    ├── age "Age" width:200
                    ├── year "Year" width:200
                    └── date "Date" width:200
                `);
                await new GridRows(
                    api,
                    `clicking indeterminate group row checkbox when only visible children are selecte setup`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                // Select all filtered children individually
                actions.toggleCheckboxById('0');
                actions.toggleCheckboxById('1');
                actions.toggleCheckboxById('2');
                actions.toggleCheckboxById('3');
                actions.toggleCheckboxById('6');
                actions.toggleCheckboxById('7');
                actions.toggleCheckboxById('8');
                actions.toggleCheckboxById('9');
                actions.toggleCheckboxById('11');
                actions.toggleCheckboxById('18');
                actions.toggleCheckboxById('20');
                assertSelectedRowElementsById(
                    [
                        '0',
                        '1',
                        '2',
                        '3',
                        '6',
                        '7',
                        '8',
                        '9',
                        '11',
                        '18',
                        '20',
                        'row-group-country-United States-sport-Swimming',
                    ],
                    api
                );

                actions.toggleCheckboxById('row-group-country-United States');
                assertSelectedRowElementsById([], api);
                await new GridRows(
                    api,
                    `clicking indeterminate group row checkbox when only visible children are selecte final state`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);
            });

            test('Cannot select group rows where `isRowSelectable` returns false and `groupSelects` = "self"', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: {
                        mode: 'multiRow',
                        isRowSelectable: (node) => node.data?.sport === 'Swimming',
                    },
                });
                await new GridColumns(
                    api,
                    `Cannot select group rows where _isRowSelectable_ returns false and _groupSelects setup`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── ag-Grid-AutoColumn "Athlete" width:200
                    ├── age "Age" width:200
                    ├── year "Year" width:200
                    └── date "Date" width:200
                `);
                await new GridRows(
                    api,
                    `Cannot select group rows where _isRowSelectable_ returns false and _groupSelects setup`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler 🚫 id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF 🚫 id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF 🚫 id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF 🚫 id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler 🚫 id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF 🚫 id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler 🚫 id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF 🚫 id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler 🚫 id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler 🚫 id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler 🚫 id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP 🚫 id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([], api);

                actions.toggleCheckboxByIndex(2);
                assertSelectedRowsByIndex([2], api);
                await new GridRows(
                    api,
                    `Cannot select group rows where _isRowSelectable_ returns false and _groupSelects final state`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler 🚫 id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF 🚫 id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF 🚫 id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF 🚫 id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler 🚫 id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF 🚫 id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler 🚫 id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF 🚫 id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler 🚫 id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler 🚫 id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler 🚫 id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP 🚫 id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);
            });

            test('Can select group rows where `isRowSelectable` returns false and `groupSelects` = "descendants"', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: {
                        mode: 'multiRow',
                        groupSelects: 'descendants',
                        isRowSelectable: (node) => node.data?.sport === 'Swimming',
                    },
                });
                await new GridColumns(
                    api,
                    `Can select group rows where _isRowSelectable_ returns false and _groupSelects_ = setup`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── ag-Grid-AutoColumn "Athlete" width:200
                    ├── age "Age" width:200
                    ├── year "Year" width:200
                    └── date "Date" width:200
                `);
                await new GridRows(
                    api,
                    `Can select group rows where _isRowSelectable_ returns false and _groupSelects_ = setup`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF 🚫 id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF 🚫 id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF 🚫 id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF 🚫 id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler 🚫 id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF 🚫 id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([2, 3, 4, 5, 6, 7, 8, 9, 10, 11], api);
                await new GridRows(
                    api,
                    `Can select group rows where _isRowSelectable_ returns false and _groupSelects_ = final state`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler selected id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF selected id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF selected id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF selected id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF 🚫 id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF 🚫 id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF 🚫 id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF 🚫 id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler 🚫 id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF 🚫 id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);
            });

            test('Can select group rows where `isRowSelectable` returns false and `groupSelects` = "filteredDescendants"', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: {
                        mode: 'multiRow',
                        groupSelects: 'filteredDescendants',
                        isRowSelectable: (node) => node.data?.sport === 'Swimming',
                    },
                });
                await new GridColumns(
                    api,
                    `Can select group rows where _isRowSelectable_ returns false and _groupSelects_ = setup`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── ag-Grid-AutoColumn "Athlete" width:200
                    ├── age "Age" width:200
                    ├── year "Year" width:200
                    └── date "Date" width:200
                `);
                await new GridRows(
                    api,
                    `Can select group rows where _isRowSelectable_ returns false and _groupSelects_ = setup`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF 🚫 id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF 🚫 id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF 🚫 id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF 🚫 id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler 🚫 id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF 🚫 id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([2, 3, 4, 5, 6, 7, 8, 9, 10, 11], api);
                await new GridRows(
                    api,
                    `Can select group rows where _isRowSelectable_ returns false and _groupSelects_ = final state`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler selected id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF selected id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF selected id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF selected id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF 🚫 id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF 🚫 id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF 🚫 id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF 🚫 id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler 🚫 id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF 🚫 id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);
            });

            test('Selection state changes when `isRowSelectable` changes', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: {
                        mode: 'multiRow',
                        groupSelects: 'descendants',
                        isRowSelectable: (node) => node.data?.sport === 'Swimming',
                    },
                });
                await new GridColumns(api, `Selection state changes when _isRowSelectable_ changes setup`).checkColumns(
                    `
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        ├── ag-Grid-AutoColumn "Athlete" width:200
                        ├── age "Age" width:200
                        ├── year "Year" width:200
                        └── date "Date" width:200
                    `
                );
                await new GridRows(api, `Selection state changes when _isRowSelectable_ changes setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF 🚫 id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF 🚫 id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF 🚫 id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF 🚫 id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler 🚫 id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF 🚫 id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([2, 3, 4, 5, 6, 7, 8, 9, 10, 11], api);

                api.setGridOption('rowSelection', {
                    mode: 'multiRow',
                    groupSelects: 'descendants',
                    isRowSelectable: (node) => node.data?.sport === 'Gymnastics',
                });
                await new GridColumns(
                    api,
                    `Selection state changes when _isRowSelectable_ changes after setGridOption rowSelection`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── ag-Grid-AutoColumn "Athlete" width:200
                    ├── age "Age" width:200
                    ├── year "Year" width:200
                    └── date "Date" width:200
                `);
                await new GridRows(
                    api,
                    `Selection state changes when _isRowSelectable_ changes after setGridOption rowSelection`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF 🚫 id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF 🚫 id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF 🚫 id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF 🚫 id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF 🚫 id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF 🚫 id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler 🚫 id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF 🚫 id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF 🚫 id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF 🚫 id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF 🚫 id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler 🚫 id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF 🚫 id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler 🚫 id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF 🚫 id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler 🚫 id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF 🚫 id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler 🚫 id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP 🚫 id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF 🚫 id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                assertSelectedRowsByIndex([], api);
            });

            test('Selection state changes when grouping is updated', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: {
                        mode: 'multiRow',
                        groupSelects: 'descendants',
                        isRowSelectable: (node) => node.data?.sport === 'Swimming',
                    },
                });
                await new GridColumns(api, `Selection state changes when grouping is updated setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── ag-Grid-AutoColumn "Athlete" width:200
                    ├── age "Age" width:200
                    ├── year "Year" width:200
                    └── date "Date" width:200
                `);
                await new GridRows(api, `Selection state changes when grouping is updated setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF 🚫 id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF 🚫 id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF 🚫 id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF 🚫 id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler 🚫 id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF 🚫 id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                // Selects all nodes in country 'United States'
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowElementsById(
                    [
                        '0',
                        '1',
                        '2',
                        '3',
                        '6',
                        '7',
                        '8',
                        '9',
                        '11',
                        '18',
                        'row-group-country-United States',
                        'row-group-country-United States-sport-Swimming',
                    ],
                    api
                );
                const applied = api.applyColumnState({ state: [{ colId: 'country', rowGroup: false }] });
                expect(applied).toBeTruthy();

                assertSelectedRowElementsById(['0', '1', '2', '3', '6', '7', '8', '9', '11', '18'], api);
                await new GridRows(api, `Selection state changes when grouping is updated final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ LEAF_GROUP indeterminate id:row-group-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ ├── LEAF selected id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ ├── LEAF selected id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ ├── LEAF selected id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ ├── LEAF selected id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ ├── LEAF selected id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ ├── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    │ ├── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ ├── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ ├── LEAF selected id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    ├─┬ LEAF_GROUP 🚫 id:row-group-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ ├── LEAF 🚫 id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    │ ├── LEAF 🚫 id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ └── LEAF 🚫 id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ LEAF_GROUP 🚫 id:"row-group-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ └── LEAF 🚫 id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    └─┬ LEAF_GROUP 🚫 id:"row-group-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    · └── LEAF 🚫 id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                `);
            });

            test('selecting footer node selects sibling (i.e. group node)', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    groupTotalRow: 'bottom',
                    rowSelection: {
                        mode: 'multiRow',
                    },
                });
                await new GridColumns(api, `selecting footer node selects sibling (i.e. group node) setup`)
                    .checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        ├── ag-Grid-AutoColumn "Athlete" width:200
                        ├── age "Age" width:200
                        ├── year "Year" width:200
                        └── date "Date" width:200
                    `);
                await new GridRows(api, `selecting footer node selects sibling (i.e. group node) setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ ├── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ │ └─ footer id:"rowGroupFooter_row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Total Swimming"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ │ ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    │ │ └─ footer id:"rowGroupFooter_row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Total Gymnastics"
                    │ └─ footer id:"rowGroupFooter_row-group-country-United States" ag-Grid-AutoColumn:"Total United States"
                    ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ ├─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ │ ├── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    │ │ └─ footer id:rowGroupFooter_row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Total Gymnastics"
                    │ └─ footer id:rowGroupFooter_row-group-country-Russia ag-Grid-AutoColumn:"Total Russia"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ ├─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ │ ├── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ └─ footer id:rowGroupFooter_row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Total Swimming"
                    │ └─ footer id:rowGroupFooter_row-group-country-Australia ag-Grid-AutoColumn:"Total Australia"
                    ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ │ ├── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    │ │ └─ footer id:"rowGroupFooter_row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Total Speed Skating"
                    │ └─ footer id:rowGroupFooter_row-group-country-Canada ag-Grid-AutoColumn:"Total Canada"
                    ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ │ ├── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    │ │ └─ footer id:"rowGroupFooter_row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Total Cross Country Skiing"
                    │ └─ footer id:rowGroupFooter_row-group-country-Norway ag-Grid-AutoColumn:"Total Norway"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ ├─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    │ │ └─ footer id:rowGroupFooter_row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Total Swimming"
                    │ └─ footer id:rowGroupFooter_row-group-country-China ag-Grid-AutoColumn:"Total China"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ ├─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ │ └─ footer id:rowGroupFooter_row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Total Swimming"
                    │ └─ footer id:rowGroupFooter_row-group-country-Zimbabwe ag-Grid-AutoColumn:"Total Zimbabwe"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · ├─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · │ ├── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    · │ └─ footer id:rowGroupFooter_row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Total Swimming"
                    · └─ footer id:rowGroupFooter_row-group-country-Netherlands ag-Grid-AutoColumn:"Total Netherlands"
                `);

                actions.toggleCheckboxById('rowGroupFooter_row-group-country-United States-sport-Swimming');

                assertSelectedRowElementsById(['row-group-country-United States-sport-Swimming'], api);
                await new GridRows(api, `selecting footer node selects sibling (i.e. group node) final state`).check(
                    `
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ ├── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ │ └─ footer selected id:"rowGroupFooter_row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Total Swimming"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ │ ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        │ │ └─ footer id:"rowGroupFooter_row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Total Gymnastics"
                        │ └─ footer id:"rowGroupFooter_row-group-country-United States" ag-Grid-AutoColumn:"Total United States"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ ├─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ │ ├── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        │ │ └─ footer id:rowGroupFooter_row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Total Gymnastics"
                        │ └─ footer id:rowGroupFooter_row-group-country-Russia ag-Grid-AutoColumn:"Total Russia"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ ├─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ │ ├── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ └─ footer id:rowGroupFooter_row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Total Swimming"
                        │ └─ footer id:rowGroupFooter_row-group-country-Australia ag-Grid-AutoColumn:"Total Australia"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ │ ├── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        │ │ └─ footer id:"rowGroupFooter_row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Total Speed Skating"
                        │ └─ footer id:rowGroupFooter_row-group-country-Canada ag-Grid-AutoColumn:"Total Canada"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ │ ├── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        │ │ └─ footer id:"rowGroupFooter_row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Total Cross Country Skiing"
                        │ └─ footer id:rowGroupFooter_row-group-country-Norway ag-Grid-AutoColumn:"Total Norway"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ ├─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        │ │ └─ footer id:rowGroupFooter_row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Total Swimming"
                        │ └─ footer id:rowGroupFooter_row-group-country-China ag-Grid-AutoColumn:"Total China"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ ├─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ │ └─ footer id:rowGroupFooter_row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Total Swimming"
                        │ └─ footer id:rowGroupFooter_row-group-country-Zimbabwe ag-Grid-AutoColumn:"Total Zimbabwe"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · ├─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · │ ├── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                        · │ └─ footer id:rowGroupFooter_row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Total Swimming"
                        · └─ footer id:rowGroupFooter_row-group-country-Netherlands ag-Grid-AutoColumn:"Total Netherlands"
                    `
                );
            });

            test('parent with unselectable children is unselectable when groupSelects: descendants', async () => {
                const [api] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: {
                        mode: 'multiRow',
                        groupSelects: 'descendants',
                        isRowSelectable: (node) => node.id?.startsWith('row-group') ?? false,
                    },
                });
                await new GridColumns(
                    api,
                    `parent with unselectable children is unselectable when groupSelects: descendants setup`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── ag-Grid-AutoColumn "Athlete" width:200
                    ├── age "Age" width:200
                    ├── year "Year" width:200
                    └── date "Date" width:200
                `);
                await new GridRows(
                    api,
                    `parent with unselectable children is unselectable when groupSelects: descendants setup`
                ).check(`
                    ROOT 🚫 id:ROOT_NODE_ID
                    ├─┬ filler 🚫 id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF 🚫 id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF 🚫 id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF 🚫 id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF 🚫 id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF 🚫 id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF 🚫 id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF 🚫 id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF 🚫 id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF 🚫 id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler 🚫 id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF 🚫 id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF 🚫 id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF 🚫 id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF 🚫 id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler 🚫 id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF 🚫 id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler 🚫 id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF 🚫 id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler 🚫 id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF 🚫 id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler 🚫 id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP 🚫 id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF 🚫 id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                expect(api.getRowNode('row-group-country-United States')?.selectable).toBe(false);
                expect(api.getRowNode('row-group-country-United States-sport-Swimming')?.selectable).toBe(false);
                await new GridRows(
                    api,
                    `parent with unselectable children is unselectable when groupSelects: descendants final state`
                ).check(`
                    ROOT 🚫 id:ROOT_NODE_ID
                    ├─┬ filler 🚫 id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF 🚫 id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF 🚫 id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF 🚫 id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF 🚫 id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF 🚫 id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF 🚫 id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF 🚫 id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF 🚫 id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF 🚫 id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler 🚫 id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF 🚫 id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF 🚫 id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF 🚫 id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF 🚫 id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler 🚫 id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF 🚫 id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler 🚫 id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF 🚫 id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler 🚫 id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF 🚫 id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler 🚫 id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP 🚫 id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF 🚫 id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);
            });

            test('parent with unselectable children is unselectable when groupSelects: filteredDescendants', async () => {
                const [api] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: {
                        mode: 'multiRow',
                        groupSelects: 'filteredDescendants',
                        isRowSelectable: (node) => node.id?.startsWith('row-group') ?? false,
                    },
                });
                await new GridColumns(
                    api,
                    `parent with unselectable children is unselectable when groupSelects: filteredDes setup`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── ag-Grid-AutoColumn "Athlete" width:200
                    ├── age "Age" width:200
                    ├── year "Year" width:200
                    └── date "Date" width:200
                `);
                await new GridRows(
                    api,
                    `parent with unselectable children is unselectable when groupSelects: filteredDes setup`
                ).check(`
                    ROOT 🚫 id:ROOT_NODE_ID
                    ├─┬ filler 🚫 id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF 🚫 id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF 🚫 id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF 🚫 id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF 🚫 id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF 🚫 id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF 🚫 id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF 🚫 id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF 🚫 id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF 🚫 id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler 🚫 id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF 🚫 id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF 🚫 id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF 🚫 id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF 🚫 id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler 🚫 id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF 🚫 id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler 🚫 id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF 🚫 id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler 🚫 id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF 🚫 id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler 🚫 id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP 🚫 id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF 🚫 id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                expect(api.getRowNode('row-group-country-United States')?.selectable).toBe(false);
                expect(api.getRowNode('row-group-country-United States-sport-Swimming')?.selectable).toBe(false);
                await new GridRows(
                    api,
                    `parent with unselectable children is unselectable when groupSelects: filteredDes final state`
                ).check(`
                    ROOT 🚫 id:ROOT_NODE_ID
                    ├─┬ filler 🚫 id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF 🚫 id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF 🚫 id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF 🚫 id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF 🚫 id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF 🚫 id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF 🚫 id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF 🚫 id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF 🚫 id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF 🚫 id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler 🚫 id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF 🚫 id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF 🚫 id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF 🚫 id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF 🚫 id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler 🚫 id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF 🚫 id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler 🚫 id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF 🚫 id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler 🚫 id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF 🚫 id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler 🚫 id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP 🚫 id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF 🚫 id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);
            });

            describe('Range selection behaviour', () => {
                test('CTRL-click and CMD-click does not affect ability to select multiple rows', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(
                        api,
                        `CTRL-click and CMD-click does not affect ability to select multiple rows setup`
                    ).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        ├── ag-Grid-AutoColumn "Athlete" width:200
                        ├── age "Age" width:200
                        ├── year "Year" width:200
                        └── date "Date" width:200
                    `);
                    await new GridRows(
                        api,
                        `CTRL-click and CMD-click does not affect ability to select multiple rows setup`
                    ).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { metaKey: true });
                    actions.toggleCheckboxByIndex(3, { ctrlKey: true });

                    assertSelectedRowsByIndex([2, 5, 3], api);
                    await new GridRows(
                        api,
                        `CTRL-click and CMD-click does not affect ability to select multiple rows final state`
                    ).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);
                });

                test('SHIFT-click selects range of rows', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `SHIFT-click selects range of rows setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        ├── ag-Grid-AutoColumn "Athlete" width:200
                        ├── age "Age" width:200
                        ├── year "Year" width:200
                        └── date "Date" width:200
                    `);
                    await new GridRows(api, `SHIFT-click selects range of rows setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 3, 4, 5], api);
                    await new GridRows(api, `SHIFT-click selects range of rows final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);
                });

                test('SHIFT-click extends range downwards from from last selected row', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `SHIFT-click extends range downwards from from last selected row setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            ├── ag-Grid-AutoColumn "Athlete" width:200
                            ├── age "Age" width:200
                            ├── year "Year" width:200
                            └── date "Date" width:200
                        `);
                    await new GridRows(api, `SHIFT-click extends range downwards from from last selected row setup`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                            │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                            │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                            │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                            │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                            │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                            │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                            ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                            │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                            │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                            │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                            ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                            │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                            ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                            │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                            ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                            │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                            · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                        `);

                    actions.selectRowsByIndex([1, 3], false);

                    actions.toggleCheckboxByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([1, 3, 4, 5], api);
                    await new GridRows(
                        api,
                        `SHIFT-click extends range downwards from from last selected row final state`
                    ).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);
                });

                test('SHIFT-click extends range upwards from from last selected row', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `SHIFT-click extends range upwards from from last selected row setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            ├── ag-Grid-AutoColumn "Athlete" width:200
                            ├── age "Age" width:200
                            ├── year "Year" width:200
                            └── date "Date" width:200
                        `);
                    await new GridRows(api, `SHIFT-click extends range upwards from from last selected row setup`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                            │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                            │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                            │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                            │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                            │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                            │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                            ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                            │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                            │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                            │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                            ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                            │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                            ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                            │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                            ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                            │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                            · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                        `);

                    actions.selectRowsByIndex([2, 4], false);

                    actions.toggleCheckboxByIndex(1, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 4, 1, 3], api);
                    await new GridRows(api, `SHIFT-click extends range upwards from from last selected row final state`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                            │ ├─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                            │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                            │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                            │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                            │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                            │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                            ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                            │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                            │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                            │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                            ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                            │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                            ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                            │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                            ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                            │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                            · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                        `);
                });

                test('SHIFT-click on un-selected table selects only clicked row', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `SHIFT-click on un-selected table selects only clicked row setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            ├── ag-Grid-AutoColumn "Athlete" width:200
                            ├── age "Age" width:200
                            ├── year "Year" width:200
                            └── date "Date" width:200
                        `);
                    await new GridRows(api, `SHIFT-click on un-selected table selects only clicked row setup`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                            │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                            │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                            │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                            │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                            │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                            │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                            ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                            │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                            │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                            │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                            ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                            │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                            ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                            │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                            ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                            │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                            · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                        `
                    );

                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([4], api);

                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([4, 5, 6], api);
                    await new GridRows(api, `SHIFT-click on un-selected table selects only clicked row final state`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                            │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                            │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF selected id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                            │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                            │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                            │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                            │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                            ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                            │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                            │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                            │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                            ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                            │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                            ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                            │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                            ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                            │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                            · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                        `);
                });

                test('Range selection is preserved on CTRL-click and CMD-click', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `Range selection is preserved on CTRL-click and CMD-click setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            ├── ag-Grid-AutoColumn "Athlete" width:200
                            ├── age "Age" width:200
                            ├── year "Year" width:200
                            └── date "Date" width:200
                        `);
                    await new GridRows(api, `Range selection is preserved on CTRL-click and CMD-click setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(3, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3], api);

                    actions.toggleCheckboxByIndex(5, { metaKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 5], api);
                    await new GridRows(api, `Range selection is preserved on CTRL-click and CMD-click final state`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                            │ ├─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                            │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                            │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                            │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                            │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                            │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                            ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                            │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                            │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                            │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                            ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                            │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                            ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                            │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                            ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                            │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                            · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                        `);
                });

                test('Range selection is preserved on checkbox toggle', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `Range selection is preserved on checkbox toggle setup`).checkColumns(
                        `
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            ├── ag-Grid-AutoColumn "Athlete" width:200
                            ├── age "Age" width:200
                            ├── year "Year" width:200
                            └── date "Date" width:200
                        `
                    );
                    await new GridRows(api, `Range selection is preserved on checkbox toggle setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(3, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3], api);

                    actions.toggleCheckboxByIndex(5);
                    assertSelectedRowsByIndex([1, 2, 3, 5], api);
                    await new GridRows(api, `Range selection is preserved on checkbox toggle final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);
                });

                test('Range members can be un-selected with CTRL-click or CMD-click', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `Range members can be un-selected with CTRL-click or CMD-click setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            ├── ag-Grid-AutoColumn "Athlete" width:200
                            ├── age "Age" width:200
                            ├── year "Year" width:200
                            └── date "Date" width:200
                        `);
                    await new GridRows(api, `Range members can be un-selected with CTRL-click or CMD-click setup`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                            │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                            │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                            │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                            │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                            │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                            │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                            ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                            │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                            │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                            │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                            ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                            │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                            ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                            │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                            ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                            │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                            · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                        `);

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 4], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([1, 2, 4], api);

                    actions.toggleCheckboxByIndex(2, { ctrlKey: true });
                    assertSelectedRowsByIndex([1, 4], api);
                    await new GridRows(api, `Range members can be un-selected with CTRL-click or CMD-click final state`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                            │ ├─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                            │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                            │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                            │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                            │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                            │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                            ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                            │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                            │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                            │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                            ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                            │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                            ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                            │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                            ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                            │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                            · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                        `);
                });

                test('Range members can be un-selected with toggle', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `Range members can be un-selected with toggle setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        ├── ag-Grid-AutoColumn "Athlete" width:200
                        ├── age "Age" width:200
                        ├── year "Year" width:200
                        └── date "Date" width:200
                    `);
                    await new GridRows(api, `Range members can be un-selected with toggle setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 4], api);

                    actions.toggleCheckboxByIndex(3);
                    assertSelectedRowsByIndex([1, 2, 4], api);
                    await new GridRows(api, `Range members can be un-selected with toggle final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);
                });

                test('Range is extended downwards from selection root', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `Range is extended downwards from selection root setup`).checkColumns(
                        `
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            ├── ag-Grid-AutoColumn "Athlete" width:200
                            ├── age "Age" width:200
                            ├── year "Year" width:200
                            └── date "Date" width:200
                        `
                    );
                    await new GridRows(api, `Range is extended downwards from selection root setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4], api);

                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);
                    await new GridRows(api, `Range is extended downwards from selection root final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF selected id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);
                });

                test('Range is extended upwards from selection root', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `Range is extended upwards from selection root setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        ├── ag-Grid-AutoColumn "Athlete" width:200
                        ├── age "Age" width:200
                        ├── year "Year" width:200
                        └── date "Date" width:200
                    `);
                    await new GridRows(api, `Range is extended upwards from selection root setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);

                    actions.toggleCheckboxByIndex(6);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([6, 4, 5], api);

                    actions.toggleCheckboxByIndex(2, { shiftKey: true });
                    assertSelectedRowsByIndex([6, 4, 5, 2, 3], api);
                    await new GridRows(api, `Range is extended upwards from selection root final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF selected id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);
                });

                test('Range can be inverted', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `Range can be inverted setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        ├── ag-Grid-AutoColumn "Athlete" width:200
                        ├── age "Age" width:200
                        ├── year "Year" width:200
                        └── date "Date" width:200
                    `);
                    await new GridRows(api, `Range can be inverted setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);

                    actions.toggleCheckboxByIndex(4);
                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([4, 5, 6], api);

                    actions.toggleCheckboxByIndex(2, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4], api);
                    await new GridRows(api, `Range can be inverted final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);
                });

                test('META+SHIFT-click within range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `META+SHIFT-click within range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            ├── ag-Grid-AutoColumn "Athlete" width:200
                            ├── age "Age" width:200
                            ├── year "Year" width:200
                            └── date "Date" width:200
                        `);
                    await new GridRows(api, `META+SHIFT-click within range allows batch deselection setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    actions.toggleCheckboxByIndex(5, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([2, 6], api);
                    await new GridRows(api, `META+SHIFT-click within range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                            │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                            │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF selected id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                            │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                            │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                            │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                            │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                            ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                            │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                            │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                            │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                            ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                            │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                            ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                            │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                            ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                            │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                            · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                        `
                    );
                });

                test('META+SHIFT-click below range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `META+SHIFT-click below range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            ├── ag-Grid-AutoColumn "Athlete" width:200
                            ├── age "Age" width:200
                            ├── year "Year" width:200
                            └── date "Date" width:200
                        `);
                    await new GridRows(api, `META+SHIFT-click below range allows batch deselection setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.toggleCheckboxByIndex(6, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([2], api);
                    await new GridRows(api, `META+SHIFT-click below range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                            │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                            │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                            │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                            │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                            │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                            │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                            ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                            │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                            │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                            │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                            ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                            │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                            ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                            │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                            ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                            │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                            · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                        `
                    );
                });

                test('META+SHIFT-click above range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `META+SHIFT-click above range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            ├── ag-Grid-AutoColumn "Athlete" width:200
                            ├── age "Age" width:200
                            ├── year "Year" width:200
                            └── date "Date" width:200
                        `);
                    await new GridRows(api, `META+SHIFT-click above range allows batch deselection setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.toggleCheckboxByIndex(1, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([4, 5], api);
                    await new GridRows(api, `META+SHIFT-click above range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                            │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                            │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                            │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                            │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                            │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                            │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                            ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                            │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                            │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                            │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                            ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                            │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                            ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                            │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                            ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                            │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                            · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                        `
                    );
                });

                test('CTRL+SHIFT-click within range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `CTRL+SHIFT-click within range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            ├── ag-Grid-AutoColumn "Athlete" width:200
                            ├── age "Age" width:200
                            ├── year "Year" width:200
                            └── date "Date" width:200
                        `);
                    await new GridRows(api, `CTRL+SHIFT-click within range allows batch deselection setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    actions.toggleCheckboxByIndex(5, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2, 6], api);
                    await new GridRows(api, `CTRL+SHIFT-click within range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                            │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                            │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF selected id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                            │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                            │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                            │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                            │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                            ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                            │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                            │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                            │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                            ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                            │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                            ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                            │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                            ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                            │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                            · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                        `
                    );
                });

                test('CTRL+SHIFT-click below range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `CTRL+SHIFT-click below range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            ├── ag-Grid-AutoColumn "Athlete" width:200
                            ├── age "Age" width:200
                            ├── year "Year" width:200
                            └── date "Date" width:200
                        `);
                    await new GridRows(api, `CTRL+SHIFT-click below range allows batch deselection setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.toggleCheckboxByIndex(6, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2], api);
                    await new GridRows(api, `CTRL+SHIFT-click below range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                            │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                            │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                            │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                            │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                            │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                            │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                            ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                            │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                            │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                            │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                            ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                            │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                            ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                            │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                            ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                            │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                            · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                        `
                    );
                });

                test('CTRL+SHIFT-click above range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `CTRL+SHIFT-click above range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            ├── ag-Grid-AutoColumn "Athlete" width:200
                            ├── age "Age" width:200
                            ├── year "Year" width:200
                            └── date "Date" width:200
                        `);
                    await new GridRows(api, `CTRL+SHIFT-click above range allows batch deselection setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.toggleCheckboxByIndex(1, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([4, 5], api);
                    await new GridRows(api, `CTRL+SHIFT-click above range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                            │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                            │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                            │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                            │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                            │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                            │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                            ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                            │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                            │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                            │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                            ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                            │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                            ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                            │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                            ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                            │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                            · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                        `
                    );
                });

                test('CTRL+SHIFT-click selects range if root is selected', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `CTRL+SHIFT-click selects range if root is selected setup`).checkColumns(
                        `
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            ├── ag-Grid-AutoColumn "Athlete" width:200
                            ├── age "Age" width:200
                            ├── year "Year" width:200
                            └── date "Date" width:200
                        `
                    );
                    await new GridRows(api, `CTRL+SHIFT-click selects range if root is selected setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);
                    await new GridRows(api, `CTRL+SHIFT-click selects range if root is selected final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);
                });

                test('CTRL/META+SHIFT-click with null selection root is no-op', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `CTRL/META+SHIFT-click with null selection root is no-op setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            ├── ag-Grid-AutoColumn "Athlete" width:200
                            ├── age "Age" width:200
                            ├── year "Year" width:200
                            └── date "Date" width:200
                        `);
                    await new GridRows(api, `CTRL/META+SHIFT-click with null selection root is no-op setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);

                    actions.toggleCheckboxByIndex(2, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([], api);

                    actions.toggleCheckboxByIndex(2, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([], api);
                    await new GridRows(api, `CTRL/META+SHIFT-click with null selection root is no-op final state`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                            │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                            │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                            │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                            │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                            │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                            │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                            ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                            │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                            │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                            │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                            │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                            ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                            │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                            │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                            ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                            │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                            ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                            │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                            · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                        `);
                });
            });
        });
    });

    describe('Cell Renderer', () => {
        class CustomCellRenderer {
            eGui: HTMLElement;
            eButton: HTMLElement;
            eventListener: () => void;

            init(params: any) {
                this.eGui = document.createElement('div');
                const eButton = (this.eButton = document.createElement('button'));
                eButton.className = `btn-${params.data.sport}`;
                eButton.textContent = String(params.value);
                this.eventListener = () => {
                    params.setValue('foo');
                };
                eButton.addEventListener('click', this.eventListener);
                this.eGui.appendChild(eButton);
            }

            getGui() {
                return this.eGui;
            }

            refresh(params: any) {
                // Returning `true` tells the grid we've handled the value change in-place;
                // the DOM must therefore actually reflect the new value, otherwise the cell's
                // text stays stale even though `api.getCellValue` returns the new value.
                this.eButton.textContent = String(params.value);
                return true;
            }

            destroy() {
                this.eButton?.removeEventListener('click', this.eventListener);
            }
        }

        test('selectable refreshed when changing cell value', async () => {
            const [api] = await createGridAndWait({
                columnDefs: [
                    { field: 'sport', cellRenderer: CustomCellRenderer },
                    { field: 'unrelated', editable: true },
                ],
                rowData: structuredClone(rowData),
                rowSelection: { mode: 'multiRow', isRowSelectable: (node) => node.data?.sport !== 'foo' },
            });
            await new GridColumns(api, `selectable refreshed when changing cell value setup`).checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── sport "Sport" width:200
                └── unrelated "Unrelated" width:200 editable
            `);
            await new GridRows(api, `selectable refreshed when changing cell value setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football"
                ├── LEAF id:1 sport:"rugby"
                ├── LEAF id:2 sport:"tennis"
                ├── LEAF id:3 sport:"cricket"
                ├── LEAF id:4 sport:"golf"
                ├── LEAF id:5 sport:"swimming"
                └── LEAF id:6 sport:"rowing"
            `);

            assertSelectableByIndex([0, 1, 2, 3, 4, 5, 6], api);

            document.querySelector<HTMLButtonElement>('.btn-rugby')?.click();

            assertSelectableByIndex([0, 2, 3, 4, 5, 6], api);
            await new GridRows(api, `selectable refreshed when changing cell value final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football"
                ├── LEAF 🚫 id:1 sport:"foo"
                ├── LEAF id:2 sport:"tennis"
                ├── LEAF id:3 sport:"cricket"
                ├── LEAF id:4 sport:"golf"
                ├── LEAF id:5 sport:"swimming"
                └── LEAF id:6 sport:"rowing"
            `);
        });

        test('pinned rows mirror selectable status of their siblings reactively', async () => {
            const [api] = await createGridAndWait(
                {
                    columnDefs: [
                        { field: 'sport', cellRenderer: CustomCellRenderer },
                        { field: 'unrelated', editable: true },
                    ],
                    rowData: structuredClone(rowData),
                    rowSelection: {
                        mode: 'multiRow',
                        isRowSelectable: (node) => (node.rowPinned ? true : node.data?.sport !== 'foo'),
                    },
                    enableRowPinning: true,
                },
                { modules: [RowSelectionModule, PinnedRowModule] }
            );
            await new GridColumns(api, `pinned rows mirror selectable status of their siblings reactively setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── sport "Sport" width:200
                    └── unrelated "Unrelated" width:200 editable
                `);
            await new GridRows(api, `pinned rows mirror selectable status of their siblings reactively setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `
            );

            assertSelectableByIndex([0, 1, 2, 3, 4, 5, 6], api);

            const btn = document.querySelector<HTMLButtonElement>('.btn-rugby');

            api.setGridOption('isRowPinned', (node) => (node.data?.sport === 'rugby' ? 'top' : null));
            await nextAnimationFrame();
            await nextAnimationFrame();
            await new GridColumns(
                api,
                `pinned rows mirror selectable status of their siblings reactively after setGridOption isRowPinned`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── sport "Sport" width:200
                └── unrelated "Unrelated" width:200 editable
            `);
            await new GridRows(
                api,
                `pinned rows mirror selectable status of their siblings reactively after setGridOption isRowPinned`
            ).check(`
                PINNED_TOP id:t-top-1 sport:"rugby"
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football"
                ├── LEAF id:1 sport:"rugby"
                ├── LEAF id:2 sport:"tennis"
                ├── LEAF id:3 sport:"cricket"
                ├── LEAF id:4 sport:"golf"
                ├── LEAF id:5 sport:"swimming"
                └── LEAF id:6 sport:"rowing"
            `);

            btn?.click();

            await asyncSetTimeout(5);

            assertSelectableByIndex([0, 2, 3, 4, 5, 6], api);

            api.forEachPinnedRow('top', (node) => expect(node.selectable).toBe(false));
        });
    });
});
