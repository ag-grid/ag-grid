import { GridColumns, GridRows, assertSelectedRowsByIndex } from 'ag-test-utils';

import {
    columnDefs,
    createGridAndWait,
    rowData,
    setupServerSideRowSelectionSuite,
} from './serverSideRowSelectionHarness';

describe('Row Selection Grid Options', () => {
    describe('User Interactions', () => {
        describe('Checkbox selection', () => {
            setupServerSideRowSelectionSuite();

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

            test('Clicking a row selects it when `enableClickSelection` is true', async () => {
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

                // click, not toggle
                actions.clickRowByIndex(1);
                assertSelectedRowsByIndex([1], api);

                // toggle, not click, to assert inter-op
                actions.toggleCheckboxByIndex(1);
                assertSelectedRowsByIndex([], api);
                await new GridRows(api, `Clicking a row selects it when _enableClickSelection_ is true final state`)
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
        });
    });
});
