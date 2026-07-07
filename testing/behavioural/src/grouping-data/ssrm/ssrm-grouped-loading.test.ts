import type { IServerSideGetRowsParams } from 'ag-grid-community';
import { ScrollApiModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, waitForEvent } from '../../test-utils';
import { ssrmExpandAndLoadAll, waitForNoLoadingRows } from '../../test-utils/ssrm-test-utils';

/**
 * CHARACTERIZATION (golden-master) tests pinning the CURRENT behaviour of AG Grid
 * SSRM grouped block loading, cache eviction, and per-level store params.
 *
 * These are not aspirational specs: each assertion records what the grid actually
 * does today (request routes, block ranges, eviction/re-request patterns). Where the
 * current mechanics are surprising or arguably buggy, that behaviour is frozen here as
 * the expected baseline so future regressions are caught. Do NOT "fix" a value to what
 * you think it should be — if a value changes, that is a behavioural change to review.
 */

// A compact record of one getRows call: which group route it targets and the block range requested.
interface RequestRecord {
    groupKeys: string[];
    range: [number, number];
}

describe('SSRM grouped block loading (characterization)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ScrollApiModule, ServerSideRowModelModule],
    });

    afterEach(() => gridsManager.reset());

    // Two-level dataset: country -> athletes. Countries are the top-level group block;
    // expanding a country requests that country's leaf children.
    const LEAF_ROWS = [
        { id: 'uk-alice', country: 'UK', athlete: 'Alice' },
        { id: 'uk-bob', country: 'UK', athlete: 'Bob' },
        { id: 'uk-carol', country: 'UK', athlete: 'Carol' },
        { id: 'uk-dan', country: 'UK', athlete: 'Dan' },
        { id: 'uk-eve', country: 'UK', athlete: 'Eve' },
        { id: 'us-frank', country: 'US', athlete: 'Frank' },
        { id: 'us-grace', country: 'US', athlete: 'Grace' },
        { id: 'fr-heidi', country: 'FR', athlete: 'Heidi' },
    ];

    test('scenario 1: initial load requests root group block; expanding a group requests that group route', async () => {
        // Record the request stream inline so we can assert WHICH group each block belongs to.
        const requests: RequestRecord[] = [];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { field: 'athlete' },
            rowModelType: 'serverSide',
            getRowId: (p) => p.data.id ?? `group-${p.data.country}`,
            serverSideDatasource: {
                getRows: (params: IServerSideGetRowsParams) => {
                    const groupKeys = (params.request.groupKeys ?? []) as string[];
                    requests.push({ groupKeys, range: [params.request.startRow!, params.request.endRow!] });
                    if (groupKeys.length === 0) {
                        // Top-level group rows: one row per country.
                        const countries = Array.from(new Set(LEAF_ROWS.map((r) => r.country)));
                        const rows = countries.map((country) => ({ id: `group-${country}`, country }));
                        params.success({ rowData: [...rows], rowCount: rows.length });
                        return;
                    }
                    // Child leaf rows for a specific country route.
                    const rows = LEAF_ROWS.filter((r) => r.country === groupKeys[0]);
                    params.success({ rowData: [...rows], rowCount: rows.length });
                },
            },
        });
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // Initial load requested exactly one block: the root/top-level group route (groupKeys []).
        expect(requests).toEqual([{ groupKeys: [], range: [0, 100] }]);

        // Expand the UK group — this must trigger a getRows for the ['UK'] route only.
        api.getRowNode('group-UK')?.setExpanded(true);
        await waitForNoLoadingRows(api);

        expect(requests).toEqual([
            { groupKeys: [], range: [0, 100] },
            { groupKeys: ['UK'], range: [0, 100] },
        ]);

        await new GridRows(api, 'scenario 1 after expand UK').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:group-UK ag-Grid-AutoColumn:"UK" country:"UK"
            │ ├── LEAF id:uk-alice ag-Grid-AutoColumn:"Alice" country:"UK" athlete:"Alice"
            │ ├── LEAF id:uk-bob ag-Grid-AutoColumn:"Bob" country:"UK" athlete:"Bob"
            │ ├── LEAF id:uk-carol ag-Grid-AutoColumn:"Carol" country:"UK" athlete:"Carol"
            │ ├── LEAF id:uk-dan ag-Grid-AutoColumn:"Dan" country:"UK" athlete:"Dan"
            │ └── LEAF id:uk-eve ag-Grid-AutoColumn:"Eve" country:"UK" athlete:"Eve"
            ├── GROUP-leafGroup collapsed id:group-US ag-Grid-AutoColumn:"US" country:"US"
            └── GROUP-leafGroup collapsed id:group-FR ag-Grid-AutoColumn:"FR" country:"FR"
        `);
    });

    test('scenario 2: cacheBlockSize splits a child level into ranged blocks', async () => {
        const requests: RequestRecord[] = [];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { field: 'athlete' },
            rowModelType: 'serverSide',
            cacheBlockSize: 2, // child level (UK has 5 children) is requested in blocks of 2
            getRowId: (p) => p.data.id ?? `group-${p.data.country}`,
            serverSideDatasource: {
                getRows: (params: IServerSideGetRowsParams) => {
                    const groupKeys = (params.request.groupKeys ?? []) as string[];
                    const start = params.request.startRow!;
                    const end = params.request.endRow!;
                    requests.push({ groupKeys, range: [start, end] });
                    if (groupKeys.length === 0) {
                        const countries = Array.from(new Set(LEAF_ROWS.map((r) => r.country)));
                        const rows = countries.map((country) => ({ id: `group-${country}`, country }));
                        params.success({ rowData: [...rows], rowCount: rows.length });
                        return;
                    }
                    const all = LEAF_ROWS.filter((r) => r.country === groupKeys[0]);
                    const page = all.slice(start, end);
                    params.success({ rowData: [...page], rowCount: all.length });
                },
            },
        });
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // Root group block honours cacheBlockSize too — endRow is 2, not 100.
        expect(requests).toEqual([{ groupKeys: [], range: [0, 2] }]);

        api.getRowNode('group-UK')?.setExpanded(true);
        await waitForNoLoadingRows(api);

        // UK's 5 children are requested in blocks of 2 within the ['UK'] route: [0,2] [2,4] [4,6].
        expect(requests).toEqual([
            { groupKeys: [], range: [0, 2] },
            { groupKeys: ['UK'], range: [0, 2] },
            { groupKeys: ['UK'], range: [2, 4] },
            { groupKeys: ['UK'], range: [4, 6] },
        ]);

        await new GridRows(api, 'scenario 2 blocked child load').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:group-UK ag-Grid-AutoColumn:"UK" country:"UK"
            │ ├── LEAF id:uk-alice ag-Grid-AutoColumn:"Alice" country:"UK" athlete:"Alice"
            │ ├── LEAF id:uk-bob ag-Grid-AutoColumn:"Bob" country:"UK" athlete:"Bob"
            │ ├── LEAF id:uk-carol ag-Grid-AutoColumn:"Carol" country:"UK" athlete:"Carol"
            │ ├── LEAF id:uk-dan ag-Grid-AutoColumn:"Dan" country:"UK" athlete:"Dan"
            │ └── LEAF id:uk-eve ag-Grid-AutoColumn:"Eve" country:"UK" athlete:"Eve"
            ├── GROUP-leafGroup collapsed id:group-US ag-Grid-AutoColumn:"US" country:"US"
            └── GROUP-leafGroup collapsed id:group-FR ag-Grid-AutoColumn:"FR" country:"FR"
        `);
    });

    test('scenario 3: maxBlocksInCache=1 thrashes the root group store, re-requesting the same blocks', async () => {
        const requests: RequestRecord[] = [];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { field: 'athlete' },
            rowModelType: 'serverSide',
            cacheBlockSize: 2,
            maxBlocksInCache: 1, // only one block per store may be resident
            getRowId: (p) => p.data.id ?? `group-${p.data.country}`,
            serverSideDatasource: {
                getRows: (params: IServerSideGetRowsParams) => {
                    const groupKeys = (params.request.groupKeys ?? []) as string[];
                    const start = params.request.startRow!;
                    const end = params.request.endRow!;
                    requests.push({ groupKeys, range: [start, end] });
                    if (groupKeys.length === 0) {
                        const countries = Array.from(new Set(LEAF_ROWS.map((r) => r.country)));
                        const rows = countries.map((country) => ({ id: `group-${country}`, country }));
                        params.success({ rowData: [...rows], rowCount: rows.length });
                        return;
                    }
                    const all = LEAF_ROWS.filter((r) => r.country === groupKeys[0]);
                    const page = all.slice(start, end);
                    params.success({ rowData: [...page], rowCount: all.length });
                },
            },
        });
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        api.getRowNode('group-UK')?.setExpanded(true);
        await waitForNoLoadingRows(api);

        // CHARACTERIZATION: maxBlocksInCache=1 caps each store at ONE resident block. The root
        // group store holds 3 countries across two blocks ([0,2] and [2,4]); with a viewport tall
        // enough to display them all it can never satisfy every visible group from a single block,
        // so it THRASHES — loading a block, evicting it to load the sibling, then re-requesting the
        // evicted one. The root route [0,2] is fetched three separate times below (indices 0, 2, 7)
        // and [2,4] twice. This eviction/re-request churn is the current behaviour, frozen here as a
        // latent inefficiency: maxBlocksInCache smaller than the displayed block span causes repeated
        // server round-trips for the SAME ranges.
        expect(requests).toEqual([
            { groupKeys: [], range: [0, 2] },
            { groupKeys: [], range: [2, 4] },
            { groupKeys: [], range: [0, 2] }, // root block [0,2] re-requested after eviction
            { groupKeys: ['UK'], range: [0, 2] },
            { groupKeys: ['UK'], range: [2, 4] },
            { groupKeys: ['UK'], range: [4, 6] },
            { groupKeys: [], range: [2, 4] }, // root block [2,4] re-requested after eviction
            { groupKeys: [], range: [0, 2] }, // root block [0,2] re-requested again
        ]);
    });

    test('scenario 4: getServerSideGroupLevelParams overrides cacheBlockSize per level', async () => {
        const requests: RequestRecord[] = [];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { field: 'athlete' },
            rowModelType: 'serverSide',
            cacheBlockSize: 100, // default block size
            // Per-level override: the child level (level 1) uses a block size of 3.
            getServerSideGroupLevelParams: (params) => {
                if (params.level === 1) {
                    return { cacheBlockSize: 3 };
                }
                return {};
            },
            getRowId: (p) => p.data.id ?? `group-${p.data.country}`,
            serverSideDatasource: {
                getRows: (params: IServerSideGetRowsParams) => {
                    const groupKeys = (params.request.groupKeys ?? []) as string[];
                    const start = params.request.startRow!;
                    const end = params.request.endRow!;
                    requests.push({ groupKeys, range: [start, end] });
                    if (groupKeys.length === 0) {
                        const countries = Array.from(new Set(LEAF_ROWS.map((r) => r.country)));
                        const rows = countries.map((country) => ({ id: `group-${country}`, country }));
                        params.success({ rowData: [...rows], rowCount: rows.length });
                        return;
                    }
                    const all = LEAF_ROWS.filter((r) => r.country === groupKeys[0]);
                    const page = all.slice(start, end);
                    params.success({ rowData: [...page], rowCount: all.length });
                },
            },
        });
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // Root level (level 0) uses the default block size of 100.
        expect(requests).toEqual([{ groupKeys: [], range: [0, 100] }]);

        api.getRowNode('group-UK')?.setExpanded(true);
        await waitForNoLoadingRows(api);

        // Child level (level 1) uses the overridden block size of 3: UK's 5 children -> [0,3] [3,6].
        expect(requests).toEqual([
            { groupKeys: [], range: [0, 100] },
            { groupKeys: ['UK'], range: [0, 3] },
            { groupKeys: ['UK'], range: [3, 6] },
        ]);
    });

    test('scenario 5: ssrmExpandAndLoadAll walks every group route once', async () => {
        const requests: RequestRecord[] = [];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { field: 'athlete' },
            rowModelType: 'serverSide',
            getRowId: (p) => p.data.id ?? `group-${p.data.country}`,
            serverSideDatasource: {
                getRows: (params: IServerSideGetRowsParams) => {
                    const groupKeys = (params.request.groupKeys ?? []) as string[];
                    requests.push({ groupKeys, range: [params.request.startRow!, params.request.endRow!] });
                    if (groupKeys.length === 0) {
                        const countries = Array.from(new Set(LEAF_ROWS.map((r) => r.country)));
                        const rows = countries.map((country) => ({ id: `group-${country}`, country }));
                        params.success({ rowData: [...rows], rowCount: rows.length });
                        return;
                    }
                    const rows = LEAF_ROWS.filter((r) => r.country === groupKeys[0]);
                    params.success({ rowData: [...rows], rowCount: rows.length });
                },
            },
        });
        await waitForEvent('firstDataRendered', api);
        await ssrmExpandAndLoadAll(api);
        await waitForNoLoadingRows(api);

        // Root plus one request per country route — every group is loaded exactly once.
        expect(requests.map((r) => (r.groupKeys.length === 0 ? 'ROOT' : r.groupKeys.join('/')))).toEqual([
            'ROOT',
            'UK',
            'US',
            'FR',
        ]);
    });
});
