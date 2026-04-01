import type { MockInstance } from 'vitest';

import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ValidationModule } from 'ag-grid-community';

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
