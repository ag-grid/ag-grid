import { cleanup, render } from '@testing-library/react';
import React from 'react';

import type { GridApi, GridReadyEvent, Module } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CsvExportModule,
    ModuleRegistry,
    PaginationModule,
    TooltipModule,
    ValidationModule,
} from 'ag-grid-community';
import { AgGridContext, AgGridReact } from 'ag-grid-react';

async function renderGridWithModules(
    propsModules: Module[] | undefined,
    contextModules: Module[] | undefined
): Promise<{ api: GridApi }> {
    let readyResolve!: (api: GridApi) => void;
    const readyPromise = new Promise<GridApi>((resolve) => {
        readyResolve = resolve;
    });

    const gridElement = (
        <div style={{ width: 600, height: 400 }} data-testid="grid-wrapper">
            <AgGridReact
                columnDefs={[{ field: 'value' }]}
                rowData={[{ value: 'a' }]}
                modules={propsModules}
                onGridReady={(params: GridReadyEvent) => {
                    readyResolve(params.api);
                }}
            />
        </div>
    );

    render(
        contextModules !== undefined ? (
            <AgGridContext.Provider value={{ modules: contextModules as any }}>{gridElement}</AgGridContext.Provider>
        ) : (
            gridElement
        )
    );

    const api = await readyPromise;
    return { api };
}

