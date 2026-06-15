import type { GridApi, IRowNode } from 'ag-grid-community';
import { ClientSideRowModelModule, ExternalFilterModule } from 'ag-grid-community';
import { RowGroupingModule, ShowValueAsModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager } from '../test-utils';

function leaf(api: GridApi, id: string): IRowNode {
    const node = api.getRowNode(id);
    if (!node) {
        throw new Error(`Leaf '${id}' not found`);
    }
    return node;
}

/** Raw transformed value (no formatter) for a cell. */
function transformed(api: GridApi, id: string, colKey: string): any {
    return api.getCellValue({ rowNode: leaf(api, id), colKey, from: 'transformed' });
}

describe('showValueAs built-in modes (base / difference)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, ShowValueAsModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    // amounts 10/30/60 → grand total 100.
    const rowData = [
        { id: '1', country: 'A', amount: 10, target: 100 },
        { id: '2', country: 'B', amount: 30, target: 100 },
        { id: '3', country: 'C', amount: 60, target: 100 },
    ];

    test('percentOf — base is another column', async () => {
        const api = gridsManager.createGrid('pct-of-col', {
            columnDefs: [
                { field: 'country' },
                { field: 'target', aggFunc: 'sum' },
                { field: 'amount', aggFunc: 'sum', showValueAs: { type: 'percentOf', params: { base: 'target' } } },
            ],
            getRowId: ({ data }) => data.id,
            rowData,
        });
        expect(transformed(api, '1', 'amount')).toBeCloseTo(0.1); // 10 / 100
        expect(transformed(api, '3', 'amount')).toBeCloseTo(0.6); // 60 / 100

        await new GridColumns(api, 'percentOf base column').checkColumns(`
            CENTER
            ├── country "Country" width:200
            ├── target "Target" width:200 aggFunc:sum
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOf
        `);
        await new GridRows(api, 'percentOf base column').check(`
            ROOT id:ROOT_NODE_ID target:300 amount:"33.33%"
            ├── LEAF id:1 country:"A" target:100 amount:"10.00%"
            ├── LEAF id:2 country:"B" target:100 amount:"30.00%"
            └── LEAF id:3 country:"C" target:100 amount:"60.00%"
        `);
    });

    test('a function mode override receives the built-in def, so it can wrap the original transform', async () => {
        const api = gridsManager.createGrid('wrap-builtin', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: 'percentOfGrandTotal',
                    showValueAsConfig: {
                        modes: {
                            // Wrap the built-in: double its percentage. `base` is the built-in def.
                            percentOfGrandTotal: (base) => ({
                                transform: (p) => {
                                    const pct = base?.transform?.(p);
                                    return pct == null ? null : Number(pct) * 2;
                                },
                            }),
                        },
                    },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData,
        });
        // amount 10 → 10% → doubled = 20%; 60 → 120%. The built-in's formatter is inherited.
        expect(transformed(api, '1', 'amount')).toBeCloseTo(0.2);
        expect(transformed(api, '3', 'amount')).toBeCloseTo(1.2);
    });

    test('a partial object override merges over the built-in mode — keeps its transform, replaces only the formatter', async () => {
        const api = gridsManager.createGrid('partial-override', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: 'percentOfGrandTotal',
                    showValueAsConfig: {
                        modes: {
                            // Override ONLY the formatter; the built-in transform must survive the merge.
                            percentOfGrandTotal: { formatter: (p) => `[${Math.round(Number(p.value) * 100)}]` },
                        },
                    },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData,
        });

        // Built-in transform still applies (10 / 100 = 0.1)...
        expect(transformed(api, '1', 'amount')).toBeCloseTo(0.1);
        // ...while the custom formatter renders the display value.
        await new GridRows(api, 'partial override formatter').check(`
            ROOT id:ROOT_NODE_ID amount:"[100]"
            ├── LEAF id:1 country:"A" amount:"[10]"
            ├── LEAF id:2 country:"B" amount:"[30]"
            └── LEAF id:3 country:"C" amount:"[60]"
        `);
    });

    test('overriding a built-in on one column does not leak into another column using the default', async () => {
        const api = gridsManager.createGrid('override-isolation', {
            columnDefs: [
                { field: 'country' },
                // Column A overrides percentOfGrandTotal's formatter only.
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: 'percentOfGrandTotal',
                    showValueAsConfig: {
                        modes: { percentOfGrandTotal: { formatter: (p) => `[${Math.round(Number(p.value) * 100)}]` } },
                    },
                },
                // Column B uses the default percentOfGrandTotal — the shared resolved built-in must be untouched.
                { field: 'target', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' },
            ],
            getRowId: ({ data }) => data.id,
            rowData, // amount 10/30/60 (total 100), target 100 each (total 300)
        });

        // Column A renders with its override; column B keeps the standard "%" formatter (no cross-column leak).
        await new GridRows(api, 'override isolation').check(`
            ROOT id:ROOT_NODE_ID amount:"[100]" target:"100.00%"
            ├── LEAF id:1 country:"A" amount:"[10]" target:"33.33%"
            ├── LEAF id:2 country:"B" amount:"[30]" target:"33.33%"
            └── LEAF id:3 country:"C" amount:"[60]" target:"33.33%"
        `);
        expect(
            api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', useFormatter: true, from: 'transformed' })
        ).toBe('[10]');
        expect(
            api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'target', useFormatter: true, from: 'transformed' })
        ).toBe('33.33%');
    });

    test('percentOf — base is a constant', async () => {
        const api = gridsManager.createGrid('pct-of-const', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: { type: 'percentOf', params: { base: { value: 200 } } },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData,
        });
        expect(transformed(api, '1', 'amount')).toBeCloseTo(0.05); // 10 / 200

        await new GridColumns(api, 'percentOf base const').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOf
        `);
        await new GridRows(api, 'percentOf base const').check(`
            ROOT id:ROOT_NODE_ID amount:"50.00%"
            ├── LEAF id:1 country:"A" amount:"5.00%"
            ├── LEAF id:2 country:"B" amount:"15.00%"
            └── LEAF id:3 country:"C" amount:"30.00%"
        `);
    });

    test('percentOf with no base is dormant → shows the raw value', async () => {
        const api = gridsManager.createGrid('pct-of-nobase', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOf' }, // no base provided
            ],
            getRowId: ({ data }) => data.id,
            rowData,
        });
        expect(transformed(api, '1', 'amount')).toBe(10); // raw, not transformed

        await new GridColumns(api, 'percentOf no base dormant').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOf
        `);
        await new GridRows(api, 'percentOf no base dormant').check(`
            ROOT id:ROOT_NODE_ID amount:100
            ├── LEAF id:1 country:"A" amount:10
            ├── LEAF id:2 country:"B" amount:30
            └── LEAF id:3 country:"C" amount:60
        `);
    });

    test('a base mode is ready from its def default params (not just the selector params)', async () => {
        const api = gridsManager.createGrid('ready-default-params', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: 'percentOf', // selected with no params...
                    showValueAsConfig: { modes: { percentOf: { params: { base: { value: 200 } } } } }, // ...default base
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData,
        });
        // The mode applies using its def default base (200) — not treated as awaiting input.
        expect(transformed(api, '1', 'amount')).toBeCloseTo(0.05); // 10 / 200
        expect(transformed(api, '3', 'amount')).toBeCloseTo(0.3); // 60 / 200
    });

    test('differenceFrom — value minus base', async () => {
        const api = gridsManager.createGrid('diff-from', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: { type: 'differenceFrom', params: { base: { value: 100 } } },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData,
        });
        expect(transformed(api, '1', 'amount')).toBe(-90); // 10 - 100
        expect(transformed(api, '3', 'amount')).toBe(-40); // 60 - 100

        await new GridColumns(api, 'differenceFrom const').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:differenceFrom
        `);
        await new GridRows(api, 'differenceFrom const').check(`
            ROOT id:ROOT_NODE_ID amount:0
            ├── LEAF id:1 country:"A" amount:-90
            ├── LEAF id:2 country:"B" amount:-70
            └── LEAF id:3 country:"C" amount:-40
        `);
    });

    test('percentDifferenceFrom — (value - base) / base', async () => {
        const api = gridsManager.createGrid('pct-diff-from', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: { type: 'percentDifferenceFrom', params: { base: { value: 100 } } },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData,
        });
        expect(transformed(api, '1', 'amount')).toBeCloseTo(-0.9); // (10-100)/100

        await new GridColumns(api, 'percentDifferenceFrom const').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentDifferenceFrom
        `);
        await new GridRows(api, 'percentDifferenceFrom const').check(`
            ROOT id:ROOT_NODE_ID amount:"0.00%"
            ├── LEAF id:1 country:"A" amount:"-90.00%"
            ├── LEAF id:2 country:"B" amount:"-70.00%"
            └── LEAF id:3 country:"C" amount:"-40.00%"
        `);
    });

    test('differenceFrom with baseItem (previous) — difference from the previous sibling in order', async () => {
        const api = gridsManager.createGrid('base-item-prev', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: { type: 'differenceFrom', params: { baseItem: '(previous)' } },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData, // display order 10, 30, 60
        });
        expect(transformed(api, '1', 'amount')).toBeNull(); // no previous sibling
        expect(transformed(api, '2', 'amount')).toBe(20); // 30 - 10
        expect(transformed(api, '3', 'amount')).toBe(30); // 60 - 30

        await new GridColumns(api, 'differenceFrom previous').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:differenceFrom
        `);
        await new GridRows(api, 'differenceFrom previous').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├── LEAF id:1 country:"A" amount:null
            ├── LEAF id:2 country:"B" amount:20
            └── LEAF id:3 country:"C" amount:30
        `);
    });

    test('a user can override a built-in mode by name, deep-merged (formatter overridden, transform kept)', async () => {
        const api = gridsManager.createGrid('override-builtin', {
            // Override only the formatter; the built-in percentOfGrandTotal transform is inherited.
            columnDefs: [
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: 'percentOfGrandTotal',
                    showValueAsConfig: {
                        modes: {
                            percentOfGrandTotal: { formatter: (p) => `${((p.value as number) * 100).toFixed(0)} pct` },
                        },
                    },
                },
                { field: 'country' },
            ],
            getRowId: ({ data }) => data.id,
            rowData,
        });
        // transform inherited from the built-in: 10 / 100 = 0.1
        expect(transformed(api, '1', 'amount')).toBeCloseTo(0.1);
        // formatter overridden:
        expect(
            api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', useFormatter: true, from: 'transformed' })
        ).toBe('10 pct');

        await new GridColumns(api, 'override builtin formatter').checkColumns(`
            CENTER
            ├── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfGrandTotal
            └── country "Country" width:200
        `);
        await new GridRows(api, 'override builtin formatter').check(`
            ROOT id:ROOT_NODE_ID amount:"100 pct"
            ├── LEAF id:1 amount:"10 pct" country:"A"
            ├── LEAF id:2 amount:"30 pct" country:"B"
            └── LEAF id:3 amount:"60 pct" country:"C"
        `);
    });

    test('percentOfParentRowTotal — relative to the row-axis parent group', async () => {
        const api = gridsManager.createGrid('parent-row-total', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfParentRowTotal' },
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 30 },
                { id: '2', country: 'A', amount: 10 },
                { id: '3', country: 'B', amount: 60 },
            ],
        });
        // leaves relative to their group A (total 40): 30/40, 10/40
        expect(transformed(api, '1', 'amount')).toBeCloseTo(0.75);
        expect(transformed(api, '2', 'amount')).toBeCloseTo(0.25);

        await new GridColumns(api, 'percentOfParentRowTotal').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfParentRowTotal
        `);
        await new GridRows(api, 'percentOfParentRowTotal').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"40.00%"
            │ ├── LEAF id:1 country:"A" amount:"75.00%"
            │ └── LEAF id:2 country:"A" amount:"25.00%"
            └─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" amount:"60.00%"
            · └── LEAF id:3 country:"B" amount:"100.00%"
        `);
    });

    test('a grid-wide custom mode + precision from defaultColDef apply to a column with no local config', async () => {
        const api = gridsManager.createGrid('sva-grid-wide-mode', {
            defaultColDef: {
                showValueAsConfig: {
                    precision: 4,
                    modes: {
                        triple: {
                            displayName: 'Triple',
                            transform: (p) => (p.rawValue == null ? null : Number(p.rawValue) * 3),
                        },
                    },
                },
            },
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValueAs: 'triple' }, // no local showValueAsConfig
            ],
            getRowId: ({ data }) => data.id,
            rowData,
        });

        // The custom mode resolved from defaultColDef and its transform runs (10 → 30, 60 → 180).
        expect(transformed(api, '1', 'amount')).toBe(30);
        expect(transformed(api, '3', 'amount')).toBe(180);

        // The resolved config exposes the grid-wide mode and the defaultColDef precision.
        const config = api.getColumn('amount')!.getShowValueAsConfig();
        expect(config?.modes['triple']).toBeTruthy();
        expect(config?.precision).toBe(4);
    });

    test('the edit/data sources read the raw value while the display source transforms; a change re-aggregates', async () => {
        const api = gridsManager.createGrid('sva-edit-raw', {
            columnDefs: [{ field: 'country' }, { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' }],
            getRowId: ({ data }) => data.id,
            // Own row data (not the shared `rowData`): this test mutates a row via setDataValue.
            rowData: [
                { id: '1', country: 'A', amount: 10 },
                { id: '2', country: 'B', amount: 30 },
                { id: '3', country: 'C', amount: 60 }, // grand total 100
            ],
        });

        const node1 = leaf(api, '1');
        // Display path → the percentage; edit + data paths → the raw value (what an editor sees and commits).
        expect(api.getCellValue({ rowNode: node1, colKey: 'amount', from: 'transformed' })).toBeCloseTo(0.1);
        expect(api.getCellValue({ rowNode: node1, colKey: 'amount', from: 'edit' })).toBe(10);
        expect(api.getCellValue({ rowNode: node1, colKey: 'amount', from: 'data' })).toBe(10);

        // Commit a new raw value → the grand total moves to 180 and the displayed percentages re-aggregate.
        node1.setDataValue('amount', 90);
        expect(api.getCellValue({ rowNode: node1, colKey: 'amount', from: 'edit' })).toBe(90);
        expect(api.getCellValue({ rowNode: node1, colKey: 'amount', from: 'transformed' })).toBeCloseTo(90 / 180);
        expect(transformed(api, '3', 'amount')).toBeCloseTo(60 / 180);
    });

    test('applyColumnState restoring a total mode promotes a non-aggregated column so its denominator exists', async () => {
        const api = gridsManager.createGrid('sva-state-promote', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount' }, // numeric, NO aggFunc, NO showValueAs
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 30 },
                { id: '2', country: 'A', amount: 10 },
                { id: '3', country: 'B', amount: 60 }, // grand 100
            ],
        });

        expect(api.getColumn('amount')!.isValueActive()).toBe(false);

        api.applyColumnState({ state: [{ colId: 'amount', showValueAs: 'percentOfGrandTotal' }] });

        // Promoted to a value column (default sum) so the grand-total denominator exists and percentages resolve.
        expect(api.getColumn('amount')!.isValueActive()).toBe(true);
        expect(transformed(api, '1', 'amount')).toBeCloseTo(0.3);
        await new GridRows(api, 'state restore promotes total mode').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"40.00%"
            │ ├── LEAF id:1 country:"A" amount:"30.00%"
            │ └── LEAF id:2 country:"A" amount:"10.00%"
            └─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" amount:"60.00%"
            · └── LEAF id:3 country:"B" amount:"60.00%"
        `);
    });

    test('defaultColDef precision, flags and grid-wide modes merge with a column that adds its own modes', async () => {
        const api = gridsManager.createGrid('sva-config-merge', {
            defaultColDef: {
                showValueAsConfig: {
                    precision: 3,
                    suppressHeaderIndicator: true,
                    modes: {
                        gridWide: {
                            displayName: 'Grid Wide',
                            transform: (p) => (p.rawValue == null ? null : Number(p.rawValue) + 1),
                        },
                    },
                },
            },
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: 'local',
                    // The column adds ONLY its own mode — the grid-wide precision / flag / mode must survive.
                    showValueAsConfig: {
                        modes: {
                            local: {
                                displayName: 'Local',
                                transform: (p) => (p.rawValue == null ? null : Number(p.rawValue) * 10),
                            },
                        },
                    },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData,
        });

        const config = api.getColumn('amount')!.getShowValueAsConfig();
        // Scalar config inherited from defaultColDef (not dropped by the column's local `modes` override).
        expect(config?.precision).toBe(3);
        expect(config?.suppressHeaderIndicator).toBe(true);
        // The grid-wide custom mode, the column-local mode AND the built-ins are all available (deep-merged).
        expect(config?.modes['gridWide']).toBeTruthy();
        expect(config?.modes['local']).toBeTruthy();
        expect(config?.modes['percentOfGrandTotal']).toBeTruthy();
        // The active local mode transforms (leaf 10 → 100).
        expect(transformed(api, '1', 'amount')).toBe(100);
    });

    test('after a runtime mode-to-mode switch, a data update still refreshes the column to the new mode', async () => {
        const api = gridsManager.createGrid('sva-mode-switch-then-update', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' },
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 10 },
                { id: '2', country: 'B', amount: 30 }, // grand 40
            ],
        });
        expect(transformed(api, '1', 'amount')).toBeCloseTo(10 / 40);

        // Switch from one active mode to another (no active↔inactive transition).
        api.applyColumnState({ state: [{ colId: 'amount', showValueAs: 'percentOfColumnTotal' }] });
        expect(transformed(api, '1', 'amount')).toBeCloseTo(10 / 40);

        // A data update triggers the model-update refresh sweep, which targets active-mode columns via the cache.
        api.applyTransaction({ update: [{ id: '1', country: 'A', amount: 70 }] }); // grand 100
        expect(transformed(api, '1', 'amount')).toBeCloseTo(70 / 100);
        expect(transformed(api, '2', 'amount')).toBeCloseTo(30 / 100);
    });

    // Reviewer finding (mode switch leaves stale applicability memo): switching to a mode with DIFFERENT
    // applicability recomputes dormancy — applyActive rebuilds the memo, so it is never stale across an
    // active-to-active switch. A flat grid: percentOfGrandTotal applies; the parent-hierarchy mode is dormant.
    test('switching to a mode with different applicability recomputes dormancy (no stale applicability memo)', async () => {
        const api = gridsManager.createGrid('sva-applicability-switch', {
            columnDefs: [{ field: 'country' }, { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' }],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 10 },
                { id: '2', country: 'B', amount: 30 }, // grand 40
            ],
        });
        // Applicable in a flat grid → the percentage.
        expect(transformed(api, '1', 'amount')).toBeCloseTo(10 / 40);
        // Switch to a parent-hierarchy mode: NOT applicable in a flat grid → dormant → the raw value is shown.
        api.applyColumnState({ state: [{ colId: 'amount', showValueAs: 'percentOfParentRowTotal' }] });
        expect(transformed(api, '1', 'amount')).toBe(10);
        // Switch back → applicable again → the percentage (memo recomputed both ways).
        api.applyColumnState({ state: [{ colId: 'amount', showValueAs: 'percentOfGrandTotal' }] });
        expect(transformed(api, '1', 'amount')).toBeCloseTo(10 / 40);
    });

    // Reviewer finding (bare mode name can't clear params): re-applying the SAME mode as a bare string must clear
    // params left by a prior object selection — otherwise restoring state leaves a stale comparison base active.
    test('applyColumnState with a bare mode name clears params left by a prior object selection', async () => {
        const api = gridsManager.createGrid('sva-state-clear-params', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: { type: 'percentOf', params: { base: { value: 200 } } },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData,
        });
        // With a base of 200, percentOf is ready and applies: 10 / 200.
        expect(transformed(api, '1', 'amount')).toBeCloseTo(0.05);

        // Re-apply the SAME mode as a bare name → params cleared → percentOf has no base → not ready → raw value.
        api.applyColumnState({ state: [{ colId: 'amount', showValueAs: 'percentOf' }] });
        expect(api.getColumn('amount')!.getShowValueAs()?.params).toBeUndefined();
        expect(transformed(api, '1', 'amount')).toBe(10); // raw aggregate (mode not ready without a base)
    });

    // Reviewer finding (removing showValueAsConfig leaves stale config): a colDef update that drops
    // showValueAsConfig (with no active mode) must clear the cached resolved config, not leave old custom modes.
    test('removing showValueAsConfig via a colDef update clears the stale resolved config', async () => {
        const api = gridsManager.createGrid('sva-remove-config', {
            columnDefs: [
                { field: 'country' },
                // A custom mode in config, but NO active selection.
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAsConfig: { modes: { custom: { displayName: 'Custom', transform: (p) => p.rawValue } } },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData,
        });
        expect(api.getColumn('amount')!.getShowValueAsConfig()?.modes['custom']).toBeTruthy();

        // Update the colDef to remove showValueAsConfig → the cached resolved config must be cleared.
        api.setGridOption('columnDefs', [{ field: 'country' }, { field: 'amount', aggFunc: 'sum' }]);
        expect(api.getColumn('amount')!.getShowValueAsConfig()).toBeNull();
    });
});

describe('showValueAs bigint support', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, ShowValueAsModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('differenceFrom preserves bigint precision (no float rounding)', async () => {
        const big = 9_000_000_000_000_000_100n; // beyond Number.MAX_SAFE_INTEGER
        const api = gridsManager.createGrid('bigint-diff', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    cellDataType: 'bigint',
                    aggFunc: 'sum',
                    showValueAs: { type: 'differenceFrom', params: { base: { value: 100n } } },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [{ id: '1', country: 'A', amount: big }],
        });
        const value = transformed(api, '1', 'amount');
        expect(typeof value).toBe('bigint');
        expect(value).toBe(big - 100n);

        await new GridColumns(api, 'bigint differenceFrom').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:differenceFrom
        `);
        await new GridRows(api, 'bigint differenceFrom').check(`
            ROOT id:ROOT_NODE_ID amount:"9000000000000000000n"
            └── LEAF id:1 country:"A" amount:"9000000000000000000n"
        `);
    });

    test('differenceFrom — bigint value with a NUMBER base constant coerces to a numeric difference (no BigInt mix error)', async () => {
        const api = gridsManager.createGrid('bigint-value-number-base', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    cellDataType: 'bigint',
                    aggFunc: 'sum',
                    showValueAs: { type: 'differenceFrom', params: { base: { value: 100 } } }, // number base
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [{ id: '1', country: 'A', amount: 500n }],
        });
        const value = transformed(api, '1', 'amount');
        // Mixed operands → numeric difference (not bigint), and crucially no "Cannot mix BigInt" throw.
        expect(typeof value).toBe('number');
        expect(value).toBe(400); // Number(500n) - 100
    });

    test('differenceFrom — NUMBER value with a bigint base constant coerces to a numeric difference (no BigInt mix error)', async () => {
        const api = gridsManager.createGrid('number-value-bigint-base', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: { type: 'differenceFrom', params: { base: { value: 100n } } }, // bigint base
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [{ id: '1', country: 'A', amount: 500 }], // plain number value
        });
        const value = transformed(api, '1', 'amount');
        expect(typeof value).toBe('number');
        expect(value).toBe(400); // 500 - Number(100n)
    });

    test('percentOfGrandTotal on a bigint column yields a numeric fraction', async () => {
        const api = gridsManager.createGrid('bigint-pct', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', cellDataType: 'bigint', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25n },
                { id: '2', country: 'B', amount: 75n },
            ],
        });
        const value = transformed(api, '1', 'amount');
        expect(typeof value).toBe('number');
        expect(value).toBeCloseTo(0.25); // 25 / 100

        await new GridColumns(api, 'bigint percentOfGrandTotal').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfGrandTotal
        `);
        await new GridRows(api, 'bigint percentOfGrandTotal').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├── LEAF id:1 country:"A" amount:"25.00%"
            └── LEAF id:2 country:"B" amount:"75.00%"
        `);
    });

    test('differenceFrom (previous) preserves bigint through the sibling lookup', async () => {
        const api = gridsManager.createGrid('bigint-prev', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    cellDataType: 'bigint',
                    aggFunc: 'sum',
                    showValueAs: { type: 'differenceFrom', params: { baseItem: '(previous)' } },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 10n },
                { id: '2', country: 'B', amount: 30n },
                { id: '3', country: 'C', amount: 60n },
            ],
        });
        expect(transformed(api, '2', 'amount')).toBe(20n); // 30n - 10n
        expect(transformed(api, '3', 'amount')).toBe(30n); // 60n - 30n

        await new GridColumns(api, 'bigint differenceFrom previous').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:differenceFrom
        `);
        await new GridRows(api, 'bigint differenceFrom previous').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├── LEAF id:1 country:"A" amount:null
            ├── LEAF id:2 country:"B" amount:"20n"
            └── LEAF id:3 country:"C" amount:"30n"
        `);
    });

    test('a custom mode can return a bigint, formatted via its bigint transformedDataType', async () => {
        const api = gridsManager.createGrid('bigint-custom', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    cellDataType: 'bigint',
                    aggFunc: 'sum',
                    showValueAs: 'doubled',
                    showValueAsConfig: {
                        modes: {
                            doubled: {
                                transform: (p) => (typeof p.rawValue === 'bigint' ? p.rawValue * 2n : null),
                                transformedDataType: 'bigint',
                            },
                        },
                    },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [{ id: '1', country: 'A', amount: 21n }],
        });
        expect(transformed(api, '1', 'amount')).toBe(42n);
        expect(
            api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', useFormatter: true, from: 'transformed' })
        ).toBe('42');

        await new GridColumns(api, 'bigint custom doubled').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:doubled
        `);
        await new GridRows(api, 'bigint custom doubled').check(`
            ROOT id:ROOT_NODE_ID amount:"42n"
            └── LEAF id:1 country:"A" amount:"42n"
        `);
    });

    test('a transform returning null renders a blank cell — the raw value is not shown through', async () => {
        const api = gridsManager.createGrid('null-transform', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: 'maybe',
                    showValueAsConfig: {
                        // null for amounts below 30 — those cells must be blank, never the raw value.
                        modes: {
                            maybe: {
                                transform: (p) => ((p.rawValue as number) >= 30 ? (p.rawValue as number) / 10 : null),
                            },
                        },
                    },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 10 },
                { id: '2', country: 'B', amount: 30 },
            ],
        });

        // Below-30 rows transform to null → the cell value is null (renders blank); the raw 10 is never shown.
        expect(transformed(api, '1', 'amount')).toBeNull();
        expect(transformed(api, '2', 'amount')).toBe(3);
        await new GridRows(api, 'null transform blanks the cell').check(`
            ROOT id:ROOT_NODE_ID amount:4
            ├── LEAF id:1 country:"A" amount:null
            └── LEAF id:2 country:"B" amount:3
        `);
    });

    test('a mode with no transform is a pass-through — shows the raw value, can still set a formatter', async () => {
        const api = gridsManager.createGrid('passthrough-mode', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: 'asLabel',
                    showValueAsConfig: {
                        // No transform → the raw (aggregated) value is shown; the mode's formatter still applies.
                        modes: { asLabel: { displayName: 'As Label', formatter: (p) => `#${p.value}` } },
                    },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 10 },
                { id: '2', country: 'B', amount: 30 },
            ],
        });

        // Identity: the transformed value is the raw aggregated value (40 at root, the leaf values below).
        expect(transformed(api, '1', 'amount')).toBe(10);
        await new GridRows(api, 'pass-through mode').check(`
            ROOT id:ROOT_NODE_ID amount:"#40"
            ├── LEAF id:1 country:"A" amount:"#10"
            └── LEAF id:2 country:"B" amount:"#30"
        `);
    });
});

