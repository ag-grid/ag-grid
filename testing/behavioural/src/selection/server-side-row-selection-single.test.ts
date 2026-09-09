import { GridColumns, GridRows, assertSelectedRowsById, assertSelectedRowsByIndex } from 'ag-test-utils';

import {
    capturedWarnings,
    columnDefs,
    createGridAndWait,
    rowData,
    setupServerSideRowSelectionSuite,
} from './serverSideRowSelectionHarness';

describe('Row Selection Grid Options', () => {
    describe('User Interactions', () => {
        setupServerSideRowSelectionSuite();

        describe('Single Row Selection', () => {
            // The positive control for the allowlist in the shared hooks: these suites select without a
            // `getRowId` on purpose, so the advisory has to keep firing rather than be quietly filtered.
            test('warns that server-side selection wants a getRowId', async () => {
                await createGridAndWait({
                    columnDefs,
                    rowSelection: { mode: 'singleRow' },
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                });

                expect(capturedWarnings().filter((warning) => warning.includes('warning #188'))).toHaveLength(1);
            });

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

            test('Checking two rows leaves only the last one selected', async () => {
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

                actions.toggleCheckboxByIndex(2);
                actions.toggleCheckboxByIndex(5);

                assertSelectedRowsByIndex([5], api);
                await new GridRows(api, `Checking two rows leaves only the last one selected final state`).check(`
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

                actions.toggleCheckboxByIndex(2);
                actions.toggleCheckboxByIndex(5, { ctrlKey: true });

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
                    rowSelection: { mode: 'singleRow', enableClickSelection: 'enableDeselection' },
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                });

                actions.toggleCheckboxByIndex(2);
                assertSelectedRowsById(['2'], api);

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
    });
});