describe('Module Registry compatible with React context', () => {
    beforeEach(() => {
        cleanup();
    });

    describe('Modules from AgGridContext', () => {
        test('grid receives modules from AgGridContext', async () => {
            const { api } = await renderGridWithModules(
                [ClientSideRowModelModule, ValidationModule],
                [PaginationModule]
            );

            // Grid should have pagination module from AgGridContext
            expect(api.isModuleRegistered('PaginationModule')).toBe(true);
            expect(api.isModuleRegistered('ClientSideRowModelModule')).toBe(true);
            expect(api.isModuleRegistered('ValidationModule')).toBe(true);
        });

        test('grid receives modules from props', async () => {
            const { api } = await renderGridWithModules(
                [ClientSideRowModelModule, ValidationModule, PaginationModule],
                undefined
            );

            // Grid should have pagination module from props
            expect(api.isModuleRegistered('PaginationModule')).toBe(true);
            expect(api.isModuleRegistered('ClientSideRowModelModule')).toBe(true);
        });

        test('grid combines modules from both props and AgGridContext', async () => {
            const { api } = await renderGridWithModules(
                [ClientSideRowModelModule, ValidationModule, PaginationModule],
                [TooltipModule, CsvExportModule]
            );

            // Grid should have modules from both props and context
            expect(api.isModuleRegistered('PaginationModule')).toBe(true);
            expect(api.isModuleRegistered('TooltipModule')).toBe(true);
            expect(api.isModuleRegistered('CsvExportModule')).toBe(true);
            expect(api.isModuleRegistered('ClientSideRowModelModule')).toBe(true);
        });

        test('grid works with modules only from AgGridContext (no props modules)', async () => {
            const { api } = await renderGridWithModules(undefined, [
                ClientSideRowModelModule,
                ValidationModule,
                PaginationModule,
            ]);

            // Grid should work with modules only from context
            expect(api.isModuleRegistered('PaginationModule')).toBe(true);
            expect(api.isModuleRegistered('ClientSideRowModelModule')).toBe(true);
            expect(api.isModuleRegistered('ValidationModule')).toBe(true);
        });

        test('empty AgGridContext modules does not break grid', async () => {
            const { api } = await renderGridWithModules(
                [ClientSideRowModelModule, ValidationModule, PaginationModule],
                []
            );

            // Grid should work normally with empty context modules
            expect(api.isModuleRegistered('PaginationModule')).toBe(true);
            expect(api.isModuleRegistered('ClientSideRowModelModule')).toBe(true);
        });
    });

    describe('Module priority and deduplication', () => {
        test('same module in both props and context does not cause issues', async () => {
            // Both props and context provide PaginationModule
            const { api } = await renderGridWithModules(
                [ClientSideRowModelModule, ValidationModule, PaginationModule],
                [PaginationModule, TooltipModule]
            );

            // Grid should work normally without duplicate module errors
            expect(api.isModuleRegistered('PaginationModule')).toBe(true);
            expect(api.isModuleRegistered('TooltipModule')).toBe(true);
        });

        test('modules from props and context are all registered', async () => {
            // This test verifies both sources contribute modules
            const { api } = await renderGridWithModules(
                [ClientSideRowModelModule, ValidationModule, PaginationModule],
                [TooltipModule, CsvExportModule]
            );

            // All modules should be registered
            expect(api.isModuleRegistered('ClientSideRowModelModule')).toBe(true);
            expect(api.isModuleRegistered('ValidationModule')).toBe(true);
            expect(api.isModuleRegistered('PaginationModule')).toBe(true);
            expect(api.isModuleRegistered('TooltipModule')).toBe(true);
            expect(api.isModuleRegistered('CsvExportModule')).toBe(true);
        });
    });

    describe('Nested AgGridContext providers', () => {
        async function renderNestedContextGrid(
            outerModules: Module[],
            innerModules: Module[],
            propsModules?: Module[]
        ): Promise<{ api: GridApi }> {
            let readyResolve!: (api: GridApi) => void;
            const readyPromise = new Promise<GridApi>((resolve) => {
                readyResolve = resolve;
            });

            render(
                <AgGridContext.Provider value={{ modules: outerModules as any }}>
                    <AgGridContext.Provider value={{ modules: innerModules as any }}>
                        <div style={{ width: 600, height: 400 }} data-testid="grid-wrapper">
                            <AgGridReact
                                columnDefs={[{ field: 'value' }]}
                                rowData={[{ value: 'a' }]}
                                modules={propsModules}
                                onGridReady={(params: GridReadyEvent) => {
                                    readyResolve(params.api);
                                }}
                            />
                        </div>
                    </AgGridContext.Provider>
                </AgGridContext.Provider>
            );

            const api = await readyPromise;
            return { api };
        }

        test('inner AgGridContext modules are used instead of outer AgGridContext modules', async () => {
            // Inner context completely replaces outer context (React context behavior)
            const { api } = await renderNestedContextGrid(
                [ClientSideRowModelModule, ValidationModule, CsvExportModule], // outer - has CsvExport
                [ClientSideRowModelModule, ValidationModule, TooltipModule] // inner - has Tooltip instead
            );

            // Inner context modules should be registered
            expect(api.isModuleRegistered('TooltipModule')).toBe(true);
            expect(api.isModuleRegistered('ClientSideRowModelModule')).toBe(true);
            // CsvExport from outer context should NOT be registered (inner context replaces outer)
            expect(api.isModuleRegistered('CsvExportModule')).toBe(false);
        });

        test('inner AgGridContext with pagination overrides outer without', async () => {
            const { api } = await renderNestedContextGrid(
                [ClientSideRowModelModule, ValidationModule, TooltipModule], // outer - no pagination
                [ClientSideRowModelModule, ValidationModule, PaginationModule] // inner - has pagination
            );

            // Should have pagination from inner context
            expect(api.isModuleRegistered('PaginationModule')).toBe(true);
            // Tooltip from outer context should NOT be registered
            expect(api.isModuleRegistered('TooltipModule')).toBe(false);
        });

        test('props modules combined with inner context modules', async () => {
            const { api } = await renderNestedContextGrid(
                [CsvExportModule], // outer - would provide CsvExport
                [ClientSideRowModelModule, ValidationModule, TooltipModule], // inner - core + tooltip
                [PaginationModule] // props - pagination
            );

            // Props modules should be registered
            expect(api.isModuleRegistered('PaginationModule')).toBe(true);
            // Inner context modules should be registered
            expect(api.isModuleRegistered('TooltipModule')).toBe(true);
            // Outer context modules should NOT be registered (replaced by inner)
            expect(api.isModuleRegistered('CsvExportModule')).toBe(false);
        });
    });

    describe('ModuleRegistry + AgGridContext compatibility', () => {
        test('grid receives modules from both ModuleRegistry and AgGridContext', async () => {
            // Register globally
            ModuleRegistry.registerModules([PaginationModule]);

            const { api } = await renderGridWithModules([ClientSideRowModelModule, ValidationModule], [TooltipModule]);

            // Should have pagination from global registry
            expect(api.isModuleRegistered('PaginationModule')).toBe(true);
            // Should have tooltip from AgGridContext
            expect(api.isModuleRegistered('TooltipModule')).toBe(true);
            // Should have core modules from props
            expect(api.isModuleRegistered('ClientSideRowModelModule')).toBe(true);
        });

        test('AgGridContext modules work alongside globally registered modules', async () => {
            ModuleRegistry.registerModules([ClientSideRowModelModule, ValidationModule]);

            const { api } = await renderGridWithModules(undefined, [PaginationModule, TooltipModule]);

            // Grid should have modules from both global registry and AgGridContext
            expect(api.isModuleRegistered('ClientSideRowModelModule')).toBe(true);
            expect(api.isModuleRegistered('PaginationModule')).toBe(true);
            expect(api.isModuleRegistered('TooltipModule')).toBe(true);
        });

        test('props modules, AgGridContext modules, and global modules all contribute', async () => {
            ModuleRegistry.registerModules([ClientSideRowModelModule, ValidationModule]);

            const { api } = await renderGridWithModules(
                [PaginationModule], // from props
                [TooltipModule, CsvExportModule] // from context
            );

            // Should have functionality from all three sources
            expect(api.isModuleRegistered('ClientSideRowModelModule')).toBe(true); // global
            expect(api.isModuleRegistered('PaginationModule')).toBe(true); // props
            expect(api.isModuleRegistered('TooltipModule')).toBe(true); // context
            expect(api.isModuleRegistered('CsvExportModule')).toBe(true); // context
        });
    });

    describe('Separate component branches with different AgGridContext', () => {
        async function renderTwoGridsWithSeparateContexts(
            branch1Modules: Module[],
            branch2Modules: Module[]
        ): Promise<{ api1: GridApi; api2: GridApi }> {
            let ready1Resolve!: (api: GridApi) => void;
            let ready2Resolve!: (api: GridApi) => void;
            const ready1Promise = new Promise<GridApi>((resolve) => {
                ready1Resolve = resolve;
            });
            const ready2Promise = new Promise<GridApi>((resolve) => {
                ready2Resolve = resolve;
            });

            render(
                <div>
                    {/* Branch 1 with its own AgGridContext */}
                    <AgGridContext.Provider value={{ modules: branch1Modules as any }}>
                        <div style={{ width: 600, height: 400 }} data-testid="grid-wrapper-1">
                            <AgGridReact
                                columnDefs={[{ field: 'value' }]}
                                rowData={[{ value: 'branch1' }]}
                                onGridReady={(params: GridReadyEvent) => {
                                    ready1Resolve(params.api);
                                }}
                            />
                        </div>
                    </AgGridContext.Provider>

                    {/* Branch 2 with its own AgGridContext */}
                    <AgGridContext.Provider value={{ modules: branch2Modules as any }}>
                        <div style={{ width: 600, height: 400 }} data-testid="grid-wrapper-2">
                            <AgGridReact
                                columnDefs={[{ field: 'value' }]}
                                rowData={[{ value: 'branch2' }]}
                                onGridReady={(params: GridReadyEvent) => {
                                    ready2Resolve(params.api);
                                }}
                            />
                        </div>
                    </AgGridContext.Provider>
                </div>
            );

            const [api1, api2] = await Promise.all([ready1Promise, ready2Promise]);
            return { api1, api2 };
        }

        test('two sibling branches can use completely different modules', async () => {
            const { api1, api2 } = await renderTwoGridsWithSeparateContexts(
                [ClientSideRowModelModule, ValidationModule, PaginationModule], // Branch 1: pagination
                [ClientSideRowModelModule, ValidationModule, TooltipModule] // Branch 2: tooltip
            );

            // Branch 1 should have pagination but not tooltip
            expect(api1.isModuleRegistered('PaginationModule')).toBe(true);
            expect(api1.isModuleRegistered('TooltipModule')).toBe(false);

            // Branch 2 should have tooltip but not pagination
            expect(api2.isModuleRegistered('TooltipModule')).toBe(true);
            expect(api2.isModuleRegistered('PaginationModule')).toBe(false);
        });

        test('two sibling branches can have overlapping modules with differences', async () => {
            const { api1, api2 } = await renderTwoGridsWithSeparateContexts(
                [ClientSideRowModelModule, ValidationModule, PaginationModule, CsvExportModule], // Branch 1
                [ClientSideRowModelModule, ValidationModule, PaginationModule, TooltipModule] // Branch 2
            );

            // Both branches should have common modules
            expect(api1.isModuleRegistered('PaginationModule')).toBe(true);
            expect(api2.isModuleRegistered('PaginationModule')).toBe(true);

            // Branch 1 should have CsvExport but not Tooltip
            expect(api1.isModuleRegistered('CsvExportModule')).toBe(true);
            expect(api1.isModuleRegistered('TooltipModule')).toBe(false);

            // Branch 2 should have Tooltip but not CsvExport
            expect(api2.isModuleRegistered('TooltipModule')).toBe(true);
            expect(api2.isModuleRegistered('CsvExportModule')).toBe(false);
        });

        test('changes to one branch context do not affect the other branch', async () => {
            // This test ensures isolation between the two contexts
            const { api1, api2 } = await renderTwoGridsWithSeparateContexts(
                [ClientSideRowModelModule, ValidationModule], // Branch 1: minimal modules
                [ClientSideRowModelModule, ValidationModule, PaginationModule, TooltipModule, CsvExportModule] // Branch 2: many modules
            );

            // Branch 1 should only have core modules
            expect(api1.isModuleRegistered('ClientSideRowModelModule')).toBe(true);
            expect(api1.isModuleRegistered('PaginationModule')).toBe(false);
            expect(api1.isModuleRegistered('TooltipModule')).toBe(false);
            expect(api1.isModuleRegistered('CsvExportModule')).toBe(false);

            // Branch 2 should have all its modules
            expect(api2.isModuleRegistered('ClientSideRowModelModule')).toBe(true);
            expect(api2.isModuleRegistered('PaginationModule')).toBe(true);
            expect(api2.isModuleRegistered('TooltipModule')).toBe(true);
            expect(api2.isModuleRegistered('CsvExportModule')).toBe(true);
        });

        test('multiple grids in same context share modules while different contexts are isolated', async () => {
            let ready1Resolve!: (api: GridApi) => void;
            let ready2Resolve!: (api: GridApi) => void;
            let ready3Resolve!: (api: GridApi) => void;
            const ready1Promise = new Promise<GridApi>((resolve) => {
                ready1Resolve = resolve;
            });
            const ready2Promise = new Promise<GridApi>((resolve) => {
                ready2Resolve = resolve;
            });
            const ready3Promise = new Promise<GridApi>((resolve) => {
                ready3Resolve = resolve;
            });

            render(
                <div>
                    {/* Branch 1 with two grids sharing the same context */}
                    <AgGridContext.Provider
                        value={{ modules: [ClientSideRowModelModule, ValidationModule, PaginationModule] as any }}
                    >
                        <div style={{ width: 600, height: 400 }} data-testid="grid-wrapper-1a">
                            <AgGridReact
                                columnDefs={[{ field: 'value' }]}
                                rowData={[{ value: 'branch1-grid1' }]}
                                onGridReady={(params: GridReadyEvent) => {
                                    ready1Resolve(params.api);
                                }}
                            />
                        </div>
                        <div style={{ width: 600, height: 400 }} data-testid="grid-wrapper-1b">
                            <AgGridReact
                                columnDefs={[{ field: 'value' }]}
                                rowData={[{ value: 'branch1-grid2' }]}
                                onGridReady={(params: GridReadyEvent) => {
                                    ready2Resolve(params.api);
                                }}
                            />
                        </div>
                    </AgGridContext.Provider>

                    {/* Branch 2 with different context */}
                    <AgGridContext.Provider
                        value={{ modules: [ClientSideRowModelModule, ValidationModule, TooltipModule] as any }}
                    >
                        <div style={{ width: 600, height: 400 }} data-testid="grid-wrapper-2">
                            <AgGridReact
                                columnDefs={[{ field: 'value' }]}
                                rowData={[{ value: 'branch2' }]}
                                onGridReady={(params: GridReadyEvent) => {
                                    ready3Resolve(params.api);
                                }}
                            />
                        </div>
                    </AgGridContext.Provider>
                </div>
            );

            const [api1a, api1b, api2] = await Promise.all([ready1Promise, ready2Promise, ready3Promise]);

            // Both grids in Branch 1 should have the same modules
            expect(api1a.isModuleRegistered('PaginationModule')).toBe(true);
            expect(api1b.isModuleRegistered('PaginationModule')).toBe(true);
            expect(api1a.isModuleRegistered('TooltipModule')).toBe(false);
            expect(api1b.isModuleRegistered('TooltipModule')).toBe(false);

            // Grid in Branch 2 should have different modules
            expect(api2.isModuleRegistered('TooltipModule')).toBe(true);
            expect(api2.isModuleRegistered('PaginationModule')).toBe(false);
        });

        test('both branches inherit globally registered modules from ModuleRegistry', async () => {
            // Register modules globally - both branches should inherit these
            ModuleRegistry.registerModules([ClientSideRowModelModule, ValidationModule, CsvExportModule]);

            const { api1, api2 } = await renderTwoGridsWithSeparateContexts(
                [PaginationModule], // Branch 1: adds pagination
                [TooltipModule] // Branch 2: adds tooltip
            );

            // Both branches should have the globally registered modules
            expect(api1.isModuleRegistered('ClientSideRowModelModule')).toBe(true);
            expect(api2.isModuleRegistered('ClientSideRowModelModule')).toBe(true);
            expect(api1.isModuleRegistered('CsvExportModule')).toBe(true);
            expect(api2.isModuleRegistered('CsvExportModule')).toBe(true);

            // Branch 1 should have its context-specific module
            expect(api1.isModuleRegistered('PaginationModule')).toBe(true);
            expect(api1.isModuleRegistered('TooltipModule')).toBe(false);

            // Branch 2 should have its context-specific module
            expect(api2.isModuleRegistered('TooltipModule')).toBe(true);
            expect(api2.isModuleRegistered('PaginationModule')).toBe(false);
        });

        test('sibling branches with props modules combined with different context modules', async () => {
            let ready1Resolve!: (api: GridApi) => void;
            let ready2Resolve!: (api: GridApi) => void;
            const ready1Promise = new Promise<GridApi>((resolve) => {
                ready1Resolve = resolve;
            });
            const ready2Promise = new Promise<GridApi>((resolve) => {
                ready2Resolve = resolve;
            });

            render(
                <div>
                    {/* Branch 1: context provides Pagination, props provide CsvExport */}
                    <AgGridContext.Provider
                        value={{ modules: [ClientSideRowModelModule, ValidationModule, PaginationModule] as any }}
                    >
                        <div style={{ width: 600, height: 400 }} data-testid="grid-wrapper-1">
                            <AgGridReact
                                columnDefs={[{ field: 'value' }]}
                                rowData={[{ value: 'branch1' }]}
                                modules={[CsvExportModule]}
                                onGridReady={(params: GridReadyEvent) => {
                                    ready1Resolve(params.api);
                                }}
                            />
                        </div>
                    </AgGridContext.Provider>

                    {/* Branch 2: context provides Tooltip, props provide CsvExport */}
                    <AgGridContext.Provider
                        value={{ modules: [ClientSideRowModelModule, ValidationModule, TooltipModule] as any }}
                    >
                        <div style={{ width: 600, height: 400 }} data-testid="grid-wrapper-2">
                            <AgGridReact
                                columnDefs={[{ field: 'value' }]}
                                rowData={[{ value: 'branch2' }]}
                                modules={[CsvExportModule]}
                                onGridReady={(params: GridReadyEvent) => {
                                    ready2Resolve(params.api);
                                }}
                            />
                        </div>
                    </AgGridContext.Provider>
                </div>
            );

            const [api1, api2] = await Promise.all([ready1Promise, ready2Promise]);

            // Both branches should have CsvExport from props
            expect(api1.isModuleRegistered('CsvExportModule')).toBe(true);
            expect(api2.isModuleRegistered('CsvExportModule')).toBe(true);

            // Branch 1 should have Pagination from context but not Tooltip
            expect(api1.isModuleRegistered('PaginationModule')).toBe(true);
            expect(api1.isModuleRegistered('TooltipModule')).toBe(false);

            // Branch 2 should have Tooltip from context but not Pagination
            expect(api2.isModuleRegistered('TooltipModule')).toBe(true);
            expect(api2.isModuleRegistered('PaginationModule')).toBe(false);
        });
    });
});
