import { act, cleanup, findByText, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { asyncSetTimeout } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
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
        mockGridLayout.init();
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
        // `onGridReady` is dispatched asynchronously, so the header can render before the api is captured
        await waitFor(() => expect(gridApi).toBeDefined());

        act(() => {
            gridApi!.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Competitor' }] });
        });

        await waitFor(() => expect(headerText()).toBe('Competitor'));
    });
    async function renderGroupGrid(groupDef: ColGroupDef): Promise<() => GridApi> {
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
        // `onGridReady` is dispatched asynchronously, so the header can render before the api is captured
        await waitFor(() => expect(gridApi).toBeDefined());
        return () => gridApi!;
    }

    const groupHeaderText = () => document.querySelector('.ag-header-group-cell .ag-header-group-text')?.textContent;

    test('renaming a column group refreshes the React group header', async () => {
        const getApi = await renderGroupGrid({ groupId: 'athleteGroup', headerName: 'Group', children: columnDefs });
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
        const getApi = await renderGroupGrid({
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

    test('the group header edited from the tool panel or its own menu is the only one highlighted, through a rerender', async () => {
        const groupDefs: ColGroupDef[] = [
            {
                groupId: 'athleteGroup',
                headerName: 'Athlete Group',
                headerNameEditable: true,
                children: [{ field: 'athlete' }],
            },
            {
                groupId: 'ageGroup',
                headerName: 'Age Group',
                headerNameEditable: true,
                children: [{ field: 'age' }],
            },
        ];
        const sideBar = {
            toolPanels: [
                {
                    id: 'columns',
                    labelDefault: 'Columns',
                    labelKey: 'columns',
                    iconKey: 'columns',
                    toolPanel: 'agColumnsToolPanel',
                },
            ],
            defaultToolPanel: 'columns',
        };
        const grid = () => (
            <React.StrictMode>
                <AgGridReact
                    columnDefs={groupDefs}
                    rowData={[{ athlete: 'Michael Phelps', age: 23 }]}
                    defaultColDef={{ flex: 1, minWidth: 100 }}
                    sideBar={sideBar}
                />
            </React.StrictMode>
        );

        const groupHeaderCells = () => [...document.querySelectorAll('.ag-header-group-cell')];
        const groupName = (cell: Element) => cell.querySelector('.ag-header-group-text')?.textContent ?? '';
        const highlightedGroupNames = () =>
            groupHeaderCells()
                .filter((cell) => cell.classList.contains('ag-column-header-edit-highlighted'))
                .map(groupName)
                .sort();
        const waitForInput = () =>
            waitFor(() => {
                const input = document.querySelector<HTMLInputElement>('.ag-column-header-edit-popup-editor input');
                if (!input) {
                    throw new Error('Header name editor input not found');
                }
                return input;
            });
        const closeWithEscape = async (input: HTMLInputElement) => {
            act(() => {
                input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
            });
            await waitFor(() => expect(document.querySelector('.ag-column-header-edit-popup-editor')).toBeNull());
        };
        const contextMenu = (el: Element) =>
            act(() => {
                el.dispatchEvent(
                    new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 })
                );
            });
        const clickEditColumnName = async () => {
            await userEvent.click(await findByText(document.body, 'Edit Column Name'));
        };

        const view = render(grid());
        await waitFor(() => expect(groupHeaderCells().map(groupName).sort()).toEqual(['Age Group', 'Athlete Group']));
        const highlightedByStep: Record<string, string[]> = { before: highlightedGroupNames() };

        // (a) the columns tool panel entry's context menu, on the row the list rendered
        const entry = await waitFor(() => {
            const label = Array.from(
                document.querySelectorAll('.ag-column-select-list .ag-column-select-column-label')
            ).find((el) => el.textContent === 'Athlete Group');
            const row = label?.closest('.ag-virtual-list-item');
            if (!row) {
                throw new Error('Tool panel entry "Athlete Group" not rendered');
            }
            return row;
        });
        contextMenu(entry);
        await clickEditColumnName();
        const athleteInput = await waitForInput();
        await waitFor(() => expect(highlightedGroupNames()).toEqual(['Athlete Group']));
        highlightedByStep.toolPanelOpen = highlightedGroupNames();
        await closeWithEscape(athleteInput);
        await waitFor(() => expect(highlightedGroupNames()).toEqual([]));
        highlightedByStep.toolPanelClosed = highlightedGroupNames();

        // a rerender with the same props leaves nothing highlighted
        view.rerender(grid());
        await act(async () => {
            await asyncSetTimeout(0);
        });
        highlightedByStep.afterRerender = highlightedGroupNames();

        // (b) the group header cell's own context menu
        const ageCell = groupHeaderCells().find((el) => groupName(el) === 'Age Group')!;
        contextMenu(ageCell);
        await clickEditColumnName();
        const ageInput = await waitForInput();
        await waitFor(() => expect(highlightedGroupNames()).toEqual(['Age Group']));
        highlightedByStep.headerOpen = highlightedGroupNames();
        await closeWithEscape(ageInput);
        await waitFor(() => expect(highlightedGroupNames()).toEqual([]));
        highlightedByStep.headerClosed = highlightedGroupNames();

        expect(highlightedByStep).toEqual({
            before: [],
            toolPanelOpen: ['Athlete Group'],
            toolPanelClosed: [],
            afterRerender: [],
            headerOpen: ['Age Group'],
            headerClosed: [],
        });
    });
});
