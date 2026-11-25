import { GridRows, TestGridsManager, waitForEvent, waitForNoLoadingRows } from 'ag-test-utils';

import type { AggValueGetterParams, IServerSideGetRowsParams } from 'ag-grid-community';
import { GRAND_TOTAL_ROW_ID } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

interface MedalRow {
    id?: string;
    athlete?: string;
    gold: number;
    sum_gold?: number;
}

const LEAVES: MedalRow[] = [
    { id: 'a', athlete: 'Ann', gold: 4 },
    { id: 'b', athlete: 'Bob', gold: 4 },
    { id: 'c', athlete: 'Cat', gold: 1 },
];

/** Groups by `gold` and returns each group's sum as `sum_gold`, keeping the key under `gold`. */
function getRows(params: IServerSideGetRowsParams<MedalRow>): void {
    const { groupKeys, rowGroupCols } = params.request;
    let rowData: MedalRow[];
    if (rowGroupCols.length > groupKeys.length) {
        const keys = [...new Set(LEAVES.map((row) => row.gold))];
        rowData = keys.map((gold) => ({
            gold,
            sum_gold: LEAVES.filter((row) => row.gold === gold).reduce((sum, row) => sum + row.gold, 0),
        }));
    } else {
        rowData = LEAVES.filter((row) => String(row.gold) === String(groupKeys[0]));
    }
    if (params.needsGrandTotal) {
        rowData = [...rowData, { id: GRAND_TOTAL_ROW_ID, gold: 0, sum_gold: 9 }];
    }
    setTimeout(() => params.success({ rowData }), 0);
}

describe('colDef.aggValueGetter with the Server-Side Row Model', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelModule, RowGroupingModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('reads the aggregate from another field while the group key stays under the column field', async () => {
        const calls: AggValueGetterParams<MedalRow>[] = [];
        const api = gridsManager.createGrid('ssrm-agg-value-getter', {
            rowModelType: 'serverSide',
            columnDefs: [
                { field: 'athlete' },
                { field: 'gold', rowGroup: true, aggFunc: 'sum', hide: true },
                { colId: 'goldAgg', field: 'gold', aggFunc: 'sum' },
            ],
            defaultColDef: {
                aggValueGetter: (params) => {
                    calls.push(params);
                    const aggValue = params.data?.[`${params.aggFunc}_${params.colDef.field}` as keyof MedalRow];
                    return aggValue !== undefined ? aggValue : params.value;
                },
            },
            grandTotalRow: 'bottom',
            getRowId: ({ data, parentKeys }) => data.id ?? [...(parentKeys ?? []), data.gold].join('-'),
            serverSideDatasource: { getRows },
        });
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        const group = api.getRowNode('4')!;
        expect(group.key).toBe(4);
        expect(api.getCellValue({ rowNode: group, colKey: 'goldAgg' })).toBe(8);
        expect(api.getCellValue({ rowNode: group, colKey: 'gold' })).toBe(8);
        expect(api.getCellValue({ rowNode: api.getRowNode(GRAND_TOTAL_ROW_ID)!, colKey: 'goldAgg' })).toBe(9);

        const params = calls.find((p) => p.node === group && p.column.getColId() === 'goldAgg')!;
        expect(params.value).toBe(4);
        expect(params.aggFunc).toBe('sum');
        expect(params.aggData).toBeUndefined();
        expect(params.aggValue).toBeUndefined();

        await new GridRows(api, 'ssrm group rows').check(`
            ROOT id:<no-id>
            ├── GROUP-leafGroup collapsed id:4 ag-Grid-AutoColumn:4 gold:8 goldAgg:8
            ├── GROUP-leafGroup collapsed id:1 ag-Grid-AutoColumn:1 gold:1 goldAgg:1
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " gold:9 goldAgg:9
        `);
    });
});
