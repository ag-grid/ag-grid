import { waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, TestGridsManager, waitForEvent } from 'ag-test-utils';
import { waitForNoLoadingRows } from 'ag-test-utils/ssrm-test-utils';

import type { GetRowIdParams, GridApi } from 'ag-grid-community';
import {
    GRAND_TOTAL_ROW_ID,
    GROUP_TOTAL_ROW_ID_PREFIX,
    RowSelectionModule,
    enableDevValidations,
} from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

describe('SSRM selection with a destroyed footer row node', () => {
    const gridMgr = new TestGridsManager({
        modules: [RowSelectionModule, ServerSideRowModelModule, ServerSideRowModelApiModule, RowGroupingModule],
    });

    beforeEach(() => {
        enableDevValidations({ throwOn: ALL_SEVERITIES });
        gridMgr.reset();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    interface FlatRow {
        id: string;
        value: number;
    }

    const flatRows: FlatRow[] = [
        { id: '1', value: 10 },
        { id: '2', value: 20 },
    ];

    async function createGrandTotalGrid(mode: 'singleRow' | 'multiRow'): Promise<GridApi> {
        const api = gridMgr.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            rowSelection: { mode },
            grandTotalRow: 'bottom',
            getRowId: (params: GetRowIdParams<FlatRow>) => params.data.id,
            serverSideDatasource: {
                getRows(params) {
                    const rowData: any[] = [...flatRows];
                    if (params.needsGrandTotal) {
                        rowData.push({ id: GRAND_TOTAL_ROW_ID, value: 30 });
                    }
                    setTimeout(() => params.success({ rowData, rowCount: flatRows.length }), 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        return api;
    }

    async function destroyedGrandTotalIsANoOp(mode: 'singleRow' | 'multiRow'): Promise<void> {
        const api = await createGrandTotalGrid(mode);

        const grandTotal = api.getRowNode(GRAND_TOTAL_ROW_ID)!;
        expect(grandTotal.footer).toBe(true);

        api.setNodesSelected({ nodes: [api.getRowNode('1')!], newValue: true, source: 'api' });
        expect(api.getSelectedNodes().map((node) => node.id)).toEqual(['1']);

        // Clearing the option destroys the grand total node and severs its sibling link.
        api.setGridOption('grandTotalRow', undefined);
        await waitFor(() => expect(grandTotal.destroyed).toBe(true));
        expect(grandTotal.footer).toBe(true);
        expect(grandTotal.sibling).toBeUndefined();

        expect(() => api.setNodesSelected({ nodes: [grandTotal], newValue: true, source: 'api' })).not.toThrow();
        expect(api.getSelectedNodes().map((node) => node.id)).toEqual(['1']);
    }

    // 'singleRow' takes the strategy's single-node fast path, 'multiRow' the node loop — both resolve
    // the footer's sibling, and neither may clear the selection that is already there.
    test('DefaultStrategy (singleRow): selecting a destroyed grand total footer is a no-op, not a throw', async () => {
        await destroyedGrandTotalIsANoOp('singleRow');
    });

    test('DefaultStrategy (multiRow): selecting a destroyed grand total footer is a no-op, not a throw', async () => {
        await destroyedGrandTotalIsANoOp('multiRow');
    });

    test('GroupSelectsChildrenStrategy: selecting a destroyed group total footer is a no-op, not a throw', async () => {
        const api = gridMgr.createGrid(null, {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'value', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            rowModelType: 'serverSide',
            rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
            groupTotalRow: 'bottom',
            getRowId: (params: GetRowIdParams<any>) => params.data.id,
            serverSideDatasource: {
                getRows(params) {
                    const isRoot = params.request.groupKeys.length === 0;
                    const rowData: any[] = isRoot
                        ? [
                              {
                                  id: 'g-Ireland',
                                  key: 'Ireland',
                                  country: 'Ireland',
                                  value: 30,
                                  group: true,
                                  leafGroup: true,
                              },
                          ]
                        : [
                              { id: 'ie-1', country: 'Ireland', value: 10 },
                              { id: 'ie-2', country: 'Ireland', value: 20 },
                          ];
                    setTimeout(() => params.success({ rowData, rowCount: rowData.length }), 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        api.getRowNode('g-Ireland')!.setExpanded(true);
        await waitForNoLoadingRows(api);

        const groupTotal = api.getRowNode(GROUP_TOTAL_ROW_ID_PREFIX + 'g-Ireland')!;
        expect(groupTotal.footer).toBe(true);

        // `groupSelects: 'descendants'` selection is only readable as the server-side selection state.
        api.setNodesSelected({ nodes: [api.getRowNode('ie-1')!], newValue: true, source: 'api' });
        const selectionState = JSON.stringify(api.getServerSideSelectionState());
        expect(selectionState).toContain('ie-1');

        // Clearing the option destroys the group total node and severs its sibling link.
        api.setGridOption('groupTotalRow', undefined);
        await waitFor(() => expect(groupTotal.destroyed).toBe(true));
        expect(groupTotal.footer).toBe(true);
        expect(groupTotal.sibling).toBeUndefined();

        expect(() => api.setNodesSelected({ nodes: [groupTotal], newValue: true, source: 'api' })).not.toThrow();
        expect(JSON.stringify(api.getServerSideSelectionState())).toEqual(selectionState);
    });
});
