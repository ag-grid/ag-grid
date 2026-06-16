import type { ColumnState } from 'ag-grid-community';
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
});
