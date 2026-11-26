import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { ColumnState } from 'ag-grid-community';
import { convertColumnState } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

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

    test('a column state reordering the value columns raises columnValueChanged and re-orders the pivot result columns', async () => {
        const valueEvents: string[][] = [];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'year', pivot: true },
                { field: 'gold', aggFunc: 'sum' },
                { field: 'silver', aggFunc: 'sum' },
            ],
            pivotMode: true,
            rowData,
            onColumnValueChanged: (e) => valueEvents.push(e.columns!.map((col) => col.getColId())),
        });
        const pivotValueOrder = () =>
            (api.getPivotResultColumns() ?? []).map((col) => col.getColDef().pivotValueColumn?.getColId());
        await waitFor(() => expect(pivotValueOrder()).toEqual(['gold', 'silver', 'gold', 'silver']));

        api.applyColumnState({
            state: [
                { colId: 'silver', valueIndex: 0 },
                { colId: 'gold', valueIndex: 1 },
            ],
        });

        await waitFor(() => expect(valueEvents).toEqual([[]]));
        expect({ pivot: pivotValueOrder(), order: valueColIdsInOrder(api), valueEvents }).toEqual({
            pivot: ['silver', 'gold', 'silver', 'gold'],
            order: ['silver', 'gold'],
            valueEvents: [[]],
        });
    });

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

        // silver (valueIndex 0) before gold (valueIndex 1), regardless of colDef declaration order.
        await waitFor(() => expect(valueColIdsInOrder(api)).toEqual(['silver', 'gold']));
    });

    test.each(['valueIndex', 'initialValueIndex'] as const)(
        'reset restores %s before unindexed value columns',
        (indexProperty) => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'gold', aggFunc: 'sum' },
                    { field: 'silver', aggFunc: 'sum', [indexProperty]: 0 },
                    { field: 'bronze', aggFunc: 'sum', [indexProperty]: 3 },
                ],
                rowData: [{ gold: 1, silver: 2, bronze: 3 }],
            });
            expect(valueColIdsInOrder(api)).toEqual(['silver', 'bronze', 'gold']);

            api.setValueColumns(['gold', 'bronze', 'silver']);
            expect(valueColIdsInOrder(api)).toEqual(['gold', 'bronze', 'silver']);
            api.resetColumnState();

            expect(valueColIdsInOrder(api)).toEqual(['silver', 'bronze', 'gold']);
            expect(valueOrderFromState(api.getColumnState())).toEqual(['silver', 'bronze', 'gold']);
        }
    );

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

        // Default follows colDef order.
        await waitFor(() => expect(valueColIdsInOrder(api)).toEqual(['gold', 'silver']));

        // Reorder so silver comes first.
        api.setValueColumns(['silver', 'gold']);
        const savedState = await waitFor(() => {
            expect(valueColIdsInOrder(api)).toEqual(['silver', 'gold']);
            const state = api.getColumnState();
            expect(valueOrderFromState(state)).toEqual(['silver', 'gold']);
            return state;
        });

        // Change the order again so the restore below has something to undo.
        api.setValueColumns(['gold', 'silver']);
        await waitFor(() => expect(valueColIdsInOrder(api)).toEqual(['gold', 'silver']));

        // Restoring the saved state brings back the silver-first order.
        api.applyColumnState({ state: savedState, applyOrder: true });
        await waitFor(() => expect(valueColIdsInOrder(api)).toEqual(['silver', 'gold']));
    });

    test('an array getValueColumns returned keeps its order when column state reorders the value columns', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'gold', aggFunc: 'sum' },
                { field: 'silver', aggFunc: 'sum' },
            ],
            rowData,
        });
        const before = api.getValueColumns();
        expect(before.map((col) => col.getColId())).toEqual(['gold', 'silver']);

        api.applyColumnState({
            state: [
                { colId: 'silver', valueIndex: 0 },
                { colId: 'gold', valueIndex: 1 },
            ],
        });

        await waitFor(() => expect(valueColIdsInOrder(api)).toEqual(['silver', 'gold']));
        expect(before.map((col) => col.getColId())).toEqual(['gold', 'silver']);
    });

    test('value columns keep their order through a columnDefs update that sets their aggFunc again', async () => {
        const defs = () => [
            { field: 'gold', aggFunc: 'sum' },
            { field: 'silver', aggFunc: 'sum' },
        ];
        const api = await gridsManager.createGridAndWait('myGrid', { columnDefs: defs(), rowData });
        api.setValueColumns(['silver', 'gold']);

        api.setGridOption('columnDefs', defs());

        expect(valueColIdsInOrder(api)).toEqual(['silver', 'gold']);
    });

    test('changing a value column’s aggFunc alone raises columnValueChanged for it', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'gold', aggFunc: 'sum' },
                { field: 'silver', aggFunc: 'sum' },
            ],
            rowData,
        });
        const changed: string[][] = [];
        api.addEventListener('columnValueChanged', (e) => changed.push((e.columns ?? []).map((c) => c.getColId())));

        api.setColumnAggFunc('gold', 'avg');

        await waitFor(() => expect(changed).toEqual([['gold']]));
    });

    test('a state item with valueIndex but no aggFunc activates and orders the value column', async () => {
        // Awaiting first render pins the "no value columns" check to a defined point: polling for an
        // empty array would pass vacuously before the grid has processed the columns at all.
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'year', pivot: true },
                { field: 'gold' },
                { field: 'silver' },
            ],
            pivotMode: true,
            rowData,
        });

        // No value columns to start with.
        expect(valueColIdsInOrder(api)).toEqual([]);

        // Index alone (no aggFunc) must activate the columns, ordered by valueIndex.
        api.applyColumnState({
            state: [
                { colId: 'gold', valueIndex: 1 },
                { colId: 'silver', valueIndex: 0 },
            ],
        });

        await waitFor(() => expect(valueColIdsInOrder(api)).toEqual(['silver', 'gold']));
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

    const aggregatingDefs = () => [
        { field: 'g', rowGroup: true },
        { field: 'a', aggFunc: 'sum' },
        { field: 'b', aggFunc: 'sum' },
        { field: 'c', aggFunc: 'sum' },
        { field: 'd' },
    ];
    const aggregatingRow = [{ g: 'x', a: 1, b: 2, c: 3, d: 4 }];

    const valueRecord = (api: ReturnType<typeof gridsManager.createGrid>) => {
        const state = api.getColumnState();
        return {
            valueColumns: valueColIdsInOrder(api),
            valueIndex: Object.fromEntries(
                ['a', 'b', 'c', 'd'].map((id) => [id, state.find((s) => s.colId === id)?.valueIndex])
            ),
        };
    };

    test('turning a value column on through column state numbers it after the existing ones, and turning one off renumbers the rest', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: aggregatingDefs(),
            rowData: aggregatingRow,
        });

        api.applyColumnState({ state: [{ colId: 'd', aggFunc: 'sum' }] });

        expect(valueRecord(api)).toEqual({
            valueColumns: ['a', 'b', 'c', 'd'],
            valueIndex: { a: 0, b: 1, c: 2, d: 3 },
        });

        api.applyColumnState({ state: [{ colId: 'a', aggFunc: null }] });

        expect(valueRecord(api)).toEqual({
            valueColumns: ['b', 'c', 'd'],
            valueIndex: { a: null, b: 0, c: 1, d: 2 },
        });
    });
});

