import type { MockInstance } from 'vitest';

import type { GetRowIdParams, GridOptions, IGetRowsParams } from 'ag-grid-community';
import { InfiniteRowModelModule, RowSelectionModule } from 'ag-grid-community';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

// The "daemon" mechanism (selectionService.createDaemonNode/syncInRowNode) only fires when a live
// RowNode object has its id changed while selected. That happens in the infinite row model, where a
// block reuses the same RowNode instances across reloads (setDataAndId), so a re-sort/refresh with
// getRowId can repurpose a selected node for different data.
describe('Selection daemon nodes (id change while selected)', () => {
    let consoleErrorSpy: MockInstance;
    let consoleWarnSpy: MockInstance;

    const gridsManager = new TestGridsManager({
        modules: [InfiniteRowModelModule, RowSelectionModule],
    });

    beforeEach(() => {
        gridsManager.reset();
        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        gridsManager.reset();
        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(consoleWarnSpy).not.toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    type Row = { id: string; sport: string };

    function createInfiniteGrid(getResponse: () => Row[], options?: Partial<GridOptions>) {
        const pending: Array<() => void> = [];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'sport' }],
            rowSelection: { mode: 'multiRow', headerCheckbox: false },
            rowModelType: 'infinite',
            cacheBlockSize: 100,
            maxBlocksInCache: 1,
            datasource: {
                getRows: (params: IGetRowsParams) => {
                    const response = getResponse();
                    pending.push(() =>
                        params.successCallback(response.slice(params.startRow, params.endRow), response.length)
                    );
                },
            },
            ...options,
        });

        // The datasource is invoked from a setTimeout, so let it queue then resolve it synchronously.
        const load = async () => {
            await asyncSetTimeout(0);
            while (pending.length) {
                pending.shift()!();
            }
            await asyncSetTimeout(0);
        };

        return { api, load };
    }

    test('keeps a selected row selected via a daemon clone when its node is recycled to a new id', async () => {
        let response: Row[] = [
            { id: 'a', sport: 'football' },
            { id: 'b', sport: 'rugby' },
            { id: 'c', sport: 'tennis' },
        ];
        const { api, load } = createInfiniteGrid(() => response, {
            getRowId: (params: GetRowIdParams) => params.data.id,
        });
        await load();

        const nodeA = api.getRowNode('a')!;
        api.setNodesSelected({ nodes: [nodeA], newValue: true });
        expect(api.getSelectedNodes()).toEqual([nodeA]);

        // Re-sort so the slot that held 'a' now serves a different row id.
        response = [
            { id: 'x', sport: 'hockey' },
            { id: 'b', sport: 'rugby' },
            { id: 'c', sport: 'tennis' },
        ];
        api.refreshInfiniteCache();
        await load();

        // The pool node object was recycled onto 'x'; selection for 'a' survives on a detached clone.
        expect(nodeA.id).toBe('x');
        expect(api.getRowNode('x')).toBe(nodeA);
        expect(nodeA.isSelected()).toBe(false);
        expect(api.getRowNode('a')).toBeUndefined();

        const selected = api.getSelectedNodes();
        expect(selected).toHaveLength(1);
        expect(selected[0]).not.toBe(nodeA);
        expect(selected[0].id).toBe('a');
        expect(selected[0].data).toEqual({ id: 'a', sport: 'football' });
        expect(selected[0].isSelected()).toBe(true);
    });

    test('rebinds selection to the live node when the original id returns', async () => {
        let response: Row[] = [
            { id: 'a', sport: 'football' },
            { id: 'b', sport: 'rugby' },
        ];
        const { api, load } = createInfiniteGrid(() => response, {
            getRowId: (params: GetRowIdParams) => params.data.id,
        });
        await load();

        api.setNodesSelected({ nodes: [api.getRowNode('a')!], newValue: true });

        // Push 'a' out of the loaded data — selection is held by a daemon.
        response = [
            { id: 'x', sport: 'hockey' },
            { id: 'b', sport: 'rugby' },
        ];
        api.refreshInfiniteCache();
        await load();
        expect(api.getSelectedNodes()[0].id).toBe('a');
        expect(api.getRowNode('a')).toBeUndefined();

        // Bring 'a' back: the daemon is dropped and the live node is reselected.
        response = [
            { id: 'a', sport: 'football' },
            { id: 'b', sport: 'rugby' },
        ];
        api.refreshInfiniteCache();
        await load();

        const liveA = api.getRowNode('a')!;
        const selected = api.getSelectedNodes();
        expect(selected).toHaveLength(1);
        expect(selected[0]).toBe(liveA);
        expect(liveA.isSelected()).toBe(true);
    });

    test('does not retain selection for an unselected row whose node id changes', async () => {
        let response: Row[] = [
            { id: 'a', sport: 'football' },
            { id: 'b', sport: 'rugby' },
            { id: 'c', sport: 'tennis' },
        ];
        const { api, load } = createInfiniteGrid(() => response, {
            getRowId: (params: GetRowIdParams) => params.data.id,
        });
        await load();

        const nodeA = api.getRowNode('a')!;
        api.setNodesSelected({ nodes: [nodeA], newValue: true });

        // Recycle the unselected 'b' slot onto 'y', leaving the selected 'a' slot untouched.
        response = [
            { id: 'a', sport: 'football' },
            { id: 'y', sport: 'hockey' },
            { id: 'c', sport: 'tennis' },
        ];
        api.refreshInfiniteCache();
        await load();

        // No daemon for 'b'; 'a' stays bound to its live node (id unchanged is a no-op).
        const selected = api.getSelectedNodes();
        expect(selected).toHaveLength(1);
        expect(selected[0].id).toBe('a');
        expect(selected[0]).toBe(api.getRowNode('a'));
        expect(api.getRowNode('y')!.isSelected()).toBe(false);
    });

    test('binds selection to the row index when no getRowId is provided', async () => {
        let response: Row[] = [
            { id: 'a', sport: 'football' },
            { id: 'b', sport: 'rugby' },
        ];
        const { api, load } = createInfiniteGrid(() => response);
        await load();

        const firstRow = api.getDisplayedRowAtIndex(0)!;
        api.setNodesSelected({ nodes: [firstRow], newValue: true });
        expect(firstRow.data.sport).toBe('football');

        // Without getRowId the id is the row index, so it never changes: selection follows the slot,
        // not the data — the new row at index 0 becomes selected and no daemon is created.
        response = [
            { id: 'a', sport: 'hockey' },
            { id: 'b', sport: 'rugby' },
        ];
        api.refreshInfiniteCache();
        await load();

        const selected = api.getSelectedNodes();
        expect(selected).toHaveLength(1);
        expect(selected[0]).toBe(api.getDisplayedRowAtIndex(0));
        expect(selected[0].data.sport).toBe('hockey');
    });

    // The community SelectionService backs the infinite row model too, where there is no CSRM root and no
    // changed-rows delta. A runtime isRowSelectable change must still recompute selectable for every loaded
    // row and deselect any that is no longer selectable.
    test('recomputes selectable and deselects newly-unselectable rows when isRowSelectable changes', async () => {
        const response: Row[] = [
            { id: 'a', sport: 'football' },
            { id: 'b', sport: 'rugby' },
            { id: 'c', sport: 'tennis' },
        ];
        const { api, load } = createInfiniteGrid(() => response, {
            getRowId: (params: GetRowIdParams) => params.data.id,
        });
        await load();

        expect(api.getRowNode('a')!.selectable).toBe(true);
        expect(api.getRowNode('b')!.selectable).toBe(true);

        api.setNodesSelected({ nodes: [api.getRowNode('b')!], newValue: true });
        expect(api.getRowNode('b')!.isSelected()).toBe(true);

        api.setGridOption('rowSelection', {
            mode: 'multiRow',
            headerCheckbox: false,
            isRowSelectable: (node) => node.data?.sport === 'football',
        });

        expect(api.getRowNode('a')!.selectable).toBe(true);
        expect(api.getRowNode('b')!.selectable).toBe(false);
        expect(api.getRowNode('c')!.selectable).toBe(false);

        // 'b' was selected but is no longer selectable, so it must have been deselected.
        expect(api.getRowNode('b')!.isSelected()).toBe(false);
        expect(api.getSelectedNodes()).toEqual([]);
    });
});
