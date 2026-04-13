import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

import type { GridReadyEvent } from 'ag-grid-community';
import { ClientSideRowModelModule, ValidationModule, _reportMissingModule } from 'ag-grid-community';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

describe('[React] AG-17057 - Missing module error uses React import guide', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        cleanup();
        _reportMissingModule._flushedKeys.clear();
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        cleanup();
        consoleErrorSpy.mockRestore();
    });

    test('shows AgGridProvider syntax when AgGridProvider is in use', async () => {
        let readyResolve!: () => void;
        const readyPromise = new Promise<void>((resolve) => {
            readyResolve = resolve;
        });

        render(
            <AgGridProvider modules={[ClientSideRowModelModule, ValidationModule]}>
                <div style={{ width: 600, height: 400 }}>
                    <AgGridReact
                        columnDefs={[{ field: 'value' }]}
                        rowData={[{ value: 'a' }]}
                        rowSelection={{ mode: 'multiRow' }}
                        onGridReady={(_params: GridReadyEvent) => readyResolve()}
                    />
                </div>
            </AgGridProvider>
        );

        await readyPromise;
        // Missing module errors are debounced (100ms) and flushed as a single message
        await new Promise<void>((resolve) => setTimeout(resolve, 150));

        const allErrorArgs = consoleErrorSpy.mock.calls.flat().join(' ');

        // Should contain the missing module name
        expect(allErrorArgs).toContain('RowSelectionModule');

        // Should use AgGridProvider syntax
        expect(allErrorArgs).toContain("import { AgGridProvider, AgGridReact } from 'ag-grid-react'");
        expect(allErrorArgs).toContain('<AgGridProvider modules={modules}>');

        // Should NOT use global ModuleRegistry syntax
        expect(allErrorArgs).not.toContain('ModuleRegistry.registerModules');
    });

    test('aggregates multiple missing modules into one message with correct sources', async () => {
        let readyResolve!: () => void;
        const readyPromise = new Promise<void>((resolve) => {
            readyResolve = resolve;
        });

        render(
            <AgGridProvider modules={[ClientSideRowModelModule, ValidationModule]}>
                <div style={{ width: 600, height: 400 }}>
                    <AgGridReact
                        columnDefs={[{ field: 'value' }]}
                        rowData={[{ value: 'a' }]}
                        rowSelection={{ mode: 'multiRow' }}
                        cellSelection={true}
                        onGridReady={(_params: GridReadyEvent) => readyResolve()}
                    />
                </div>
            </AgGridProvider>
        );

        await readyPromise;
        // Missing module errors are debounced (100ms) and flushed as a single message
        await new Promise<void>((resolve) => setTimeout(resolve, 150));

        const allErrorArgs = consoleErrorSpy.mock.calls.flat().join(' ');

        // Should contain both missing module names
        expect(allErrorArgs).toContain('RowSelectionModule');
        expect(allErrorArgs).toContain('CellSelectionModule');

        // Should show community import for RowSelection and enterprise import for CellSelection
        expect(allErrorArgs).toContain("import { RowSelectionModule } from 'ag-grid-community'");
        expect(allErrorArgs).toContain("import { CellSelectionModule } from 'ag-grid-enterprise'");

        // Both modules should appear in the same modules list
        expect(allErrorArgs).toContain('RowSelectionModule, CellSelectionModule');

        // Should use AgGridProvider syntax (single combined message)
        expect(allErrorArgs).toContain("import { AgGridProvider, AgGridReact } from 'ag-grid-react'");

        // The import guide should only appear once (aggregated, not repeated)
        const agGridProviderImportCount =
            allErrorArgs.split("import { AgGridProvider, AgGridReact } from 'ag-grid-react'").length - 1;
        expect(agGridProviderImportCount).toBe(1);
    });

    test('shows ModuleRegistry syntax when AgGridProvider is not in use', async () => {
        let readyResolve!: () => void;
        const readyPromise = new Promise<void>((resolve) => {
            readyResolve = resolve;
        });

        render(
            <div style={{ width: 600, height: 400 }}>
                <AgGridReact
                    columnDefs={[{ field: 'value' }]}
                    rowData={[{ value: 'a' }]}
                    modules={[ClientSideRowModelModule, ValidationModule]}
                    rowSelection={{ mode: 'multiRow' }}
                    onGridReady={(_params: GridReadyEvent) => readyResolve()}
                />
            </div>
        );

        await readyPromise;
        // Missing module errors are debounced (100ms) and flushed as a single message
        await new Promise<void>((resolve) => setTimeout(resolve, 150));

        const allErrorArgs = consoleErrorSpy.mock.calls.flat().join(' ');

        // Should still use the standard ModuleRegistry syntax
        expect(allErrorArgs).toContain('ModuleRegistry.registerModules');
        expect(allErrorArgs).not.toContain("import { AgGridProvider, AgGridReact } from 'ag-grid-react'");
    });
});
