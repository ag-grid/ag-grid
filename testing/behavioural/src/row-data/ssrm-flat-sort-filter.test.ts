import type {
    GridOptions,
    IServerSideGetRowsParams,
    IServerSideGetRowsRequest,
    SortModelItem,
} from 'ag-grid-community';
import { NumberFilterModule, TextFilterModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, waitForEvent } from '../test-utils';
import { waitForNoLoadingRows } from '../test-utils/ssrm-test-utils';

/**
 * Characterization tests (golden-master) pinning the CURRENT behaviour of SERVER-DELEGATED
 * sort and filter on a FLAT (no rowGroup, no pivot) Server-Side Row Model grid.
 *
 * The sibling file `grouping-data/ssrm/ssrm-sort-filter-scope.test.ts` covers the GROUPED
 * refresh-SCOPE flags (which group routes re-request). This file is the FLAT case: there are
 * no group stores, so the interesting behaviour is that a sort/filter change purges the single
 * root store and issues ONE fresh request carrying the new sortModel/filterModel, and that the
 * server-sorted/-filtered rows re-render.
 *
 * The datasource is defined INLINE and honours sortModel + filterModel server-side (sorts and
 * filters the row array, pages by startRow/endRow, reports lastRow). The full request stream is
 * recorded inline (a plain array push) per the behavioural-suite house style; each test reads
 * top-to-bottom. Whatever the grid does today is the baseline — a failing assertion means the
 * behaviour changed, not that it is wrong.
 */

interface FlatRow {
    id: number;
    name: string;
    category: string;
}

// Distinct names/ids give an unambiguous sort order; two categories make the filter observable.
const ROWS: FlatRow[] = [
    { id: 0, name: 'Delta', category: 'X' },
    { id: 1, name: 'Bravo', category: 'Y' },
    { id: 2, name: 'Echo', category: 'X' },
    { id: 3, name: 'Alpha', category: 'Y' },
    { id: 4, name: 'Charlie', category: 'X' },
];

interface RecordedRequest {
    startRow: number | undefined;
    endRow: number | undefined;
    sortModel: SortModelItem[];
    filterModel: any;
}

// Inline recorder: captures every getRows request so tests can assert the sortModel/filterModel
// carried on each server round-trip, and how many round-trips occurred.
function createFlatDatasource(requests: RecordedRequest[]) {
    return {
        getRows: (params: IServerSideGetRowsParams) => {
            const request: IServerSideGetRowsRequest = params.request;
            requests.push({
                startRow: request.startRow,
                endRow: request.endRow,
                sortModel: (request.sortModel ?? []).map((s) => ({ colId: s.colId, sort: s.sort })),
                filterModel: request.filterModel,
            });

            // Filter server-side.
            let rows = ROWS.slice();
            const filterModel = request.filterModel as Record<string, any> | undefined;
            if (filterModel && filterModel.category) {
                const wanted = filterModel.category.filter;
                rows = rows.filter((r) => r.category === wanted);
            }
            if (filterModel && filterModel.id) {
                const threshold = filterModel.id.filter;
                rows = rows.filter((r) => r.id >= threshold);
            }

            // Sort server-side (single sort column is enough for these cases).
            const sort = request.sortModel?.[0];
            if (sort) {
                const dir = sort.sort === 'desc' ? -1 : 1;
                rows.sort((a, b) => {
                    const av = (a as any)[sort.colId];
                    const bv = (b as any)[sort.colId];
                    if (av < bv) {
                        return -1 * dir;
                    }
                    if (av > bv) {
                        return 1 * dir;
                    }
                    return 0;
                });
            }

            const lastRow = rows.length;
            const slice = rows.slice(request.startRow, request.endRow);
            params.success({ rowData: slice, rowCount: lastRow });
        },
    };
}

function baseGridOptions(requests: RecordedRequest[], overrides: Partial<GridOptions> = {}): GridOptions {
    return {
        columnDefs: [
            { field: 'id', filter: 'agNumberColumnFilter' },
            { field: 'name' },
            { field: 'category', filter: 'agTextColumnFilter' },
        ],
        rowModelType: 'serverSide',
        cacheBlockSize: 100,
        getRowId: (params) => String(params.data.id),
        serverSideDatasource: createFlatDatasource(requests),
        ...overrides,
    };
}

