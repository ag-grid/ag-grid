import type { ColDef, ColGroupDef } from 'ag-grid-community';
import { ClientSideRowModelModule, NumberFilterModule, TextFilterModule } from 'ag-grid-community';
import { PivotModule } from 'ag-grid-enterprise';

import { GridColumns, TestGridsManager, applyTransactionChecked } from '../../test-utils';
import { getAutoGroupColumnIds, getColumnOrder } from '../column-test-utils';

describe('pivotMode=true', () => {
    const gridsManager = new TestGridsManager({
        modules: [NumberFilterModule, TextFilterModule, ClientSideRowModelModule, PivotModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('without a pivoted column', () => {
        test('hides primary cols that do not have aggregations', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [{ colId: 'a' }];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, pivotMode: true });

            const expected = [];
            expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);

            await new GridColumns(gridApi, 'columns').checkColumns('empty');
        });

        test('displays aggFunc primary columns when no pivot columns', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [{ colId: 'a', aggFunc: 'sum' }];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, pivotMode: true });

            const expected = ['a'];
            expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);

            await new GridColumns(gridApi, 'columns').checkColumns(`
                CENTER
                └── a width:200 aggFunc:sum
            `);
        });

        test('groupDisplayType=singleColumn displays auto column(s)', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b', rowGroup: true },
            ];

            const gridApi = gridsManager.createGrid('myGrid', {
                columnDefs,
                groupDisplayType: 'singleColumn',
                pivotMode: true,
            });

            const expected = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
            expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);

            await new GridColumns(gridApi, 'columns').checkColumns(`
                CENTER
                └── ag-Grid-AutoColumn "Group" width:200
            `);
        });

        test('groupDisplayType=multipleColumns displays auto column(s)', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b', rowGroup: true },
            ];

            const gridApi = gridsManager.createGrid('myGrid', {
                columnDefs,
                groupDisplayType: 'multipleColumns',
                pivotMode: true,
            });

            const expected = getAutoGroupColumnIds(columnDefs, 'multipleColumns', true);
            expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);

            await new GridColumns(gridApi, 'columns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-a width:200
                └── ag-Grid-AutoColumn-b width:200
            `);
        });

        test('groupDisplayType=groupRows displays auto column(s)', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b', rowGroup: true },
            ];

            const gridApi = gridsManager.createGrid('myGrid', {
                columnDefs,
                groupDisplayType: 'groupRows',
                pivotMode: true,
            });

            const expected = getAutoGroupColumnIds(columnDefs, 'groupRows', true);
            expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);

            await new GridColumns(gridApi, 'columns').checkColumns(`
                CENTER
                └── ag-Grid-AutoColumn "Group" width:200
            `);
        });
    });

    describe('with a pivoted column', () => {
        const rowData = [
            { a: '1', b: '1', c: 3 },
            { a: '1', b: '2', c: 3 },
            { a: '1', b: '3', c: 3 },
            { a: '2', b: '1', c: 3 },
            { a: '2', b: '2', c: 3 },
            { a: '2', b: '3', c: 3 },
        ];

        test('hides all primary columns', () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b', aggFunc: 'sum' },
                { colId: 'c', pivot: true, rowGroup: true },
            ];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, rowData, pivotMode: true });

            const expected = ['ag-Grid-AutoColumn', 'pivot_c__b'];
            expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);
        });

        test('displays pivot cols without row grouping', () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { field: 'b', pivot: true },
                { field: 'c', aggFunc: 'sum' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, rowData, pivotMode: true });

            const expected = ['pivot_b_1_c', 'pivot_b_2_c', 'pivot_b_3_c'];
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);
        });

        test('pivot cols are sorted alphabetically', () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { field: 'a', rowGroup: true },
                { field: 'b', pivot: true },
                { field: 'c', aggFunc: 'sum' },
            ];

            const rowData = [
                { a: 1, b: 'aa' },
                { a: 1, b: '5' },
                { a: 1, b: '51' },
                { a: 1, b: 'an' },
                { a: 1, b: '1' },
                { a: 1, b: 'd' },
                { a: 1, b: 'a' },
            ];
            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, rowData, pivotMode: true });

            const expected = [
                'ag-Grid-AutoColumn',
                'pivot_b_1_c',
                'pivot_b_5_c',
                'pivot_b_51_c',
                'pivot_b_a_c',
                'pivot_b_aa_c',
                'pivot_b_an_c',
                'pivot_b_d_c',
            ];
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);
        });

        test('pivot cols are sorted by pivot comparator', () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { field: 'a', rowGroup: true },
                { field: 'b', pivot: true, pivotComparator: (a, b) => -a.localeCompare(b) },
                { field: 'c', aggFunc: 'sum' },
            ];

            const rowData = [
                { a: 1, b: 'aa' },
                { a: 1, b: '5' },
                { a: 1, b: '51' },
                { a: 1, b: 'an' },
                { a: 1, b: '1' },
                { a: 1, b: 'd' },
                { a: 1, b: 'a' },
            ];
            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, rowData, pivotMode: true });

            const expected = [
                'ag-Grid-AutoColumn',
                'pivot_b_d_c',
                'pivot_b_an_c',
                'pivot_b_aa_c',
                'pivot_b_a_c',
                'pivot_b_51_c',
                'pivot_b_5_c',
                'pivot_b_1_c',
            ];
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);
        });

        test('displays pivot cols with row grouping', () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { field: 'a', rowGroup: true },
                { field: 'b', pivot: true },
                { field: 'c', aggFunc: 'sum' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, rowData, pivotMode: true });

            const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
            const expected = [...groupColIds, 'pivot_b_1_c', 'pivot_b_2_c', 'pivot_b_3_c'];
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);
        });

        test('pivot cols can be lockedPosition before the auto col', () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { field: 'a', rowGroup: true },
                { field: 'b', pivot: true },
                { field: 'c', aggFunc: 'sum' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData,
                pivotMode: true,
                processPivotResultColDef: (colDef) => {
                    colDef.lockPosition = 'left';
                },
            });

            const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
            const expected = ['pivot_b_1_c', 'pivot_b_2_c', 'pivot_b_3_c', ...groupColIds];
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);
        });

        test.each(['left', 'right'] as const)('pivot cols can be pinned=%s', (pinned) => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { field: 'a', rowGroup: true },
                { field: 'b', pivot: true },
                { field: 'c', aggFunc: 'sum' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData,
                pivotMode: true,
                processPivotResultColDef: (colDef) => {
                    colDef.pinned = pinned;
                },
            });

            const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
            const expected = ['pivot_b_1_c', 'pivot_b_2_c', 'pivot_b_3_c'];
            expect(getColumnOrder(gridApi, 'center')).toEqual(groupColIds);
            expect(getColumnOrder(gridApi, pinned)).toEqual(expected);
        });

        describe.each([
            [true, true],
            [true, false],
            [false, true],
            [false, false],
        ] as const)(
            'with maintainColumnOrder=%s and enableStrictPivotColumnOrder=%s, when toggling pivot mode, the column order is preserved',
            (maintainColumnOrder, enableStrictPivotColumnOrder) => {
                // see AG-12671
                test.skip('auto column order is preserved when leaving and returning to pivot mode', () => {
                    const columnDefs: (ColDef | ColGroupDef)[] = [
                        { field: 'a', rowGroup: true },
                        { field: 'b', pivot: true },
                        { field: 'c', aggFunc: 'sum' },
                    ];

                    const gridApi = gridsManager.createGrid('myGrid', {
                        columnDefs,
                        rowData,
                        pivotMode: true,
                        maintainColumnOrder,
                        enableStrictPivotColumnOrder,
                    });

                    const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
                    const initialExpected = [...groupColIds, 'pivot_b_1_c', 'pivot_b_2_c', 'pivot_b_3_c'];
                    expect(getColumnOrder(gridApi, 'center')).toEqual(initialExpected);

                    gridApi.moveColumns(['pivot_b_1_c'], 0);
                    const modifiedExpected = ['pivot_b_1_c', ...groupColIds, 'pivot_b_2_c', 'pivot_b_3_c'];
                    expect(getColumnOrder(gridApi, 'center')).toEqual(modifiedExpected);

                    gridApi.setGridOption('pivotMode', false);
                    expect(getColumnOrder(gridApi, 'center')).toEqual([...groupColIds, 'a', 'b', 'c']);

                    gridApi.setGridOption('pivotMode', true);
                    expect(getColumnOrder(gridApi, 'center')).toEqual(modifiedExpected);
                });

                // see AG-12671
                test.skip('auto column order is preserved when entering and then leaving pivot mode', () => {
                    const columnDefs: (ColDef | ColGroupDef)[] = [
                        { field: 'a', rowGroup: true },
                        { field: 'b', pivot: true },
                        { field: 'c', aggFunc: 'sum' },
                    ];

                    const gridApi = gridsManager.createGrid('myGrid', {
                        columnDefs,
                        rowData,
                        pivotMode: false,
                        maintainColumnOrder,
                    });

                    const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
                    expect(getColumnOrder(gridApi, 'center')).toEqual([...groupColIds, 'a', 'b', 'c']);

                    gridApi.moveColumns(['a'], 0);
                    const modifiedExpected = ['a', ...groupColIds, 'b', 'c'];
                    expect(getColumnOrder(gridApi, 'center')).toEqual(modifiedExpected);

                    gridApi.setGridOption('pivotMode', true);

                    const initialExpected = [...groupColIds, 'pivot_b_1_c', 'pivot_b_2_c', 'pivot_b_3_c'];
                    expect(getColumnOrder(gridApi, 'center')).toEqual(initialExpected);

                    gridApi.setGridOption('pivotMode', false);
                    expect(getColumnOrder(gridApi, 'center')).toEqual(modifiedExpected);
                });

                test('pivot result column order is preserved when leaving and returning to pivot mode', () => {
                    const columnDefs: (ColDef | ColGroupDef)[] = [
                        { field: 'a', rowGroup: true },
                        { field: 'b', pivot: true },
                        { field: 'c', aggFunc: 'sum' },
                    ];

                    const gridApi = gridsManager.createGrid('myGrid', {
                        columnDefs,
                        rowData,
                        pivotMode: true,
                        maintainColumnOrder,
                    });

                    const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
                    const initialExpected = [...groupColIds, 'pivot_b_1_c', 'pivot_b_2_c', 'pivot_b_3_c'];
                    expect(getColumnOrder(gridApi, 'center')).toEqual(initialExpected);

                    gridApi.moveColumns(['pivot_b_1_c'], 2);
                    const modifiedExpected = [...groupColIds, 'pivot_b_2_c', 'pivot_b_1_c', 'pivot_b_3_c'];
                    expect(getColumnOrder(gridApi, 'center')).toEqual(modifiedExpected);

                    gridApi.setGridOption('pivotMode', false);
                    expect(getColumnOrder(gridApi, 'center')).toEqual([...groupColIds, 'a', 'b', 'c']);

                    gridApi.setGridOption('pivotMode', true);
                    expect(getColumnOrder(gridApi, 'center')).toEqual(modifiedExpected);
                });

                test('primary column order is preserved when entering and leaving pivot mode', () => {
                    const columnDefs: (ColDef | ColGroupDef)[] = [
                        { field: 'a', rowGroup: true },
                        { field: 'b', pivot: true },
                        { field: 'c', aggFunc: 'sum' },
                    ];

                    const gridApi = gridsManager.createGrid('myGrid', {
                        columnDefs,
                        rowData,
                        maintainColumnOrder,
                    });

                    const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
                    const initialExpected = [...groupColIds, 'a', 'b', 'c'];
                    expect(getColumnOrder(gridApi, 'center')).toEqual(initialExpected);

                    gridApi.moveColumns(['a'], 2);
                    const modifiedExpected = [...groupColIds, 'b', 'a', 'c'];
                    expect(getColumnOrder(gridApi, 'center')).toEqual(modifiedExpected);

                    gridApi.setGridOption('pivotMode', true);
                    expect(getColumnOrder(gridApi, 'center')).toEqual([
                        ...groupColIds,
                        'pivot_b_1_c',
                        'pivot_b_2_c',
                        'pivot_b_3_c',
                    ]);

                    gridApi.setGridOption('pivotMode', false);
                    expect(getColumnOrder(gridApi, 'center')).toEqual(modifiedExpected);
                });
            }
        );

        test('runtime pivotComparator change re-sorts columns with enableStrictPivotColumnOrder=true', () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { field: 'a', rowGroup: true },
                { field: 'b', pivot: true },
                { field: 'c', aggFunc: 'sum' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData,
                pivotMode: true,
                enableStrictPivotColumnOrder: true,
            });

            const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
            const initialExpected = [...groupColIds, 'pivot_b_1_c', 'pivot_b_2_c', 'pivot_b_3_c'];
            expect(getColumnOrder(gridApi, 'center')).toEqual(initialExpected);

            // Update with a reverse comparator
            gridApi.setGridOption('columnDefs', [
                { field: 'a', rowGroup: true },
                { field: 'b', pivot: true, pivotComparator: (a, b) => -a.localeCompare(b) },
                { field: 'c', aggFunc: 'sum' },
            ]);

            const reversedExpected = [...groupColIds, 'pivot_b_3_c', 'pivot_b_2_c', 'pivot_b_1_c'];
            expect(getColumnOrder(gridApi, 'center')).toEqual(reversedExpected);
        });

        test('runtime pivotComparator change preserves column order with enableStrictPivotColumnOrder=false', () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { field: 'a', rowGroup: true },
                { field: 'b', pivot: true },
                { field: 'c', aggFunc: 'sum' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData,
                pivotMode: true,
                enableStrictPivotColumnOrder: false,
            });

            const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
            const initialExpected = [...groupColIds, 'pivot_b_1_c', 'pivot_b_2_c', 'pivot_b_3_c'];
            expect(getColumnOrder(gridApi, 'center')).toEqual(initialExpected);

            // Update with a reverse comparator — existing columns keep their order
            gridApi.setGridOption('columnDefs', [
                { field: 'a', rowGroup: true },
                { field: 'b', pivot: true, pivotComparator: (a, b) => -a.localeCompare(b) },
                { field: 'c', aggFunc: 'sum' },
            ]);

            expect(getColumnOrder(gridApi, 'center')).toEqual(initialExpected);
        });

        test('changing pivotComparator via setColumnDefs has no effect when enableStrictPivotColumnOrder=false', () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { field: 'a', rowGroup: true },
                { field: 'b', pivot: true, pivotComparator: (a, b) => -a.localeCompare(b) },
                { field: 'c', aggFunc: 'sum' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData,
                pivotMode: true,
                enableStrictPivotColumnOrder: false,
            });

            const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
            // Initial order sorted by reverse comparator
            const initialExpected = [...groupColIds, 'pivot_b_3_c', 'pivot_b_2_c', 'pivot_b_1_c'];
            expect(getColumnOrder(gridApi, 'center')).toEqual(initialExpected);

            // Switch to a forward (ascending) comparator — with strict mode off this should have no effect
            gridApi.setGridOption('columnDefs', [
                { field: 'a', rowGroup: true },
                { field: 'b', pivot: true, pivotComparator: (a, b) => a.localeCompare(b) },
                { field: 'c', aggFunc: 'sum' },
            ]);

            expect(getColumnOrder(gridApi, 'center')).toEqual(initialExpected);
        });

        test('stale closure pivotComparator is detected and re-sorts columns with enableStrictPivotColumnOrder=true', () => {
            let direction = 1;
            const comparator = (a: string, b: string) => direction * a.localeCompare(b);

            const columnDefs: (ColDef | ColGroupDef)[] = [
                { field: 'a', rowGroup: true },
                { field: 'b', pivot: true, pivotComparator: comparator },
                { field: 'c', aggFunc: 'sum' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData,
                pivotMode: true,
                enableStrictPivotColumnOrder: true,
                getRowId: ({ data }) => `${data.a}-${data.b}`,
            });

            const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
            expect(getColumnOrder(gridApi, 'center')).toEqual([
                ...groupColIds,
                'pivot_b_1_c',
                'pivot_b_2_c',
                'pivot_b_3_c',
            ]);

            // Mutate the closure variable without changing the function reference
            direction = -1;
            // Trigger the pivot stage via a data update that keeps the same set of pivot values
            applyTransactionChecked(gridApi, { update: [{ a: '1', b: '1', c: 99 }] });

            expect(getColumnOrder(gridApi, 'center')).toEqual([
                ...groupColIds,
                'pivot_b_3_c',
                'pivot_b_2_c',
                'pivot_b_1_c',
            ]);
        });

        test('stale closure pivotComparator changes are detected at each level in multi-level pivot with enableStrictPivotColumnOrder=true', () => {
            const multiLevelRowData = [
                { a: 'x', b: '1', c: 1 },
                { a: 'x', b: '2', c: 1 },
                { a: 'y', b: '1', c: 1 },
                { a: 'y', b: '2', c: 1 },
            ];

            let levelBDirection = 1;
            const comparatorB = (a: string, b: string) => levelBDirection * a.localeCompare(b);

            const columnDefs: (ColDef | ColGroupDef)[] = [
                { field: 'a', pivot: true },
                { field: 'b', pivot: true, pivotComparator: comparatorB },
                { field: 'c', aggFunc: 'sum' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: multiLevelRowData,
                pivotMode: true,
                enableStrictPivotColumnOrder: true,
                // suppressExpandablePivotGroups ensures leaf columns are always visible
                // (without it, collapsed outer groups show only their summary column)
                suppressExpandablePivotGroups: true,
                getRowId: ({ data }) => `${data.a}-${data.b}`,
            });

            // Level-A default (ascending: x, y), level-B ascending (1, 2)
            expect(getColumnOrder(gridApi, 'center')).toEqual([
                'pivot_a-b_x-1_c',
                'pivot_a-b_x-2_c',
                'pivot_a-b_y-1_c',
                'pivot_a-b_y-2_c',
            ]);

            // Mutate the level-B comparator closure without changing the function reference
            levelBDirection = -1;
            // Trigger the pivot stage via a data update that keeps the same set of pivot values
            applyTransactionChecked(gridApi, { update: [{ a: 'x', b: '1', c: 99 }] });

            // Level-B now descending (2, 1) within each level-A group
            expect(getColumnOrder(gridApi, 'center')).toEqual([
                'pivot_a-b_x-2_c',
                'pivot_a-b_x-1_c',
                'pivot_a-b_y-2_c',
                'pivot_a-b_y-1_c',
            ]);
        });

        test('toggling enableStrictPivotColumnOrder from false to true re-sorts columns', () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { field: 'a', rowGroup: true },
                { field: 'b', pivot: true, pivotComparator: (a, b) => -a.localeCompare(b) },
                { field: 'c', aggFunc: 'sum' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData,
                pivotMode: true,
                enableStrictPivotColumnOrder: false,
            });

            const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
            // Initial order uses comparator for creation, but restoreColOrder may reorder
            const reversedExpected = [...groupColIds, 'pivot_b_3_c', 'pivot_b_2_c', 'pivot_b_1_c'];
            expect(getColumnOrder(gridApi, 'center')).toEqual(reversedExpected);

            // Move a column to disrupt the sorted order
            gridApi.moveColumns(['pivot_b_1_c'], 1);
            const movedExpected = [...groupColIds, 'pivot_b_1_c', 'pivot_b_3_c', 'pivot_b_2_c'];
            expect(getColumnOrder(gridApi, 'center')).toEqual(movedExpected);

            // Toggle to strict — columns should re-sort
            gridApi.setGridOption('enableStrictPivotColumnOrder', true);
            expect(getColumnOrder(gridApi, 'center')).toEqual(reversedExpected);
        });

        describe('with enableStrictPivotColumnOrder=false', () => {
            test('new pivot result columns are added at the end when a pivot column filter is removed', () => {
                const columnDefs: (ColDef | ColGroupDef)[] = [
                    { field: 'a', rowGroup: true },
                    { field: 'b', pivot: true },
                    { field: 'c', aggFunc: 'sum' },
                ];

                const gridApi = gridsManager.createGrid('myGrid', {
                    columnDefs,
                    defaultColDef: {
                        filter: true,
                    },
                    rowData,
                    pivotMode: true,
                    enableStrictPivotColumnOrder: false,
                });

                const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
                const initialExpected = [...groupColIds, 'pivot_b_1_c', 'pivot_b_2_c', 'pivot_b_3_c'];
                expect(getColumnOrder(gridApi, 'center')).toEqual(initialExpected);

                gridApi.setFilterModel({ b: { filter: 3, filterType: 'number', type: 'equals' } });

                const filteredExpected = [...groupColIds, 'pivot_b_3_c'];
                expect(getColumnOrder(gridApi, 'center')).toEqual(filteredExpected);

                gridApi.setFilterModel({});
                const reorderedExpected = [...groupColIds, 'pivot_b_3_c', 'pivot_b_1_c', 'pivot_b_2_c'];
                expect(getColumnOrder(gridApi, 'center')).toEqual(reorderedExpected);
            });

            test('new pivot result columns are added at the end when a transaction introduces a new column', () => {
                const columnDefs: (ColDef | ColGroupDef)[] = [
                    { field: 'a', rowGroup: true },
                    { field: 'b', pivot: true },
                    { field: 'c', aggFunc: 'sum' },
                ];

                const gridApi = gridsManager.createGrid('myGrid', {
                    columnDefs,
                    rowData,
                    pivotMode: true,
                    enableStrictPivotColumnOrder: false,
                });

                const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
                const initialExpected = [...groupColIds, 'pivot_b_1_c', 'pivot_b_2_c', 'pivot_b_3_c'];
                expect(getColumnOrder(gridApi, 'center')).toEqual(initialExpected);

                applyTransactionChecked(gridApi, { add: [{ a: '3', b: '0', c: 3 }], addIndex: 0 });

                const reorderedExpected = [...groupColIds, 'pivot_b_1_c', 'pivot_b_2_c', 'pivot_b_3_c', 'pivot_b_0_c'];
                expect(getColumnOrder(gridApi, 'center')).toEqual(reorderedExpected);
            });

            test('multiple new pivot result columns introduced by a transaction are appended at the end ordered by pivotComparator', () => {
                // New columns are appended after all existing columns, but are ordered among themselves
                // by the pivotComparator.
                const columnDefs: (ColDef | ColGroupDef)[] = [
                    { field: 'a', rowGroup: true },
                    // Reverse comparator: initial order is 3, 2, 1
                    { field: 'b', pivot: true, pivotComparator: (a, b) => -a.localeCompare(b) },
                    { field: 'c', aggFunc: 'sum' },
                ];

                const gridApi = gridsManager.createGrid('myGrid', {
                    columnDefs,
                    rowData,
                    pivotMode: true,
                    enableStrictPivotColumnOrder: false,
                });

                const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);

                // Add two new pivot values simultaneously — '4' and '5', added in ascending order
                applyTransactionChecked(gridApi, {
                    add: [
                        { a: '1', b: '5', c: 3 },
                        { a: '1', b: '4', c: 3 },
                    ],
                });

                // Existing columns [3, 2, 1] keep their positions; new columns [5, 4] are appended
                // at the end, ordered among themselves by the reverse comparator (5 before 4)
                expect(getColumnOrder(gridApi, 'center')).toEqual([
                    ...groupColIds,
                    'pivot_b_3_c',
                    'pivot_b_2_c',
                    'pivot_b_1_c',
                    'pivot_b_5_c',
                    'pivot_b_4_c',
                ]);
            });

            test('new pivot result column introduced by a transaction is appended at the end even with a pivotComparator', () => {
                // With enableStrictPivotColumnOrder=false, new columns are always appended at the end of their
                // parent group to preserve any order changes the user may have made — the pivotComparator does
                // not control placement of new columns.
                const columnDefs: (ColDef | ColGroupDef)[] = [
                    { field: 'a', rowGroup: true },
                    // Reverse comparator: initial order is 3, 2, 1
                    { field: 'b', pivot: true, pivotComparator: (a, b) => -a.localeCompare(b) },
                    { field: 'c', aggFunc: 'sum' },
                ];

                const gridApi = gridsManager.createGrid('myGrid', {
                    columnDefs,
                    rowData,
                    pivotMode: true,
                    enableStrictPivotColumnOrder: false,
                });

                const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
                expect(getColumnOrder(gridApi, 'center')).toEqual([
                    ...groupColIds,
                    'pivot_b_3_c',
                    'pivot_b_2_c',
                    'pivot_b_1_c',
                ]);

                // Add '4' — the reverse comparator would place it before '3', but with
                // enableStrictPivotColumnOrder=false it is appended at the end instead
                applyTransactionChecked(gridApi, { add: [{ a: '1', b: '4', c: 3 }] });

                expect(getColumnOrder(gridApi, 'center')).toEqual([
                    ...groupColIds,
                    'pivot_b_3_c',
                    'pivot_b_2_c',
                    'pivot_b_1_c',
                    'pivot_b_4_c',
                ]);
            });
        });

        describe('with enableStrictPivotColumnOrder=true', () => {
            test('pivot result columns are reset when a pivot column filter is removed', () => {
                const columnDefs: (ColDef | ColGroupDef)[] = [
                    { field: 'a', rowGroup: true },
                    { field: 'b', pivot: true },
                    { field: 'c', aggFunc: 'sum' },
                ];

                const gridApi = gridsManager.createGrid('myGrid', {
                    columnDefs,
                    defaultColDef: {
                        filter: true,
                    },
                    rowData,
                    pivotMode: true,
                    enableStrictPivotColumnOrder: true,
                });

                const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
                const initialExpected = [...groupColIds, 'pivot_b_1_c', 'pivot_b_2_c', 'pivot_b_3_c'];
                expect(getColumnOrder(gridApi, 'center')).toEqual(initialExpected);

                gridApi.setFilterModel({ b: { filter: 3, filterType: 'number', type: 'equals' } });

                const filteredExpected = [...groupColIds, 'pivot_b_3_c'];
                expect(getColumnOrder(gridApi, 'center')).toEqual(filteredExpected);

                gridApi.setFilterModel({});
                expect(getColumnOrder(gridApi, 'center')).toEqual(initialExpected);
            });

            test('new pivot result columns are added at the ordered position when a transaction introduces a new column', () => {
                const columnDefs: (ColDef | ColGroupDef)[] = [
                    { field: 'a', rowGroup: true },
                    { field: 'b', pivot: true },
                    { field: 'c', aggFunc: 'sum' },
                ];

                const gridApi = gridsManager.createGrid('myGrid', {
                    columnDefs,
                    rowData,
                    pivotMode: true,
                    enableStrictPivotColumnOrder: true,
                });

                const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
                const initialExpected = [...groupColIds, 'pivot_b_1_c', 'pivot_b_2_c', 'pivot_b_3_c'];
                expect(getColumnOrder(gridApi, 'center')).toEqual(initialExpected);

                applyTransactionChecked(gridApi, { add: [{ a: '3', b: '0', c: 3 }], addIndex: 0 });

                const reorderedExpected = [...groupColIds, 'pivot_b_0_c', 'pivot_b_1_c', 'pivot_b_2_c', 'pivot_b_3_c'];
                expect(getColumnOrder(gridApi, 'center')).toEqual(reorderedExpected);
            });
        });
    });
});
