import type { GridApi, GridOptions, IServerSideGetRowsParams } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, waitForEvent } from '../../test-utils';
import { waitForNoLoadingRows } from '../../test-utils/ssrm-test-utils';

/**
 * Characterisation tests (golden-master) pinning the CURRENT sort/filter refresh-scope
 * behaviour of the SSRM grid options `serverSideSortAllLevels`,
 * `serverSideOnlyRefreshFilteredGroups` and `purgeClosedRowNodes`.
 *
 * These tests document mechanics as they exist today — including any quirks. A failing
 * assertion here means behaviour changed, not necessarily that it is wrong; update the
 * baseline deliberately.
 */

// A two-group-level dataset: country -> sport -> athlete leaves.
// Distinct scores give an unambiguous asc ordering; gold is the aggregated value column.
const LEAF_ROWS = [
    { country: 'UK', sport: 'Cycling', athlete: 'Alice', gold: 3, score: 30 },
    { country: 'UK', sport: 'Cycling', athlete: 'Bob', gold: 7, score: 10 },
    { country: 'UK', sport: 'Rowing', athlete: 'Carol', gold: 2, score: 20 },
    { country: 'US', sport: 'Swimming', athlete: 'Dan', gold: 5, score: 50 },
    { country: 'US', sport: 'Swimming', athlete: 'Eve', gold: 1, score: 40 },
];

type Request = {
    groupKeys: string[];
    sort: unknown;
    filter: unknown;
};

// Records every getRows request so tests can assert WHICH group routes get re-requested
// and what sort/filter each carries.
function createGroupedGridOptions(requests: Request[], overrides: Partial<GridOptions> = {}): GridOptions {
    return {
        columnDefs: [
            { field: 'country', rowGroup: true, hide: true },
            { field: 'sport', rowGroup: true, hide: true },
            { field: 'athlete' },
            // Plain leaf column (no aggFunc, not a group column): sorting/filtering it does not
            // set valueColChanged, so the refresh-scope flags become observable.
            { field: 'score', filter: 'agNumberColumnFilter' },
            { field: 'gold', aggFunc: 'sum' },
        ],
        autoGroupColumnDef: { field: 'athlete' },
        rowModelType: 'serverSide',
        cacheBlockSize: 500000,
        getRowId: (p) => {
            const { country, sport, athlete } = p.data;
            if (athlete) {
                return `leaf-${country}-${sport}-${athlete}`;
            }
            if (sport) {
                return `g-${country}-${sport}`;
            }
            return `g-${country}`;
        },
        serverSideDatasource: {
            getRows: (params: IServerSideGetRowsParams) => {
                const groupKeys = params.request.groupKeys ?? [];
                requests.push({
                    groupKeys: [...groupKeys],
                    sort: params.request.sortModel,
                    filter: params.request.filterModel,
                });

                if (groupKeys.length === 0) {
                    const countries = Array.from(new Set(LEAF_ROWS.map((r) => r.country)));
                    const rows = countries.map((country) => ({ country }));
                    params.success({ rowData: rows, rowCount: rows.length });
                    return;
                }
                if (groupKeys.length === 1) {
                    const country = groupKeys[0];
                    const sports = Array.from(
                        new Set(LEAF_ROWS.filter((r) => r.country === country).map((r) => r.sport))
                    );
                    const rows = sports.map((sport) => ({ country, sport }));
                    params.success({ rowData: rows, rowCount: rows.length });
                    return;
                }
                const [country, sport] = groupKeys;
                const rows = LEAF_ROWS.filter((r) => r.country === country && r.sport === sport);
                params.success({ rowData: [...rows], rowCount: rows.length });
            },
        },
        ...overrides,
    };
}

// Expand a displayed group by its key, waiting for the child load to settle.
async function expandGroupByKey(api: GridApi, key: string): Promise<void> {
    for (let i = 0, len = api.getDisplayedRowCount(); i < len; ++i) {
        const node = api.getDisplayedRowAtIndex(i);
        if (node?.key === key && !node.expanded) {
            api.setRowNodeExpanded(node, true);
            await waitForNoLoadingRows(api);
            return;
        }
    }
}

async function collapseGroupByKey(api: GridApi, key: string): Promise<void> {
    for (let i = 0, len = api.getDisplayedRowCount(); i < len; ++i) {
        const node = api.getDisplayedRowAtIndex(i);
        if (node?.key === key && node.expanded) {
            api.setRowNodeExpanded(node, false);
            return;
        }
    }
}

// Normalise the recorded request stream to the group-route strings, for readable assertions.
function routes(requests: Request[]): string[] {
    return requests.map((r) => (r.groupKeys.length === 0 ? '<root>' : r.groupKeys.join('/')));
}

