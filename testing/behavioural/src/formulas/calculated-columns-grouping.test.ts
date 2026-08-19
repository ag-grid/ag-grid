import { waitFor } from '@testing-library/dom';
import { GridColumns, GridRows, applyTransactionChecked, waitForEvent } from 'ag-test-utils';
import { vi } from 'vitest';

import type { GridOptions } from 'ag-grid-community';

import {
    addCalculatedColumnDef,
    createGrid,
    gridRowsOpts,
    setupCalculatedColumnsSuite,
    waitForFirstRow,
} from './calculatedColumnsHarness';

describe('ag-grid calculated columns', () => {
    setupCalculatedColumnsSuite();

    test('calculated columns stay blank on row group rows; leaf rows evaluate', async () => {
        const api = createGrid('calculated-row-groups', {
            rowData: [
                { id: 'r1', region: 'EMEA', revenue: 10, cost: 3 },
                { id: 'r2', region: 'EMEA', revenue: 20, cost: 8 },
                { id: 'r3', region: 'APAC', revenue: 15, cost: 5 },
            ],
            columnDefs: [
                { field: 'region', rowGroup: true, hide: true },
                { field: 'revenue', aggFunc: 'sum' },
                { field: 'cost', aggFunc: 'sum' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
                { colId: 'doubleProfit', calculatedExpression: '[profit] * 2', cellDataType: 'number' },
            ],
            groupDefaultExpanded: -1,
        });
        await new GridColumns(api, `calculated columns blank on row group rows setup`).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── revenue "Revenue" width:200 aggFunc:sum
            ├── cost "Cost" width:200 aggFunc:sum
            ├── profit width:200 ƒ
            └── doubleProfit width:200 ƒ
        `);
        // Group rows have no data of their own, so calc cols stay blank; leaf rows evaluate from their data.
        await new GridRows(api, `calculated columns blank on row group rows`).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-region-EMEA ag-Grid-AutoColumn:"EMEA" revenue:30 cost:11
            │ ├── LEAF id:r1 region:"EMEA" revenue:10 cost:3 profit:7 doubleProfit:14
            │ └── LEAF id:r2 region:"EMEA" revenue:20 cost:8 profit:12 doubleProfit:24
            └─┬ LEAF_GROUP id:row-group-region-APAC ag-Grid-AutoColumn:"APAC" revenue:15 cost:5
            · └── LEAF id:r3 region:"APAC" revenue:15 cost:5 profit:10 doubleProfit:20
        `);

        const emeaGroup = api.getRowNode('row-group-region-EMEA')!;
        expect(emeaGroup.group).toBe(true);
        await waitFor(() =>
            expect(api.getCellValue({ rowNode: emeaGroup, colKey: 'profit', useFormatter: false })).toBeUndefined()
        );
        expect(api.getCellValue({ rowNode: emeaGroup, colKey: 'doubleProfit', useFormatter: false })).toBeUndefined();
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit', useFormatter: false })).toBe(7);
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'doubleProfit', useFormatter: false })).toBe(
            14
        );

        // A transaction updates the leaf's own calculated values; the group stays blank.
        applyTransactionChecked(api, { update: [{ id: 'r1', region: 'EMEA', revenue: 100, cost: 3 }] });

        await waitFor(() =>
            expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit', useFormatter: false })).toBe(97)
        );
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'doubleProfit', useFormatter: false })).toBe(
            194
        );
        expect(api.getCellValue({ rowNode: emeaGroup, colKey: 'profit', useFormatter: false })).toBeUndefined();
    });

    test('calculated columns stay blank on row groups without aggregate source values while leaf rows still evaluate', async () => {
        const api = createGrid('calculated-row-groups-no-aggregates', {
            rowData: [
                { id: 'r1', productType: 'A', product: 'Solar panel kit', revenue: 142000, cost: 96000 },
                { id: 'r2', productType: 'A', product: 'Smart thermostat', revenue: 78000, cost: 52000 },
                { id: 'r3', productType: 'B', product: 'Battery pack', revenue: 126000, cost: 101000 },
            ],
            columnDefs: [
                { field: 'productType', rowGroup: true, hide: true },
                { field: 'product' },
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
            ],
        });

        const groupA = api.getRowNode('row-group-productType-A')!;
        expect(groupA.group).toBe(true);
        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(2));
        expect(api.getCellValue({ rowNode: groupA, colKey: 'profit', useFormatter: false })).toBeUndefined();

        groupA.setExpanded(true, undefined, true);

        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(4));
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit', useFormatter: false })).toBe(46000);
        expect(api.getCellValue({ rowNode: api.getRowNode('r2')!, colKey: 'profit', useFormatter: false })).toBe(26000);
    });

    test('calculated columns with an aggFunc aggregate their per-leaf results (aggregate-after)', async () => {
        const api = createGrid('calculated-row-groups-aggfunc', {
            rowData: [
                { id: 'r1', region: 'EMEA', revenue: 10, cost: 3 },
                { id: 'r2', region: 'EMEA', revenue: 20, cost: 8 },
                { id: 'r3', region: 'APAC', revenue: 15, cost: 5 },
            ],
            columnDefs: [
                { field: 'region', rowGroup: true, hide: true },
                { field: 'revenue', aggFunc: 'sum' },
                { field: 'cost', aggFunc: 'sum' },
                // No aggFunc: the group stays blank (it has no data of its own); leaves still evaluate.
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
                // With aggFunc: the per-leaf profit is aggregated on the group (aggregate-after).
                {
                    colId: 'maxProfit',
                    calculatedExpression: '[revenue] - [cost]',
                    aggFunc: 'max',
                    cellDataType: 'number',
                },
            ],
            groupDefaultExpanded: -1,
        });
        await new GridColumns(api, `calculated columns with an aggFunc setup`).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── revenue "Revenue" width:200 aggFunc:sum
            ├── cost "Cost" width:200 aggFunc:sum
            ├── profit width:200 ƒ
            └── maxProfit width:200 aggFunc:max ƒ
        `);
        await new GridRows(api, `calculated columns with an aggFunc`).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-region-EMEA ag-Grid-AutoColumn:"EMEA" revenue:30 cost:11 maxProfit:12
            │ ├── LEAF id:r1 region:"EMEA" revenue:10 cost:3 profit:7 maxProfit:7
            │ └── LEAF id:r2 region:"EMEA" revenue:20 cost:8 profit:12 maxProfit:12
            └─┬ LEAF_GROUP id:row-group-region-APAC ag-Grid-AutoColumn:"APAC" revenue:15 cost:5 maxProfit:10
            · └── LEAF id:r3 region:"APAC" revenue:15 cost:5 profit:10 maxProfit:10
        `);

        const emeaGroup = api.getRowNode('row-group-region-EMEA')!;
        // No aggFunc: the group has no data of its own, so profit stays blank.
        expect(api.getCellValue({ rowNode: emeaGroup, colKey: 'profit', useFormatter: false })).toBeUndefined();
        // aggregate-after: max of the leaf profits = max(7, 12) = 12.
        expect(api.getCellValue({ rowNode: emeaGroup, colKey: 'maxProfit', useFormatter: false })).toBe(12);
        // Leaves evaluate the formula regardless of aggFunc.
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'maxProfit', useFormatter: false })).toBe(7);
        expect(api.getCellValue({ rowNode: api.getRowNode('r2')!, colKey: 'maxProfit', useFormatter: false })).toBe(12);
    });

    test('aggregate-after calculated columns aggregate across nested groups, footers and after transactions', async () => {
        const api = createGrid('calculated-aggfunc-nested', {
            rowData: [
                { id: 'r1', region: 'EMEA', country: 'UK', revenue: 10, cost: 3 },
                { id: 'r2', region: 'EMEA', country: 'UK', revenue: 20, cost: 8 },
                { id: 'r3', region: 'EMEA', country: 'DE', revenue: 15, cost: 5 },
                { id: 'r4', region: 'APAC', country: 'JP', revenue: 30, cost: 12 },
            ],
            columnDefs: [
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'revenue', aggFunc: 'sum' },
                { field: 'cost', aggFunc: 'sum' },
                {
                    colId: 'maxProfit',
                    calculatedExpression: '[revenue] - [cost]',
                    aggFunc: 'max',
                    cellDataType: 'number',
                },
            ],
            groupDefaultExpanded: -1,
            groupTotalRow: 'bottom',
            grandTotalRow: 'bottom',
        });

        // Leaf profits r1=7, r2=12, r3=10, r4=18. `max` bubbles up the group-total rows at every level
        // (agg-after); the totals are not the agg-first `sum(rev)-sum(cost)` (which would be 29/47).
        await new GridRows(api, `nested aggfunc group totals`, gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID revenue:75 cost:28 maxProfit:18
            ├─┬ filler id:row-group-region-EMEA ag-Grid-AutoColumn:"EMEA"
            │ ├─┬ LEAF_GROUP id:row-group-region-EMEA-country-UK ag-Grid-AutoColumn:"UK"
            │ │ ├── LEAF id:r1 region:"EMEA" country:"UK" revenue:10 cost:3 maxProfit:7
            │ │ ├── LEAF id:r2 region:"EMEA" country:"UK" revenue:20 cost:8 maxProfit:12
            │ │ └─ footer id:rowGroupFooter_row-group-region-EMEA-country-UK ag-Grid-AutoColumn:"UK" revenue:30 cost:11 maxProfit:12
            │ ├─┬ LEAF_GROUP id:row-group-region-EMEA-country-DE ag-Grid-AutoColumn:"DE"
            │ │ ├── LEAF id:r3 region:"EMEA" country:"DE" revenue:15 cost:5 maxProfit:10
            │ │ └─ footer id:rowGroupFooter_row-group-region-EMEA-country-DE ag-Grid-AutoColumn:"DE" revenue:15 cost:5 maxProfit:10
            │ └─ footer id:rowGroupFooter_row-group-region-EMEA ag-Grid-AutoColumn:"EMEA" revenue:45 cost:16 maxProfit:12
            ├─┬ filler id:row-group-region-APAC ag-Grid-AutoColumn:"APAC"
            │ ├─┬ LEAF_GROUP id:row-group-region-APAC-country-JP ag-Grid-AutoColumn:"JP"
            │ │ ├── LEAF id:r4 region:"APAC" country:"JP" revenue:30 cost:12 maxProfit:18
            │ │ └─ footer id:rowGroupFooter_row-group-region-APAC-country-JP ag-Grid-AutoColumn:"JP" revenue:30 cost:12 maxProfit:18
            │ └─ footer id:rowGroupFooter_row-group-region-APAC ag-Grid-AutoColumn:"APAC" revenue:30 cost:12 maxProfit:18
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:null revenue:75 cost:28 maxProfit:18
        `);

        // A transaction that re-aggregates must refresh the agg-after totals at every level:
        // UK profit max becomes 97, which bubbles up to the EMEA and grand totals.
        applyTransactionChecked(api, { update: [{ id: 'r1', region: 'EMEA', country: 'UK', revenue: 100, cost: 3 }] });

        const ukFooter = api.getRowNode('rowGroupFooter_row-group-region-EMEA-country-UK')!;
        const emeaFooter = api.getRowNode('rowGroupFooter_row-group-region-EMEA')!;
        const grandTotal = api.getRowNode('rowGroupFooter_ROOT_NODE_ID')!;
        await waitFor(() =>
            expect(api.getCellValue({ rowNode: ukFooter, colKey: 'maxProfit', useFormatter: false })).toBe(97)
        );
        expect(api.getCellValue({ rowNode: emeaFooter, colKey: 'maxProfit', useFormatter: false })).toBe(97);
        expect(api.getCellValue({ rowNode: grandTotal, colKey: 'maxProfit', useFormatter: false })).toBe(97);
    });

    test('aggregate-after calculated columns ride the standard pipeline (avg parity with a plain value column)', async () => {
        const api = createGrid('calculated-aggfunc-avg-parity', {
            rowData: [
                { id: 'r1', region: 'EMEA', revenue: 10, cost: 3, profitData: 7 },
                { id: 'r2', region: 'EMEA', revenue: 20, cost: 8, profitData: 12 },
            ],
            columnDefs: [
                { field: 'region', rowGroup: true, hide: true },
                { field: 'revenue' },
                { field: 'cost' },
                // Plain value column holding the same per-row profit, aggregated with avg.
                { field: 'profitData', aggFunc: 'avg' },
                // Calculated column computing the same profit, aggregated with avg.
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', aggFunc: 'avg', cellDataType: 'number' },
            ],
            groupDefaultExpanded: -1,
        });

        const emeaGroup = api.getRowNode('row-group-region-EMEA')!;
        const calc = await waitFor(() => {
            const value = api.getCellValue({ rowNode: emeaGroup, colKey: 'profit', useFormatter: false });
            expect(value).not.toBeUndefined();
            return value;
        });
        const plain = api.getCellValue({ rowNode: emeaGroup, colKey: 'profitData', useFormatter: false });
        // The calculated column's avg aggregation is identical to a plain value column's, wrapper and all.
        expect(calc).toEqual(plain);
        // The displayed value is the average of the leaf profits: (7 + 12) / 2 = 9.5.
        expect(`${calc}`).toBe('9.5');
    });

    test('a calculated column with an aggFunc matches a valueGetter value column on group rows', async () => {
        const api = createGrid('calculated-aggfunc-valuegetter-parity', {
            rowData: [
                { id: 'r1', country: 'US', gold: 1, silver: 2 },
                { id: 'r2', country: 'US', gold: 3, silver: 4 },
                { id: 'r3', country: 'UK', gold: 5, silver: 6 },
            ],
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'gold', aggFunc: 'sum' },
                { field: 'silver', aggFunc: 'sum' },
                {
                    colId: 'calc',
                    aggFunc: 'sum',
                    calculatedExpression: '[gold] + [silver]',
                    cellDataType: 'number',
                },
                {
                    colId: 'vg',
                    aggFunc: 'sum',
                    valueGetter: (p) => (p.data ? p.data.gold + p.data.silver : undefined),
                    cellDataType: 'number',
                },
            ],
            groupDefaultExpanded: -1,
        });

        // The calculated column aggregates its per-leaf (gold+silver) exactly like the valueGetter column.
        await new GridRows(api, 'calc aggFunc matches valueGetter', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-US ag-Grid-AutoColumn:"US" gold:4 silver:6 calc:10 vg:10
            │ ├── LEAF id:r1 country:"US" gold:1 silver:2 calc:3 vg:3
            │ └── LEAF id:r2 country:"US" gold:3 silver:4 calc:7 vg:7
            └─┬ LEAF_GROUP id:row-group-country-UK ag-Grid-AutoColumn:"UK" gold:5 silver:6 calc:11 vg:11
            · └── LEAF id:r3 country:"UK" gold:5 silver:6 calc:11 vg:11
        `);
    });

    test('calculated columns evaluate on tree data group rows that carry their own data', async () => {
        const api = createGrid('calculated-tree-data-parent', {
            treeData: true,
            treeDataChildrenField: 'children',
            rowData: [
                {
                    id: 'parent',
                    name: 'Parent',
                    revenue: 100,
                    cost: 40,
                    children: [{ id: 'child', name: 'Child', revenue: 30, cost: 10 }],
                },
            ],
            columnDefs: [
                { field: 'name' },
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
            ],
            groupDefaultExpanded: -1,
        });

        // No aggFunc: the parent group carries its own data, so it evaluates the formula from that data
        // (100 - 40 = 60), exactly as the revenue/cost cells show the parent's own values.
        await new GridRows(api, `tree data group with own data`, gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ parent GROUP id:parent ag-Grid-AutoColumn:"parent" name:"Parent" revenue:100 cost:40 profit:60
            · └── child LEAF id:child ag-Grid-AutoColumn:"child" name:"Child" revenue:30 cost:10 profit:20
        `);
    });

    test('calculated columns stay blank on tree data filler groups that carry no data', async () => {
        const api = createGrid('calculated-tree-data-filler', {
            treeData: true,
            getDataPath: (data) => data.path,
            rowData: [{ id: 'leaf', path: ['Dept', 'Team', 'Leaf'], revenue: 30, cost: 10 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
            ],
            groupDefaultExpanded: -1,
        });

        // Filler groups (Dept, Team) carry no data and have no aggData, so they stay blank; the leaf evaluates.
        await new GridRows(api, `tree data filler groups`, gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ Dept filler id:row-group-0-Dept ag-Grid-AutoColumn:"Dept"
            · └─┬ Team filler id:row-group-0-Dept-1-Team ag-Grid-AutoColumn:"Team"
            · · └── Leaf LEAF id:leaf ag-Grid-AutoColumn:"Leaf" revenue:30 cost:10 profit:20
        `);
    });

    test('aggregate-after calculated columns aggregate over tree data descendants', async () => {
        const api = createGrid('calculated-tree-data-aggfunc', {
            treeData: true,
            treeDataChildrenField: 'children',
            rowData: [
                {
                    id: 'parent',
                    name: 'Parent',
                    revenue: 100,
                    cost: 40,
                    children: [
                        { id: 'a', name: 'A', revenue: 30, cost: 10 },
                        { id: 'b', name: 'B', revenue: 50, cost: 15 },
                    ],
                },
            ],
            columnDefs: [
                { field: 'name' },
                { field: 'revenue', aggFunc: 'sum' },
                { field: 'cost', aggFunc: 'sum' },
                {
                    colId: 'maxProfit',
                    calculatedExpression: '[revenue] - [cost]',
                    aggFunc: 'max',
                    cellDataType: 'number',
                },
            ],
            groupDefaultExpanded: -1,
        });

        // With an aggFunc the parent aggregates its descendants (a, b), not its own data: revenue/cost
        // are the children's sums and maxProfit is max(20, 35) = 35 — identical to the plain value columns.
        await new GridRows(api, `tree data aggregate-after`, gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ parent GROUP id:parent ag-Grid-AutoColumn:"parent" name:"Parent" revenue:80 cost:25 maxProfit:35
            · ├── a LEAF id:a ag-Grid-AutoColumn:"a" name:"A" revenue:30 cost:10 maxProfit:20
            · └── b LEAF id:b ag-Grid-AutoColumn:"b" name:"B" revenue:50 cost:15 maxProfit:35
        `);
    });

    test('a calculated column without an aggFunc has no pivot result column and is absent from the pivot display', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            const api = createGrid('calculated-pivot-no-aggfunc', {
                pivotMode: true,
                rowData: [
                    { id: 'r1', country: 'US', year: 2020, revenue: 10, cost: 3 },
                    { id: 'r2', country: 'US', year: 2021, revenue: 20, cost: 8 },
                ],
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true },
                    { field: 'revenue', aggFunc: 'sum' },
                    { field: 'cost', aggFunc: 'sum' },
                    { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
                ],
                groupDefaultExpanded: -1,
            });

            // Without an aggFunc the calc column is a non-value primary column, so pivot produces no result
            // column for it — it is absent from the cross-tab, like any other non-value primary column.
            await new GridRows(api, `calc column without aggFunc under pivot`, gridRowsOpts).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_revenue:10 pivot_year_2020_cost:3 pivot_year_2021_revenue:20 pivot_year_2021_cost:8
                └─┬ LEAF_GROUP collapsed id:row-group-country-US ag-Grid-AutoColumn:"US" pivot_year_2020_revenue:10 pivot_year_2020_cost:3 pivot_year_2021_revenue:20 pivot_year_2021_cost:8
                · ├── LEAF hidden id:r1 pivot_year_2020_revenue:10 pivot_year_2020_cost:3 pivot_year_2021_revenue:10 pivot_year_2021_cost:3
                · └── LEAF hidden id:r2 pivot_year_2020_revenue:20 pivot_year_2020_cost:8 pivot_year_2021_revenue:20 pivot_year_2021_cost:8
            `);
            // It is a value-less calc column under pivot, not the blocked-formula case, so no warning fires.
            expect(warnSpy).not.toHaveBeenCalledWith(
                expect.stringContaining('warning #295'),
                expect.stringContaining('Column Pivoting'),
                expect.anything()
            );
        } finally {
            warnSpy.mockRestore();
        }
    });

    test('a calculated column with an aggFunc aggregates under pivot like a valueGetter value column', async () => {
        const api = createGrid('calculated-pivot-aggfunc', {
            pivotMode: true,
            rowData: [
                { id: 'r1', country: 'US', year: 2020, gold: 1, silver: 2 },
                { id: 'r2', country: 'US', year: 2021, gold: 3, silver: 4 },
            ],
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true },
                { field: 'gold', aggFunc: 'sum' },
                { field: 'silver', aggFunc: 'sum' },
                { colId: 'calc', aggFunc: 'sum', calculatedExpression: '[gold] + [silver]', cellDataType: 'number' },
                {
                    colId: 'vg',
                    aggFunc: 'sum',
                    valueGetter: (p) => (p.data ? p.data.gold + p.data.silver : undefined),
                    cellDataType: 'number',
                },
            ],
            groupDefaultExpanded: -1,
        });

        // Each pivot result column for the calculated column aggregates its per-leaf (gold+silver),
        // matching the valueGetter column under every year: calc == vg everywhere.
        await new GridRows(api, `calc aggFunc under pivot`, gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID pivot_year_2020_gold:1 pivot_year_2020_silver:2 pivot_year_2020_calc:3 pivot_year_2020_vg:3 pivot_year_2021_gold:3 pivot_year_2021_silver:4 pivot_year_2021_calc:7 pivot_year_2021_vg:7
            └─┬ LEAF_GROUP collapsed id:row-group-country-US ag-Grid-AutoColumn:"US" pivot_year_2020_gold:1 pivot_year_2020_silver:2 pivot_year_2020_calc:3 pivot_year_2020_vg:3 pivot_year_2021_gold:3 pivot_year_2021_silver:4 pivot_year_2021_calc:7 pivot_year_2021_vg:7
            · ├── LEAF hidden id:r1 pivot_year_2020_gold:1 pivot_year_2020_silver:2 pivot_year_2020_calc:3 pivot_year_2020_vg:3 pivot_year_2021_gold:1 pivot_year_2021_silver:2 pivot_year_2021_calc:3 pivot_year_2021_vg:3
            · └── LEAF hidden id:r2 pivot_year_2020_gold:3 pivot_year_2020_silver:4 pivot_year_2020_calc:7 pivot_year_2020_vg:7 pivot_year_2021_gold:3 pivot_year_2021_silver:4 pivot_year_2021_calc:7 pivot_year_2021_vg:7
        `);
    });

    test('calculated columns stay blank on group and grand total footer rows', async () => {
        const api = createGrid('calculated-row-group-footers', {
            rowData: [
                { id: 'r1', region: 'EMEA', revenue: 10, cost: 3 },
                { id: 'r2', region: 'EMEA', revenue: 20, cost: 8 },
                { id: 'r3', region: 'APAC', revenue: 15, cost: 5 },
            ],
            columnDefs: [
                { field: 'region', rowGroup: true, hide: true },
                { field: 'revenue', aggFunc: 'sum' },
                { field: 'cost', aggFunc: 'sum' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
            ],
            groupDefaultExpanded: -1,
            groupTotalRow: 'bottom',
            grandTotalRow: 'bottom',
        });

        const emeaFooter = api.getRowNode('rowGroupFooter_row-group-region-EMEA')!;
        const apacFooter = api.getRowNode('rowGroupFooter_row-group-region-APAC')!;
        const grandTotal = api.getRowNode('rowGroupFooter_ROOT_NODE_ID')!;

        // Footers and the grand total have no data of their own, so a no-aggFunc calc col stays blank.
        expect(emeaFooter).toBeTruthy();
        await waitFor(() =>
            expect(api.getCellValue({ rowNode: emeaFooter, colKey: 'profit', useFormatter: false })).toBeUndefined()
        );
        expect(apacFooter).toBeTruthy();
        expect(api.getCellValue({ rowNode: apacFooter, colKey: 'profit', useFormatter: false })).toBeUndefined();
        expect(grandTotal).toBeTruthy();
        expect(api.getCellValue({ rowNode: grandTotal, colKey: 'profit', useFormatter: false })).toBeUndefined();
    });

    test('aggregate-after calculated columns read aggData on group and grand-total footer rows', async () => {
        const api = createGrid('calculated-aggfunc-footers', {
            rowData: [
                { id: 'r1', region: 'EMEA', revenue: 10, cost: 3 },
                { id: 'r2', region: 'EMEA', revenue: 20, cost: 8 },
                { id: 'r3', region: 'APAC', revenue: 15, cost: 5 },
            ],
            columnDefs: [
                { field: 'region', rowGroup: true, hide: true },
                { field: 'revenue', aggFunc: 'sum' },
                { field: 'cost', aggFunc: 'sum' },
                {
                    colId: 'maxProfit',
                    calculatedExpression: '[revenue] - [cost]',
                    aggFunc: 'max',
                    cellDataType: 'number',
                },
            ],
            groupDefaultExpanded: -1,
            groupTotalRow: 'bottom',
            grandTotalRow: 'bottom',
        });

        // Footers/grand-total are group rows holding aggData, so agg-after reads the aggregated per-leaf
        // max on each (EMEA & grand = 12), not the agg-first sum(rev)-sum(cost).
        await new GridRows(api, 'aggfunc footers', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID revenue:45 cost:16 maxProfit:12
            ├─┬ LEAF_GROUP id:row-group-region-EMEA ag-Grid-AutoColumn:"EMEA"
            │ ├── LEAF id:r1 region:"EMEA" revenue:10 cost:3 maxProfit:7
            │ ├── LEAF id:r2 region:"EMEA" revenue:20 cost:8 maxProfit:12
            │ └─ footer id:rowGroupFooter_row-group-region-EMEA ag-Grid-AutoColumn:"EMEA" revenue:30 cost:11 maxProfit:12
            ├─┬ LEAF_GROUP id:row-group-region-APAC ag-Grid-AutoColumn:"APAC"
            │ ├── LEAF id:r3 region:"APAC" revenue:15 cost:5 maxProfit:10
            │ └─ footer id:rowGroupFooter_row-group-region-APAC ag-Grid-AutoColumn:"APAC" revenue:15 cost:5 maxProfit:10
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:null revenue:45 cost:16 maxProfit:12
        `);
    });

    test('aggregate-after calculated columns read aggData on a flat grid grand-total row', async () => {
        const api = createGrid('calculated-aggfunc-flat-grandtotal', {
            rowData: [
                { id: 'r1', revenue: 10, cost: 3 },
                { id: 'r2', revenue: 20, cost: 8 },
                { id: 'r3', revenue: 15, cost: 5 },
            ],
            columnDefs: [
                { field: 'revenue', aggFunc: 'sum' },
                { field: 'cost', aggFunc: 'sum' },
                {
                    colId: 'maxProfit',
                    calculatedExpression: '[revenue] - [cost]',
                    aggFunc: 'max',
                    cellDataType: 'number',
                },
            ],
            grandTotalRow: 'bottom',
        });

        // Even with no row grouping the grand-total row is a group row with aggData: agg-after reads
        // max(7,12,10)=12, not the agg-first sum(rev)-sum(cost)=45-16=29.
        await new GridRows(api, 'aggfunc flat grand total', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID revenue:45 cost:16 maxProfit:12
            ├── LEAF id:r1 revenue:10 cost:3 maxProfit:7
            ├── LEAF id:r2 revenue:20 cost:8 maxProfit:12
            ├── LEAF id:r3 revenue:15 cost:5 maxProfit:10
            └─ footer id:rowGroupFooter_ROOT_NODE_ID revenue:45 cost:16 maxProfit:12
        `);
    });

    test('grid api adds a calculated column while grouped and it evaluates on leaf rows', async () => {
        const api = createGrid('calculated-api-while-grouped', {
            rowData: [
                { id: 'r1', region: 'EMEA', revenue: 10, cost: 3 },
                { id: 'r2', region: 'EMEA', revenue: 20, cost: 8 },
                { id: 'r3', region: 'APAC', revenue: 15, cost: 5 },
            ],
            columnDefs: [
                { field: 'region', rowGroup: true, hide: true },
                { field: 'revenue', aggFunc: 'sum' },
                { field: 'cost', aggFunc: 'sum' },
            ],
            groupDefaultExpanded: -1,
        });

        const created = waitForEvent('calculatedColumnCreated', api);
        addCalculatedColumnDef(api, {
            colId: 'profit',
            calculatedExpression: '[revenue] - [cost]',
            cellDataType: 'number',
        });
        await created;

        const emeaGroup = api.getRowNode('row-group-region-EMEA')!;
        // The group row has no data of its own, so it stays blank; the leaf rows evaluate from their data.
        await waitFor(() =>
            expect(api.getCellValue({ rowNode: emeaGroup, colKey: 'profit', useFormatter: false })).toBeUndefined()
        );
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit', useFormatter: false })).toBe(7);
        expect(api.getCellValue({ rowNode: api.getRowNode('r3')!, colKey: 'profit', useFormatter: false })).toBe(10);
    });

    test.each([
        {
            name: 'server-side',
            options: (rowData: any[]): Partial<GridOptions> => ({
                rowModelType: 'serverSide',
                serverSideDatasource: {
                    getRows: (params: any) => {
                        params.success({
                            rowData: rowData.slice(params.request.startRow, params.request.endRow),
                            rowCount: rowData.length,
                        });
                    },
                },
            }),
        },
        {
            name: 'infinite',
            options: (rowData: any[]): Partial<GridOptions> => ({
                rowModelType: 'infinite',
                cacheBlockSize: rowData.length,
                datasource: {
                    getRows: (params: any) => {
                        params.successCallback(rowData.slice(params.startRow, params.endRow), rowData.length);
                    },
                },
            }),
        },
        {
            name: 'viewport',
            options: (rowData: any[]): Partial<GridOptions> => {
                let viewportParams: any;
                return {
                    rowModelType: 'viewport',
                    viewportRowModelPageSize: rowData.length,
                    viewportRowModelBufferSize: 0,
                    viewportDatasource: {
                        init: (params: any) => {
                            viewportParams = params;
                            params.setRowCount(rowData.length);
                        },
                        setViewportRange: (firstRow: number, lastRow: number) => {
                            const rows: Record<number, any> = {};
                            for (let rowIndex = firstRow; rowIndex <= lastRow; rowIndex++) {
                                rows[rowIndex] = rowData[rowIndex];
                            }
                            viewportParams.setRowData(rows);
                        },
                    },
                };
            },
        },
    ])('same-row calculated columns evaluate with the $name row model', async ({ name, options }) => {
        const rowData = [
            { id: 'r1', revenue: 10, cost: 3 },
            { id: 'r2', revenue: 20, cost: 8 },
        ];
        const api = createGrid(`calculated-${name}-row-model`, {
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', headerName: 'Profit', calculatedExpression: '[revenue] - [cost]' },
                {
                    colId: 'doubleProfit',
                    headerName: 'Double Profit',
                    calculatedExpression: '[profit] * 2',
                    cellDataType: 'number',
                },
            ],
            ...options(rowData),
        });

        await waitForFirstRow(api);

        const firstRow = api.getDisplayedRowAtIndex(0)!;
        expect(api.getCellValue({ rowNode: firstRow, colKey: 'profit', useFormatter: false })).toBe(7);
        expect(api.getCellValue({ rowNode: firstRow, colKey: 'doubleProfit', useFormatter: false })).toBe(14);

        firstRow.data.revenue = 15;
        expect(api.refreshFormulas()).toBe(true);
        expect(api.getCellValue({ rowNode: firstRow, colKey: 'profit', useFormatter: false })).toBe(12);
        expect(api.getCellValue({ rowNode: firstRow, colKey: 'doubleProfit', useFormatter: false })).toBe(24);
    });
});
