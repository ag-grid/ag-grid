import type { MockInstance } from 'vitest';

import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ValidationModule } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager } from '../test-utils';

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
                expect.stringContaining('warning #307'),
                expect.stringContaining('Invalid `gridOptions` property `notARealOption`'),
                expect.any(String)
            );
        });

        test('includes docs URL after invalid property warning', () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [],
                rowData: [],
                ['notARealOption' as any]: true,
            });

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('warning #310'),
                expect.stringContaining('One or more `gridOptions` properties are not recognised.'),
                expect.any(String)
            );
        });

        test('warns for unknown colDef properties', () => {
            gridsManager.createGrid('myGrid', {
                defaultColDef: { cellDataType: false },
                columnDefs: [{ field: 'a', ['notAColProp' as any]: true }],
                rowData: [{ a: 1 }],
            });

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('warning #307'),
                expect.stringContaining('Invalid `colDef` property `notAColProp`'),
                expect.any(String)
            );
        });

        test('warns only once per property name across multiple calls', async () => {
            const api = gridsManager.createGrid('myGrid', {
                defaultColDef: { cellDataType: false },
                columnDefs: [{ field: 'a', ['fakeColProp' as any]: 1 }],
                rowData: [{ a: 1 }],
            });
            await new GridColumns(api, `warns only once per property name across multiple calls setup`).checkColumns(
                `
                    CENTER
                    └── a "A" width:200
                `
            );
            await new GridRows(api, `warns only once per property name across multiple calls setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:1
            `);

            const invalidPropWarnings = () =>
                consoleWarnSpy.mock.calls.filter((args) =>
                    args.join(' ').includes('Invalid `colDef` property `fakeColProp`')
                );

            expect(invalidPropWarnings()).toHaveLength(1);

            // Update colDefs with the same unknown property — should not warn again
            api.setGridOption('columnDefs', [{ field: 'a', ['fakeColProp' as any]: 2 }]);
            await new GridColumns(
                api,
                `warns only once per property name across multiple calls after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                └── a "A" width:200
            `);
            await new GridRows(
                api,
                `warns only once per property name across multiple calls after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:1
            `);

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
                args.join(' ').includes('Invalid `gridOptions` property `notARealOption`')
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
                args.join(' ').includes('One or more `gridOptions` properties are not recognised.')
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
                expect.stringContaining('warning #306'),
                expect.stringContaining('`suppressLoadingOverlay` is deprecated'),
                expect.any(String)
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
                expect.stringContaining('warning #306'),
                expect.stringContaining('`suppressLoadingOverlay` is deprecated'),
                expect.any(String)
            );
        });

        test('warns only once for same deprecated property', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [],
                rowData: [],
                suppressLoadingOverlay: true,
            } as GridOptions);
            await new GridColumns(api, `warns only once for same deprecated property setup`).checkColumns(``);
            await new GridRows(api, `warns only once for same deprecated property setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const deprecationWarnings = () =>
                consoleWarnSpy.mock.calls.filter((args) =>
                    args.join(' ').includes('`suppressLoadingOverlay` is deprecated')
                );

            expect(deprecationWarnings()).toHaveLength(1);

            // Re-process with same option — should not warn again
            api.updateGridOptions({ suppressLoadingOverlay: true } as GridOptions);

            expect(deprecationWarnings()).toHaveLength(1);
            await new GridRows(api, `warns only once for same deprecated property final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
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

        test('errors when rowSelection is used on client-side grid but RowSelectionModule is not registered, even when ServerSideRowModelModule is registered', () => {
            // Regression: ServerSideRowModelModule internally depends on SharedRowSelectionModule.
            // Before the fix, registering SSRM caused SharedRowSelectionModule to be stored under
            // 'all' row models, suppressing the validation error for client-side grids.
            mixedModulesGridsManager.createGrid('myGrid', {
                columnDefs: [],
                rowData: [],
                rowSelection: { mode: 'multiRow' },
            });

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('error #200'),
                expect.stringContaining('RowSelectionModule'),
                expect.any(String)
            );
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
                expect.stringContaining('warning #309'),
                expect.stringContaining('`serverSideInitialRowCount` is not supported with the `clientSide` row model'),
                expect.any(String)
            );
        });

        test('warns only once for same unsupported row model property', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [],
                rowData: [],
                serverSideInitialRowCount: 5,
            });
            await new GridColumns(api, `warns only once for same unsupported row model property setup`).checkColumns(
                ``
            );
            await new GridRows(api, `warns only once for same unsupported row model property setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const rowModelWarnings = () =>
                consoleWarnSpy.mock.calls.filter((args) =>
                    args.join(' ').includes('`serverSideInitialRowCount` is not supported')
                );

            expect(rowModelWarnings()).toHaveLength(1);

            api.updateGridOptions({ serverSideInitialRowCount: 10 } as any);

            expect(rowModelWarnings()).toHaveLength(1);
            await new GridRows(api, `warns only once for same unsupported row model property final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('does not warn when unsupported row model property has null value', () => {
            // Vue wrapper passes rowData: null even for serverSide row model grids
            gridsManager.createGrid('myGrid', {
                columnDefs: [],
                rowData: null as any,
                serverSideInitialRowCount: null as any,
            });

            const rowModelWarnings = consoleWarnSpy.mock.calls.filter((args) =>
                args.join(' ').includes('not supported with')
            );
            expect(rowModelWarnings).toHaveLength(0);
        });

        test('warns when unsupported row model property is later set to a real value', async () => {
            // Initially null (no warning), then updated to a real value (should warn)
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [],
                rowData: null as any,
                serverSideInitialRowCount: null as any,
            });
            await new GridColumns(
                api,
                `warns when unsupported row model property is later set to a real value setup`
            ).checkColumns(``);
            await new GridRows(api, `warns when unsupported row model property is later set to a real value setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);

            const rowModelWarnings = () =>
                consoleWarnSpy.mock.calls.filter((args) =>
                    args.join(' ').includes('`serverSideInitialRowCount` is not supported')
                );

            expect(rowModelWarnings()).toHaveLength(0);

            // Now set a real value — should produce a warning
            api.updateGridOptions({ serverSideInitialRowCount: 5 } as any);

            expect(rowModelWarnings()).toHaveLength(1);
            await new GridRows(
                api,
                `warns when unsupported row model property is later set to a real value final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
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

            const allWarnings = consoleWarnSpy.mock.calls.map((args) => args.join(' '));
            const serverSideWarnings = allWarnings.filter((w) => w.includes('serverSideInitialRowCount'));

            // Should only have the "not supported with row model" warning
            expect(serverSideWarnings).toHaveLength(1);
            expect(serverSideWarnings[0]).toContain('not supported with the `clientSide` row model');
        });
    });
});
