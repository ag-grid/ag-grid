import type { ColDef, ColGroupDef, Column } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, TestGridsManager } from '../../test-utils';
import { getColumnOrder, getColumnOrderFromState } from '../column-test-utils';

describe('Column Order', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('basic columns ordered as provided', async () => {
        const columnDefs: (ColDef | ColGroupDef)[] = [
            { colId: 'g' },
            { colId: 'f' },
            { colId: 'e' },
            { colId: 'd' },
            { colId: 'c' },
            { colId: 'b' },
            { colId: 'a' },
        ];

        const gridApi = gridsManager.createGrid('myGrid', { columnDefs });

        expect(getColumnOrderFromState(gridApi)).toEqual(['g', 'f', 'e', 'd', 'c', 'b', 'a']);
        expect(getColumnOrder(gridApi, 'all')).toEqual(['g', 'f', 'e', 'd', 'c', 'b', 'a']);
        expect(getColumnOrder(gridApi, 'center')).toEqual(['g', 'f', 'e', 'd', 'c', 'b', 'a']);
        expect(getColumnOrder(gridApi, 'left')).toEqual([]);
        expect(getColumnOrder(gridApi, 'right')).toEqual([]);

        await new GridColumns(gridApi, 'columns').checkColumns(`
            CENTER
            ├── g width:200
            ├── f width:200
            ├── e width:200
            ├── d width:200
            ├── c width:200
            ├── b width:200
            └── a width:200
        `);
    });

    test('basic columns groups ordered as provided', async () => {
        const columnDefs: (ColDef | ColGroupDef)[] = [
            {
                children: [
                    { colId: 'g' },
                    { colId: 'f' },
                    {
                        children: [],
                    },
                ],
            },
            { colId: 'e' },
            { colId: 'd' },
            {
                children: [{ colId: 'c' }, { colId: 'b' }],
            },
            { colId: 'a' },
        ];

        const gridApi = gridsManager.createGrid('myGrid', { columnDefs });

        expect(getColumnOrderFromState(gridApi)).toEqual(['g', 'f', 'e', 'd', 'c', 'b', 'a']);
        expect(getColumnOrder(gridApi, 'all')).toEqual(['g', 'f', 'e', 'd', 'c', 'b', 'a']);
        expect(getColumnOrder(gridApi, 'center')).toEqual(['g', 'f', 'e', 'd', 'c', 'b', 'a']);
        expect(getColumnOrder(gridApi, 'left')).toEqual([]);
        expect(getColumnOrder(gridApi, 'right')).toEqual([]);

        await new GridColumns(gridApi, 'columns').checkColumns(`
            CENTER
            ├─┬ GROUP
            │ ├── g width:200
            │ └── f width:200
            ├── e width:200
            ├── d width:200
            ├─┬ GROUP
            │ ├── c width:200
            │ └── b width:200
            └── a width:200
        `);
    });

    test('gridApi.moveColumns moves array of columns', async () => {
        const columnDefs: (ColDef | ColGroupDef)[] = [
            { colId: 'g' },
            { colId: 'f' },
            { colId: 'e' },
            { colId: 'd' },
            { colId: 'c' },
            { colId: 'b' },
            { colId: 'a' },
        ];

        const gridApi = gridsManager.createGrid('myGrid', { columnDefs });

        expect(getColumnOrderFromState(gridApi)).toEqual(['g', 'f', 'e', 'd', 'c', 'b', 'a']);
        expect(getColumnOrder(gridApi, 'all')).toEqual(['g', 'f', 'e', 'd', 'c', 'b', 'a']);
        expect(getColumnOrder(gridApi, 'center')).toEqual(['g', 'f', 'e', 'd', 'c', 'b', 'a']);

        gridApi.moveColumns(['a', 'b', 'c'], 0);

        expect(getColumnOrderFromState(gridApi)).toEqual(['a', 'b', 'c', 'g', 'f', 'e', 'd']);
        expect(getColumnOrder(gridApi, 'all')).toEqual(['a', 'b', 'c', 'g', 'f', 'e', 'd']);
        expect(getColumnOrder(gridApi, 'center')).toEqual(['a', 'b', 'c', 'g', 'f', 'e', 'd']);

        await new GridColumns(gridApi, 'columns').checkColumns(`
            CENTER
            ├── a width:200
            ├── b width:200
            ├── c width:200
            ├── g width:200
            ├── f width:200
            ├── e width:200
            └── d width:200
        `);
    });

    describe('when overwriting colDefs', () => {
        describe('with maintainColumnOrder=true', () => {
            const maintainColumnOrder = true;
            test('preserves initial column order, inserting new cols at tail', async () => {
                const columnDefs: (ColDef | ColGroupDef)[] = [{ colId: 'g' }, { colId: 'f' }, { colId: 'e' }];

                const gridApi = gridsManager.createGrid('myGrid', { columnDefs, maintainColumnOrder });

                const columnDefsNew: (ColDef | ColGroupDef)[] = [
                    { colId: 'e' },
                    { colId: 'x' },
                    { colId: 'f' },
                    { colId: 'g' },
                    { colId: 'z' },
                ];
                // reorder cols
                gridApi.setGridOption('columnDefs', columnDefsNew);
                expect(getColumnOrder(gridApi, 'center')).toEqual(['g', 'f', 'e', 'x', 'z']);

                await new GridColumns(gridApi, 'after setGridOption columnDefs').checkColumns(`
                    CENTER
                    ├── g width:200
                    ├── f width:200
                    ├── e width:200
                    ├── x width:200
                    └── z width:200
                `);
            });

            test('preserves initial column order, inserting new group cols at tail of last group item', async () => {
                const columnDefs: (ColDef | ColGroupDef)[] = [
                    {
                        children: [{ colId: 'a' }, { colId: 'b' }],
                    },
                    { colId: 'c' },
                    {
                        children: [{ colId: 'd' }, { colId: 'e' }],
                    },
                    { colId: 'f' },
                ];

                const gridApi = gridsManager.createGrid('myGrid', { columnDefs, maintainColumnOrder });
                expect(getColumnOrder(gridApi, 'center')).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);

                const columnDefsNew: (ColDef | ColGroupDef)[] = [
                    {
                        children: [{ colId: 'a' }, { colId: 'b' }, { colId: 'z' }],
                    },
                    { colId: 'x' },
                    { colId: 'c' },
                    {
                        children: [{ colId: 'd' }, { colId: 'e' }],
                    },
                    { colId: 'f' },
                ];
                // reorder cols
                gridApi.setGridOption('columnDefs', columnDefsNew);
                expect(getColumnOrder(gridApi, 'center')).toEqual(['a', 'b', 'z', 'c', 'd', 'e', 'f', 'x']);

                await new GridColumns(gridApi, 'after setGridOption columnDefs').checkColumns(`
                    CENTER
                    ├─┬ GROUP
                    │ ├── a width:200
                    │ ├── b width:200
                    │ └── z width:200
                    ├── c width:200
                    ├─┬ GROUP
                    │ ├── d width:200
                    │ └── e width:200
                    ├── f width:200
                    └── x width:200
                `);
            });

            test('preserves initial column order, inserting new group cols at tail of last group item, when group has been split', async () => {
                const columnDefs: (ColDef | ColGroupDef)[] = [
                    {
                        children: [{ colId: 'a' }, { colId: 'b' }],
                    },
                    { colId: 'c' },
                    {
                        children: [{ colId: 'd' }, { colId: 'e' }],
                    },
                    { colId: 'f' },
                ];

                const gridApi = gridsManager.createGrid('myGrid', { columnDefs, maintainColumnOrder });
                expect(getColumnOrder(gridApi, 'center')).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);

                gridApi.moveColumns(['b'], 3);
                expect(getColumnOrder(gridApi, 'center')).toEqual(['a', 'c', 'd', 'b', 'e', 'f']);

                const columnDefsNew: (ColDef | ColGroupDef)[] = [
                    {
                        children: [{ colId: 'a' }, { colId: 'b' }, { colId: 'z' }],
                    },
                    { colId: 'c' },
                    {
                        children: [{ colId: 'd' }, { colId: 'e' }],
                    },
                    { colId: 'f' },
                ];
                // reorder cols
                gridApi.setGridOption('columnDefs', columnDefsNew);
                expect(getColumnOrder(gridApi, 'center')).toEqual(['a', 'c', 'd', 'b', 'z', 'e', 'f']);

                await new GridColumns(gridApi, 'after setGridOption columnDefs').checkColumns(`
                    CENTER
                    ├─┬ GROUP
                    │ └── a width:200
                    ├── c width:200
                    ├─┬ GROUP
                    │ └── d width:200
                    ├─┬ GROUP
                    │ ├── b width:200
                    │ └── z width:200
                    ├─┬ GROUP
                    │ └── e width:200
                    └── f width:200
                `);
            });

            test('inserts new auto columns at head', async () => {
                const columnDefs: (ColDef | ColGroupDef)[] = [{ colId: 'g' }, { colId: 'f' }, { colId: 'e' }];

                const gridApi = gridsManager.createGrid('myGrid', { columnDefs, maintainColumnOrder });

                const columnDefsNew: (ColDef | ColGroupDef)[] = [
                    { colId: 'e' },
                    { colId: 'x' },
                    { colId: 'f' },
                    { colId: 'g' },
                    { colId: 'z', rowGroup: true },
                ];
                // reorder cols
                gridApi.setGridOption('columnDefs', columnDefsNew);
                expect(getColumnOrder(gridApi, 'center')).toEqual(['ag-Grid-AutoColumn', 'g', 'f', 'e', 'x', 'z']);

                await new GridColumns(gridApi, 'after setGridOption columnDefs').checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├── g width:200
                    ├── f width:200
                    ├── e width:200
                    ├── x width:200
                    └── z width:200 rowGroup
                `);
            });

            test('preserves user order changes', async () => {
                const columnDefs: (ColDef | ColGroupDef)[] = [{ colId: 'g' }, { colId: 'f' }, { colId: 'e' }];

                const gridApi = gridsManager.createGrid('myGrid', { columnDefs, maintainColumnOrder });
                expect(getColumnOrder(gridApi, 'center')).toEqual(['g', 'f', 'e']);

                gridApi.moveColumns(['e', 'f'], 0);
                expect(getColumnOrder(gridApi, 'center')).toEqual(['e', 'f', 'g']);

                const columnDefsNew: (ColDef | ColGroupDef)[] = [
                    { colId: 'e' },
                    { colId: 'x' },
                    { colId: 'f' },
                    { colId: 'g' },
                    { colId: 'z', rowGroup: true },
                ];
                // reorder cols
                gridApi.setGridOption('columnDefs', columnDefsNew);
                expect(getColumnOrder(gridApi, 'center')).toEqual(['ag-Grid-AutoColumn', 'e', 'f', 'g', 'x', 'z']);

                await new GridColumns(gridApi, 'after setGridOption columnDefs').checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├── e width:200
                    ├── f width:200
                    ├── g width:200
                    ├── x width:200
                    └── z width:200 rowGroup
                `);
            });
        });
    });

    test('omits columns with colDef.hide', async () => {
        const columnDefs: (ColDef | ColGroupDef)[] = [
            { colId: 'a' },
            { colId: 'b', hide: true },
            { colId: 'c' },
            { colId: 'd' },
            { colId: 'e' },
            { colId: 'f' },
            { colId: 'g' },
        ];

        const gridApi = gridsManager.createGrid('myGrid', { columnDefs });

        expect(getColumnOrderFromState(gridApi)).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        expect(getColumnOrder(gridApi, 'all')).toEqual(['a', 'c', 'd', 'e', 'f', 'g']);
        expect(getColumnOrder(gridApi, 'center')).toEqual(['a', 'c', 'd', 'e', 'f', 'g']);
        expect(getColumnOrder(gridApi, 'left')).toEqual([]);
        expect(getColumnOrder(gridApi, 'right')).toEqual([]);

        await new GridColumns(gridApi, 'omits hidden columns').checkColumns(`
            CENTER
            ├── a width:200
            ├── c width:200
            ├── d width:200
            ├── e width:200
            ├── f width:200
            └── g width:200
        `);
    });
});

