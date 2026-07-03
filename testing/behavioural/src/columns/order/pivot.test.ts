import type { ColDef, ColGroupDef } from 'ag-grid-community';
import { ClientSideRowModelModule, NumberFilterModule, TextFilterModule } from 'ag-grid-community';
import { PivotModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, applyTransactionChecked, asyncSetTimeout } from '../../test-utils';
import { getAutoGroupColumnIds, getColumnOrder, getColumnOrderFromState } from '../column-test-utils';

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

            const expected: string[] = [];
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

        test('hides all primary columns', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b', aggFunc: 'sum' },
                { colId: 'c', pivot: true, rowGroup: true },
            ];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, rowData, pivotMode: true });
            await new GridColumns(gridApi, `hides all primary columns setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └─┬ GROUP
                  └── pivot_c__b width:200 columnGroupShow:open
            `);
            await new GridRows(gridApi, `hides all primary columns setup`).check(`
                ROOT id:ROOT_NODE_ID pivot_c__b:null
                └─┬ filler collapsed id:row-group-a- ag-Grid-AutoColumn:"(Blanks)" pivot_c__b:null
                · └─┬ LEAF_GROUP collapsed hidden id:row-group-a--c- ag-Grid-AutoColumn:"(Blanks)" pivot_c__b:null
                · · ├── LEAF hidden id:0
                · · ├── LEAF hidden id:1
                · · ├── LEAF hidden id:2
                · · ├── LEAF hidden id:3
                · · ├── LEAF hidden id:4
                · · └── LEAF hidden id:5
            `);

            const expected = ['ag-Grid-AutoColumn', 'pivot_c__b'];
            expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);
            await new GridRows(gridApi, `hides all primary columns final state`).check(`
                ROOT id:ROOT_NODE_ID pivot_c__b:null
                └─┬ filler collapsed id:row-group-a- ag-Grid-AutoColumn:"(Blanks)" pivot_c__b:null
                · └─┬ LEAF_GROUP collapsed hidden id:row-group-a--c- ag-Grid-AutoColumn:"(Blanks)" pivot_c__b:null
                · · ├── LEAF hidden id:0
                · · ├── LEAF hidden id:1
                · · ├── LEAF hidden id:2
                · · ├── LEAF hidden id:3
                · · ├── LEAF hidden id:4
                · · └── LEAF hidden id:5
            `);
        });

        test('displays pivot cols without row grouping', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { field: 'b', pivot: true },
                { field: 'c', aggFunc: 'sum' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, rowData, pivotMode: true });
            await new GridColumns(gridApi, `displays pivot cols without row grouping setup`).checkColumns(`
                CENTER
                ├─┬ "1" GROUP
                │ └── pivot_b_1_c "C" width:200 columnGroupShow:open
                ├─┬ "2" GROUP
                │ └── pivot_b_2_c "C" width:200 columnGroupShow:open
                └─┬ "3" GROUP
                  └── pivot_b_3_c "C" width:200 columnGroupShow:open
            `);
            await new GridRows(gridApi, `displays pivot cols without row grouping setup`).check(`
                ROOT id:ROOT_NODE_ID pivot_b_1_c:6 pivot_b_2_c:6 pivot_b_3_c:6
                ROOT id:ROOT_NODE_ID pivot_b_1_c:6 pivot_b_2_c:6 pivot_b_3_c:6
                ├── LEAF hidden id:0 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                ├── LEAF hidden id:1 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                ├── LEAF hidden id:2 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                ├── LEAF hidden id:3 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                ├── LEAF hidden id:4 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                └── LEAF hidden id:5 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
            `);

            const expected = ['pivot_b_1_c', 'pivot_b_2_c', 'pivot_b_3_c'];
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);
            await new GridRows(gridApi, `displays pivot cols without row grouping final state`).check(`
                ROOT id:ROOT_NODE_ID pivot_b_1_c:6 pivot_b_2_c:6 pivot_b_3_c:6
                ROOT id:ROOT_NODE_ID pivot_b_1_c:6 pivot_b_2_c:6 pivot_b_3_c:6
                ├── LEAF hidden id:0 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                ├── LEAF hidden id:1 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                ├── LEAF hidden id:2 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                ├── LEAF hidden id:3 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                ├── LEAF hidden id:4 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                └── LEAF hidden id:5 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
            `);
        });

        test('pivot cols are sorted alphabetically', async () => {
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
            await new GridColumns(gridApi, `pivot cols are sorted alphabetically setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├─┬ "1" GROUP
                │ └── pivot_b_1_c "C" width:200 columnGroupShow:open
                ├─┬ "5" GROUP
                │ └── pivot_b_5_c "C" width:200 columnGroupShow:open
                ├─┬ "51" GROUP
                │ └── pivot_b_51_c "C" width:200 columnGroupShow:open
                ├─┬ "a" GROUP
                │ └── pivot_b_a_c "C" width:200 columnGroupShow:open
                ├─┬ "aa" GROUP
                │ └── pivot_b_aa_c "C" width:200 columnGroupShow:open
                ├─┬ "an" GROUP
                │ └── pivot_b_an_c "C" width:200 columnGroupShow:open
                └─┬ "d" GROUP
                  └── pivot_b_d_c "C" width:200 columnGroupShow:open
            `);
            await new GridRows(gridApi, `pivot cols are sorted alphabetically setup`).check(`
                ROOT id:ROOT_NODE_ID pivot_b_1_c:null pivot_b_5_c:null pivot_b_51_c:null pivot_b_a_c:null pivot_b_aa_c:null pivot_b_an_c:null pivot_b_d_c:null
                └─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:1 pivot_b_1_c:null pivot_b_5_c:null pivot_b_51_c:null pivot_b_a_c:null pivot_b_aa_c:null pivot_b_an_c:null pivot_b_d_c:null
                · ├── LEAF hidden id:0
                · ├── LEAF hidden id:1
                · ├── LEAF hidden id:2
                · ├── LEAF hidden id:3
                · ├── LEAF hidden id:4
                · ├── LEAF hidden id:5
                · └── LEAF hidden id:6
            `);

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
            await new GridRows(gridApi, `pivot cols are sorted alphabetically final state`).check(`
                ROOT id:ROOT_NODE_ID pivot_b_1_c:null pivot_b_5_c:null pivot_b_51_c:null pivot_b_a_c:null pivot_b_aa_c:null pivot_b_an_c:null pivot_b_d_c:null
                └─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:1 pivot_b_1_c:null pivot_b_5_c:null pivot_b_51_c:null pivot_b_a_c:null pivot_b_aa_c:null pivot_b_an_c:null pivot_b_d_c:null
                · ├── LEAF hidden id:0
                · ├── LEAF hidden id:1
                · ├── LEAF hidden id:2
                · ├── LEAF hidden id:3
                · ├── LEAF hidden id:4
                · ├── LEAF hidden id:5
                · └── LEAF hidden id:6
            `);
        });

        test('pivot cols are sorted by pivot comparator', async () => {
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
            await new GridColumns(gridApi, `pivot cols are sorted by pivot comparator setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├─┬ "d" GROUP
                │ └── pivot_b_d_c "C" width:200 columnGroupShow:open
                ├─┬ "an" GROUP
                │ └── pivot_b_an_c "C" width:200 columnGroupShow:open
                ├─┬ "aa" GROUP
                │ └── pivot_b_aa_c "C" width:200 columnGroupShow:open
                ├─┬ "a" GROUP
                │ └── pivot_b_a_c "C" width:200 columnGroupShow:open
                ├─┬ "51" GROUP
                │ └── pivot_b_51_c "C" width:200 columnGroupShow:open
                ├─┬ "5" GROUP
                │ └── pivot_b_5_c "C" width:200 columnGroupShow:open
                └─┬ "1" GROUP
                  └── pivot_b_1_c "C" width:200 columnGroupShow:open
            `);
            await new GridRows(gridApi, `pivot cols are sorted by pivot comparator setup`).check(`
                ROOT id:ROOT_NODE_ID pivot_b_d_c:null pivot_b_an_c:null pivot_b_aa_c:null pivot_b_a_c:null pivot_b_51_c:null pivot_b_5_c:null pivot_b_1_c:null
                └─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:1 pivot_b_d_c:null pivot_b_an_c:null pivot_b_aa_c:null pivot_b_a_c:null pivot_b_51_c:null pivot_b_5_c:null pivot_b_1_c:null
                · ├── LEAF hidden id:0
                · ├── LEAF hidden id:1
                · ├── LEAF hidden id:2
                · ├── LEAF hidden id:3
                · ├── LEAF hidden id:4
                · ├── LEAF hidden id:5
                · └── LEAF hidden id:6
            `);

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
            await new GridRows(gridApi, `pivot cols are sorted by pivot comparator final state`).check(`
                ROOT id:ROOT_NODE_ID pivot_b_d_c:null pivot_b_an_c:null pivot_b_aa_c:null pivot_b_a_c:null pivot_b_51_c:null pivot_b_5_c:null pivot_b_1_c:null
                └─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:1 pivot_b_d_c:null pivot_b_an_c:null pivot_b_aa_c:null pivot_b_a_c:null pivot_b_51_c:null pivot_b_5_c:null pivot_b_1_c:null
                · ├── LEAF hidden id:0
                · ├── LEAF hidden id:1
                · ├── LEAF hidden id:2
                · ├── LEAF hidden id:3
                · ├── LEAF hidden id:4
                · ├── LEAF hidden id:5
                · └── LEAF hidden id:6
            `);
        });

        test('displays pivot cols with row grouping', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { field: 'a', rowGroup: true },
                { field: 'b', pivot: true },
                { field: 'c', aggFunc: 'sum' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, rowData, pivotMode: true });
            await new GridColumns(gridApi, `displays pivot cols with row grouping setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├─┬ "1" GROUP
                │ └── pivot_b_1_c "C" width:200 columnGroupShow:open
                ├─┬ "2" GROUP
                │ └── pivot_b_2_c "C" width:200 columnGroupShow:open
                └─┬ "3" GROUP
                  └── pivot_b_3_c "C" width:200 columnGroupShow:open
            `);
            await new GridRows(gridApi, `displays pivot cols with row grouping setup`).check(`
                ROOT id:ROOT_NODE_ID pivot_b_1_c:6 pivot_b_2_c:6 pivot_b_3_c:6
                ├─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:"1" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                │ ├── LEAF hidden id:0 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                │ ├── LEAF hidden id:1 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                │ └── LEAF hidden id:2 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                └─┬ LEAF_GROUP collapsed id:row-group-a-2 ag-Grid-AutoColumn:"2" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                · ├── LEAF hidden id:3 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                · ├── LEAF hidden id:4 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                · └── LEAF hidden id:5 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
            `);

            const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
            const expected = [...groupColIds, 'pivot_b_1_c', 'pivot_b_2_c', 'pivot_b_3_c'];
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);
            await new GridRows(gridApi, `displays pivot cols with row grouping final state`).check(`
                ROOT id:ROOT_NODE_ID pivot_b_1_c:6 pivot_b_2_c:6 pivot_b_3_c:6
                ├─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:"1" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                │ ├── LEAF hidden id:0 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                │ ├── LEAF hidden id:1 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                │ └── LEAF hidden id:2 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                └─┬ LEAF_GROUP collapsed id:row-group-a-2 ag-Grid-AutoColumn:"2" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                · ├── LEAF hidden id:3 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                · ├── LEAF hidden id:4 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                · └── LEAF hidden id:5 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
            `);
        });

        test('pivot cols can be lockedPosition before the auto col', async () => {
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
            await new GridColumns(gridApi, `pivot cols can be lockedPosition before the auto col setup`).checkColumns(
                `
                    CENTER
                    ├─┬ "1" GROUP
                    │ └── pivot_b_1_c "C" width:200 columnGroupShow:open lockPosition:left
                    ├─┬ "2" GROUP
                    │ └── pivot_b_2_c "C" width:200 columnGroupShow:open lockPosition:left
                    ├─┬ "3" GROUP
                    │ └── pivot_b_3_c "C" width:200 columnGroupShow:open lockPosition:left
                    └── ag-Grid-AutoColumn "Group" width:200
                `
            );
            await new GridRows(gridApi, `pivot cols can be lockedPosition before the auto col setup`).check(`
                ROOT id:ROOT_NODE_ID pivot_b_1_c:6 pivot_b_2_c:6 pivot_b_3_c:6
                ├─┬ LEAF_GROUP collapsed id:row-group-a-1 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3 ag-Grid-AutoColumn:"1"
                │ ├── LEAF hidden id:0 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                │ ├── LEAF hidden id:1 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                │ └── LEAF hidden id:2 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                └─┬ LEAF_GROUP collapsed id:row-group-a-2 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3 ag-Grid-AutoColumn:"2"
                · ├── LEAF hidden id:3 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                · ├── LEAF hidden id:4 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                · └── LEAF hidden id:5 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
            `);

            const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
            const expected = ['pivot_b_1_c', 'pivot_b_2_c', 'pivot_b_3_c', ...groupColIds];
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);
            await new GridRows(gridApi, `pivot cols can be lockedPosition before the auto col final state`).check(`
                ROOT id:ROOT_NODE_ID pivot_b_1_c:6 pivot_b_2_c:6 pivot_b_3_c:6
                ├─┬ LEAF_GROUP collapsed id:row-group-a-1 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3 ag-Grid-AutoColumn:"1"
                │ ├── LEAF hidden id:0 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                │ ├── LEAF hidden id:1 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                │ └── LEAF hidden id:2 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                └─┬ LEAF_GROUP collapsed id:row-group-a-2 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3 ag-Grid-AutoColumn:"2"
                · ├── LEAF hidden id:3 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                · ├── LEAF hidden id:4 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                · └── LEAF hidden id:5 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
            `);
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
                test('auto column order is preserved when leaving and returning to pivot mode', () => {
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

                test('auto column order is preserved when entering and then leaving pivot mode', () => {
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

                test('pivot result column order is preserved when un-pivoting then re-pivoting the column', () => {
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

                    gridApi.moveColumns(['pivot_b_1_c'], 2);
                    const modifiedExpected = [...groupColIds, 'pivot_b_2_c', 'pivot_b_1_c', 'pivot_b_3_c'];
                    expect(getColumnOrder(gridApi, 'center')).toEqual(modifiedExpected);

                    // Un-pivoting `b` clears pivot result cols (executePivotOff → setPivotResultCols(null));
                    // re-pivoting rebuilds them and must restore the prior moved order.
                    gridApi.applyColumnState({ state: [{ colId: 'b', pivot: false }] });
                    expect(getColumnOrder(gridApi, 'center')).toEqual([...groupColIds, 'c']);

                    gridApi.applyColumnState({ state: [{ colId: 'b', pivot: true }] });
                    expect(getColumnOrder(gridApi, 'center')).toEqual(modifiedExpected);
                });

                test('pivot result column width + sort survive un-pivoting then re-pivoting', () => {
                    const columnDefs: (ColDef | ColGroupDef)[] = [
                        { field: 'a', rowGroup: true },
                        { field: 'b', pivot: true },
                        { field: 'c', aggFunc: 'sum', sortable: true },
                    ];

                    const gridApi = gridsManager.createGrid('myGrid', {
                        columnDefs,
                        rowData,
                        pivotMode: true,
                        maintainColumnOrder,
                        enableStrictPivotColumnOrder,
                    });

                    gridApi.applyColumnState({ state: [{ colId: 'pivot_b_1_c', width: 333, sort: 'desc' }] });
                    expect(gridApi.getColumn('pivot_b_1_c')!.getActualWidth()).toBe(333);
                    expect(gridApi.getColumn('pivot_b_1_c')!.getSort()).toBe('desc');

                    gridApi.applyColumnState({ state: [{ colId: 'b', pivot: false }] });
                    gridApi.applyColumnState({ state: [{ colId: 'b', pivot: true }] });

                    const after = gridApi.getColumn('pivot_b_1_c')!;
                    expect(after).toBeTruthy();
                    expect(after.getActualWidth()).toBe(333);
                    expect(after.getSort()).toBe('desc');
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

                test('moved auto-group col position is preserved when leaving and returning to pivot mode', () => {
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
                    const [autoId] = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
                    expect(getColumnOrder(gridApi, 'center')).toEqual([
                        autoId,
                        'pivot_b_1_c',
                        'pivot_b_2_c',
                        'pivot_b_3_c',
                    ]);

                    gridApi.moveColumns([autoId], 1);
                    const moved = ['pivot_b_1_c', autoId, 'pivot_b_2_c', 'pivot_b_3_c'];
                    expect(getColumnOrder(gridApi, 'center')).toEqual(moved);

                    gridApi.setGridOption('pivotMode', false);
                    gridApi.setGridOption('pivotMode', true);
                    expect(getColumnOrder(gridApi, 'center')).toEqual(moved);
                });

                test('moved auto-group col position is preserved when entering and then leaving pivot mode', () => {
                    const columnDefs: (ColDef | ColGroupDef)[] = [
                        { field: 'a', rowGroup: true },
                        { field: 'b', pivot: true },
                        { field: 'c', aggFunc: 'sum' },
                    ];
                    const gridApi = gridsManager.createGrid('myGrid', {
                        columnDefs,
                        rowData,
                        maintainColumnOrder,
                        enableStrictPivotColumnOrder,
                    });
                    const [autoId] = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
                    expect(getColumnOrder(gridApi, 'center')).toEqual([autoId, 'a', 'b', 'c']);

                    gridApi.moveColumns([autoId], 1);
                    const moved = ['a', autoId, 'b', 'c'];
                    expect(getColumnOrder(gridApi, 'center')).toEqual(moved);

                    gridApi.setGridOption('pivotMode', true);
                    gridApi.setGridOption('pivotMode', false);
                    expect(getColumnOrder(gridApi, 'center')).toEqual(moved);
                });
            }
        );

        test('runtime pivotComparator change re-sorts columns with enableStrictPivotColumnOrder=true', async () => {
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
            await new GridColumns(
                gridApi,
                `runtime pivotComparator change re-sorts columns with enableStrictPivotColumnOrde setup`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├─┬ "1" GROUP
                │ └── pivot_b_1_c "C" width:200 columnGroupShow:open
                ├─┬ "2" GROUP
                │ └── pivot_b_2_c "C" width:200 columnGroupShow:open
                └─┬ "3" GROUP
                  └── pivot_b_3_c "C" width:200 columnGroupShow:open
            `);
            await new GridRows(
                gridApi,
                `runtime pivotComparator change re-sorts columns with enableStrictPivotColumnOrde setup`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_b_1_c:6 pivot_b_2_c:6 pivot_b_3_c:6
                ├─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:"1" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                │ ├── LEAF hidden id:0 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                │ ├── LEAF hidden id:1 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                │ └── LEAF hidden id:2 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                └─┬ LEAF_GROUP collapsed id:row-group-a-2 ag-Grid-AutoColumn:"2" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                · ├── LEAF hidden id:3 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                · ├── LEAF hidden id:4 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                · └── LEAF hidden id:5 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
            `);

            const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
            const initialExpected = [...groupColIds, 'pivot_b_1_c', 'pivot_b_2_c', 'pivot_b_3_c'];
            expect(getColumnOrder(gridApi, 'center')).toEqual(initialExpected);

            // Update with a reverse comparator
            gridApi.setGridOption('columnDefs', [
                { field: 'a', rowGroup: true },
                { field: 'b', pivot: true, pivotComparator: (a, b) => -a.localeCompare(b) },
                { field: 'c', aggFunc: 'sum' },
            ]);
            await new GridColumns(
                gridApi,
                `runtime pivotComparator change re-sorts columns with enableStrictPivotColumnOrde after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├─┬ "3" GROUP
                │ └── pivot_b_3_c "C" width:200 columnGroupShow:open
                ├─┬ "2" GROUP
                │ └── pivot_b_2_c "C" width:200 columnGroupShow:open
                └─┬ "1" GROUP
                  └── pivot_b_1_c "C" width:200 columnGroupShow:open
            `);
            await new GridRows(
                gridApi,
                `runtime pivotComparator change re-sorts columns with enableStrictPivotColumnOrde after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_b_3_c:6 pivot_b_2_c:6 pivot_b_1_c:6
                ├─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:"1" pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                │ ├── LEAF hidden id:0 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                │ ├── LEAF hidden id:1 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                │ └── LEAF hidden id:2 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                └─┬ LEAF_GROUP collapsed id:row-group-a-2 ag-Grid-AutoColumn:"2" pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                · ├── LEAF hidden id:3 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                · ├── LEAF hidden id:4 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                · └── LEAF hidden id:5 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
            `);

            const reversedExpected = [...groupColIds, 'pivot_b_3_c', 'pivot_b_2_c', 'pivot_b_1_c'];
            expect(getColumnOrder(gridApi, 'center')).toEqual(reversedExpected);
        });

        test('runtime pivotComparator change preserves column order with enableStrictPivotColumnOrder=false', async () => {
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
            await new GridColumns(
                gridApi,
                `runtime pivotComparator change preserves column order with enableStrictPivotColu setup`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├─┬ "1" GROUP
                │ └── pivot_b_1_c "C" width:200 columnGroupShow:open
                ├─┬ "2" GROUP
                │ └── pivot_b_2_c "C" width:200 columnGroupShow:open
                └─┬ "3" GROUP
                  └── pivot_b_3_c "C" width:200 columnGroupShow:open
            `);
            await new GridRows(
                gridApi,
                `runtime pivotComparator change preserves column order with enableStrictPivotColu setup`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_b_1_c:6 pivot_b_2_c:6 pivot_b_3_c:6
                ├─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:"1" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                │ ├── LEAF hidden id:0 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                │ ├── LEAF hidden id:1 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                │ └── LEAF hidden id:2 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                └─┬ LEAF_GROUP collapsed id:row-group-a-2 ag-Grid-AutoColumn:"2" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                · ├── LEAF hidden id:3 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                · ├── LEAF hidden id:4 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                · └── LEAF hidden id:5 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
            `);

            const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
            const initialExpected = [...groupColIds, 'pivot_b_1_c', 'pivot_b_2_c', 'pivot_b_3_c'];
            expect(getColumnOrder(gridApi, 'center')).toEqual(initialExpected);

            // Update with a reverse comparator — existing columns keep their order
            gridApi.setGridOption('columnDefs', [
                { field: 'a', rowGroup: true },
                { field: 'b', pivot: true, pivotComparator: (a, b) => -a.localeCompare(b) },
                { field: 'c', aggFunc: 'sum' },
            ]);
            await new GridColumns(
                gridApi,
                `runtime pivotComparator change preserves column order with enableStrictPivotColu after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├─┬ "1" GROUP
                │ └── pivot_b_1_c "C" width:200 columnGroupShow:open
                ├─┬ "2" GROUP
                │ └── pivot_b_2_c "C" width:200 columnGroupShow:open
                └─┬ "3" GROUP
                  └── pivot_b_3_c "C" width:200 columnGroupShow:open
            `);
            await new GridRows(
                gridApi,
                `runtime pivotComparator change preserves column order with enableStrictPivotColu after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_b_1_c:6 pivot_b_2_c:6 pivot_b_3_c:6
                ├─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:"1" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                │ ├── LEAF hidden id:0 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                │ ├── LEAF hidden id:1 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                │ └── LEAF hidden id:2 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                └─┬ LEAF_GROUP collapsed id:row-group-a-2 ag-Grid-AutoColumn:"2" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                · ├── LEAF hidden id:3 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                · ├── LEAF hidden id:4 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                · └── LEAF hidden id:5 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
            `);

            expect(getColumnOrder(gridApi, 'center')).toEqual(initialExpected);
        });

        test('changing pivotComparator via setColumnDefs has no effect when enableStrictPivotColumnOrder=false', async () => {
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
            await new GridColumns(
                gridApi,
                `changing pivotComparator via setColumnDefs has no effect when enableStrictPivotC setup`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├─┬ "3" GROUP
                │ └── pivot_b_3_c "C" width:200 columnGroupShow:open
                ├─┬ "2" GROUP
                │ └── pivot_b_2_c "C" width:200 columnGroupShow:open
                └─┬ "1" GROUP
                  └── pivot_b_1_c "C" width:200 columnGroupShow:open
            `);
            await new GridRows(
                gridApi,
                `changing pivotComparator via setColumnDefs has no effect when enableStrictPivotC setup`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_b_3_c:6 pivot_b_2_c:6 pivot_b_1_c:6
                ├─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:"1" pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                │ ├── LEAF hidden id:0 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                │ ├── LEAF hidden id:1 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                │ └── LEAF hidden id:2 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                └─┬ LEAF_GROUP collapsed id:row-group-a-2 ag-Grid-AutoColumn:"2" pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                · ├── LEAF hidden id:3 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                · ├── LEAF hidden id:4 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                · └── LEAF hidden id:5 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
            `);

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
            await new GridColumns(
                gridApi,
                `changing pivotComparator via setColumnDefs has no effect when enableStrictPivotC after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├─┬ "3" GROUP
                │ └── pivot_b_3_c "C" width:200 columnGroupShow:open
                ├─┬ "2" GROUP
                │ └── pivot_b_2_c "C" width:200 columnGroupShow:open
                └─┬ "1" GROUP
                  └── pivot_b_1_c "C" width:200 columnGroupShow:open
            `);
            await new GridRows(
                gridApi,
                `changing pivotComparator via setColumnDefs has no effect when enableStrictPivotC after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_b_3_c:6 pivot_b_2_c:6 pivot_b_1_c:6
                ├─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:"1" pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                │ ├── LEAF hidden id:0 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                │ ├── LEAF hidden id:1 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                │ └── LEAF hidden id:2 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                └─┬ LEAF_GROUP collapsed id:row-group-a-2 ag-Grid-AutoColumn:"2" pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                · ├── LEAF hidden id:3 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                · ├── LEAF hidden id:4 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                · └── LEAF hidden id:5 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
            `);

            expect(getColumnOrder(gridApi, 'center')).toEqual(initialExpected);
        });

        test('stale closure pivotComparator is detected and re-sorts columns with enableStrictPivotColumnOrder=true', async () => {
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
            await new GridColumns(
                gridApi,
                `stale closure pivotComparator is detected and re-sorts columns with enableStrict setup`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├─┬ "1" GROUP
                │ └── pivot_b_1_c "C" width:200 columnGroupShow:open
                ├─┬ "2" GROUP
                │ └── pivot_b_2_c "C" width:200 columnGroupShow:open
                └─┬ "3" GROUP
                  └── pivot_b_3_c "C" width:200 columnGroupShow:open
            `);
            await new GridRows(
                gridApi,
                `stale closure pivotComparator is detected and re-sorts columns with enableStrict setup`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_b_1_c:6 pivot_b_2_c:6 pivot_b_3_c:6
                ├─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:"1" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                │ ├── LEAF hidden id:"1-1" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                │ ├── LEAF hidden id:"1-2" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                │ └── LEAF hidden id:"1-3" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                └─┬ LEAF_GROUP collapsed id:row-group-a-2 ag-Grid-AutoColumn:"2" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                · ├── LEAF hidden id:"2-1" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                · ├── LEAF hidden id:"2-2" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                · └── LEAF hidden id:"2-3" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
            `);

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
            await new GridRows(
                gridApi,
                `stale closure pivotComparator is detected and re-sorts columns with enableStrict final state`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_b_3_c:6 pivot_b_2_c:6 pivot_b_1_c:102
                ├─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:"1" pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:99
                │ ├── LEAF hidden id:"1-1" pivot_b_3_c:99 pivot_b_2_c:99 pivot_b_1_c:99
                │ ├── LEAF hidden id:"1-2" pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                │ └── LEAF hidden id:"1-3" pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                └─┬ LEAF_GROUP collapsed id:row-group-a-2 ag-Grid-AutoColumn:"2" pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                · ├── LEAF hidden id:"2-1" pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                · ├── LEAF hidden id:"2-2" pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                · └── LEAF hidden id:"2-3" pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
            `);
        });

        test('stale closure pivotComparator changes are detected at each level in multi-level pivot with enableStrictPivotColumnOrder=true', async () => {
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
            await new GridColumns(
                gridApi,
                `stale closure pivotComparator changes are detected at each level in multi-level  setup`
            ).checkColumns(`
                CENTER
                ├─┬ "x" GROUP
                │ ├─┬ "1" GROUP
                │ │ └── pivot_a-b_x-1_c "C" width:200 columnGroupShow:open
                │ └─┬ "2" GROUP
                │   └── pivot_a-b_x-2_c "C" width:200 columnGroupShow:open
                └─┬ "y" GROUP
                  ├─┬ "1" GROUP
                  │ └── pivot_a-b_y-1_c "C" width:200 columnGroupShow:open
                  └─┬ "2" GROUP
                    └── pivot_a-b_y-2_c "C" width:200 columnGroupShow:open
            `);
            await new GridRows(
                gridApi,
                `stale closure pivotComparator changes are detected at each level in multi-level  setup`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_a-b_x-1_c:1 pivot_a-b_x-2_c:1 pivot_a-b_y-1_c:1 pivot_a-b_y-2_c:1
                ROOT id:ROOT_NODE_ID pivot_a-b_x-1_c:1 pivot_a-b_x-2_c:1 pivot_a-b_y-1_c:1 pivot_a-b_y-2_c:1
                ├── LEAF hidden id:x-1 pivot_a-b_x-1_c:1 pivot_a-b_x-2_c:1 pivot_a-b_y-1_c:1 pivot_a-b_y-2_c:1
                ├── LEAF hidden id:x-2 pivot_a-b_x-1_c:1 pivot_a-b_x-2_c:1 pivot_a-b_y-1_c:1 pivot_a-b_y-2_c:1
                ├── LEAF hidden id:y-1 pivot_a-b_x-1_c:1 pivot_a-b_x-2_c:1 pivot_a-b_y-1_c:1 pivot_a-b_y-2_c:1
                └── LEAF hidden id:y-2 pivot_a-b_x-1_c:1 pivot_a-b_x-2_c:1 pivot_a-b_y-1_c:1 pivot_a-b_y-2_c:1
            `);

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
            await new GridRows(
                gridApi,
                `stale closure pivotComparator changes are detected at each level in multi-level  final state`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_a-b_x-2_c:1 pivot_a-b_x-1_c:99 pivot_a-b_y-2_c:1 pivot_a-b_y-1_c:1
                ROOT id:ROOT_NODE_ID pivot_a-b_x-2_c:1 pivot_a-b_x-1_c:99 pivot_a-b_y-2_c:1 pivot_a-b_y-1_c:1
                ├── LEAF hidden id:x-1 pivot_a-b_x-2_c:99 pivot_a-b_x-1_c:99 pivot_a-b_y-2_c:99 pivot_a-b_y-1_c:99
                ├── LEAF hidden id:x-2 pivot_a-b_x-2_c:1 pivot_a-b_x-1_c:1 pivot_a-b_y-2_c:1 pivot_a-b_y-1_c:1
                ├── LEAF hidden id:y-1 pivot_a-b_x-2_c:1 pivot_a-b_x-1_c:1 pivot_a-b_y-2_c:1 pivot_a-b_y-1_c:1
                └── LEAF hidden id:y-2 pivot_a-b_x-2_c:1 pivot_a-b_x-1_c:1 pivot_a-b_y-2_c:1 pivot_a-b_y-1_c:1
            `);
        });

        test('toggling enableStrictPivotColumnOrder from false to true re-sorts columns', async () => {
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
            await new GridColumns(
                gridApi,
                `toggling enableStrictPivotColumnOrder from false to true re-sorts columns setup`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├─┬ "3" GROUP
                │ └── pivot_b_3_c "C" width:200 columnGroupShow:open
                ├─┬ "2" GROUP
                │ └── pivot_b_2_c "C" width:200 columnGroupShow:open
                └─┬ "1" GROUP
                  └── pivot_b_1_c "C" width:200 columnGroupShow:open
            `);
            await new GridRows(
                gridApi,
                `toggling enableStrictPivotColumnOrder from false to true re-sorts columns setup`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_b_3_c:6 pivot_b_2_c:6 pivot_b_1_c:6
                ├─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:"1" pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                │ ├── LEAF hidden id:0 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                │ ├── LEAF hidden id:1 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                │ └── LEAF hidden id:2 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                └─┬ LEAF_GROUP collapsed id:row-group-a-2 ag-Grid-AutoColumn:"2" pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                · ├── LEAF hidden id:3 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                · ├── LEAF hidden id:4 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                · └── LEAF hidden id:5 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
            `);

            const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
            // Initial order uses comparator for creation, but restoreColOrder may reorder
            const reversedExpected = [...groupColIds, 'pivot_b_3_c', 'pivot_b_2_c', 'pivot_b_1_c'];
            expect(getColumnOrder(gridApi, 'center')).toEqual(reversedExpected);

            // Move a column to disrupt the sorted order
            gridApi.moveColumns(['pivot_b_1_c'], 1);
            await new GridColumns(
                gridApi,
                `toggling enableStrictPivotColumnOrder from false to true re-sorts columns after moveColumns`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├─┬ "1" GROUP
                │ └── pivot_b_1_c "C" width:200 columnGroupShow:open
                ├─┬ "3" GROUP
                │ └── pivot_b_3_c "C" width:200 columnGroupShow:open
                └─┬ "2" GROUP
                  └── pivot_b_2_c "C" width:200 columnGroupShow:open
            `);
            const movedExpected = [...groupColIds, 'pivot_b_1_c', 'pivot_b_3_c', 'pivot_b_2_c'];
            expect(getColumnOrder(gridApi, 'center')).toEqual(movedExpected);

            // Toggle to strict — columns should re-sort
            gridApi.setGridOption('enableStrictPivotColumnOrder', true);
            await new GridColumns(
                gridApi,
                `toggling enableStrictPivotColumnOrder from false to true re-sorts columns after setGridOption enableStrictPivotColumnOrder`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├─┬ "3" GROUP
                │ └── pivot_b_3_c "C" width:200 columnGroupShow:open
                ├─┬ "2" GROUP
                │ └── pivot_b_2_c "C" width:200 columnGroupShow:open
                └─┬ "1" GROUP
                  └── pivot_b_1_c "C" width:200 columnGroupShow:open
            `);
            await new GridRows(
                gridApi,
                `toggling enableStrictPivotColumnOrder from false to true re-sorts columns after setGridOption enableStrictPivotColumnOrder`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_b_3_c:6 pivot_b_2_c:6 pivot_b_1_c:6
                ├─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:"1" pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                │ ├── LEAF hidden id:0 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                │ ├── LEAF hidden id:1 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                │ └── LEAF hidden id:2 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                └─┬ LEAF_GROUP collapsed id:row-group-a-2 ag-Grid-AutoColumn:"2" pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                · ├── LEAF hidden id:3 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                · ├── LEAF hidden id:4 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                · └── LEAF hidden id:5 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
            `);
            expect(getColumnOrder(gridApi, 'center')).toEqual(reversedExpected);
        });

        describe('with enableStrictPivotColumnOrder=false', () => {
            test('new pivot result columns are added at the end when a pivot column filter is removed', async () => {
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
                await new GridColumns(
                    gridApi,
                    `new pivot result columns are added at the end when a pivot column filter is remo setup`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├─┬ "1" GROUP
                    │ └── pivot_b_1_c "C" width:200 columnGroupShow:open
                    ├─┬ "2" GROUP
                    │ └── pivot_b_2_c "C" width:200 columnGroupShow:open
                    └─┬ "3" GROUP
                      └── pivot_b_3_c "C" width:200 columnGroupShow:open
                `);
                await new GridRows(
                    gridApi,
                    `new pivot result columns are added at the end when a pivot column filter is remo setup`
                ).check(`
                    ROOT id:ROOT_NODE_ID pivot_b_1_c:6 pivot_b_2_c:6 pivot_b_3_c:6
                    ├─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:"1" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    │ ├── LEAF hidden id:0 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    │ ├── LEAF hidden id:1 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    │ └── LEAF hidden id:2 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    └─┬ LEAF_GROUP collapsed id:row-group-a-2 ag-Grid-AutoColumn:"2" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    · ├── LEAF hidden id:3 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    · ├── LEAF hidden id:4 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    · └── LEAF hidden id:5 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                `);

                const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
                const initialExpected = [...groupColIds, 'pivot_b_1_c', 'pivot_b_2_c', 'pivot_b_3_c'];
                expect(getColumnOrder(gridApi, 'center')).toEqual(initialExpected);

                gridApi.setFilterModel({ b: { filter: 3, filterType: 'number', type: 'equals' } });
                await new GridRows(
                    gridApi,
                    `new pivot result columns are added at the end when a pivot column filter is remo after setFilterModel`
                ).check(`
                    ROOT id:ROOT_NODE_ID pivot_b_3_c:6
                    ├─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:"1" pivot_b_3_c:3
                    │ └── LEAF hidden id:2 pivot_b_3_c:3
                    └─┬ LEAF_GROUP collapsed id:row-group-a-2 ag-Grid-AutoColumn:"2" pivot_b_3_c:3
                    · └── LEAF hidden id:5 pivot_b_3_c:3
                `);

                const filteredExpected = [...groupColIds, 'pivot_b_3_c'];
                expect(getColumnOrder(gridApi, 'center')).toEqual(filteredExpected);

                gridApi.setFilterModel({});
                await new GridRows(
                    gridApi,
                    `new pivot result columns are added at the end when a pivot column filter is remo after setFilterModel #2`
                ).check(`
                    ROOT id:ROOT_NODE_ID pivot_b_3_c:6 pivot_b_1_c:6 pivot_b_2_c:6
                    ├─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:"1" pivot_b_3_c:3 pivot_b_1_c:3 pivot_b_2_c:3
                    │ ├── LEAF hidden id:0 pivot_b_3_c:3 pivot_b_1_c:3 pivot_b_2_c:3
                    │ ├── LEAF hidden id:1 pivot_b_3_c:3 pivot_b_1_c:3 pivot_b_2_c:3
                    │ └── LEAF hidden id:2 pivot_b_3_c:3 pivot_b_1_c:3 pivot_b_2_c:3
                    └─┬ LEAF_GROUP collapsed id:row-group-a-2 ag-Grid-AutoColumn:"2" pivot_b_3_c:3 pivot_b_1_c:3 pivot_b_2_c:3
                    · ├── LEAF hidden id:3 pivot_b_3_c:3 pivot_b_1_c:3 pivot_b_2_c:3
                    · ├── LEAF hidden id:4 pivot_b_3_c:3 pivot_b_1_c:3 pivot_b_2_c:3
                    · └── LEAF hidden id:5 pivot_b_3_c:3 pivot_b_1_c:3 pivot_b_2_c:3
                `);
                const reorderedExpected = [...groupColIds, 'pivot_b_3_c', 'pivot_b_1_c', 'pivot_b_2_c'];
                expect(getColumnOrder(gridApi, 'center')).toEqual(reorderedExpected);
            });

            test('new pivot result columns are added at the end when a transaction introduces a new column', async () => {
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
                await new GridColumns(
                    gridApi,
                    `new pivot result columns are added at the end when a transaction introduces a ne setup`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├─┬ "1" GROUP
                    │ └── pivot_b_1_c "C" width:200 columnGroupShow:open
                    ├─┬ "2" GROUP
                    │ └── pivot_b_2_c "C" width:200 columnGroupShow:open
                    └─┬ "3" GROUP
                      └── pivot_b_3_c "C" width:200 columnGroupShow:open
                `);
                await new GridRows(
                    gridApi,
                    `new pivot result columns are added at the end when a transaction introduces a ne setup`
                ).check(`
                    ROOT id:ROOT_NODE_ID pivot_b_1_c:6 pivot_b_2_c:6 pivot_b_3_c:6
                    ├─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:"1" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    │ ├── LEAF hidden id:0 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    │ ├── LEAF hidden id:1 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    │ └── LEAF hidden id:2 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    └─┬ LEAF_GROUP collapsed id:row-group-a-2 ag-Grid-AutoColumn:"2" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    · ├── LEAF hidden id:3 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    · ├── LEAF hidden id:4 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    · └── LEAF hidden id:5 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                `);

                const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
                const initialExpected = [...groupColIds, 'pivot_b_1_c', 'pivot_b_2_c', 'pivot_b_3_c'];
                expect(getColumnOrder(gridApi, 'center')).toEqual(initialExpected);

                applyTransactionChecked(gridApi, { add: [{ a: '3', b: '0', c: 3 }], addIndex: 0 });

                const reorderedExpected = [...groupColIds, 'pivot_b_1_c', 'pivot_b_2_c', 'pivot_b_3_c', 'pivot_b_0_c'];
                expect(getColumnOrder(gridApi, 'center')).toEqual(reorderedExpected);
                await new GridRows(
                    gridApi,
                    `new pivot result columns are added at the end when a transaction introduces a ne final state`
                ).check(`
                    ROOT id:ROOT_NODE_ID pivot_b_1_c:6 pivot_b_2_c:6 pivot_b_3_c:6 pivot_b_0_c:3
                    ├─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:"1" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3 pivot_b_0_c:null
                    │ ├── LEAF hidden id:0 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3 pivot_b_0_c:3
                    │ ├── LEAF hidden id:1 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3 pivot_b_0_c:3
                    │ └── LEAF hidden id:2 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3 pivot_b_0_c:3
                    ├─┬ LEAF_GROUP collapsed id:row-group-a-2 ag-Grid-AutoColumn:"2" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3 pivot_b_0_c:null
                    │ ├── LEAF hidden id:3 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3 pivot_b_0_c:3
                    │ ├── LEAF hidden id:4 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3 pivot_b_0_c:3
                    │ └── LEAF hidden id:5 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3 pivot_b_0_c:3
                    └─┬ LEAF_GROUP collapsed id:row-group-a-3 ag-Grid-AutoColumn:"3" pivot_b_1_c:null pivot_b_2_c:null pivot_b_3_c:null pivot_b_0_c:3
                    · └── LEAF hidden id:6 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3 pivot_b_0_c:3
                `);
            });

            test('multiple new pivot result columns introduced by a transaction are appended at the end ordered by pivotComparator', async () => {
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
                await new GridColumns(
                    gridApi,
                    `multiple new pivot result columns introduced by a transaction are appended at th setup`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├─┬ "3" GROUP
                    │ └── pivot_b_3_c "C" width:200 columnGroupShow:open
                    ├─┬ "2" GROUP
                    │ └── pivot_b_2_c "C" width:200 columnGroupShow:open
                    └─┬ "1" GROUP
                      └── pivot_b_1_c "C" width:200 columnGroupShow:open
                `);
                await new GridRows(
                    gridApi,
                    `multiple new pivot result columns introduced by a transaction are appended at th setup`
                ).check(`
                    ROOT id:ROOT_NODE_ID pivot_b_3_c:6 pivot_b_2_c:6 pivot_b_1_c:6
                    ├─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:"1" pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                    │ ├── LEAF hidden id:0 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                    │ ├── LEAF hidden id:1 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                    │ └── LEAF hidden id:2 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                    └─┬ LEAF_GROUP collapsed id:row-group-a-2 ag-Grid-AutoColumn:"2" pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                    · ├── LEAF hidden id:3 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                    · ├── LEAF hidden id:4 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                    · └── LEAF hidden id:5 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                `);

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
                await new GridRows(
                    gridApi,
                    `multiple new pivot result columns introduced by a transaction are appended at th final state`
                ).check(`
                    ROOT id:ROOT_NODE_ID pivot_b_3_c:6 pivot_b_2_c:6 pivot_b_1_c:6 pivot_b_5_c:3 pivot_b_4_c:3
                    ├─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:"1" pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3 pivot_b_5_c:3 pivot_b_4_c:3
                    │ ├── LEAF hidden id:0 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3 pivot_b_5_c:3 pivot_b_4_c:3
                    │ ├── LEAF hidden id:1 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3 pivot_b_5_c:3 pivot_b_4_c:3
                    │ ├── LEAF hidden id:2 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3 pivot_b_5_c:3 pivot_b_4_c:3
                    │ ├── LEAF hidden id:6 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3 pivot_b_5_c:3 pivot_b_4_c:3
                    │ └── LEAF hidden id:7 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3 pivot_b_5_c:3 pivot_b_4_c:3
                    └─┬ LEAF_GROUP collapsed id:row-group-a-2 ag-Grid-AutoColumn:"2" pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3 pivot_b_5_c:null pivot_b_4_c:null
                    · ├── LEAF hidden id:3 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3 pivot_b_5_c:3 pivot_b_4_c:3
                    · ├── LEAF hidden id:4 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3 pivot_b_5_c:3 pivot_b_4_c:3
                    · └── LEAF hidden id:5 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3 pivot_b_5_c:3 pivot_b_4_c:3
                `);
            });

            test('new pivot result column introduced by a transaction is appended at the end even with a pivotComparator', async () => {
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
                await new GridColumns(
                    gridApi,
                    `new pivot result column introduced by a transaction is appended at the end even  setup`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├─┬ "3" GROUP
                    │ └── pivot_b_3_c "C" width:200 columnGroupShow:open
                    ├─┬ "2" GROUP
                    │ └── pivot_b_2_c "C" width:200 columnGroupShow:open
                    └─┬ "1" GROUP
                      └── pivot_b_1_c "C" width:200 columnGroupShow:open
                `);
                await new GridRows(
                    gridApi,
                    `new pivot result column introduced by a transaction is appended at the end even  setup`
                ).check(`
                    ROOT id:ROOT_NODE_ID pivot_b_3_c:6 pivot_b_2_c:6 pivot_b_1_c:6
                    ├─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:"1" pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                    │ ├── LEAF hidden id:0 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                    │ ├── LEAF hidden id:1 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                    │ └── LEAF hidden id:2 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                    └─┬ LEAF_GROUP collapsed id:row-group-a-2 ag-Grid-AutoColumn:"2" pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                    · ├── LEAF hidden id:3 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                    · ├── LEAF hidden id:4 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                    · └── LEAF hidden id:5 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3
                `);

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
                await new GridRows(
                    gridApi,
                    `new pivot result column introduced by a transaction is appended at the end even  final state`
                ).check(`
                    ROOT id:ROOT_NODE_ID pivot_b_3_c:6 pivot_b_2_c:6 pivot_b_1_c:6 pivot_b_4_c:3
                    ├─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:"1" pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3 pivot_b_4_c:3
                    │ ├── LEAF hidden id:0 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3 pivot_b_4_c:3
                    │ ├── LEAF hidden id:1 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3 pivot_b_4_c:3
                    │ ├── LEAF hidden id:2 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3 pivot_b_4_c:3
                    │ └── LEAF hidden id:6 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3 pivot_b_4_c:3
                    └─┬ LEAF_GROUP collapsed id:row-group-a-2 ag-Grid-AutoColumn:"2" pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3 pivot_b_4_c:null
                    · ├── LEAF hidden id:3 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3 pivot_b_4_c:3
                    · ├── LEAF hidden id:4 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3 pivot_b_4_c:3
                    · └── LEAF hidden id:5 pivot_b_3_c:3 pivot_b_2_c:3 pivot_b_1_c:3 pivot_b_4_c:3
                `);
            });
        });

        describe('with enableStrictPivotColumnOrder=true', () => {
            test('pivot result columns are reset when a pivot column filter is removed', async () => {
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
                await new GridColumns(
                    gridApi,
                    `pivot result columns are reset when a pivot column filter is removed setup`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├─┬ "1" GROUP
                    │ └── pivot_b_1_c "C" width:200 columnGroupShow:open
                    ├─┬ "2" GROUP
                    │ └── pivot_b_2_c "C" width:200 columnGroupShow:open
                    └─┬ "3" GROUP
                      └── pivot_b_3_c "C" width:200 columnGroupShow:open
                `);
                await new GridRows(
                    gridApi,
                    `pivot result columns are reset when a pivot column filter is removed setup`
                ).check(`
                    ROOT id:ROOT_NODE_ID pivot_b_1_c:6 pivot_b_2_c:6 pivot_b_3_c:6
                    ├─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:"1" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    │ ├── LEAF hidden id:0 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    │ ├── LEAF hidden id:1 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    │ └── LEAF hidden id:2 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    └─┬ LEAF_GROUP collapsed id:row-group-a-2 ag-Grid-AutoColumn:"2" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    · ├── LEAF hidden id:3 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    · ├── LEAF hidden id:4 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    · └── LEAF hidden id:5 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                `);

                const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
                const initialExpected = [...groupColIds, 'pivot_b_1_c', 'pivot_b_2_c', 'pivot_b_3_c'];
                expect(getColumnOrder(gridApi, 'center')).toEqual(initialExpected);

                gridApi.setFilterModel({ b: { filter: 3, filterType: 'number', type: 'equals' } });
                await new GridRows(
                    gridApi,
                    `pivot result columns are reset when a pivot column filter is removed after setFilterModel`
                ).check(`
                    ROOT id:ROOT_NODE_ID pivot_b_3_c:6
                    ├─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:"1" pivot_b_3_c:3
                    │ └── LEAF hidden id:2 pivot_b_3_c:3
                    └─┬ LEAF_GROUP collapsed id:row-group-a-2 ag-Grid-AutoColumn:"2" pivot_b_3_c:3
                    · └── LEAF hidden id:5 pivot_b_3_c:3
                `);

                const filteredExpected = [...groupColIds, 'pivot_b_3_c'];
                expect(getColumnOrder(gridApi, 'center')).toEqual(filteredExpected);

                gridApi.setFilterModel({});
                await new GridRows(
                    gridApi,
                    `pivot result columns are reset when a pivot column filter is removed after setFilterModel #2`
                ).check(`
                    ROOT id:ROOT_NODE_ID pivot_b_1_c:6 pivot_b_2_c:6 pivot_b_3_c:6
                    ├─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:"1" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    │ ├── LEAF hidden id:0 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    │ ├── LEAF hidden id:1 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    │ └── LEAF hidden id:2 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    └─┬ LEAF_GROUP collapsed id:row-group-a-2 ag-Grid-AutoColumn:"2" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    · ├── LEAF hidden id:3 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    · ├── LEAF hidden id:4 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    · └── LEAF hidden id:5 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                `);
                expect(getColumnOrder(gridApi, 'center')).toEqual(initialExpected);
            });

            test('new pivot result columns are added at the ordered position when a transaction introduces a new column', async () => {
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
                await new GridColumns(
                    gridApi,
                    `new pivot result columns are added at the ordered position when a transaction in setup`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├─┬ "1" GROUP
                    │ └── pivot_b_1_c "C" width:200 columnGroupShow:open
                    ├─┬ "2" GROUP
                    │ └── pivot_b_2_c "C" width:200 columnGroupShow:open
                    └─┬ "3" GROUP
                      └── pivot_b_3_c "C" width:200 columnGroupShow:open
                `);
                await new GridRows(
                    gridApi,
                    `new pivot result columns are added at the ordered position when a transaction in setup`
                ).check(`
                    ROOT id:ROOT_NODE_ID pivot_b_1_c:6 pivot_b_2_c:6 pivot_b_3_c:6
                    ├─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:"1" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    │ ├── LEAF hidden id:0 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    │ ├── LEAF hidden id:1 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    │ └── LEAF hidden id:2 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    └─┬ LEAF_GROUP collapsed id:row-group-a-2 ag-Grid-AutoColumn:"2" pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    · ├── LEAF hidden id:3 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    · ├── LEAF hidden id:4 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    · └── LEAF hidden id:5 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                `);

                const groupColIds = getAutoGroupColumnIds(columnDefs, 'singleColumn', true);
                const initialExpected = [...groupColIds, 'pivot_b_1_c', 'pivot_b_2_c', 'pivot_b_3_c'];
                expect(getColumnOrder(gridApi, 'center')).toEqual(initialExpected);

                applyTransactionChecked(gridApi, { add: [{ a: '3', b: '0', c: 3 }], addIndex: 0 });

                const reorderedExpected = [...groupColIds, 'pivot_b_0_c', 'pivot_b_1_c', 'pivot_b_2_c', 'pivot_b_3_c'];
                expect(getColumnOrder(gridApi, 'center')).toEqual(reorderedExpected);
                await new GridRows(
                    gridApi,
                    `new pivot result columns are added at the ordered position when a transaction in final state`
                ).check(`
                    ROOT id:ROOT_NODE_ID pivot_b_0_c:3 pivot_b_1_c:6 pivot_b_2_c:6 pivot_b_3_c:6
                    ├─┬ LEAF_GROUP collapsed id:row-group-a-1 ag-Grid-AutoColumn:"1" pivot_b_0_c:null pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    │ ├── LEAF hidden id:0 pivot_b_0_c:3 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    │ ├── LEAF hidden id:1 pivot_b_0_c:3 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    │ └── LEAF hidden id:2 pivot_b_0_c:3 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    ├─┬ LEAF_GROUP collapsed id:row-group-a-2 ag-Grid-AutoColumn:"2" pivot_b_0_c:null pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    │ ├── LEAF hidden id:3 pivot_b_0_c:3 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    │ ├── LEAF hidden id:4 pivot_b_0_c:3 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    │ └── LEAF hidden id:5 pivot_b_0_c:3 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                    └─┬ LEAF_GROUP collapsed id:row-group-a-3 ag-Grid-AutoColumn:"3" pivot_b_0_c:3 pivot_b_1_c:null pivot_b_2_c:null pivot_b_3_c:null
                    · └── LEAF hidden id:6 pivot_b_0_c:3 pivot_b_1_c:3 pivot_b_2_c:3 pivot_b_3_c:3
                `);
            });
        });
    });

    const pivotOrder = (api: { getColumnState: () => { colId?: string }[] }): string[] =>
        getColumnOrderFromState(api as any).filter((id): id is string => !!id?.startsWith('pivot_'));

    // Example 1: 3 pivot keys, two value cols per group (sport `last` + total `sum`).
    test('re-sorts pivot columns on re-entry when the comparator changes (3 keys, 2 value cols)', () => {
        let order = 1;
        const columnDefs: (ColDef | ColGroupDef)[] = [
            {
                field: 'sport',
                pivot: true,
                aggFunc: 'last',
                pivotComparator: (a, b) => order * String(a).localeCompare(String(b)),
            },
            { field: 'total', aggFunc: 'sum' },
        ];
        const api = gridsManager.createGrid('g', {
            columnDefs,
            rowData: [
                { sport: '_EUR062', total: 2 },
                { sport: '004655', total: 3 },
                { sport: 'ZZZ_test', total: 1 },
            ],
            enableStrictPivotColumnOrder: true,
            pivotMode: true,
        });

        const first = pivotOrder(api);

        api.setGridOption('pivotMode', false);
        order = -1; // flip the comparator while out of pivot mode
        api.setGridOption('pivotMode', true);

        // The pivot GROUPS reverse; each group keeps its (sport, total) value-col order.
        const groups = [first.slice(0, 2), first.slice(2, 4), first.slice(4, 6)];
        expect(pivotOrder(api)).toEqual(groups.reverse().flat());
    });

    // Example 2: 2 pivot keys, one value col per group.
    test('re-sorts pivot columns on re-entry when the comparator changes (2 keys)', () => {
        let order = 1;
        const columnDefs: (ColDef | ColGroupDef)[] = [
            {
                field: 'sport',
                pivot: true,
                sortable: true,
                pivotComparator: (a, b) => order * String(a).localeCompare(String(b)),
            },
            { field: 'total', aggFunc: 'sum' },
        ];
        const api = gridsManager.createGrid('g', {
            columnDefs,
            rowData: [
                { sport: '_EUR062', total: 2 },
                { sport: 'ZZZ_test', total: 1 },
            ],
            enableStrictPivotColumnOrder: true,
            pivotMode: true,
        });

        const first = pivotOrder(api);
        expect(first.length).toBe(2);

        api.setGridOption('pivotMode', false);
        order = -1;
        api.setGridOption('pivotMode', true);

        expect(pivotOrder(api)).toEqual([...first].reverse());
    });

    describe('pivot toggle preserves primary column live state', () => {
        test('runtime pinned + width on a primary column survive toggling pivotMode on then off', async () => {
            const api = gridsManager.createGrid('myGrid', {
                rowData: [{ country: 'US', sport: 'swim', val: 1 }],
                columnDefs: [
                    { field: 'country', pinned: 'left' },
                    { field: 'sport', pivot: true },
                    { field: 'val', aggFunc: 'sum' },
                ],
            });
            await asyncSetTimeout(0);

            api.setColumnsPinned(['country'], null);
            api.applyColumnState({ state: [{ colId: 'country', width: 333 }] });
            await asyncSetTimeout(0);
            expect(api.getColumn('country')!.getPinned()).toBeNull();
            expect(api.getColumn('country')!.getActualWidth()).toBe(333);

            api.setGridOption('pivotMode', true);
            await asyncSetTimeout(0);
            api.setGridOption('pivotMode', false);
            await asyncSetTimeout(0);

            expect(api.getColumn('country')!.getPinned()).toBeNull();
            expect(api.getColumn('country')!.getActualWidth()).toBe(333);
            await new GridColumns(api, 'primary live state preserved after pivot toggle').checkColumns(`
                CENTER
                ├── country "Country" width:333
                ├── sport "Sport" width:200 pivot
                └── val "Val" width:200 aggFunc:sum
            `);
            await new GridRows(api, 'primary live state preserved after pivot toggle - rows').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 country:"US" sport:"swim" val:1
            `);
        });
    });
});
