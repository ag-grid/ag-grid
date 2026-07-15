import type { GridOptions, IServerSideGetRowsParams, IServerSideGetRowsRequest } from 'ag-grid-community';
import { GridStateModule, TextFilterModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { TestGridsManager, waitForEvent } from '../test-utils';
import { waitForNoLoadingRows } from '../test-utils/ssrm-test-utils';

/**
 * Regression tests for SSRM + `enableFilterHandlers` filter wiring.
 *
 * - AG-15725: a filter supplied via `initialState` (state restore) must be honoured on the very first load —
 *   the restored filterModel is carried on the initial server request and the returned rows are filtered.
 *   Under SSRM the state-restore diff is empty, so this initial application previously did not take effect.
 * - AG-15724: updating column definitions at runtime must not drop the filter-handler wiring, so an active
 *   filter survives a `columnDefs` update rather than silently becoming inactive.
 *
 * Both fixes live in community `columnFilterService.ts` but are only observable under SSRM + filter handlers,
 * so they are pinned here through the public API (`isColumnFilterPresent`, `getColumnFilterModel`) and the
 * server request stream. Mirrors the inline recording-datasource style of `ssrm-flat-sort-filter.test.ts`.
 */

interface FlatRow {
    id: number;
    name: string;
    category: string;
}

const ROWS: FlatRow[] = [
    { id: 0, name: 'Delta', category: 'X' },
    { id: 1, name: 'Bravo', category: 'Y' },
    { id: 2, name: 'Echo', category: 'X' },
    { id: 3, name: 'Alpha', category: 'Y' },
    { id: 4, name: 'Charlie', category: 'X' },
];

interface RecordedRequest {
    filterModel: any;
}

function createFlatDatasource(requests: RecordedRequest[]) {
    return {
        getRows: (params: IServerSideGetRowsParams) => {
            const request: IServerSideGetRowsRequest = params.request;
            requests.push({ filterModel: request.filterModel });

            let rows = ROWS.slice();
            const filterModel = request.filterModel as Record<string, any> | undefined;
            if (filterModel && filterModel.category) {
                const wanted = filterModel.category.filter;
                rows = rows.filter((r) => r.category === wanted);
            }

            params.success({ rowData: rows.slice(request.startRow, request.endRow), rowCount: rows.length });
        },
    };
}

function baseGridOptions(requests: RecordedRequest[], overrides: Partial<GridOptions> = {}): GridOptions {
    return {
        columnDefs: [{ field: 'id' }, { field: 'name' }, { field: 'category', filter: 'agTextColumnFilter' }],
        rowModelType: 'serverSide',
        cacheBlockSize: 100,
        enableFilterHandlers: true,
        getRowId: (params) => String(params.data.id),
        serverSideDatasource: createFlatDatasource(requests),
        ...overrides,
    };
}

const CATEGORY_X_FILTER = { filterType: 'text', type: 'equals', filter: 'X' } as const;

describe('SSRM filter handlers', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule, TextFilterModule, GridStateModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    // AG-15725
    test('a filter restored from initialState is honoured on the first load', async () => {
        const requests: RecordedRequest[] = [];
        const api = gridsManager.createGrid(
            null,
            baseGridOptions(requests, {
                initialState: { filter: { filterModel: { category: CATEGORY_X_FILTER } } },
            })
        );
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // The very first server request carried the restored filterModel (the bug: under SSRM the empty
        // state-restore diff meant this initial application did not take effect).
        expect(requests[0].filterModel).toEqual({ category: CATEGORY_X_FILTER });
        // ...and only the matching category X rows (ids 0, 2, 4) were loaded.
        expect(api.getDisplayedRowCount()).toBe(3);
    });

    // AG-15724
    test('an active filter survives a runtime columnDefs update', async () => {
        const requests: RecordedRequest[] = [];
        const api = gridsManager.createGrid(null, baseGridOptions(requests));
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        await api.setColumnFilterModel('category', CATEGORY_X_FILTER);
        api.onFilterChanged();
        await waitForNoLoadingRows(api);

        expect(api.isColumnFilterPresent()).toBe(true);
        expect(api.getDisplayedRowCount()).toBe(3);

        // Re-supply column definitions at runtime (adds a column, keeps the filtered one).
        api.setGridOption('columnDefs', [
            { field: 'id' },
            { field: 'name' },
            { field: 'category', filter: 'agTextColumnFilter' },
            { field: 'extra' },
        ]);
        await waitForNoLoadingRows(api);

        // The bug: the colDef update dropped the filter-handler wiring, deactivating the filter.
        expect(api.isColumnFilterPresent()).toBe(true);
        expect(api.getColumnFilterModel('category')).toEqual(CATEGORY_X_FILTER);
        expect(api.getDisplayedRowCount()).toBe(3);
        expect(requests[requests.length - 1].filterModel).toEqual({ category: CATEGORY_X_FILTER });
    });
});
