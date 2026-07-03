import type { MockInstance } from 'vitest';

import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    InfiniteRowModelModule,
    PaginationModule,
    QuickFilterModule,
    RowSelectionModule,
} from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelModule, ViewportRowModelModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, assertSelectedRowsByIndex, waitForEvent } from '../test-utils';
import { GROUP_ROW_DATA } from './group-data';
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

    async function createGridAndWait(gridOptions: GridOptions): Promise<[GridApi, GridActions]> {
        const [api, actions] = createGrid(gridOptions);

        await waitForEvent('firstDataRendered', api);

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
                await new GridColumns(api, `Clicking two rows selects only the last clicked row setup`).checkColumns(
                    `
                        CENTER
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
                await new GridColumns(
                    api,
                    `SHIFT-click doesn't select multiple rows in single row selection mode setup`
                ).checkColumns(`
                    CENTER
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
                await new GridColumns(api, `CTRL-click doesn't select multiple rows in single row selection mode setup`)
                    .checkColumns(`
                        CENTER
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
                await new GridColumns(
                    api,
                    `suppressRowClickSelection prevents row from being selected when clicked setup`
                ).checkColumns(`
                    CENTER
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `suppressRowClickSelection prevents row from being selected when clicked setup`)
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
                await new GridColumns(api, `un-selectable row cannot be selected setup`).checkColumns(`
                    CENTER
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
                await new GridColumns(api, `un-selectable row cannot be selected setup`).checkColumns(`
                    CENTER
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
                    columnDefs: columnDefs.map((c, i) => (i === 0 ? { ...c, checkboxSelection: true } : c)),
                    rowData,
                    rowSelection: 'multiple',
                    suppressRowClickSelection: true,
                });
                await new GridColumns(
                    api,
                    `suppressRowClickSelection prevents clicks from clearing selection state setup`
                ).checkColumns(`
                    CENTER
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `suppressRowClickSelection prevents clicks from clearing selection state setup`)
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

                // Select two rows by toggling checkboxes
                actions.selectRowsByIndex([2, 3], false);

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
                    columnDefs: columnDefs.map((c, i) => (i === 0 ? { ...c, checkboxSelection: true } : c)),
                    rowData,
                    rowSelection: 'multiple',
                });
                await new GridColumns(api, `row-click interaction with multiple selected rows setup`).checkColumns(`
                    CENTER
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
                    await new GridColumns(api, `CTRL-click and CMD-click selects multiple rows setup`).checkColumns(`
                        CENTER
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

                test('Single click after multiple selection clears previous selection', async () => {
                    const [api, actions] = createGrid({ columnDefs, rowData, rowSelection: 'multiple' });
                    await new GridColumns(api, `Single click after multiple selection clears previous selection setup`)
                        .checkColumns(`
                            CENTER
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `Single click after multiple selection clears previous selection setup`)
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
                    await new GridColumns(api, `SHIFT-click selects range of rows setup`).checkColumns(`
                        CENTER
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
                    const [api, actions] = createGrid({ columnDefs, rowData, rowSelection: 'multiple' });
                    await new GridColumns(api, `SHIFT-click extends range downwards from from last selected row setup`)
                        .checkColumns(`
                            CENTER
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
                    const [api, actions] = createGrid({ columnDefs, rowData, rowSelection: 'multiple' });
                    await new GridColumns(api, `SHIFT-click extends range upwards from from last selected row setup`)
                        .checkColumns(`
                            CENTER
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
                    const [api, actions] = createGrid({ columnDefs, rowData, rowSelection: 'multiple' });
                    await new GridColumns(api, `SHIFT-click on un-selected table selects only clicked row setup`)
                        .checkColumns(`
                            CENTER
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
                    const [api, actions] = createGrid({ columnDefs, rowData, rowSelection: 'multiple' });
                    await new GridColumns(api, `Range selection is preserved on CTRL-click and CMD-click setup`)
                        .checkColumns(`
                            CENTER
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
                    const [api, actions] = createGrid({ columnDefs, rowData, rowSelection: 'multiple' });
                    await new GridColumns(api, `Range members can be un-selected with CTRL-click or CMD-click setup`)
                        .checkColumns(`
                            CENTER
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
                    const [api, actions] = createGrid({ columnDefs, rowData, rowSelection: 'multiple' });
                    await new GridColumns(api, `Range is extended downwards from selection root setup`).checkColumns(
                        `
                            CENTER
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
                    const [api, actions] = createGrid({ columnDefs, rowData, rowSelection: 'multiple' });
                    await new GridColumns(api, `Range is extended upwards from selection root setup`).checkColumns(`
                        CENTER
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
                    const [api, actions] = createGrid({ columnDefs, rowData, rowSelection: 'multiple' });
                    await new GridColumns(api, `Range can be inverted setup`).checkColumns(`
                        CENTER
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
                await new GridColumns(api, `Select multiple rows without modifier keys setup`).checkColumns(`
                    CENTER
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
                    rowSelection: 'multiple',
                    rowMultiSelectWithClick: true,
                });
                await new GridColumns(api, `De-select row with click setup`).checkColumns(`
                    CENTER
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
        });

        describe('Checkbox selection', () => {
            test('Checkbox can be toggled on and off', async () => {
                const [api, actions] = createGrid({
                    columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                    rowData,
                    rowSelection: 'multiple',
                });
                await new GridColumns(api, `Checkbox can be toggled on and off setup`).checkColumns(`
                    CENTER
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
                    columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                    rowData,
                    rowSelection: 'multiple',
                });
                await new GridColumns(
                    api,
                    `Multiple rows can be selected without modifier keys nor rowMultiSelectWithClick setup`
                ).checkColumns(`
                    CENTER
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

            test('Clicking a row still selects it when `suppressRowClickSelection` is false', async () => {
                const [api, actions] = createGrid({
                    columnDefs: columnDefs.map((d) => ({
                        ...d,
                        checkboxSelection: true,
                        showDisabledCheckboxes: true,
                    })),
                    rowData,
                    rowSelection: 'multiple',
                });
                await new GridColumns(
                    api,
                    `Clicking a row still selects it when _suppressRowClickSelection_ is false setup`
                ).checkColumns(`
                    CENTER
                    └── sport "Sport" width:200
                `);
                await new GridRows(
                    api,
                    `Clicking a row still selects it when _suppressRowClickSelection_ is false setup`
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

                // click, not toggle
                actions.clickRowByIndex(1);
                assertSelectedRowsByIndex([1], api);

                // toggle, not click, to assert inter-op
                actions.toggleCheckboxByIndex(1);
                assertSelectedRowsByIndex([], api);
                await new GridRows(
                    api,
                    `Clicking a row still selects it when _suppressRowClickSelection_ is false final state`
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

            test('Clicking a row does nothing when `suppressRowClickSelection` is true', async () => {
                const [api, actions] = createGrid({
                    columnDefs: columnDefs.map((d) => ({
                        ...d,
                        checkboxSelection: true,
                        showDisabledCheckboxes: true,
                    })),
                    rowData,
                    rowSelection: 'multiple',
                    suppressRowClickSelection: true,
                });
                await new GridColumns(api, `Clicking a row does nothing when _suppressRowClickSelection_ is true setup`)
                    .checkColumns(`
                        CENTER
                        └── sport "Sport" width:200
                    `);
                await new GridRows(api, `Clicking a row does nothing when _suppressRowClickSelection_ is true setup`)
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

                // click, not toggle
                actions.clickRowByIndex(1);
                assertSelectedRowsByIndex([], api);
                await new GridRows(
                    api,
                    `Clicking a row does nothing when _suppressRowClickSelection_ is true final state`
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

            test('Un-selectable checkboxes cannot be toggled', async () => {
                const [api, actions] = createGrid({
                    columnDefs: columnDefs.map((d) => ({
                        ...d,
                        checkboxSelection: true,
                        showDisabledCheckboxes: true,
                    })),
                    rowData,
                    rowSelection: 'multiple',
                    isRowSelectable: (node) => node.data?.sport !== 'golf',
                });
                await new GridColumns(api, `Un-selectable checkboxes cannot be toggled setup`).checkColumns(`
                    CENTER
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
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });
                    await new GridColumns(
                        api,
                        `CTRL-click and CMD-click does not affect ability to select multiple rows setup`
                    ).checkColumns(`
                        CENTER
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
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });
                    await new GridColumns(api, `SHIFT-click selects range of rows setup`).checkColumns(`
                        CENTER
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
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });
                    await new GridColumns(api, `SHIFT-click extends range downwards from from last selected row setup`)
                        .checkColumns(`
                            CENTER
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
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });
                    await new GridColumns(api, `SHIFT-click extends range upwards from from last selected row setup`)
                        .checkColumns(`
                            CENTER
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
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });
                    await new GridColumns(api, `SHIFT-click on un-selected table selects only clicked row setup`)
                        .checkColumns(`
                            CENTER
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
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });
                    await new GridColumns(api, `Range selection is preserved on CTRL-click and CMD-click setup`)
                        .checkColumns(`
                            CENTER
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
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });
                    await new GridColumns(api, `Range selection is preserved on checkbox toggle setup`).checkColumns(
                        `
                            CENTER
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
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });
                    await new GridColumns(api, `Range members can be un-selected with CTRL-click or CMD-click setup`)
                        .checkColumns(`
                            CENTER
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
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });
                    await new GridColumns(api, `Range members can be un-selected with toggle setup`).checkColumns(`
                        CENTER
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
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });
                    await new GridColumns(api, `Range is extended downwards from selection root setup`).checkColumns(
                        `
                            CENTER
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
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });
                    await new GridColumns(api, `Range is extended upwards from selection root setup`).checkColumns(`
                        CENTER
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
                        columnDefs: columnDefs.map((d) => ({ ...d, checkboxSelection: true })),
                        rowData,
                        rowSelection: 'multiple',
                    });
                    await new GridColumns(api, `Range can be inverted setup`).checkColumns(`
                        CENTER
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
            });
        });

        describe('Header checkbox selection', () => {
            test('can be used to select and deselect all rows', async () => {
                const [api, actions] = createGrid({
                    columnDefs: columnDefs.map((d) => ({ ...d, headerCheckboxSelection: true })),
                    rowData,
                    rowSelection: 'multiple',
                });
                await new GridColumns(api, `can be used to select and deselect all rows setup`).checkColumns(`
                    CENTER
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
                    columnDefs: columnDefs.map((d) => ({ ...d, headerCheckboxSelection: true })),
                    rowData,
                    rowSelection: 'multiple',
                    pagination: true,
                    paginationPageSize: 5,
                });
                await new GridColumns(api, `can select multiple pages of data setup`).checkColumns(`
                    CENTER
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
                    columnDefs: columnDefs.map((d) => ({
                        ...d,
                        headerCheckboxSelection: true,
                        headerCheckboxSelectionCurrentPageOnly: true,
                    })),
                    rowData,
                    rowSelection: 'multiple',
                    pagination: true,
                    paginationPageSize: 5,
                });
                await new GridColumns(api, `can select only current page of data setup`).checkColumns(`
                    CENTER
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
                    columnDefs: columnDefs.map((d) => ({
                        ...d,
                        headerCheckboxSelection: true,
                        headerCheckboxSelectionFilteredOnly: true,
                    })),
                    rowData,
                    rowSelection: 'multiple',
                    pagination: true,
                    paginationPageSize: 5,
                });
                await new GridColumns(api, `can select only filtered data setup`).checkColumns(`
                    CENTER
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
                    columnDefs: columnDefs.map((d) => ({
                        ...d,
                        headerCheckboxSelection: true,
                    })),
                    rowData,
                    rowSelection: 'multiple',
                });
                await new GridColumns(api, `indeterminate selection state transitions to select all setup`)
                    .checkColumns(`
                        CENTER
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

                actions.selectRowsByIndex([3], true);

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
                    columnDefs: columnDefs.map((d) => ({
                        ...d,
                        headerCheckboxSelection: true,
                    })),
                    rowData,
                    rowSelection: 'multiple',
                    isRowSelectable: (node) => node.data?.sport !== 'football',
                });
                await new GridColumns(api, `un-selectable rows are not part of the selection setup`).checkColumns(`
                    CENTER
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
        });

        // Skipped because tests in this block fail on an intermittent basis on CI with no obvious cause
        // and no easy way to diagnose, since they pass consistently locally. To be investigated.
        describe.skip('Group checkbox selection', () => {
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
                    cellRendererParams: {
                        checkbox: true,
                    },
                },
                rowData: GROUP_ROW_DATA,
                groupDefaultExpanded: -1,
            };

            test('clicking group row selects only that row', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: 'multiple',
                });
                await new GridColumns(api, `clicking group row selects only that row setup`).checkColumns(``);
                await new GridRows(api, `clicking group row selects only that row setup`).check(``);

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([0], api);
                await new GridRows(api, `clicking group row selects only that row final state`).check(``);
            });

            test('clicking group row with `groupSelectsChildren` enabled selects that row and all its children', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: 'multiple',
                    groupSelectsChildren: true,
                });
                await new GridColumns(
                    api,
                    `clicking group row with _groupSelectsChildren_ enabled selects that row and all  setup`
                ).checkColumns(``);
                await new GridRows(
                    api,
                    `clicking group row with _groupSelectsChildren_ enabled selects that row and all  setup`
                ).check(``);

                // Group selects children
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13], api);

                // Can un-select child row
                actions.toggleCheckboxByIndex(4);
                assertSelectedRowsByIndex([2, 3, 5, 6, 7, 8, 9, 10, 11, 13], api);

                // Toggling group row from indeterminate state selects all children
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([2, 3, 5, 6, 7, 8, 9, 10, 11, 13, 4], api);

                // Toggle group row again de-selects all children
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([], api);
                await new GridRows(
                    api,
                    `clicking group row with _groupSelectsChildren_ enabled selects that row and all  final state`
                ).check(``);
            });

            describe('Range selection behaviour', () => {
                test('CTRL-click and CMD-click does not affect ability to select multiple rows', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });
                    await new GridColumns(
                        api,
                        `CTRL-click and CMD-click does not affect ability to select multiple rows setup`
                    ).checkColumns(``);
                    await new GridRows(
                        api,
                        `CTRL-click and CMD-click does not affect ability to select multiple rows setup`
                    ).check(``);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { metaKey: true });
                    actions.toggleCheckboxByIndex(3, { ctrlKey: true });

                    assertSelectedRowsByIndex([2, 5, 3], api);
                    await new GridRows(
                        api,
                        `CTRL-click and CMD-click does not affect ability to select multiple rows final state`
                    ).check(``);
                });

                test('SHIFT-click selects range of rows', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });
                    await new GridColumns(api, `SHIFT-click selects range of rows setup`).checkColumns(``);
                    await new GridRows(api, `SHIFT-click selects range of rows setup`).check(``);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 3, 4, 5], api);
                    await new GridRows(api, `SHIFT-click selects range of rows final state`).check(``);
                });

                test('SHIFT-click extends range downwards from from last selected row', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });
                    await new GridColumns(
                        api,
                        `SHIFT-click extends range downwards from from last selected row setup`
                    ).checkColumns(``);
                    await new GridRows(
                        api,
                        `SHIFT-click extends range downwards from from last selected row setup`
                    ).check(``);

                    actions.selectRowsByIndex([1, 3], true);

                    actions.toggleCheckboxByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([1, 3, 4, 5], api);
                    await new GridRows(
                        api,
                        `SHIFT-click extends range downwards from from last selected row final state`
                    ).check(``);
                });

                test('SHIFT-click extends range upwards from from last selected row', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });
                    await new GridColumns(
                        api,
                        `SHIFT-click extends range upwards from from last selected row setup`
                    ).checkColumns(``);
                    await new GridRows(
                        api,
                        `SHIFT-click extends range upwards from from last selected row setup`
                    ).check(``);

                    actions.selectRowsByIndex([2, 4], true);

                    actions.toggleCheckboxByIndex(1, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 4, 1, 3], api);
                    await new GridRows(
                        api,
                        `SHIFT-click extends range upwards from from last selected row final state`
                    ).check(``);
                });

                test('SHIFT-click on un-selected table selects only clicked row', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });
                    await new GridColumns(
                        api,
                        `SHIFT-click on un-selected table selects only clicked row setup`
                    ).checkColumns(``);
                    await new GridRows(api, `SHIFT-click on un-selected table selects only clicked row setup`).check(
                        ``
                    );

                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([4], api);

                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([4, 5, 6], api);
                    await new GridRows(
                        api,
                        `SHIFT-click on un-selected table selects only clicked row final state`
                    ).check(``);
                });

                test('Range selection is preserved on CTRL-click and CMD-click', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });
                    await new GridColumns(
                        api,
                        `Range selection is preserved on CTRL-click and CMD-click setup`
                    ).checkColumns(``);
                    await new GridRows(api, `Range selection is preserved on CTRL-click and CMD-click setup`).check(``);

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(3, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3], api);

                    actions.toggleCheckboxByIndex(5, { metaKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 5], api);
                    await new GridRows(
                        api,
                        `Range selection is preserved on CTRL-click and CMD-click final state`
                    ).check(``);
                });

                test('Range selection is preserved on checkbox toggle', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });
                    await new GridColumns(api, `Range selection is preserved on checkbox toggle setup`).checkColumns(
                        ``
                    );
                    await new GridRows(api, `Range selection is preserved on checkbox toggle setup`).check(``);

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(3, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3], api);

                    actions.toggleCheckboxByIndex(5);
                    assertSelectedRowsByIndex([1, 2, 3, 5], api);
                    await new GridRows(api, `Range selection is preserved on checkbox toggle final state`).check(``);
                });

                test('Range members can be un-selected with CTRL-click or CMD-click', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });
                    await new GridColumns(
                        api,
                        `Range members can be un-selected with CTRL-click or CMD-click setup`
                    ).checkColumns(``);
                    await new GridRows(
                        api,
                        `Range members can be un-selected with CTRL-click or CMD-click setup`
                    ).check(``);

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 4], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([1, 2, 4], api);

                    actions.toggleCheckboxByIndex(2, { ctrlKey: true });
                    assertSelectedRowsByIndex([1, 4], api);
                    await new GridRows(
                        api,
                        `Range members can be un-selected with CTRL-click or CMD-click final state`
                    ).check(``);
                });

                test('Range members can be un-selected with toggle', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });
                    await new GridColumns(api, `Range members can be un-selected with toggle setup`).checkColumns(``);
                    await new GridRows(api, `Range members can be un-selected with toggle setup`).check(``);

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 4], api);

                    actions.toggleCheckboxByIndex(3);
                    assertSelectedRowsByIndex([1, 2, 4], api);
                    await new GridRows(api, `Range members can be un-selected with toggle final state`).check(``);
                });

                test('Range is extended downwards from selection root', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });
                    await new GridColumns(api, `Range is extended downwards from selection root setup`).checkColumns(
                        ``
                    );
                    await new GridRows(api, `Range is extended downwards from selection root setup`).check(``);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4], api);

                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);
                    await new GridRows(api, `Range is extended downwards from selection root final state`).check(``);
                });

                test('Range is extended upwards from selection root', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });
                    await new GridColumns(api, `Range is extended upwards from selection root setup`).checkColumns(``);
                    await new GridRows(api, `Range is extended upwards from selection root setup`).check(``);

                    actions.toggleCheckboxByIndex(6);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([6, 4, 5], api);

                    actions.toggleCheckboxByIndex(2, { shiftKey: true });
                    assertSelectedRowsByIndex([6, 4, 5, 2, 3], api);
                    await new GridRows(api, `Range is extended upwards from selection root final state`).check(``);
                });

                test('Range can be inverted', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: 'multiple',
                    });
                    await new GridColumns(api, `Range can be inverted setup`).checkColumns(``);
                    await new GridRows(api, `Range can be inverted setup`).check(``);

                    actions.toggleCheckboxByIndex(4);
                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([4, 5, 6], api);

                    actions.toggleCheckboxByIndex(2, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4], api);
                    await new GridRows(api, `Range can be inverted final state`).check(``);
                });
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
                await new GridRows(api, `Select single row in single selection mode setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
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
                await new GridColumns(api, `Select single row in multiple selection mode setup`).checkColumns(`
                    CENTER
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `Select single row in multiple selection mode setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

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
                await new GridColumns(api, `Cannot select multiple rows in single selection mode setup`).checkColumns(
                    `
                        CENTER
                        └── sport "Sport" width:200
                    `
                );
                await new GridRows(api, `Cannot select multiple rows in single selection mode setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

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
                await new GridColumns(api, `Can select multiple rows in multiple selection mode setup`).checkColumns(
                    `
                        CENTER
                        └── sport "Sport" width:200
                    `
                );
                await new GridRows(api, `Can select multiple rows in multiple selection mode setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

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
                await new GridColumns(api, `Can select all rows in single selection mode setup`).checkColumns(`
                    CENTER
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `Can select all rows in single selection mode setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

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
                await new GridColumns(api, `Can select all rows in multiple selection mode setup`).checkColumns(`
                    CENTER
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `Can select all rows in multiple selection mode setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

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

        describe('selectAllOnCurrentPage', () => {
            test('Can select all rows on current page in single selection mode', async () => {
                const [api] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: 'single',
                    pagination: true,
                    paginationPageSize: 5,
                });
                await new GridColumns(api, `Can select all rows on current page in single selection mode setup`)
                    .checkColumns(`
                        CENTER
                        └── sport "Sport" width:200
                    `);
                await new GridRows(api, `Can select all rows on current page in single selection mode setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                api.selectAllOnCurrentPage();

                assertSelectedRowsByIndex([0, 1, 2, 3, 4], api);
                expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
                await new GridRows(api, `Can select all rows on current page in single selection mode final state`)
                    .check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF selected id:0 sport:"football"
                        ├── LEAF selected id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF selected id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
            });

            test('Can deselect only rows on current page in single selection mode', async () => {
                const [api] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: 'single',
                    pagination: true,
                    paginationPageSize: 5,
                });
                await new GridColumns(api, `Can deselect only rows on current page in single selection mode setup`)
                    .checkColumns(`
                        CENTER
                        └── sport "Sport" width:200
                    `);
                await new GridRows(api, `Can deselect only rows on current page in single selection mode setup`).check(
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

                api.selectAll();
                api.deselectAllOnCurrentPage();

                assertSelectedRowsByIndex([5, 6], api);
                await new GridRows(api, `Can deselect only rows on current page in single selection mode final state`)
                    .check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF selected id:5 sport:"swimming"
                        └── LEAF selected id:6 sport:"rowing"
                    `);
            });
        });

        describe('selectAllFiltered', () => {
            test('Can select all filtered rows in single selection mode', async () => {
                const [api] = createGrid({ columnDefs, rowData, rowSelection: 'single' });
                await new GridColumns(api, `Can select all filtered rows in single selection mode setup`).checkColumns(
                    `
                        CENTER
                        └── sport "Sport" width:200
                    `
                );
                await new GridRows(api, `Can select all filtered rows in single selection mode setup`).check(`
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
                await new GridColumns(
                    api,
                    `Can select all filtered rows in single selection mode after setGridOption quickFilterText`
                ).checkColumns(`
                    CENTER
                    └── sport "Sport" width:200
                `);
                await new GridRows(
                    api,
                    `Can select all filtered rows in single selection mode after setGridOption quickFilterText`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                api.selectAllFiltered();
                const selectedNodes = api.getSelectedNodes();

                expect(selectedNodes.length).toBe(2);
            });

            test('Can deselect filtered rows only in single selection mode', async () => {
                const [api] = createGrid({ columnDefs, rowData, rowSelection: 'single' });
                await new GridColumns(api, `Can deselect filtered rows only in single selection mode setup`)
                    .checkColumns(`
                        CENTER
                        └── sport "Sport" width:200
                    `);
                await new GridRows(api, `Can deselect filtered rows only in single selection mode setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                api.selectAll();

                api.setGridOption('quickFilterText', 'ing');
                await new GridColumns(
                    api,
                    `Can deselect filtered rows only in single selection mode after setGridOption quickFilterText`
                ).checkColumns(`
                    CENTER
                    └── sport "Sport" width:200
                `);
                await new GridRows(
                    api,
                    `Can deselect filtered rows only in single selection mode after setGridOption quickFilterText`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF selected id:5 sport:"swimming"
                    └── LEAF selected id:6 sport:"rowing"
                `);

                api.deselectAllFiltered();

                api.setGridOption('quickFilterText', '');
                await new GridColumns(
                    api,
                    `Can deselect filtered rows only in single selection mode after setGridOption quickFilterText #2`
                ).checkColumns(`
                    CENTER
                    └── sport "Sport" width:200
                `);
                await new GridRows(
                    api,
                    `Can deselect filtered rows only in single selection mode after setGridOption quickFilterText #2`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF selected id:0 sport:"football"
                    ├── LEAF selected id:1 sport:"rugby"
                    ├── LEAF selected id:2 sport:"tennis"
                    ├── LEAF selected id:3 sport:"cricket"
                    ├── LEAF selected id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                assertSelectedRowsByIndex([0, 1, 2, 3, 4], api);
            });
        });
    });
});
