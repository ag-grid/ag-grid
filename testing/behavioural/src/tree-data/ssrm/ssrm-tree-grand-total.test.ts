import type { GridOptions, IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-community';
import { GRAND_TOTAL_ROW_ID } from 'ag-grid-community';
import {
    RowGroupingModule,
    ServerSideRowModelApiModule,
    ServerSideRowModelModule,
    TreeDataModule,
} from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, asyncSetTimeout } from '../../test-utils';
import { waitForNoLoadingRows } from '../../test-utils/ssrm-test-utils';

/**
 * CHARACTERIZATION tests (golden-master) pinning the CURRENT behaviour of the
 * grand-total / group-total (footer) rows for a TREE-DATA Server-Side Row Model
 * (SSRM) grid with a numeric aggFunc column.
 *
 * These are NOT specification tests: each assertion records what the grid does
 * today — where the grand-total footer renders (top / bottom), the aggregated
 * values it carries, whether it stays pinned while a group is expanded, and how
 * `groupTotalRow` produces per-group footers. If a value looks bug-shaped it is
 * still pinned as the baseline so a future change surfaces as a diff to review.
 *
 * Any model-vs-DOM divergence in the total values is pinned and NOTED (mirroring
 * the AG-17799 pivot grand-total divergence), never fixed here.
 */
