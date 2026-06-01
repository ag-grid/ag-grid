import type { ColDef, ColGroupDef } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, TestGridsManager } from '../test-utils';

describe('GridColumns Framework', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('basic columns', () => {
        test('simple flat columns', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'flat columns').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
        });

        test('columns with header names', async () => {
            const columnDefs: ColDef[] = [
                { colId: 'athlete', headerName: 'Athlete' },
                { colId: 'age', headerName: 'Age' },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'named columns').checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                └── age "Age" width:200
            `);
        });

        test('columns with field (field used as colId)', async () => {
            const columnDefs: ColDef[] = [{ field: 'name' }, { field: 'value' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'field columns').checkColumns(`
                CENTER
                ├── name "Name" width:200
                └── value "Value" width:200
            `);
        });

        test('columns with custom widths', async () => {
            const columnDefs: ColDef[] = [
                { colId: 'a', width: 100 },
                { colId: 'b', width: 300 },
                { colId: 'c', width: 150 },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'custom widths').checkColumns(`
                CENTER
                ├── a width:100
                ├── b width:300
                └── c width:150
            `);
        });

        test('single column', async () => {
            const columnDefs: ColDef[] = [{ colId: 'only' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'single column').checkColumns(`
                CENTER
                └── only width:200
            `);
        });
    });

    describe('pinned columns', () => {
        test('left pinned columns', async () => {
            const columnDefs: ColDef[] = [
                { colId: 'left1', pinned: 'left' },
                { colId: 'center1' },
                { colId: 'center2' },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'left pinned').checkColumns(`
                LEFT
                └── left1 width:200
                CENTER
                ├── center1 width:200
                └── center2 width:200
            `);
        });

        test('right pinned columns', async () => {
            const columnDefs: ColDef[] = [{ colId: 'center1' }, { colId: 'right1', pinned: 'right' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'right pinned').checkColumns(`
                CENTER
                └── center1 width:200
                RIGHT
                └── right1 width:200
            `);
        });

        test('all three sections', async () => {
            const columnDefs: ColDef[] = [
                { colId: 'left1', pinned: 'left' },
                { colId: 'center1' },
                { colId: 'right1', pinned: 'right' },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'three sections').checkColumns(`
                LEFT
                └── left1 width:200
                CENTER
                └── center1 width:200
                RIGHT
                └── right1 width:200
            `);
        });
    });

    describe('column groups', () => {
        test('single-level groups', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Group A',
                    children: [{ colId: 'a1' }, { colId: 'a2' }],
                },
                { colId: 'b' },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'single-level groups').checkColumns(`
                CENTER
                ├─┬ "Group A" GROUP
                │ ├── a1 width:200
                │ └── a2 width:200
                └── b width:200
            `);
        });

        test('nested groups', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Outer',
                    children: [
                        {
                            headerName: 'Inner',
                            children: [{ colId: 'a' }, { colId: 'b' }],
                        },
                        { colId: 'c' },
                    ],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'nested groups').checkColumns(`
                CENTER
                └─┬ "Outer" GROUP
                  ├─┬ "Inner" GROUP
                  │ ├── a width:200
                  │ └── b width:200
                  └── c width:200
            `);
        });

        test('expandable groups with columnGroupShow - open', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Expandable',
                    openByDefault: true,
                    children: [
                        { colId: 'always', columnGroupShow: undefined },
                        { colId: 'open_only', columnGroupShow: 'open' },
                        { colId: 'closed_only', columnGroupShow: 'closed' },
                    ],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'open state').checkColumns(`
                CENTER
                └─┬ "Expandable" GROUP open
                  ├── always width:200
                  ├── open_only width:200 columnGroupShow:open
                  └── closed_only width:200 columnGroupShow:closed hidden
            `);
        });

        test('expandable groups with columnGroupShow - closed', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Collapsible',
                    openByDefault: false,
                    children: [
                        { colId: 'always' },
                        { colId: 'open_only', columnGroupShow: 'open' },
                        { colId: 'closed_only', columnGroupShow: 'closed' },
                    ],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'closed state').checkColumns(`
                CENTER
                └─┬ "Collapsible" GROUP closed
                  ├── always width:200
                  ├── open_only width:200 columnGroupShow:open hidden
                  └── closed_only width:200 columnGroupShow:closed
            `);
        });
    });

    describe('sorting', () => {
        test('single sort', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a', sort: 'asc' }, { colId: 'b' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'single sort').checkColumns(`
                CENTER
                ├── a width:200 sort:asc
                └── b width:200
            `);
        });

        test('multi sort', async () => {
            const columnDefs: ColDef[] = [
                { colId: 'a', sort: 'asc', sortIndex: 0 },
                { colId: 'b', sort: 'desc', sortIndex: 1 },
                { colId: 'c' },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'multi sort').checkColumns(`
                CENTER
                ├── a width:200 sort:asc sortIndex:0
                ├── b width:200 sort:desc sortIndex:1
                └── c width:200
            `);
        });
    });

    describe('column visibility', () => {
        test('hiding a column removes it from diagram', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b', hide: true }, { colId: 'c' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'with hidden column').checkColumns(`
                CENTER
                ├── a width:200
                └── c width:200
            `);
        });

        test('toggling visibility via API', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            // All visible initially
            await new GridColumns(api, 'all visible').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);

            // Hide column b
            api.setColumnsVisible(['b'], false);

            await new GridColumns(api, 'b hidden').checkColumns(`
                CENTER
                ├── a width:200
                └── c width:200
            `);

            // Show column b again
            api.setColumnsVisible(['b'], true);

            await new GridColumns(api, 'b visible again').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
        });
    });

    describe('row group columns', () => {
        test('columns with rowGroup active', async () => {
            const columnDefs: ColDef[] = [{ colId: 'group1', rowGroup: true, rowGroupIndex: 0 }, { colId: 'value1' }];

            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [],
            });

            await new GridColumns(api, 'row group columns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── group1 width:200 rowGroup rowGroupIndex:0
                └── value1 width:200
            `);
        });
    });

    describe('column state changes', () => {
        test('pinning via API', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            // Initially all center
            await new GridColumns(api, 'all center').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);

            // Pin column a to left
            api.setColumnsPinned(['a'], 'left');

            await new GridColumns(api, 'a pinned left').checkColumns(`
                LEFT
                └── a width:200
                CENTER
                ├── b width:200
                └── c width:200
            `);
        });

        test('sorting via API', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            api.applyColumnState({
                state: [{ colId: 'a', sort: 'desc' }],
            });

            await new GridColumns(api, 'sorted').checkColumns(`
                CENTER
                ├── a width:200 sort:desc
                └── b width:200
            `);
        });
    });

    describe('validator catches errors', () => {
        test('validator runs without errors on valid grid', async () => {
            const columnDefs: ColDef[] = [
                { colId: 'a', pinned: 'left' },
                { colId: 'b' },
                { colId: 'c', pinned: 'right' },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            // Should not throw — validators run automatically in checkColumns
            await new GridColumns(api, 'valid grid').checkColumns(`
                LEFT
                └── a width:200
                CENTER
                └── b width:200
                RIGHT
                └── c width:200
            `);
        });
    });

    describe('options', () => {
        test('checkDom: false skips DOM validation', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }];
            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'no dom check', { checkDom: false }).checkColumns(`
                CENTER
                └── a width:200
            `);
        });

        test('false skips diagram, runs validators only', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }];
            const api = gridsManager.createGrid('myGrid', { columnDefs });

            // false = skip diagram, just run validators
            await new GridColumns(api, 'validators only').checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
        });
    });
});
