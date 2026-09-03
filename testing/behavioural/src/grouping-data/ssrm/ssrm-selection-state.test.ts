import { waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, TestGridsManager } from 'ag-test-utils';
import { waitForNoLoadingRows } from 'ag-test-utils/ssrm-test-utils';

import type { GridOptions, IServerSideGetRowsParams } from 'ag-grid-community';
import { RowSelectionModule, enableDevValidations } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

/**
 * CHARACTERIZATION (golden-master) tests pinning CURRENT SSRM selection-STATE-API behaviour on a
 * flat (non-grouped) server-side row model with `rowSelection: { mode: 'multiRow' }`:
 *
 *   - `getServerSideSelectionState()` shape after interaction-level selection.
 *   - round-trip through `setServerSideSelectionState()`.
 *   - selectAll-then-deselect-one shape.
 *   - whether selection survives `refreshServerSide({ purge: false })` and `{ purge: true }`.
 *
 * These assert what the grid DOES today, bugs included. RowNode objects are never asserted
 * directly (circular -> RangeError); selection is checked via scalar counts / sorted id arrays.
 */

interface DataItem {
    id: string;
    name: string;
}

function getFlatDataSet(): DataItem[] {
    return [
        { id: 'a', name: 'Alpha' },
        { id: 'b', name: 'Bravo' },
        { id: 'c', name: 'Charlie' },
        { id: 'd', name: 'Delta' },
        { id: 'e', name: 'Echo' },
    ];
}

function selectedIds(api: any): string[] {
    return api
        .getSelectedNodes()
        .map((n: any) => n.id)
        .sort();
}

