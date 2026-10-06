import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import type { ColDef, ColGroupDef, GridApi, GridReadyEvent, HeaderValueGetterParams } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

/**
 * The column header name refresh lives in the shared `headerCellCtrl`, driven by the grid-level
 * `columnHeaderNameChanged` event, but React re-implements the header view (`reactUi/header/headerCellComp.tsx`),
 * so a vanilla behavioural test does not exercise it. This guards that column and group renames refresh the
 * headers under React reconciliation. Group headers refresh from `headerGroupCellCtrl`, likewise shared.
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
    function renderGroupGrid(groupDef: ColGroupDef): () => GridApi {
        let gridApi: GridApi | undefined;
        render(
            <AgGridReact
                columnDefs={[groupDef]}
                rowData={rowData}
                onGridReady={(e: GridReadyEvent) => {
                    gridApi = e.api;
                }}
            />
        );
        return () => gridApi!;
    }

    const groupHeaderText = () => document.querySelector('.ag-header-group-cell .ag-header-group-text')?.textContent;

    test('renaming a column group refreshes the React group header', async () => {
        const getApi = renderGroupGrid({ groupId: 'athleteGroup', headerName: 'Group', children: columnDefs });
        await waitFor(() => expect(groupHeaderText()).toBe('Group'));

        act(() => {
            getApi().setState({
                columnGroup: {
                    openColumnGroupIds: [],
                    headerNames: [{ groupId: 'athleteGroup', headerName: 'Competitors' }],
                },
            });
        });

        await waitFor(() => expect(groupHeaderText()).toBe('Competitors'));
    });

    test('renaming a child column refreshes a React group header built from its name', async () => {
        const getApi = renderGroupGrid({
            groupId: 'athleteGroup',
            headerValueGetter: (params: HeaderValueGetterParams) =>
                `${params.api.getDisplayNameForColumn(params.api.getColumn('athlete')!, 'header')} Group`,
            children: columnDefs,
        });
        await waitFor(() => expect(groupHeaderText()).toBe('Athlete Group'));

        act(() => {
            getApi().applyColumnState({ state: [{ colId: 'athlete', headerName: 'Competitor' }] });
        });

        await waitFor(() => expect(groupHeaderText()).toBe('Competitor Group'));
    });
});
