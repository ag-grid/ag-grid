import type { IServerSideGetRowsParams } from 'ag-grid-community';
import { ScrollApiModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, waitForEvent } from '../../test-utils';
import { asyncSetTimeout } from '../../test-utils/node-utils';
import { countLoadingRows, waitForNoLoadingRows } from '../../test-utils/ssrm-test-utils';

/**
 * CHARACTERIZATION (golden-master) tests pinning the CURRENT behaviour of how
 * `serverSideInitialRowCount` shapes the INITIAL LOAD DISPLAY of a GROUPED SSRM
 * grid (one rowGroup column, groups collapsed).
 *
 * The flat-data angle on `serverSideInitialRowCount` is already covered by
 * `row-data/ssrm-cache-config.test.ts`; this file characterizes the GROUPED
 * root-level display case and whether the initial guess propagates to child
 * levels when a group is expanded.
 *
 * These assertions record what the grid actually DOES today (bugs included).
 * Do NOT "fix" a value to what you think it should be — a changed value is a
 * behavioural change to review. RowNode objects are never asserted directly
 * (that crashes the reporter); only booleans and scalar counts.
 */

// A compact record of one getRows call: the group route and the requested block range.
interface RequestRecord {
    groupKeys: string[];
    rowGroupColIds: string[];
    range: [number, number];
}