// rowGroupIndex/pivotIndex follow the active cols' positions, as valueIndex does above
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
        await waitFor(() => expect(orderFromState(api.getColumnState(), 'rowGroupIndex')).toEqual(['a', 'b']));

        // Reorder imperatively — the saved state must follow the new order, not the original.
        api.setRowGroupColumns(['b', 'a']);
        const savedState = await waitFor(() => {
            const state = api.getColumnState();
            expect(orderFromState(state, 'rowGroupIndex')).toEqual(['b', 'a']);
            return state;
        });

        // Reorder away, then restore the saved order.
        api.setRowGroupColumns(['a', 'b']);
        await waitFor(() => expect(orderFromState(api.getColumnState(), 'rowGroupIndex')).toEqual(['a', 'b']));

        api.applyColumnState({ state: savedState, applyOrder: true });
        await waitFor(() => expect(orderFromState(api.getColumnState(), 'rowGroupIndex')).toEqual(['b', 'a']));
    });

    test('pivot column order is captured in and restored from column state', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
            pivotMode: true,
            rowData,
        });

        api.setPivotColumns(['a', 'b']);
        await waitFor(() => expect(orderFromState(api.getColumnState(), 'pivotIndex')).toEqual(['a', 'b']));

        api.setPivotColumns(['b', 'a']);
        const savedState = await waitFor(() => {
            const state = api.getColumnState();
            expect(orderFromState(state, 'pivotIndex')).toEqual(['b', 'a']);
            return state;
        });

        api.setPivotColumns(['a', 'b']);
        await waitFor(() => expect(orderFromState(api.getColumnState(), 'pivotIndex')).toEqual(['a', 'b']));

        api.applyColumnState({ state: savedState, applyOrder: true });
        await waitFor(() => expect(orderFromState(api.getColumnState(), 'pivotIndex')).toEqual(['b', 'a']));
    });

    const indexesByColId = (
        api: ReturnType<typeof gridsManager.createGrid>,
        key: 'rowGroupIndex' | 'pivotIndex',
        colIds: string[]
    ) => {
        const state = api.getColumnState();
        return Object.fromEntries(colIds.map((id) => [id, state.find((s) => s.colId === id)?.[key]]));
    };

    test('turning a row group column on through column state numbers it after the existing ones, and turning one off renumbers the rest', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'g', rowGroup: true }, { field: 'h', rowGroup: true }, { field: 'a' }],
            rowData: [{ g: 'x', h: 'y', a: 1 }],
        });
        const rowGroups = () => ({
            rowGroupColumns: api.getRowGroupColumns().map((col) => col.getColId()),
            rowGroupIndex: indexesByColId(api, 'rowGroupIndex', ['g', 'h', 'a']),
        });

        api.applyColumnState({ state: [{ colId: 'a', rowGroup: true }] });
        expect(rowGroups()).toEqual({
            rowGroupColumns: ['g', 'h', 'a'],
            rowGroupIndex: { g: 0, h: 1, a: 2 },
        });

        api.applyColumnState({ state: [{ colId: 'g', rowGroup: false }] });
        expect(rowGroups()).toEqual({
            rowGroupColumns: ['h', 'a'],
            rowGroupIndex: { g: null, h: 0, a: 1 },
        });
    });

    test('turning a pivot column off through column state renumbers the pivot indexes of the rest', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'g', rowGroup: true },
                { field: 'p', pivot: true },
                { field: 'q', pivot: true },
                { field: 'a', aggFunc: 'sum' },
            ],
            pivotMode: true,
            rowData: [{ g: 'x', p: 'y', q: 'z', a: 1 }],
        });

        api.applyColumnState({ state: [{ colId: 'p', pivot: false }] });

        expect({
            pivotColumns: api.getPivotColumns().map((col) => col.getColId()),
            pivotIndex: indexesByColId(api, 'pivotIndex', ['p', 'q']),
        }).toEqual({
            pivotColumns: ['q'],
            pivotIndex: { p: null, q: 0 },
        });
    });
});
