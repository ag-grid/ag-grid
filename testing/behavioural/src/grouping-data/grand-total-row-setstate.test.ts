import type { GridApi, GridOptions, GridState, RowNode } from 'ag-grid-community';
import { ClientSideRowModelModule, GridStateModule, PinnedRowModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout, cachedJSONObjects } from '../test-utils';

interface RowData {
    category: string;
    region: string;
    product: string;
    revenue: number;
}

/**
 * Restoring grid state via `api.setState` with no `rowPinning` section calls
 * `pinnedRowModel.reset()`. The pinned grand total row is derived from the
 * `grandTotalRow` option rather than manual row-pinning state, so it must survive
 * such a reset — otherwise it disappears until the next user interaction.
 */
describe('grand total row survives setState', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, GridStateModule, RowGroupingModule, PinnedRowModule],
    });

    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    const createRowData = (): RowData[] =>
        cachedJSONObjects.array([
            { category: 'Electronics', region: 'EMEA', product: 'Laptop', revenue: 1200 },
            { category: 'Electronics', region: 'APAC', product: 'Phone', revenue: 800 },
            { category: 'Furniture', region: 'AMER', product: 'Desk', revenue: 500 },
            { category: 'Furniture', region: 'EMEA', product: 'Chair', revenue: 300 },
        ]);

    const baseOptions = (): GridOptions<RowData> => ({
        columnDefs: [
            { field: 'category', rowGroup: true, hide: true },
            { field: 'region' },
            { field: 'product' },
            { field: 'revenue', aggFunc: 'sum' },
        ],
        rowData: createRowData(),
        getRowId: (params) => params.data.product,
        grandTotalRow: 'pinnedTop',
        groupDefaultExpanded: 1,
    });

    const savedState: GridState = {
        rowGroup: { groupColIds: ['region'] },
    };

    const expectGrandTotalPinnedTop = (api: GridApi<RowData>) => {
        expect(api.getPinnedTopRowCount()).toBe(1);
        const pinned = api.getPinnedTopRow(0) as RowNode | undefined;
        // The pinned row must be the grand total footer (root-level footer), not a stray group row.
        expect(pinned?.footer).toBe(true);
        expect(pinned?.level).toBe(-1);
    };

    const expectGrandTotalPinnedBottom = (api: GridApi<RowData>) => {
        expect(api.getPinnedBottomRowCount()).toBe(1);
        const pinned = api.getPinnedBottomRow(0) as RowNode | undefined;
        expect(pinned?.footer).toBe(true);
        expect(pinned?.level).toBe(-1);
    };

    test('synchronous setState keeps the pinned grand total row', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', baseOptions());
        expectGrandTotalPinnedTop(api);

        api.setState(savedState);
        await asyncSetTimeout(5);

        expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual(['region']);
        expectGrandTotalPinnedTop(api);
    });

    test('asynchronous setState from onFirstDataRendered keeps the pinned grand total row', async () => {
        const options: GridOptions<RowData> = {
            ...baseOptions(),
            onFirstDataRendered: (event) => {
                void Promise.resolve().then(() => {
                    event.api.setState(savedState);
                });
            },
        };
        const api = gridsManager.createGrid<RowData>('myGrid', options);

        // let firstDataRendered + the microtask + setState's deferred setTimeout flush
        await asyncSetTimeout(20);

        expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual(['region']);
        expectGrandTotalPinnedTop(api);
    });

    test('grand total row is not serialised into rowPinning state', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', baseOptions());
        expectGrandTotalPinnedTop(api);

        // The grand total is driven by the `grandTotalRow` option, so it must not leak into
        // the manual row-pinning state returned by getState().
        expect(api.getState().rowPinning).toEqual({ top: [], bottom: [] });
    });

    test('explicit empty rowPinning state keeps the pinned grand total row', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', baseOptions());
        expectGrandTotalPinnedTop(api);

        // A full state object serialises the grand total as empty `rowPinning` arrays. Restoring
        // that state takes the explicit `setPinnedState` path (not `reset`), which must not clear
        // the grand total row driven by the `grandTotalRow` option.
        api.setState({ ...savedState, rowPinning: { top: [], bottom: [] } });
        await asyncSetTimeout(5);

        expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual(['region']);
        expectGrandTotalPinnedTop(api);
    });

    test('round-tripping getState through setState keeps the pinned grand total row', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', baseOptions());
        expectGrandTotalPinnedTop(api);

        api.setState(api.getState());
        await asyncSetTimeout(5);

        expectGrandTotalPinnedTop(api);
    });

    test('pinnedBottom grand total survives setState and is not serialised into rowPinning state', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            ...baseOptions(),
            grandTotalRow: 'pinnedBottom',
        });
        expectGrandTotalPinnedBottom(api);
        expect(api.getState().rowPinning).toEqual({ top: [], bottom: [] });

        api.setState(savedState);
        await asyncSetTimeout(5);

        expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual(['region']);
        expectGrandTotalPinnedBottom(api);
        expect(api.getState().rowPinning).toEqual({ top: [], bottom: [] });
    });
});