describe('showValueAs base-mode adjacent-sibling lookup ((previous)/(next))', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, ShowValueAsModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('differenceFrom (next) compares against the next sibling; the last row has none', async () => {
        const api = gridsManager.createGrid('next-sibling', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: { type: 'differenceFrom', params: { baseItem: '(next)' } },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', amount: 10 },
                { id: '2', amount: 30 },
                { id: '3', amount: 60 },
            ],
        });
        expect(transformed(api, '1', 'amount')).toBe(-20); // 10 - 30
        expect(transformed(api, '2', 'amount')).toBe(-30); // 30 - 60
        expect(transformed(api, '3', 'amount')).toBeNull(); // no next sibling → blank

        await new GridRows(api, 'next sibling').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├── LEAF id:1 amount:-20
            ├── LEAF id:2 amount:-30
            └── LEAF id:3 amount:null
        `);
    });

    test('differenceFrom (previous) reflects an in-place edit (siblings are read fresh)', async () => {
        const api = gridsManager.createGrid('prev-edit', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: { type: 'differenceFrom', params: { baseItem: '(previous)' } },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', amount: 10 },
                { id: '2', amount: 30 },
                { id: '3', amount: 60 },
            ],
        });
        expect(transformed(api, '2', 'amount')).toBe(20); // 30 - 10

        await new GridColumns(api, 'prev edit').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:differenceFrom
        `);
        await new GridRows(api, 'prev before edit').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├── LEAF id:1 amount:null
            ├── LEAF id:2 amount:20
            └── LEAF id:3 amount:30
        `);

        leaf(api, '1').setDataValue('amount', 20);
        expect(transformed(api, '2', 'amount')).toBe(10); // 30 - 20
        expect(transformed(api, '3', 'amount')).toBe(30); // 60 - 30, unchanged

        // The in-place edit reshares the sibling showValueAs cells, so the rendered text matches the model.
        await new GridRows(api, 'prev after edit').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├── LEAF id:1 amount:null
            ├── LEAF id:2 amount:10
            └── LEAF id:3 amount:30
        `);
    });

    test('differenceFrom (previous) tracks the sort order (childIndex stays correct after a re-sort)', async () => {
        const api = gridsManager.createGrid('prev-sort', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: { type: 'differenceFrom', params: { baseItem: '(previous)' } },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', amount: 10 },
                { id: '2', amount: 30 },
                { id: '3', amount: 60 },
            ],
        });
        // display order 10, 30, 60 → diffs null, 20, 30
        expect(transformed(api, '2', 'amount')).toBe(20);

        await new GridRows(api, 'prev before sort').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├── LEAF id:1 amount:null
            ├── LEAF id:2 amount:20
            └── LEAF id:3 amount:30
        `);

        // sort amount desc → display order 60, 30, 10 → the "previous" sibling of each row changes
        api.applyColumnState({ state: [{ colId: 'amount', sort: 'desc' }] });
        expect(transformed(api, '3', 'amount')).toBeNull(); // 60 is now first
        expect(transformed(api, '2', 'amount')).toBe(-30); // 30 - 60
        expect(transformed(api, '1', 'amount')).toBe(-20); // 10 - 30

        await new GridColumns(api, 'prev after sort').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 sort:desc aggFunc:sum showValueAs:differenceFrom
        `);
        // The sort reorders the rows and the showValueAs cells repaint to match the new sibling order.
        await new GridRows(api, 'prev after sort').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├── LEAF id:3 amount:null
            ├── LEAF id:2 amount:-30
            └── LEAF id:1 amount:-20
        `);
    });
});

describe('showValueAs interaction with filtering', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ExternalFilterModule, RowGroupingModule, ShowValueAsModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    // Mirrors Excel: by default a filter recalculates the base, so % of parent is relative to the VISIBLE
    // total and the shown rows sum to 100%. `suppressAggFilteredOnly` keeps the all-rows base (Excel's
    // "Include Filtered Items in Totals").
    test('% of parent row total uses the filtered (visible) total by default', async () => {
        let filterOutId2 = false;
        const api = gridsManager.createGrid('sva-filter-default', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfParentRowTotal' },
            ],
            groupDefaultExpanded: -1,
            isExternalFilterPresent: () => filterOutId2,
            doesExternalFilterPass: (node) => node.data?.id !== '2',
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 30 },
                { id: '2', country: 'A', amount: 10 },
                { id: '3', country: 'B', amount: 60 },
            ],
        });
        // Group A total 40: 30/40 and 10/40.
        expect(transformed(api, '1', 'amount')).toBeCloseTo(0.75);
        expect(transformed(api, '2', 'amount')).toBeCloseTo(0.25);

        await new GridColumns(api, 'filter default parent total').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfParentRowTotal
        `);
        await new GridRows(api, 'filter default before filter').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"40.00%"
            │ ├── LEAF id:1 country:"A" amount:"75.00%"
            │ └── LEAF id:2 country:"A" amount:"25.00%"
            └─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" amount:"60.00%"
            · └── LEAF id:3 country:"B" amount:"100.00%"
        `);

        // Filter out id2 → group A total recalculates to 30 (visible only) → id1 is now 100% of its parent.
        filterOutId2 = true;
        api.onFilterChanged();
        expect(transformed(api, '1', 'amount')).toBeCloseTo(1);

        // The filter recalculates the base and repaints the surviving showValueAs cells to match.
        await new GridRows(api, 'filter default after filter out id2').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"33.33%"
            │ └── LEAF id:1 country:"A" amount:"100.00%"
            └─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" amount:"66.67%"
            · └── LEAF id:3 country:"B" amount:"100.00%"
        `);
    });

    test('suppressAggFilteredOnly keeps the all-rows base for % of parent row total (Excel "include filtered items")', async () => {
        let filterOutId2 = false;
        const api = gridsManager.createGrid('sva-filter-suppress', {
            suppressAggFilteredOnly: true,
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfParentRowTotal' },
            ],
            groupDefaultExpanded: -1,
            isExternalFilterPresent: () => filterOutId2,
            doesExternalFilterPass: (node) => node.data?.id !== '2',
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 30 },
                { id: '2', country: 'A', amount: 10 },
                { id: '3', country: 'B', amount: 60 },
            ],
        });
        expect(transformed(api, '1', 'amount')).toBeCloseTo(0.75);

        await new GridColumns(api, 'suppressAggFilteredOnly').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfParentRowTotal
        `);
        await new GridRows(api, 'suppress before filter').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"40.00%"
            │ ├── LEAF id:1 country:"A" amount:"75.00%"
            │ └── LEAF id:2 country:"A" amount:"25.00%"
            └─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" amount:"60.00%"
            · └── LEAF id:3 country:"B" amount:"100.00%"
        `);

        // Filter out id2 → base stays 40 (all rows) → id1 is still 30/40 = 0.75, not 1.
        filterOutId2 = true;
        api.onFilterChanged();
        expect(transformed(api, '1', 'amount')).toBeCloseTo(0.75);

        await new GridRows(api, 'suppress after filter out id2').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"40.00%"
            │ └── LEAF id:1 country:"A" amount:"75.00%"
            └─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" amount:"60.00%"
            · └── LEAF id:3 country:"B" amount:"100.00%"
        `);
    });

    test('percentOfGrandTotal denominator follows the filter, honouring suppressAggFilteredOnly', async () => {
        // Default: the grand total recalculates to the visible rows, so the shown rows renormalise to 100%.
        const filtered = gridsManager.createGrid('sva-grand-filtered', {
            columnDefs: [{ field: 'country' }, { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' }],
            isExternalFilterPresent: () => true,
            doesExternalFilterPass: (node) => node.data?.id !== '2',
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 30 },
                { id: '2', country: 'B', amount: 10 }, // filtered out
                { id: '3', country: 'C', amount: 60 },
            ],
        });
        // Grand total = visible only (30 + 60 = 90).
        expect(transformed(filtered, '1', 'amount')).toBeCloseTo(30 / 90);
        expect(transformed(filtered, '3', 'amount')).toBeCloseTo(60 / 90);

        // suppressAggFilteredOnly: the grand total keeps the all-rows base (100), so the percentages don't renormalise.
        const allRows = gridsManager.createGrid('sva-grand-allrows', {
            suppressAggFilteredOnly: true,
            columnDefs: [{ field: 'country' }, { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' }],
            isExternalFilterPresent: () => true,
            doesExternalFilterPass: (node) => node.data?.id !== '2',
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 30 },
                { id: '2', country: 'B', amount: 10 }, // filtered out
                { id: '3', country: 'C', amount: 60 },
            ],
        });
        // Grand total = all rows (30 + 10 + 60 = 100).
        expect(transformed(allRows, '1', 'amount')).toBeCloseTo(0.3);
        expect(transformed(allRows, '3', 'amount')).toBeCloseTo(0.6);
    });

    test('differenceFrom (previous) compares against the previous visible (filtered) row', async () => {
        let filterOutMiddle = false;
        const api = gridsManager.createGrid('sva-filter-prev', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: { type: 'differenceFrom', params: { baseItem: '(previous)' } },
                },
            ],
            isExternalFilterPresent: () => filterOutMiddle,
            doesExternalFilterPass: (node) => node.data?.id !== '2',
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', amount: 10 },
                { id: '2', amount: 30 },
                { id: '3', amount: 60 },
            ],
        });
        expect(transformed(api, '3', 'amount')).toBe(30); // 60 - 30

        await new GridColumns(api, 'filter previous').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:differenceFrom
        `);
        await new GridRows(api, 'previous before filter').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├── LEAF id:1 amount:null
            ├── LEAF id:2 amount:20
            └── LEAF id:3 amount:30
        `);

        // Filter out the middle row → id3's previous visible sibling is now id1: 60 - 10.
        filterOutMiddle = true;
        api.onFilterChanged();
        expect(transformed(api, '1', 'amount')).toBeNull();
        expect(transformed(api, '3', 'amount')).toBe(50);

        // Filtering out the middle row repaints id3's showValueAs cell to match its new previous sibling.
        await new GridRows(api, 'previous after filter out middle').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├── LEAF id:1 amount:null
            └── LEAF id:3 amount:50
        `);
    });

    // Group siblings come from `childrenAfterSort` (built from `childrenAfterAggFilter`), so an agg-filtered-out
    // group drops out of the prev/next chain — independent of `suppressAggFilteredOnly`, which changes only the
    // aggregated values, not which groups are siblings.
    test('differenceFrom (previous) on group aggregates tracks childrenAfterAggFilter when a group is filtered out', async () => {
        let filterOutB = false;
        const api = gridsManager.createGrid('sva-filter-prev-group', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: { type: 'differenceFrom', params: { baseItem: '(previous)' } },
                },
            ],
            groupDefaultExpanded: -1,
            isExternalFilterPresent: () => filterOutB,
            doesExternalFilterPass: (node) => node.data?.country !== 'B',
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 10 },
                { id: '2', country: 'B', amount: 30 },
                { id: '3', country: 'C', amount: 60 },
            ],
        });
        // Top-level groups A(10), B(30), C(60): each group's diff vs the previous group.
        await new GridColumns(api, 'filter previous group').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:differenceFrom
        `);
        await new GridRows(api, 'previous group before filter').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:null
            │ └── LEAF id:1 country:"A" amount:null
            ├─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" amount:20
            │ └── LEAF id:2 country:"B" amount:null
            └─┬ LEAF_GROUP id:row-group-country-C ag-Grid-AutoColumn:"C" amount:30
            · └── LEAF id:3 country:"C" amount:null
        `);

        // Filter out group B entirely → C's previous visible group is now A: 60 - 10.
        filterOutB = true;
        api.onFilterChanged();

        await new GridRows(api, 'previous group after filter out B').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:null
            │ └── LEAF id:1 country:"A" amount:null
            └─┬ LEAF_GROUP id:row-group-country-C ag-Grid-AutoColumn:"C" amount:50
            · └── LEAF id:3 country:"C" amount:null
        `);
    });
});