describe('SSRM grouped initial row count (characterization)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ScrollApiModule, ServerSideRowModelModule],
    });

    afterEach(() => gridsManager.reset());

    // Grouped dataset: country -> athletes. Top level is one row per country.
    const LEAF_ROWS = [
        { id: 'uk-alice', country: 'UK', athlete: 'Alice' },
        { id: 'uk-bob', country: 'UK', athlete: 'Bob' },
        { id: 'us-frank', country: 'US', athlete: 'Frank' },
        { id: 'us-grace', country: 'US', athlete: 'Grace' },
        { id: 'fr-heidi', country: 'FR', athlete: 'Heidi' },
    ];

    test('before the root block resolves: serverSideInitialRowCount top-level loading rows and first request shape', async () => {
        const requests: RequestRecord[] = [];
        // Deferred datasource: stash params so the root block stays in-flight and we
        // can observe the pre-load display state.
        const pending: IServerSideGetRowsParams[] = [];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { field: 'athlete' },
            rowModelType: 'serverSide',
            serverSideInitialRowCount: 5,
            getRowId: (p) => p.data.id ?? `group-${p.data.country}`,
            serverSideDatasource: {
                getRows: (params: IServerSideGetRowsParams) => {
                    requests.push({
                        groupKeys: (params.request.groupKeys ?? []) as string[],
                        rowGroupColIds: (params.request.rowGroupCols ?? []).map((c) => c.id),
                        range: [params.request.startRow!, params.request.endRow!],
                    });
                    pending.push(params);
                },
            },
        });
        // Let the initial block dispatch without resolving it.
        await asyncSetTimeout(30);

        // Before the root resolves the grid sizes the top level to the configured
        // initial row count: 5 loading/stub group rows displayed.
        expect(api.getDisplayedRowCount()).toBe(5);
        expect(countLoadingRows(api)).toBe(5);

        // First (and only) request so far is the root route: empty groupKeys, with
        // the rowGroupCols carrying the grouped 'country' column.
        expect(requests).toEqual([{ groupKeys: [], rowGroupColIds: ['country'], range: [0, 100] }]);

        await new GridRows(api, 'grouped initial row count before root resolves').check(`
            ROOT id:<no-id>
            ├── LEAF_GROUP collapsed id:rowIndex:0
            ├── LEAF_GROUP collapsed id:rowIndex:1
            ├── LEAF_GROUP collapsed id:rowIndex:2
            ├── LEAF_GROUP collapsed id:rowIndex:3
            └── LEAF_GROUP collapsed id:rowIndex:4
        `);

        // Drain the in-flight root request so the deferred datasource does not leak.
        const modelUpdated = waitForEvent('modelUpdated', api);
        const countries = Array.from(new Set(LEAF_ROWS.map((r) => r.country)));
        const rows = countries.map((country) => ({ id: `group-${country}`, country }));
        for (let i = 0, len = pending.length; i < len; ++i) {
            pending[i].success({ rowData: [...rows], rowCount: rows.length });
        }
        await modelUpdated;
    });

    test('after the root resolves: displayed count reflects real group count, groups collapsed', async () => {
        const requests: RequestRecord[] = [];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { field: 'athlete' },
            rowModelType: 'serverSide',
            serverSideInitialRowCount: 5, // guess is higher than the real 3 groups
            getRowId: (p) => p.data.id ?? `group-${p.data.country}`,
            serverSideDatasource: {
                getRows: (params: IServerSideGetRowsParams) => {
                    const groupKeys = (params.request.groupKeys ?? []) as string[];
                    requests.push({
                        groupKeys,
                        rowGroupColIds: (params.request.rowGroupCols ?? []).map((c) => c.id),
                        range: [params.request.startRow!, params.request.endRow!],
                    });
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
        await waitForNoLoadingRows(api);

        // Real group count (3) replaces the initial guess (5).
        expect(api.getDisplayedRowCount()).toBe(3);
        expect(countLoadingRows(api)).toBe(0);

        await new GridRows(api, 'grouped initial row count after root resolves').check(`
            ROOT id:<no-id>
            ├── GROUP-leafGroup collapsed id:group-UK ag-Grid-AutoColumn:"UK" country:"UK"
            ├── GROUP-leafGroup collapsed id:group-US ag-Grid-AutoColumn:"US" country:"US"
            └── GROUP-leafGroup collapsed id:group-FR ag-Grid-AutoColumn:"FR" country:"FR"
        `);
    });

    test('reconciliation: real group count larger than the initial guess', async () => {
        const requests: RequestRecord[] = [];
        const COUNTRIES = ['UK', 'US', 'FR', 'DE', 'IT', 'ES', 'PT'];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { field: 'athlete' },
            rowModelType: 'serverSide',
            serverSideInitialRowCount: 2, // guess is lower than the real 7 groups
            getRowId: (p) => p.data.id ?? `group-${p.data.country}`,
            serverSideDatasource: {
                getRows: (params: IServerSideGetRowsParams) => {
                    const groupKeys = (params.request.groupKeys ?? []) as string[];
                    requests.push({
                        groupKeys,
                        rowGroupColIds: (params.request.rowGroupCols ?? []).map((c) => c.id),
                        range: [params.request.startRow!, params.request.endRow!],
                    });
                    const rows = COUNTRIES.map((country) => ({ id: `group-${country}`, country }));
                    params.success({ rowData: [...rows], rowCount: rows.length });
                },
            },
        });
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // The model grows from the initial guess (2) to the real group count (7).
        expect(api.getDisplayedRowCount()).toBe(7);
        expect(countLoadingRows(api)).toBe(0);
    });

    test('serverSideInitialRowCount propagation to child level when a group is expanded', async () => {
        const requests: RequestRecord[] = [];
        // Deferred child datasource: resolve the root immediately, but hold the child
        // block in-flight so we can observe whether the initial guess pads the child level.
        const pendingChild: IServerSideGetRowsParams[] = [];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { field: 'athlete' },
            rowModelType: 'serverSide',
            serverSideInitialRowCount: 4,
            getRowId: (p) => p.data.id ?? `group-${p.data.country}`,
            serverSideDatasource: {
                getRows: (params: IServerSideGetRowsParams) => {
                    const groupKeys = (params.request.groupKeys ?? []) as string[];
                    requests.push({
                        groupKeys,
                        rowGroupColIds: (params.request.rowGroupCols ?? []).map((c) => c.id),
                        range: [params.request.startRow!, params.request.endRow!],
                    });
                    if (groupKeys.length === 0) {
                        const countries = Array.from(new Set(LEAF_ROWS.map((r) => r.country)));
                        const rows = countries.map((country) => ({ id: `group-${country}`, country }));
                        params.success({ rowData: [...rows], rowCount: rows.length });
                        return;
                    }
                    // Hold the child block open to observe the pre-load child display.
                    pendingChild.push(params);
                },
            },
        });
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // Root resolved to 3 real groups.
        expect(api.getDisplayedRowCount()).toBe(3);

        // Expand UK (2 children); the child block dispatches but stays in-flight.
        api.getRowNode('group-UK')?.setExpanded(true);
        await asyncSetTimeout(30);

        // CHARACTERIZATION: pin how many loading child rows appear under the expanded
        // group before the child block resolves — i.e. whether serverSideInitialRowCount
        // pads the child level too, or only the root.
        expect(countLoadingRows(api)).toBe(1);
        expect(api.getDisplayedRowCount()).toBe(4);

        await new GridRows(api, 'grouped initial row count child level before resolve').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:group-UK ag-Grid-AutoColumn:"UK" country:"UK"
            │ └── filler id:rowIndex:1
            ├── GROUP-leafGroup collapsed id:group-US ag-Grid-AutoColumn:"US" country:"US"
            └── GROUP-leafGroup collapsed id:group-FR ag-Grid-AutoColumn:"FR" country:"FR"
        `);

        // Drain the child block.
        const modelUpdated = waitForEvent('modelUpdated', api);
        for (let i = 0, len = pendingChild.length; i < len; ++i) {
            const groupKeys = (pendingChild[i].request.groupKeys ?? []) as string[];
            const rows = LEAF_ROWS.filter((r) => r.country === groupKeys[0]);
            pendingChild[i].success({ rowData: [...rows], rowCount: rows.length });
        }
        await modelUpdated;

        // Child level resolved to UK's 2 real children.
        expect(countLoadingRows(api)).toBe(0);
        expect(api.getDisplayedRowCount()).toBe(5);
    });
});
