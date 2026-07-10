import React, { StrictMode, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule, enableDevValidations } from 'ag-grid-community';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import './styles.css';

// Opt into dev-only validation diagnostics, surfaced in an overlay over each grid.
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

const modules = [ClientSideRowModelModule, ClientSideRowModelApiModule];

const GridExample = () => {
    const gridA = useRef<AgGridReact>(null);
    const gridB = useRef<AgGridReact>(null);

    const columnDefs = useMemo<ColDef[]>(() => [{ field: 'make' }, { field: 'model' }, { field: 'price' }], []);
    const rowData = useMemo(
        () => [
            { id: 'tesla', make: 'Tesla', model: 'Model Y', price: 64950 },
            { id: 'ford', make: 'Ford', model: 'F-Series', price: 33850 },
            { id: 'toyota', make: 'Toyota', model: 'Corolla', price: 29600 },
        ],
        []
    );
    const getRowId = useMemo(() => (params: { data: { id: string } }) => params.data.id, []);

    const apiFor = (grid: 'a' | 'b') => (grid === 'a' ? gridA : gridB).current!.api;

    // Updating an initial-only option after creation emits warning #22 on the targeted grid.
    const triggerWarning = (grid: 'a' | 'b') => apiFor(grid).setGridOption('tooltipInteraction', true);

    // `getServerSideGroupLevelState` needs the unregistered enterprise server-side module, so calling it
    // on a client-side grid emits error #200, attributed to that grid, and no-ops without affecting layout.
    const triggerError = (grid: 'a' | 'b') => apiFor(grid).getServerSideGroupLevelState();

    // An async transaction is flushed by the grid on a later frame, so the non-string row-id warning
    // (#25) it produces is emitted from the grid's own async work rather than a synchronous call. It
    // self-attributes through the grid's log bean, so it stays on the grid that ran the transaction.
    const triggerAsyncWarning = (grid: 'a' | 'b') =>
        apiFor(grid).applyTransactionAsync({ add: [{ id: 4, make: 'Rivian', model: 'R1T', price: 73000 }] });

    // Calling the API of a destroyed grid emits warning #26. There is no grid left to own the
    // diagnostic, so it can't be attributed and instead surfaces on the other, still-live grid.
    const destroyThenCallApi = (grid: 'a' | 'b') => {
        const api = apiFor(grid);
        api.destroy();
        api.exportDataAsExcel();
    };

    return (
        <AgGridProvider modules={modules}>
            <div className="example-wrapper">
                <div className="grid-section">
                    <div className="controls">
                        <span className="grid-label">Grid A</span>
                        <button type="button" onClick={() => triggerWarning('a')}>
                            Trigger warning
                        </button>
                        <button type="button" onClick={() => triggerError('a')}>
                            Trigger error
                        </button>
                        <button type="button" onClick={() => triggerAsyncWarning('a')}>
                            Trigger async warning
                        </button>
                        <button type="button" onClick={() => destroyThenCallApi('a')}>
                            Destroy grid, then call API
                        </button>
                    </div>
                    <div className="grid">
                        <AgGridReact ref={gridA} columnDefs={columnDefs} rowData={rowData} getRowId={getRowId} />
                    </div>
                </div>

                <div className="grid-section">
                    <div className="controls">
                        <span className="grid-label">Grid B</span>
                        <button type="button" onClick={() => triggerWarning('b')}>
                            Trigger warning
                        </button>
                        <button type="button" onClick={() => triggerError('b')}>
                            Trigger error
                        </button>
                        <button type="button" onClick={() => triggerAsyncWarning('b')}>
                            Trigger async warning
                        </button>
                    </div>
                    <div className="grid">
                        <AgGridReact ref={gridB} columnDefs={columnDefs} rowData={rowData} getRowId={getRowId} />
                    </div>
                </div>
            </div>
        </AgGridProvider>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
