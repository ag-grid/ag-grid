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

// Register modules globally at file level - this ensures consistent state for all tests in this file
ModuleRegistry.registerModules([ClientSideRowModelModule, ValidationModule]);

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

describe('ModuleRegistry.registerModules() + AgGridContext compatibility', () => {
    beforeEach(() => {
        cleanup();
    });

    test('grid receives modules from both ModuleRegistry and AgGridContext', async () => {
        const { api } = await renderGridWithModules(undefined, [PaginationModule, TooltipModule]);

        // Should have core modules from global registry
        expect(api.isModuleRegistered('ClientSideRowModelModule')).toBe(true);
        expect(api.isModuleRegistered('ValidationModule')).toBe(true);
        // Should have modules from AgGridContext
        expect(api.isModuleRegistered('PaginationModule')).toBe(true);
        expect(api.isModuleRegistered('TooltipModule')).toBe(true);
    });

    test('grid receives modules from ModuleRegistry, props, and AgGridContext', async () => {
        const { api } = await renderGridWithModules(
            [PaginationModule], // from props
            [TooltipModule, CsvExportModule] // from context
        );

        // Should have functionality from all three sources
        expect(api.isModuleRegistered('ClientSideRowModelModule')).toBe(true); // global
        expect(api.isModuleRegistered('ValidationModule')).toBe(true); // global
        expect(api.isModuleRegistered('PaginationModule')).toBe(true); // props
        expect(api.isModuleRegistered('TooltipModule')).toBe(true); // context
        expect(api.isModuleRegistered('CsvExportModule')).toBe(true); // context
    });

    test('both branches inherit globally registered modules from ModuleRegistry', async () => {
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
                <AgGridContext.Provider value={{ modules: [PaginationModule] as any }}>
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
                <AgGridContext.Provider value={{ modules: [TooltipModule] as any }}>
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

        // Both branches should have the globally registered modules
        expect(api1.isModuleRegistered('ClientSideRowModelModule')).toBe(true);
        expect(api2.isModuleRegistered('ClientSideRowModelModule')).toBe(true);
        expect(api1.isModuleRegistered('ValidationModule')).toBe(true);
        expect(api2.isModuleRegistered('ValidationModule')).toBe(true);

        // Branch 1 should have its context-specific module (PaginationModule)
        expect(api1.isModuleRegistered('PaginationModule')).toBe(true);

        // Branch 2 should have its context-specific module (TooltipModule)
        expect(api2.isModuleRegistered('TooltipModule')).toBe(true);

        // Branch 1 should NOT have TooltipModule (only in Branch 2's context)
        expect(api1.isModuleRegistered('TooltipModule')).toBe(false);

        // Branch 2 should NOT have PaginationModule (only in Branch 1's context)
        expect(api2.isModuleRegistered('PaginationModule')).toBe(false);
    });

    test('globally registered modules are available even with empty context', async () => {
        const { api } = await renderGridWithModules(undefined, []);

        // Should have core modules from global registry even with empty context
        expect(api.isModuleRegistered('ClientSideRowModelModule')).toBe(true);
        expect(api.isModuleRegistered('ValidationModule')).toBe(true);
    });

    test('globally registered modules are available without any context', async () => {
        const { api } = await renderGridWithModules(undefined, undefined);

        // Should have core modules from global registry
        expect(api.isModuleRegistered('ClientSideRowModelModule')).toBe(true);
        expect(api.isModuleRegistered('ValidationModule')).toBe(true);
    });
});
