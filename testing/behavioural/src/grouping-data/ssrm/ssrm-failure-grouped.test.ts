import type { GetRowIdParams, IServerSideGetRowsParams } from 'ag-grid-community';
import {
    RowGroupingModule,
    ServerSideRowModelApiModule,
    ServerSideRowModelModule,
    TreeDataModule,
} from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, waitForEvent } from '../../test-utils';
import { asyncSetTimeout } from '../../test-utils/node-utils';
import { countLoadingRows, waitForNoLoadingRows } from '../../test-utils/ssrm-test-utils';

/**
 * CHARACTERIZATION tests (golden-master) pinning the CURRENT behaviour of the AG Grid
 * SSRM datasource when a `getRows` call FAILS on a GROUP route or a TREE route — as
 * distinct from a failure on the ROOT route.
 *
 * These are not aspirational tests: where the grid's current behaviour is arguably a bug
 * (e.g. a failed child store shows perpetual loading rows rather than a failed indicator),
 * the test pins that behaviour as the expected mechanics. When one of these assertions
 * later changes, it is a deliberate behavioural change that should be reviewed, not a
 * silent regression.
 */

// A single recorded datasource request. Captured inline (house style) so each test reads
// top-to-bottom and the request stream is visible without a shared helper.
interface RecordedRequest {
    groupKeys: (string | null)[];
    range: [number | undefined, number | undefined];
}

