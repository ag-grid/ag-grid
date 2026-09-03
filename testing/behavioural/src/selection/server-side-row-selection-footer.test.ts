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

    /** A row keyed as the root is reported, so these tests take the error rather than throwing on it. */
    function expectReservedIdError(): MockInstance {
        enableDevValidations({ throwOn: [] });
        return vitest.spyOn(console, 'error').mockImplementation(() => {});
    }

    function headerState(gridId: string): { checked: boolean; indeterminate: boolean } {
        const selector = `#${gridId} .ag-header-select-all .ag-checkbox-input-wrapper`;
        const classList = document.querySelector(selector)!.classList;
        return { checked: classList.contains('ag-checked'), indeterminate: classList.contains('ag-indeterminate') };
    }

    const flatRows: FlatRow[] = [
        { id: '1', value: 10 },
        { id: '2', value: 20 },
    ];

    async function createGrandTotalGrid(mode: 'singleRow' | 'multiRow'): Promise<GridApi> {
        const api = gridMgr.createGrid('myGrid', {
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

    // A purge recreates the row nodes through syncInRowNode, a second path into the strategy that the
    // root is never passed through, so the selection keyed against it has to come back untouched.
    test('the grand total row selection survives a purge refresh', async () => {
        const api = await createGrandTotalGrid('multiRow');

        api.setNodesSelected({
            nodes: [api.getRowNode('1')!, api.getRowNode(GRAND_TOTAL_ROW_ID)!],
            newValue: true,
            source: 'api',
        });
        expect(api.getSelectedNodes().map((node) => node.level)).toEqual([0, -1]);

        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);

        // the handles are rebuilt by the purge, so read them again rather than reusing the old ones
        expect(api.getRowNode(GRAND_TOTAL_ROW_ID)!.isSelected()).toBe(true);
        expect(api.getRowNode('1')!.isSelected()).toBe(true);
        expect([...(api.getServerSideSelectionState() as { toggledNodes: string[] }).toggledNodes].sort()).toEqual(
            [ROOT_NODE_ID, '1'].sort()
        );
    });

    // ROOT_NODE_ID is the key the state carries for the root, so it has to survive a round trip back
    // through setServerSideSelectionState the same way any other row id does.
    test('the grand total row selection round-trips through the server-side selection state', async () => {
        const api = await createGrandTotalGrid('multiRow');
        const grandTotal = api.getRowNode(GRAND_TOTAL_ROW_ID)!;

        grandTotal.setSelected(true);
        const state = api.getServerSideSelectionState()!;
        expect((state as { toggledNodes: string[] }).toggledNodes).toEqual([ROOT_NODE_ID]);

        api.deselectAll();
        expect(grandTotal.isSelected()).toBe(false);

        // a restore rebuilds the state, not the strategy's node map, so isSelected is what to assert here
        api.setServerSideSelectionState(state);
        expect(grandTotal.isSelected()).toBe(true);
        expect((api.getServerSideSelectionState() as { toggledNodes: string[] }).toggledNodes).toEqual([ROOT_NODE_ID]);
    });

    // The export serialises the selected nodes directly under the server-side model, and the selected
    // node is the root, which carries no values - so it has to fall back to the row the user sees.
    test('copying a selected grand total row copies its values', async () => {
        const api = await createGrandTotalGrid('multiRow');
        const grandTotal = api.getRowNode(GRAND_TOTAL_ROW_ID)!;

        grandTotal.setSelected(true);
        expect(api.getSelectedNodes().map((node) => node.level)).toEqual([-1]);

        api.copySelectedRowsToClipboard();
        await waitFor(() => expect(clipboardUtils.getText()).toBe(`${GRAND_TOTAL_ROW_ID}\t30`));
    });

    // The root is not a row, so select all must leave it alone, as it does client-side. Getting this
    // wrong left the grand total row rendered as selected after deselectAll().
    test('select all does not mark the grand total row', async () => {
        const api = await createGrandTotalGrid('multiRow');
        const grandTotal = api.getRowNode(GRAND_TOTAL_ROW_ID)!;

        api.selectAll();
        expect(api.getRowNode('1')!.isSelected()).toBe(true);
        expect(grandTotal.isSelected()).toBe(false);

        api.deselectAll();
        expect(grandTotal.isSelected()).toBe(false);
        expect(api.getRowNode('1')!.isSelected()).toBe(false);
    });

    // Selecting the grand total row selects the root, so the clipboard's flash list holds a level -1
    // node whose own sibling link the destroy severs.
    test('copying a selection holding the grand total row drops it once the row is destroyed', async () => {
        const api = await createGrandTotalGrid('multiRow');

        const grandTotal = api.getRowNode(GRAND_TOTAL_ROW_ID)!;
        api.setNodesSelected({ nodes: [api.getRowNode('1')!, grandTotal], newValue: true, source: 'api' });
        expect(api.getSelectedNodes().map((node) => node.level)).toEqual([0, -1]);

        api.copySelectedRowsToClipboard();
        await waitFor(() => expect(clipboardUtils.getText()).toBe(`1\t10\r\n${GRAND_TOTAL_ROW_ID}\t30`));

        // the root stays selected, but its footer is gone, so there is no row left to serialise for it
        clipboardUtils.reset();
        api.setGridOption('grandTotalRow', undefined);
        await waitFor(() => expect(grandTotal.destroyed).toBe(true));

        api.copySelectedRowsToClipboard();
        await waitFor(() => expect(clipboardUtils.getText()).toBe('1\t10'));
    });

    // The header checkbox reports on rows, and the root is not one, so its selection must not sway it.
    test('selecting the grand total row leaves the header checkbox unchecked', async () => {
        const api = await createGrandTotalGrid('multiRow');

        expect(headerState('myGrid')).toEqual({ checked: false, indeterminate: false });

        api.setNodesSelected({ nodes: [api.getRowNode(GRAND_TOTAL_ROW_ID)!], newValue: true, source: 'api' });
        await waitFor(() => expect(headerState('myGrid')).toEqual({ checked: false, indeterminate: false }));

        // a row, by contrast, does make it indeterminate
        api.setNodesSelected({ nodes: [api.getRowNode('1')!], newValue: true, source: 'api' });
        await waitFor(() => expect(headerState('myGrid')).toEqual({ checked: false, indeterminate: true }));
    });

    // `selectAll` is a base state for rows and never covers the root, so the predicate that reads a
    // node's state and the one that writes it have to exempt the root alike or they disagree on it.
    test('the grand total row can still be selected and deselected after select all', async () => {
        const api = await createGrandTotalGrid('multiRow');
        const grandTotal = api.getRowNode(GRAND_TOTAL_ROW_ID)!;

        api.selectAll();
        expect(grandTotal.isSelected()).toBe(false);

        api.setNodesSelected({ nodes: [grandTotal], newValue: true, source: 'api' });
        expect(grandTotal.isSelected()).toBe(true);

        api.setNodesSelected({ nodes: [grandTotal], newValue: false, source: 'api' });
        expect(grandTotal.isSelected()).toBe(false);
    });

    // Resetting the root store allocates a new root node, and the grand total row reports the root's
    // selection as its own, so the row and the serialised state would otherwise disagree.
    test('the grand total row keeps its selection when the root store is reset', async () => {
        const api = await createGrandTotalGrid('multiRow');

        api.setNodesSelected({ nodes: [api.getRowNode(GRAND_TOTAL_ROW_ID)!], newValue: true, source: 'api' });
        expect((api.getServerSideSelectionState() as { toggledNodes: string[] }).toggledNodes).toEqual([ROOT_NODE_ID]);

        api.setGridOption('serverSideDatasource', {
            getRows(params) {
                const rowData: any[] = [...flatRows];
                if (params.needsGrandTotal) {
                    rowData.push({ id: GRAND_TOTAL_ROW_ID, value: 30 });
                }
                setTimeout(() => params.success({ rowData, rowCount: flatRows.length }), 0);
            },
        });
        await waitForNoLoadingRows(api);

        expect((api.getServerSideSelectionState() as { toggledNodes: string[] }).toggledNodes).toEqual([ROOT_NODE_ID]);
        await waitFor(() => expect(api.getRowNode(GRAND_TOTAL_ROW_ID)!.isSelected()).toBe(true));
    });

    // The export sorts the selected nodes into display order, and the root cannot be sorted: it has no
    // row index and sits at level -1, so it has to be resolved to its footer before the sort runs.
    test('copying a selection exports the grand total row last however it was selected', async () => {
        // non-numeric ids, so the selection keeps them in the order they were selected rather than
        // enumerating the integer-like ones first
        const rows = [
            { id: 'a', value: 10 },
            { id: 'b', value: 20 },
        ];
        const api = gridMgr.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            rowSelection: { mode: 'multiRow' },
            grandTotalRow: 'bottom',
            getRowId: (params: GetRowIdParams<FlatRow>) => params.data.id,
            serverSideDatasource: {
                getRows(params) {
                    const rowData: any[] = [...rows];
                    if (params.needsGrandTotal) {
                        rowData.push({ id: GRAND_TOTAL_ROW_ID, value: 30 });
                    }
                    setTimeout(() => params.success({ rowData, rowCount: rows.length }), 0);
                },
            },
        });
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // the grand total first, so the selection holds the root ahead of a row it must be exported after
        const grandTotal = api.getRowNode(GRAND_TOTAL_ROW_ID)!;
        api.setNodesSelected({ nodes: [grandTotal, api.getRowNode('a')!], newValue: true, source: 'api' });
        expect(api.getSelectedNodes().map((node) => node.level)).toEqual([-1, 0]);

        api.copySelectedRowsToClipboard();
        await waitFor(() => expect(clipboardUtils.getText()).toBe(`a\t10\r\n${GRAND_TOTAL_ROW_ID}\t30`));
    });

    async function createGroupGrid(): Promise<GridApi> {
        const api = gridMgr.createGrid('myGroupGrid', {
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

        return api;
    }

    // The root is excluded from the recompute from children client-side, so its own selection stands there
    // too. The client-side half of this pair is in grouping-selection.test.ts, under the same name.
    test('GroupSelectsChildrenStrategy: the grand total row keeps its own selection when a descendant is deselected', async () => {
        const api = await createGroupGrid();
        const grandTotal = api.getRowNode(GRAND_TOTAL_ROW_ID)!;

        grandTotal.setSelected(true, true);
        expect(api.getRowNode('ie-1')!.isSelected()).toBe(true);
        expect(grandTotal.isSelected()).toBe(true);

        api.setNodesSelected({ nodes: [api.getRowNode('ie-2')!], newValue: false, source: 'api' });
        expect(api.getRowNode('g-Ireland')!.isSelected()).toBeUndefined();
        expect(grandTotal.isSelected()).toBe(true);

        // and it survives the round trip in that partial state
        const partial = api.getServerSideSelectionState()!;
        expect(JSON.stringify(partial)).toContain(ROOT_NODE_ID);
        api.deselectAll();
        api.setServerSideSelectionState(partial);
        expect(grandTotal.isSelected()).toBe(true);
        expect(api.getRowNode('ie-2')!.isSelected()).toBe(false);
    });

    // The grand total row resolves to the root, which has no route of its own, so selecting it means the
    // whole tree - as it does client-side under `groupSelects: 'descendants'`.
    test('GroupSelectsChildrenStrategy: selecting the grand total row selects the whole tree like CSRM', async () => {
        const api = await createGroupGrid();
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

        // the whole tree is selected, so the header is checked outright: the root's own key is not a row
        expect(headerState('myGroupGrid')).toEqual({ checked: true, indeterminate: false });

        // the root is keyed under ROOT_NODE_ID among the toggled nodes, so it survives a round trip
        const withRoot = api.getServerSideSelectionState()!;
        expect(JSON.stringify(withRoot)).toContain(ROOT_NODE_ID);

        api.deselectAll();
        expect(grandTotal.isSelected()).toBe(false);

        api.setServerSideSelectionState(withRoot);
        expect(grandTotal.isSelected()).toBe(true);
        expect(api.getRowNode('ie-1')!.isSelected()).toBe(true);
        expect(api.getRowNode('ie-2')!.isSelected()).toBe(true);

        // select all reaches the same rows, but the root is not one of them
        api.deselectAll();
        api.selectAll();
        expect(api.getRowNode('ie-1')!.isSelected()).toBe(true);
        expect(grandTotal.isSelected()).toBe(false);
    });

    // Nothing stops a data row carrying the id the root is keyed under, so the two share a selection
    // slot. The outcome for that row is undefined, but the grid must stay operable either way.
    test('a data row whose id is ROOT_NODE_ID leaves the selection operable', async () => {
        const errorSpy = expectReservedIdError();
        const api = gridMgr.createGrid('myClashGrid', {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            rowSelection: { mode: 'multiRow' },
            grandTotalRow: 'bottom',
            getRowId: (params: GetRowIdParams<FlatRow>) => params.data.id,
            serverSideDatasource: {
                getRows(params) {
                    const rowData: any[] = [
                        { id: ROOT_NODE_ID, value: 10 },
                        { id: 'b', value: 20 },
                    ];
                    if (params.needsGrandTotal) {
                        rowData.push({ id: GRAND_TOTAL_ROW_ID, value: 30 });
                    }
                    setTimeout(() => params.success({ rowData, rowCount: 2 }), 0);
                },
            },
        });
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // a data row wins over the synthetic root, as it does client-side
        const clashRow = api.getRowNode(ROOT_NODE_ID)!;
        expect(clashRow.data).toEqual({ id: ROOT_NODE_ID, value: 10 });
        expect(clashRow.level).toBe(0);

        api.setNodesSelected({ nodes: [clashRow], newValue: true, source: 'api' });
        expect((api.getServerSideSelectionState() as { toggledNodes: string[] }).toggledNodes).toEqual([ROOT_NODE_ID]);

        // an unrelated row is unaffected, and clearing the selection leaves nothing stuck behind
        api.setNodesSelected({ nodes: [api.getRowNode('b')!], newValue: true, source: 'api' });
        expect(api.getRowNode('b')!.isSelected()).toBe(true);

        api.deselectAll();
        expect(api.getRowNode('b')!.isSelected()).toBe(false);
        expect(clashRow.isSelected()).toBe(false);
        expect(api.getRowNode(GRAND_TOTAL_ROW_ID)!.isSelected()).toBe(false);
        expect((api.getServerSideSelectionState() as { toggledNodes: string[] }).toggledNodes).toEqual([]);

        expect(errorSpy.mock.calls.flat().join(' ')).toContain('Row ID `ROOT_NODE_ID` is reserved by AG Grid');
        errorSpy.mockRestore();
    });

    // Same clash under the group strategy, where the root is keyed among the root's children and the
    // redundancy pruning skips that key, so a real row carrying it is skipped too.
    test('GroupSelectsChildrenStrategy: a group row whose id is ROOT_NODE_ID leaves the selection operable', async () => {
        const errorSpy = expectReservedIdError();
        const api = gridMgr.createGrid('myClashGroupGrid', {
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
                    const groupKey = params.request.groupKeys[0];
                    let rowData: any[];
                    if (groupKey === undefined) {
                        rowData = [
                            { id: ROOT_NODE_ID, key: 'Ireland', country: 'Ireland', value: 30, group: true },
                            { id: 'g-Italy', key: 'Italy', country: 'Italy', value: 5, group: true },
                        ];
                    } else if (groupKey === 'Ireland') {
                        rowData = [
                            { id: 'ie-1', country: 'Ireland', value: 10 },
                            { id: 'ie-2', country: 'Ireland', value: 20 },
                        ];
                    } else {
                        rowData = [{ id: 'it-1', country: 'Italy', value: 5 }];
                    }
                    const rowCount = rowData.length;
                    if (groupKey === undefined && params.needsGrandTotal) {
                        rowData = [...rowData, { id: GRAND_TOTAL_ROW_ID, value: 35 }];
                    }
                    setTimeout(() => params.success({ rowData, rowCount }), 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // the group row wins over the synthetic root, as it does client-side
        const clashGroup = api.getRowNode(ROOT_NODE_ID)!;
        expect(clashGroup.level).toBe(0);
        expect(clashGroup.group).toBe(true);

        // an unrelated group still selects its own subtree and nothing else
        api.getRowNode('g-Italy')!.setExpanded(true);
        await waitForNoLoadingRows(api);
        api.setNodesSelected({ nodes: [api.getRowNode('g-Italy')!], newValue: true, source: 'api' });
        expect(api.getRowNode('it-1')!.isSelected()).toBe(true);

        // selecting the clashing group shares a slot with the root, which is undefined but must not break
        api.setNodesSelected({ nodes: [clashGroup!], newValue: true, source: 'api' });
        expect(typeof api.getRowNode(GRAND_TOTAL_ROW_ID)!.isSelected()).not.toBe('object');

        api.deselectAll();
        expect(api.getRowNode('it-1')!.isSelected()).toBe(false);
        expect(clashGroup!.isSelected()).toBe(false);
        expect(api.getRowNode(GRAND_TOTAL_ROW_ID)!.isSelected()).toBe(false);
        expect(api.getServerSideSelectionState()).toEqual({ nodeId: undefined, selectAllChildren: false });

        expect(errorSpy.mock.calls.flat().join(' ')).toContain('Row ID `ROOT_NODE_ID` is reserved by AG Grid');
        errorSpy.mockRestore();
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
