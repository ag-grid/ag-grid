import { GridColumns, GridRows, assertSelectedRowsByIndex } from 'ag-test-utils';

import {
    columnDefs,
    createGrid,
    createGridAndWait,
    groupGridOptions,
    rowData,
    setupRowSelectionSuite,
} from './rowSelectionHarness';

describe('Row Selection Grid Options', () => {
    describe('Basic Interactions', () => {
        setupRowSelectionSuite();

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
                    paginationPageSizeSelector: false,
                });

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
                    paginationPageSizeSelector: false,
                });

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
                    paginationPageSizeSelector: false,
                });

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
    });
});
