import { GridColumns, GridRows, assertSelectedRowsByIndex } from 'ag-test-utils';

import {
    columnDefs,
    createGridAndWait,
    rowData,
    setupServerSideRowSelectionSuite,
} from './serverSideRowSelectionHarness';

describe('Row Selection Grid Options', () => {
    describe('User Interactions', () => {
        setupServerSideRowSelectionSuite();

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

            // Multi-row is where deselect-by-click has to leave the *other* selections alone; the single-row
            // suite covers the option's one-row case.
            test('enableClickSelection="enableDeselection" deselects only the clicked row', async () => {
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

                actions.toggleCheckboxByIndex(2);
                actions.toggleCheckboxByIndex(5);
                assertSelectedRowsByIndex([2, 5], api);

                actions.clickRowByIndex(2, { ctrlKey: true });
                assertSelectedRowsByIndex([5], api);

                // An unselected row still cannot be selected by clicking, which is what separates
                // `enableDeselection` from `enableClickSelection: true`.
                actions.clickRowByIndex(3, { ctrlKey: true });
                assertSelectedRowsByIndex([5], api);
                await new GridRows(
                    api,
                    `enableClickSelection="enableDeselection" deselects only the clicked row final state`
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
    });
});
