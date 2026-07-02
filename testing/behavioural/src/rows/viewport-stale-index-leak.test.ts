import type { GridApi, IViewportDatasourceParams } from 'ag-grid-community';
import { ViewportRowModelModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('viewport stale index + orphaned row ctrl leak', () => {
    const gridsManager = new TestGridsManager({ modules: [ViewportRowModelModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    function rowDataFromIds(idsByIndex: Record<number, string>) {
        const rowData: Record<number, { id: string; name: string }> = {};
        for (const [index, id] of Object.entries(idsByIndex)) {
            rowData[Number(index)] = { id, name: `name-${id}` };
        }
        return rowData;
    }

    function createSeededGrid(): { api: GridApi; ds: IViewportDatasourceParams } {
        let dsParams: IViewportDatasourceParams | undefined;
        const api: GridApi = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name' }],
            rowModelType: 'viewport',
            getRowId: (params) => params.data.id,
            viewportDatasource: {
                init: (params) => {
                    dsParams = params;
                },
                setViewportRange: () => {},
            },
        });
        return { api, ds: dsParams! };
    }

    function createSeededGridWithoutRowId(): { api: GridApi; ds: IViewportDatasourceParams } {
        let dsParams: IViewportDatasourceParams | undefined;
        const api: GridApi = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name' }],
            rowModelType: 'viewport',
            viewportDatasource: {
                init: (params) => {
                    dsParams = params;
                },
                setViewportRange: () => {},
            },
        });
        return { api, ds: dsParams! };
    }

    // ---- issue 1: data model / rendering ------------------------------------
    test('MODEL: a moved node is not left at its previous index', async () => {
        const { api, ds } = createSeededGrid();
        await asyncSetTimeout(0);

        ds.setRowCount(5);
        ds.setRowData(rowDataFromIds({ 0: 'a', 1: 'b', 2: 'c', 3: 'd', 4: 'e' }));
        await asyncSetTimeout(0);

        // 'e' moves to the top, index 4 omitted (partial server-sorted feed)
        ds.setRowData(rowDataFromIds({ 0: 'e', 1: 'a', 2: 'b', 3: 'c' }));
        await asyncSetTimeout(0);

        const visitedIds: string[] = [];
        api.forEachNode((node) => visitedIds.push(node.id!));

        expect(visitedIds.filter((id) => id === 'e')).toHaveLength(1);
        expect(new Set(visitedIds).size).toBe(visitedIds.length);
    });

    test('OMIT: a node whose index is omitted and which did not move is left unchanged', async () => {
        const { api, ds } = createSeededGrid();
        await asyncSetTimeout(0);

        ds.setRowCount(5);
        ds.setRowData(rowDataFromIds({ 0: 'a', 1: 'b', 2: 'c', 3: 'd', 4: 'e' }));
        await asyncSetTimeout(0);

        const nodeC = api.getRowNode('c');

        // only indexes 0 and 1 are refreshed; 2, 3, 4 omitted and no node changes index
        ds.setRowData(rowDataFromIds({ 0: 'a', 1: 'b' }));
        await asyncSetTimeout(0);

        // the guard must not over-delete: omitted, un-moved nodes stay put
        expect(api.getRowNode('c')).toBe(nodeC);
        expect(nodeC!.rowIndex).toBe(2);

        const visitedIds: string[] = [];
        api.forEachNode((node) => visitedIds.push(node.id!));
        expect(visitedIds.slice().sort()).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    test('SWAP: two nodes exchanging indexes leaves neither duplicated', async () => {
        const { api, ds } = createSeededGrid();
        await asyncSetTimeout(0);

        ds.setRowCount(2);
        ds.setRowData(rowDataFromIds({ 0: 'a', 1: 'b' }));
        await asyncSetTimeout(0);

        // straight swap: the stale-slot guard must be order-safe, deleting a
        // vacated slot only when it still points at the moved node
        ds.setRowData(rowDataFromIds({ 0: 'b', 1: 'a' }));
        await asyncSetTimeout(0);

        const idByIndex: Record<number, string> = {};
        api.forEachNode((node) => (idByIndex[node.rowIndex!] = node.id!));
        expect(idByIndex).toEqual({ 0: 'b', 1: 'a' });

        const visitedIds: string[] = [];
        api.forEachNode((node) => visitedIds.push(node.id!));
        expect(new Set(visitedIds).size).toBe(visitedIds.length);
    });

    test('CONSISTENCY: getRow + in-place setData does not move a node, and a later reshuffle reuses it', async () => {
        const { api, ds } = createSeededGrid();
        await asyncSetTimeout(0);

        ds.setRowCount(5);
        ds.setRowData(rowDataFromIds({ 0: 'a', 1: 'b', 2: 'c', 3: 'd', 4: 'e' }));
        await asyncSetTimeout(0);

        // in-place update via the datasource getRow path — must not relocate the node
        const node4 = ds.getRow(4);
        node4.setData({ id: 'e', name: 'name-e-updated' });
        await asyncSetTimeout(0);

        expect(node4.rowIndex).toBe(4);
        expect(api.getRowNode('e')).toBe(node4);

        // now relocate 'e' to the top with the tail omitted; the same node instance
        // must be reused at its new index with no stale duplicate left behind
        ds.setRowData(rowDataFromIds({ 0: 'e', 1: 'a', 2: 'b', 3: 'c' }));
        await asyncSetTimeout(0);

        const relocated = api.getRowNode('e');
        expect(relocated).toBe(node4);
        expect(relocated!.rowIndex).toBe(0);

        const visitedIds: string[] = [];
        api.forEachNode((node) => visitedIds.push(node.id!));
        expect(visitedIds.filter((id) => id === 'e')).toHaveLength(1);
        expect(new Set(visitedIds).size).toBe(visitedIds.length);
    });

    test('NO_ROW_ID: positional model updates data in place with no duplicate or orphan', async () => {
        const { api, ds } = createSeededGridWithoutRowId();
        await asyncSetTimeout(0);

        ds.setRowCount(5);
        ds.setRowData(rowDataFromIds({ 0: 'a', 1: 'b', 2: 'c', 3: 'd', 4: 'e' }));
        await asyncSetTimeout(0);

        // Internal access is unavoidable here: after repeated recycles the model self-heals the
        // visible duplication, so forEachNode and the DOM are clean while orphaned RowCtrls remain
        // alive-but-unreachable. That leak has no public API/DOM footprint, so the only way to
        // detect it is to census controllers via the RowRenderer. (The visible duplication is
        // covered black-box by the MODEL/RENDER tests above and in viewport-row-model.test.ts.)
        const beans = (ds.getRow(0) as any).beans;
        const rowRenderer = beans.rowRenderer;

        const seen = new Set<any>(rowRenderer.getAllRowCtrls());
        const RowCtrlProto = Object.getPrototypeOf([...seen][0]);
        const origAddListeners = RowCtrlProto.addListeners;
        RowCtrlProto.addListeners = function (...args: any[]) {
            seen.add(this);
            return origAddListeners.apply(this, args);
        };

        try {
            // without getRowId the model is purely positional: the same data feed
            // that would reshuffle an id-keyed model just replaces data at each index
            const a = rowDataFromIds({ 0: 'e', 1: 'a', 2: 'b', 3: 'c' });
            const b = rowDataFromIds({ 0: 'a', 1: 'b', 2: 'c', 3: 'd' });
            for (let i = 0; i < 6; i++) {
                ds.setRowData(i % 2 ? b : a);
                await asyncSetTimeout(0);
            }
        } finally {
            RowCtrlProto.addListeners = origAddListeners;
        }

        // the model is positional: exactly one node per index, none duplicated
        const nodesByIndex = new Map<number, any>();
        const nodes: any[] = [];
        api.forEachNode((node) => {
            nodesByIndex.set(node.rowIndex!, node);
            nodes.push(node);
        });
        expect([...nodesByIndex.keys()].sort((x, y) => x - y)).toEqual([0, 1, 2, 3, 4]);
        expect(new Set(nodes).size).toBe(nodes.length);

        const reachable = new Set(rowRenderer.getAllRowCtrls());
        const orphaned = [...seen].filter((c) => c.isAlive() && !reachable.has(c));
        expect(orphaned).toHaveLength(0);
    });

    test('RENDER: the same row id is not painted at two indexes', async () => {
        const { ds } = createSeededGrid();
        await asyncSetTimeout(0);

        ds.setRowCount(5);
        ds.setRowData(rowDataFromIds({ 0: 'a', 1: 'b', 2: 'c', 3: 'd', 4: 'e' }));
        await asyncSetTimeout(0);

        ds.setRowData(rowDataFromIds({ 0: 'e', 1: 'a', 2: 'b', 3: 'c' }));
        await asyncSetTimeout(0);

        const rowEls = Array.from(document.querySelectorAll('.ag-row[row-id]'));
        const idCounts = rowEls.reduce<Record<string, number>>((m, el) => {
            const id = el.getAttribute('row-id')!;
            m[id] = (m[id] ?? 0) + 1;
            return m;
        }, {});
        const duplicated = Object.entries(idCounts).filter(([, n]) => n > 1);
        expect(duplicated).toEqual([]);
    });

    // ---- issue 2: orphaned RowCtrl memory leak ------------------------------
    test('LEAK: no RowCtrl is left alive but unreachable after recycles', async () => {
        const { api, ds } = createSeededGrid();
        await asyncSetTimeout(0);

        ds.setRowCount(5);
        ds.setRowData(rowDataFromIds({ 0: 'a', 1: 'b', 2: 'c', 3: 'd', 4: 'e' }));
        await asyncSetTimeout(0);

        // Internal access is unavoidable here: the orphaned-RowCtrl leak this test targets is purely
        // internal — after recycles, forEachNode and the DOM are clean while leaked controllers stay
        // alive-but-unreachable. There is no public API/DOM signal for it, so we must census
        // controllers via the RowRenderer to observe the leak at all.
        const beans = (api.getRowNode('a') as any).beans;
        const rowRenderer = beans.rowRenderer;

        // Census EVERY RowCtrl ever constructed by spying its prototype addListeners.
        const seen = new Set<any>(rowRenderer.getAllRowCtrls());
        const RowCtrlProto = Object.getPrototypeOf([...seen][0]);
        const origAddListeners = RowCtrlProto.addListeners;
        RowCtrlProto.addListeners = function (...args: any[]) {
            seen.add(this);
            return origAddListeners.apply(this, args);
        };

        try {
            // reshuffle repeatedly, each time omitting the tail index so a node is
            // left duplicated at a stale index, then recycled on the next update
            const a = rowDataFromIds({ 0: 'e', 1: 'a', 2: 'b', 3: 'c' });
            const b = rowDataFromIds({ 0: 'a', 1: 'b', 2: 'c', 3: 'd' });
            for (let i = 0; i < 6; i++) {
                ds.setRowData(i % 2 ? b : a);
                await asyncSetTimeout(0);
            }
        } finally {
            RowCtrlProto.addListeners = origAddListeners;
        }

        const reachable = new Set(rowRenderer.getAllRowCtrls());
        const orphaned = [...seen].filter((c) => c.isAlive() && !reachable.has(c));

        expect(orphaned).toHaveLength(0);
    });
});
