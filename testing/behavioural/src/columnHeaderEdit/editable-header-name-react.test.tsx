import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

/**
 * The column header name refresh lives in the shared `headerCellCtrl`, driven by the grid-level
 * `columnHeaderNameChanged` event, but React re-implements the header view (`reactUi/header/headerCellComp.tsx`),
 * so a vanilla behavioural test does not exercise it. This guards that a column rename refreshes the
 * header under React reconciliation.
 */
describe('editable column header name (react)', () => {
    const columnDefs: ColDef[] = [{ field: 'athlete', headerNameEditable: true }];
    const rowData = [{ athlete: 'Michael Phelps' }];

    beforeAll(() => {
        ModuleRegistry.registerModules([AllEnterpriseModule]);
    });

    beforeEach(() => {
        cleanup();
    });

    test('renaming a column refreshes the React column header', async () => {
        let gridApi: GridApi | undefined;
        render(
            <AgGridReact
                columnDefs={columnDefs}
                rowData={rowData}
                onGridReady={(e: GridReadyEvent) => {
                    gridApi = e.api;
                }}
            />
        );

        const headerText = () => document.querySelector('.ag-header-cell-text')?.textContent;
        await waitFor(() => expect(headerText()).toBe('Athlete'));

        act(() => {
            gridApi!.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Competitor' }] });
        });

        await waitFor(() => expect(headerText()).toBe('Competitor'));
    });
});
