import { GridColumns, GridRows, assertSelectedRowsByIndex } from 'ag-test-utils';

import { columnDefs, createGrid, rowData, setupRowSelectionSuite } from './rowSelectionHarness';

describe('Row Selection Grid Options', () => {
    describe('Basic Interactions', () => {
        setupRowSelectionSuite();

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

            test('Checking two rows leaves only the last one selected', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'singleRow' },
                });

                actions.toggleCheckboxByIndex(2);
                actions.toggleCheckboxByIndex(5);

                assertSelectedRowsByIndex([5], api);
                await new GridRows(api, `Checking two rows leaves only the last one selected final state`).check(`
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

                actions.toggleCheckboxByIndex(2);
                // Both modifiers: Ctrl is the Windows/Linux spelling of the same intent, and asserting only
                // Meta left the Ctrl path unexercised.
                actions.toggleCheckboxByIndex(3, { ctrlKey: true });
                assertSelectedRowsByIndex([3], api);

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
                    rowSelection: { mode: 'singleRow', enableClickSelection: 'enableDeselection' },
                });

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
                    rowSelection: { mode: 'singleRow', enableClickSelection: 'enableDeselection' },
                });

                actions.clickRowByIndex(2, { ctrlKey: true });
                assertSelectedRowsByIndex([], api);

                // The positive control: the assertion above holds with click selection switched off entirely,
                // so on its own it never proves the option is doing anything. Only deselection separates them.
                actions.toggleCheckboxByIndex(2);
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
    });
});
