import type { GridOptions, IServerSideGetRowsParams } from 'ag-grid-community';
import { RowSelectionModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, asyncSetTimeout } from '../../test-utils';
import { countLoadingRows, waitForNoLoadingRows } from '../../test-utils/ssrm-test-utils';
import { createFakeServer, getSmallTreeDataSet } from './ssrmSmallTreeDataSet';

/**
 * CHARACTERIZATION (golden-master) tests pinning CURRENT SSRM tree-data behaviour for two cells:
 *
 *   (A) INITIAL LOAD with `serverSideInitialRowCount` on tree data — how many top-level
 *       placeholder/loading rows show BEFORE the root store resolves, the first request
 *       shape (empty groupKeys), and how the displayed top-level count RECONCILES once the
 *       real number of tree roots arrives (both larger and smaller than the initial guess).
 *       Also pins whether the initial-count guess applies to child levels on expand.
 *
 *   (B) SELECTION with `rowSelection: { mode: 'multiRow', groupSelects: 'descendants' }`
 *       (the modern replacement for the old boolean `groupSelectsChildren`) on tree data —
 *       which nodes become selected when a group is selected, `getSelectedNodes().length`
 *       and their ids, how NOT-yet-loaded descendants behave (select the parent BEFORE
 *       expanding, then load), and selecting a leaf vs a group.
 *
 * These assert what the grid DOES today, bugs included. RowNode objects are never asserted
 * directly (circular → RangeError); existence is checked via booleans and selection via
 * scalar counts / id arrays. GridRows inline snapshots are generated via --update-grid-rows.
 */

interface RecordedRequest {
    groupKeys: string[];
    range: [number | undefined, number | undefined];
}

