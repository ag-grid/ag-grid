import { waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, TestGridsManager, asyncSetTimeout, clipboardUtils, waitForEvent } from 'ag-test-utils';
import { waitForNoLoadingRows } from 'ag-test-utils/ssrm-test-utils';
import type { MockInstance } from 'vitest';

import type { GetRowIdParams, GridApi, IRowNode } from 'ag-grid-community';
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

import { GridActions } from './utils';

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
    let errorSpy: MockInstance | undefined;

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
        errorSpy?.mockRestore();
        errorSpy = undefined;
        expect(warnings).toEqual([]);
    });

    interface FlatRow {
        id: string;
        value: number;
    }

    /** A row keyed as the root reports error 331, so these tests take it while every other id still throws. */
    function expectReservedIdError(): MockInstance {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [331] });
        errorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        return errorSpy;
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
        await asyncSetTimeout(0);
        expect(selectionChanged).toHaveBeenCalledTimes(1);
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

    // The root is not a row, so select all must leave it alone, as it does client-side.
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

        // the grand total is asked for first, yet the root is reported after the rows, never among them
        const grandTotal = api.getRowNode(GRAND_TOTAL_ROW_ID)!;
        api.setNodesSelected({ nodes: [grandTotal, api.getRowNode('a')!], newValue: true, source: 'api' });
        expect(api.getSelectedNodes().map((node) => node.level)).toEqual([0, -1]);

        api.copySelectedRowsToClipboard();
        await waitFor(() => expect(clipboardUtils.getText()).toBe(`a\t10\r\n${GRAND_TOTAL_ROW_ID}\t30`));

        // the root stays selected once its total row goes, and it has no values of its own to export
        api.setGridOption('grandTotalRow', undefined);
        await waitFor(() => expect(api.getRowNode(GRAND_TOTAL_ROW_ID)).toBeUndefined());

        api.copySelectedRowsToClipboard();
        await waitFor(() => expect(clipboardUtils.getText()).toBe('a\t10'));
    });

    test('copying a selection exports a pinned grand total row once', async () => {
        const rows = [
            { id: 'a', value: 10 },
            { id: 'b', value: 20 },
        ];
        const api = gridMgr.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            rowSelection: { mode: 'multiRow' },
            grandTotalRow: 'pinnedBottom',
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

        // the pinned container holds a clone of the total row, so the body must not emit it as well
        api.setNodesSelected({ nodes: [api.getRowNode(GRAND_TOTAL_ROW_ID)!], newValue: true, source: 'api' });
        api.copySelectedRowsToClipboard();
        await waitFor(() => expect(clipboardUtils.getText()).toBe(`${GRAND_TOTAL_ROW_ID}\t30`));
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

        // the row and the root hold their selection apart, so selecting one leaves the other alone
        api.setNodesSelected({ nodes: [clashRow], newValue: true, source: 'api' });
        expect(clashRow.isSelected()).toBe(true);
        expect(api.getRowNode(GRAND_TOTAL_ROW_ID)!.isSelected()).toBe(false);
        expect((api.getServerSideSelectionState() as { toggledNodes: string[] }).toggledNodes).toEqual([ROOT_NODE_ID]);

        // both selected at once: the state stays a set, so the shared id appears once, not twice
        api.setNodesSelected({ nodes: [api.getRowNode(GRAND_TOTAL_ROW_ID)!], newValue: true, source: 'api' });
        expect((api.getServerSideSelectionState() as { toggledNodes: string[] }).toggledNodes).toEqual([ROOT_NODE_ID]);

        // and the reverse: selecting the grand total row does not select the row sharing its id
        api.setNodesSelected({ nodes: [clashRow], newValue: false, source: 'api' });
        expect(clashRow.isSelected()).toBe(false);
        expect(api.getRowNode(GRAND_TOTAL_ROW_ID)!.isSelected()).toBe(true);

        // an unrelated row is unaffected, and clearing the selection leaves nothing stuck behind
        api.setNodesSelected({ nodes: [api.getRowNode('b')!], newValue: true, source: 'api' });
        expect(api.getRowNode('b')!.isSelected()).toBe(true);

        api.deselectAll();
        expect(api.getRowNode('b')!.isSelected()).toBe(false);
        expect(clashRow.isSelected()).toBe(false);
        expect(api.getRowNode(GRAND_TOTAL_ROW_ID)!.isSelected()).toBe(false);
        expect((api.getServerSideSelectionState() as { toggledNodes: string[] }).toggledNodes).toEqual([]);

        expect(errorSpy.mock.calls.flat().join(' ')).toContain('Row ID `ROOT_NODE_ID` is reserved by AG Grid');
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

        // the group and the root hold their selection apart, so selecting one leaves the other alone
        api.setNodesSelected({ nodes: [clashGroup], newValue: true, source: 'api' });
        expect(clashGroup.isSelected()).toBe(true);
        expect(api.getRowNode(GRAND_TOTAL_ROW_ID)!.isSelected()).toBe(false);

        api.deselectAll();
        expect(api.getRowNode('it-1')!.isSelected()).toBe(false);
        expect(clashGroup!.isSelected()).toBe(false);
        expect(api.getRowNode(GRAND_TOTAL_ROW_ID)!.isSelected()).toBe(false);
        expect(api.getServerSideSelectionState()).toEqual({ nodeId: undefined, selectAllChildren: false });

        expect(errorSpy.mock.calls.flat().join(' ')).toContain('Row ID `ROOT_NODE_ID` is reserved by AG Grid');
    });

    test('GroupSelectsChildrenStrategy: selecting a destroyed group total footer selects its origin group', async () => {
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
        await asyncSetTimeout(0);
        expect(selectionChanged).toHaveBeenCalledTimes(1);
    });

    test.each([1, 2])(
        'GroupSelectsChildrenStrategy: selecting all %i children of a group with a total row selects the group',
        async (childCount) => {
            const children = [
                { id: 'ie-1', country: 'Ireland', value: 10 },
                { id: 'ie-2', country: 'Ireland', value: 20 },
            ].slice(0, childCount);
            const api = gridMgr.createGrid(null, {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'value', aggFunc: 'sum' },
                ],
                rowModelType: 'serverSide',
                rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
                groupTotalRow: 'bottom',
                getRowId: (params: GetRowIdParams<any>) => params.data.id,
                serverSideDatasource: {
                    getRows(params) {
                        const rowData: any[] = params.request.groupKeys.length
                            ? children
                            : [{ id: 'g-Ireland', country: 'Ireland', value: 30, group: true }];
                        setTimeout(() => params.success({ rowData, rowCount: rowData.length }), 0);
                    },
                },
            });
            await waitForEvent('firstDataRendered', api);
            await waitForNoLoadingRows(api);
            api.getRowNode('g-Ireland')!.setExpanded(true);
            await waitForNoLoadingRows(api);

            const nodes = children.map(({ id }) => api.getRowNode(id)!);
            api.setNodesSelected({ nodes, newValue: true, source: 'api' });

            expect(api.getRowNode('g-Ireland')!.isSelected()).toBe(true);
            expect(api.getServerSideSelectionState()).toEqual({
                selectAllChildren: false,
                toggledNodes: [{ nodeId: 'g-Ireland', selectAllChildren: true }],
            });
        }
    );

    test('selecting a group total row whose group became unselectable keeps the existing selection', async () => {
        const api = gridMgr.createGrid(null, {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'value', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            rowModelType: 'serverSide',
            rowSelection: { mode: 'singleRow' },
            groupTotalRow: 'bottom',
            getRowId: (params: GetRowIdParams<any>) => params.data.id,
            serverSideDatasource: {
                getRows(params) {
                    const isRoot = params.request.groupKeys.length === 0;
                    const rowData: any[] = isRoot
                        ? [{ id: 'g-Ireland', key: 'Ireland', country: 'Ireland', value: 30, group: true }]
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

        api.setNodesSelected({ nodes: [api.getRowNode('ie-1')!], newValue: true, source: 'api' });
        expect(api.getRowNode('ie-1')!.isSelected()).toBe(true);

        api.setGridOption('rowSelection', {
            mode: 'singleRow',
            isRowSelectable: (node) => node.id !== 'g-Ireland',
        });
        const group = api.getRowNode('g-Ireland')!;
        const groupTotal = api.getRowNode(GROUP_TOTAL_ROW_ID_PREFIX + 'g-Ireland')!;
        expect(group.selectable).toBe(false);
        expect(groupTotal.selectable).toBe(false);

        // the request cannot be honoured, so it is dropped rather than emptying the selection
        api.setNodesSelected({ nodes: [groupTotal], newValue: true, source: 'api' });
        expect(group.isSelected()).toBe(false);
        expect(api.getRowNode('ie-1')!.isSelected()).toBe(true);
    });

    async function createSelectableGrandTotalGrid(
        isRowSelectable: ((node: IRowNode) => boolean) | undefined,
        grandTotalRow: 'bottom' | undefined
    ): Promise<GridApi> {
        const api = gridMgr.createGrid('myGrid', {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true, isRowSelectable },
            grandTotalRow,
            getRowId: (params: GetRowIdParams<FlatRow>) => params.data.id,
            serverSideDatasource: {
                getRows(params) {
                    setTimeout(
                        () =>
                            params.success({
                                rowData: [...flatRows],
                                rowCount: flatRows.length,
                                grandTotalData: { id: 'Total', value: 30 },
                            }),
                        0
                    );
                },
            },
        });
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);
        return api;
    }

    const rejectsTotalRows = (node: IRowNode) => !node.footer && node.data != null;
    const rejectsFooters = (node: IRowNode) => !node.footer;

    test('a grand total row that isRowSelectable rejects cannot be selected by click or API', async () => {
        const api = await createSelectableGrandTotalGrid(rejectsTotalRows, 'bottom');
        const grandTotal = api.getRowNode(GRAND_TOTAL_ROW_ID)!;
        expect(grandTotal.selectable).toBe(false);

        const actions = new GridActions(api);
        expect(actions.getRowById(GRAND_TOTAL_ROW_ID)).not.toBeNull();
        actions.clickRowById(GRAND_TOTAL_ROW_ID);
        expect(api.getSelectedNodes()).toEqual([]);

        api.setNodesSelected({ nodes: [grandTotal], newValue: true, source: 'api' });

        expect(grandTotal.isSelected()).toBe(false);
        expect(api.getSelectedNodes()).toEqual([]);
        expect(api.getServerSideSelectionState()).toEqual({ selectAll: false, toggledNodes: [] });
    });

    test('a grand total row cannot be selected once a new isRowSelectable rejects it', async () => {
        const api = await createSelectableGrandTotalGrid(undefined, 'bottom');
        const grandTotal = api.getRowNode(GRAND_TOTAL_ROW_ID)!;
        expect(grandTotal.selectable).toBe(true);

        api.setGridOption('rowSelection', {
            mode: 'multiRow',
            checkboxes: false,
            enableClickSelection: true,
            isRowSelectable: rejectsFooters,
        });
        api.setNodesSelected({ nodes: [grandTotal], newValue: true, source: 'api' });

        expect(grandTotal.selectable).toBe(false);
        expect(api.getSelectedNodes()).toEqual([]);
    });

    test('with groupSelects descendants a grand total row that isRowSelectable rejects cannot be selected', async () => {
        const api = await createSelectableGrandTotalGrid(undefined, 'bottom');
        api.setGridOption('rowSelection', {
            mode: 'multiRow',
            groupSelects: 'descendants',
            isRowSelectable: rejectsFooters,
        });
        const grandTotal = api.getRowNode(GRAND_TOTAL_ROW_ID)!;

        api.setNodesSelected({ nodes: [grandTotal], newValue: true, source: 'api' });

        expect(grandTotal.selectable).toBe(false);
        expect(grandTotal.isSelected()).toBe(false);
    });

    test('with groupSelects descendants a grand total row turning selectable keeps the selection', async () => {
        let totalValue = 0;
        const api = gridMgr.createGrid('myGrid', {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            rowSelection: {
                mode: 'multiRow',
                groupSelects: 'descendants',
                isRowSelectable: (node) => !node.footer || node.data.value > 0,
            },
            grandTotalRow: 'bottom',
            getRowId: (params: GetRowIdParams<FlatRow>) => params.data.id,
            serverSideDatasource: {
                getRows(params) {
                    const grandTotalData = { id: 'Total', value: totalValue };
                    setTimeout(() => params.success({ rowData: [...flatRows], rowCount: 2, grandTotalData }), 0);
                },
            },
        });
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);
        expect(api.getRowNode(GRAND_TOTAL_ROW_ID)!.selectable).toBe(false);
        api.setNodesSelected({ nodes: [api.getRowNode('1')!], newValue: true, source: 'api' });
        expect(api.getRowNode('1')!.isSelected()).toBe(true);
        const selectionState = api.getServerSideSelectionState();
        const selectionChanged = vitest.fn();
        api.addEventListener('selectionChanged', selectionChanged);

        totalValue = 30;
        api.refreshServerSide({ purge: false });
        await waitFor(() => expect(api.getRowNode(GRAND_TOTAL_ROW_ID)!.data.value).toBe(30));

        expect(api.getRowNode(GRAND_TOTAL_ROW_ID)!.selectable).toBe(true);
        expect(api.getServerSideSelectionState()).toEqual(selectionState);
        expect(api.getRowNode('1')!.isSelected()).toBe(true);
        expect(selectionChanged).not.toHaveBeenCalled();
    });

    test('a grand total row shown after load follows isRowSelectable, and the root can be selected once it is hidden again', async () => {
        const api = await createSelectableGrandTotalGrid(rejectsFooters, undefined);
        api.setGridOption('grandTotalRow', 'bottom');
        await waitFor(() => expect(api.getRowNode(GRAND_TOTAL_ROW_ID)?.footer).toBe(true));
        const grandTotal = api.getRowNode(GRAND_TOTAL_ROW_ID)!;

        api.setNodesSelected({ nodes: [grandTotal], newValue: true, source: 'api' });

        expect(grandTotal.selectable).toBe(false);
        expect(api.getSelectedNodes()).toEqual([]);

        const root = api.getRowNode('1')!.parent!;
        api.setGridOption('grandTotalRow', undefined);
        await waitFor(() => expect(api.getRowNode(GRAND_TOTAL_ROW_ID)).toBeUndefined());
        api.setNodesSelected({ nodes: [root], newValue: true, source: 'api' });
        expect(api.getSelectedNodes()).toEqual([root]);
    });

    test('a root selected before its grand total row appears is deselected when isRowSelectable rejects that row', async () => {
        const api = await createSelectableGrandTotalGrid(rejectsFooters, undefined);
        const root = api.getRowNode('1')!.parent!;
        api.setNodesSelected({ nodes: [root], newValue: true, source: 'api' });
        const sources: string[] = [];
        api.addEventListener('selectionChanged', (event) => sources.push(event.source));
        const rowSelected: string[] = [];
        api.addEventListener('rowSelected', (event) =>
            rowSelected.push(`${event.node.level}:${event.node.isSelected()}`)
        );

        api.setGridOption('grandTotalRow', 'bottom');

        await waitFor(() => expect(sources).toEqual(['selectableChanged']));
        expect(rowSelected).toEqual(['-1:false']);
        expect(api.getRowNode(GRAND_TOTAL_ROW_ID)!.selectable).toBe(false);
        expect(api.getRowNode(GRAND_TOTAL_ROW_ID)!.isSelected()).toBe(false);
        expect(api.getSelectedNodes()).toEqual([]);
    });

    test('with groupSelects descendants, a grand total row isRowSelectable rejects shows unselected while the rows selected through it stay selected', async () => {
        const api = await createSelectableGrandTotalGrid(rejectsFooters, undefined);
        api.setGridOption('rowSelection', {
            mode: 'multiRow',
            checkboxes: false,
            enableClickSelection: true,
            isRowSelectable: rejectsFooters,
            groupSelects: 'descendants',
        });
        const root = api.getRowNode('1')!.parent!;
        api.setNodesSelected({ nodes: [root], newValue: true, source: 'api' });
        const selectionState = api.getServerSideSelectionState();

        api.setGridOption('grandTotalRow', 'bottom');
        await waitFor(() => expect(api.getRowNode(GRAND_TOTAL_ROW_ID)?.selectable).toBe(false));

        expect(api.getServerSideSelectionState()).toEqual(selectionState);
        expect(api.getRowNode(GRAND_TOTAL_ROW_ID)!.isSelected()).toBe(false);
        expect(api.getRowNode('1')!.isSelected()).toBe(true);
        expect(api.getRowNode('2')!.isSelected()).toBe(true);
    });

    test('with groupSelects descendants, a purge that reloads a grand total row isRowSelectable still rejects emits no selectionChanged', async () => {
        const api = await createSelectableGrandTotalGrid(undefined, 'bottom');
        const rowSelection = { mode: 'multiRow', checkboxes: false, groupSelects: 'descendants' } as const;
        api.setGridOption('rowSelection', rowSelection);
        api.setNodesSelected({ nodes: [api.getRowNode(GRAND_TOTAL_ROW_ID)!], newValue: true, source: 'api' });
        api.setGridOption('rowSelection', { ...rowSelection, isRowSelectable: rejectsFooters });
        await waitFor(() => expect(api.getRowNode(GRAND_TOTAL_ROW_ID)!.isSelected()).toBe(false));
        const sources: string[] = [];
        api.addEventListener('selectionChanged', (event) => sources.push(event.source));

        api.refreshServerSide({ purge: true });
        await waitFor(() => expect(api.getRowNode(GRAND_TOTAL_ROW_ID)?.selectable).toBe(false));
        await waitForNoLoadingRows(api);
        api.deselectAll();

        await waitFor(() => expect(sources).toEqual(['apiSelectAll']));
    });

    test('with groupSelects descendants, a purge that reloads a grand total row isRowSelectable accepts again shows the root selected', async () => {
        let footersAccepted = true;
        const api = await createSelectableGrandTotalGrid(undefined, 'bottom');
        const rowSelection = { mode: 'multiRow', checkboxes: false, groupSelects: 'descendants' } as const;
        api.setGridOption('rowSelection', rowSelection);
        api.setNodesSelected({ nodes: [api.getRowNode(GRAND_TOTAL_ROW_ID)!], newValue: true, source: 'api' });
        footersAccepted = false;
        api.setGridOption('rowSelection', {
            ...rowSelection,
            isRowSelectable: (node) => footersAccepted || !node.footer,
        });
        await waitFor(() => expect(api.getRowNode(GRAND_TOTAL_ROW_ID)!.isSelected()).toBe(false));
        footersAccepted = true;
        const grandTotalBeforePurge = api.getRowNode(GRAND_TOTAL_ROW_ID);

        api.refreshServerSide({ purge: true });

        await waitFor(() => {
            const grandTotal = api.getRowNode(GRAND_TOTAL_ROW_ID);
            expect(grandTotal !== grandTotalBeforePurge && grandTotal?.selectable === true).toBe(true);
        });
        await waitForNoLoadingRows(api);
        expect(api.getRowNode(GRAND_TOTAL_ROW_ID)!.isSelected()).toBe(true);
    });

    test('with groupSelects descendants, deselecting a grand total row isRowSelectable rejects after select all deselects every row', async () => {
        const api = await createSelectableGrandTotalGrid(rejectsFooters, 'bottom');
        api.setGridOption('rowSelection', {
            mode: 'multiRow',
            checkboxes: false,
            isRowSelectable: rejectsFooters,
            groupSelects: 'descendants',
        });
        const emptyState = api.getServerSideSelectionState();
        api.selectAll();

        api.setNodesSelected({ nodes: [api.getRowNode(GRAND_TOTAL_ROW_ID)!], newValue: false, source: 'api' });

        expect(api.getServerSideSelectionState()).toEqual(emptyState);
        expect(api.getRowNode('1')!.isSelected()).toBe(false);
    });

    test('a selected root whose grand total row a purge reloads as un-selectable is deselected with its rowSelected', async () => {
        let footersAccepted = true;
        const api = await createSelectableGrandTotalGrid((node) => footersAccepted || !node.footer, 'bottom');
        api.setNodesSelected({ nodes: [api.getRowNode(GRAND_TOTAL_ROW_ID)!], newValue: true, source: 'api' });
        await waitFor(() => expect(api.getSelectedNodes()).toHaveLength(1));
        const rowSelected: string[] = [];
        api.addEventListener('rowSelected', (event) =>
            rowSelected.push(`${event.node.level}:${event.node.isSelected()}`)
        );
        footersAccepted = false;

        api.refreshServerSide({ purge: true });

        await waitFor(() => expect(rowSelected).toEqual(['-1:false']));
        expect(api.getSelectedNodes()).toEqual([]);
    });

    test('a restored selection state naming the root does not select it while isRowSelectable rejects its grand total row', async () => {
        const api = await createSelectableGrandTotalGrid(rejectsFooters, 'bottom');

        api.setServerSideSelectionState({ selectAll: false, toggledNodes: [ROOT_NODE_ID, '1'] });

        expect(api.getServerSideSelectionState()).toEqual({ selectAll: false, toggledNodes: ['1'] });
        expect(api.getSelectedNodes()).toEqual([]);
        expect(api.getRowNode('1')!.isSelected()).toBe(true);
        expect(api.getRowNode(GRAND_TOTAL_ROW_ID)!.isSelected()).toBe(false);
    });

    test('the root can be selected once a purge loads no grand total row', async () => {
        let grandTotalData: FlatRow | undefined = { id: 'Total', value: 30 };
        const api = gridMgr.createGrid('myGrid', {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            rowSelection: { mode: 'multiRow', isRowSelectable: rejectsFooters },
            grandTotalRow: 'bottom',
            getRowId: (params: GetRowIdParams<FlatRow>) => params.data.id,
            serverSideDatasource: {
                getRows(params) {
                    const response = { rowData: [...flatRows], rowCount: flatRows.length, grandTotalData };
                    setTimeout(() => params.success(response), 0);
                },
            },
        });
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);
        expect(api.getRowNode(GRAND_TOTAL_ROW_ID)!.selectable).toBe(false);

        grandTotalData = undefined;
        api.refreshServerSide({ purge: true });
        await waitFor(() => expect(api.getRowNode('1')?.data).toEqual(flatRows[0]));
        await waitForNoLoadingRows(api);
        expect(api.getRowNode(GRAND_TOTAL_ROW_ID)).toBeUndefined();

        const root = api.getRowNode('1')!.parent!;
        api.setNodesSelected({ nodes: [root], newValue: true, source: 'api' });
        expect(api.getSelectedNodes()).toEqual([root]);
    });

    test('the nodes getSelectedNodes returns for a selected grand total row can be deselected, also once it is hidden', async () => {
        const api = await createSelectableGrandTotalGrid(undefined, 'bottom');
        const grandTotal = api.getRowNode(GRAND_TOTAL_ROW_ID)!;
        const root = api.getRowNode('1')!.parent!;
        api.setNodesSelected({ nodes: [api.getRowNode('1')!, root], newValue: true, source: 'api' });
        expect(grandTotal.isSelected()).toBe(true);
        expect(api.getSelectedNodes()).toHaveLength(2);

        api.setNodesSelected({ nodes: api.getSelectedNodes(), newValue: false, source: 'api' });

        expect(grandTotal.isSelected()).toBe(false);
        expect(api.getSelectedNodes()).toEqual([]);

        api.setNodesSelected({ nodes: [api.getRowNode('1')!, grandTotal], newValue: true, source: 'api' });
        api.setGridOption('grandTotalRow', undefined);
        await waitForNoLoadingRows(api);
        expect(api.getRowNode(GRAND_TOTAL_ROW_ID)).toBeUndefined();
        expect(api.getSelectedNodes()).toHaveLength(2);

        api.setNodesSelected({ nodes: api.getSelectedNodes(), newValue: false, source: 'api' });
        expect(api.getSelectedNodes()).toEqual([]);
    });

    test('without a grand total row the server-side root can be selected through the API, as the client-side root can', async () => {
        const api = await createSelectableGrandTotalGrid(() => true, undefined);
        const root = api.getRowNode('1')!.parent!;
        expect(root.level).toBe(-1);

        api.setNodesSelected({ nodes: [root], newValue: true, source: 'api' });
        expect(api.getSelectedNodes()).toEqual([root]);

        api.setNodesSelected({ nodes: [root], newValue: false, source: 'api' });
        expect(api.getSelectedNodes()).toEqual([]);
    });

    test('a loading row cannot be deselected through the API', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [60] });
        const api = gridMgr.createGrid('myGrid', {
            columnDefs: [{ field: 'id' }],
            rowModelType: 'serverSide',
            rowSelection: { mode: 'multiRow' },
            getRowId: (params: GetRowIdParams<FlatRow>) => params.data.id,
            serverSideDatasource: { getRows: () => {} },
        });
        const loading = api.getDisplayedRowAtIndex(0)!;
        expect({ id: loading.id, level: loading.level }).toEqual({ id: undefined, level: 0 });

        api.setNodesSelected({ nodes: [loading], newValue: false, source: 'api' });

        expect(warnSpy.mock.calls.map((call) => String(call[0]))).toEqual([expect.stringContaining('#60')]);
        warnSpy.mockClear();
    });

    test('isRowSelectable is not asked again when an unrelated selection option changes', async () => {
        let asked = 0;
        const isRowSelectable = () => {
            ++asked;
            return true;
        };
        const api = await createSelectableGrandTotalGrid(isRowSelectable, 'bottom');
        expect(asked).toBeGreaterThan(0);
        asked = 0;

        api.setGridOption('rowSelection', { mode: 'multiRow', checkboxes: true, isRowSelectable });

        expect(asked).toBe(0);
    });
});