describe('ag-grid SSRM treeData grand total / footer (characterization)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule, TreeDataModule, RowGroupingModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    interface TreeRow {
        id: string;
        name: string;
        value?: number;
        group?: boolean;
    }

    // A small tree: two groups, each with numeric leaves. The grand-total sum of
    // all leaves is 10 + 20 + 30 = 60; group A = 30, group B = 30.
    const tree: Record<string, TreeRow[]> = {
        '': [
            { id: 'A', name: 'Group A', group: true },
            { id: 'B', name: 'Group B', group: true },
        ],
        A: [
            { id: 'A1', name: 'Alice', value: 10 },
            { id: 'A2', name: 'Bob', value: 20 },
        ],
        B: [{ id: 'B1', name: 'Carol', value: 30 }],
    };

    // Inline request-stream recorder + tree datasource. When needsGrandTotal is
    // set (root store only), the server appends a grand-total row summing every
    // leaf in the tree.
    function createTreeGrid(gridId: string, extraOptions?: Partial<GridOptions>) {
        const requests: { groupKeys: string[]; needsGrandTotal: boolean }[] = [];

        const datasource: IServerSideDatasource = {
            getRows: (params: IServerSideGetRowsParams) => {
                const { request } = params;
                const groupKeys = request.groupKeys ?? [];
                requests.push({ groupKeys: [...groupKeys], needsGrandTotal: params.needsGrandTotal });

                const key = groupKeys.length === 0 ? '' : groupKeys[groupKeys.length - 1];
                const rowData: any[] = (tree[key] ?? []).map((r) => ({ ...r }));

                if (params.needsGrandTotal) {
                    const total = Object.values(tree)
                        .flat()
                        .reduce((sum, r) => sum + (r.value ?? 0), 0);
                    rowData.push({ id: GRAND_TOTAL_ROW_ID, value: total });
                }

                setTimeout(() => {
                    params.success({ rowData, rowCount: rowData.length });
                }, 1);
            },
        };

        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'id', hide: true },
                { field: 'value', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { field: 'name' },
            defaultColDef: { flex: 1 },
            treeData: true,
            rowModelType: 'serverSide',
            animateRows: false,
            getRowId: ({ data }) => data.id,
            isServerSideGroup: (data: any) => data.group,
            getServerSideGroupKey: (data: any) => data.id,
            serverSideDatasource: datasource,
            ...extraOptions,
        };

        const api = gridsManager.createGrid(gridId, gridOptions);
        return { api, requests };
    }

    test('grandTotalRow:bottom renders a footer at the bottom with the summed leaf total', async () => {
        const { api, requests } = createTreeGrid('ssrmTreeGtBottom', { grandTotalRow: 'bottom' });

        await asyncSetTimeout(1);
        await waitForNoLoadingRows(api);

        // Only the root store requests the grand total.
        expect(requests[0]).toEqual({ groupKeys: [], needsGrandTotal: true });

        const grandTotal = api.getRowNode(GRAND_TOTAL_ROW_ID);
        expect(grandTotal?.footer).toBe(true);
        expect(grandTotal?.level).toBe(-1);
        expect(grandTotal?.data?.value).toBe(60);

        await new GridRows(api, 'tree grand total bottom').check(`
            ROOT id:<no-id>
            ├── A GROUP collapsed id:A ag-Grid-AutoColumn:"Group A" id:"A"
            ├── B GROUP collapsed id:B ag-Grid-AutoColumn:"Group B" id:"B"
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " id:"rowGroupFooter_ROOT_NODE_ID" value:60
        `);
    });

    test('grandTotalRow:top renders the footer at the top', async () => {
        const { api } = createTreeGrid('ssrmTreeGtTop', { grandTotalRow: 'top' });

        await asyncSetTimeout(1);
        await waitForNoLoadingRows(api);

        expect(api.getRowNode(GRAND_TOTAL_ROW_ID)?.data?.value).toBe(60);

        await new GridRows(api, 'tree grand total top').check(`
            ROOT id:<no-id>
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " id:"rowGroupFooter_ROOT_NODE_ID" value:60
            ├── A GROUP collapsed id:A ag-Grid-AutoColumn:"Group A" id:"A"
            └── B GROUP collapsed id:B ag-Grid-AutoColumn:"Group B" id:"B"
        `);
    });

    test('grand total stays pinned and unchanged when a tree group is expanded', async () => {
        const { api, requests } = createTreeGrid('ssrmTreeGtExpand', { grandTotalRow: 'bottom' });

        await asyncSetTimeout(1);
        await waitForNoLoadingRows(api);

        const grandTotalIdBefore = api.getRowNode(GRAND_TOTAL_ROW_ID)?.id;
        const valueBefore = api.getRowNode(GRAND_TOTAL_ROW_ID)?.data?.value;
        requests.length = 0;

        api.getRowNode('A')!.setExpanded(true);
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(10);

        // Expanding a group loads only that group's children — needsGrandTotal is
        // NOT requested again, and the root grand-total node is the same instance
        // carrying the same value.
        expect(requests).toEqual([{ groupKeys: ['A'], needsGrandTotal: false }]);
        expect(api.getRowNode(GRAND_TOTAL_ROW_ID)?.id).toBe(grandTotalIdBefore);
        expect(api.getRowNode(GRAND_TOTAL_ROW_ID)?.data?.value).toBe(valueBefore);

        await new GridRows(api, 'tree grand total after expand A').check(`
            ROOT id:<no-id>
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"Group A" id:"A"
            │ ├── LEAF id:A1 ag-Grid-AutoColumn:"Alice" id:"A1" value:10
            │ └── LEAF id:A2 ag-Grid-AutoColumn:"Bob" id:"A2" value:20
            ├── B GROUP collapsed id:B ag-Grid-AutoColumn:"Group B" id:"B"
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " id:"rowGroupFooter_ROOT_NODE_ID" value:60
        `);
    });

    test('groupTotalRow:bottom adds a per-group footer alongside the grand total', async () => {
        const { api } = createTreeGrid('ssrmTreeGroupTotal', {
            grandTotalRow: 'bottom',
            groupTotalRow: 'bottom',
        });

        await asyncSetTimeout(1);
        await waitForNoLoadingRows(api);

        api.getRowNode('A')!.setExpanded(true);
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(10);

        // DIVERGENCE (pinned, not fixed): despite aggFunc:'sum', neither the tree
        // group rows (A / B) nor the per-group footer (rowGroupFooter_A) carry an
        // aggregated `value` — SSRM does not client-side aggregate the loaded tree
        // leaves, so those cells render empty. Only the server-supplied grand-total
        // footer shows a value (60). A future change enabling group aggregation
        // would surface here as A=30 / group footer=30.
        await new GridRows(api, 'tree group total bottom expanded A').check(`
            ROOT id:<no-id>
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"Group A" id:"A"
            │ ├── LEAF id:A1 ag-Grid-AutoColumn:"Alice" id:"A1" value:10
            │ ├── LEAF id:A2 ag-Grid-AutoColumn:"Bob" id:"A2" value:20
            │ └─ footer id:rowGroupFooter_A ag-Grid-AutoColumn:"Total Group A" id:"A"
            ├── B GROUP collapsed id:B ag-Grid-AutoColumn:"Group B" id:"B"
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " id:"rowGroupFooter_ROOT_NODE_ID" value:60
        `);
    });

    test('MODEL-VS-DOM: grand-total value is on the model node; displayed count includes the footer', async () => {
        const { api } = createTreeGrid('ssrmTreeGtDivergence', { grandTotalRow: 'bottom' });

        await asyncSetTimeout(1);
        await waitForNoLoadingRows(api);

        // The footer's aggregated value lives on the model node's raw data.
        const grandTotal = api.getRowNode(GRAND_TOTAL_ROW_ID);
        expect(grandTotal?.data?.value).toBe(60);

        // The grand-total footer occupies a display index: 2 groups + 1 footer = 3.
        expect(api.getDisplayedRowCount()).toBe(3);

        await new GridRows(api, 'tree grand total divergence').check(`
            ROOT id:<no-id>
            ├── A GROUP collapsed id:A ag-Grid-AutoColumn:"Group A" id:"A"
            ├── B GROUP collapsed id:B ag-Grid-AutoColumn:"Group B" id:"B"
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " id:"rowGroupFooter_ROOT_NODE_ID" value:60
        `);
    });
});
