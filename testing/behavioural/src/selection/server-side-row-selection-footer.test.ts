import { waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, TestGridsManager, clipboardUtils, waitForEvent } from 'ag-test-utils';
import { waitForNoLoadingRows } from 'ag-test-utils/ssrm-test-utils';
import type { MockInstance } from 'vitest';

import type { GetRowIdParams, GridApi } from 'ag-grid-community';
import {
    GRAND_TOTAL_ROW_ID,
    GROUP_TOTAL_ROW_ID_PREFIX,
    ROOT_NODE_ID,
    RowSelectionModule,
    enableDevValidations,
    setupAgTestIds,
} from 'ag-grid-community';
import {
    ClipboardModule,
    RowGroupingModule,
    ServerSideRowModelApiModule,
    ServerSideRowModelModule,
} from 'ag-grid-enterprise';

describe('SSRM selection with a destroyed footer row node', () => {
    const gridMgr = new TestGridsManager({
        modules: [
            RowSelectionModule,
            ServerSideRowModelModule,
            ServerSideRowModelApiModule,
            RowGroupingModule,
            ClipboardModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    let warnSpy: MockInstance;

    beforeEach(() => {
        enableDevValidations({ throwOn: ALL_SEVERITIES });
        gridMgr.reset();
        clipboardUtils.init();
        warnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        gridMgr.reset();

        const warnings = warnSpy.mock.calls.map((call) => String(call[0]));
        warnSpy.mockRestore();
        expect(warnings).toEqual([]);
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

    async function destroyedGrandTotalStillReachesTheRoot(mode: 'singleRow' | 'multiRow'): Promise<void> {
        const api = await createGrandTotalGrid(mode);

        const grandTotal = api.getRowNode(GRAND_TOTAL_ROW_ID)!;
        expect(grandTotal.footer).toBe(true);

        api.setNodesSelected({ nodes: [api.getRowNode('1')!], newValue: true, source: 'api' });
        expect(api.getSelectedNodes().map((node) => node.id)).toEqual(['1']);

        // clearing the option destroys the grand total node; the root drops its footer, the footer keeps
        // the root, so it still resolves to a live row
        api.setGridOption('grandTotalRow', undefined);
        await waitFor(() => expect(grandTotal.destroyed).toBe(true));
        expect(grandTotal.footer).toBe(true);
        expect(grandTotal.primaryRow.level).toBe(-1);

        const selectionChanged = vitest.fn();
        api.addEventListener('selectionChanged', selectionChanged);

        api.setNodesSelected({ nodes: [grandTotal], newValue: true, source: 'api' });

        // singleRow clears first and keeps only the root; multiRow adds it to what was there
        const expectedLevels = mode === 'singleRow' ? [-1] : [0, -1];
        expect(api.getSelectedNodes().map((node) => node.level)).toEqual(expectedLevels);
        expect(grandTotal.isSelected()).toBe(true);
        await waitFor(() => expect(selectionChanged).toHaveBeenCalledTimes(1));
    }

    // 'singleRow' takes the strategy's single-node fast path, 'multiRow' the node loop.
    test('DefaultStrategy (singleRow): selecting a destroyed grand total footer selects the root', async () => {
        await destroyedGrandTotalStillReachesTheRoot('singleRow');
    });

    test('DefaultStrategy (multiRow): selecting a destroyed grand total footer selects the root', async () => {
        await destroyedGrandTotalStillReachesTheRoot('multiRow');
    });

    // The root carries no id of its own, so the selection keys it under ROOT_NODE_ID rather than putting
    // a null into getSelectedRows() or into the state that round-trips through
    // setServerSideSelectionState(). getSelectedRows() drops it because the root has no data, as CSRM does.
    test('selecting a grand total row keys the root under ROOT_NODE_ID rather than holding a null', async () => {
        const api = await createGrandTotalGrid('multiRow');
        const grandTotal = api.getRowNode(GRAND_TOTAL_ROW_ID)!;

        api.setNodesSelected({ nodes: [grandTotal], newValue: true, source: 'api' });

        expect(api.getSelectedNodes().map((node) => node.level)).toEqual([-1]);
        expect(api.getSelectedRows()).toEqual([]);
        expect((api.getServerSideSelectionState() as { toggledNodes: string[] }).toggledNodes).toEqual([ROOT_NODE_ID]);
        expect(grandTotal.isSelected()).toBe(true);
    });

    // Selecting the grand total row selects the root, so the clipboard's flash list holds a level -1
    // node whose own sibling link the destroy severs.
    test('copying a selection made through a since-destroyed grand total footer still copies the total', async () => {
        const api = await createGrandTotalGrid('multiRow');

        const grandTotal = api.getRowNode(GRAND_TOTAL_ROW_ID)!;
        api.setNodesSelected({ nodes: [api.getRowNode('1')!, grandTotal], newValue: true, source: 'api' });
        expect(api.getSelectedNodes().map((node) => node.level)).toEqual([0, -1]);

        api.copySelectedRowsToClipboard();
        await waitFor(() => expect(clipboardUtils.getText()).toBe('1\t10'));

        clipboardUtils.reset();
        api.setGridOption('grandTotalRow', undefined);
        await waitFor(() => expect(grandTotal.destroyed).toBe(true));

        api.copySelectedRowsToClipboard();
        await waitFor(() => expect(clipboardUtils.getText()).toBe('1\t10'));
    });

    // The grand total row resolves to the root, which has no route of its own, so selecting it means the
    // whole tree - as it does client-side under `groupSelects: 'descendants'`.
    test('GroupSelectsChildrenStrategy: selecting the grand total row selects the whole tree like CSRM', async () => {
        const api = gridMgr.createGrid(null, {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'value', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            rowModelType: 'serverSide',
            rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
            grandTotalRow: 'bottom',
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
                    const rowCount = rowData.length;
                    if (isRoot && params.needsGrandTotal) {
                        rowData.push({ id: GRAND_TOTAL_ROW_ID, value: 30 });
                    }
                    setTimeout(() => params.success({ rowData, rowCount }), 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        api.getRowNode('g-Ireland')!.setExpanded(true);
        await waitForNoLoadingRows(api);

        const grandTotal = api.getRowNode(GRAND_TOTAL_ROW_ID)!;
        expect(grandTotal.footer).toBe(true);
        expect(grandTotal.primaryRow.id).toBeUndefined();

        api.setNodesSelected({ nodes: [api.getRowNode('ie-1')!], newValue: true, source: 'api' });
        const selectionState = JSON.stringify(api.getServerSideSelectionState());
        expect(selectionState).toContain('ie-1');

        grandTotal.setSelected(true, true);

        expect(JSON.stringify(api.getServerSideSelectionState())).not.toEqual(selectionState);
        expect((api.getServerSideSelectionState() as { selectAllChildren: boolean }).selectAllChildren).toBe(true);
        expect(api.getRowNode('ie-1')!.isSelected()).toBe(true);
        expect(api.getRowNode('ie-2')!.isSelected()).toBe(true);
        expect(grandTotal.isSelected()).toBe(true);
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

        const group = api.getRowNode('g-Ireland')!;
        api.setGridOption('groupTotalRow', undefined);
        await waitFor(() => expect(groupTotal.destroyed).toBe(true));
        expect(groupTotal.footer).toBe(true);
        expect(group.sibling).toBeUndefined();
        expect(groupTotal.primaryRow).toBe(group);

        const selectionChanged = vitest.fn();
        api.addEventListener('selectionChanged', selectionChanged);

        // selecting through the destroyed footer selects its origin group, exactly as a live footer does
        api.setNodesSelected({ nodes: [groupTotal], newValue: true, source: 'api' });
        expect(JSON.stringify(api.getServerSideSelectionState())).toContain('g-Ireland');
        expect(group.isSelected()).toBe(true);
        expect(groupTotal.isSelected()).toBe(true);
        await waitFor(() => expect(selectionChanged).toHaveBeenCalledTimes(1));
    });
});
