import type { GridOptions, IServerSideGetRowsParams } from 'ag-grid-community';
import { ScrollApiModule, TextEditorModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { TestGridsManager, waitForEvent } from '../test-utils';
import { waitForNoLoadingRows } from '../test-utils/ssrm-test-utils';

/**
 * A row that is being edited must survive SSRM block-cache eviction: scrolling far enough to evict
 * the editing row's block would otherwise destroy the in-progress edit state and its popup.
 *
 * The grid uses a tiny maxBlocksInCache so stepping through further blocks exceeds the cap and
 * forces the least-recently-used block out. The companion 'maxBlocksInCache evicts...' test in
 * ssrm-block-loading.test.ts shows that, with no edit in progress, block 0 IS evicted by exactly
 * this scroll sequence — so the retention asserted here is a real deviation, not a no-op.
 */
describe('SSRM editing row survives block eviction', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ScrollApiModule, ServerSideRowModelModule, TextEditorModule],
    });

    afterEach(() => gridsManager.reset());

    test('an in-progress edit keeps its block cached through an LRU eviction that would otherwise drop it', async () => {
        const totalRows = 500;
        const rowData = Array.from({ length: totalRows }, (_, i) => ({ id: String(i), value: `Row ${i}` }));

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value', editable: true }],
            rowModelType: 'serverSide',
            cacheBlockSize: 100,
            maxBlocksInCache: 2,
            rowBuffer: 0,
            suppressRowVirtualisation: false,
            getRowId: (params) => params.data.id,
            serverSideDatasource: {
                getRows: (params: IServerSideGetRowsParams) => {
                    const slice = rowData.slice(params.request.startRow!, params.request.endRow!);
                    params.success({ rowData: slice, rowCount: totalRows });
                },
            },
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);
        await waitForEvent('firstDataRendered', api);

        const editingCell = () => {
            const cells = api.getEditingCells();
            return cells.length === 1 ? { rowIndex: cells[0].rowIndex, colId: cells[0].colId } : cells;
        };

        // Start editing a cell in block 0 (rows 0-99).
        api.startEditingCell({ rowIndex: 0, colKey: 'value' });
        expect(editingCell()).toEqual({ rowIndex: 0, colId: 'value' });
        expect(!!api.getRowNode('0')).toBe(true);

        // Step through two further blocks so three have been touched, exceeding the cap of 2. Sync on
        // the loaded rows (not modelUpdated, which does not fire reliably while a cell is editing).
        api.ensureIndexVisible(250);
        await waitForNoLoadingRows(api);
        api.ensureIndexVisible(450);
        await waitForNoLoadingRows(api);

        // The far block loaded and the editing row's block was retained despite being least-recently
        // used — its node survived and the edit is still active.
        expect(!!api.getRowNode('450')).toBe(true);
        expect(!!api.getRowNode('0')).toBe(true);
        expect(editingCell()).toEqual({ rowIndex: 0, colId: 'value' });

        // Scrolling block 0 back into view finds it still cached; the edit remains in progress.
        api.ensureIndexVisible(0);
        await waitForNoLoadingRows(api);
        expect(editingCell()).toEqual({ rowIndex: 0, colId: 'value' });
    });
});
