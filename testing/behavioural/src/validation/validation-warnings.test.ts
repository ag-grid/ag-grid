import type { MockInstance } from 'vitest';

import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ValidationModule } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../test-utils';

describe('ag-grid validation warnings', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ValidationModule],
    });
    let consoleWarnSpy: MockInstance;

    beforeEach(() => {
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        consoleWarnSpy.mockRestore();
    });

    describe('invalid property names', () => {
        test('warns for unknown gridOptions properties', () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [],
                rowData: [],
                ['notARealOption' as any]: true,
            });

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining("invalid gridOptions property 'notARealOption'")
            );
        });

        test('includes docs URL after invalid property warning', () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [],
                rowData: [],
                ['notARealOption' as any]: true,
            });

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('to see all the valid gridOptions properties please check:')
            );
        });

        test('warns for unknown colDef properties', () => {
            gridsManager.createGrid('myGrid', {
                defaultColDef: { cellDataType: false },
                columnDefs: [{ field: 'a', ['notAColProp' as any]: true }],
                rowData: [{ a: 1 }],
            });

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining("invalid colDef property 'notAColProp'")
            );
        });

        test('warns only once per property name across multiple calls', () => {
            const api = gridsManager.createGrid('myGrid', {
                defaultColDef: { cellDataType: false },
                columnDefs: [{ field: 'a', ['fakeColProp' as any]: 1 }],
                rowData: [{ a: 1 }],
            });

            const invalidPropWarnings = () =>
                consoleWarnSpy.mock.calls.filter((args) =>
                    String(args[0]).includes("invalid colDef property 'fakeColProp'")
                );

            expect(invalidPropWarnings()).toHaveLength(1);

            // Update colDefs with the same unknown property — should not warn again
            api.setGridOption('columnDefs', [{ field: 'a', ['fakeColProp' as any]: 2 }]);

            expect(invalidPropWarnings()).toHaveLength(1);
        });
    });

    describe('suppressPropertyNamesCheck', () => {
        test('suppresses invalid property name warnings', () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [],
                rowData: [],
                suppressPropertyNamesCheck: true,
                ['notARealOption' as any]: true,
            } as GridOptions);

            const invalidPropWarnings = consoleWarnSpy.mock.calls.filter((args) =>
                String(args[0]).includes("invalid gridOptions property 'notARealOption'")
            );
            expect(invalidPropWarnings).toHaveLength(0);
        });

        test('suppresses docs URL warning', () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [],
                rowData: [],
                suppressPropertyNamesCheck: true,
                ['notARealOption' as any]: true,
            } as GridOptions);

            const docsWarnings = consoleWarnSpy.mock.calls.filter((args) =>
                String(args[0]).includes('to see all the valid gridOptions properties please check:')
            );
            expect(docsWarnings).toHaveLength(0);
        });

        test('does not suppress deprecation warnings', () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [],
                rowData: [],
                suppressPropertyNamesCheck: true,
                suppressLoadingOverlay: true,
            } as GridOptions);

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('suppressLoadingOverlay is deprecated')
            );
        });
    });

    describe('deprecation warnings', () => {
        test('warns for deprecated gridOptions properties', () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [],
                rowData: [],
                suppressLoadingOverlay: true,
            } as GridOptions);

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('suppressLoadingOverlay is deprecated')
            );
        });

        test('warns only once for same deprecated property', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [],
                rowData: [],
                suppressLoadingOverlay: true,
            } as GridOptions);

            const deprecationWarnings = () =>
                consoleWarnSpy.mock.calls.filter((args) =>
                    String(args[0]).includes('suppressLoadingOverlay is deprecated')
                );

            expect(deprecationWarnings()).toHaveLength(1);

            // Re-process with same option — should not warn again
            api.updateGridOptions({ suppressLoadingOverlay: true } as GridOptions);

            expect(deprecationWarnings()).toHaveLength(1);
        });
    });

    describe('module validation with mixed row model registrations', () => {
        const mixedModulesGridsManager = new TestGridsManager({
            modules: [ClientSideRowModelModule, ServerSideRowModelModule, ValidationModule],
        });
        let consoleErrorSpy: MockInstance;

        beforeEach(() => {
            consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
            mixedModulesGridsManager.reset();
        });

        afterEach(() => {
            mixedModulesGridsManager.reset();
            consoleErrorSpy.mockRestore();
        });

        test('errors when rowSelection is used on client-side grid but RowSelectionModule is not registered, even when ServerSideRowModelModule is registered', async () => {
            // Regression: ServerSideRowModelModule internally depends on SharedRowSelectionModule.
            // Before the fix, registering SSRM caused SharedRowSelectionModule to be stored under
            // 'all' row models, suppressing the validation error for client-side grids.
            mixedModulesGridsManager.createGrid('myGrid', {
                columnDefs: [],
                rowData: [],
                rowSelection: { mode: 'multiRow' },
            });

            // Missing module errors are debounced (10ms) and flushed as a single message
            await new Promise<void>((resolve) => setTimeout(resolve, 15));

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('error #200'),
                expect.stringContaining('RowSelectionModule'),
                expect.any(String)
            );
        });
    });

    describe('missing module batching and dedup', () => {
        let consoleErrorSpy: MockInstance;

        beforeEach(() => {
            consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        });

        afterEach(() => {
            gridsManager.reset();
            consoleErrorSpy.mockRestore();
        });

        test('combines grid option and colDef missing modules into a single error', async () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'value', enableValue: true }],
                rowData: [{ value: 1 }],
                cellSelection: true,
            });

            await new Promise<void>((resolve) => setTimeout(resolve, 15));

            // Should produce exactly one error #200 call combining both sources
            const error200Calls = consoleErrorSpy.mock.calls.filter((args) => String(args[0]).includes('error #200'));
            expect(error200Calls).toHaveLength(1);

            const errorText = error200Calls[0].join(' ');
            // Grid option module (from cellSelection)
            expect(errorText).toContain('CellSelectionModule');
            // ColDef module (from enableValue → SharedAggregation resolves to these)
            expect(errorText).toContain('RowGroupingModule');
        });

        test('does not repeat missing module warnings for the same grid id', async () => {
            // Uses columnHoverHighlight to avoid overlap with other tests' flushed keys.
            // Explicit gridId so destroy + recreate shares the same dedup key.
            const api = gridsManager.createGrid('myGrid', {
                gridId: 'dedupGrid',
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 1 }],
                columnHoverHighlight: true,
            });

            await new Promise<void>((resolve) => setTimeout(resolve, 15));

            const firstFlushCalls = consoleErrorSpy.mock.calls.filter((args) => String(args[0]).includes('error #200'));
            expect(firstFlushCalls).toHaveLength(1);

            consoleErrorSpy.mockClear();

            // Destroy and recreate with the same gridId — should be suppressed
            api.destroy();
            gridsManager.createGrid('myGrid', {
                gridId: 'dedupGrid',
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 1 }],
                columnHoverHighlight: true,
            });

            await new Promise<void>((resolve) => setTimeout(resolve, 150));

            const secondFlushCalls = consoleErrorSpy.mock.calls.filter((args) =>
                String(args[0]).includes('error #200')
            );
            expect(secondFlushCalls).toHaveLength(0);
        });

        test('warns separately for different grid ids with the same missing module', async () => {
            gridsManager.createGrid('gridA', {
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 1 }],
                columnHoverHighlight: true,
            });

            await new Promise<void>((resolve) => setTimeout(resolve, 15));

            const firstFlushCalls = consoleErrorSpy.mock.calls.filter((args) => String(args[0]).includes('error #200'));
            expect(firstFlushCalls).toHaveLength(1);

            consoleErrorSpy.mockClear();

            // Different gridId with the same missing module — should warn again
            gridsManager.createGrid('gridB', {
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 1 }],
                columnHoverHighlight: true,
            });

            await new Promise<void>((resolve) => setTimeout(resolve, 15));

            const secondFlushCalls = consoleErrorSpy.mock.calls.filter((args) =>
                String(args[0]).includes('error #200')
            );
            expect(secondFlushCalls).toHaveLength(1);
        });

        test('partitions errors by grid context when two grids report in the same debounce window', async () => {
            // Create two grids simultaneously — both within the 10ms debounce window
            gridsManager.createGrid('ctxGridA', {
                gridId: 'ctxGridA',
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 1 }],
                cellSelection: true,
            });
            gridsManager.createGrid('ctxGridB', {
                gridId: 'ctxGridB',
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 1 }],
                cellSelection: true,
            });

            await new Promise<void>((resolve) => setTimeout(resolve, 15));

            const error200Calls = consoleErrorSpy.mock.calls.filter((args) => String(args[0]).includes('error #200'));

            // Should produce two separate errors — one per grid context
            expect(error200Calls).toHaveLength(2);

            const errorTextA = error200Calls[0].join(' ');
            const errorTextB = error200Calls[1].join(' ');

            // Each error should reference its own gridId, not the other's
            expect(errorTextA).toContain('ctxGridA');
            expect(errorTextA).not.toContain('ctxGridB');
            expect(errorTextB).toContain('ctxGridB');
            expect(errorTextB).not.toContain('ctxGridA');
        });
    });

    describe('unsupported row model warnings', () => {
        test('warns when gridOption is not supported by current row model', () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [],
                rowData: [],
                serverSideInitialRowCount: 5,
            });

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining("serverSideInitialRowCount is not supported with the 'clientSide' row model")
            );
        });

        test('warns only once for same unsupported row model property', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [],
                rowData: [],
                serverSideInitialRowCount: 5,
            });

            const rowModelWarnings = () =>
                consoleWarnSpy.mock.calls.filter((args) =>
                    String(args[0]).includes('serverSideInitialRowCount is not supported')
                );

            expect(rowModelWarnings()).toHaveLength(1);

            api.updateGridOptions({ serverSideInitialRowCount: 10 } as any);

            expect(rowModelWarnings()).toHaveLength(1);
        });

        test('does not warn when unsupported row model property has null value', () => {
            // Vue wrapper passes rowData: null even for serverSide row model grids
            gridsManager.createGrid('myGrid', {
                columnDefs: [],
                rowData: null as any,
                serverSideInitialRowCount: null as any,
            });

            const rowModelWarnings = consoleWarnSpy.mock.calls.filter((args) =>
                String(args[0]).includes('not supported with')
            );
            expect(rowModelWarnings).toHaveLength(0);
        });

        test('warns when unsupported row model property is later set to a real value', () => {
            // Initially null (no warning), then updated to a real value (should warn)
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [],
                rowData: null as any,
                serverSideInitialRowCount: null as any,
            });

            const rowModelWarnings = () =>
                consoleWarnSpy.mock.calls.filter((args) =>
                    String(args[0]).includes('serverSideInitialRowCount is not supported')
                );

            expect(rowModelWarnings()).toHaveLength(0);

            // Now set a real value — should produce a warning
            api.updateGridOptions({ serverSideInitialRowCount: 5 } as any);

            expect(rowModelWarnings()).toHaveLength(1);
        });

        test('skips value-level validation for unsupported row model properties', () => {
            // serverSideInitialRowCount has supportedRowModels: ['serverSide']
            // Setting it on clientSide should only produce the row model warning,
            // not any type/dependency validation warnings for the value itself.
            gridsManager.createGrid('myGrid', {
                columnDefs: [],
                rowData: [],
                serverSideInitialRowCount: 5,
            });

            const allWarnings = consoleWarnSpy.mock.calls.map((args) => String(args[0]));
            const serverSideWarnings = allWarnings.filter((w) => w.includes('serverSideInitialRowCount'));

            // Should only have the "not supported with row model" warning
            expect(serverSideWarnings).toHaveLength(1);
            expect(serverSideWarnings[0]).toContain("not supported with the 'clientSide' row model");
        });
    });
});
