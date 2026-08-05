import { waitFor } from '@testing-library/dom';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, getGridElement } from 'ag-grid-community';
import { PivotModule, RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise';

import { getColumnOrder } from '../columns/column-test-utils';
import { TestGridsManager, applyTransactionChecked, asyncSetTimeout } from '../test-utils';

// AG-9664: pivot column sorting against every grid option and column property that governs it.
describe('pivot column sorting: grid options and column properties', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, RowGroupingPanelModule, PivotModule],
    });
    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    const ASC = ['pivot_year_2020_sales', 'pivot_year_2021_sales', 'pivot_year_2022_sales'];
    const DESC = ['pivot_year_2022_sales', 'pivot_year_2021_sales', 'pivot_year_2020_sales'];
    // Insertion order is deliberately neither ascending nor descending, so "no sort" is distinguishable.
    const NATURAL = ['pivot_year_2022_sales', 'pivot_year_2020_sales', 'pivot_year_2021_sales'];

    const pivots = (api: GridApi) => getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'));

    async function createGrid(options?: Partial<GridOptions>, yearColDef?: Partial<ColDef>): Promise<GridApi> {
        const api = gridsManager.createGrid('pivotSortOptions', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true, ...yearColDef },
                { field: 'sales', aggFunc: 'sum', hide: true },
            ],
            pivotMode: true,
            pivotPanelShow: 'always',
            getRowId: ({ data }) => data.id,
            ...options,
        });
        applyTransactionChecked(api, {
            add: [
                { id: 'a', country: 'USA', year: 2022, sales: 1 },
                { id: 'b', country: 'USA', year: 2020, sales: 1 },
                { id: 'c', country: 'USA', year: 2021, sales: 1 },
            ],
        });
        // Pivot mode off never generates pivot result columns, so there is nothing to wait for.
        if (options?.pivotMode !== false) {
            await waitFor(() => expect(pivots(api)).toHaveLength(3));
        }
        return api;
    }

    /** The Year pill in the pivot ("Column Labels") panel above the grid. */
    function yearPill(api: GridApi): HTMLElement {
        const gridDiv = getGridElement(api)! as HTMLElement;
        const pill = gridDiv.querySelector('.ag-column-drop-horizontal-pivot .ag-column-drop-cell');
        if (!pill) {
            throw new Error('year pill not found in the pivot panel');
        }
        return pill as HTMLElement;
    }

    const clickPill = (api: GridApi) =>
        yearPill(api).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    const shown = (el: Element | null | undefined) => !!el && !el.classList.contains('ag-hidden');
    const pillSortIcon = (api: GridApi): 'asc' | 'desc' | null => {
        const pill = yearPill(api);
        if (shown(pill.querySelector('.ag-sort-ascending-icon'))) {
            return 'asc';
        }
        if (shown(pill.querySelector('.ag-sort-descending-icon'))) {
            return 'desc';
        }
        return null;
    };

    // Baseline for the suppression tests below: without it, a no-op assertion could pass vacuously.
    test('clicking the pivot pill cycles the pivot column order', async () => {
        const api = await createGrid();
        expect(pivots(api)).toEqual(ASC);
        // An unset pivotSort displays as ascending, matching the order the columns are generated in.
        expect(pillSortIcon(api)).toBe('asc');

        clickPill(api);
        await waitFor(() => {
            expect(pivots(api)).toEqual(DESC);
            expect(pillSortIcon(api)).toBe('desc');
        });

        clickPill(api);
        await waitFor(() => {
            expect(pivots(api)).toEqual(NATURAL);
            expect(pillSortIcon(api)).toBeNull();
        });

        clickPill(api);
        await waitFor(() => {
            expect(pivots(api)).toEqual(ASC);
            expect(pillSortIcon(api)).toBe('asc');
        });
    });

    test('pivotPanelSuppressSort makes the pill inert but leaves applyColumnState working', async () => {
        const api = await createGrid({ pivotPanelSuppressSort: true });

        // A suppressed pill click has no observable effect at all, so there is no positive signal to poll for -
        // this is the window in which a (wrongly) un-suppressed click would have reordered the columns.
        clickPill(api);
        // eslint-disable-next-line no-restricted-syntax -- window in which a suppressed pill click would wrongly reorder the columns
        await asyncSetTimeout(10);
        expect(pivots(api)).toEqual(ASC);
        expect(api.getColumnState().find((s) => s.colId === 'year')!.pivotSort).toBe('asc');
        // Suppressed: the pill shows no sort indicator at all, not even the ascending default.
        expect(pillSortIcon(api)).toBeNull();

        // Only the panel interaction is suppressed - the API still sorts.
        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await waitFor(() => expect(pivots(api)).toEqual(DESC));
    });

    test('sortable: false makes the pill inert but leaves applyColumnState working', async () => {
        const api = await createGrid(undefined, { sortable: false });

        clickPill(api);
        // eslint-disable-next-line no-restricted-syntax -- window in which a click on a non-sortable pill would wrongly reorder the columns
        await asyncSetTimeout(10);
        expect(pivots(api)).toEqual(ASC);
        expect(pillSortIcon(api)).toBeNull();

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await waitFor(() => expect(pivots(api)).toEqual(DESC));
    });

    test('functionsReadOnly locks the pill in place but still allows sorting it', async () => {
        const api = await createGrid({ functionsReadOnly: true });

        clickPill(api);
        await waitFor(() => {
            expect(pivots(api)).toEqual(DESC);
            expect(pillSortIcon(api)).toBe('desc');
        });
    });

    test.each([true, false])('pivot sorting works with enableStrictPivotColumnOrder: %s', async (strict) => {
        const api = await createGrid({ enableStrictPivotColumnOrder: strict });
        expect(pivots(api)).toEqual(ASC);

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await waitFor(() => expect(pivots(api)).toEqual(DESC));

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: null }] });
        await waitFor(() => expect(pivots(api)).toEqual(NATURAL));
    });

    test('pivotComparator defines the ascending order, desc reverses it and null bypasses it', async () => {
        // A reverse-numeric comparator, so this column's ascending order is 2022, 2021, 2020.
        const api = await createGrid(undefined, {
            pivotComparator: (a: string, b: string) => Number(b) - Number(a),
        });
        expect(pivots(api)).toEqual(DESC);

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await waitFor(() => expect(pivots(api)).toEqual(ASC));

        // No sort bypasses the comparator entirely.
        api.applyColumnState({ state: [{ colId: 'year', pivotSort: null }] });
        await waitFor(() => expect(pivots(api)).toEqual(NATURAL));
    });

    const ROW_TOTAL = 'PivotRowTotal_pivot_year__sales';
    // `pivots` only matches the generated group columns, and the row total is a pivot result column too.
    const pivotsWithRowTotal = (api: GridApi) =>
        getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_') || id === ROW_TOTAL);

    test('pivotRowTotals: before keeps the row total leftmost when sorting', async () => {
        const api = await createGrid({ pivotRowTotals: 'before' });
        expect(pivotsWithRowTotal(api)).toEqual([ROW_TOTAL, ...ASC]);

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await waitFor(() => expect(pivotsWithRowTotal(api)).toEqual([ROW_TOTAL, ...DESC]));
    });

    test('pivotRowTotals: after keeps the row total rightmost when sorting', async () => {
        const api = await createGrid({ pivotRowTotals: 'after' });
        expect(pivotsWithRowTotal(api)).toEqual([...ASC, ROW_TOTAL]);

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await waitFor(() => expect(pivotsWithRowTotal(api)).toEqual([...DESC, ROW_TOTAL]));
    });

    test('pivotSort is per pivot column when pivoting on two columns', async () => {
        const api = gridsManager.createGrid('pivotSortTwoLevels', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, pivotIndex: 0, hide: true },
                { field: 'half', pivot: true, pivotIndex: 1, hide: true },
                { field: 'sales', aggFunc: 'sum', hide: true },
            ],
            pivotMode: true,
            pivotPanelShow: 'always',
            // Expand every pivot level, else a collapsed group renders one summary column instead of its children.
            pivotDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
        });
        applyTransactionChecked(api, {
            add: [
                { id: 'a', country: 'USA', year: 2020, half: 'H1', sales: 1 },
                { id: 'b', country: 'USA', year: 2020, half: 'H2', sales: 1 },
                { id: 'c', country: 'USA', year: 2021, half: 'H1', sales: 1 },
                { id: 'd', country: 'USA', year: 2021, half: 'H2', sales: 1 },
            ],
        });
        const leaves = () => getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'));

        await waitFor(() =>
            expect(leaves()).toEqual([
                'pivot_year-half_2020-H1_sales',
                'pivot_year-half_2020-H2_sales',
                'pivot_year-half_2021-H1_sales',
                'pivot_year-half_2021-H2_sales',
            ])
        );

        // Sorting the inner pivot column reverses only within each year group.
        api.applyColumnState({ state: [{ colId: 'half', pivotSort: 'desc' }] });
        await waitFor(() =>
            expect(leaves()).toEqual([
                'pivot_year-half_2020-H2_sales',
                'pivot_year-half_2020-H1_sales',
                'pivot_year-half_2021-H2_sales',
                'pivot_year-half_2021-H1_sales',
            ])
        );

        // Sorting the outer pivot column reverses the year groups, keeping the inner sort.
        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await waitFor(() => {
            expect(leaves()).toEqual([
                'pivot_year-half_2021-H2_sales',
                'pivot_year-half_2021-H1_sales',
                'pivot_year-half_2020-H2_sales',
                'pivot_year-half_2020-H1_sales',
            ]);
            expect(api.getColumnState().find((s) => s.colId === 'year')!.pivotSort).toBe('desc');
            expect(api.getColumnState().find((s) => s.colId === 'half')!.pivotSort).toBe('desc');
        });
    });

    test('pivotSort set while pivot mode is off applies when pivot mode is turned on', async () => {
        const api = await createGrid({ pivotMode: false });
        expect(pivots(api)).toEqual([]);

        // pivotSort takes effect immediately, but pivotMode is off so there are no pivot columns to reorder yet -
        // gate on the stored pivotSort value (the only thing this call actually changes) rather than the
        // (unchanged) empty column list.
        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await waitFor(() => expect(api.getColumnState().find((s) => s.colId === 'year')!.pivotSort).toBe('desc'));
        expect(pivots(api)).toEqual([]);

        api.setGridOption('pivotMode', true);
        await waitFor(() => expect(pivots(api)).toEqual(DESC));
    });

    test('pivotSort survives a pivot mode round trip', async () => {
        const api = await createGrid();

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await waitFor(() => expect(pivots(api)).toEqual(DESC));

        api.setGridOption('pivotMode', false);
        await waitFor(() => expect(pivots(api)).toEqual([]));

        api.setGridOption('pivotMode', true);
        await waitFor(() => {
            expect(api.getColumnState().find((s) => s.colId === 'year')!.pivotSort).toBe('desc');
            expect(pivots(api)).toEqual(DESC);
        });
    });

    test('removing then re-adding the pivot column keeps its pivotSort', async () => {
        const api = await createGrid();

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await waitFor(() => expect(pivots(api)).toEqual(DESC));

        api.removePivotColumns(['year']);
        await waitFor(() => expect(pivots(api)).toEqual([]));

        api.addPivotColumns(['year']);
        await waitFor(() => expect(pivots(api)).toEqual(DESC));
    });
});