describe('ag-grid SSRM treeData initial-load & selection (characterization)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule, TreeDataModule, RowSelectionModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    // Base tree-data SSRM grid options; datasource is supplied per test so each test records
    // its own request stream inline (house style — no shared datasource factory).
    function createTreeGridOptions(extra: Partial<GridOptions> = {}): GridOptions {
        return {
            columnDefs: [
                { field: 'employeeId', hide: true },
                { field: 'employeeName', hide: true },
                { field: 'jobTitle' },
                { field: 'employmentType' },
            ],
            autoGroupColumnDef: { field: 'employeeName' },
            defaultColDef: { flex: 1 },
            treeData: true,
            rowModelType: 'serverSide',
            animateRows: false,
            getRowId: ({ data }) => data.employeeId,
            isServerSideGroup: (dataItem: any) => dataItem.group,
            getServerSideGroupKey: (dataItem: any) => dataItem.employeeId,
            ...extra,
        };
    }

    // ---------------------------------------------------------------------------------------
    // (A) INITIAL LOAD × Tree-data
    // ---------------------------------------------------------------------------------------
    describe('initial load (serverSideInitialRowCount) x tree-data', () => {
        test('before the root resolves: serverSideInitialRowCount top-level placeholder rows show and the first request has empty groupKeys', async () => {
            const initialCount = 7;
            const requests: RecordedRequest[] = [];
            // Deferred datasource: stash params so the root store stays in-flight and the
            // pre-resolve display state can be observed.
            const pending: IServerSideGetRowsParams[] = [];
            const fakeServer = createFakeServer(getSmallTreeDataSet());

            const api = gridsManager.createGrid(
                'ssrmTreeInitialPending',
                createTreeGridOptions({
                    serverSideInitialRowCount: initialCount,
                    serverSideDatasource: {
                        getRows: (params: IServerSideGetRowsParams) => {
                            requests.push({
                                groupKeys: [...(params.request.groupKeys ?? [])],
                                range: [params.request.startRow, params.request.endRow],
                            });
                            pending.push(params);
                        },
                    },
                })
            );

            // Let the root request dispatch without resolving it.
            await asyncSetTimeout(30);

            // The grid sizes its top level to the configured initial row count before the
            // root store resolves, and every one of those rows is a loading/stub row.
            expect(api.getDisplayedRowCount()).toBe(initialCount);
            expect(countLoadingRows(api)).toBe(initialCount);

            // The first (and only) request so far is for the root children: empty groupKeys.
            expect(requests.length).toBe(1);
            expect(requests[0].groupKeys).toEqual([]);

            // Drain the in-flight request so the deferred datasource does not leak past the test.
            for (let i = 0, len = pending.length; i < len; ++i) {
                const rows = fakeServer.getData(pending[i].request);
                pending[i].success({ rowData: rows, rowCount: rows.length });
            }
        });

        test('after the root resolves: displayed top-level count reflects the single real tree root (initial guess of 7 shrinks to 1)', async () => {
            const initialCount = 7;
            const requests: RecordedRequest[] = [];
            const fakeServer = createFakeServer(getSmallTreeDataSet());

            const api = gridsManager.createGrid(
                'ssrmTreeInitialShrink',
                createTreeGridOptions({
                    serverSideInitialRowCount: initialCount,
                    serverSideDatasource: {
                        getRows: (params: IServerSideGetRowsParams) => {
                            requests.push({
                                groupKeys: [...(params.request.groupKeys ?? [])],
                                range: [params.request.startRow, params.request.endRow],
                            });
                            const rows = fakeServer.getData(params.request);
                            setTimeout(() => params.success({ rowData: rows, rowCount: rows.length }), 1);
                        },
                    },
                })
            );

            await asyncSetTimeout(1);
            await waitForNoLoadingRows(api);

            // Reconciliation: the dataset has a single root (id 101), so the initial guess of 7
            // shrinks to 1 once the real root children resolve. No loading stubs remain.
            expect(api.getDisplayedRowCount()).toBe(1);
            expect(countLoadingRows(api)).toBe(0);
            expect(!!api.getRowNode('101')).toBe(true);
            expect(requests[0].groupKeys).toEqual([]);

            await new GridRows(api, 'tree initial-count shrunk to 1 real root').check(`
                ROOT id:<no-id>
                └── 101 GROUP collapsed id:101 ag-Grid-AutoColumn:"Erica Rogers" employeeId:"101" employeeName:"Erica Rogers" jobTitle:"CEO" employmentType:"Permanent"
            `);
        });

        test('serverSideInitialRowCount does NOT pre-size a child level on expand: an expanded group shows its real children directly, no top-level-sized placeholders', async () => {
            const initialCount = 7;
            const requests: RecordedRequest[] = [];
            // Defer only the child (expand) request so the child-level pre-resolve state is observable.
            let deferChild = false;
            const pendingChild: IServerSideGetRowsParams[] = [];
            const fakeServer = createFakeServer(getSmallTreeDataSet());

            const api = gridsManager.createGrid(
                'ssrmTreeInitialChildLevel',
                createTreeGridOptions({
                    serverSideInitialRowCount: initialCount,
                    serverSideDatasource: {
                        getRows: (params: IServerSideGetRowsParams) => {
                            requests.push({
                                groupKeys: [...(params.request.groupKeys ?? [])],
                                range: [params.request.startRow, params.request.endRow],
                            });
                            if (deferChild && (params.request.groupKeys?.length ?? 0) > 0) {
                                pendingChild.push(params);
                                return;
                            }
                            const rows = fakeServer.getData(params.request);
                            setTimeout(() => params.success({ rowData: rows, rowCount: rows.length }), 1);
                        },
                    },
                })
            );

            await asyncSetTimeout(1);
            await waitForNoLoadingRows(api);

            // Expand 101 but hold the child request in-flight to observe the child level's pre-resolve size.
            deferChild = true;
            api.getRowNode('101')!.setExpanded(true);
            await asyncSetTimeout(30);

            // Child-level finding: serverSideInitialRowCount does NOT apply to child stores. While
            // 101's children load, exactly ONE loading row shows under it (not `initialCount`), so
            // the displayed count is the root (1) + a single child placeholder (1) = 2.
            expect(countLoadingRows(api)).toBe(1);
            expect(api.getDisplayedRowCount()).toBe(2);

            // Resolve the deferred child request.
            for (let i = 0, len = pendingChild.length; i < len; ++i) {
                const rows = fakeServer.getData(pendingChild[i].request);
                pendingChild[i].success({ rowData: rows, rowCount: rows.length });
            }
            await waitForNoLoadingRows(api);

            expect(countLoadingRows(api)).toBe(0);

            await new GridRows(api, 'tree expanded child level (no initial-count pre-size)').check(`
                ROOT id:<no-id>
                └─┬ 101 GROUP id:101 ag-Grid-AutoColumn:"Erica Rogers" employeeId:"101" employeeName:"Erica Rogers" jobTitle:"CEO" employmentType:"Permanent"
                · ├── 102 GROUP collapsed id:102 ag-Grid-AutoColumn:"Malcolm Barrett" employeeId:"102" employeeName:"Malcolm Barrett" jobTitle:"Exec. Vice President" employmentType:"Permanent"
                · └── 113 GROUP collapsed id:113 ag-Grid-AutoColumn:"Luke McBride" employeeId:"113" employeeName:"Luke McBride" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            `);
        });
    });

    // ---------------------------------------------------------------------------------------
    // (B) SELECTION (groupSelects: 'descendants') × Tree-data
    // ---------------------------------------------------------------------------------------
    describe('selection (groupSelects descendants) x tree-data', () => {
        // These tests deliberately read selection via `getSelectedNodes()` under SSRM + groupSelects,
        // which the grid warns (#202) is unreliable — that warning is exactly the behaviour being pinned.
        let warnSpy: ReturnType<typeof vi.spyOn>;
        beforeEach(() => {
            warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        });
        afterEach(() => {
            expect(warnSpy.mock.calls.flat().join(' ')).toContain('#202');
            warnSpy.mockRestore();
        });

        function createSelectionGrid(gridId: string) {
            const requests: RecordedRequest[] = [];
            const fakeServer = createFakeServer(getSmallTreeDataSet());
            const api = gridsManager.createGrid(
                gridId,
                createTreeGridOptions({
                    rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
                    serverSideDatasource: {
                        getRows: (params: IServerSideGetRowsParams) => {
                            requests.push({
                                groupKeys: [...(params.request.groupKeys ?? [])],
                                range: [params.request.startRow, params.request.endRow],
                            });
                            const rows = fakeServer.getData(params.request);
                            setTimeout(() => params.success({ rowData: rows, rowCount: rows.length }), 1);
                        },
                    },
                })
            );
            return { api, requests };
        }

        async function expandById(api: any, id: string): Promise<void> {
            api.getRowNode(id)!.setExpanded(true);
            await waitForNoLoadingRows(api);
        }

        test('selecting a fully-loaded group selects the group and all its loaded descendants', async () => {
            const { api } = createSelectionGrid('ssrmTreeSelectLoadedGroup');

            await asyncSetTimeout(1);
            await waitForNoLoadingRows(api);
            // Expand the branch 101 -> 102 -> 108 so all of 108's descendants (leaves) are loaded.
            await expandById(api, '101');
            await expandById(api, '102');
            await expandById(api, '108');

            // Select group 108 — with groupSelects:'descendants' its loaded leaf children are selected too.
            api.getRowNode('108')!.setSelected(true);

            const selectedIds = api
                .getSelectedNodes()
                .map((n: any) => n.id)
                .sort();
            // Pin: group 108 plus its four loaded leaf children (109-112) become selected.
            expect(selectedIds).toEqual(['108', '109', '110', '111', '112'].sort());
            expect(api.getSelectedNodes().length).toBe(5);
        });

        test('selecting a group BEFORE its descendants are loaded: only the group is selected now; children get selected once later loaded on expand', async () => {
            const { api } = createSelectionGrid('ssrmTreeSelectUnloadedGroup');

            await asyncSetTimeout(1);
            await waitForNoLoadingRows(api);
            await expandById(api, '101');
            // 102 is loaded (child of 101) but NOT expanded, so 102's own descendants are unloaded.

            // Select group 102 while its descendants are still unloaded.
            api.getRowNode('102')!.setSelected(true);

            // Latent behaviour (unloaded descendants): at select time only the group node itself
            // counts as selected — the not-yet-loaded descendants cannot be enumerated.
            const selectedBefore = api
                .getSelectedNodes()
                .map((n: any) => n.id)
                .sort();
            expect(selectedBefore).toEqual(['102']);
            expect(api.getSelectedNodes().length).toBe(1);

            // Now expand 102 so its children load. Pin whether the descendants inherit the
            // group's selection once they arrive.
            await expandById(api, '102');

            const selectedAfter = api
                .getSelectedNodes()
                .map((n: any) => n.id)
                .sort();
            // Latent behaviour pinned: on load, the newly-arrived children of the selected group
            // ARE auto-selected (103, 108 join 102).
            expect(selectedAfter).toEqual(['102', '103', '108'].sort());
            expect(api.getSelectedNodes().length).toBe(3);
        });

        test('selecting a leaf selects only that leaf (no descendants, no ancestor cascade)', async () => {
            const { api } = createSelectionGrid('ssrmTreeSelectLeaf');

            await asyncSetTimeout(1);
            await waitForNoLoadingRows(api);
            await expandById(api, '101');
            await expandById(api, '102');
            await expandById(api, '108');

            // Select a single leaf (109).
            api.getRowNode('109')!.setSelected(true);

            const selectedIds = api
                .getSelectedNodes()
                .map((n: any) => n.id)
                .sort();
            // Pin: a leaf selection is just that one node — no descendants, and the parent group
            // 108 is NOT auto-selected from a single child (partial selection, not full).
            expect(selectedIds).toEqual(['109']);
            expect(api.getSelectedNodes().length).toBe(1);
            // Latent behaviour: isSelected() on the not-fully-selected parent group returns
            // `undefined` here (indeterminate), not `false`.
            expect(api.getRowNode('108')!.isSelected()).toBe(undefined);
        });
    });
});
