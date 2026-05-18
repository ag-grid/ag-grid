import { act, cleanup, render } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

import type { GridApi, GridReadyEvent, Module } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CsvExportModule,
    PaginationModule,
    TooltipModule,
    ValidationModule,
} from 'ag-grid-community';
import { ClipboardModule } from 'ag-grid-enterprise';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

async function renderGridWithModules(
    propsModules: Module[] | undefined,
    providerModules: Module[] | undefined
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
        providerModules !== undefined ? (
            <AgGridProvider modules={providerModules}>{gridElement}</AgGridProvider>
        ) : (
            gridElement
        )
    );

    let api!: GridApi;
    await act(async () => {
        api = await readyPromise;
    });
    return { api };
}

describe('Module Registration compatible with React context', () => {
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

    describe('Nested AgGridProvider', () => {
        async function renderNestedProviderGrid(
            outerModules: Module[],
            innerModules: Module[],
            propsModules?: Module[]
        ): Promise<{ api: GridApi }> {
            let readyResolve!: (api: GridApi) => void;
            const readyPromise = new Promise<GridApi>((resolve) => {
                readyResolve = resolve;
            });

            render(
                <AgGridProvider modules={outerModules}>
                    <AgGridProvider modules={innerModules}>
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
                    </AgGridProvider>
                </AgGridProvider>
            );

            const api = await readyPromise;
            return { api };
        }

        test('inner AgGridProvider inherits and merges modules from outer AgGridProvider', async () => {
            // Inner provider merges with outer provider modules
            const { api } = await renderNestedProviderGrid(
                [ClientSideRowModelModule, ValidationModule, CsvExportModule], // outer - has CsvExport
                [TooltipModule] // inner - adds Tooltip
            );

            // Inner context modules should be registered
            expect(api.isModuleRegistered('TooltipModule')).toBe(true);
            expect(api.isModuleRegistered('ClientSideRowModelModule')).toBe(true);
            // CsvExport from outer context SHOULD be registered (merged)
            expect(api.isModuleRegistered('CsvExportModule')).toBe(true);
        });

        test('inner AgGridProvider adds pagination to outer modules', async () => {
            const { api } = await renderNestedProviderGrid(
                [ClientSideRowModelModule, ValidationModule, TooltipModule], // outer - has tooltip
                [PaginationModule] // inner - adds pagination
            );

            // Should have pagination from inner provider
            expect(api.isModuleRegistered('PaginationModule')).toBe(true);
            // Tooltip from outer provider SHOULD be registered (merged)
            expect(api.isModuleRegistered('TooltipModule')).toBe(true);
        });

        test('props modules combined with merged provider modules', async () => {
            const { api } = await renderNestedProviderGrid(
                [ClientSideRowModelModule, ValidationModule, CsvExportModule], // outer - core + CsvExport
                [TooltipModule], // inner - adds tooltip
                [PaginationModule] // props - pagination
            );

            // Props modules should be registered
            expect(api.isModuleRegistered('PaginationModule')).toBe(true);
            // Inner provider modules should be registered
            expect(api.isModuleRegistered('TooltipModule')).toBe(true);
            // Outer provider modules SHOULD be registered (merged)
            expect(api.isModuleRegistered('CsvExportModule')).toBe(true);
        });

        test('deeply nested AgGridProviders merge all modules', async () => {
            let readyResolve!: (api: GridApi) => void;
            const readyPromise = new Promise<GridApi>((resolve) => {
                readyResolve = resolve;
            });

            render(
                <AgGridProvider modules={[ClientSideRowModelModule, ValidationModule]}>
                    <AgGridProvider modules={[PaginationModule]}>
                        <AgGridProvider modules={[TooltipModule]}>
                            <div style={{ width: 600, height: 400 }} data-testid="grid-wrapper">
                                <AgGridReact
                                    columnDefs={[{ field: 'value' }]}
                                    rowData={[{ value: 'a' }]}
                                    modules={[CsvExportModule]}
                                    onGridReady={(params: GridReadyEvent) => {
                                        readyResolve(params.api);
                                    }}
                                />
                            </div>
                        </AgGridProvider>
                    </AgGridProvider>
                </AgGridProvider>
            );

            const api = await readyPromise;

            // All modules from all levels should be merged
            expect(api.isModuleRegistered('ClientSideRowModelModule')).toBe(true);
            expect(api.isModuleRegistered('ValidationModule')).toBe(true);
            expect(api.isModuleRegistered('PaginationModule')).toBe(true);
            expect(api.isModuleRegistered('TooltipModule')).toBe(true);
            expect(api.isModuleRegistered('CsvExportModule')).toBe(true);
        });
    });

    describe('Separate component branches with different AgGridProvider', () => {
        async function renderTwoGridsWithSeparateProviders(
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
                    {/* Branch 1 with its own AgGridProvider */}
                    <AgGridProvider modules={branch1Modules}>
                        <div style={{ width: 600, height: 400 }} data-testid="grid-wrapper-1">
                            <AgGridReact
                                columnDefs={[{ field: 'value' }]}
                                rowData={[{ value: 'branch1' }]}
                                onGridReady={(params: GridReadyEvent) => {
                                    ready1Resolve(params.api);
                                }}
                            />
                        </div>
                    </AgGridProvider>

                    {/* Branch 2 with its own AgGridProvider */}
                    <AgGridProvider modules={branch2Modules}>
                        <div style={{ width: 600, height: 400 }} data-testid="grid-wrapper-2">
                            <AgGridReact
                                columnDefs={[{ field: 'value' }]}
                                rowData={[{ value: 'branch2' }]}
                                onGridReady={(params: GridReadyEvent) => {
                                    ready2Resolve(params.api);
                                }}
                            />
                        </div>
                    </AgGridProvider>
                </div>
            );

            const [api1, api2] = await Promise.all([ready1Promise, ready2Promise]);
            return { api1, api2 };
        }

        test('two sibling branches can use completely different modules', async () => {
            const { api1, api2 } = await renderTwoGridsWithSeparateProviders(
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
            const { api1, api2 } = await renderTwoGridsWithSeparateProviders(
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
            const { api1, api2 } = await renderTwoGridsWithSeparateProviders(
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

        test('multiple grids in same provider share modules while different providers are isolated', async () => {
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
                    {/* Branch 1 with two grids sharing the same provider */}
                    <AgGridProvider modules={[ClientSideRowModelModule, ValidationModule, PaginationModule]}>
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
                    </AgGridProvider>

                    {/* Branch 2 with different provider */}
                    <AgGridProvider modules={[ClientSideRowModelModule, ValidationModule, TooltipModule]}>
                        <div style={{ width: 600, height: 400 }} data-testid="grid-wrapper-2">
                            <AgGridReact
                                columnDefs={[{ field: 'value' }]}
                                rowData={[{ value: 'branch2' }]}
                                onGridReady={(params: GridReadyEvent) => {
                                    ready3Resolve(params.api);
                                }}
                            />
                        </div>
                    </AgGridProvider>
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

        test('sibling branches with props modules combined with different provider modules', async () => {
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
                    {/* Branch 1: provider provides Pagination, props provide CsvExport */}
                    <AgGridProvider modules={[ClientSideRowModelModule, ValidationModule, PaginationModule]}>
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
                    </AgGridProvider>

                    {/* Branch 2: provider provides Tooltip, props provide CsvExport */}
                    <AgGridProvider modules={[ClientSideRowModelModule, ValidationModule, TooltipModule]}>
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
                    </AgGridProvider>
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

    describe('License key from AgGridProvider', () => {
        test('license key provided without enterprise module produces no console errors', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            let readyResolve!: (api: GridApi) => void;
            const readyPromise = new Promise<GridApi>((resolve) => {
                readyResolve = resolve;
            });

            render(
                <AgGridProvider modules={[ClientSideRowModelModule, ValidationModule]} licenseKey="some-license-key">
                    <div style={{ width: 600, height: 400 }} data-testid="grid-wrapper">
                        <AgGridReact
                            columnDefs={[{ field: 'value' }]}
                            rowData={[{ value: 'a' }]}
                            onGridReady={(params: GridReadyEvent) => {
                                readyResolve(params.api);
                            }}
                        />
                    </div>
                </AgGridProvider>
            );

            await act(async () => {
                await readyPromise;
            });

            // No enterprise module means no AG Grid enterprise license errors.
            // Ignore React act() warnings that are unrelated to license validation.
            const nonActErrorCalls = consoleErrorSpy.mock.calls.filter(
                ([message]) => !(typeof message === 'string' && message.includes('not wrapped in act'))
            );
            expect(nonActErrorCalls).toHaveLength(0);

            consoleErrorSpy.mockRestore();
        });

        test('enterprise module provided without license key produces console error', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            let readyResolve!: (api: GridApi) => void;
            const readyPromise = new Promise<GridApi>((resolve) => {
                readyResolve = resolve;
            });

            render(
                <AgGridProvider
                    modules={[ClientSideRowModelModule, ValidationModule, ClipboardModule]}
                    // No license key provided
                >
                    <div style={{ width: 600, height: 400 }} data-testid="grid-wrapper">
                        <AgGridReact
                            columnDefs={[{ field: 'value' }]}
                            rowData={[{ value: 'a' }]}
                            onGridReady={(params: GridReadyEvent) => {
                                readyResolve(params.api);
                            }}
                        />
                    </div>
                </AgGridProvider>
            );

            await act(async () => {
                await readyPromise;
            });

            // Enterprise module without license key should produce console error about missing license
            expect(consoleErrorSpy).toHaveBeenCalled();
            const errorCalls = consoleErrorSpy.mock.calls.flat().join(' ');
            expect(errorCalls).toContain('AG Grid Enterprise License');
            expect(errorCalls).toContain('License Key Not Found');

            consoleErrorSpy.mockRestore();
        });

        test('enterprise module provided with license key produces console error', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            let readyResolve!: (api: GridApi) => void;
            const readyPromise = new Promise<GridApi>((resolve) => {
                readyResolve = resolve;
            });

            render(
                <AgGridProvider
                    modules={[ClientSideRowModelModule, ValidationModule, ClipboardModule]}
                    licenseKey="some-license-key"
                >
                    <div style={{ width: 600, height: 400 }} data-testid="grid-wrapper">
                        <AgGridReact
                            columnDefs={[{ field: 'value' }]}
                            rowData={[{ value: 'a' }]}
                            onGridReady={(params: GridReadyEvent) => {
                                readyResolve(params.api);
                            }}
                        />
                    </div>
                </AgGridProvider>
            );

            await act(async () => {
                await readyPromise;
            });

            // Enterprise module without license key should produce console error about missing license
            expect(consoleErrorSpy).toHaveBeenCalled();
            const errorCalls = consoleErrorSpy.mock.calls.flat().join(' ');
            expect(errorCalls).toContain('AG Grid Enterprise License');
            expect(errorCalls).toContain('Invalid License Key'); // assuming 'some-license-key' is invalid but this message shows it has been processed

            consoleErrorSpy.mockRestore();
        });

        test('nested AgGridProvider inherits license key from parent', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            let readyResolve!: (api: GridApi) => void;
            const readyPromise = new Promise<GridApi>((resolve) => {
                readyResolve = resolve;
            });

            render(
                <AgGridProvider modules={[ClientSideRowModelModule, ValidationModule]} licenseKey="some-license-key">
                    {/* Child provider adds enterprise module but doesn't specify license key */}
                    <AgGridProvider modules={[ClipboardModule]}>
                        <div style={{ width: 600, height: 400 }} data-testid="grid-wrapper">
                            <AgGridReact
                                columnDefs={[{ field: 'value' }]}
                                rowData={[{ value: 'a' }]}
                                onGridReady={(params: GridReadyEvent) => {
                                    readyResolve(params.api);
                                }}
                            />
                        </div>
                    </AgGridProvider>
                </AgGridProvider>
            );

            await readyPromise;

            // Should have inherited license key from parent, so we should see Invalid License Key (not License Key Not Found)
            expect(consoleErrorSpy).toHaveBeenCalled();
            const errorCalls = consoleErrorSpy.mock.calls.flat().join(' ');
            expect(errorCalls).toContain('AG Grid Enterprise License');
            expect(errorCalls).toContain('Invalid License Key');

            consoleErrorSpy.mockRestore();
        });
    });
});
