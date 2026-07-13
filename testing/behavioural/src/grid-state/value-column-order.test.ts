import type { ColumnState } from 'ag-grid-community';
import { convertColumnState } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('Value Column Order (valueIndex)', () => {
    const gridsManager = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    const rowData = [
        { country: 'Ireland', year: 2000, gold: 1, silver: 2 },
        { country: 'Ireland', year: 2004, gold: 3, silver: 4 },
    ];

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const valueColIdsInOrder = (api: ReturnType<typeof gridsManager.createGrid>): string[] =>
        api.getValueColumns().map((col) => col.getColId());

    // Column state entries come back in grid-column order; the saved order lives in `valueIndex`.
    const valueOrderFromState = (state: ColumnState[]): string[] =>
        state
            .filter((s) => s.aggFunc != null && s.valueIndex != null)
            .sort((a, b) => a.valueIndex! - b.valueIndex!)
            .map((s) => s.colId);

    test('colDef.valueIndex sets the order of value columns', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'year', pivot: true },
                { field: 'gold', aggFunc: 'sum', valueIndex: 1 },
                { field: 'silver', aggFunc: 'sum', valueIndex: 0 },
            ],
            pivotMode: true,
            rowData,
        });
        await asyncSetTimeout(1);

        // silver (valueIndex 0) before gold (valueIndex 1), regardless of colDef declaration order.
        expect(valueColIdsInOrder(api)).toEqual(['silver', 'gold']);
    });

    test('value column order is captured in and restored from column state', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'year', pivot: true },
                { field: 'gold', aggFunc: 'sum' },
                { field: 'silver', aggFunc: 'sum' },
            ],
            pivotMode: true,
            rowData,
        });
        await asyncSetTimeout(1);

        // Default follows colDef order.
        expect(valueColIdsInOrder(api)).toEqual(['gold', 'silver']);

        // Reorder so silver comes first.
        api.setValueColumns(['silver', 'gold']);
        await asyncSetTimeout(1);
        expect(valueColIdsInOrder(api)).toEqual(['silver', 'gold']);

        const savedState = api.getColumnState();
        expect(valueOrderFromState(savedState)).toEqual(['silver', 'gold']);

        // Change the order again so the restore below has something to undo.
        api.setValueColumns(['gold', 'silver']);
        await asyncSetTimeout(1);
        expect(valueColIdsInOrder(api)).toEqual(['gold', 'silver']);

        // Restoring the saved state brings back the silver-first order.
        api.applyColumnState({ state: savedState, applyOrder: true });
        await asyncSetTimeout(1);
        expect(valueColIdsInOrder(api)).toEqual(['silver', 'gold']);
    });

    test('a state item with valueIndex but no aggFunc activates and orders the value column', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'year', pivot: true },
                { field: 'gold' },
                { field: 'silver' },
            ],
            pivotMode: true,
            rowData,
        });
        await asyncSetTimeout(1);

        // No value columns to start with.
        expect(valueColIdsInOrder(api)).toEqual([]);

        // Index alone (no aggFunc) must activate the columns, ordered by valueIndex.
        api.applyColumnState({
            state: [
                { colId: 'gold', valueIndex: 1 },
                { colId: 'silver', valueIndex: 0 },
            ],
        });
        await asyncSetTimeout(1);

        expect(valueColIdsInOrder(api)).toEqual(['silver', 'gold']);
        // Activation assigned a default aggFunc to each column.
        const aggFuncs = api.getColumnState().filter((s) => s.aggFunc != null);
        expect(aggFuncs.map((s) => s.colId).sort()).toEqual(['gold', 'silver']);
    });

    test('duplicate valueIndex values do not drop aggregation columns from converted state', () => {
        const columnState: ColumnState[] = [
            { colId: 'gold', aggFunc: 'sum', valueIndex: 0 },
            { colId: 'silver', aggFunc: 'sum', valueIndex: 0 },
            { colId: 'bronze', aggFunc: 'sum', valueIndex: 1 },
        ];

        const { aggregation } = convertColumnState(columnState);

        // All three columns survive; the colliding index keeps encounter order (gold before silver).
        expect(aggregation?.aggregationModel).toEqual([
            { colId: 'gold', aggFunc: 'sum' },
            { colId: 'silver', aggFunc: 'sum' },
            { colId: 'bronze', aggFunc: 'sum' },
        ]);
    });
});

// rowGroupIndex/pivotIndex in column state derive from the active-col index re-stamped at flush. An
// imperative reorder must re-stamp so the saved state reflects the new order — the rowGroup/pivot
// counterpart of the valueIndex coverage above (both fail if the flush-time re-index is skipped).
describe('Role Column Order (rowGroupIndex / pivotIndex)', () => {
    const gridsManager = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    const rowData = [{ a: 'x', b: 'y', c: 'z' }];

    afterEach(() => {
        gridsManager.reset();
    });

    const orderFromState = (state: ColumnState[], key: 'rowGroupIndex' | 'pivotIndex'): string[] =>
        state
            .filter((s) => s[key] != null)
            .sort((a, b) => (a[key] as number) - (b[key] as number))
            .map((s) => s.colId!);

    test('row-group column order is captured in and restored from column state', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
            rowData,
        });

        api.setRowGroupColumns(['a', 'b']);
        await asyncSetTimeout(1);
        expect(orderFromState(api.getColumnState(), 'rowGroupIndex')).toEqual(['a', 'b']);

        // Reorder imperatively — the saved state must follow the new order, not the original.
        api.setRowGroupColumns(['b', 'a']);
        await asyncSetTimeout(1);
        const savedState = api.getColumnState();
        expect(orderFromState(savedState, 'rowGroupIndex')).toEqual(['b', 'a']);

        // Reorder away, then restore the saved order.
        api.setRowGroupColumns(['a', 'b']);
        await asyncSetTimeout(1);
        expect(orderFromState(api.getColumnState(), 'rowGroupIndex')).toEqual(['a', 'b']);

        api.applyColumnState({ state: savedState, applyOrder: true });
        await asyncSetTimeout(1);
        expect(orderFromState(api.getColumnState(), 'rowGroupIndex')).toEqual(['b', 'a']);
    });

    test('pivot column order is captured in and restored from column state', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
            pivotMode: true,
            rowData,
        });

        api.setPivotColumns(['a', 'b']);
        await asyncSetTimeout(1);
        expect(orderFromState(api.getColumnState(), 'pivotIndex')).toEqual(['a', 'b']);

        api.setPivotColumns(['b', 'a']);
        await asyncSetTimeout(1);
        const savedState = api.getColumnState();
        expect(orderFromState(savedState, 'pivotIndex')).toEqual(['b', 'a']);

        api.setPivotColumns(['a', 'b']);
        await asyncSetTimeout(1);
        expect(orderFromState(api.getColumnState(), 'pivotIndex')).toEqual(['a', 'b']);

        api.applyColumnState({ state: savedState, applyOrder: true });
        await asyncSetTimeout(1);
        expect(orderFromState(api.getColumnState(), 'pivotIndex')).toEqual(['b', 'a']);
    });
});
