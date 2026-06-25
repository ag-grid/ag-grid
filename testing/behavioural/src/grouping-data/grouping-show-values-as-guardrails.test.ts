import type { GridApi, IAggFunc, IRowNode } from 'ag-grid-community';
import { ClientSideRowModelModule, RenderApiModule } from 'ag-grid-community';
import { RowGroupingModule, ShowValuesAsModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager } from '../test-utils';

function leaf(api: GridApi, id: string): IRowNode {
    const node = api.getRowNode(id);
    if (!node) {
        throw new Error(`Leaf '${id}' not found`);
    }
    return node;
}

function displayedIds(api: GridApi): (string | undefined)[] {
    const ids: (string | undefined)[] = [];
    for (let i = 0, len = api.getDisplayedRowCount(); i < len; ++i) {
        ids.push(api.getDisplayedRowAtIndex(i)?.id);
    }
    return ids;
}

describe('showValuesAs breaking-change guardrails', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RenderApiModule, RowGroupingModule, ShowValuesAsModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('BC2 — getCellValue on a non-showValuesAs column is unaffected by a sibling showValuesAs column', async () => {
        const api = gridsManager.createGrid('bc2', {
            columnDefs: [
                { field: 'country' },
                { field: 'units', aggFunc: 'sum' }, // plain column, no showValuesAs
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal' },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25, units: 4 },
                { id: '2', country: 'B', amount: 75, units: 6 },
            ],
        });

        await new GridColumns(api, 'bc2 sibling unaffected columns').checkColumns(`
            CENTER
            ├── country "Country" width:200
            ├── units "Units" width:200 aggFunc:sum
            └── amount "Amount" width:200 aggFunc:sum %:percentOfGrandTotal
        `);
        await new GridRows(api, 'bc2 sibling unaffected').check(`
            ROOT id:ROOT_NODE_ID units:10 amount:"100.00%"
            ├── LEAF id:1 country:"A" units:4 amount:"25.00%"
            └── LEAF id:2 country:"B" units:6 amount:"75.00%"
        `);

        // The plain column returns its raw value through every read path — the default `from`, 'data', and
        // even an explicit 'transformed' (it has no mode, so 'transformed' falls back to raw).
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'units' })).toBe(4);
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'units', from: 'data' })).toBe(4);
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'units', transformValues: true })).toBe(4);
    });

    test('BC4 — a custom comparator receives the RAW value, not the transformed value (sort stays on raw in P1)', async () => {
        const seen: unknown[] = [];
        const api = gridsManager.createGrid('bc4', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValuesAs: 'percentOfGrandTotal',
                    comparator: (a, b) => {
                        seen.push(a, b);
                        return (a as number) - (b as number);
                    },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 }, // grand total 100 → transformed 0.25 / 0.75
            ],
        });

        api.applyColumnState({ state: [{ colId: 'amount', sort: 'asc' }] });

        await new GridColumns(api, 'bc4 after sort asc columns').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 sort:asc aggFunc:sum %:percentOfGrandTotal
        `);
        await new GridRows(api, 'bc4 after sort asc').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├── LEAF id:1 country:"A" amount:"25.00%"
            └── LEAF id:2 country:"B" amount:"75.00%"
        `);

        // The comparator saw the raw amounts, never the transformed fractions.
        expect(seen).toContain(25);
        expect(seen).toContain(75);
        expect(seen).not.toContain(0.25);
        expect(seen).not.toContain(0.75);
    });

    test('BC5 — switching mode via applyColumnState does not re-aggregate and leaves sort order unchanged', async () => {
        let aggCalls = 0;
        const countingSum: IAggFunc = (params) => {
            aggCalls += 1;
            let sum = 0;
            for (const value of params.values ?? []) {
                sum += (value as number) ?? 0;
            }
            return sum;
        };

        const api = gridsManager.createGrid('bc5', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: countingSum, showValuesAs: 'percentOfGrandTotal' },
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 30 },
                { id: '2', country: 'A', amount: 10 },
                { id: '3', country: 'B', amount: 60 },
            ],
        });

        api.applyColumnState({ state: [{ colId: 'amount', sort: 'desc' }] });

        await new GridColumns(api, 'bc5 after sort desc columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── amount "Amount" width:200 sort:desc aggFunc:custom %:percentOfGrandTotal
        `);
        await new GridRows(api, 'bc5 after sort desc').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" amount:"60.00%"
            │ └── LEAF id:3 country:"B" amount:"60.00%"
            └─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"40.00%"
            · ├── LEAF id:1 country:"A" amount:"30.00%"
            · └── LEAF id:2 country:"A" amount:"10.00%"
        `);

        const callsBefore = aggCalls;
        const orderBefore = displayedIds(api);
        expect(callsBefore).toBeGreaterThan(0);
        // top groups vs grand total: A=40/100, B=60/100
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', transformValues: true })).toBeCloseTo(0.3);

        // Switch the mode: a redraw only — no re-aggregation, no re-sort.
        api.applyColumnState({ state: [{ colId: 'amount', showValuesAs: 'percentOfParentRowTotal' }] });
        api.refreshCells({ force: true }); // mode switch updates the model; force a repaint to read the new painted values

        await new GridColumns(api, 'bc5 after mode switch').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── amount "Amount" width:200 sort:desc aggFunc:custom %:percentOfParentRowTotal
        `);
        await new GridRows(api, 'bc5 after mode switch').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" amount:"60.00%"
            │ └── LEAF id:3 country:"B" amount:"100.00%"
            └─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"40.00%"
            · ├── LEAF id:1 country:"A" amount:"75.00%"
            · └── LEAF id:2 country:"A" amount:"25.00%"
        `);

        expect(aggCalls).toBe(callsBefore); // the counting aggFunc was not invoked again
        expect(displayedIds(api)).toEqual(orderBefore); // row order is unchanged
        // …but the painted value reflects the new mode: leaf 1 is now 30/40 of its parent group.
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', transformValues: true })).toBeCloseTo(
            0.75
        );
    });

    test('T3 — percentOfGrandTotal with avg is cellAvg ÷ grandAvg (documented Excel-aligned semantics)', async () => {
        const api = gridsManager.createGrid('t3-avg', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: 'avg', showValuesAs: 'percentOfGrandTotal' },
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 10 },
                { id: '2', country: 'A', amount: 30 },
                { id: '3', country: 'B', amount: 20 },
            ],
        });

        await new GridColumns(api, 't3 avg semantics columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── amount "Amount" width:200 aggFunc:avg %:percentOfGrandTotal
        `);
        await new GridRows(api, 't3 avg semantics').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"100.00%"
            │ ├── LEAF id:1 country:"A" amount:"50.00%"
            │ └── LEAF id:2 country:"A" amount:"150.00%"
            └─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" amount:"100.00%"
            · └── LEAF id:3 country:"B" amount:"100.00%"
        `);

        // grand avg (root) = (10+30+20)/3 = 20; group A avg = 20. The transform divides averages, not sums.
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', transformValues: true })).toBeCloseTo(0.5); // 10/20
        expect(api.getCellValue({ rowNode: leaf(api, '2'), colKey: 'amount', transformValues: true })).toBeCloseTo(1.5); // 30/20
    });

    test('an out-of-range precision is clamped, never throwing a RangeError from the formatter', async () => {
        const api = gridsManager.createGrid('sva-precision-clamp', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValuesAs: 'percentOfGrandTotal',
                    // `toFixed(-5)` would throw; the formatter clamps to 0 decimals instead.
                    showValuesAsDef: { precision: -5 },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ],
        });

        // Negative precision clamps to 0 decimals; the cell renders without throwing.
        await new GridRows(api, 'precision clamped to zero').check(`
            ROOT id:ROOT_NODE_ID amount:"100%"
            ├── LEAF id:1 country:"A" amount:"25%"
            └── LEAF id:2 country:"B" amount:"75%"
        `);
        expect(
            api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', useFormatter: true, transformValues: true })
        ).toBe('25%');

        // A precision beyond `toFixed`'s 100-digit ceiling clamps to 100 rather than throwing.
        api.applyColumnState({
            state: [{ colId: 'amount', showValuesAs: { type: 'percentOfGrandTotal', precision: 500 } }],
        });
        expect(
            api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', useFormatter: true, transformValues: true })
        ).toMatch(/^25\.0+%$/);
    });

    test('a zero denominator blanks the cell instead of producing Infinity or NaN', async () => {
        const api = gridsManager.createGrid('sva-zero-denominator', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal' },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                // A grand total of 0 makes the denominator zero — the ratio guards against the division.
                { id: '1', country: 'A', amount: 0 },
                { id: '2', country: 'B', amount: 0 },
            ],
        });

        // A zero denominator yields no value (not Infinity/NaN) → the transform returns null and the formatter renders ''.
        expect(transformed(api, '1', 'amount')).toBeNull();
        expect(
            api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', useFormatter: true, transformValues: true })
        ).toBe('');
    });
});

/** Raw transformed value (no formatter) for a cell. */
function transformed(api: GridApi, id: string, colKey: string): any {
    return api.getCellValue({ rowNode: leaf(api, id), colKey, transformValues: true });
}
