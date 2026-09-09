import { ALL_SEVERITIES, GridColumns, GridRows, TestGridsManager, waitForMissingModuleReports } from 'ag-test-utils';
import type { MockInstance } from 'vitest';
import { vi } from 'vitest';

import { ClientSideRowModelModule, TextEditorModule, ValidationModule, enableDevValidations } from 'ag-grid-community';
import { FormulaModule } from 'ag-grid-enterprise';

import { createGrid, gridRowsOpts, setupCalculatedColumnsSuite } from './calculatedColumnsHarness';

describe('ag-grid calculated columns', () => {
    setupCalculatedColumnsSuite();

    test('unknown references, invalid syntax and cycles surface formula errors', async () => {
        const api = createGrid('calculated-errors', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'unknown', calculatedExpression: '[missing] + 1' },
                { colId: 'invalid', calculatedExpression: '[revenue] +' },
                { colId: 'cycleA', headerName: 'Cycle A', calculatedExpression: '[cycleB] + 1' },
                { colId: 'cycleB', headerName: 'Cycle B', calculatedExpression: '[cycleA] + 1' },
            ],
        });

        await new GridRows(api, 'calculated errors', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3 unknown:"#PARSE!" invalid:"#PARSE!" cycleA:"#CIRCREF!" cycleB:"#CIRCREF!"
        `);
    });

    test('validates CalculatedColumnsModule registration', async () => {
        // Suppress the diagnostics this deliberate misconfig raises (#200 module missing, #319 no
        // calculatedColumns option); any other diagnostic still throws.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [200, 319] });
        const validationGridsManager = new TestGridsManager({
            modules: [ClientSideRowModelModule, ValidationModule],
        });
        let consoleWarnSpy: MockInstance | undefined;
        let consoleErrorSpy: MockInstance | undefined;

        try {
            consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            validationGridsManager.createGrid('calculated-validation', {
                rowData: [{ revenue: 10, cost: 3 }],
                columnDefs: [
                    { field: 'revenue' },
                    { field: 'cost' },
                    { colId: 'profit', calculatedExpression: '[revenue] - [cost]' },
                ],
            });
            await waitForMissingModuleReports();

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('error #200'),
                expect.stringContaining('CalculatedColumnsModule'),
                expect.any(String)
            );
            // A colDef-level option is qualified with `colDef.` so it is clear where the option lives.
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('error #200'),
                expect.stringContaining('`colDef.calculatedExpression`'),
                expect.any(String)
            );

            validationGridsManager.createGrid('calculated-option-validation', {
                calculatedColumns: {
                    suppressColumnHighlighting: true,
                },
                rowData: [{ revenue: 10 }],
                columnDefs: [{ field: 'revenue' }],
            });
            await waitForMissingModuleReports();

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('error #200'),
                expect.stringContaining('CalculatedColumnsModule'),
                expect.any(String)
            );
            // A grid-level option stays unqualified (no `colDef.` prefix).
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('error #200'),
                expect.stringContaining('`calculatedColumns`'),
                expect.any(String)
            );

            const callsBeforeDisabledOption = consoleErrorSpy.mock.calls.length;
            validationGridsManager.createGrid('calculated-option-false-validation', {
                calculatedColumns: false,
                rowData: [{ revenue: 10 }],
                columnDefs: [{ field: 'revenue' }],
            });
            await waitForMissingModuleReports();
            expect(consoleErrorSpy.mock.calls).toHaveLength(callsBeforeDisabledOption);
        } finally {
            validationGridsManager.reset();
            consoleWarnSpy?.mockRestore();
            consoleErrorSpy?.mockRestore();
        }
    });

    test('calculated columns survive a getColumnDefs / createGrid roundtrip', async () => {
        const rowData = [
            { id: 'r1', revenue: 10, cost: 3 },
            { id: 'r2', revenue: 20, cost: 8 },
        ];
        const initialColumnDefs = [
            { field: 'revenue' },
            { field: 'cost' },
            { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' as const },
        ];
        const firstApi = createGrid('calculated-roundtrip-1', { rowData, columnDefs: initialColumnDefs });

        await new GridRows(firstApi, 'initial', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 revenue:10 cost:3 profit:7
            └── LEAF id:r2 revenue:20 cost:8 profit:12
        `);

        const persistedColumnDefs = firstApi.getColumnDefs();
        firstApi.destroy();

        const profitDef = persistedColumnDefs?.find(
            (def): def is { colId: string; calculatedExpression?: string } => 'colId' in def && def.colId === 'profit'
        );
        expect(profitDef?.calculatedExpression).toBe('[revenue] - [cost]');

        const secondApi = createGrid('calculated-roundtrip-2', { rowData, columnDefs: persistedColumnDefs! });
        await new GridRows(secondApi, 'restored', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 revenue:10 cost:3 profit:7
            └── LEAF id:r2 revenue:20 cost:8 profit:12
        `);
        await new GridColumns(secondApi, 'calculated columns survive a getColumnDefs / createGrid roundtrip')
            .checkColumns(`
                CENTER
                ├── revenue "Revenue" width:200
                ├── cost "Cost" width:200
                └── profit width:200 ƒ
            `);
    });

    // One case per conflicting option: the rule tests them as a disjunction, so a single `field` case stays
    // green when either of the other two arms is dropped.
    test.each([
        ['field', { field: 'revenue' }],
        ['valueGetter', { valueGetter: () => 1 }],
        ['valueSetter', { valueSetter: () => true }],
    ] as const)('warns when calculatedExpression is combined with %s', (option, conflictingColDef) => {
        // Suppress only the diagnostic this test asserts on; any other diagnostic still throws.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [322] });
        let consoleWarnSpy: MockInstance | undefined;
        try {
            consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            createGrid(`calculated-${option}-conflict`, {
                rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
                columnDefs: [
                    { field: 'revenue' },
                    { field: 'cost' },
                    { colId: 'profit', ...conflictingColDef, calculatedExpression: '[revenue] - [cost]' },
                ],
            });

            expect(
                consoleWarnSpy.mock.calls.some((c) =>
                    c
                        .join(' ')
                        .includes(
                            'colDef.calculatedExpression is used as the value source and should not be combined with field, valueGetter or valueSetter.'
                        )
                )
            ).toBe(true);
        } finally {
            consoleWarnSpy?.mockRestore();
        }
    });

    test('does not evaluate calculatedExpression with FormulaModule alone', async () => {
        // Suppress only the diagnostics this test asserts on; any other diagnostic still throws.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [200, 319] });
        const formulaOnlyGridsManager = new TestGridsManager({
            modules: [ClientSideRowModelModule, FormulaModule, TextEditorModule],
        });
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        try {
            const api = formulaOnlyGridsManager.createGrid('calculated-formula-module-only', {
                rowData: [{ revenue: 10, cost: 3, profit: 999 }],
                columnDefs: [
                    { field: 'revenue' },
                    { field: 'cost' },
                    {
                        field: 'profit',
                        calculatedExpression: '[revenue] - [cost]',
                        editable: true,
                        cellDataType: 'text',
                    },
                ],
            });

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const profitColumn = api.getColumn('profit')!;
            expect(api.getCellValue({ rowNode, colKey: 'profit', useFormatter: false })).toBe(999);
            expect(profitColumn.isCellEditable(rowNode)).toBe(true);
            expect(profitColumn.isSuppressPaste(rowNode)).toBe(false);

            await waitForMissingModuleReports();
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('error #200'),
                expect.stringContaining('CalculatedColumnsModule'),
                expect.any(String)
            );
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('warning #319'),
                expect.stringContaining(
                    '`colDef.calculatedExpression` requires `gridOptions.calculatedColumns` to be set to true or an options object.'
                ),
                expect.any(String)
            );
        } finally {
            formulaOnlyGridsManager.reset();
            consoleWarnSpy.mockRestore();
            consoleErrorSpy.mockRestore();
        }
    });
});
