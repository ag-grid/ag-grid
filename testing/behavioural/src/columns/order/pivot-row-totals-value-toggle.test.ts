import type { ColDef, ColGroupDef } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../../test-utils';
import { getColumnOrder } from '../column-test-utils';

// Regression coverage for AG-16677:
// When value columns in pivot mode are removed and then re-added, every
// re-added value column should produce a pivotRowTotals column group that
// sits next to the existing row total groups — not pushed to the end of
// the grid.
describe('pivotRowTotals + value column toggling', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, PivotModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const rowData = [
        { country: 'Ireland', year: 2000, gold: 1, silver: 2, bronze: 3 },
        { country: 'Ireland', year: 2004, gold: 4, silver: 5, bronze: 6 },
        { country: 'Italy', year: 2000, gold: 7, silver: 8, bronze: 9 },
    ];

    const columnDefs: (ColDef | ColGroupDef)[] = [
        { field: 'country', rowGroup: true },
        { field: 'year', pivot: true },
        { field: 'gold', aggFunc: 'sum' },
        { field: 'silver', aggFunc: 'sum' },
        { field: 'bronze', aggFunc: 'sum' },
    ];

    const rowTotalIds = (gridApi: ReturnType<typeof gridsManager.createGrid>) =>
        getColumnOrder(gridApi, 'center').filter((id) => id.startsWith('PivotRowTotal_'));

    // Checks the order of the row-total columns relative to the rest of the
    // pivot columns. The row-total groups must all sit together at the start
    // of the grid (for pivotRowTotals: 'before').
    const rowTotalsArePositionedBeforePivotCols = (gridApi: ReturnType<typeof gridsManager.createGrid>) => {
        const order = getColumnOrder(gridApi, 'center');
        // Find last row-total and first non-row-total pivot column.
        const lastRowTotalIdx = order.reduce((acc, id, idx) => (id.startsWith('PivotRowTotal_') ? idx : acc), -1);
        const firstPivotIdx = order.findIndex((id) => id.startsWith('pivot_'));
        return lastRowTotalIdx < firstPivotIdx;
    };

    test('remove then re-add value columns => all row totals stay grouped at the start', () => {
        const gridApi = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            pivotMode: true,
            pivotRowTotals: 'before',
        });

        expect(rowTotalIds(gridApi)).toEqual([
            'PivotRowTotal_pivot_year__gold',
            'PivotRowTotal_pivot_year__silver',
            'PivotRowTotal_pivot_year__bronze',
        ]);
        expect(rowTotalsArePositionedBeforePivotCols(gridApi)).toBe(true);

        gridApi.removeValueColumns(['silver', 'bronze']);
        expect(rowTotalIds(gridApi)).toEqual(['PivotRowTotal_pivot_year__gold']);
        expect(rowTotalsArePositionedBeforePivotCols(gridApi)).toBe(true);

        gridApi.addValueColumns(['silver']);
        const rowTotalIdsAfterReAddingSilver = rowTotalIds(gridApi);
        expect(rowTotalIdsAfterReAddingSilver).toEqual([
            'PivotRowTotal_pivot_year__gold',
            'PivotRowTotal_pivot_year__silver',
        ]);
        expect(rowTotalsArePositionedBeforePivotCols(gridApi)).toBe(true);

        gridApi.addValueColumns(['bronze']);
        const rowTotalIdsAfterReAddingBronze = rowTotalIds(gridApi);
        expect(rowTotalIdsAfterReAddingBronze).toEqual([
            'PivotRowTotal_pivot_year__gold',
            'PivotRowTotal_pivot_year__silver',
            'PivotRowTotal_pivot_year__bronze',
        ]);
        expect(rowTotalsArePositionedBeforePivotCols(gridApi)).toBe(true);
    });

    test('pivotRowTotals=after: re-added row totals stay grouped at the end', () => {
        const gridApi = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            pivotMode: true,
            pivotRowTotals: 'after',
        });

        const rowTotalsArePositionedAfterPivotCols = () => {
            const order = getColumnOrder(gridApi, 'center');
            const firstRowTotalIdx = order.findIndex((id) => id.startsWith('PivotRowTotal_'));
            const lastPivotIdx = order.reduce((acc, id, idx) => (id.startsWith('pivot_') ? idx : acc), -1);
            return lastPivotIdx < firstRowTotalIdx;
        };

        expect(rowTotalsArePositionedAfterPivotCols()).toBe(true);

        gridApi.removeValueColumns(['silver', 'bronze']);
        expect(rowTotalIds(gridApi)).toEqual(['PivotRowTotal_pivot_year__gold']);
        expect(rowTotalsArePositionedAfterPivotCols()).toBe(true);

        gridApi.addValueColumns(['silver']);
        const rowTotalIdsAfterReAddingSilver = rowTotalIds(gridApi);
        expect(rowTotalIdsAfterReAddingSilver).toEqual([
            'PivotRowTotal_pivot_year__gold',
            'PivotRowTotal_pivot_year__silver',
        ]);
        expect(rowTotalsArePositionedAfterPivotCols()).toBe(true);

        gridApi.addValueColumns(['bronze']);
        const rowTotalIdsAfterReAddingBronze = rowTotalIds(gridApi);
        expect(rowTotalIdsAfterReAddingBronze).toEqual([
            'PivotRowTotal_pivot_year__gold',
            'PivotRowTotal_pivot_year__silver',
            'PivotRowTotal_pivot_year__bronze',
        ]);
        expect(rowTotalsArePositionedAfterPivotCols()).toBe(true);
    });

    // Matches how the tool panel Values drop zone toggles: it always calls setValueColumns
    // with the full desired list, never add/remove deltas.
    test('tool-panel-style setValueColumns toggle: row totals stay grouped at the start', () => {
        const gridApi = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            pivotMode: true,
            pivotRowTotals: 'before',
        });

        // Drop silver+bronze from the Values section
        gridApi.setValueColumns(['gold']);
        expect(rowTotalIds(gridApi)).toEqual(['PivotRowTotal_pivot_year__gold']);

        // Drag silver back in
        gridApi.setValueColumns(['gold', 'silver']);
        const rowTotalIdsAfterReAddingSilver = rowTotalIds(gridApi);
        expect(rowTotalIdsAfterReAddingSilver).toEqual([
            'PivotRowTotal_pivot_year__gold',
            'PivotRowTotal_pivot_year__silver',
        ]);
        expect(rowTotalsArePositionedBeforePivotCols(gridApi)).toBe(true);

        // Drag bronze back in
        gridApi.setValueColumns(['gold', 'silver', 'bronze']);
        const rowTotalIdsAfterReAddingBronze = rowTotalIds(gridApi);
        expect(rowTotalIdsAfterReAddingBronze).toEqual([
            'PivotRowTotal_pivot_year__gold',
            'PivotRowTotal_pivot_year__silver',
            'PivotRowTotal_pivot_year__bronze',
        ]);
        expect(rowTotalsArePositionedBeforePivotCols(gridApi)).toBe(true);
    });

    test('setValueColumns reorder updates generated pivot column order', () => {
        const gridApi = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            pivotMode: true,
        });

        gridApi.setValueColumns(['bronze', 'gold', 'silver']);

        expect(getColumnOrder(gridApi, 'center').filter((id) => id.startsWith('pivot_year_2000_'))).toEqual([
            'pivot_year_2000_bronze',
            'pivot_year_2000_gold',
            'pivot_year_2000_silver',
        ]);
    });
});
