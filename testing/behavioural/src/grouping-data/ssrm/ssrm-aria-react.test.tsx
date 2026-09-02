import { cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import { ModuleRegistry, ValidationModule } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

/**
 * React coverage. The `gridcell` role is carried by the full-width anchor, which is re-implemented in
 * `reactUi/rows/rowComp.tsx`, so a green vanilla suite does not prove the loading row renders a cell
 * child under React.
 */
describe('SSRM full-width loading row ARIA (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ServerSideRowModelModule, ValidationModule]);
    });

    afterEach(() => {
        cleanup();
    });

    test('the loading row exposes a cell child', async () => {
        render(
            <AgGridReact
                columnDefs={[{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }]}
                rowModelType="serverSide"
                // Never resolved: keeps the root-level loading row on screen.
                serverSideDatasource={{ getRows: () => {} }}
            />
        );

        await waitFor(() => {
            const loadingRow = document.querySelector<HTMLElement>('.ag-row-loading');
            expect(loadingRow).not.toBeNull();
            expect(loadingRow!.querySelector('[role="gridcell"]')).not.toBeNull();
        });
    });

    test('the loading row exposes a cell child with a custom React loading renderer', async () => {
        render(
            <AgGridReact
                columnDefs={[{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }]}
                rowModelType="serverSide"
                serverSideDatasource={{ getRows: () => {} }}
                loadingCellRenderer={() => <span>custom loading</span>}
            />
        );

        await waitFor(() => {
            const loadingRow = document.querySelector<HTMLElement>('.ag-row-loading');
            expect(loadingRow).not.toBeNull();
            expect(loadingRow!.textContent).toBe('custom loading');
            expect(loadingRow!.querySelector('[role="gridcell"]')).not.toBeNull();
        });
    });
});
