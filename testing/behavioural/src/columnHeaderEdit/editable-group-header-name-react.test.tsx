import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import type { ColDef, ColGroupDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

/**
 * The group header name refresh lives in the shared `headerGroupCellCtrl`, but React re-implements the
 * header group view (`reactUi/header/headerGroupCellComp.tsx`), so a vanilla behavioural test does not
 * exercise it. This guards that a group rename refreshes the header under React reconciliation.
 */
describe('editable group header name (react)', () => {
    const columnDefs: (ColDef | ColGroupDef)[] = [
        {
            groupId: 'athleteGroup',
            headerName: 'Group',
            headerNameEditable: true,
            children: [{ field: 'athlete' }, { field: 'age' }],
        },
    ];
    const rowData = [{ athlete: 'Michael Phelps', age: 23 }];

    beforeAll(() => {
        ModuleRegistry.registerModules([AllEnterpriseModule]);
    });

    beforeEach(() => {
        cleanup();
    });

    test('renaming a column group refreshes the React group header', async () => {
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

        const groupText = () => document.querySelector('.ag-header-group-text')?.textContent;
        await waitFor(() => expect(groupText()).toBe('Group'));

        act(() => {
            gridApi!.setState({
                columnGroup: {
                    openColumnGroupIds: [],
                    headerNames: [{ groupId: 'athleteGroup', headerName: 'Renamed' }],
                },
            });
        });

        await waitFor(() => expect(groupText()).toBe('Renamed'));
    });
});