describe('SSRM flat sort/filter (characterization)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule, TextFilterModule, NumberFilterModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('applying a column sort issues a fresh request carrying sortModel and re-renders server-sorted', async () => {
        const requests: RecordedRequest[] = [];
        const api = gridsManager.createGrid(null, baseGridOptions(requests));
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // Initial load carries an empty sortModel.
        expect(requests[0].sortModel).toEqual([]);
        const requestsBeforeSort = requests.length;

        api.applyColumnState({ state: [{ colId: 'name', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        // A fresh server request is issued and carries the exact sortModel.
        expect(requests.length).toBeGreaterThan(requestsBeforeSort);
        expect(requests[requests.length - 1].sortModel).toEqual([{ colId: 'name', sort: 'asc' }]);

        // Rows re-render in server-sorted (name asc) order: Alpha, Bravo, Charlie, Delta, Echo.
        await new GridRows(api, 'flat sort name asc').check(`
            ROOT id:<no-id>
            ├── LEAF id:3 id:3 name:"Alpha" category:"Y"
            ├── LEAF id:1 id:1 name:"Bravo" category:"Y"
            ├── LEAF id:4 id:4 name:"Charlie" category:"X"
            ├── LEAF id:0 id:0 name:"Delta" category:"X"
            └── LEAF id:2 id:2 name:"Echo" category:"X"
        `);
    });

    test('toggling sort asc -> desc -> none round-trips to the server each time', async () => {
        const requests: RecordedRequest[] = [];
        const api = gridsManager.createGrid(null, baseGridOptions(requests));
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        api.applyColumnState({ state: [{ colId: 'name', sort: 'asc' }] });
        await waitForNoLoadingRows(api);
        expect(requests[requests.length - 1].sortModel).toEqual([{ colId: 'name', sort: 'asc' }]);
        const afterAsc = requests.length;

        api.applyColumnState({ state: [{ colId: 'name', sort: 'desc' }] });
        await waitForNoLoadingRows(api);
        expect(requests.length).toBeGreaterThan(afterAsc);
        expect(requests[requests.length - 1].sortModel).toEqual([{ colId: 'name', sort: 'desc' }]);
        const afterDesc = requests.length;

        // Clearing the sort re-requests with an empty sortModel.
        api.applyColumnState({ state: [{ colId: 'name', sort: null }] });
        await waitForNoLoadingRows(api);
        expect(requests.length).toBeGreaterThan(afterDesc);
        expect(requests[requests.length - 1].sortModel).toEqual([]);

        // Back to the datasource's natural (id) order after the sort is cleared.
        await new GridRows(api, 'flat sort cleared').check(`
            ROOT id:<no-id>
            ├── LEAF id:0 id:0 name:"Delta" category:"X"
            ├── LEAF id:1 id:1 name:"Bravo" category:"Y"
            ├── LEAF id:2 id:2 name:"Echo" category:"X"
            ├── LEAF id:3 id:3 name:"Alpha" category:"Y"
            └── LEAF id:4 id:4 name:"Charlie" category:"X"
        `);
    });

    test('applying a filter issues a fresh request carrying filterModel and re-renders filtered', async () => {
        const requests: RecordedRequest[] = [];
        const api = gridsManager.createGrid(null, baseGridOptions(requests));
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        expect(api.getDisplayedRowCount()).toBe(5);
        const requestsBeforeFilter = requests.length;

        api.setFilterModel({ category: { filterType: 'text', type: 'equals', filter: 'X' } });
        await waitForNoLoadingRows(api);

        // A fresh server request is issued and carries the applied filterModel.
        expect(requests.length).toBeGreaterThan(requestsBeforeFilter);
        expect(requests[requests.length - 1].filterModel).toEqual({
            category: { filterType: 'text', type: 'equals', filter: 'X' },
        });

        // Only category X rows remain (ids 0, 2, 4), in the datasource's natural order.
        expect(api.getDisplayedRowCount()).toBe(3);
        await new GridRows(api, 'flat filter category X').check(`
            ROOT id:<no-id>
            ├── LEAF id:0 id:0 name:"Delta" category:"X"
            ├── LEAF id:2 id:2 name:"Echo" category:"X"
            └── LEAF id:4 id:4 name:"Charlie" category:"X"
        `);
    });

    test('sort + filter combined are carried on a single request together', async () => {
        const requests: RecordedRequest[] = [];
        const api = gridsManager.createGrid(null, baseGridOptions(requests));
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        api.setFilterModel({ category: { filterType: 'text', type: 'equals', filter: 'X' } });
        await waitForNoLoadingRows(api);
        api.applyColumnState({ state: [{ colId: 'name', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        // The latest request carries BOTH the sortModel and the filterModel.
        const last = requests[requests.length - 1];
        expect(last.sortModel).toEqual([{ colId: 'name', sort: 'asc' }]);
        expect(last.filterModel).toEqual({
            category: { filterType: 'text', type: 'equals', filter: 'X' },
        });

        // Category X rows sorted by name asc: Charlie, Delta, Echo.
        expect(api.getDisplayedRowCount()).toBe(3);
        await new GridRows(api, 'flat sort+filter combined').check(`
            ROOT id:<no-id>
            ├── LEAF id:4 id:4 name:"Charlie" category:"X"
            ├── LEAF id:0 id:0 name:"Delta" category:"X"
            └── LEAF id:2 id:2 name:"Echo" category:"X"
        `);
    });

    test('without a client-side-sort option, every sort change round-trips to the server', async () => {
        const requests: RecordedRequest[] = [];
        const api = gridsManager.createGrid(null, baseGridOptions(requests));
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        const before = requests.length;
        api.applyColumnState({ state: [{ colId: 'id', sort: 'desc' }] });
        await waitForNoLoadingRows(api);
        const afterFirst = requests.length;
        expect(afterFirst).toBeGreaterThan(before);

        api.applyColumnState({ state: [{ colId: 'name', sort: 'asc' }] });
        await waitForNoLoadingRows(api);
        // A second distinct sort forces another server round-trip (sort is not done client-side).
        expect(requests.length).toBeGreaterThan(afterFirst);
    });
});