describe('SSRM datasource failure on GROUP routes (characterization)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule, RowGroupingModule],
    });

    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    // UK/US leaf rows — expanding a country loads its athletes.
    const LEAF_ROWS = [
        { country: 'UK', athlete: 'Alice', gold: 3 },
        { country: 'UK', athlete: 'Bob', gold: 7 },
        { country: 'US', athlete: 'Carol', gold: 5 },
        { country: 'US', athlete: 'Dan', gold: 3 },
    ];

    const getRowId = (p: GetRowIdParams) =>
        p.data.athlete ? `${p.data.country}-${p.data.athlete}` : `group-${p.data.country}`;

    test('failure on a child group route leaves that group loading while siblings and root are untouched, then retry recovers', async () => {
        const requests: RecordedRequest[] = [];
        // Per-route attempt counter — the target group's first load fails, later ones succeed.
        const attempts: Record<string, number> = {};

        const api = gridsManager.createGrid(null, {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { field: 'athlete' },
            rowModelType: 'serverSide',
            getRowId,
            serverSideDatasource: {
                getRows: (params: IServerSideGetRowsParams) => {
                    const groupKeys = (params.request.groupKeys ?? []) as (string | null)[];
                    const routeKey = groupKeys.join('/') || '<root>';
                    requests.push({ groupKeys, range: [params.request.startRow, params.request.endRow] });
                    attempts[routeKey] = (attempts[routeKey] ?? 0) + 1;

                    if (groupKeys.length === 0) {
                        const countries = Array.from(new Set(LEAF_ROWS.map((r) => r.country)));
                        const rows = countries.map((country) => ({ country }));
                        params.success({ rowData: rows, rowCount: rows.length });
                        return;
                    }

                    // Fail the UK child route on its first attempt only.
                    if (routeKey === 'UK' && attempts[routeKey] === 1) {
                        params.fail();
                        return;
                    }

                    const rows = LEAF_ROWS.filter((r) => r.country === groupKeys[0]);
                    params.success({ rowData: rows, rowCount: rows.length });
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // Expand only UK — its child load fails. US is left as an untouched sibling.
        const ukNode = api.getRowNode('group-UK')!;
        api.setRowNodeExpanded(ukNode, true);

        // Let the (synchronous) datasource resolve.
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);

        // Pin: the failed UK route still shows a loading row (no failed indicator), while
        // the untouched US sibling stays a collapsed group and the root is intact.
        await new GridRows(api, 'grouped child-route failure: UK loading, US untouched').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:group-UK ag-Grid-AutoColumn:"UK" country:"UK"
            │ └── filler id:rowIndex:1
            └── GROUP-leafGroup collapsed id:group-US ag-Grid-AutoColumn:"US" country:"US"
        `);

        expect(countLoadingRows(api)).toBeGreaterThan(0);
        expect(!!api.getRowNode('group-UK')).toBe(true);
        expect(!!api.getRowNode('group-US')).toBe(true);
        expect(!!api.getRowNode('UK-Alice')).toBe(false);
        expect(!!api.getRowNode('UK-Bob')).toBe(false);

        // Retry — re-requests the failed block. No awaitable storeRefreshed in jsdom, so
        // flush a few synchronous ticks.
        api.retryServerSideLoads();
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);

        // Pin: UK children now populate and no loading rows remain.
        expect(countLoadingRows(api)).toBe(0);
        expect(!!api.getRowNode('UK-Alice')).toBe(true);
        expect(!!api.getRowNode('UK-Bob')).toBe(true);

        await new GridRows(api, 'grouped child-route failure: recovered after retry').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:group-UK ag-Grid-AutoColumn:"UK" country:"UK"
            │ ├── LEAF id:UK-Alice ag-Grid-AutoColumn:"Alice" country:"UK" athlete:"Alice" gold:3
            │ └── LEAF id:UK-Bob ag-Grid-AutoColumn:"Bob" country:"UK" athlete:"Bob" gold:7
            └── GROUP-leafGroup collapsed id:group-US ag-Grid-AutoColumn:"US" country:"US"
        `);

        // Pin: the UK route was requested twice (initial failure + retry); US never
        // requested, since it was never expanded.
        const ukRequests = requests.filter((r) => r.groupKeys.join('/') === 'UK');
        const usRequests = requests.filter((r) => r.groupKeys.join('/') === 'US');
        expect(ukRequests.length).toBe(2);
        expect(usRequests.length).toBe(0);
    });

    test('failure on the ROOT group route leaves the whole grid loading, then retry recovers', async () => {
        const requests: RecordedRequest[] = [];
        const attempts: Record<string, number> = {};

        const api = gridsManager.createGrid(null, {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { field: 'athlete' },
            rowModelType: 'serverSide',
            getRowId,
            serverSideDatasource: {
                getRows: (params: IServerSideGetRowsParams) => {
                    const groupKeys = (params.request.groupKeys ?? []) as (string | null)[];
                    const routeKey = groupKeys.join('/') || '<root>';
                    requests.push({ groupKeys, range: [params.request.startRow, params.request.endRow] });
                    attempts[routeKey] = (attempts[routeKey] ?? 0) + 1;

                    // Fail the root (top-level) block on its first attempt only.
                    if (groupKeys.length === 0 && attempts[routeKey] === 1) {
                        params.fail();
                        return;
                    }

                    if (groupKeys.length === 0) {
                        const countries = Array.from(new Set(LEAF_ROWS.map((r) => r.country)));
                        const rows = countries.map((country) => ({ country }));
                        params.success({ rowData: rows, rowCount: rows.length });
                        return;
                    }

                    const rows = LEAF_ROWS.filter((r) => r.country === groupKeys[0]);
                    params.success({ rowData: rows, rowCount: rows.length });
                },
            },
        });

        // NB: on a root failure firstDataRendered never fires (no data ever renders), so we
        // simply flush the synchronous datasource rather than awaiting that event.
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);

        // Pin: root failure leaves the grid showing a single top-level loading row; no
        // group nodes exist at all (distinct from a child-route failure, where sibling
        // groups remain fully intact).
        await new GridRows(api, 'grouped root-route failure: whole grid loading').check(`
            ROOT id:<no-id>
            └── LEAF_GROUP collapsed id:rowIndex:0
        `);

        expect(countLoadingRows(api)).toBeGreaterThan(0);
        expect(!!api.getRowNode('group-UK')).toBe(false);
        expect(!!api.getRowNode('group-US')).toBe(false);

        // Retry — re-requests the failed root block.
        api.retryServerSideLoads();
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);

        // Pin: root groups now appear and no loading rows remain.
        expect(countLoadingRows(api)).toBe(0);
        expect(!!api.getRowNode('group-UK')).toBe(true);
        expect(!!api.getRowNode('group-US')).toBe(true);

        await new GridRows(api, 'grouped root-route failure: recovered after retry').check(`
            ROOT id:<no-id>
            ├── GROUP-leafGroup collapsed id:group-UK ag-Grid-AutoColumn:"UK" country:"UK"
            └── GROUP-leafGroup collapsed id:group-US ag-Grid-AutoColumn:"US" country:"US"
        `);

        // Pin: the root route was requested twice (initial failure + retry).
        const rootRequests = requests.filter((r) => r.groupKeys.length === 0);
        expect(rootRequests.length).toBe(2);
    });
});

