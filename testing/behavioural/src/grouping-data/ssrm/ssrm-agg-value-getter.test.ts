import { GridRows, TestGridsManager, waitForEvent, waitForNoLoadingRows } from 'ag-test-utils';

import type { AggValueGetterParams, IServerSideGetRowsParams } from 'ag-grid-community';
import { GRAND_TOTAL_ROW_ID, TextEditorModule } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelModule, TreeDataModule } from 'ag-grid-enterprise';

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
        modules: [ServerSideRowModelModule, RowGroupingModule, TreeDataModule, TextEditorModule],
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

    test('applies to tree data parent rows, as in the Client-Side Row Model', async () => {
        interface FileRow {
            name: string;
            size: number;
            folder?: boolean;
        }
        const tree: Record<string, FileRow[]> = {
            '': [
                { name: 'Documents', size: 300, folder: true },
                { name: 'notes.txt', size: 5 },
            ],
            Documents: [{ name: 'cv.pdf', size: 300 }],
        };
        const api = gridsManager.createGrid('ssrm-agg-value-getter-tree', {
            rowModelType: 'serverSide',
            treeData: true,
            isServerSideGroup: (data: FileRow) => !!data.folder,
            getServerSideGroupKey: (data: FileRow) => data.name,
            getRowId: ({ data }) => data.name,
            columnDefs: [{ field: 'size', aggFunc: 'sum', editable: true, aggValueGetter: (params) => params.value * 2 }],
            autoGroupColumnDef: { field: 'name' },
            serverSideDatasource: {
                getRows: (params) => {
                    const rowData = tree[params.request.groupKeys.join('/')];
                    setTimeout(() => params.success({ rowData }), 0);
                },
            },
        });
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        expect(api.getCellValue({ rowNode: api.getRowNode('Documents')!, colKey: 'size' })).toBe(600);
        expect(api.getCellValue({ rowNode: api.getRowNode('notes.txt')!, colKey: 'size' })).toBe(5);
        // the editor would show the getter's value while a field write stores the aggregate
        const size = api.getColumn('size')!;
        expect(size.isCellEditable(api.getRowNode('Documents')!)).toBe(false);
        expect(size.isCellEditable(api.getRowNode('notes.txt')!)).toBe(true);
    });
});
