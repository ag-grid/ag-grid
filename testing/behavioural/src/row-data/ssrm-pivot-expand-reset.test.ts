import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    PivotModule,
    RowGroupingModule,
    ServerSideRowModelApiModule,
    ServerSideRowModelModule,
} from 'ag-grid-enterprise';

import { createFakeServer, createServerSideDatasource } from '../columnToolPanel/deferredPivotModeFakeServer';
import { TestGridsManager, waitForNoLoadingRows } from '../test-utils';

/**
 * Regression coverage for SSRM expand-all state under row-shape changes.
 *
 * With `ssrmExpandAllAffectsAllRows`, `api.expandAll()` puts the grid into a BULK expand-all state
 * that applies to every group, including groups that load later. When the row shape changes (pivot
 * mode, pivot columns or row-group columns), that stale bulk state must be DISCARDED: after the
 * change the grid reloads from a fresh, default (collapsed) expansion state rather than
 * auto-expanding the newly loaded groups from the pre-change expand-all.
 *
 * Pinned purely through the public API and observable displayed rows — no reaching into the
 * expansion strategy or any private bean.
 */
describe('SSRM pivot/group change resets expand-all state', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule, RowGroupingModule, PivotModule],
    });

    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    const rowData = [
        { country: 'USA', year: 2000, sport: 'Swimming', gold: 1 },
        { country: 'USA', year: 2004, sport: 'Cycling', gold: 2 },
        { country: 'Russia', year: 2000, sport: 'Swimming', gold: 3 },
        { country: 'Russia', year: 2004, sport: 'Cycling', gold: 4 },
    ];

    // SSRM grouping requires getRowId; ids are built from the group key at each level.
    const getRowId = ({ data, level, parentKeys }: { data: any; level: number; parentKeys?: string[] }): string => {
        const key = level === 0 ? data.country : data.year;
        return [...(parentKeys ?? []), key].join('-');
    };

    function baseGridOptions(overrides: Partial<GridOptions> = {}): GridOptions {
        return {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'sport', pivot: true },
                { field: 'gold', aggFunc: 'sum' },
            ],
            rowModelType: 'serverSide',
            serverSideDatasource: createServerSideDatasource(createFakeServer(rowData as any)),
            getRowId,
            ssrmExpandAllAffectsAllRows: true,
            ...overrides,
        };
    }

    // Displayed row ids that are top-level country groups.
    const countryGroupIds = (api: GridApi): string[] => {
        const ids: string[] = [];
        api.forEachNode((node) => {
            if (node.group && node.level === 0 && node.id != null) {
                ids.push(node.id);
            }
        });
        return ids;
    };

    test('toggling pivot mode after expandAll discards the bulk expand-all state', async () => {
        const api = gridsManager.createGrid('myGrid', baseGridOptions());
        await waitForNoLoadingRows(api);

        // Bulk expand-all: every group, at every level, opens.
        api.expandAll();
        await waitForNoLoadingRows(api);
        const expandedCount = api.getDisplayedRowCount();
        // Country groups plus their expanded year children — strictly more than the countries alone.
        expect(expandedCount).toBeGreaterThan(countryGroupIds(api).length);

        // Changing pivot mode is a row-shape change: the stale expand-all must not carry over.
        api.setGridOption('pivotMode', true);
        await waitForNoLoadingRows(api);

        // Fresh state: only the top-level country groups display, all collapsed.
        const countries = countryGroupIds(api);
        expect(api.getDisplayedRowCount()).toBe(countries.length);
        api.forEachNode((node) => {
            if (node.group && node.level === 0) {
                expect(node.expanded).toBe(false);
            }
        });
    });

    test('changing pivot columns after expandAll discards the bulk expand-all state', async () => {
        const api = gridsManager.createGrid('myGrid', baseGridOptions({ pivotMode: true }));
        await waitForNoLoadingRows(api);

        api.expandAll();
        await waitForNoLoadingRows(api);
        expect(api.getDisplayedRowCount()).toBeGreaterThan(countryGroupIds(api).length);

        // Removing the pivot column is a row-shape change; the expand-all must reset.
        api.setPivotColumns([]);
        await waitForNoLoadingRows(api);

        const countries = countryGroupIds(api);
        expect(api.getDisplayedRowCount()).toBe(countries.length);
        api.forEachNode((node) => {
            if (node.group && node.level === 0) {
                expect(node.expanded).toBe(false);
            }
        });
    });

    test('changing row-group columns after expandAll discards the bulk expand-all state', async () => {
        const api = gridsManager.createGrid('myGrid', baseGridOptions());
        await waitForNoLoadingRows(api);

        api.expandAll();
        await waitForNoLoadingRows(api);
        expect(api.getDisplayedRowCount()).toBeGreaterThan(countryGroupIds(api).length);

        // Collapse the grouping to a single level; the reload must start from a fresh collapsed state.
        api.setRowGroupColumns(['country']);
        await waitForNoLoadingRows(api);

        const countries = countryGroupIds(api);
        expect(countries.length).toBeGreaterThan(0);
        expect(api.getDisplayedRowCount()).toBe(countries.length);
        api.forEachNode((node) => {
            if (node.group && node.level === 0) {
                expect(node.expanded).toBe(false);
            }
        });
    });
});