describe('SSRM sort/filter refresh-scope characterisation', () => {
    const gridsManager = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    // --- Scenario 1: serverSideSortAllLevels -------------------------------------------------

    test('serverSideSortAllLevels default (false): sorting a leaf column re-requests only the affected leaf store', async () => {
        const requests: Request[] = [];
        const api = gridsManager.createGrid(null, createGroupedGridOptions(requests));
        await waitForEvent('firstDataRendered', api);

        // Expand two group levels: UK -> Cycling.
        await expandGroupByKey(api, 'UK');
        await expandGroupByKey(api, 'Cycling');

        // Clear the setup/expansion requests so we only observe the sort refresh.
        requests.length = 0;

        api.applyColumnState({ state: [{ colId: 'score', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        // Flag OFF: a leaf-column sort only refreshes the leaf store — the group stores are untouched.
        expect(routes(requests)).toEqual(['UK/Cycling']);

        await new GridRows(api, 'sortAllLevels-false after sort').check(`
            ROOT id:<no-id>
            ├─┬ GROUP id:g-UK ag-Grid-AutoColumn:"UK" country:"UK"
            │ ├─┬ GROUP-leafGroup id:g-UK-Cycling ag-Grid-AutoColumn:"Cycling" country:"UK" sport:"Cycling"
            │ │ ├── LEAF id:leaf-UK-Cycling-Alice ag-Grid-AutoColumn:"Alice" country:"UK" sport:"Cycling" athlete:"Alice" score:30 gold:3
            │ │ └── LEAF id:leaf-UK-Cycling-Bob ag-Grid-AutoColumn:"Bob" country:"UK" sport:"Cycling" athlete:"Bob" score:10 gold:7
            │ └── GROUP-leafGroup collapsed id:g-UK-Rowing ag-Grid-AutoColumn:"Rowing" country:"UK" sport:"Rowing"
            └── GROUP collapsed id:g-US ag-Grid-AutoColumn:"US" country:"US"
        `);
    });

    test('serverSideSortAllLevels true: applying a sort re-requests all expanded levels', async () => {
        const requests: Request[] = [];
        const api = gridsManager.createGrid(
            null,
            createGroupedGridOptions(requests, { serverSideSortAllLevels: true })
        );
        await waitForEvent('firstDataRendered', api);

        await expandGroupByKey(api, 'UK');
        await expandGroupByKey(api, 'Cycling');

        requests.length = 0;

        api.applyColumnState({ state: [{ colId: 'score', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        // Flag ON: every expanded store is refreshed, even for a leaf-only sort column.
        expect(routes(requests).sort()).toEqual(['<root>', 'UK', 'UK/Cycling'].sort());
    });

    // --- Scenario 2: serverSideOnlyRefreshFilteredGroups -------------------------------------

    test('serverSideOnlyRefreshFilteredGroups default (false): applying a filter re-requests all expanded levels', async () => {
        const requests: Request[] = [];
        const api = gridsManager.createGrid(null, createGroupedGridOptions(requests));
        await waitForEvent('firstDataRendered', api);

        await expandGroupByKey(api, 'UK');
        await expandGroupByKey(api, 'Cycling');

        requests.length = 0;

        api.setFilterModel({ score: { filterType: 'number', type: 'greaterThan', filter: 25 } });
        await waitForNoLoadingRows(api);

        // Flag OFF: a filter refreshes every expanded store regardless of which groups match.
        expect(routes(requests).sort()).toEqual(['<root>', 'UK', 'UK/Cycling'].sort());
    });

    test('serverSideOnlyRefreshFilteredGroups true: applying a filter narrows the re-requested routes', async () => {
        const requests: Request[] = [];
        const api = gridsManager.createGrid(
            null,
            createGroupedGridOptions(requests, { serverSideOnlyRefreshFilteredGroups: true })
        );
        await waitForEvent('firstDataRendered', api);

        await expandGroupByKey(api, 'UK');
        await expandGroupByKey(api, 'Cycling');

        requests.length = 0;

        api.setFilterModel({ score: { filterType: 'number', type: 'greaterThan', filter: 25 } });
        await waitForNoLoadingRows(api);

        // Flag ON: a leaf-column filter narrows the refresh to just the affected leaf store.
        expect(routes(requests)).toEqual(['UK/Cycling']);
    });

    // --- Scenario 3: purgeClosedRowNodes -----------------------------------------------------

    test('purgeClosedRowNodes default (false): collapsed group children are retained (not re-requested on re-expand)', async () => {
        const requests: Request[] = [];
        const api = gridsManager.createGrid(null, createGroupedGridOptions(requests));
        await waitForEvent('firstDataRendered', api);

        // Expand UK -> Cycling (loads Cycling children).
        await expandGroupByKey(api, 'UK');
        await expandGroupByKey(api, 'Cycling');

        requests.length = 0;

        // Collapse then re-expand Cycling.
        await collapseGroupByKey(api, 'Cycling');
        await expandGroupByKey(api, 'Cycling');

        // With the flag OFF, the Cycling block is NOT re-fetched — children were retained.
        expect(routes(requests)).toEqual([]);
    });

    test('purgeClosedRowNodes true: collapsed group children are discarded (re-requested on re-expand)', async () => {
        const requests: Request[] = [];
        const api = gridsManager.createGrid(null, createGroupedGridOptions(requests, { purgeClosedRowNodes: true }));
        await waitForEvent('firstDataRendered', api);

        await expandGroupByKey(api, 'UK');
        await expandGroupByKey(api, 'Cycling');

        requests.length = 0;

        await collapseGroupByKey(api, 'Cycling');
        await expandGroupByKey(api, 'Cycling');

        // With the flag ON, the Cycling block is re-fetched on re-expand.
        expect(routes(requests)).toEqual(['UK/Cycling']);
    });
});