describe('maintainColumnOrder with grouped columns', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule] });

    afterEach(() => gridsManager.reset());

    test('removing a grouped column keeps the reordered survivors in order', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { headerName: 'G1', groupId: 'g1', children: [{ colId: 'a' }, { colId: 'b' }] },
                { headerName: 'G2', groupId: 'g2', children: [{ colId: 'c' }, { colId: 'd' }] },
            ],
            maintainColumnOrder: true,
        });

        // Reorder within G2 so the live order differs from the def order: a, b, d, c
        api.moveColumns(['d'], 2);
        expect(api.getAllDisplayedColumns().map((c: Column) => c.getColId())).toEqual(['a', 'b', 'd', 'c']);

        // Remove 'b' — no columns are added, so the "additionalCols.length === 0" branch runs.
        api.setGridOption('columnDefs', [
            { headerName: 'G1', groupId: 'g1', children: [{ colId: 'a' }] },
            { headerName: 'G2', groupId: 'g2', children: [{ colId: 'c' }, { colId: 'd' }] },
        ]);

        // Surviving columns keep their preserved relative order (d before c).
        expect(api.getAllDisplayedColumns().map((c: Column) => c.getColId())).toEqual(['a', 'd', 'c']);

        await new GridColumns(api, 'grouped column removed, order preserved').checkColumns(`
            CENTER
            ├─┬ "G1" GROUP
            │ └── a width:200
            └─┬ "G2" GROUP
              ├── d width:200
              └── c width:200
        `);
    });

    test('adding a new nested group of new columns positions them by their existing sibling', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ headerName: 'Outer', groupId: 'outer', children: [{ colId: 'c' }] }, { colId: 'd' }],
            maintainColumnOrder: true,
        });

        // Reorder so the live order differs: d, c
        api.moveColumns(['d'], 0);
        expect(api.getAllDisplayedColumns().map((c: Column) => c.getColId())).toEqual(['d', 'c']);

        // Add a brand-new nested Inner group (x, y) plus a new sibling 'e' alongside 'c'.
        // While positioning the new cols, their sibling Inner group's leaves (x, y) are
        // themselves new (absent from the preserved order), exercising the skip branch.
        api.setGridOption('columnDefs', [
            {
                headerName: 'Outer',
                groupId: 'outer',
                children: [
                    { headerName: 'Inner', groupId: 'inner', children: [{ colId: 'x' }, { colId: 'y' }] },
                    { colId: 'c' },
                    { colId: 'e' },
                ],
            },
            { colId: 'd' },
        ]);

        // 'c' keeps its preserved position relative to 'd'; the new cols cluster within Outer.
        await new GridColumns(api, 'new nested group of new columns added').checkColumns(`
            CENTER
            ├── d width:200
            └─┬ "Outer" GROUP
              ├── c width:200
              ├─┬ "Inner" GROUP
              │ ├── x width:200
              │ └── y width:200
              └── e width:200
        `);
    });
});