describe('SSRM datasource failure on TREE routes (characterization)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule, TreeDataModule],
    });

    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    // Minimal tree: a root group (Alice) with two leaf children; a sibling leaf (Eve).
    interface TreeEmployee {
        name: string;
        employeeId: string;
        group: boolean;
        children?: TreeEmployee[];
    }
    const TREE: TreeEmployee[] = [
        {
            name: 'Alice',
            employeeId: '1',
            group: true,
            children: [
                { name: 'Charlie', employeeId: '3', group: false },
                { name: 'Dave', employeeId: '4', group: false },
            ],
        },
        { name: 'Eve', employeeId: '2', group: false },
    ];

    const extractTreeRows = (groupKeys: string[], data: TreeEmployee[]): TreeEmployee[] => {
        if (groupKeys.length === 0) {
            return data;
        }
        const parent = data.find((d) => d.name === groupKeys[0]);
        return parent ? extractTreeRows(groupKeys.slice(1), parent.children ?? []) : [];
    };

    test('failure on a tree group route leaves that node loading, then retry recovers and requests the route twice', async () => {
        const requests: RecordedRequest[] = [];
        const attempts: Record<string, number> = {};

        const api = gridsManager.createGrid(null, {
            columnDefs: [
                { field: 'employeeId', hide: true },
                { field: 'name', hide: true },
            ],
            autoGroupColumnDef: { field: 'name' },
            rowModelType: 'serverSide',
            treeData: true,
            getRowId: ({ data }: GetRowIdParams) => data.employeeId,
            isServerSideGroup: (d: any) => d.group,
            getServerSideGroupKey: (d: any) => d.name,
            serverSideDatasource: {
                getRows: (params: IServerSideGetRowsParams) => {
                    const groupKeys = (params.request.groupKeys ?? []) as string[];
                    const routeKey = groupKeys.join('/') || '<root>';
                    requests.push({ groupKeys, range: [params.request.startRow, params.request.endRow] });
                    attempts[routeKey] = (attempts[routeKey] ?? 0) + 1;

                    // Fail the Alice child route on its first attempt only.
                    if (routeKey === 'Alice' && attempts[routeKey] === 1) {
                        params.fail();
                        return;
                    }

                    const rows = extractTreeRows(groupKeys, TREE).map((d) => ({
                        group: !!d.children?.length,
                        employeeId: d.employeeId,
                        name: d.name,
                    }));
                    params.success({ rowData: rows, rowCount: rows.length });
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // Expand Alice — its child load fails.
        const aliceNode = api.getRowNode('1')!;
        api.setRowNodeExpanded(aliceNode, true);
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);

        // Pin: Alice stays loading (no children populated); sibling leaf Eve is untouched.
        await new GridRows(api, 'tree child-route failure: Alice loading, Eve intact').check(`
            ROOT id:<no-id>
            ├─┬ Alice GROUP id:1 ag-Grid-AutoColumn:"Alice" employeeId:"1" name:"Alice"
            │ └── filler id:rowIndex:1
            └── LEAF id:2 ag-Grid-AutoColumn:"Eve" employeeId:"2" name:"Eve"
        `);

        expect(countLoadingRows(api)).toBeGreaterThan(0);
        expect(!!api.getRowNode('1')).toBe(true);
        expect(!!api.getRowNode('2')).toBe(true);
        expect(!!api.getRowNode('3')).toBe(false);
        expect(!!api.getRowNode('4')).toBe(false);

        // Retry — re-requests the failed Alice block.
        api.retryServerSideLoads();
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);

        // Pin: Alice's children now populate and no loading rows remain.
        expect(countLoadingRows(api)).toBe(0);
        expect(!!api.getRowNode('3')).toBe(true);
        expect(!!api.getRowNode('4')).toBe(true);

        await new GridRows(api, 'tree child-route failure: recovered after retry').check(`
            ROOT id:<no-id>
            ├─┬ Alice GROUP id:1 ag-Grid-AutoColumn:"Alice" employeeId:"1" name:"Alice"
            │ ├── LEAF id:3 ag-Grid-AutoColumn:"Charlie" employeeId:"3" name:"Charlie"
            │ └── LEAF id:4 ag-Grid-AutoColumn:"Dave" employeeId:"4" name:"Dave"
            └── LEAF id:2 ag-Grid-AutoColumn:"Eve" employeeId:"2" name:"Eve"
        `);

        // Pin: the Alice route was requested twice (initial failure + retry).
        const aliceRequests = requests.filter((r) => r.groupKeys.join('/') === 'Alice');
        expect(aliceRequests.length).toBe(2);
    });
});
