import type { GridOptions, IServerSideGetRowsParams } from 'ag-grid-community';
import { RowSelectionModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../../test-utils';
import { waitForNoLoadingRows } from '../../test-utils/ssrm-test-utils';

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

    beforeEach(() => {
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
                    setTimeout(() => params.success({ rowData: data, rowCount: data.length }), 1);
                },
            },
            ...extra,
        };
    }

    async function createAndLoad(gridId: string, extra: Partial<GridOptions> = {}) {
        const api = gridsManager.createGrid(gridId, createFlatGridOptions(extra));
        await asyncSetTimeout(1);
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

        api.setServerSideSelectionState(captured!);
        await asyncSetTimeout(1);

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

        api.setServerSideSelectionState(state);
        await asyncSetTimeout(1);
        expect(api.getRowNode('a')!.isSelected()).toBe(true);
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

        api.refreshServerSide({ purge: false });
        await asyncSetTimeout(1);
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

        api.refreshServerSide({ purge: true });
        await asyncSetTimeout(1);
        await waitForNoLoadingRows(api);

        // Pinned: with a stable getRowId, the selection STATE persists across a purge refresh.
        expect(selectedIds(api)).toEqual(['b', 'e']);
        const state = api.getServerSideSelectionState() as any;
        expect(state.selectAll).toBe(false);
        expect([...state.toggledNodes].sort()).toEqual(['b', 'e']);
    });
});
