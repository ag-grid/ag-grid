import { GridColumns, GridRows, TestGridsManager, assertSelectedRowsByIndex } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    InfiniteRowModelModule,
    PaginationModule,
    QuickFilterModule,
    RowSelectionModule,
    enableDevValidations,
} from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelModule, ViewportRowModelModule } from 'ag-grid-enterprise';

import { GridActions } from './utils';

describe('Row Selection Legacy Grid Options', () => {
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

    function createGrid(gridOptions: GridOptions): [GridApi, GridActions] {
        const api = gridMgr.createGrid('myGrid', gridOptions);
        consoleWarnSpy.mockClear();
        const actions = new GridActions(api, '#myGrid');
        return [api, actions];
    }

    const gridMgr = new TestGridsManager({
        modules: [
            RowSelectionModule,
            ClientSideRowModelModule,
            ServerSideRowModelModule,
            ViewportRowModelModule,
            InfiniteRowModelModule,
            RowGroupingModule,
            PaginationModule,
            QuickFilterModule,
        ],
    });

    beforeEach(() => {
        // This file exercises deprecated selection options on purpose; the global throw-on-validation must be off here.
        enableDevValidations({ throwOn: [] });

        gridMgr.reset();

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        gridMgr.reset();

        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    describe('User Interactions', () => {
        describe('Single Row Selection', () => {
            test('Select single row', async () => {
                const [api, actions] = createGrid({ columnDefs, rowData, rowSelection: 'single' });
                await new GridColumns(api, `Select single row setup`).checkColumns(`
                    CENTER
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

                actions.clickRowByIndex(2);

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
                const [api, actions] = createGrid({ columnDefs, rowData, rowSelection: 'single' });

                actions.clickRowByIndex(2);
                actions.clickRowByIndex(5);

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
                const [api, actions] = createGrid({ columnDefs, rowData, rowSelection: 'single' });

                actions.clickRowByIndex(2);
                actions.clickRowByIndex(5, { shiftKey: true });

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
                const [api, actions] = createGrid({ columnDefs, rowData, rowSelection: 'single' });

                actions.clickRowByIndex(2);
                actions.clickRowByIndex(5, { metaKey: true });

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

            test('suppressRowClickSelection prevents row from being selected when clicked', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: 'single',
                    suppressRowClickSelection: true,
                });

                actions.clickRowByIndex(2);

                assertSelectedRowsByIndex([], api);
                await new GridRows(
                    api,
                    `suppressRowClickSelection prevents row from being selected when clicked final state`
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

            test('un-selectable row cannot be selected', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: 'single',
                    isRowSelectable: (node) => node.data?.sport !== 'football',
                });
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

                actions.clickRowByIndex(0);
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
        });

        describe('Multiple Row Selection', () => {
            test('un-selectable row cannot be selected', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: 'multiple',
                    isRowSelectable: (node) => node.data?.sport !== 'football',
                });

                actions.clickRowByIndex(0);
                assertSelectedRowsByIndex([], api);

                actions.clickRowByIndex(0, { metaKey: true });
                assertSelectedRowsByIndex([], api);

                actions.clickRowByIndex(0, { ctrlKey: true });
                assertSelectedRowsByIndex([], api);

                actions.clickRowByIndex(0, { shiftKey: true });
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

            test('suppressRowClickSelection prevents clicks from clearing selection state', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: 'multiple',
                    suppressRowClickSelection: true,
                });

                const nodes = api.getRenderedNodes();
                api.setNodesSelected({ nodes: [nodes[2], nodes[3]], newValue: true });
                assertSelectedRowsByIndex([2, 3], api);

                actions.clickRowByIndex(3);

                // Both rows should still be selected
                assertSelectedRowsByIndex([2, 3], api);
                await new GridRows(
                    api,
                    `suppressRowClickSelection prevents clicks from clearing selection state final state`
                ).check(`
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

            test('row-click interaction with multiple selected rows', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: 'multiple',
                });

                const nodes = api.getRenderedNodes();
                api.setNodesSelected({ nodes: [nodes[2], nodes[3]], newValue: true });
                assertSelectedRowsByIndex([2, 3], api);

                actions.clickRowByIndex(3);

                // Both rows should still be selected
                assertSelectedRowsByIndex([3], api);
                await new GridRows(api, `row-click interaction with multiple selected rows final state`).check(`
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

            describe('Range selection behaviour', () => {
                test('CTRL-click and CMD-click selects multiple rows', async () => {
                    const [api, actions] = createGrid({ columnDefs, rowData, rowSelection: 'multiple' });

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

                test('Single click after multiple selection clears previous selection', async () => {
                    const [api, actions] = createGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                    actions.selectRowsByIndex([1, 3, 5], true);

                    actions.clickRowByIndex(2);

                    assertSelectedRowsByIndex([2], api);
                    await new GridRows(
                        api,
                        `Single click after multiple selection clears previous selection final state`
                    ).check(`
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

                test('SHIFT-click selects range of rows', async () => {
                    const [api, actions] = createGrid({ columnDefs, rowData, rowSelection: 'multiple' });

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
                    const [api, actions] = createGrid({ columnDefs, rowData, rowSelection: 'multiple' });

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
                    const [api, actions] = createGrid({ columnDefs, rowData, rowSelection: 'multiple' });

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
                    const [api, actions] = createGrid({ columnDefs, rowData, rowSelection: 'multiple' });

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
                    const [api, actions] = createGrid({ columnDefs, rowData, rowSelection: 'multiple' });

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
                    const [api, actions] = createGrid({ columnDefs, rowData, rowSelection: 'multiple' });

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
                    const [api, actions] = createGrid({ columnDefs, rowData, rowSelection: 'multiple' });

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
                    const [api, actions] = createGrid({ columnDefs, rowData, rowSelection: 'multiple' });

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
                    const [api, actions] = createGrid({ columnDefs, rowData, rowSelection: 'multiple' });

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
            });
        });

        describe('Multiple Row Selection with Click', () => {
            test('Select multiple rows without modifier keys', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: 'multiple',
                    rowMultiSelectWithClick: true,
                });

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
                    rowSelection: 'multiple',
                    rowMultiSelectWithClick: true,
                });

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
        });
    });

    describe('Selection API', () => {
        describe('setNodesSelected', () => {
            test('Select single row in single selection mode', async () => {
                const [api] = createGrid({ columnDefs, rowData, rowSelection: 'single' });
                await new GridColumns(api, `Select single row in single selection mode setup`).checkColumns(`
                    CENTER
                    └── sport "Sport" width:200
                `);

                const nodes = api.getRenderedNodes();
                const toSelect = [nodes[3]];
                api.setNodesSelected({ nodes: toSelect, newValue: true });

                const selectedNodes = api.getSelectedNodes();

                expect(selectedNodes).toHaveLength(1);
                expect(selectedNodes[0]).toBe(toSelect[0]);
                await new GridRows(api, `Select single row in single selection mode final state`).check(`
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

            test('Select single row in multiple selection mode', async () => {
                const [api] = createGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                const nodes = api.getRenderedNodes();
                const toSelect = [nodes[3]];
                api.setNodesSelected({ nodes: toSelect, newValue: true });

                const selectedNodes = api.getSelectedNodes();
                expect(selectedNodes).toHaveLength(1);
                expect(selectedNodes[0]).toBe(toSelect[0]);
                await new GridRows(api, `Select single row in multiple selection mode final state`).check(`
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

            test('Cannot select multiple rows in single selection mode', async () => {
                const [api] = createGrid({ columnDefs, rowData, rowSelection: 'single' });

                const nodes = api.getRenderedNodes();
                const toSelect = [nodes[0], nodes[3], nodes[1]];
                api.setNodesSelected({ nodes: toSelect, newValue: true });

                const selectedNodes = api.getSelectedNodes();

                expect(selectedNodes).toHaveLength(0);
                expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
                await new GridRows(api, `Cannot select multiple rows in single selection mode final state`).check(`
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

            test('Can select multiple rows in multiple selection mode', async () => {
                const [api] = createGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                const nodes = api.getRenderedNodes();
                const toSelect = [nodes[5], nodes[4], nodes[2]];
                api.setNodesSelected({ nodes: toSelect, newValue: true });

                const selectedNodes = api.getSelectedNodes();
                expect(selectedNodes).toHaveLength(3);
                await new GridRows(api, `Can select multiple rows in multiple selection mode final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF selected id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF selected id:4 sport:"golf"
                    ├── LEAF selected id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });
        });

        describe('selectAll', () => {
            test('Can select all rows in single selection mode', async () => {
                const [api] = createGrid({ columnDefs, rowData, rowSelection: 'single' });

                api.selectAll();

                expect(api.getSelectedNodes().length).toBe(rowData.length);
                expect(consoleWarnSpy).not.toHaveBeenCalled();

                api.deselectAll();
                expect(api.getSelectedNodes().length).toBe(0);
                await new GridRows(api, `Can select all rows in single selection mode final state`).check(`
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

            test('Can select all rows in multiple selection mode', async () => {
                const [api] = createGrid({ columnDefs, rowData, rowSelection: 'multiple' });

                api.selectAll();

                expect(api.getSelectedNodes().length).toBe(rowData.length);

                api.deselectAll();
                expect(api.getSelectedNodes().length).toBe(0);
                await new GridRows(api, `Can select all rows in multiple selection mode final state`).check(`
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
        });
    });
});