describe('ag-grid SSRM selection-state API (characterization)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule, RowSelectionModule],
    });

    // Incremented once each getRows round-trip RESOLVES (after params.success), so tests can gate on
    // the datasource having actually come back rather than on a guessed delay.
    let loadCount = 0;

    beforeEach(() => {
        loadCount = 0;
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    function createFlatGridOptions(extra: Partial<GridOptions> = {}): GridOptions {
        const data = getFlatDataSet();
        return {
            columnDefs: [{ field: 'name' }],
            defaultColDef: { flex: 1 },
            rowModelType: 'serverSide',
            animateRows: false,
            rowSelection: { mode: 'multiRow' },
            getRowId: ({ data: d }) => d.id,
            serverSideDatasource: {
                getRows: (params: IServerSideGetRowsParams) => {
                    setTimeout(() => {
                        params.success({ rowData: data, rowCount: data.length });
                        loadCount++;
                    }, 1);
                },
            },
            ...extra,
        };
    }

    async function createAndLoad(gridId: string, extra: Partial<GridOptions> = {}) {
        const api = gridsManager.createGrid(gridId, createFlatGridOptions(extra));
        await waitFor(() => expect(loadCount).toBeGreaterThan(0));
        await waitForNoLoadingRows(api);
        return api;
    }

    test('getServerSideSelectionState() returns {selectAll:false, toggledNodes:[...ids]} after selecting rows', async () => {
        const api = await createAndLoad('ssrmSelStateBasic');

        api.getRowNode('b')!.setSelected(true);
        api.getRowNode('d')!.setSelected(true);

        expect(selectedIds(api)).toEqual(['b', 'd']);

        const state = api.getServerSideSelectionState() as any;
        expect(state.selectAll).toBe(false);
        expect([...state.toggledNodes].sort()).toEqual(['b', 'd']);
    });

    test('round-trip: capture state, deselect all, setServerSideSelectionState restores the same selection', async () => {
        const api = await createAndLoad('ssrmSelStateRoundTrip');

        api.getRowNode('a')!.setSelected(true);
        api.getRowNode('c')!.setSelected(true);
        const captured = api.getServerSideSelectionState();

        api.deselectAll();
        expect(selectedIds(api)).toEqual([]);

        // Gate on a flag that was FALSE before the restore, so the assertions below cannot pass on
        // the pre-restore state.
        api.setServerSideSelectionState(captured!);
        await waitFor(() => expect(api.getRowNode('a')!.isSelected()).toBe(true));

        // Surprising pin: the default SSRM strategy does NOT rebuild its selectedNodes map from
        // a state restore, so getSelectedNodes() stays empty even though the rows read as selected.
        expect(selectedIds(api)).toEqual([]);
        expect(api.getRowNode('a')!.isSelected()).toBe(true);
        expect(api.getRowNode('c')!.isSelected()).toBe(true);
        expect(api.getRowNode('b')!.isSelected()).toBe(false);
        // The state itself round-trips exactly.
        const restored = api.getServerSideSelectionState() as any;
        expect(restored.selectAll).toBe(false);
        expect([...restored.toggledNodes].sort()).toEqual(['a', 'c']);
    });

    test('selectAll then deselect one -> {selectAll:true, toggledNodes:[thatId]}; round-trips', async () => {
        // getSelectedNodes() after selectAll under SSRM deliberately warns (#199); asserted below.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [199] });
        const api = await createAndLoad('ssrmSelStateSelectAll');

        // Reading getSelectedNodes() after selectAll under SSRM warns (#199) that it is unreliable —
        // the warning is expected; the empty result it produces is exactly what this test pins.
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        api.selectAll();
        api.getRowNode('c')!.setSelected(false);

        // Surprising pin: under selectAll the strategy tracks only toggled (deselected) nodes, so
        // getSelectedNodes() is empty; conceptual selection is read via isSelected()/state.
        expect(selectedIds(api)).toEqual([]);
        expect(warnSpy.mock.calls.flat().join(' ')).toContain('#199');
        expect(api.getRowNode('a')!.isSelected()).toBe(true);
        expect(api.getRowNode('c')!.isSelected()).toBe(false);

        const state = api.getServerSideSelectionState() as any;
        expect(state.selectAll).toBe(true);
        expect([...state.toggledNodes].sort()).toEqual(['c']);

        api.deselectAll();
        expect(api.getRowNode('a')!.isSelected()).toBe(false);

        // 'a' was deselected by the deselectAll above, so this gate can only pass post-restore.
        api.setServerSideSelectionState(state);
        await waitFor(() => expect(api.getRowNode('a')!.isSelected()).toBe(true));
        expect(api.getRowNode('c')!.isSelected()).toBe(false);
        const restored = api.getServerSideSelectionState() as any;
        expect(restored.selectAll).toBe(true);
        expect([...restored.toggledNodes].sort()).toEqual(['c']);
    });

    test('selection SURVIVES refreshServerSide({purge:false})', async () => {
        const api = await createAndLoad('ssrmSelStateRefreshNoPurge');

        api.getRowNode('b')!.setSelected(true);
        api.getRowNode('e')!.setSelected(true);
        expect(selectedIds(api)).toEqual(['b', 'e']);

        // The selection asserted below is the same selection that held before the refresh, so gate on
        // the refresh's getRows round-trip having RESOLVED — otherwise the assertions are vacuous.
        const loadsBeforeRefresh = loadCount;
        api.refreshServerSide({ purge: false });
        await waitFor(() => expect(loadCount).toBeGreaterThan(loadsBeforeRefresh));
        await waitForNoLoadingRows(api);

        // Pinned: selection survives a non-purge refresh (stable getRowId identity).
        expect(selectedIds(api)).toEqual(['b', 'e']);
        const state = api.getServerSideSelectionState() as any;
        expect(state.selectAll).toBe(false);
        expect([...state.toggledNodes].sort()).toEqual(['b', 'e']);
    });

    test('selection across refreshServerSide({purge:true})', async () => {
        const api = await createAndLoad('ssrmSelStateRefreshPurge');

        api.getRowNode('b')!.setSelected(true);
        api.getRowNode('e')!.setSelected(true);
        expect(selectedIds(api)).toEqual(['b', 'e']);

        // As above: the post-refresh selection matches the pre-refresh one, so the round-trip must be
        // observed to have resolved before asserting.
        const loadsBeforeRefresh = loadCount;
        api.refreshServerSide({ purge: true });
        await waitFor(() => expect(loadCount).toBeGreaterThan(loadsBeforeRefresh));
        await waitForNoLoadingRows(api);

        // Pinned: with a stable getRowId, the selection STATE persists across a purge refresh.
        expect(selectedIds(api)).toEqual(['b', 'e']);
        const state = api.getServerSideSelectionState() as any;
        expect(state.selectAll).toBe(false);
        expect([...state.toggledNodes].sort()).toEqual(['b', 'e']);
    });

    // A purge destroys the row nodes while the rows themselves still exist, so `destroyed` here means
    // "not currently cached", not "gone". Selection is keyed by id, so a handle captured before the
    // purge still names a real row - filtering destroyed nodes out of `setNodesSelected` would break this.
    test('selecting through a node handle destroyed by a purge still selects the live row', async () => {
        const api = await createAndLoad('ssrmSelStateStaleHandle');

        const staleHandle = api.getRowNode('b')!;

        const loadsBeforeRefresh = loadCount;
        api.refreshServerSide({ purge: true });
        await waitFor(() => expect(loadCount).toBeGreaterThan(loadsBeforeRefresh));
        await waitForNoLoadingRows(api);

        const liveNode = api.getRowNode('b')!;
        expect(staleHandle.destroyed).toBe(true);
        expect(liveNode).not.toBe(staleHandle);

        api.setNodesSelected({ nodes: [staleHandle], newValue: true, source: 'api' });

        expect(selectedIds(api)).toEqual(['b']);
        expect(liveNode.isSelected()).toBe(true);
        expect([...(api.getServerSideSelectionState() as any).toggledNodes]).toEqual(['b']);
    });
});
