import type { IAggFuncParams } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, cachedJSONObjects } from '../test-utils';

describe('ag-grid aggregation call count with aggregateOnlyChangedColumns', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    // Reproduces the scenario from the change-detection-delta-aggregation docs example.
    // Data: 2 top groups × 5 sub-groups × 3 leaves = 30 rows.
    // Group tree: 2 top-level + 10 second-level = 12 group nodes.
    // 4 value columns (a, b, c, d) with aggFunc → 4 × 12 = 48 aggregation calls on init.
    // A Total column with only a valueGetter (no aggFunc) should NOT add extra calls.
    test('initial aggregation call count is 4 columns × 12 groups = 48', async () => {
        let aggCallCount = 0;
        const countingSum = (params: IAggFuncParams) => {
            aggCallCount++;
            let result = 0;
            for (const value of params.values) {
                if (typeof value === 'number') {
                    result += value;
                }
            }
            return result;
        };

        const rowData = cachedJSONObjects.array(createRowData());

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'topGroup', rowGroup: true, hide: true },
                { field: 'group', rowGroup: true, hide: true },
                { field: 'a', aggFunc: countingSum },
                { field: 'b', aggFunc: countingSum },
                { field: 'c', aggFunc: countingSum },
                { field: 'd', aggFunc: countingSum },
                {
                    headerName: 'Total',
                    colId: 'total',
                    valueGetter: 'getValue("a") + getValue("b") + getValue("c") + getValue("d")',
                },
            ],
            autoGroupColumnDef: { minWidth: 180 },
            animateRows: false,
            groupDefaultExpanded: 1,
            aggregateOnlyChangedColumns: true,
            rowData,
            getRowId: (params) => String(params.data.id),
        });

        // Verify the grid structure is correct
        await new GridRows(api, 'initial', { checkDom: false }).check(`
            ROOT id:ROOT_NODE_ID total:NaN
            ├─┬ filler id:row-group-topGroup-Top ag-Grid-AutoColumn:"Top" a:770 b:690 c:770 d:730 total:2960
            │ ├─┬ LEAF_GROUP collapsed id:"row-group-topGroup-Top-group-Group A1" ag-Grid-AutoColumn:"Group A1" a:178 b:66 c:158 d:162 total:564
            │ │ ├── LEAF hidden id:0 topGroup:"Top" group:"Group A1" a:63 b:11 c:43 d:77 total:194
            │ │ ├── LEAF hidden id:1 topGroup:"Top" group:"Group A1" a:26 b:22 c:86 d:54 total:188
            │ │ └── LEAF hidden id:2 topGroup:"Top" group:"Group A1" a:89 b:33 c:29 d:31 total:182
            │ ├─┬ LEAF_GROUP collapsed id:"row-group-topGroup-Top-group-Group A2" ag-Grid-AutoColumn:"Group A2" a:156 b:132 c:216 d:124 total:628
            │ │ ├── LEAF hidden id:3 topGroup:"Top" group:"Group A2" a:26 b:22 c:86 d:54 total:188
            │ │ ├── LEAF hidden id:4 topGroup:"Top" group:"Group A2" a:52 b:44 c:72 d:8 total:176
            │ │ └── LEAF hidden id:5 topGroup:"Top" group:"Group A2" a:78 b:66 c:58 d:62 total:264
            │ ├─┬ LEAF_GROUP collapsed id:"row-group-topGroup-Top-group-Group A3" ag-Grid-AutoColumn:"Group A3" a:234 b:198 c:174 d:186 total:792
            │ │ ├── LEAF hidden id:6 topGroup:"Top" group:"Group A3" a:89 b:33 c:29 d:31 total:182
            │ │ ├── LEAF hidden id:7 topGroup:"Top" group:"Group A3" a:78 b:66 c:58 d:62 total:264
            │ │ └── LEAF hidden id:8 topGroup:"Top" group:"Group A3" a:67 b:99 c:87 d:93 total:346
            │ ├─┬ LEAF_GROUP collapsed id:"row-group-topGroup-Top-group-Group A4" ag-Grid-AutoColumn:"Group A4" a:112 b:164 c:132 d:48 total:456
            │ │ ├── LEAF hidden id:9 topGroup:"Top" group:"Group A4" a:52 b:44 c:72 d:8 total:176
            │ │ ├── LEAF hidden id:10 topGroup:"Top" group:"Group A4" a:4 b:88 c:44 d:16 total:152
            │ │ └── LEAF hidden id:11 topGroup:"Top" group:"Group A4" a:56 b:32 c:16 d:24 total:128
            │ └─┬ LEAF_GROUP collapsed id:"row-group-topGroup-Top-group-Group A5" ag-Grid-AutoColumn:"Group A5" a:90 b:130 c:90 d:210 total:520
            │ · ├── LEAF hidden id:12 topGroup:"Top" group:"Group A5" a:15 b:55 c:15 d:85 total:170
            │ · ├── LEAF hidden id:13 topGroup:"Top" group:"Group A5" a:30 b:10 c:30 d:70 total:140
            │ · └── LEAF hidden id:14 topGroup:"Top" group:"Group A5" a:45 b:65 c:45 d:55 total:210
            └─┬ filler id:row-group-topGroup-Bottom ag-Grid-AutoColumn:"Bottom" a:770 b:690 c:770 d:730 total:2960
            · ├─┬ LEAF_GROUP collapsed id:"row-group-topGroup-Bottom-group-Group B1" ag-Grid-AutoColumn:"Group B1" a:178 b:66 c:158 d:162 total:564
            · │ ├── LEAF hidden id:15 topGroup:"Bottom" group:"Group B1" a:63 b:11 c:43 d:77 total:194
            · │ ├── LEAF hidden id:16 topGroup:"Bottom" group:"Group B1" a:26 b:22 c:86 d:54 total:188
            · │ └── LEAF hidden id:17 topGroup:"Bottom" group:"Group B1" a:89 b:33 c:29 d:31 total:182
            · ├─┬ LEAF_GROUP collapsed id:"row-group-topGroup-Bottom-group-Group B2" ag-Grid-AutoColumn:"Group B2" a:156 b:132 c:216 d:124 total:628
            · │ ├── LEAF hidden id:18 topGroup:"Bottom" group:"Group B2" a:26 b:22 c:86 d:54 total:188
            · │ ├── LEAF hidden id:19 topGroup:"Bottom" group:"Group B2" a:52 b:44 c:72 d:8 total:176
            · │ └── LEAF hidden id:20 topGroup:"Bottom" group:"Group B2" a:78 b:66 c:58 d:62 total:264
            · ├─┬ LEAF_GROUP collapsed id:"row-group-topGroup-Bottom-group-Group B3" ag-Grid-AutoColumn:"Group B3" a:234 b:198 c:174 d:186 total:792
            · │ ├── LEAF hidden id:21 topGroup:"Bottom" group:"Group B3" a:89 b:33 c:29 d:31 total:182
            · │ ├── LEAF hidden id:22 topGroup:"Bottom" group:"Group B3" a:78 b:66 c:58 d:62 total:264
            · │ └── LEAF hidden id:23 topGroup:"Bottom" group:"Group B3" a:67 b:99 c:87 d:93 total:346
            · ├─┬ LEAF_GROUP collapsed id:"row-group-topGroup-Bottom-group-Group B4" ag-Grid-AutoColumn:"Group B4" a:112 b:164 c:132 d:48 total:456
            · │ ├── LEAF hidden id:24 topGroup:"Bottom" group:"Group B4" a:52 b:44 c:72 d:8 total:176
            · │ ├── LEAF hidden id:25 topGroup:"Bottom" group:"Group B4" a:4 b:88 c:44 d:16 total:152
            · │ └── LEAF hidden id:26 topGroup:"Bottom" group:"Group B4" a:56 b:32 c:16 d:24 total:128
            · └─┬ LEAF_GROUP collapsed id:"row-group-topGroup-Bottom-group-Group B5" ag-Grid-AutoColumn:"Group B5" a:90 b:130 c:90 d:210 total:520
            · · ├── LEAF hidden id:27 topGroup:"Bottom" group:"Group B5" a:15 b:55 c:15 d:85 total:170
            · · ├── LEAF hidden id:28 topGroup:"Bottom" group:"Group B5" a:30 b:10 c:30 d:70 total:140
            · · └── LEAF hidden id:29 topGroup:"Bottom" group:"Group B5" a:45 b:65 c:45 d:55 total:210
        `);

        // 4 value columns × 12 group nodes = 48 aggregation calls
        expect(aggCallCount).toBe(48);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── a "A" width:200 aggFunc:custom
            ├── b "B" width:200 aggFunc:custom
            ├── c "C" width:200 aggFunc:custom
            ├── d "D" width:200 aggFunc:custom
            └── total "Total" width:200
        `);
    });

    test('after single cell edit, only the affected column and path are re-aggregated', async () => {
        let aggCallCount = 0;
        const aggCallLog: string[] = [];
        const countingSum = (params: IAggFuncParams) => {
            aggCallCount++;
            aggCallLog.push(params.column.getColId());
            let result = 0;
            for (const value of params.values) {
                if (typeof value === 'number') {
                    result += value;
                }
            }
            return result;
        };

        const rowData = cachedJSONObjects.array(createRowData());

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'topGroup', rowGroup: true, hide: true },
                { field: 'group', rowGroup: true, hide: true },
                { field: 'a', aggFunc: countingSum },
                { field: 'b', aggFunc: countingSum },
                { field: 'c', aggFunc: countingSum },
                { field: 'd', aggFunc: countingSum },
                {
                    headerName: 'Total',
                    colId: 'total',
                    valueGetter: 'getValue("a") + getValue("b") + getValue("c") + getValue("d")',
                },
            ],
            autoGroupColumnDef: { minWidth: 180 },
            animateRows: false,
            groupDefaultExpanded: 1,
            aggregateOnlyChangedColumns: true,
            rowData,
            getRowId: (params) => String(params.data.id),
        });

        // Reset counters after initial aggregation
        aggCallCount = 0;
        aggCallLog.length = 0;

        // Update column 'c' for row id:0 (in Top → Group A1)
        const rowNode = api.getRowNode('0')!;
        rowNode.setDataValue('c', 99);

        // With aggregateOnlyChangedColumns, only column 'c' should be re-aggregated,
        // and only for the affected path: Group A1 and Top = 2 calls
        expect(aggCallLog).toEqual(['c', 'c']);
        expect(aggCallCount).toBe(2);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── a "A" width:200 aggFunc:custom
            ├── b "B" width:200 aggFunc:custom
            ├── c "C" width:200 aggFunc:custom
            ├── d "D" width:200 aggFunc:custom
            └── total "Total" width:200
        `);
    });
});

function createRowData() {
    let id = 0;
    const result: { id: number; topGroup: string; group: string; a: number; b: number; c: number; d: number }[] = [];
    for (let i = 1; i <= 2; i++) {
        for (let j = 1; j <= 5; j++) {
            for (let k = 1; k <= 3; k++) {
                result.push({
                    id: id++,
                    topGroup: i === 1 ? 'Top' : 'Bottom',
                    group: (i === 1 ? 'Group A' : 'Group B') + j,
                    a: (j * k * 863) % 100,
                    b: (j * k * 811) % 100,
                    c: (j * k * 743) % 100,
                    d: (j * k * 677) % 100,
                });
            }
        }
    }
    return result;
}
