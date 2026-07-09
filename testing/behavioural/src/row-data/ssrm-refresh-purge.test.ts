import type { GridOptions, IServerSideGetRowsParams } from 'ag-grid-community';
import { ScrollApiModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, waitForEvent } from '../test-utils';
import { waitForNoLoadingRows } from '../test-utils/ssrm-test-utils';

/**
 * CHARACTERIZATION tests (golden-master) for AG Grid SSRM `refreshServerSide` purge semantics.
 *
 * These tests pin the CURRENT observable behaviour of the grid. They are NOT specifications of
 * desired behaviour: where the grid exhibits a quirk (or a latent bug), the quirk is deliberately
 * frozen here as the expected value. If a change to production code alters one of these snapshots,
 * that is a signal to consciously decide whether the behavioural change is intended — not simply to
 * "fix" the test.
 *
 * Async flushing notes (see harness facts):
 * - Initial load is awaited via `firstDataRendered`.
 * - A NON-PURGE refresh does not create stub rows, so it is awaited via `storeRefreshed` (the
 *   promise must be captured BEFORE calling refresh).
 * - A PURGE refresh creates stub (loading) rows, so `waitForNoLoadingRows` reliably settles it.
 */
describe('SSRM refreshServerSide purge semantics (characterization)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ScrollApiModule, ServerSideRowModelModule],
    });

    afterEach(() => gridsManager.reset());

    const totalRows = 5;
    const rowData = Array.from({ length: totalRows }, (_, i) => ({ id: String(i), value: `Row ${i}` }));

    // Flat (non-grouped) SSRM setup. Records every block request as [startRow, endRow].
    function createFlatGridOptions(requests: number[][]): GridOptions {
        return {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (params) => params.data.id,
            serverSideDatasource: {
                getRows: (params: IServerSideGetRowsParams) => {
                    requests.push([params.request.startRow!, params.request.endRow!]);
                    const slice = rowData.slice(params.request.startRow!, params.request.endRow!);
                    params.success({ rowData: slice, rowCount: totalRows });
                },
            },
        };
    }

    test('purge:true at root re-requests the block and shows loading rows again', async () => {
        const requests: number[][] = [];
        const api = gridsManager.createGrid('myGrid', createFlatGridOptions(requests));
        await waitForEvent('firstDataRendered', api);

        // Initial load requested exactly one block from the root store.
        expect(requests).toEqual([[0, 100]]);
        expect(!!api.getRowNode('0')).toBe(true);

        // A purge refresh discards the cached block, so the row node is gone until re-fetched.
        api.refreshServerSide({ purge: true });
        expect(!!api.getRowNode('0')).toBe(false);

        await waitForNoLoadingRows(api);

        // The block is re-requested from the server.
        expect(requests).toEqual([
            [0, 100],
            [0, 100],
        ]);
        expect(!!api.getRowNode('0')).toBe(true);

        await new GridRows(api, 'purge:true after re-fetch').check(`
            ROOT id:<no-id>
            ├── LEAF id:0 id:"0" value:"Row 0"
            ├── LEAF id:1 id:"1" value:"Row 1"
            ├── LEAF id:2 id:"2" value:"Row 2"
            ├── LEAF id:3 id:"3" value:"Row 3"
            └── LEAF id:4 id:"4" value:"Row 4"
        `);
    });

    test('purge:false at root re-requests the block but keeps cached rows throughout', async () => {
        const requests: number[][] = [];
        const api = gridsManager.createGrid('myGrid', createFlatGridOptions(requests));
        await waitForEvent('firstDataRendered', api);

        expect(requests).toEqual([[0, 100]]);
        expect(!!api.getRowNode('0')).toBe(true);

        // Non-purge refresh: capture the storeRefreshed promise BEFORE triggering the refresh.
        const refreshed = waitForEvent('storeRefreshed', api);
        api.refreshServerSide({ purge: false });

        // Cached rows are retained (no stub rows) across a non-purge refresh.
        expect(!!api.getRowNode('0')).toBe(true);

        await refreshed;

        // The block is still re-requested from the server.
        expect(requests).toEqual([
            [0, 100],
            [0, 100],
        ]);
        expect(!!api.getRowNode('0')).toBe(true);

        await new GridRows(api, 'purge:false after refresh').check(`
            ROOT id:<no-id>
            ├── LEAF id:0 id:"0" value:"Row 0"
            ├── LEAF id:1 id:"1" value:"Row 1"
            ├── LEAF id:2 id:"2" value:"Row 2"
            ├── LEAF id:3 id:"3" value:"Row 3"
            └── LEAF id:4 id:"4" value:"Row 4"
        `);
    });

    test('routed purge:true refreshes only the targeted group block, leaving siblings untouched', async () => {
        // Grouped SSRM setup: one row group column (country), two countries each with leaf rows.
        const groupedData: Record<string, { id: string; value: string }[]> = {
            Ireland: [
                { id: 'ie-0', value: 'Dublin' },
                { id: 'ie-1', value: 'Cork' },
            ],
            Spain: [
                { id: 'es-0', value: 'Madrid' },
                { id: 'es-1', value: 'Seville' },
            ],
        };
        const countries = Object.keys(groupedData);

        // Records the request groupKeys for every getRows call.
        const groupRequests: string[][] = [];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'id' }, { field: 'value' }],
            autoGroupColumnDef: { field: 'country' },
            rowModelType: 'serverSide',
            getRowId: (params) => {
                if (params.data.country != null && params.data.id == null) {
                    return `group-${params.data.country}`;
                }
                return params.data.id;
            },
            serverSideDatasource: {
                getRows: (params: IServerSideGetRowsParams) => {
                    const groupKeys = params.request.groupKeys ?? [];
                    groupRequests.push([...groupKeys]);
                    if (groupKeys.length === 0) {
                        // Root: return the country groups.
                        const groups = countries.map((c) => ({ country: c }));
                        params.success({ rowData: groups, rowCount: groups.length });
                        return;
                    }
                    // Leaf level for a specific country.
                    const leaves = groupedData[groupKeys[0]] ?? [];
                    const rows = leaves.map((leaf) => ({ ...leaf, country: groupKeys[0] }));
                    params.success({ rowData: rows, rowCount: rows.length });
                },
            },
        });
        await waitForEvent('firstDataRendered', api);

        // Expand both groups so their leaf blocks are loaded.
        api.getRowNode('group-Ireland')!.setExpanded(true);
        await waitForNoLoadingRows(api);
        api.getRowNode('group-Spain')!.setExpanded(true);
        await waitForNoLoadingRows(api);

        // Initial requests: root, then each group's leaves.
        expect(groupRequests).toEqual([[], ['Ireland'], ['Spain']]);

        // Routed purge refresh of just the Ireland group.
        api.refreshServerSide({ route: ['Ireland'], purge: true });
        await waitForNoLoadingRows(api);

        // Only Ireland's block was re-requested; the root and Spain blocks were untouched.
        expect(groupRequests).toEqual([[], ['Ireland'], ['Spain'], ['Ireland']]);

        await new GridRows(api, 'routed purge:true on Ireland group').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:group-Ireland ag-Grid-AutoColumn:"Ireland" country:"Ireland"
            │ ├── LEAF id:ie-0 ag-Grid-AutoColumn:"Ireland" country:"Ireland" id:"ie-0" value:"Dublin"
            │ └── LEAF id:ie-1 ag-Grid-AutoColumn:"Ireland" country:"Ireland" id:"ie-1" value:"Cork"
            └─┬ GROUP-leafGroup id:group-Spain ag-Grid-AutoColumn:"Spain" country:"Spain"
            · ├── LEAF id:es-0 ag-Grid-AutoColumn:"Spain" country:"Spain" id:"es-0" value:"Madrid"
            · └── LEAF id:es-1 ag-Grid-AutoColumn:"Spain" country:"Spain" id:"es-1" value:"Seville"
        `);
    });
});
