import { waitFor } from '@testing-library/dom';
import { cleanup, render } from '@testing-library/react';
import React from 'react';

import { ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

/**
 * Issue: `onGridPreDestroyed` is not called when the grid is destroyed before `gridReady` has fired (for example
 * the first mount of a React StrictMode double mount). The grid queues every event raised before `gridReady`
 * and only flushes the queue when `gridReady` fires, so a `gridPreDestroyed` raised during destruction is dropped.
 *
 * Setup: `<AgGridReact onGridPreDestroyed={fn} />` is mounted and unmounted straight away, before `gridReady`,
 * both plainly and inside `<React.StrictMode>`.
 * Control tests show the handler does fire when unmounted after `gridReady`, as a prop or via `gridOptions`, so
 * the problem is the timing of the destroy, not how the handler is registered.
 *
 * Expected: the Grid Lifecycle docs describe `gridPreDestroyed` as firing just before the grid is destroyed,
 * with no condition on `gridReady` having fired, so the handler should be called once.
 *
 * Actual: the handler is called 0 times.
 *
 * Reported on: AG Grid React 36.0.0.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665).
 * One search in September 2026 (React 36.0.0): "React onGridPreDestroyed must be registered via gridOptions v36".
 */
describe('React onGridPreDestroyed', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule]);
    });

    afterEach(() => {
        cleanup();
    });

    const columnDefs: ColDef<{ a: number }>[] = [{ field: 'a' }];
    const rowData = [{ a: 1 }];

    test('control: handler registered via gridOptions fires on unmount', async () => {
        const onGridPreDestroyed = vitest.fn();
        const onGridReady = vitest.fn();
        const { unmount } = render(
            <div style={{ height: 300, width: 400 }}>
                <AgGridReact
                    columnDefs={columnDefs}
                    rowData={rowData}
                    gridOptions={{ onGridPreDestroyed }}
                    onGridReady={onGridReady}
                />
            </div>
        );
        await waitFor(() => expect(onGridReady).toHaveBeenCalledTimes(1));
        unmount();
        await waitFor(() => expect(onGridPreDestroyed).toHaveBeenCalledTimes(1));
    });

    test('handler passed as a prop fires on unmount after gridReady', async () => {
        const onGridPreDestroyed = vitest.fn();
        const onGridReady = vitest.fn();
        const { unmount } = render(
            <div style={{ height: 300, width: 400 }}>
                <AgGridReact
                    columnDefs={columnDefs}
                    rowData={rowData}
                    onGridReady={onGridReady}
                    onGridPreDestroyed={onGridPreDestroyed}
                />
            </div>
        );
        await waitFor(() => expect(onGridReady).toHaveBeenCalledTimes(1));
        unmount();
        await waitFor(() => expect(onGridPreDestroyed).toHaveBeenCalledTimes(1));
    });

    test('handler fires when the grid is destroyed before gridReady', async () => {
        const onGridPreDestroyed = vitest.fn();
        const { unmount } = render(
            <div style={{ height: 300, width: 400 }}>
                <AgGridReact columnDefs={columnDefs} rowData={rowData} onGridPreDestroyed={onGridPreDestroyed} />
            </div>
        );
        unmount();
        await waitFor(() => expect(onGridPreDestroyed).toHaveBeenCalledTimes(1));
    });

    test('handler fires when the grid is destroyed before gridReady in StrictMode', async () => {
        const onGridPreDestroyed = vitest.fn();
        const { unmount } = render(
            <React.StrictMode>
                <div style={{ height: 300, width: 400 }}>
                    <AgGridReact columnDefs={columnDefs} rowData={rowData} onGridPreDestroyed={onGridPreDestroyed} />
                </div>
            </React.StrictMode>
        );
        unmount();
        await waitFor(() => expect(onGridPreDestroyed).toHaveBeenCalledTimes(1));
    });
});
