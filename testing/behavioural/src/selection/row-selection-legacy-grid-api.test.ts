import type { MockInstance } from 'vitest';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, PaginationModule, QuickFilterModule, RowSelectionModule } from 'ag-grid-community';

import {
    GridColumns,
    GridRows,
    TestGridsManager,
    assertSelectedRowNodes,
    assertSelectedRowsByIndex,
} from '../test-utils';

describe('Row Selection Grid API', () => {
    let consoleErrorSpy: MockInstance;
    let consoleWarnSpy: MockInstance;

    const gridMgr = new TestGridsManager({
        modules: [RowSelectionModule, ClientSideRowModelModule, PaginationModule, QuickFilterModule],
    });

    function createGrid(go: GridOptions): GridApi {
        return gridMgr.createGrid('myGrid', go);
    }

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

    describe('Selection API', () => {
        describe('setNodesSelected', () => {
            test('Select single row in single selection mode', async () => {
                const api = createGrid({ columnDefs, rowData, rowSelection: 'single' });
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

                assertSelectedRowNodes(toSelect, api);
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
                const api = createGrid({ columnDefs, rowData, rowSelection: 'multiple' });
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

                assertSelectedRowNodes(toSelect, api);
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
                const api = createGrid({ columnDefs, rowData, rowSelection: 'single' });
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

                assertSelectedRowNodes([], api);
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
                const api = createGrid({ columnDefs, rowData, rowSelection: 'multiple' });
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

                assertSelectedRowNodes(toSelect, api);
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
                const api = createGrid({ columnDefs, rowData, rowSelection: 'single' });
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

                api.deselectAll();
                assertSelectedRowNodes([], api);
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
                const api = createGrid({ columnDefs, rowData, rowSelection: 'multiple' });
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
                assertSelectedRowNodes([], api);
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
                const api = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: 'single',
                    pagination: true,
                    paginationPageSize: 5,
                    paginationPageSizeSelector: false,
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
                const api = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: 'single',
                    pagination: true,
                    paginationPageSize: 5,
                    paginationPageSizeSelector: false,
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

        describe('selectAll("filtered")', () => {
            test('Can select all filtered rows in single selection mode', async () => {
                const api = createGrid({ columnDefs, rowData, rowSelection: 'single' });
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

                api.selectAll('filtered');
                const selectedNodes = api.getSelectedNodes();

                expect(selectedNodes.length).toBe(2);
            });

            test('Can deselect filtered rows only in single selection mode', async () => {
                const api = createGrid({ columnDefs, rowData, rowSelection: 'single' });
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

                api.deselectAll('filtered');

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
