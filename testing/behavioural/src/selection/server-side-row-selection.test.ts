import type { MockInstance } from 'vitest';

import type { GetRowIdParams, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, RowSelectionModule } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import {
    GridColumns,
    GridRows,
    TestGridsManager,
    assertSelectedRowElementsById,
    assertSelectedRowsByIndex,
    waitForEvent,
} from '../test-utils';
import { fakeFetch } from './group-data';
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
    let consoleErrorSpy: MockInstance;
    let consoleWarnSpy: MockInstance;

    function createGrid(gridOptions: GridOptions): [GridApi, GridActions] {
        const api = gridMgr.createGrid('myGrid', gridOptions);
        const actions = new GridActions(api, '#myGrid');
        return [api, actions];
    }

    async function createGridAndWait(gridOptions: GridOptions): Promise<[GridApi, GridActions]> {
        const [api, actions] = createGrid(gridOptions);

        await waitForEvent('firstDataRendered', api);

        return [api, actions];
    }

    const gridMgr = new TestGridsManager({
        modules: [RowSelectionModule, ClientSideRowModelModule, RowGroupingModule, ServerSideRowModelModule],
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
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowSelection: { mode: 'singleRow' },
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                });
                await new GridColumns(api, `Select single row setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `Select single row setup`).check(`
                    ROOT id:<no-id>
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
                    ROOT id:<no-id>
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
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowSelection: { mode: 'singleRow' },
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                });
                await new GridColumns(api, `Clicking two rows selects only the last clicked row setup`).checkColumns(
                    `
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `
                );
                await new GridRows(api, `Clicking two rows selects only the last clicked row setup`).check(`
                    ROOT id:<no-id>
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
                    ROOT id:<no-id>
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
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowSelection: { mode: 'singleRow' },
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
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
                        ROOT id:<no-id>
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
                    ROOT id:<no-id>
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
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowSelection: { mode: 'singleRow' },
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                });
                await new GridColumns(api, `CTRL-click doesn't select multiple rows in single row selection mode setup`)
                    .checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                await new GridRows(api, `CTRL-click doesn't select multiple rows in single row selection mode setup`)
                    .check(`
                        ROOT id:<no-id>
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
                    ROOT id:<no-id>
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
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowSelection: { mode: 'singleRow' },
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                });
                await new GridColumns(api, `By default, prevents row from being selected when clicked setup`)
                    .checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                await new GridRows(api, `By default, prevents row from being selected when clicked setup`).check(`
                    ROOT id:<no-id>
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
                        ROOT id:<no-id>
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
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowSelection: {
                        mode: 'singleRow',
                        enableClickSelection: true,
                    },
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                });
                await new GridColumns(api, `enableClickSelection allows row to be selected when clicked setup`)
                    .checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                await new GridRows(api, `enableClickSelection allows row to be selected when clicked setup`).check(`
                    ROOT id:<no-id>
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
                        ROOT id:<no-id>
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
            });

            test('enableClickSelection="enableDeselection" allows deselection via CTRL-clicking', async () => {
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowSelection: { mode: 'multiRow', enableClickSelection: 'enableDeselection' },
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                });
                await new GridColumns(
                    api,
                    `enableClickSelection="enableDeselection" allows deselection via CTRL-clicking setup`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(
                    api,
                    `enableClickSelection="enableDeselection" allows deselection via CTRL-clicking setup`
                ).check(`
                    ROOT id:<no-id>
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.toggleCheckboxByIndex(2);
                assertSelectedRowElementsById(['2'], api);

                actions.clickRowByIndex(2, { ctrlKey: true });
                assertSelectedRowsByIndex([], api);
                await new GridRows(
                    api,
                    `enableClickSelection="enableDeselection" allows deselection via CTRL-clicking final state`
                ).check(`
                    ROOT id:<no-id>
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
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowSelection: {
                        mode: 'singleRow',
                        isRowSelectable: (node) => node.data.sport !== 'football',
                    },
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                });
                await new GridColumns(api, `un-selectable row cannot be selected setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `un-selectable row cannot be selected setup`).check(`
                    ROOT id:<no-id>
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
                    ROOT id:<no-id>
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
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: { mode: 'multiRow', isRowSelectable: (node) => node.data.sport !== 'football' },
                });
                await new GridColumns(api, `un-selectable row cannot be selected setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `un-selectable row cannot be selected setup`).check(`
                    ROOT id:<no-id>
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
                    ROOT id:<no-id>
                    ├── LEAF 🚫 id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('row-clicks are ignored by default', async () => {
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: {
                        mode: 'multiRow',
                    },
                });
                await new GridColumns(api, `row-clicks are ignored by default setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `row-clicks are ignored by default setup`).check(`
                    ROOT id:<no-id>
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
                await new GridRows(api, `row-clicks are ignored by default final state`).check(`
                    ROOT id:<no-id>
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF selected id:2 sport:"tennis"
                    ├── LEAF selected id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('row-click on selected row clears previous selection', async () => {
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: {
                        mode: 'multiRow',
                        enableClickSelection: true,
                    },
                });
                await new GridColumns(api, `row-click on selected row clears previous selection setup`).checkColumns(
                    `
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `
                );
                await new GridRows(api, `row-click on selected row clears previous selection setup`).check(`
                    ROOT id:<no-id>
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                // Select two rows by toggling checkboxes
                actions.selectRowsByIndex([1, 3, 5], false);

                actions.clickRowByIndex(3);

                // Both rows should still be selected
                assertSelectedRowsByIndex([3], api);
                await new GridRows(api, `row-click on selected row clears previous selection final state`).check(`
                    ROOT id:<no-id>
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF selected id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('row-click on unselected row clears previous selection', async () => {
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: {
                        mode: 'multiRow',
                        enableClickSelection: true,
                    },
                });
                await new GridColumns(api, `row-click on unselected row clears previous selection setup`).checkColumns(
                    `
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `
                );
                await new GridRows(api, `row-click on unselected row clears previous selection setup`).check(`
                    ROOT id:<no-id>
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                // Select two rows by toggling checkboxes
                actions.selectRowsByIndex([1, 3, 5], false);

                actions.clickRowByIndex(6);

                // Both rows should still be selected
                assertSelectedRowsByIndex([6], api);
                await new GridRows(api, `row-click on unselected row clears previous selection final state`).check(`
                    ROOT id:<no-id>
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF selected id:6 sport:"rowing"
                `);
            });

            test('must de-select with CTRL when `enableClickSelection: true`', async () => {
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
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
                    ROOT id:<no-id>
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
                        ROOT id:<no-id>
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

            describe('Range selection behaviour', () => {
                test('CTRL-click and CMD-click selects multiple rows', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `CTRL-click and CMD-click selects multiple rows setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `CTRL-click and CMD-click selects multiple rows setup`).check(`
                        ROOT id:<no-id>
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
                    await new GridRows(api, `CTRL-click and CMD-click selects multiple rows final state`).check(`
                        ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', enableClickSelection: true },
                    });
                    await new GridColumns(api, `Single click after multiple selection clears previous selection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `Single click after multiple selection clears previous selection setup`)
                        .check(`
                            ROOT id:<no-id>
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
                        ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `SHIFT-click selects range of rows setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `SHIFT-click selects range of rows setup`).check(`
                        ROOT id:<no-id>
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
                        ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `SHIFT-click extends range downwards from from last selected row setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `SHIFT-click extends range downwards from from last selected row setup`)
                        .check(`
                            ROOT id:<no-id>
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
                        ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `SHIFT-click extends range upwards from from last selected row setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `SHIFT-click extends range upwards from from last selected row setup`)
                        .check(`
                            ROOT id:<no-id>
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
                            ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `SHIFT-click on un-selected table selects only clicked row setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `SHIFT-click on un-selected table selects only clicked row setup`).check(
                        `
                            ROOT id:<no-id>
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
                            ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `Range selection is preserved on CTRL-click and CMD-click setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `Range selection is preserved on CTRL-click and CMD-click setup`).check(`
                        ROOT id:<no-id>
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
                            ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `Range members can be un-selected with CTRL-click or CMD-click setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `Range members can be un-selected with CTRL-click or CMD-click setup`)
                        .check(`
                            ROOT id:<no-id>
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
                            ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `Range is extended downwards from selection root setup`).checkColumns(
                        `
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `
                    );
                    await new GridRows(api, `Range is extended downwards from selection root setup`).check(`
                        ROOT id:<no-id>
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
                        ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `Range is extended upwards from selection root setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `Range is extended upwards from selection root setup`).check(`
                        ROOT id:<no-id>
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
                        ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `Range can be inverted setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `Range can be inverted setup`).check(`
                        ROOT id:<no-id>
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
                        ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', enableClickSelection: true },
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
                        ROOT id:<no-id>
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
                        ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', enableClickSelection: true },
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
                        ROOT id:<no-id>
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
                        ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', enableClickSelection: true },
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
                        ROOT id:<no-id>
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
                        ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', enableClickSelection: true },
                    });
                    await new GridColumns(api, `META+SHIFT-click within range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `META+SHIFT-click within range allows batch deselection setup`).check(`
                        ROOT id:<no-id>
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
                            ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', enableClickSelection: true },
                    });
                    await new GridColumns(api, `META+SHIFT-click below range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `META+SHIFT-click below range allows batch deselection setup`).check(`
                        ROOT id:<no-id>
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
                            ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', enableClickSelection: true },
                    });
                    await new GridColumns(api, `META+SHIFT-click above range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `META+SHIFT-click above range allows batch deselection setup`).check(`
                        ROOT id:<no-id>
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
                            ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', enableClickSelection: true },
                    });
                    await new GridColumns(api, `CTRL+SHIFT-click within range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `CTRL+SHIFT-click within range allows batch deselection setup`).check(`
                        ROOT id:<no-id>
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
                            ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', enableClickSelection: true },
                    });
                    await new GridColumns(api, `CTRL+SHIFT-click below range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `CTRL+SHIFT-click below range allows batch deselection setup`).check(`
                        ROOT id:<no-id>
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
                            ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', enableClickSelection: true },
                    });
                    await new GridColumns(api, `CTRL+SHIFT-click above range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `CTRL+SHIFT-click above range allows batch deselection setup`).check(`
                        ROOT id:<no-id>
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
                            ROOT id:<no-id>
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

                test('SHIFT-click after select all selects range between clicked row and last clicked row', async () => {
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
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
                        ROOT id:<no-id>
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

                    assertSelectedRowElementsById(['0', '1', '2', '3', '4', '5', '6'], api);

                    actions.clickRowByIndex(5, { shiftKey: true });

                    assertSelectedRowElementsById(['2', '3', '4', '5'], api);
                    await new GridRows(
                        api,
                        `SHIFT-click after select all selects range between clicked row and last clicked  final state`
                    ).check(`
                        ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
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
                        ROOT id:<no-id>
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    actions.toggleHeaderCheckboxByIndex(0);

                    assertSelectedRowElementsById(['0', '1', '2', '3', '4', '5', '6'], api);

                    actions.clickRowByIndex(3, { shiftKey: true });

                    assertSelectedRowElementsById(['0', '1', '2', '3'], api);
                    await new GridRows(
                        api,
                        `SHIFT-click after select all on pristine grid selects range between first row an final state`
                    ).check(`
                        ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
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
                        ROOT id:<no-id>
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

                    assertSelectedRowElementsById(['2', '3', '4'], api);

                    actions.toggleHeaderCheckboxByIndex(0);

                    actions.clickRowByIndex(6, { shiftKey: true });

                    assertSelectedRowElementsById(['2', '3', '4', '5', '6'], api);
                    await new GridRows(api, `SHIFT-click after select all behaves consistently final state`).check(`
                        ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
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
                        ROOT id:<no-id>
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

                    assertSelectedRowElementsById(['3', '4', '5', '6'], api);
                    await new GridRows(
                        api,
                        `Select all, then de-select, then SHIFT-click goes back to normal behaviour final state`
                    ).check(`
                        ROOT id:<no-id>
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
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: { mode: 'multiRow', enableSelectionWithoutKeys: true, enableClickSelection: true },
                });
                await new GridColumns(api, `Select multiple rows without modifier keys setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `Select multiple rows without modifier keys setup`).check(`
                    ROOT id:<no-id>
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
                    ROOT id:<no-id>
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
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: { mode: 'multiRow', enableSelectionWithoutKeys: true, enableClickSelection: true },
                });
                await new GridColumns(api, `De-select row with click setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `De-select row with click setup`).check(`
                    ROOT id:<no-id>
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
                    ROOT id:<no-id>
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
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: { mode: 'multiRow', checkboxes: true },
                });
                await new GridColumns(api, `Checkbox can be toggled on and off setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `Checkbox can be toggled on and off setup`).check(`
                    ROOT id:<no-id>
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
                    ROOT id:<no-id>
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
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
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
                    ROOT id:<no-id>
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
                    ROOT id:<no-id>
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF selected id:1 sport:"rugby"
                    ├── LEAF selected id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('Clicking a row selects it when `enableClickSelection` is false', async () => {
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
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
                        ROOT id:<no-id>
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
                        ROOT id:<no-id>
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
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
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
                        ROOT id:<no-id>
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
                        ROOT id:<no-id>
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
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: {
                        mode: 'multiRow',
                        checkboxes: true,
                        isRowSelectable: (node) => node.data.sport !== 'golf',
                    },
                });
                await new GridColumns(api, `Un-selectable checkboxes cannot be toggled setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `Un-selectable checkboxes cannot be toggled setup`).check(`
                    ROOT id:<no-id>
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
                    ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
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
                        ROOT id:<no-id>
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
                        ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `SHIFT-click selects range of rows setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `SHIFT-click selects range of rows setup`).check(`
                        ROOT id:<no-id>
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
                        ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
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
                            ROOT id:<no-id>
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
                        ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
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
                            ROOT id:<no-id>
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
                            ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
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
                            ROOT id:<no-id>
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
                            ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `Range selection is preserved on CTRL-click and CMD-click setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `Range selection is preserved on CTRL-click and CMD-click setup`).check(`
                        ROOT id:<no-id>
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
                            ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
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
                        ROOT id:<no-id>
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
                        ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
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
                            ROOT id:<no-id>
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
                            ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `Range members can be un-selected with toggle setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `Range members can be un-selected with toggle setup`).check(`
                        ROOT id:<no-id>
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
                        ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
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
                        ROOT id:<no-id>
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
                        ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `Range is extended upwards from selection root setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `Range is extended upwards from selection root setup`).check(`
                        ROOT id:<no-id>
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
                        ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `Range can be inverted setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `Range can be inverted setup`).check(`
                        ROOT id:<no-id>
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
                        ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
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
                        ROOT id:<no-id>
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
                            ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `META+SHIFT-click below range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `META+SHIFT-click below range allows batch deselection setup`).check(`
                        ROOT id:<no-id>
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
                            ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `META+SHIFT-click above range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `META+SHIFT-click above range allows batch deselection setup`).check(`
                        ROOT id:<no-id>
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
                            ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `CTRL+SHIFT-click within range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `CTRL+SHIFT-click within range allows batch deselection setup`).check(`
                        ROOT id:<no-id>
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
                            ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `CTRL+SHIFT-click below range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `CTRL+SHIFT-click below range allows batch deselection setup`).check(`
                        ROOT id:<no-id>
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
                            ROOT id:<no-id>
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
                    const [api, actions] = await createGridAndWait({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                return params.success({ rowData, rowCount: rowData.length });
                            },
                        },
                        rowSelection: { mode: 'multiRow', checkboxes: true },
                    });
                    await new GridColumns(api, `CTRL+SHIFT-click above range allows batch deselection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `CTRL+SHIFT-click above range allows batch deselection setup`).check(`
                        ROOT id:<no-id>
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
                            ROOT id:<no-id>
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
            });
        });

        describe('Header checkbox selection', () => {
            test('can be used to select and deselect all rows', async () => {
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: { mode: 'multiRow', headerCheckbox: true },
                });
                await new GridColumns(api, `can be used to select and deselect all rows setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `can be used to select and deselect all rows setup`).check(`
                    ROOT id:<no-id>
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.toggleHeaderCheckboxByIndex(0);
                assertSelectedRowElementsById(['0', '1', '2', '3', '4', '5', '6'], api);

                actions.toggleHeaderCheckboxByIndex(0);
                assertSelectedRowElementsById([], api);
                await new GridRows(api, `can be used to select and deselect all rows final state`).check(`
                    ROOT id:<no-id>
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
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
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
                    ROOT id:<no-id>
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.toggleHeaderCheckboxByIndex(0);
                assertSelectedRowElementsById(['0', '1', '2', '3', '4', '5', '6'], api);

                actions.toggleHeaderCheckboxByIndex(0);
                assertSelectedRowElementsById([], api);
                await new GridRows(api, `can select multiple pages of data final state`).check(`
                    ROOT id:<no-id>
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('indeterminate selection state transitions to select all', async () => {
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: { mode: 'multiRow', headerCheckbox: true },
                });
                await new GridColumns(api, `indeterminate selection state transitions to select all setup`)
                    .checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                await new GridRows(api, `indeterminate selection state transitions to select all setup`).check(`
                    ROOT id:<no-id>
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.toggleCheckboxByIndex(3);
                assertSelectedRowElementsById(['3'], api);

                actions.toggleHeaderCheckboxByIndex(0);
                assertSelectedRowElementsById(['3', '0', '1', '2', '4', '5', '6'], api);
                await new GridRows(api, `indeterminate selection state transitions to select all final state`).check(
                    `
                        ROOT id:<no-id>
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
                const [api, actions] = await createGridAndWait({
                    columnDefs,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                    rowSelection: {
                        mode: 'multiRow',
                        headerCheckbox: true,
                        isRowSelectable: (node) => node.data.sport !== 'football',
                    },
                });
                await new GridColumns(api, `un-selectable rows are not part of the selection setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `un-selectable rows are not part of the selection setup`).check(`
                    ROOT id:<no-id>
                    ├── LEAF 🚫 id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.toggleHeaderCheckboxByIndex(0);
                assertSelectedRowElementsById(['1', '2', '3', '4', '5', '6'], api);
                await new GridRows(api, `un-selectable rows are not part of the selection final state`).check(`
                    ROOT id:<no-id>
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

        describe('Group selection', () => {
            function getRowIdRaw(params: Pick<GetRowIdParams, 'api' | 'data' | 'parentKeys'>) {
                return getRowId({ ...params, level: -1, context: {} });
            }
            function getRowId(params: GetRowIdParams): string {
                return (params.parentKeys ?? []).join('-') + ':' + JSON.stringify(params.data);
            }
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
                rowModelType: 'serverSide',
                serverSideDatasource: {
                    getRows(params) {
                        const data = fakeFetch(params.request);
                        return params.success({ rowData: data, rowCount: data.length });
                    },
                },
                getRowId,
            };

            test('clicking group row selects only that row', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow' },
                });
                await new GridColumns(api, `clicking group row selects only that row setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── ag-Grid-AutoColumn "Athlete" width:200
                    ├── age "Age" width:200
                    ├── year "Year" width:200
                    └── date "Date" width:200
                `);
                await new GridRows(api, `clicking group row selects only that row setup`).check(`
                    ROOT id:<no-id>
                    ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                    ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                    ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                    ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                    ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                    ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                    ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                    └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                `);

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([0], api);
                await new GridRows(api, `clicking group row selects only that row final state`).check(`
                    ROOT id:<no-id>
                    ├── GROUP selected collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                    ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                    ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                    ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                    ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                    ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                    ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                    └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                `);
            });

            test('clicking group row with `groupSelects = "descendants"` enabled selects that row and all its children', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
                });
                await new GridColumns(
                    api,
                    `clicking group row with _groupSelects = "descendants"_ enabled selects that row  setup`
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
                    `clicking group row with _groupSelects = "descendants"_ enabled selects that row  setup`
                ).check(`
                    ROOT id:<no-id>
                    ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                    ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                    ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                    ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                    ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                    ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                    ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                    └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                `);

                // Group selects children
                actions.toggleCheckboxByIndex(0);
                await actions.expandGroupRowByIndex(0);

                assertSelectedRowElementsById(
                    [
                        { data: { country: 'United States' } },
                        { parentKeys: ['United States'], data: { sport: 'Swimming' } },
                        { parentKeys: ['United States'], data: { sport: 'Gymnastics' } },
                    ].map((p) => getRowIdRaw({ ...p, api })),
                    api
                );

                // Can un-select child row
                actions.toggleCheckboxByIndex(1);

                assertSelectedRowElementsById(
                    [{ parentKeys: ['United States'], data: { sport: 'Gymnastics' } }].map((r) =>
                        getRowIdRaw({ ...r, api })
                    ),
                    api
                );

                // Toggling group row from indeterminate state selects all children
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowElementsById(
                    [
                        { data: { country: 'United States' } },
                        { parentKeys: ['United States'], data: { sport: 'Swimming' } },
                        { parentKeys: ['United States'], data: { sport: 'Gymnastics' } },
                    ].map((r) => getRowIdRaw({ ...r, api })),
                    api
                );

                // Toggle group row again de-selects all children
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowElementsById([], api);
                await new GridRows(
                    api,
                    `clicking group row with _groupSelects = "descendants"_ enabled selects that row  final state`
                ).check(`
                    ROOT id:<no-id>
                    ├─┬ GROUP id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                    │ ├── GROUP-leafGroup collapsed id:'United States:{"sport":"Swimming"}' ag-Grid-AutoColumn:"Swimming" sport:"Swimming"
                    │ └── GROUP-leafGroup collapsed id:'United States:{"sport":"Gymnastics"}' ag-Grid-AutoColumn:"Gymnastics" sport:"Gymnastics"
                    ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                    ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                    ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                    ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                    ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                    ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                    └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                `);
            });

            test('de/select group row with `groupSelects = "descendants"` and `enableClickSelection`', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow', groupSelects: 'descendants', enableClickSelection: true },
                });
                await new GridColumns(
                    api,
                    `de/select group row with _groupSelects = "descendants"_ and _enableClickSelectio setup`
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
                    `de/select group row with _groupSelects = "descendants"_ and _enableClickSelectio setup`
                ).check(`
                    ROOT id:<no-id>
                    ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                    ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                    ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                    ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                    ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                    ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                    ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                    └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                `);

                actions.clickRowByIndex(0);
                await actions.expandGroupRowByIndex(0);

                assertSelectedRowElementsById(
                    [
                        { data: { country: 'United States' } },
                        { parentKeys: ['United States'], data: { sport: 'Swimming' } },
                        { parentKeys: ['United States'], data: { sport: 'Gymnastics' } },
                    ].map((r) => getRowIdRaw({ ...r, api })),
                    api
                );

                actions.clickRowByIndex(1, { ctrlKey: true });
                assertSelectedRowElementsById(
                    [{ parentKeys: ['United States'], data: { sport: 'Gymnastics' } }].map((r) =>
                        getRowIdRaw({ ...r, api })
                    ),
                    api
                );
                await new GridRows(
                    api,
                    `de/select group row with _groupSelects = "descendants"_ and _enableClickSelectio final state`
                ).check(`
                    ROOT id:<no-id>
                    ├─┬ GROUP indeterminate id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                    │ ├── GROUP-leafGroup collapsed id:'United States:{"sport":"Swimming"}' ag-Grid-AutoColumn:"Swimming" sport:"Swimming"
                    │ └── GROUP-leafGroup selected collapsed id:'United States:{"sport":"Gymnastics"}' ag-Grid-AutoColumn:"Gymnastics" sport:"Gymnastics"
                    ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                    ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                    ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                    ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                    ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                    ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                    └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
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
                    ROOT id:<no-id>
                    ├── GROUP 🚫 collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                    ├── GROUP 🚫 collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                    ├── GROUP 🚫 collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                    ├── GROUP 🚫 collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                    ├── GROUP 🚫 collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                    ├── GROUP 🚫 collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                    ├── GROUP 🚫 collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                    └── GROUP 🚫 collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                `);

                await actions.expandGroupRowByIndex(0);

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowElementsById([], api);

                actions.toggleCheckboxByIndex(1);
                assertSelectedRowElementsById(
                    [{ parentKeys: ['United States'], data: { sport: 'Swimming' } }].map((r) =>
                        getRowIdRaw({ ...r, api })
                    ),
                    api
                );
                await new GridRows(
                    api,
                    `Cannot select group rows where _isRowSelectable_ returns false and _groupSelects final state`
                ).check(`
                    ROOT id:<no-id>
                    ├─┬ GROUP 🚫 id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                    │ ├── GROUP-leafGroup selected collapsed id:'United States:{"sport":"Swimming"}' ag-Grid-AutoColumn:"Swimming" sport:"Swimming"
                    │ └── GROUP-leafGroup 🚫 collapsed id:'United States:{"sport":"Gymnastics"}' ag-Grid-AutoColumn:"Gymnastics" sport:"Gymnastics"
                    ├── GROUP 🚫 collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                    ├── GROUP 🚫 collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                    ├── GROUP 🚫 collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                    ├── GROUP 🚫 collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                    ├── GROUP 🚫 collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                    ├── GROUP 🚫 collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                    └── GROUP 🚫 collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                `);
            });

            test('Cannot select group rows where `isRowSelectable` returns false and `groupSelects` = "descendants"', async () => {
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
                    ROOT id:<no-id>
                    ├── GROUP 🚫 collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                    ├── GROUP 🚫 collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                    ├── GROUP 🚫 collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                    ├── GROUP 🚫 collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                    ├── GROUP 🚫 collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                    ├── GROUP 🚫 collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                    ├── GROUP 🚫 collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                    └── GROUP 🚫 collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                `);

                await actions.expandGroupRowByIndex(0);

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowElementsById([], api);
                await new GridRows(
                    api,
                    `Cannot select group rows where _isRowSelectable_ returns false and _groupSelects final state`
                ).check(`
                    ROOT id:<no-id>
                    ├─┬ GROUP 🚫 id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                    │ ├── GROUP-leafGroup collapsed id:'United States:{"sport":"Swimming"}' ag-Grid-AutoColumn:"Swimming" sport:"Swimming"
                    │ └── GROUP-leafGroup 🚫 collapsed id:'United States:{"sport":"Gymnastics"}' ag-Grid-AutoColumn:"Gymnastics" sport:"Gymnastics"
                    ├── GROUP 🚫 collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                    ├── GROUP 🚫 collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                    ├── GROUP 🚫 collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                    ├── GROUP 🚫 collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                    ├── GROUP 🚫 collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                    ├── GROUP 🚫 collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                    └── GROUP 🚫 collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                `);
            });

            test('Selection state does not change when `isRowSelectable` changes', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: {
                        mode: 'multiRow',
                        groupSelects: 'descendants',
                        isRowSelectable: (node) => node.data?.sport === 'Swimming',
                    },
                });
                await new GridColumns(api, `Selection state does not change when _isRowSelectable_ changes setup`)
                    .checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        ├── ag-Grid-AutoColumn "Athlete" width:200
                        ├── age "Age" width:200
                        ├── year "Year" width:200
                        └── date "Date" width:200
                    `);
                await new GridRows(api, `Selection state does not change when _isRowSelectable_ changes setup`).check(
                    `
                        ROOT id:<no-id>
                        ├── GROUP 🚫 collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP 🚫 collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP 🚫 collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP 🚫 collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP 🚫 collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP 🚫 collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP 🚫 collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP 🚫 collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `
                );

                await actions.expandGroupRowByIndex(0);

                actions.toggleCheckboxByIndex(1);
                assertSelectedRowElementsById(
                    [{ parentKeys: ['United States'], data: { sport: 'Swimming' } }].map((r) =>
                        getRowIdRaw({ ...r, api })
                    ),
                    api
                );

                api.setGridOption('rowSelection', {
                    mode: 'multiRow',
                    groupSelects: 'descendants',
                    isRowSelectable: (node) => node.data?.sport === 'Gymnastics',
                });
                await new GridColumns(
                    api,
                    `Selection state does not change when _isRowSelectable_ changes after setGridOption rowSelection`
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
                    `Selection state does not change when _isRowSelectable_ changes after setGridOption rowSelection`
                ).check(`
                    ROOT id:<no-id>
                    ├─┬ GROUP indeterminate 🚫 id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                    │ ├── GROUP-leafGroup selected 🚫 collapsed id:'United States:{"sport":"Swimming"}' ag-Grid-AutoColumn:"Swimming" sport:"Swimming"
                    │ └── GROUP-leafGroup collapsed id:'United States:{"sport":"Gymnastics"}' ag-Grid-AutoColumn:"Gymnastics" sport:"Gymnastics"
                    ├── GROUP 🚫 collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                    ├── GROUP 🚫 collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                    ├── GROUP 🚫 collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                    ├── GROUP 🚫 collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                    ├── GROUP 🚫 collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                    ├── GROUP 🚫 collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                    └── GROUP 🚫 collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                `);

                assertSelectedRowElementsById(
                    [{ parentKeys: ['United States'], data: { sport: 'Swimming' } }].map((r) =>
                        getRowIdRaw({ ...r, api })
                    ),
                    api
                );
            });

            test('Selection when `enableSelectionWithoutKeys` for defaultStrategy', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow', enableSelectionWithoutKeys: true, enableClickSelection: true },
                });
                await new GridColumns(api, `Selection when _enableSelectionWithoutKeys_ for defaultStrategy setup`)
                    .checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        ├── ag-Grid-AutoColumn "Athlete" width:200
                        ├── age "Age" width:200
                        ├── year "Year" width:200
                        └── date "Date" width:200
                    `);
                await new GridRows(api, `Selection when _enableSelectionWithoutKeys_ for defaultStrategy setup`).check(
                    `
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `
                );

                await actions.expandGroupRowByIndex(0);

                actions.clickRowByIndex(1);
                actions.clickRowByIndex(2);

                assertSelectedRowElementsById(
                    [
                        { parentKeys: ['United States'], data: { sport: 'Swimming' } },
                        { parentKeys: ['United States'], data: { sport: 'Gymnastics' } },
                    ].map((r) => getRowIdRaw({ ...r, api })),
                    api
                );
                await new GridRows(api, `Selection when _enableSelectionWithoutKeys_ for defaultStrategy final state`)
                    .check(`
                        ROOT id:<no-id>
                        ├─┬ GROUP id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        │ ├── GROUP-leafGroup selected collapsed id:'United States:{"sport":"Swimming"}' ag-Grid-AutoColumn:"Swimming" sport:"Swimming"
                        │ └── GROUP-leafGroup selected collapsed id:'United States:{"sport":"Gymnastics"}' ag-Grid-AutoColumn:"Gymnastics" sport:"Gymnastics"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);
            });

            // This behaviour is actually explicitly disabled because it doesn't work in CSRM
            // however, keep the test because it works (at time of writing) in SSRM and we may want
            // to bring this behaviour back
            test.skip('Selection when `enableSelectionWithoutKeys` for `groupSelects = "descendants"`', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: {
                        mode: 'multiRow',
                        groupSelects: 'descendants',
                        enableSelectionWithoutKeys: true,
                        enableClickSelection: true,
                    },
                });

                await actions.expandGroupRowByIndex(0);

                actions.clickRowByIndex(1);
                actions.clickRowByIndex(2);

                assertSelectedRowElementsById(
                    [
                        { data: { country: 'United States' } },
                        { parentKeys: ['United States'], data: { sport: 'Swimming' } },
                        { parentKeys: ['United States'], data: { sport: 'Gymnastics' } },
                    ].map((r) => getRowIdRaw({ ...r, api })),
                    api
                );
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
                    ROOT id:<no-id>
                    ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                    ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                    ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                    ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                    ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                    ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                    ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                    └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                `);

                await actions.expandGroupRowByIndex(0);

                actions.toggleCheckboxByIndex(3);

                assertSelectedRowElementsById([':{"country":"United States"}'], api);
                await new GridRows(api, `selecting footer node selects sibling (i.e. group node) final state`).check(
                    `
                        ROOT id:<no-id>
                        ├─┬ GROUP selected id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        │ ├── GROUP-leafGroup collapsed id:'United States:{"sport":"Swimming"}' ag-Grid-AutoColumn:"Swimming" sport:"Swimming"
                        │ ├── GROUP-leafGroup collapsed id:'United States:{"sport":"Gymnastics"}' ag-Grid-AutoColumn:"Gymnastics" sport:"Gymnastics"
                        │ └─ footer selected collapsed id:'rowGroupFooter_:{"country":"United States"}' ag-Grid-AutoColumn:"Total United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `
                );
            });

            test('selecting footer node selects sibling (i.e. group node) when `groupSelects = "descendants"`', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    groupTotalRow: 'bottom',
                    rowSelection: {
                        mode: 'multiRow',
                        groupSelects: 'descendants',
                    },
                });
                await new GridColumns(
                    api,
                    `selecting footer node selects sibling (i.e. group node) when _groupSelects = "de setup`
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
                    `selecting footer node selects sibling (i.e. group node) when _groupSelects = "de setup`
                ).check(`
                    ROOT id:<no-id>
                    ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                    ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                    ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                    ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                    ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                    ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                    ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                    └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                `);

                await actions.expandGroupRowByIndex(0);

                actions.toggleCheckboxByIndex(3);

                assertSelectedRowElementsById(
                    [
                        { data: { country: 'United States' } },
                        { parentKeys: ['United States'], data: { sport: 'Swimming' } },
                        { parentKeys: ['United States'], data: { sport: 'Gymnastics' } },
                    ].map((r) => getRowIdRaw({ ...r, api })),
                    api
                );
                await new GridRows(
                    api,
                    `selecting footer node selects sibling (i.e. group node) when _groupSelects = "de final state`
                ).check(`
                    ROOT id:<no-id>
                    ├─┬ GROUP selected id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                    │ ├── GROUP-leafGroup selected collapsed id:'United States:{"sport":"Swimming"}' ag-Grid-AutoColumn:"Swimming" sport:"Swimming"
                    │ ├── GROUP-leafGroup selected collapsed id:'United States:{"sport":"Gymnastics"}' ag-Grid-AutoColumn:"Gymnastics" sport:"Gymnastics"
                    │ └─ footer selected collapsed id:'rowGroupFooter_:{"country":"United States"}' ag-Grid-AutoColumn:"Total United States" country:"United States"
                    ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                    ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                    ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                    ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                    ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                    ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                    └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
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
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { metaKey: true });
                    actions.toggleCheckboxByIndex(3, { ctrlKey: true });

                    assertSelectedRowsByIndex([2, 5, 3], api);
                    await new GridRows(
                        api,
                        `CTRL-click and CMD-click does not affect ability to select multiple rows final state`
                    ).check(`
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP selected collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP selected collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
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
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 3, 4, 5], api);
                    await new GridRows(api, `SHIFT-click selects range of rows final state`).check(`
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP selected collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP selected collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP selected collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
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
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                        `);

                    actions.selectRowsByIndex([1, 3], false);

                    actions.toggleCheckboxByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([1, 3, 4, 5], api);
                    await new GridRows(
                        api,
                        `SHIFT-click extends range downwards from from last selected row final state`
                    ).check(`
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP selected collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP selected collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP selected collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP selected collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
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
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                        `);

                    actions.selectRowsByIndex([2, 4], false);

                    actions.toggleCheckboxByIndex(1, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 4, 1, 3], api);
                    await new GridRows(api, `SHIFT-click extends range upwards from from last selected row final state`)
                        .check(`
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP selected collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP selected collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP selected collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
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
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                        `
                    );

                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([4], api);

                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([4, 5, 6], api);
                    await new GridRows(api, `SHIFT-click on un-selected table selects only clicked row final state`)
                        .check(`
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP selected collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP selected collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP selected collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
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
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(3, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3], api);

                    actions.toggleCheckboxByIndex(5, { metaKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 5], api);
                    await new GridRows(api, `Range selection is preserved on CTRL-click and CMD-click final state`)
                        .check(`
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP selected collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP selected collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP selected collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
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
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(3, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3], api);

                    actions.toggleCheckboxByIndex(5);
                    assertSelectedRowsByIndex([1, 2, 3, 5], api);
                    await new GridRows(api, `Range selection is preserved on checkbox toggle final state`).check(`
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP selected collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP selected collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP selected collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
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
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
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
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP selected collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP selected collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
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
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 4], api);

                    actions.toggleCheckboxByIndex(3);
                    assertSelectedRowsByIndex([1, 2, 4], api);
                    await new GridRows(api, `Range members can be un-selected with toggle final state`).check(`
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP selected collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP selected collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
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
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4], api);

                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);
                    await new GridRows(api, `Range is extended downwards from selection root final state`).check(`
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP selected collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP selected collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP selected collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP selected collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
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
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);

                    actions.toggleCheckboxByIndex(6);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([6, 4, 5], api);

                    actions.toggleCheckboxByIndex(2, { shiftKey: true });
                    assertSelectedRowsByIndex([6, 4, 5, 2, 3], api);
                    await new GridRows(api, `Range is extended upwards from selection root final state`).check(`
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP selected collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP selected collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP selected collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP selected collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
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
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);

                    actions.toggleCheckboxByIndex(4);
                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([4, 5, 6], api);

                    actions.toggleCheckboxByIndex(2, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4], api);
                    await new GridRows(api, `Range can be inverted final state`).check(`
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP selected collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP selected collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);
                });

                test('Range spanning across groups when `groupSelects = "descendants"', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
                    });
                    await new GridColumns(api, `Range spanning across groups when _groupSelects = "descendants" setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            ├── ag-Grid-AutoColumn "Athlete" width:200
                            ├── age "Age" width:200
                            ├── year "Year" width:200
                            └── date "Date" width:200
                        `);
                    await new GridRows(api, `Range spanning across groups when _groupSelects = "descendants" setup`)
                        .check(`
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                        `);

                    await actions.expandGroupRowByIndex(0);
                    await actions.expandGroupRowByIndex(3);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowElementsById(
                        [
                            { parentKeys: ['United States'], data: { sport: 'Gymnastics' } },
                            { data: { country: 'Russia' } },
                            { parentKeys: ['Russia'], data: { sport: 'Gymnastics' } },
                        ].map((o) => getRowIdRaw({ ...o, api })),
                        api
                    );
                    await new GridRows(
                        api,
                        `Range spanning across groups when _groupSelects = "descendants" final state`
                    ).check(`
                        ROOT id:<no-id>
                        ├─┬ GROUP indeterminate id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        │ ├── GROUP-leafGroup collapsed id:'United States:{"sport":"Swimming"}' ag-Grid-AutoColumn:"Swimming" sport:"Swimming"
                        │ └── GROUP-leafGroup selected collapsed id:'United States:{"sport":"Gymnastics"}' ag-Grid-AutoColumn:"Gymnastics" sport:"Gymnastics"
                        ├─┬ GROUP selected id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        │ └── GROUP-leafGroup selected collapsed id:'Russia:{"sport":"Gymnastics"}' ag-Grid-AutoColumn:"Gymnastics" sport:"Gymnastics"
                        ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
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
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
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
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP selected collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
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
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
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
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
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
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
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
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP selected collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP selected collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
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
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
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
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP selected collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
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
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
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
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
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
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
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
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP selected collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP selected collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                        `
                    );
                });

                test('CTRL+SHIFT-click defaults to selection when root is selected', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `CTRL+SHIFT-click defaults to selection when root is selected setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            ├── ag-Grid-AutoColumn "Athlete" width:200
                            ├── age "Age" width:200
                            ├── year "Year" width:200
                            └── date "Date" width:200
                        `);
                    await new GridRows(api, `CTRL+SHIFT-click defaults to selection when root is selected setup`).check(
                        `
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                        `
                    );

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);
                    await new GridRows(api, `CTRL+SHIFT-click defaults to selection when root is selected final state`)
                        .check(`
                            ROOT id:<no-id>
                            ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                            ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                            ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                            ├── GROUP selected collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                            ├── GROUP selected collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                            ├── GROUP selected collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                            ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                            └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                        `);
                });

                test('CTRL+SHIFT-click within range allows batch deselection when `groupSelects: "descendants"`', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
                    });
                    await new GridColumns(
                        api,
                        `CTRL+SHIFT-click within range allows batch deselection when _groupSelects: "desc setup`
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
                        `CTRL+SHIFT-click within range allows batch deselection when _groupSelects: "desc setup`
                    ).check(`
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    actions.toggleCheckboxByIndex(5, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2, 6], api);
                    await new GridRows(
                        api,
                        `CTRL+SHIFT-click within range allows batch deselection when _groupSelects: "desc final state`
                    ).check(`
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP selected collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);
                });

                test('CTRL+SHIFT-click defaults to selection when root is selected when `groupSelects = "descendants"`', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
                    });
                    await new GridColumns(
                        api,
                        `CTRL+SHIFT-click defaults to selection when root is selected when _groupSelects  setup`
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
                        `CTRL+SHIFT-click defaults to selection when root is selected when _groupSelects  setup`
                    ).check(`
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);
                    await new GridRows(
                        api,
                        `CTRL+SHIFT-click defaults to selection when root is selected when _groupSelects  final state`
                    ).check(`
                        ROOT id:<no-id>
                        ├── GROUP collapsed id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                        ├── GROUP collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                        ├── GROUP selected collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                        ├── GROUP selected collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                        ├── GROUP selected collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                        ├── GROUP selected collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                        ├── GROUP collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                        └── GROUP collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                    `);
                });
            });
        });
    });
});
