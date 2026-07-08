import type { IServerSideGetRowsParams } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, waitForEvent } from '../../test-utils';
import { waitForNoLoadingRows } from '../../test-utils/ssrm-test-utils';

/**
 * CHARACTERIZATION (golden-master) tests pinning the CURRENT behaviour of the SSRM
 * `getChildCount` callback.
 *
 * `setChildCountIntoRowNode` (blockUtils.ts) calls `getChildCount(rowNode.data)` and
 * feeds the result into `rowNode.setAllChildrenCount()` when a group node's own block
 * loads — i.e. when the group row itself is created, BEFORE it is expanded and BEFORE
 * its children are requested. These tests freeze that pre-sizing behaviour and contrast
 * it against the default (no callback) case.
 *
 * These are not aspirational specs: each assertion records what the grid actually does
 * today. Do NOT "fix" a value to what you think it should be — a changed value is a
 * behavioural change to review.
 */

interface RequestRecord {
    groupKeys: string[];
    range: [number, number];
}

describe('SSRM getChildCount callback (characterization)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule, RowGroupingModule],
    });

    afterEach(() => gridsManager.reset());

    // country -> athletes. UK has 5 leaves, US has 2, FR has 1.
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

    const CHILD_COUNTS: Record<string, number> = { UK: 5, US: 2, FR: 1 };

    function makeDatasource(requests: RequestRecord[], blockSize?: number) {
        return {
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
                const page = blockSize != null ? all.slice(start, end) : all;
                params.success({ rowData: [...page], rowCount: all.length });
            },
        };
    }

    test('scenario 1: getChildCount pre-sizes a group node before it is expanded', async () => {
        const requests: RequestRecord[] = [];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { field: 'athlete' },
            rowModelType: 'serverSide',
            getChildCount: (data) => CHILD_COUNTS[data.country],
            getRowId: (p) => p.data.id ?? `group-${p.data.country}`,
            serverSideDatasource: makeDatasource(requests),
        });
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // Only the root group block was requested — no child routes loaded yet.
        expect(requests).toEqual([{ groupKeys: [], range: [0, 100] }]);

        // The grid trusts getChildCount: each group reports its child count without loading children.
        expect(api.getRowNode('group-UK')!.allChildrenCount).toBe(5);
        expect(api.getRowNode('group-US')!.allChildrenCount).toBe(2);
        expect(api.getRowNode('group-FR')!.allChildrenCount).toBe(1);

        // Only the 3 collapsed group rows are displayed; children not loaded.
        expect(api.getDisplayedRowCount()).toBe(3);
    });

    test('scenario 2: expanding a pre-sized group requests its child blocks by cacheBlockSize', async () => {
        const requests: RequestRecord[] = [];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { field: 'athlete' },
            rowModelType: 'serverSide',
            cacheBlockSize: 2,
            getChildCount: (data) => CHILD_COUNTS[data.country],
            getRowId: (p) => p.data.id ?? `group-${p.data.country}`,
            serverSideDatasource: makeDatasource(requests, 2),
        });
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        expect(api.getRowNode('group-UK')!.allChildrenCount).toBe(5);

        api.getRowNode('group-UK')!.setExpanded(true);
        await waitForNoLoadingRows(api);

        // UK's 5 children are loaded in blocks of 2 within the ['UK'] route.
        expect(requests).toEqual([
            { groupKeys: [], range: [0, 2] },
            { groupKeys: ['UK'], range: [0, 2] },
            { groupKeys: ['UK'], range: [2, 4] },
            { groupKeys: ['UK'], range: [4, 6] },
        ]);

        // After load the reported child count stays 5 and the children are displayed.
        expect(api.getRowNode('group-UK')!.allChildrenCount).toBe(5);
        expect(api.getDisplayedRowCount()).toBe(8);

        await new GridRows(api, 'scenario 2 after expand UK').check(`
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

    test('scenario 3: getChildCount value is independent of the actual children returned', async () => {
        const requests: RequestRecord[] = [];

        // Deliberately report a child count that does NOT match the real number of leaf rows.
        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { field: 'athlete' },
            rowModelType: 'serverSide',
            getChildCount: () => 42,
            getRowId: (p) => p.data.id ?? `group-${p.data.country}`,
            serverSideDatasource: makeDatasource(requests),
        });
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // The grid reports whatever getChildCount says, regardless of true leaf count.
        expect(api.getRowNode('group-UK')!.allChildrenCount).toBe(42);
        expect(api.getRowNode('group-US')!.allChildrenCount).toBe(42);
    });

    test('scenario 4: without getChildCount allChildrenCount stays null even after children load', async () => {
        const requests: RequestRecord[] = [];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { field: 'athlete' },
            rowModelType: 'serverSide',
            getRowId: (p) => p.data.id ?? `group-${p.data.country}`,
            serverSideDatasource: makeDatasource(requests),
        });
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // No callback: the group's child count is unknown before it is loaded.
        expect(api.getRowNode('group-UK')!.allChildrenCount).toBe(null);

        api.getRowNode('group-UK')!.setExpanded(true);
        await waitForNoLoadingRows(api);

        // CHARACTERIZATION: even after the children load, allChildrenCount is NOT populated
        // from the loaded rows — it remains null. Only getChildCount sets this value in SSRM.
        expect(api.getRowNode('group-UK')!.allChildrenCount).toBe(null);
        // The children are nonetheless loaded and displayed.
        expect(api.getDisplayedRowCount()).toBe(8);
    });
});
